#!/bin/sh
# Rebuilds the shapefile fixtures `test/shp.test.js` reads. Needs GDAL (ogr2ogr,
# gdalsrsinfo) and zip. The files are committed, so the suite needs neither.
#
#   sh test/fixtures/shapefiles/make.sh
#
# Every fixture holds the same two sites, or the two areas, written by GDAL the
# way a GIS office's tools would write them: ESRI's .prj dialect, a .cpg saying
# UTF-8.
set -eu
cd "$(dirname "$0")"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

cat > "$work/sites.geojson" <<'JSON'
{"type":"FeatureCollection","features":[
{"type":"Feature","properties":{"name":"Gazimağusa","code":7},"geometry":{"type":"Point","coordinates":[21.4394,41.9981]}},
{"type":"Feature","properties":{"name":"Two","code":8},"geometry":{"type":"Point","coordinates":[21.5,42.05]}}
]}
JSON
cat > "$work/areas.geojson" <<'JSON'
{"type":"FeatureCollection","features":[
{"type":"Feature","properties":{"name":"holed"},"geometry":{"type":"Polygon","coordinates":[[[21.3,41.9],[21.6,41.9],[21.6,42.1],[21.3,42.1],[21.3,41.9]],[[21.4,41.95],[21.4,42.0],[21.5,42.0],[21.5,41.95],[21.4,41.95]]]}},
{"type":"Feature","properties":{"name":"two parts"},"geometry":{"type":"MultiPolygon","coordinates":[[[[21.0,41.0],[21.1,41.0],[21.1,41.1],[21.0,41.1],[21.0,41.0]]],[[[21.2,41.2],[21.3,41.2],[21.3,41.3],[21.2,41.3],[21.2,41.2]]]]}}
]}
JSON

# sites in a projection, into its own folder: layer name, EPSG code.
layer() {
  mkdir -p "$work/$1"
  ogr2ogr -f 'ESRI Shapefile' -lco ENCODING=UTF-8 -t_srs "EPSG:$2" "$work/$1/sites.shp" "$work/sites.geojson"
}
pack() { rm -f "$1.zip"; (cd "$work/$1" && zip -qX "$OLDPWD/$1.zip" "$@"); }

layer wgs84 4326 && pack wgs84 sites.shp sites.shx sites.dbf sites.prj sites.cpg
# WGS 84 / UTM 34N: projected, on a datum proj4 needs no shift for.
layer utm 32634 && pack utm sites.shp sites.shx sites.dbf sites.prj sites.cpg
# ETRS89 / UTM 34N: within a metre of WGS 84.
layer etrs 25834 && pack etrs sites.shp sites.shx sites.dbf sites.prj sites.cpg
# MGI 1901 / Balkans zone 7: a datum whose .prj carries no shift to WGS 84.
layer grid 6316 && pack grid sites.shp sites.shx sites.dbf sites.prj sites.cpg
# The same grid, written with a stated shift, which is then added to the .prj
# as TOWGS84 -- ESRI's dialect has no place for one, so GDAL leaves it out.
# Written with the shift named rather than EPSG:6316, because for a point here
# PROJ picks whichever MGI 1901 transformation covers it, not this one.
mkdir -p "$work/shifted"
ogr2ogr -f 'ESRI Shapefile' -lco ENCODING=UTF-8 \
  -t_srs '+proj=tmerc +lat_0=0 +lon_0=21 +k=0.9999 +x_0=7500000 +y_0=0 +ellps=bessel +towgs84=682,-203,480,0,0,0,0 +units=m +no_defs' \
  "$work/shifted/sites.shp" "$work/sites.geojson"
sed 's/SPHEROID\["Bessel_1841",6377397.155,299.1528128\]/&,TOWGS84[682,-203,480,0,0,0,0]/' "$work/grid/sites.prj" > "$work/shifted/sites.prj"
pack shifted sites.shp sites.shx sites.dbf sites.prj sites.cpg
# No .prj: in degrees, and in the grid.
cp -r "$work/wgs84" "$work/noprj" && pack noprj sites.shp sites.shx sites.dbf sites.cpg
cp -r "$work/grid" "$work/noprjgrid" && pack noprjgrid sites.shp sites.shx sites.dbf sites.cpg
# A .prj nothing can read.
cp -r "$work/wgs84" "$work/badprj" && printf 'not a projection' > "$work/badprj/sites.prj"
pack badprj sites.shp sites.shx sites.dbf sites.prj sites.cpg
# Two layers, in folders, with the copies Finder adds to a zip it makes.
mkdir -p "$work/layers/data" "$work/layers/__MACOSX/data"
cp "$work/wgs84/sites."* "$work/layers/data/"
ogr2ogr -f 'ESRI Shapefile' -lco ENCODING=UTF-8 "$work/layers/data/areas.shp" "$work/areas.geojson"
printf 'resource fork' > "$work/layers/__MACOSX/data/._sites.shp"
pack layers data/sites.shp data/sites.shx data/sites.dbf data/sites.prj data/sites.cpg \
  data/areas.shp data/areas.shx data/areas.dbf data/areas.prj data/areas.cpg __MACOSX/data/._sites.shp
# A zip with no shapefile in it.
mkdir -p "$work/nothing" && printf 'no shapes here' > "$work/nothing/readme.txt" && pack nothing readme.txt
# A lone .shp, and a lone .dbf.
cp "$work/wgs84/sites.shp" lone.shp
cp "$work/wgs84/sites.dbf" lone.dbf
