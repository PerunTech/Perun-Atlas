(function(e,t){typeof exports==`object`&&typeof module<`u`?t(exports,require("perun-core"),require("spatial")):typeof define==`function`&&define.amd?define([`exports`,`perun-core`,`spatial`],t):(e=typeof globalThis<`u`?globalThis:e||self,t(e[`perun-atlas`]={},e[`perun-core`],e.spatial))})(this,function(e,t,n){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});var r=Object.defineProperty,i=(e,t)=>{let n={};for(var i in e)r(n,i,{get:e[i],enumerable:!0});return t||r(n,Symbol.toStringTag,{value:`Module`}),n},a=`perun-atlas`,o=`1.0.0`,s=[`DESCRIPTOR`,`pkid`,`parent_id`,`type`,`status`],c={weight:1,opacity:1,color:`#4A5C66`,fillOpacity:.55,fillColor:`#B8C6CC`},l=(e={},t={})=>({...c,...e.style,...t}),u=(e,t)=>e||t?{...e,...t}:void 0,d=(e,t)=>{let n=e?.variants;if(!n?.by)return e;let r=n.cases?.[t?.properties?.[n.by]];return r?{...e,...r,style:u(e.style,r.style),marker:u(e.marker,r.marker),label:u(e.label,r.label),popup:u(e.popup,r.popup),arrow:u(e.arrow,r.arrow)}:e},f=(e,t)=>{let n=e?.label?.scale;if(!n)return!1;let{min:r=0,max:i=24}=n;return t>=r&&t<=i},p=(e,t)=>{let n=e?.label?.field;if(!n)return null;let r=t?.properties?.[n];return r==null?null:String(r)},m=(e,t)=>{let n=e=>{let n=e?t?.properties?.[e]:void 0;return n==null||n===``?null:String(n)};return n(e?.label?.field)??n(e?.popup?.title)??n(e?.details?.title)},h=(e,t,n)=>{let r=e?.popup;if(!r)return null;let i=e=>{let n=t?.properties?.[e];return n==null||n===``?null:String(n)},a=r.title?i(r.title):null,o=(r.fields??[]).map(({label:e,field:t})=>({label:e&&n?.(e)||e||t,value:i(t)})).filter(e=>e.value!==null);return a===null&&o.length===0?null:{title:a,rows:o}},g=(e,t,n)=>{let r=e?.details;if(!r)return null;let i=t?.properties??{},a=new Set([...s,...r.exclude??[]]),o=e=>e==null||e===``?null:String(e),c=r.title?o(i[r.title]):null,l=Object.entries(i).filter(([e,t])=>!a.has(e)&&e!==r.title&&(typeof t!=`object`||!t)).map(([e,t])=>({field:e,label:n?.(e.toLowerCase())||e,value:o(t)})).filter(e=>e.value!==null);return c===null&&l.length===0?null:{title:c,rows:l,spec:r}},_=(e,t)=>{let n=e;for(let e=0;e<t.length;e+=1){if(n==null)return n;let r=t.length-e===1?t[e]:t.slice(e).join(`.`);if(Object.prototype.hasOwnProperty.call(Object(n),r))return n[r];n=n[t[e]]}return n},v=(e,t)=>_(e,String(t).split(`.`)),y=e=>{let t=String(e).split(`.`);return e=>_(e,t)},b=(e,t)=>e.replace(/\{([^}]+)\}/g,(e,n)=>{let r=v(t,n);return r==null?e:String(r)}),x=`::`,S=(e=[],t=[])=>e.length>=2||e.some(e=>t.includes(e.key)),C=(e,t)=>`${e??``}${x}${t??``}`,ee=`${x}fallback`,te=`${x}file`,w=(e,t,n)=>{let r=t?.variants?.by,i=r?n?.properties?.[r]:void 0,a=i!==void 0&&t?.variants?.cases?.[i]?i:void 0;return{name:e,value:a,key:C(e,a)}},T=({descriptors:e,nameOf:t})=>{let n=new WeakMap,r=r=>{if(n.has(r))return n.get(r);let i=d(e[t(r)],r);return n.set(r,i),i},i=n=>{let r=t(n);return w(r,e[r],n)},a=new Map;return{entryFor:r,kindOf:i,note:e=>{let{name:t,value:n,key:o}=i(e);return a.has(o)||a.set(o,{name:t,value:n,descriptor:r(e),geometry:e?.geometry?.type}),o},drawn:()=>[...a.values()]}},E=(e=``)=>/Point$/.test(e)?`point`:/LineString$/.test(e)?`line`:`area`,D=({name:e,value:t,descriptor:n},r)=>{let i=n?.legend;if(i){let e=r?.(i);if(e)return e}let a=t??e;return a==null||a===``?``:r?.(String(a).toLowerCase())||String(a)},O=(e,t)=>{let n=E(e.geometry),r=e.descriptor??{};return{key:C(e.name,e.value),label:D(e,t),kind:n,path:l(r),marker:n===`point`?r.marker??{}:null,arrow:n===`line`?r.arrow??null:null}},k=(e=[],t)=>e.map(e=>O(e,t)).filter(e=>e.label!==``),ne=({palette:e={},values:t=[],fallback:n,usedFallback:r=!1,unknownLabel:i=`unknown`}={},a)=>{let o=e=>({...c,color:e,fillColor:e,fillOpacity:.7}),s=t.filter(t=>Object.prototype.hasOwnProperty.call(Object(e),t)&&e[t]).map(t=>({key:String(t),label:a?.(String(t).toLowerCase())||String(t),kind:`area`,path:o(e[t]),marker:null,arrow:null}));return!r||!n?s:[...s,{key:ee,label:a?.(i)||`Not classified`,kind:`area`,path:o(n),marker:null,arrow:null}]},A={__unknown:`#B8C6CC`},j=(e,t)=>Object.prototype.hasOwnProperty.call(Object(e),t)&&!!e[t],M=({field:e,palette:t=A,fallback:n=A.__unknown})=>{let r=new Set,i=y(e),a=e=>i(e?.properties);return i=>{let o=a(i);return o==null?n:j(t,o)?t[o]:(r.has(o)||(r.add(o),console.warn(`perun-atlas: no palette entry for ${e}="${o}"`)),n)}},re=(e=[],{field:t,palette:n=A}={})=>{let r=y(t),i=e=>r(e?.properties),a=new Set,o=[],s=!1;return e.forEach(e=>{let t=i(e);if(t==null){s=!0;return}j(n,t)||(s=!0),!a.has(t)&&(a.add(t),o.push(t))}),{values:o,usedFallback:s}},N=({field:e,palette:t=A}={})=>{let n=y(e);return e=>{let r=n(e?.properties);return r!=null&&j(t,r)?String(r):ee}},ie=(e,t,{featureKey:n,rowKey:r,as:i=`status`})=>{let a=y(r),o=y(n),s=new Map((t??[]).map(e=>[String(a(e)),e]));return{...e,features:(e?.features??[]).map(e=>{let t=s.get(String(o(e?.properties)));return t?{...e,properties:{...e.properties,[i]:t}}:e})}},P=i({BASE_STYLE:()=>c,DEFAULT_PALETTE:()=>A,categoriesDrawn:()=>re,colourBy:()=>M,detailsFor:()=>g,joinStatus:()=>ie,labelFor:()=>p,labelVisible:()=>f,legendFrom:()=>k,legendFromPalette:()=>ne,nameFor:()=>m,pathOptions:()=>l,popupFor:()=>h,variantOf:()=>d}),F={crs:{type:`crs`,param:`SPATIAL_CRS`,legacy:`sysCrs`,required:!0,doc:`EPSG code, or { code, def } for a proj4 definition.`},center:{type:`latlng`,param:`SPATIAL_CENTER`,legacy:`sysCenter`,required:!0,doc:`Initial map centre as { lat, lng }.`},bounds:{type:`bounds`,param:`SPATIAL_BOUNDS`,legacy:`sysBounds`,doc:`Spatial limits as [ {lat,lng} southwest, {lat,lng} northeast ].`},zoom:{type:`int`,param:`SPATIAL_ZOOM`,default:8},minZoom:{type:`int`,param:`SPATIAL_MIN_ZOOM`,default:0},maxZoom:{type:`int`,param:`SPATIAL_MAX_ZOOM`,default:18},bboxOrder:{type:`bool`,param:`SPATIAL_SWITCH_BBOX_ORDER`,legacy:`switchBboxOrder`,default:!1,doc:`Reverse WMS bounding box axis order.`},units:{type:`enum`,param:`SPATIAL_MEASUREMENT_SYSTEM`,legacy:`measurementSystem`,values:[`metric`,`imperial`],default:`metric`},attribution:{type:`string`,param:`SPATIAL_ATTRIBUTION`,default:``},dataSrid:{type:`srid`,param:`sys.gis.default_srid`,default:`4326`,doc:`EPSG code the database stores geometry in, without the prefix.`}},ae=Object.keys(F).filter(e=>F[e].required),oe=i({REQUIRED:()=>ae,SCHEMA:()=>F}),se=(e,t,n)=>{throw TypeError(`perun-atlas: cannot read "${e}" as ${n} (got ${JSON.stringify(t)})`)},ce=e=>{if(typeof e!=`string`)return e;let t=e.trim();if(!t.startsWith(`{`)&&!t.startsWith(`[`))return e;try{return JSON.parse(t)}catch{return e}},le=(e,t)=>{let n=ce(t);if(n&&typeof n==`object`&&`lat`in n&&`lng`in n)return{lat:Number(n.lat),lng:Number(n.lng)};if(typeof n==`string`&&n.includes(`,`)){let[e,t]=n.split(`,`).map(Number);if(Number.isFinite(e)&&Number.isFinite(t))return{lat:e,lng:t}}return se(e,t,`a { lat, lng } pair`)},ue={string:(e,t)=>String(t),int:(e,t)=>{let n=Number(t);return Number.isInteger(n)?n:se(e,t,`an integer`)},bool:(e,t)=>{if(typeof t==`boolean`)return t;let n=String(t).trim().toLowerCase();return[`true`,`1`,`yes`].includes(n)?!0:![`false`,`0`,`no`].includes(n)&&se(e,t,`a boolean`)},enum:(e,t,n)=>n.values.includes(t)?t:se(e,t,`one of ${n.values.join(`, `)}`),latlng:le,bounds:(e,t)=>{let n=ce(t);return Array.isArray(n)&&n.length===2?[le(e,n[0]),le(e,n[1])]:se(e,t,`a [southwest, northeast] pair`)},srid:(e,t)=>{let n=String(t).trim().replace(/^EPSG:/i,``);return/^\d{4,6}$/.test(n)?n:se(e,t,`an EPSG code such as 4326`)},crs:(e,t)=>{let n=ce(t);return typeof n==`string`&&n.startsWith(`EPSG:`)||n&&typeof n==`object`&&n.code?n:se(e,t,`an EPSG code or { code, def } object`)}},de=(e,t,n)=>{let r=ue[n.type];if(!r)throw TypeError(`perun-atlas: no coercion for type "${n.type}" on "${e}"`);return r(e,t,n)},fe=async()=>{let e=Object.entries(F).filter(([,e])=>e.param),n=await Promise.all(e.map(([e,n])=>t.axios.get(`${window.server}/WsConf/params/get/sys/${n.param}`).then(t=>[e,t?.data?.VALUE]).catch(()=>[e,void 0])));return Object.fromEntries(n.filter(([,e])=>e!==void 0&&e!==``))},pe=async e=>(await t.axios.get(`${window.server}/spatial/config/${e}`))?.data?.params??{},me=()=>{let e={};return Object.entries(F).forEach(([t,n])=>{if(!n.legacy)return;let r=window[n.legacy];r!=null&&r!==``&&(e[t]=r)}),e},he=()=>Object.fromEntries(Object.entries(F).filter(([,e])=>`default`in e).map(([e,t])=>[e,t.default])),ge=(e,t,n)=>{let r=Object.keys(e).filter(e=>!(e in t)&&!(e in n));r.length&&console.warn(`perun-atlas: ${r.length} setting(s) still come from window globals — `+r.map(e=>`window.${F[e].legacy}`).join(`, `)+`. Seed `+r.map(e=>F[e].param).join(`, `)+` in SVAROG_SYS_PARAMS; this fallback is temporary.`)},_e=async(e={})=>{let t=await fe(),n=me(),r={...he(),...n,...t,...e};ge(n,t,e);let i={},a=[];Object.entries(F).forEach(([e,t])=>{let n=r[e];if(n!==void 0)try{i[e]=de(e,n,t)}catch(e){a.push(e.message)}});let o=ae.filter(e=>i[e]===void 0);if(o.length&&a.push(`missing required setting(s): `+o.map(e=>`${e} (parameter ${F[e].param})`).join(`, `)),a.length)throw Error(`perun-atlas: configuration could not be resolved.
  - `+a.join(`
  - `));return i},ve=async()=>{let[e,t,n]=[await fe(),me(),he()];return Object.fromEntries(Object.keys(F).map(r=>[r,r in e?{source:`SVAROG_SYS_PARAMS`,value:e[r]}:r in t?{source:`window.${F[r].legacy}`,value:t[r]}:r in n?{source:`schema default`,value:n[r]}:{source:`unresolved`,value:void 0}]))},ye=Object.getPrototypeOf(n.spatial);ye.assets;var be=ye.config,I=ye.core,xe=ye.data,Se=ye.tools;ye.ui,ye.proj4;var Ce=e=>Array.isArray(e)&&typeof e[0]==`number`,we=e=>{if(!e)return[];if(e.type===`GeometryCollection`)return(e.geometries??[]).flatMap(we);let t=e=>Array.isArray(e)?Ce(e)?[e]:e.flatMap(t):[];return t(e.coordinates)},Te=(e,t)=>{if(!e)return e;if(e.type===`GeometryCollection`)return{...e,geometries:(e.geometries??[]).map(e=>Te(e,t))};let n=e=>Array.isArray(e)?Ce(e)?t(e):e.map(n):e;return{...e,coordinates:n(e.coordinates)}},Ee=(e,t)=>Array.isArray(e?.features)?{...e,features:e.features.map(e=>e?.geometry?{...e,geometry:Te(e.geometry,t)}:e)}:e,{Map:De,factory:L}=I,Oe={3857:()=>L.CRS.EPSG3857,3395:()=>L.CRS.EPSG3395,4326:()=>L.CRS.EPSG4326},ke=e=>Oe[String(e)]?.()??null,Ae=new Set,R=e=>e==null?null:ke(e)||(Ae.has(String(e))||(Ae.add(String(e)),console.warn(`perun-atlas: cannot express a coordinate in EPSG:${e} — the engine builds 3857, 3395 and 4326. Using the map's own projection instead, which is correct only if this deployment stores geometry in it.`)),null),je=e=>{let t=R(e);if(!t)return De.getBBox();let n=De.getBounds(),r=t.projection.project(n.getSouthWest()),i=t.projection.project(n.getNorthEast());return`${r.x},${r.y},${i.x},${i.y}`},z=(e,t)=>{let{x:n,y:r}=(R(t)??De.getCRS()).projection.project(L.latLng(e));return{x:n,y:r}},Me=(e,t)=>{let[n,r]=Array.isArray(e)?e:[e?.x,e?.y],{lat:i,lng:a}=(R(t)??De.getCRS()).projection.unproject(L.point(n,r));return{lat:i,lng:a}},Ne=(e,t)=>Ee(e,e=>{let{lat:n,lng:r}=Me(e,t);return[r,n,...e.slice(2)]}),Pe=(e,t)=>Ee(e,e=>{let{x:n,y:r}=z({lat:e[1],lng:e[0]},t);return[n,r,...e.slice(2)]}),Fe=(e,t)=>Ie(e,t).ew,Ie=(e,t)=>{let n=.001,r=L.latLng(e),i=L.latLng({lat:r.lat,lng:r.lng+n}),a=L.latLng({lat:r.lat+n,lng:r.lng}),o=z(r,t),s=De.distance(r,i),c=De.distance(r,a);return{ew:s?Math.abs(z(i,t).x-o.x)/s:1,ns:c?Math.abs(z(a,t).y-o.y)/c:1}},Le=e=>e>0?Math.min(12,Math.max(0,3-Math.floor(Math.log10(e)))):6,Re=(e,t)=>{let n=10**t;return Math.round(e*n)/n},ze=(e,t,n,r=24)=>{let{ew:i,ns:a}=Ie(e,n),{x:o,y:s}=z(e,n),c=t*i,l=t*a,u=Le(Math.min(c,l));return Array.from({length:Math.max(3,r)},(e,t)=>{let n=2*Math.PI*t/Math.max(3,r);return{x:Re(o+c*Math.cos(n),u),y:Re(s+l*Math.sin(n),u)}})},{Map:Be,store:Ve}=I,He={crs:`crs`,center:`center`,bounds:`bounds`,zoom:`zoom`,minZoom:`minZoom`,maxZoom:`maxZoom`,units:`measurementSystem`,bboxOrder:`switchBboxOrder`},Ue=e=>{if(!e)return;let t=Be.getCRS?.()?.code,n=typeof e==`object`?e.code:e;t&&n&&t!==n&&console.warn(`perun-atlas: this deployment declares ${n}, but the map is on ${t}. The engine could not resolve the declared value — as a plain code it must be EPSG:3857, EPSG:3395 or EPSG:4326, and any other projection needs a proj4 definition. Basemap tiles will be requested outside the grid they are published on.`)},We=e=>{if(!e)return;Ve.addState(`dbCRSCode`,{dbCRS:e});let t=ke(e);if(t){Ve.addState(`dbCRS`,t);return}let n=Be.getCRS?.()?.code;e!==n?.split(`:`)[1]&&console.warn(`perun-atlas: this deployment stores geometry in EPSG:${e}, which spatial cannot convert from — it handles 3857, 3395 and 4326. Geometry will be read as though it were already in ${n}, and will be drawn in the wrong place.`)},Ge=(e={})=>{let t={};Object.entries(He).forEach(([n,r])=>{e[n]!==void 0&&(t[r]=e[n])});let n=be.configure(t);return Ue(e.crs),We(e.dataSrid),n},Ke=i({COERCE:()=>ue,applyToEngine:()=>Ge,batchSource:()=>pe,coerce:()=>de,defaultSource:()=>he,explain:()=>ve,legacySource:()=>me,remoteSource:()=>fe,resolve:()=>_e}),{geobuf:B,Pbf:qe}=xe,Je=(e,t,n)=>{window.PERUN_ATLAS_LAST=n,console.groupCollapsed(`perun-atlas: ${n.features.length} feature(s), ${t} bytes — ${e}`),console.log(`collection`,n),console.log(`also at window.PERUN_ATLAS_LAST`),console.groupEnd()},Ye=async(e,n={})=>{let r=`${window.server}${b(e,n)}`,i=await(0,t.axios)({method:`get`,url:r,responseType:`arraybuffer`}),a=i?.data?.byteLength??0;if(!i?.data||a===0){let e={type:`FeatureCollection`,features:[]};return Je(r,a,e),e}let o=B.decode(new qe(new Uint8Array(i.data)));if(!o||!o.type){console.warn(`perun-atlas: response from ${r} decoded to no GeoJSON type; treating as empty`),console.warn(`perun-atlas: response body was`,new TextDecoder().decode(i.data).slice(0,500));let e={type:`FeatureCollection`,features:[]};return Je(r,a,e),e}let s=o.type===`FeatureCollection`?o:{type:`FeatureCollection`,features:[o]};return Je(r,a,s),s},Xe=e=>e?.properties?.DESCRIPTOR??e?.properties?.descriptor??null,Ze=e=>({id:e?.id??e?.properties?.OBJECT_ID??null,parentId:e?.properties?.parent_id??e?.properties?.PARENT_ID??null}),Qe=(e,t,n=`id`)=>{if(t==null)return!1;let r=Ze(e),i=n===`parent`?r.parentId:r.id;return i!=null&&String(i)===String(t)},{factory:$e}=I,{getServerOrigin:et}=t.utils,tt=`GEO_LAYER_TYPE`,nt={BASEMAP:`1`,OVERLAY:`2`},rt=(e,t=tt)=>({layerType:e?.[`${t}.LAYER_TYPE`],protocol:(e?.[`${t}.PROTOCOL`]??``).toLowerCase(),version:e?.[`${t}.VERSION`]||`1.1.1`,format:e?.[`${t}.FORMAT`]||`image/png`,url:e?.[`${t}.URL`],group:e?.[`${t}.LAYER_GROUP`]||`Other`,title:e?.[`${t}.TITLE`],label:e?.[`${t}.LABEL_CODE`]||e?.[`${t}.TITLE`]}),it=[{match:/openstreetmap\.org/i,maxNativeZoom:19,attribution:`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`},{match:/opentopomap\.org/i,maxNativeZoom:17,attribution:`&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)`},{match:/cartocdn\.com/i,maxNativeZoom:20,attribution:`&copy; <a href="https://carto.com/attributions">CARTO</a>`},{match:/arcgisonline\.com/i,attribution:`Tiles &copy; <a href="https://www.esri.com">Esri</a>`}],at=e=>it.find(t=>t.match.test(e??``))??{},ot=(e,{maxZoom:t}={})=>{let n=e.url||et(),r=at(n),i={...t!=null&&{maxZoom:t},...r.maxNativeZoom!=null&&{maxNativeZoom:r.maxNativeZoom}},a=r.attribution?{attribution:r.attribution}:{};if(e.protocol===`wms`)return $e.tileLayer.extendedWMS(n,{layers:e.title,format:e.format,version:e.version,transparent:!0,uppercase:!0,...i,...a,...e.layerType===nt.OVERLAY&&{tiled:!0,isOverlay:!0}});if(e.protocol===`tile`){let e=/google|mt\{s\}/i.test(n);return $e.tileLayer(n,{...i,...a,...e&&{subdomains:[`mt0`,`mt1`,`mt2`,`mt3`]}})}return e.protocol===`grid`?e.url?.includes(`google`)?$e.gridLayer.googleMutant({maxZoom:24,type:e.url.split(`_`)[1]}):(console.warn(`perun-atlas: grid layer "${e.title}" has no recognised provider in its URL`),null):(console.warn(`perun-atlas: unsupported layer protocol "${e.protocol}" for "${e.title}"`),null)},st=async(e,n={})=>{let r={},i={},a=(await t.axios.get(`${window.server}/ReactElements/getTableData/${e}/${tt}/0`).catch(e=>(console.error(`perun-atlas: layer catalogue unavailable`,e),null)))?.data;return Array.isArray(a)&&a.forEach(e=>{let t=rt(e),a=ot(t,n);if(!a)return;let o=t.layerType===nt.OVERLAY?i:r;o[t.group]=o[t.group]||{},o[t.group][t.label]=a}),{basemap:r,overlays:i}},ct=e=>{let t=Object.values(e??{})[0];return t?Object.values(t)[0]:null},lt=(e,t)=>{if(!t)return null;let n=Object.values(e??{}).find(e=>Object.prototype.hasOwnProperty.call(e,t));return n?n[t]:null},ut=(e,t)=>{for(let n of Object.values(e??{})){let e=Object.entries(n).find(([,e])=>t?.hasLayer?.(e));if(e)return e[0]}return null},dt=async(e,n={})=>{if(!e)return[];let r=`${window.server}${b(e,n)}`,i=(await t.axios.get(r).catch(e=>(console.error(`perun-atlas: rows unavailable from ${r}`,e),null)))?.data;return i&&!Array.isArray(i)&&console.warn(`perun-atlas: ${r} answered with no array of rows; treating as empty`),Array.isArray(i)?i:[]},ft=async(e,n,r,i)=>{if(!e)return null;let a=`${window.server}${b(e,n)}`,o=await t.axios.get(a).catch(e=>(console.error(`perun-atlas: no ${r} from ${a}`,e),null));if(!o)return null;let s=o.data;return i(s)?s:(console.error(`perun-atlas: ${a} answered with no ${r}`,s),null)},pt=e=>!!e&&typeof e==`object`&&!Array.isArray(e),mt=(e,t={})=>ft(e,t,`form schema`,e=>pt(e)&&!!e.properties),ht=(e,t={})=>ft(e,t,`form layout`,pt),gt=(e,t)=>{if(!e?.properties||!t?.length)return e??null;let n=e.properties,r={},i=new Set;t.forEach(e=>{if(Object.prototype.hasOwnProperty.call(n,e)){r[e]=n[e],i.add(e);return}let t=e.lastIndexOf(`.`),a=t===-1?``:e.slice(0,t),o=t===-1?``:e.slice(t+1),s=a?n[a]:null,c=s?.properties?.[o];if(!c){console.warn(`perun-atlas: the form schema has no "${e}", so it is not on the form`);return}if(i.has(a))return;let l=r[a]??{...s,properties:{}};l.properties={...l.properties,[o]:c},r[a]=l}),Object.keys(r).forEach(e=>{if(i.has(e))return;let t=r[e],a=(n[e].required??[]).filter(e=>e in t.properties);a.length?t.required=a:delete t.required});let a={...e,properties:r};delete a.title;let o=(e.required??[]).filter(e=>e in r);if(o.length?a.required=o:delete a.required,a.dependencies){let e=Object.entries(a.dependencies).filter(([e])=>e in r);e.length?a.dependencies=Object.fromEntries(e):delete a.dependencies}return a},_t=(e,t)=>{if(!t?.properties)return e??{};let n={...e??{}};return Object.entries(t.properties).forEach(([e,t])=>{t?.properties&&(n[e]=_t(n[e],t))}),n},vt={boolean:[`checkbox`,`radio`,`select`,`hidden`],string:[`text`,`password`,`email`,`hostname`,`ipv4`,`ipv6`,`uri`,`data-url`,`radio`,`select`,`textarea`,`hidden`,`date`,`datetime`,`date-time`,`alt-date`,`alt-datetime`,`time`,`color`,`file`],number:[`text`,`select`,`updown`,`range`,`radio`,`hidden`],integer:[`text`,`select`,`updown`,`range`,`radio`,`hidden`],array:[`select`,`checkboxes`,`files`,`hidden`]},yt=new Set([`AltDateTimeWidget`,`AltDateWidget`,`CheckboxWidget`,`CheckboxesWidget`,`ColorWidget`,`DateTimeWidget`,`DateWidget`,`EmailWidget`,`FileWidget`,`HiddenWidget`,`PasswordWidget`,`RadioWidget`,`RangeWidget`,`SelectWidget`,`TextWidget`,`TextareaWidget`,`TimeWidget`,`URLWidget`,`UpDownWidget`]),bt=new Set(Object.values(vt).flat()),xt=(e,t)=>yt.has(e)||(t?(vt[t]??[]).includes(e):bt.has(e)),St=(e,t)=>{if(!pt(e))return e??null;let n=[],r=(e,t)=>{let i={};return Object.entries(e).forEach(([e,a])=>{if(e===`ui:widget`&&typeof a==`string`&&!xt(a,t?.type)){n.push(a);return}let o=e===`items`?t?.items:t?.properties?.[e];i[e]=pt(a)&&!e.startsWith(`ui:`)?r(a,o):a}),i},i=r(e,t);return n.length&&console.warn(`perun-atlas: this form cannot draw ${[...new Set(n)].map(e=>`"${e}"`).join(`, `)} -- those are the widgets a record form registers, and the draw row is not one. The fields keep the widget their schema implies.`),n.length?i:e},{Map:Ct,factory:wt}=I,Tt=(e,t,n)=>{let r=we(e?.geometry);if(r.length===0)return null;let i=wt.latLng(t),a=1/0,o=0;return r.forEach(e=>{let t=Ct.distance(i,wt.latLng(Me(e,n)));t<a&&(a=t),t>o&&(o=t)}),{nearest:a,furthest:o}},Et=(e,t,n={})=>{let{srid:r,mode:i=`touches`}=n,a=e?.features??[],o={inside:[],outside:a,has:()=>!1,metres:()=>null,total:a.length};if(!t||!(t.radius>0))return o;let s={lat:t.lat,lng:t.lng};if(!Number.isFinite(s.lat)||!Number.isFinite(s.lng))return o;let c=new WeakMap,l=new WeakSet,u=[],d=[];return a.forEach(e=>{let n=Tt(e,s,r);if(!n){d.push(e);return}c.set(e,n.nearest),(i===`contains`?n.furthest<=t.radius:n.nearest<=t.radius)?(l.add(e),u.push(e)):d.push(e)}),u.sort((e,t)=>c.get(e)-c.get(t)),{inside:u,outside:d,has:e=>e?l.has(e):!1,metres:e=>e&&c.has(e)?c.get(e):null,total:a.length}},Dt=(e,t={})=>{let{id:n=`{pkid}`,join:r=`,`}=t;return(e??[]).map(e=>b(n,e?.properties??{})).filter(e=>e&&e!==n).join(r)},Ot=e=>encodeURIComponent(JSON.stringify(e)),kt=e=>e.replace(/ /g,`%20`),At=(e,t,n)=>e==null?``:t===`form`||!t&&/form-urlencoded/.test(n??``)?Ot(e):JSON.stringify(e),jt=(e,t)=>{let n=typeof e==`string`?Mt(e):e,r=String(n?.type??``).toUpperCase();return r===`ERROR`||r===`EXCEPTION`?{ok:!1,message:[n?.title,n?.message].filter(Boolean).join(` — `)}:t&&typeof e==`string`&&new RegExp(t,`i`).test(e)?{ok:!1,message:e.trim().slice(0,300)}:{ok:!0,message:null}},Mt=e=>{try{return JSON.parse(e)}catch{return null}},Nt=/^\{([^{}]+)\}$/,Pt=`...`,Ft=(e,t)=>{if(typeof e==`string`){let n=e.match(Nt);return n?v(t,n[1])??e:b(e,t)}if(Array.isArray(e))return e.map(e=>Ft(e,t));if(e&&typeof e==`object`){let n={};return Object.entries(e).forEach(([e,r])=>{let i=Ft(r,t);if(e===Pt){i&&typeof i==`object`&&!Array.isArray(i)?Object.assign(n,i):n[e]=i;return}n[e]=i}),n}return e},It=async(e,n={},r={})=>{let{body:i,contentType:a=`application/x-www-form-urlencoded`,encoding:o,failure:s}=r,c=`${window.server}${kt(b(e,n))}`;try{let e=await(0,t.axios)({method:`post`,url:c,headers:{"Content-Type":a},data:At(i,o,a)}),n=jt(e?.data,s);return n.ok||(console.error(`perun-atlas: ${c} refused the save`,e?.data),console.error(`perun-atlas: the payload was`,i)),{...n,data:e?.data}}catch(e){return console.error(`perun-atlas: save to ${c} failed`,e),{ok:!1,message:e?.message??String(e),data:null}}},Lt=(e,{draw:t,dataSrid:n,bindings:r,note:i,selected:a,form:o})=>{let s={lat:e.lat,lng:e.lng},{x:c,y:l}=z(s,n),u=e.radius*Fe(s,n),d=Math.round(u),f=ze(s,e.radius,n,t.points),p=f.map(e=>b(t.ring?.point??`{x} {y}`,e)).join(t.ring?.join??`, `),m={type:`Polygon`,coordinates:[[...f,f[0]].map(e=>[e.x,e.y])]},h=[t.save.onSave,JSON.stringify(t.save.body??null)].some(e=>String(e).includes(`{draw.radius}`));return{context:{...r,note:i,draw:{lat:e.lat,lng:e.lng,metres:Math.round(e.radius),x:c,y:l,radius:d,ring:p,geojson:m,...a?{selected:a}:{}},...t.form?{form:o}:{}},units:u,tooSmall:h&&!(d>=1)}},Rt=e=>JSON.stringify(e??{type:`FeatureCollection`,features:[]},null,2),zt=(e,t=[])=>{let n=new Set([...s,...t]),r=new Set;return e.forEach(e=>{Object.entries(e?.properties??{}).forEach(([e,t])=>{!n.has(e)&&(typeof t!=`object`||!t)&&r.add(e)})}),[...r]},Bt=(e,{fields:t,exclude:n,labelResolver:r}={})=>t?.length?t.map(({field:e,label:t,short:n})=>({field:e,header:t&&r?.(t)||t||e,short:n})):zt(e,n).map(e=>({field:e,header:r?.(e.toLowerCase())||e})),Vt=e=>e.map(([e,t])=>`${e} ${t}`).join(`, `),Ht=e=>e.map(e=>`(${Vt(e)})`).join(`, `),Ut={Point:([e,t])=>`POINT (${e} ${t})`,MultiPoint:e=>`MULTIPOINT (${Vt(e)})`,LineString:e=>`LINESTRING (${Vt(e)})`,MultiLineString:e=>`MULTILINESTRING (${Ht(e)})`,Polygon:e=>`POLYGON (${Ht(e)})`,MultiPolygon:e=>`MULTIPOLYGON (${e.map(e=>`(${Ht(e)})`).join(`, `)})`},Wt=e=>{let t=Ut[e?.type];return t&&e.coordinates?.length?t(e.coordinates):``},Gt=e=>{if(e==null)return``;let t=String(e),n=!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t)&&/^[=+\-@\t\r]/.test(t)?`'${t}`:t;return/[",\r\n]/.test(n)?`"${n.replace(/"/g,`""`)}"`:n},Kt=(e,{fields:t,exclude:n,labelResolver:r}={})=>{let i=e?.features??[],a=Bt(i,{fields:t,exclude:n,labelResolver:r}),o=e=>e?.geometry?.type??``,s=i.some(e=>/Point$/.test(o(e))),c=i.some(e=>o(e)&&!/Point$/.test(o(e))),l=[...a.map(e=>e.header),...s?[`latitude`,`longitude`]:[],...c?[`geometry`]:[]],u=i.map(e=>{let t=a.map(t=>Gt(v(e?.properties,t.field)));if(s){let[n,r]=/^Point$/.test(o(e))?e.geometry.coordinates??[]:[];t.push(Gt(r),Gt(n))}return c&&t.push(Gt(Wt(e?.geometry))),t});return[l.map(Gt),...u].map(e=>e.join(`,`)).join(`\r
`)},qt={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&apos;`},Jt=e=>String(e).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g,``).replace(/[&<>"']/g,e=>qt[e]),Yt=e=>`<coordinates>${e.map(e=>e.join(`,`)).join(` `)}</coordinates>`,Xt=e=>`<LinearRing>${Yt(e)}</LinearRing>`,Zt={Point:e=>`<Point>${Yt([e])}</Point>`,LineString:e=>`<LineString><tessellate>1</tessellate>${Yt(e)}</LineString>`,Polygon:([e,...t])=>`<Polygon><tessellate>1</tessellate><outerBoundaryIs>${Xt(e)}</outerBoundaryIs>`+t.map(e=>`<innerBoundaryIs>${Xt(e)}</innerBoundaryIs>`).join(``)+`</Polygon>`,MultiPoint:e=>`<MultiGeometry>${e.map(Zt.Point).join(``)}</MultiGeometry>`,MultiLineString:e=>`<MultiGeometry>${e.map(Zt.LineString).join(``)}</MultiGeometry>`,MultiPolygon:e=>`<MultiGeometry>${e.map(Zt.Polygon).join(``)}</MultiGeometry>`},Qt=e=>{let t=Zt[e?.type];return t&&e.coordinates?.length?t(e.coordinates):``},$t=(e,t,n)=>{let r=n?.(e),i=Qt(e?.geometry),a=t.map(({field:t,header:n})=>{let r=v(e?.properties,t),i=r==null?``:Jt(r);return`        <Data name="${Jt(t)}"><displayName>${Jt(n)}</displayName><value>${i}</value></Data>`});return[`    <Placemark>`,...r==null||r===``?[]:[`      <name>${Jt(r)}</name>`],...a.length?[`      <ExtendedData>`,...a,`      </ExtendedData>`]:[],...i?[`      ${i}`]:[],`    </Placemark>`].join(`
`)},en=(e,{fields:t,exclude:n,labelResolver:r,nameOf:i}={})=>{let a=e?.features??[],o=Bt(a,{fields:t,exclude:n,labelResolver:r});return[`<?xml version="1.0" encoding="UTF-8"?>`,`<kml xmlns="http://www.opengis.net/kml/2.2">`,`  <Document>`,...a.map(e=>$t(e,o,i)),`  </Document>`,`</kml>`,``].join(`
`)},tn=`GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]`,nn=1,rn=3,an=5,on=8,sn=[{name:`points`,types:[`Point`,`MultiPoint`]},{name:`lines`,types:[`LineString`,`MultiLineString`],shape:rn},{name:`polygons`,types:[`Polygon`,`MultiPolygon`],shape:an}],cn=e=>Array.isArray(e)&&Number.isFinite(e[0])&&Number.isFinite(e[1]),ln=e=>Array.isArray(e)?e.filter(cn):[],un=e=>{let[t,n]=[e[0],e[e.length-1]];return t[0]===n[0]&&t[1]===n[1]?e:[...e,t]},dn=e=>{let t=0;for(let n=1;n<e.length;n+=1)t+=(e[n][0]-e[n-1][0])*(e[n][1]+e[n-1][1]);return t>0},fn=e=>{let[t,...n]=(Array.isArray(e)?e:[]).map(ln);return t?.length?[t,...n.filter(e=>e.length)].map(un).map((e,t)=>dn(e)===(t===0)?e:[...e].reverse()):[]},pn=e=>Array.isArray(e)?e.map(ln).filter(e=>e.length):[],mn={Point:e=>cn(e)?[[e]]:[],MultiPoint:e=>{let t=ln(e);return t.length?[t]:[]},LineString:e=>pn([e]),MultiLineString:pn,Polygon:fn,MultiPolygon:e=>Array.isArray(e)?e.flatMap(fn):[]},hn=e=>mn[e?.type]?.(e.coordinates)??[],gn=e=>e.reduce(([e,t,n,r],[i,a])=>[Math.min(e,i),Math.min(t,a),Math.max(n,i),Math.max(r,a)],[1/0,1/0,-1/0,-1/0]),_n=(e,t,n)=>n.forEach((n,r)=>e.setFloat64(t+8*r,n,!0)),vn=(e,t)=>{let n=t.reduce((e,t)=>e+t.length,0);return e===nn?20:e===on?40+16*n:44+4*t.length+16*n},yn=(e,t,n,r)=>{if(e.setInt32(t,n,!0),n===nn){let[[[n,i]]]=r;e.setFloat64(t+4,n,!0),e.setFloat64(t+12,i,!0);return}let i=r.flat();_n(e,t+4,gn(i));let a=t+36;if(n!==on&&(e.setInt32(a,r.length,!0),a+=4),e.setInt32(a,i.length,!0),a+=4,n!==on){let t=0;r.forEach(n=>{e.setInt32(a,t,!0),a+=4,t+=n.length})}i.forEach(([t,n])=>{e.setFloat64(a,t,!0),e.setFloat64(a+8,n,!0),a+=16})},bn=(e,t,n)=>{e.setInt32(0,9994),e.setInt32(24,e.byteLength/2),e.setInt32(28,1e3,!0),e.setInt32(32,t,!0),_n(e,36,n)},xn=(e,t)=>{let n=t.map(t=>vn(e,t)),r=new DataView(new ArrayBuffer(n.reduce((e,t)=>e+8+t,100))),i=new DataView(new ArrayBuffer(100+8*t.length)),a=gn(t.flatMap(e=>e.flat()));bn(r,e,a),bn(i,e,a);let o=100;return t.forEach((t,a)=>{i.setInt32(100+8*a,o/2),i.setInt32(104+8*a,n[a]/2),r.setInt32(o,a+1),r.setInt32(o+4,n[a]/2),yn(r,o+8,e,t),o+=8+n[a]}),{shp:new Uint8Array(r.buffer),shx:new Uint8Array(i.buffer)}},Sn=10,Cn=e=>{let t=new Set;return e.map(e=>{let n=String(e.short||e.field).replace(/[^A-Za-z0-9_]/g,`_`),r=(/[A-Za-z0-9]/.test(n)?n:`FIELD`).slice(0,Sn),i=r;for(let e=1;t.has(i.toUpperCase());e+=1){let t=`_${e}`;i=r.slice(0,Sn-t.length)+t}return t.add(i.toUpperCase()),{...e,short:i}})},wn=new TextEncoder,Tn=32,En=254,Dn=19,On=15,kn=e=>{let t=wn.encode(String(e));if(t.length<=En)return t;let n=En;for(;n>0&&(t[n]&192)==128;)--n;return t.subarray(0,n)},An=(e,t=0)=>e.reduce((e,t)=>Math.max(e,t),t),jn=e=>{for(let t=0;t<On;t+=1)if(Number(e.toFixed(t))===e)return t;return On},Mn=e=>{let t=An(e.filter(e=>e!==null).map(jn)),n=e.map(e=>e===null?null:e.toFixed(t));if(n.some(e=>e?.includes(`e`)))return null;let r=An(n.map(e=>e?.length??0));return r<=Dn?{type:`N`,width:r,decimals:t,cells:n.map(e=>e&&wn.encode(e))}:null},Nn=e=>{let t=e.filter(e=>e!=null),n=e.map(e=>e===void 0?null:e);if(t.length&&t.every(e=>typeof e==`number`&&Number.isFinite(e))){let e=Mn(n);if(e)return e}if(t.length&&t.every(e=>typeof e==`boolean`))return{type:`L`,width:1,decimals:0,cells:n.map(e=>wn.encode(e===null?`?`:e?`T`:`F`))};let r=n.map(e=>e===null?null:kn(e));return{type:`C`,width:An(r.map(e=>e?.length??0),1),decimals:0,cells:r}},Pn=(e,t,n)=>{let r=e.length?e.map(e=>({name:e.short,...Nn(t.map(t=>v(t?.properties,e.field)))})):[{name:`FID`,...Nn(t.map((e,t)=>t))}],i=32+32*r.length+1,a=r.reduce((e,t)=>e+t.width,1),o=new Uint8Array(i+a*t.length+1),s=new DataView(o.buffer);s.setUint8(0,3),s.setUint8(1,n.getFullYear()-1900),s.setUint8(2,n.getMonth()+1),s.setUint8(3,n.getDate()),s.setUint32(4,t.length,!0),s.setUint16(8,i,!0),s.setUint16(10,a,!0),r.forEach(({name:e,type:t,width:n,decimals:r},i)=>{let a=32+32*i;o.set(wn.encode(e),a),s.setUint8(a+11,t.charCodeAt(0)),s.setUint8(a+16,n),s.setUint8(a+17,r)}),s.setUint8(i-1,13),o.fill(Tn,i,o.length-1);let c=i;return t.forEach((e,t)=>{c+=1,r.forEach(({type:e,width:n,cells:r})=>{let i=r[t];i&&o.set(i,e===`N`?c+n-i.length:c),c+=n})}),s.setUint8(o.length-1,26),o},Fn=e=>`﻿`+[[`short`,`column`,`header`],...e.map(({short:e,field:t,header:n})=>[e,t,n])].map(e=>e.map(Gt).join(`,`)).join(`\r
`),In=(e,t,n)=>{let r=new Set(Bt(t,{exclude:n}).map(({field:e})=>e));return e.filter(({field:e})=>r.has(e))},Ln=(e,{stem:t=`features`,fields:n,exclude:r,labelResolver:i,today:a=new Date}={})=>{let o=e?.features??[],s=Cn(Bt(o,{fields:n,exclude:r,labelResolver:i})),c=[];return sn.forEach(({name:e,types:i,shape:l})=>{let u=o.filter(e=>i.includes(e?.geometry?.type)).map(e=>({feature:e,parts:hn(e.geometry)})).filter(({parts:e})=>e.length);if(!u.length)return;let d=l??(u.every(({feature:e})=>e.geometry.type===`Point`)?nn:on),f=n?.length?s:In(s,u.map(({feature:e})=>e),r),{shp:p,shx:m}=xn(d,u.map(({parts:e})=>e)),h=`${t}-${e}`;c.push({name:`${h}.shp`,bytes:p},{name:`${h}.shx`,bytes:m},{name:`${h}.dbf`,bytes:Pn(f,u.map(({feature:e})=>e),a)},{name:`${h}.prj`,bytes:wn.encode(tn)},{name:`${h}.cpg`,bytes:wn.encode(`UTF-8`)})}),c.push({name:`${t}-fields.csv`,bytes:wn.encode(Fn(s))}),c};function V(e,t){return Array.from(e.getElementsByTagName(t))}function Rn(e){return e[0]===`#`?e:`#${e}`}function zn(e,t,n){return Array.from(e.getElementsByTagNameNS(n,t))}function H(e){return e?.normalize(),e?.textContent||``}function U(e,t,n){let r=e.getElementsByTagName(t),i=r.length?r[0]:null;return i&&n&&n(i),i}function W(e,t,n){let r={};if(!e)return r;let i=e.getElementsByTagName(t),a=i.length?i[0]:null;return a&&n?n(a,r):r}function Bn(e,t,n){let r=H(U(e,t));return r&&n&&n(r)||{}}function Vn(e,t,n){let r=Number.parseFloat(H(U(e,t)));if(!Number.isNaN(r))return r&&n&&n(r)||{}}function G(e,t,n){let r=Number.parseFloat(H(U(e,t)));if(!Number.isNaN(r))return n&&n(r),r}function Hn(e,t){let n={};for(let r of t)Bn(e,r,e=>{n[r]=e});return n}function Un(e){return e?.nodeType===1}function Wn(e){let t=[];if(e===null)return t;for(let n of Array.from(e.childNodes)){if(!Un(n))continue;let e=Gn(n.nodeName);if(e===`gpxtpx:TrackPointExtension`)t=t.concat(Wn(n));else{let r=H(n);t.push([e,Kn(r)])}}return t}function Gn(e){return[`heart`,`gpxtpx:hr`,`hr`].includes(e)?`heart`:e}function Kn(e){let t=Number.parseFloat(e);return Number.isNaN(t)?e:t}function qn(e){let t=[Number.parseFloat(e.getAttribute(`lon`)||``),Number.parseFloat(e.getAttribute(`lat`)||``)];if(Number.isNaN(t[0])||Number.isNaN(t[1]))return null;G(e,`ele`,e=>{t.push(e)});let n=U(e,`time`);return{coordinates:t,time:n?H(n):null,extendedValues:Wn(U(e,`extensions`))}}function Jn(e){return W(e,`line`,e=>Object.assign({},Bn(e,`color`,e=>({stroke:`#${e}`})),Vn(e,`opacity`,e=>({"stroke-opacity":e})),Vn(e,`width`,e=>({"stroke-width":e*96/25.4}))))}function Yn(e,t){let n=Hn(t,[`name`,`cmt`,`desc`,`type`,`time`,`keywords`]);for(let[r,i]of e)for(let e of Array.from(t.getElementsByTagNameNS(i,`*`)))n[e.tagName.replace(`:`,`_`)]=H(e)?.trim();let r=V(t,`link`);return r.length&&(n.links=r.map(e=>Object.assign({href:e.getAttribute(`href`)},Hn(e,[`text`,`type`])))),n}function Xn(e,t){let n=V(e,t),r=[],i=[],a={};for(let e=0;e<n.length;e++){let t=qn(n[e]);if(t){r.push(t.coordinates),t.time&&i.push(t.time);for(let[r,i]of t.extendedValues){let t=r===`heart`?r:`${r.replace(`gpxtpx:`,``)}s`;a[t]||(a[t]=Array(n.length).fill(null)),a[t][e]=i}}}if(!(r.length<2))return{line:r,times:i,extendedValues:a}}function Zn(e,t){let n=Xn(t,`rtept`);if(n)return{type:`Feature`,properties:Object.assign({_gpxType:`rte`},Yn(e,t),Jn(U(t,`extensions`))),geometry:{type:`LineString`,coordinates:n.line}}}function Qn(e,t){let n=V(t,`trkseg`),r=[],i=[],a=[];for(let e of n){let t=Xn(e,`trkpt`);t&&(a.push(t),t.times?.length&&i.push(t.times))}if(a.length===0)return null;let o=a.length>1,s=Object.assign({_gpxType:`trk`},Yn(e,t),Jn(U(t,`extensions`)),i.length?{coordinateProperties:{times:o?i:i[0]}}:{});for(let e=0;e<a.length;e++){let t=a[e];r.push(t.line),s.coordinateProperties||(s.coordinateProperties={});let n=s.coordinateProperties;for(let[r,i]of Object.entries(t.extendedValues))o?(n[r]||(n[r]=a.map(e=>Array(e.line.length).fill(null))),n[r][e]=i):n[r]=i}return{type:`Feature`,properties:s,geometry:o?{type:`MultiLineString`,coordinates:r}:{type:`LineString`,coordinates:r[0]}}}function $n(e,t){let n=Object.assign(Yn(e,t),Hn(t,[`sym`])),r=qn(t);return r?{type:`Feature`,properties:n,geometry:{type:`Point`,coordinates:r.coordinates}}:null}function*er(e){let t=e,n=`http://www.garmin.com/xmlschemas/GpxExtensions/v3`,r=[[`gpxx`,n]],i=t.getElementsByTagName(`gpx`)[0]?.attributes;if(i)for(let e of Array.from(i))e.name?.startsWith(`xmlns:`)&&e.value!==n&&r.push([e.name,e.value]);for(let e of V(t,`trk`)){let t=Qn(r,e);t&&(yield t)}for(let e of V(t,`rte`)){let t=Zn(r,e);t&&(yield t)}for(let e of V(t,`wpt`)){let t=$n(r,e);t&&(yield t)}}function tr(e){return{type:`FeatureCollection`,features:Array.from(er(e))}}function nr(e,t){let n={},r=t===`stroke`||t===`fill`?t:`${t}-color`;return e[0]===`#`&&(e=e.substring(1)),e.length===6||e.length===3?n[r]=`#${e}`:e.length===8&&(n[`${t}-opacity`]=Number.parseInt(e.substring(0,2),16)/255,n[r]=`#${e.substring(6,8)}${e.substring(4,6)}${e.substring(2,4)}`),n}function rr(e,t,n){let r={};return G(e,t,e=>{r[n]=e}),r}function ir(e,t){return W(e,`color`,e=>nr(H(e),t))}function ar(e){return W(e,`Icon`,(e,t)=>(Bn(e,`href`,e=>{t.icon=e}),t))}function or(e){return W(e,`IconStyle`,e=>Object.assign(ir(e,`icon`),rr(e,`scale`,`icon-scale`),rr(e,`heading`,`icon-heading`),W(e,`hotSpot`,e=>{let t=Number.parseFloat(e.getAttribute(`x`)||``),n=Number.parseFloat(e.getAttribute(`y`)||``),r=e.getAttribute(`xunits`)||``,i=e.getAttribute(`yunits`)||``;return!Number.isNaN(t)&&!Number.isNaN(n)?{"icon-offset":[t,n],"icon-offset-units":[r,i]}:{}}),ar(e)))}function sr(e){return W(e,`LabelStyle`,e=>Object.assign(ir(e,`label`),rr(e,`scale`,`label-scale`)))}function cr(e){return W(e,`LineStyle`,e=>Object.assign(ir(e,`stroke`),rr(e,`width`,`stroke-width`)))}function lr(e){return W(e,`PolyStyle`,(e,t)=>Object.assign(t,W(e,`color`,e=>nr(H(e),`fill`)),Bn(e,`fill`,e=>{if(e===`0`)return{"fill-opacity":0}}),Bn(e,`outline`,e=>{if(e===`0`)return{"stroke-opacity":0}})))}function ur(e){return Object.assign({},lr(e),cr(e),sr(e),or(e))}var dr=/\s*/g,fr=/^\s*|\s*$/g,pr=/\s+/;function mr(e){return e.replace(dr,``).split(`,`).map(Number.parseFloat).filter(e=>!Number.isNaN(e)).slice(0,3)}function hr(e){return e.replace(fr,``).split(pr).map(mr).filter(e=>e.length>=2)}function gr(e){let t=V(e,`coord`);t.length===0&&(t=zn(e,`coord`,`*`));let n=t.map(e=>H(e).split(` `).map(Number.parseFloat));return n.length===0?null:{geometry:n.length>2?{type:`LineString`,coordinates:n}:{type:`Point`,coordinates:n[0]},times:V(e,`when`).map(e=>H(e))}}function _r(e){if(e.length===0)return e;let t=e[0],n=e[e.length-1],r=!0;for(let e=0;e<Math.max(t.length,n.length);e++)if(t[e]!==n[e]){r=!1;break}return r?e:e.concat([e[0]])}function vr(e){return H(U(e,`coordinates`))}function yr(e){let t=[],n=[];for(let r=0;r<e.childNodes.length;r++){let i=e.childNodes.item(r);if(Un(i))switch(i.tagName){case`MultiGeometry`:case`MultiTrack`:case`gx:MultiTrack`:{let e=yr(i);t=t.concat(e.geometries),n=n.concat(e.coordTimes);break}case`Point`:{let e=mr(vr(i));e.length>=2&&t.push({type:`Point`,coordinates:e});break}case`LinearRing`:case`LineString`:{let e=hr(vr(i));e.length>=2&&t.push({type:`LineString`,coordinates:e});break}case`Polygon`:{let e=[];for(let t of V(i,`LinearRing`)){let n=_r(hr(vr(t)));n.length>=4&&e.push(n)}e.length&&t.push({type:`Polygon`,coordinates:e});break}case`Track`:case`gx:Track`:{let e=gr(i);if(!e)break;let{times:r,geometry:a}=e;t.push(a),r.length&&n.push(r);break}}}return{geometries:t,coordTimes:n}}var br=e=>Number(e),xr={string:e=>e,int:br,uint:br,short:br,ushort:br,float:br,double:br,bool:e=>!!e};function Sr(e,t){return W(e,`ExtendedData`,(e,n)=>{for(let t of V(e,`Data`))n[t.getAttribute(`name`)||``]=H(U(t,`value`));for(let r of V(e,`SimpleData`)){let e=r.getAttribute(`name`)||``;n[e]=(t[e]||xr.string)(H(r))}return n})}function Cr(e){let t=U(e,`description`);for(let e of Array.from(t?.childNodes||[]))if(e.nodeType===4)return{description:{"@type":`html`,value:H(e)}};return{}}function wr(e){return W(e,`TimeSpan`,e=>({timespan:{begin:H(U(e,`begin`)),end:H(U(e,`end`))}}))}function Tr(e){return W(e,`TimeStamp`,e=>({timestamp:H(U(e,`when`))}))}function Er(e,t){return Bn(e,`styleUrl`,e=>(e=Rn(e),t[e]?Object.assign({styleUrl:e},t[e]):{styleUrl:e}))}var K;(function(e){e.ABSOLUTE=`absolute`,e.RELATIVE_TO_GROUND=`relativeToGround`,e.CLAMP_TO_GROUND=`clampToGround`,e.CLAMP_TO_SEAFLOOR=`clampToSeaFloor`,e.RELATIVE_TO_SEAFLOOR=`relativeToSeaFloor`})(K||(K={}));function Dr(e){switch(e?.textContent){case K.ABSOLUTE:return K.ABSOLUTE;case K.CLAMP_TO_GROUND:return K.CLAMP_TO_GROUND;case K.CLAMP_TO_SEAFLOOR:return K.CLAMP_TO_SEAFLOOR;case K.RELATIVE_TO_GROUND:return K.RELATIVE_TO_GROUND;case K.RELATIVE_TO_SEAFLOOR:return K.RELATIVE_TO_SEAFLOOR}return null}function Or(e){return U(e,`gx:LatLonQuad`)?{geometry:{type:`Polygon`,coordinates:[_r(hr(vr(e)))]}}:jr(e)}var kr=Math.PI/180;function Ar(e,t,n){let r=[(e[0]+e[2])/2,(e[1]+e[3])/2];return[t[0].map(e=>{let t=e[1]-r[1],i=e[0]-r[0],a=Math.sqrt(t**2+i**2),o=Math.atan2(t,i)+n*kr;return[r[0]+Math.cos(o)*a,r[1]+Math.sin(o)*a]})]}function jr(e){let t=U(e,`LatLonBox`);if(t){let e=G(t,`north`),n=G(t,`west`),r=G(t,`east`),i=G(t,`south`),a=G(t,`rotation`);if(typeof e==`number`&&typeof i==`number`&&typeof n==`number`&&typeof r==`number`){let t=[n,i,r,e],o=[[[n,e],[r,e],[r,i],[n,i],[n,e]]];return typeof a==`number`&&(o=Ar(t,o,a)),{bbox:t,geometry:{type:`Polygon`,coordinates:o}}}}return null}function Mr(e,t,n,r){let i=Or(e),a=i?.geometry||null;if(!a&&r.skipNullGeometry)return null;let o={type:`Feature`,geometry:a,properties:Object.assign({"@geometry-type":`groundoverlay`},Hn(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`description`]),Cr(e),Er(e,t),ur(e),ar(e),Sr(e,n),wr(e),Tr(e))};i?.bbox&&(o.bbox=i.bbox),o.properties?.visibility!==void 0&&(o.properties.visibility=o.properties.visibility!==`0`);let s=e.getAttribute(`id`);return s!==null&&s!==``&&(o.id=s),o}function Nr(e){let t=U(e,`Region`);return t?{coordinateBox:Fr(t),lod:Pr(e)}:null}function Pr(e){let t=U(e,`Lod`);return t?[G(t,`minLodPixels`)??-1,G(t,`maxLodPixels`)??-1,G(t,`minFadeExtent`)??null,G(t,`maxFadeExtent`)??null]:null}function Fr(e){let t=U(e,`LatLonAltBox`);if(t){let e=G(t,`north`),n=G(t,`west`),r=G(t,`east`),i=G(t,`south`);if(Dr(U(t,`altitudeMode`)||U(t,`gx:altitudeMode`))&&console.debug(`Encountered an unsupported feature of KML for togeojson: please contact developers for support of altitude mode.`),typeof e==`number`&&typeof i==`number`&&typeof n==`number`&&typeof r==`number`)return{bbox:[n,i,r,e],geometry:{type:`Polygon`,coordinates:[[[n,e],[r,e],[r,i],[n,i],[n,e]]]}}}return null}function Ir(e){let t=U(e,`Link`);return t?Hn(t,[`href`,`refreshMode`,`refreshInterval`,`viewRefreshMode`,`viewRefreshTime`,`viewBoundScale`,`viewFormat`,`httpQuery`]):{}}function Lr(e,t,n,r){let i=Nr(e),a=i?.coordinateBox?.geometry||null;if(!a&&r.skipNullGeometry)return null;let o={type:`Feature`,geometry:a,properties:Object.assign({"@geometry-type":`networklink`},Hn(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`styleUrl`,`refreshVisibility`,`flyToView`,`description`]),Cr(e),Er(e,t),ur(e),ar(e),Sr(e,n),wr(e),Tr(e),Ir(e),i?.lod?{lod:i.lod}:{})};i?.coordinateBox?.bbox&&(o.bbox=i.coordinateBox.bbox),o.properties?.visibility!==void 0&&(o.properties.visibility=o.properties.visibility!==`0`);let s=e.getAttribute(`id`);return s!==null&&s!==``&&(o.id=s),o}function Rr(e){return e.length===0?null:e.length===1?e[0]:{type:`GeometryCollection`,geometries:e}}function zr(e,t,n,r){let{coordTimes:i,geometries:a}=yr(e),o=Rr(a);if(!o&&r.skipNullGeometry)return null;let s={type:`Feature`,geometry:o,properties:Object.assign(Hn(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`description`]),Cr(e),Er(e,t),ur(e),Sr(e,n),wr(e),Tr(e),i.length?{coordinateProperties:{times:i.length===1?i[0]:i}}:{})};s.properties?.visibility!==void 0&&(s.properties.visibility=s.properties.visibility!==`0`);let c=e.getAttribute(`id`);return c!==null&&c!==``&&(s.id=c),s}function Br(e){let t=e.getAttribute(`id`),n=e.parentNode;return!t&&Un(n)&&n.localName===`CascadingStyle`&&(t=n.getAttribute(`kml:id`)||n.getAttribute(`id`)),Rn(t||``)}function Vr(e){let t={};for(let n of V(e,`Style`))t[Br(n)]=ur(n);for(let n of V(e,`StyleMap`)){let e=Rn(n.getAttribute(`id`)||``);Bn(n,`styleUrl`,n=>{n=Rn(n),t[n]&&(t[e]=t[n])})}return t}function Hr(e){let t={};for(let n of V(e,`SimpleField`))t[n.getAttribute(`name`)||``]=xr[n.getAttribute(`type`)||``]||xr.string;return t}function*Ur(e,t={skipNullGeometry:!1}){let n=e,r=Vr(n),i=Hr(n);for(let e of V(n,`Placemark`)){let n=zr(e,r,i,t);n&&(yield n)}for(let e of V(n,`GroundOverlay`)){let n=Mr(e,r,i,t);n&&(yield n)}for(let e of V(n,`NetworkLink`)){let n=Lr(e,r,i,t);n&&(yield n)}}function Wr(e,t={skipNullGeometry:!1}){return{type:`FeatureCollection`,features:Array.from(Ur(e,t))}}var Gr={bytes:20971520,positions:2e5},Kr=(e,t=Gr)=>e>t.bytes?{refused:`tooLarge`,size:e,limit:t.bytes}:null,qr=e=>new DOMParser().parseFromString(e,`application/xml`),Jr=e=>!e?.documentElement||e.getElementsByTagName(`parsererror`).length>0,Yr=e=>({type:`Feature`,...e.id!==void 0&&{id:e.id},properties:e.properties&&typeof e.properties==`object`?e.properties:{},geometry:e.geometry??null}),Xr=new Set([`Point`,`MultiPoint`,`LineString`,`MultiLineString`,`Polygon`,`MultiPolygon`,`GeometryCollection`]),Zr=e=>{let t;try{t=JSON.parse(e)}catch{return null}return t?.type===`FeatureCollection`&&Array.isArray(t.features)?{type:`FeatureCollection`,features:t.features.filter(e=>e?.type===`Feature`).map(Yr)}:t?.type===`Feature`?{type:`FeatureCollection`,features:[Yr(t)]}:Xr.has(t?.type)?{type:`FeatureCollection`,features:[Yr({geometry:t})]}:null},Qr=[`Style`,`StyleMap`,`styleUrl`],$r=e=>(Qr.forEach(t=>{Array.from(e.getElementsByTagName(t)).forEach(e=>e.parentNode?.removeChild(e))}),e),ei=e=>{let t=e.properties?.description;return t&&typeof t==`object`&&`value`in t?{...e,properties:{...e.properties,description:String(t.value??``)}}:e},ti=e=>({type:`FeatureCollection`,features:Wr($r(e),{skipNullGeometry:!0}).features.map(ei).map(Yr)}),ni=e=>({type:`FeatureCollection`,features:tr(e).features.map(Yr)}),ri=(e,t)=>{let n;try{n=t(e)}catch{return null}if(Jr(n))return null;let r=n.documentElement.localName??n.documentElement.nodeName;return r===`kml`?{format:`kml`,collection:ti(n)}:r===`gpx`?{format:`gpx`,collection:ni(n)}:null},ii=e=>{let[t,n]=e;return!Number.isFinite(t)||!Number.isFinite(n)?`unreadable`:Math.abs(t)>180||Math.abs(n)>90?`notDegrees`:null},ai=(e,t=``)=>{let n=new Uint8Array(e,0,Math.min(4,e.byteLength));return n[0]===80&&n[1]===75&&(n[2]===3&&n[3]===4||n[2]===5&&n[3]===6)?`zip`:n[0]===0&&n[1]===0&&n[2]===39&&n[3]===10?`shp`:/\.(dbf|shx|prj|cpg)$/i.test(t)?`part`:`text`},oi=({format:e,collection:t},n)=>{let r=t.features.map(e=>({feature:e,positions:we(e.geometry)})).filter(({positions:e})=>e.length>0);if(r.length===0)return{refused:`empty`};let i=r.reduce((e,t)=>e+t.positions.length,0);if(i>n.positions)return{refused:`tooManyPoints`,count:i,limit:n.positions};for(let e of r)for(let t of e.positions){let e=ii(t);if(e)return{refused:e}}return{format:e,collection:{type:`FeatureCollection`,features:r.map(({feature:e})=>e)},positions:i}},si=(e,{parse:t=qr,limits:n=Gr}={})=>{let r=String(e??``).replace(/^﻿/,``).trimStart(),i=null;try{if(r.startsWith(`{`)){let e=Zr(r);i=e&&{format:`geojson`,collection:e}}else r.startsWith(`<`)&&(i=ri(r,t))}catch(e){console.warn(`perun-atlas: a file could not be read`,e),i=null}return i?oi(i,n):{refused:`unreadable`}},ci=e=>{let t=new Set(e.flatMap(({collection:e})=>e.features.flatMap(e=>Object.keys(e?.properties??{})))),n=`layer`;for(let e=2;t.has(n);e+=1)n=`layer_${e}`;return n},li=(e,{limits:t=Gr}={})=>{if(e.refused)return e;let n=e.layers.length>1?ci(e.layers):null,r=e.layers.flatMap(({name:e,collection:t})=>t.features.map(t=>{let r=Yr(t);return n?{...r,properties:{[n]:e,...r.properties}}:r})),i=e.layers.some(e=>e.assumed),a=oi({format:`shapefile`,collection:{type:`FeatureCollection`,features:r}},t);return a.refused===`notDegrees`&&i?{refused:`noPrj`}:a.refused?a:{...a,assumed:i}},ui=i({FILE_LIMITS:()=>Gr,SYSTEM_FIELDS:()=>s,bboxIn:()=>je,bindPath:()=>b,crsFor:()=>ke,descriptorOf:()=>Xe,fetchGeometry:()=>Ye,fetchLayers:()=>st,fetchRows:()=>dt,fetchSchema:()=>mt,fetchUISchema:()=>ht,fileKind:()=>ai,fillBody:()=>Ft,firstOf:()=>ct,fromDegrees:()=>Pe,identifiersOf:()=>Dt,identityOf:()=>Ze,inDegrees:()=>Ne,latLngOf:()=>Me,mapPositions:()=>Ee,matchesIdentity:()=>Qe,pickFields:()=>gt,pointIn:()=>z,positionsOf:()=>we,postTo:()=>It,readFile:()=>si,readLayers:()=>li,ringIn:()=>ze,sizeRefusal:()=>Kr,spanTo:()=>Tt,toCSV:()=>Kt,toGeoJSON:()=>Rt,toKML:()=>en,toShapefile:()=>Ln,unitsPerMetre:()=>Fe,usableUI:()=>St,valueAt:()=>v,withGroups:()=>_t,withinCircle:()=>Et}),di=(e,t,n)=>n>t?(Math.min(Math.max(e,t),n)-t)/(n-t):0,fi=e=>e<=10?1:e<=20?2:5,pi=(e,t)=>{if(!Number.isFinite(e)||!Number.isFinite(t)||!(t>e))return[];let n=fi(t-e+1),r=[];for(let i=Math.ceil(e);i<=t;i+=1){let a=(i-e)%n===0;r.push({zoom:i,offset:di(i,e,t),labelled:i===e||i===t||a&&t-i>=n})}return r},mi=(e,t,n)=>!Number.isFinite(t)||!Number.isFinite(n)||!(n>t)?[]:(e??[]).filter(e=>Number.isFinite(e?.from)).map(e=>({mark:e,to:e.to??e.from})).filter(({mark:e,to:r})=>r>=t&&e.from<=n).map(({mark:e,to:r})=>{let i=di(e.from,t,n),a=di(Math.max(r,e.from),t,n);return{...e,from:Math.min(Math.max(e.from,t),n),to:Math.min(Math.max(r,t),n),offset:i,span:a-i}}),hi=.0254/96,gi=(e,t)=>!(e>0)||!(t>0)?null:e/t/hi,_i=e=>{if(!(e>0)||!Number.isFinite(e))return null;let t=10**(Math.floor(Math.log10(e))-1);return Math.round(e/t)*t},vi=e=>{let t=_i(e);return t===null?null:`1:${String(Math.max(Math.round(t),1)).replace(/\B(?=(\d{3})+(?!\d))/g,`\xA0`)}`},yi=[24,24],{createContext:bi,useContext:xi}=t.React,Si=bi(null),q=()=>xi(Si)??I.Map,{factory:Ci}=I,{useLayoutEffect:wi}=t.React,Ti=({credit:e})=>{let t=q();return wi(()=>{let n=Ci.control.attribution({prefix:!1}).addTo(t);return e&&n.addAttribution(e),()=>{n.remove()}},[t,e]),null};Ti.propTypes={credit:t.PropTypes.string};var Ei=e=>{let t=e?.getLatLngs?.()??[];return Array.isArray(t[0])?t[0]:t},Di=(e,t,n,r)=>{let i=Ei(t);if(e===`radius`){let e=t?.getRadius?.();return Number.isFinite(e)?`${r.asDistance(e)} · ${r.asArea(r.circleArea(e))}`:null}if(e===`angle`){let e=r.anglesAlong(i).filter(Number.isFinite);return e.length?e.map(r.asAngle).join(`, `):i.length===2?r.asBearing(r.bearing(i[0],i[1])):null}let a=e===`area`?r.area(i):r.distance(i);if(!Number.isFinite(a)||a===0)return null;n[e]+=a;let o=e===`area`?r.asArea:r.asDistance;return`${o(a)}   (Σ ${o(n[e])})`},Oi=(e,t)=>e!==void 0&&`geolocation`in e&&t?.isSecureContext!==!1,ki=e=>e===`unavailable`?`explain`:e===`found`||e===`outside`||e===`error`?`clear`:`locate`,Ai=(e,t,n)=>e?.[t]?t:n,{factory:ji}=I,{useEffect:Mi,useLayoutEffect:Ni,useState:Pi}=t.React,Fi=null,Ii=()=>(Fi||(Fi=ji.Control.extend({onAdd(){return this.options.container}})),Fi),Li=(e,t=!0)=>{let n=q(),[r]=Pi(()=>ji.DomUtil.create(`div`,`leaflet-control`));return Ni(()=>{if(!t)return;let i=new(Ii())({position:e,container:r}).addTo(n);return()=>{i.remove()}},[n,e,t,r]),r},Ri=({position:e,shown:n=!0,children:r})=>t.ReactDOM.createPortal(r,Li(e,n)),zi=({what:e})=>(Mi(()=>{console.warn(`perun-atlas: the engine on this environment has no ${e}; skipping it.`)},[e]),null),Bi=e=>{e&&(ji.DomEvent.disableClickPropagation(e),ji.DomEvent.disableScrollPropagation(e))},J=(e,n)=>t.redux.store.getState().intl?.messages?.[`perun.spatial.${e}`]||n;function Y(e){let t=document.createElement(`style`);t.textContent=e,document.head.insertBefore(t,document.head.firstChild)}Y(`/* ------------------- */
/* Coordinates control */
/* ------------------- */
/* Class names are set in components/controls/CoordinatesControl.jsx. The control is
   placed in a map corner, so it carries its own ground: a readout over tiles is
   unreadable without one, whatever the basemap happens to be.

   Moved here from spatial's assets with the control, rules unchanged. spatial
   bundles its own copy until a 6.0 removes its React parts, and appends it to
   the end of <head>, after this package's sheets and the deployment's, so until
   then that copy is the one that settles a tie. */
.coordinates-control {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 7px;
    background-color: rgba(255, 255, 255, 0.93);
    border: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 3px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
    font-size: 12px;
    line-height: 1.35;
    color: #212529;
    white-space: nowrap;
}

.coordinates-control__system {
    max-width: 14ch;
    padding: 1px 2px;
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 0;
    background: transparent;
    font: inherit;
    font-size: 11px;
    color: #495057;
    cursor: pointer;
}

.coordinates-control__system:focus {
    outline: none;
    border-bottom-color: #3399ff;
}

.coordinates-control__pair {
    display: inline-flex;
    gap: 8px;
}

.coordinates-control__field {
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
    margin: 0;
}

.coordinates-control__axis {
    font-size: 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6c757d;
}

/* Tabular figures, because this is read while it changes: proportional digits
   make the whole string shift sideways as the pointer moves. */
.coordinates-control__value {
    width: 13ch;
    padding: 1px 2px;
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 0;
    background: transparent;
    font-family: monospace;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: inherit;
}

.coordinates-control__value:focus {
    outline: none;
    border-bottom-color: #3399ff;
}

.coordinates-control__value[aria-invalid='true'] {
    color: #b02a37;
    border-bottom-color: #b02a37;
}

.coordinates-control__copy {
    padding: 1px 4px;
    border: none;
    border-radius: 2px;
    background: transparent;
    font-size: 13px;
    line-height: 1;
    color: #6c757d;
    cursor: pointer;
}

.coordinates-control__copy:hover {
    color: #212529;
    background-color: rgba(0, 0, 0, 0.06);
}

.coordinates-control__copy:focus-visible {
    outline: 2px solid #3399ff;
    outline-offset: 1px;
}

/* Above the control rather than below it, since the control itself usually sits
   at the bottom of the map and a message under it would be off the frame. */
.coordinates-control__rejected {
    position: absolute;
    bottom: calc(100% + 4px);
    left: 0;
    padding: 2px 6px;
    border-radius: 3px;
    background-color: #b02a37;
    color: #fff;
    font-size: 11px;
}
`);var{setting:Vi}=be,{util:Hi}=I,{readout:Ui}=Se,{useEffect:Wi,useMemo:Gi,useRef:Ki,useState:qi}=t.React,Ji={latitude:[`latitude`,`Lat`],longitude:[`longitude`,`Lng`],abscissa_x:[`abscissa_x`,`X`],ordinate_y:[`ordinate_y`,`Y`]},Yi=e=>{let t=e.getCRS();return{code:t?.code,label:t?.desc||t?.code,project:t=>e.transform(t),unproject:t=>e.untransform(t)}},Xi=e=>{try{return e.getCenter()}catch{return Vi(`center`)}},Zi=({position:e=`bottomcenter`,precision:n,systems:r})=>{let i=q();return typeof Ui?.resolve==`function`?t.React.createElement(Ri,{position:Ai(i._controlCorners,e,`bottomleft`)},t.React.createElement(Qi,{precision:n,systems:r})):t.React.createElement(zi,{what:`coordinate readout`})};Zi.propTypes={position:t.PropTypes.string,precision:t.PropTypes.number,systems:t.PropTypes.array};var Qi=({precision:e=5,systems:n})=>{let r=q(),[i,a]=qi(()=>Xi(r)),[o,s]=qi(null),[c,l]=qi(null),[u,d]=qi(!1),[f,p]=qi(!1),[m,h]=qi(()=>r.getCRS()?.code);Wi(()=>{let e=()=>h(r.getCRS()?.code);return r.on(`viewreset`,e),()=>r.off(`viewreset`,e)},[r]);let g=Gi(()=>Ui.resolve(n??Vi(`coordinateSystems`),Yi(r),e),[n,e,m,r]),_=g.find(e=>e.key===o)??g[0],v=Gi(()=>Hi.throttle(e=>a(e.latlng),100),[]);Wi(()=>{if(!c)return r.on(`mousemove`,v),()=>r.off(`mousemove`,v)},[c,v,r]);let y=Ki(null);Wi(()=>()=>clearTimeout(y.current),[]);let b=_?c??_.toText(i):[``,``],x=(e,t)=>{d(!1),l(b.map((n,r)=>r===e?t:n))},S=()=>{let e=_?.toLatLng(b);if(!e||!Ui.inside(e,Vi(`bounds`))){d(!0);return}d(!1),l(null),r.setView(e,r.getZoom())},C=e=>{e.key===`Enter`&&(e.preventDefault(),S()),e.key===`Escape`&&(l(null),d(!1),e.target.blur())};return _?t.React.createElement(`div`,{id:`coordinates-control`,className:`coordinates-control`,onBlur:e=>{e.currentTarget.contains(e.relatedTarget)||(l(null),d(!1))}},g.length>1&&t.React.createElement(`select`,{className:`coordinates-control__system`,value:_.key,onChange:e=>{s(e.target.value),l(null)},"aria-label":J(`coordinate_system`,`Coordinate system`)},g.map(e=>t.React.createElement(`option`,{key:e.key,value:e.key},e.label))),t.React.createElement(`div`,{className:`coordinates-control__pair`},b.map((e,n)=>{let[r,i]=Ji[_.axes[n]]??[``,``];return t.React.createElement(`label`,{className:`coordinates-control__field`,key:_.axes[n]},t.React.createElement(`span`,{className:`coordinates-control__axis`},J(r,i)),t.React.createElement(`input`,{type:`text`,className:`coordinates-control__value`,value:e,spellCheck:`false`,autoComplete:`off`,"aria-invalid":u||void 0,onChange:e=>x(n,e.target.value),onKeyDown:C,onFocus:e=>{l(b),e.target.select()}}))})),t.React.createElement(`button`,{type:`button`,className:`coordinates-control__copy`,onClick:()=>{let e=navigator.clipboard?.writeText?.(b.join(`, `));e&&e.then(()=>{p(!0),clearTimeout(y.current),y.current=setTimeout(()=>p(!1),1500)}).catch(()=>{})},title:J(`copy`,`Copy`),"aria-label":J(`copy`,`Copy`)},f?`✓`:`⧉`),u&&t.React.createElement(`div`,{className:`coordinates-control__rejected`,role:`status`},J(`outside_bounds`,`Outside this map`))):null};Qi.propTypes={precision:t.PropTypes.number,systems:t.PropTypes.array};var $i={plus:[`M12 5l0 14`,`M5 12l14 0`],minus:[`M5 12l14 0`],maximize:[`M4 8v-2a2 2 0 0 1 2 -2h2`,`M4 16v2a2 2 0 0 0 2 2h2`,`M16 4h2a2 2 0 0 1 2 2v2`,`M16 20h2a2 2 0 0 0 2 -2v-2`],minimize:[`M15 19v-2a2 2 0 0 1 2 -2h2`,`M15 5v2a2 2 0 0 0 2 2h2`,`M5 15h2a2 2 0 0 1 2 2v2`,`M5 9h2a2 2 0 0 0 2 -2v-2`],"zoom-scan":[`M4 8v-2a2 2 0 0 1 2 -2h2`,`M4 16v2a2 2 0 0 0 2 2h2`,`M16 4h2a2 2 0 0 1 2 2v2`,`M16 20h2a2 2 0 0 0 2 -2v-2`,`M8 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0`,`M16 16l-2.5 -2.5`]},ea=1.75,ta=(e,t={})=>{let n=$i[e];if(!n)return``;let{className:r=`atlas-icon atlas-icon--${e}`,size:i=18,stroke:a=ea}=t;return`<svg xmlns="http://www.w3.org/2000/svg" class="${r}" width="${i}" height="${i}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${a}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">`+n.map(e=>`<path d="${e}"/>`).join(``)+`</svg>`},{factory:na}=I,{useLayoutEffect:ra}=t.React,ia=({position:e=`topleft`})=>{let t=q();return ra(()=>{if(!na.control.fullscreen)return;let n=na.control.fullscreen({position:e,content:ta(`maximize`)+ta(`minimize`)}).addTo(t);return()=>{n._toggleState&&t.off(`enterFullscreen exitFullscreen`,n._toggleState,n),n.remove()}},[t,e]),null};ia.propTypes={position:t.PropTypes.string};var{layerControl:aa}=xe,{useLayoutEffect:oa}=t.React,sa=({basemap:e,overlays:t})=>{let n=q();return oa(()=>{let r=aa(e,t,{collapsed:!0}).addTo(n);return()=>{n.off(`click`,r.collapse,r),r.remove()}},[n,e,t]),null};sa.propTypes={basemap:t.PropTypes.object,overlays:t.PropTypes.object},Y(`/* -------------- */
/* Locate control */
/* -------------- */
/* Class names are set in components/controls/LocateControl.jsx. Sized to match the zoom
   and measure controls it stacks with in a map corner.

   No margin. Leaflet's stylesheet, which is where a control's offset from its
   corner normally comes from, is not shipped here, so the zoom and fullscreen
   buttons sit flush against the map's edge and against each other. This joins
   that column rather than floating beside it: one continuous bar of buttons,
   all the same size, is a toolbar, while the same buttons spaced apart read as
   several unrelated controls that happen to be stacked.

   Moved here from spatial's assets with the control, rules unchanged. spatial
   bundles its own copy until a 6.0 removes its React parts, and appends it to
   the end of <head>, after this package's sheets and the deployment's, so until
   then that copy is the one that settles a tie. */
.locate-control {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
}

/* Size, ground, hover and the rest come from \`.leaflet-bar button\` in
   toolbar.css, which is what the zoom and fullscreen buttons above this one
   are drawn with. Only what is this control's own is here. */
.locate-control__button:focus-visible {
    outline: 2px solid #3399ff;
    outline-offset: -2px;
}

/* Located, and the mark is on the map. Pressing again clears it, which is why
   this reads as a toggle rather than as a colour for its own sake. */
/* \`:hover\` stated too, for the same reason as the measure control's armed tool:
   \`.leaflet-bar button:hover\` sets a colour and outranks a lone state class. */
.locate-control__button.is-found,
.locate-control__button.is-found:hover {
    color: #1a73e8;
}

/* Several seconds outdoors on a tablet, so it has to look like it is working. */
.locate-control__button.is-busy,
.locate-control__button.is-busy:hover {
    color: #1a73e8;
    animation: locate-control-pulse 1.1s ease-in-out infinite;
}

@keyframes locate-control-pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.35; }
}

@media (prefers-reduced-motion: reduce) {
    .locate-control__button.is-busy { animation: none; }
}

/* The icon comes from perun-core's lazy Tabler chunk, so it may be absent for a
   moment or for good. This shows only when it is the button's sole child. */
.locate-control__fallback {
    display: none;
    font-size: 15px;
    line-height: 1;
}

.locate-control__fallback:only-child {
    display: block;
}

/* Beside the button rather than under it: this control sits in a top corner and
   a message below would be over the map rather than clear of it. */
.locate-control__message {
    position: absolute;
    top: 0;
    left: calc(100% + 6px);
    padding: 4px 8px;
    border-radius: 3px;
    background-color: rgba(33, 37, 41, 0.92);
    color: #fff;
    font-size: 11.5px;
    line-height: 1.35;
    white-space: nowrap;
    pointer-events: none;
}
`);var{setting:ca}=be,{factory:la}=I,{readout:ua}=Se,{useCallback:da,useEffect:fa,useRef:pa,useState:ma}=t.React,{Icon:ha}=t.elements,ga=()=>Oi(typeof navigator>`u`?void 0:navigator,typeof window>`u`?void 0:window),_a=({position:e=`topleft`,maxZoom:n})=>typeof ua?.inside==`function`?t.React.createElement(Ri,{position:e},t.React.createElement(va,{maxZoom:n})):t.React.createElement(zi,{what:`locate control`});_a.propTypes={position:t.PropTypes.string,maxZoom:t.PropTypes.number};var va=({maxZoom:e=16})=>{let n=q(),[r,i]=ma(ga()?`idle`:`unavailable`),[a,o]=ma(null),s=pa(null);fa(()=>{let e=la.layerGroup().addTo(n);return s.current=e,()=>{n.stopLocate(),e.clearLayers(),n.removeLayer(e),s.current=null}},[n]);let c=da(()=>{s.current?.clearLayers(),o(null),i(ga()?`idle`:`unavailable`)},[]);fa(()=>{let t=t=>{let r=s.current;if(r){if(r.clearLayers(),la.circleMarker(t.latlng,{radius:5,weight:2,color:`#1a73e8`,fillColor:`#1a73e8`,fillOpacity:1}).addTo(r),Number.isFinite(t.accuracy)&&t.accuracy>0&&la.circle(t.latlng,{radius:t.accuracy,weight:1,color:`#1a73e8`,fillColor:`#1a73e8`,fillOpacity:.12}).addTo(r),ua.inside(t.latlng,ca(`bounds`))){n.setView(t.latlng,Math.min(e,n.getMaxZoom())),i(`found`),o(null);return}i(`outside`),o(J(`outside_bounds`,`You are outside this map`))}},r=e=>{i(`error`),o(J(`geolocation_failed`,`Could not find your position`)+(e?.message?` — ${e.message}`:``))};return n.on(`locationfound`,t),n.on(`locationerror`,r),()=>{n.off(`locationfound`,t),n.off(`locationerror`,r)}},[n,e]);let l=()=>{let e=ki(r);if(e===`explain`){o(J(`geolocation_insecure`,`Your position is only available over https`));return}if(e===`clear`){c();return}i(`locating`),o(null),n.locate({setView:!1,enableHighAccuracy:!0,timeout:1e4})},u=r===`unavailable`||r===`error`?`IconCurrentLocationOff`:`IconCurrentLocation`;return t.React.createElement(`div`,{className:`locate-control`},t.React.createElement(`div`,{className:`leaflet-bar`},t.React.createElement(`button`,{type:`button`,className:`locate-control__button${r===`locating`?` is-busy`:``}${r===`found`?` is-found`:``}`,onClick:l,title:J(`geolocation`,`Show my position`),"aria-label":J(`geolocation`,`Show my position`),"aria-busy":r===`locating`||void 0},t.React.createElement(ha,{name:u,size:18,stroke:1.75,"aria-hidden":`true`}),t.React.createElement(`span`,{className:`locate-control__fallback`,"aria-hidden":`true`},`◎`))),a&&t.React.createElement(`div`,{className:`locate-control__message`,role:`status`},a))};va.propTypes={maxZoom:t.PropTypes.number},Y(`/* --------------- */
/* Measure control */
/* --------------- */
/* Class names are set in components/controls/MeasureControl.jsx. The control sits in a
   map corner under the zoom buttons, so it carries its own ground: a readout
   over tiles is unreadable without one, whatever the basemap happens to be.
   Kept apart from measurement.css, which styles the older toolbar's dialog and
   is scoped to #measure-dialog.

   No margin. Leaflet's stylesheet, which is where a control's offset from its
   corner normally comes from, is not shipped here, so the zoom and fullscreen
   buttons sit flush against the map's edge and against each other. This joins
   that column rather than floating beside it: one continuous bar of buttons,
   all the same size, is a toolbar, while the same buttons spaced apart read as
   several unrelated controls that happen to be stacked.

   Moved here from spatial's assets with the control, rules unchanged. spatial
   bundles its own copy until a 6.0 removes its React parts, and appends it to
   the end of <head>, after this package's sheets and the deployment's, so until
   then that copy is the one that settles a tie. */
.measure-control {
    display: inline-flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
    font-size: 12px;
    line-height: 1.35;
    color: #212529;
}

/* The buttons are \`.leaflet-bar button\` -- size, ground, hover and the rest are
   in toolbar.css, drawn the same as the zoom and fullscreen buttons this stacks
   under. This carries only the laying out: across rather than down, which is
   what makes a row of tools out of a bar meant for a column of them. */
.measure-control__tools {
    display: inline-flex;
    align-items: stretch;
}

.measure-control__toggle:focus-visible,
.measure-control__tool:focus-visible {
    outline: 2px solid #3399ff;
    outline-offset: -2px;
}

/* The armed tool. A border rather than a fill, so the icon inside keeps the
   same contrast it has at rest -- these glyphs are strokes, and a solid
   background under one makes it the hardest button to read of the five. */
/* Also stated for \`:hover\`, which is \`.leaflet-bar button:hover\` here and
   outranks a single state class -- without it the armed tool loses its mark
   under the pointer, which is the moment it most needs to keep it. */
.measure-control__tool.is-active,
.measure-control__tool.is-active:hover {
    background-color: #fff3cd;
    box-shadow: inset 0 0 0 2px #ffc400;
    color: #212529;
}

/* The icon is loaded from perun-core's lazy Tabler chunk, so a button may have
   nothing in it for a moment -- or for good, if the chunk never arrives. The
   one-character mark beside the icon covers that: it shows only when it is the
   button's sole child, which is exactly the case where the icon rendered
   nothing. When the icon is there, the mark is not. */
.measure-control__fallback {
    display: none;
    font-family: monospace;
    font-size: 13px;
    font-weight: 600;
    line-height: 1;
}

.measure-control__fallback:only-child {
    display: block;
}

.measure-control__divider {
    width: 1px;
    margin: 4px 0;
    background-color: rgba(0, 0, 0, 0.18);
}

/* Two classes, to outweigh the \`font: inherit\` a bar button is reset with. */
.measure-control__tool.measure-control__close {
    font-size: 17px;
}

/* Tabular figures, because these are read as a column and compared: proportional
   digits make each row start in a different place. */
.measure-control__readout {
    margin: 0;
    padding: 5px 8px;
    min-width: 140px;
    background-color: rgba(255, 255, 255, 0.93);
    border: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 3px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
    font-variant-numeric: tabular-nums;
}

.measure-control__line {
    display: flex;
    align-items: baseline;
    gap: 8px;
    white-space: nowrap;
}

.measure-control__line + .measure-control__line {
    margin-top: 2px;
    padding-top: 2px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
}

/* The newest reading is the one being taken; the two under it are there to
   compare against, and say so by being quieter. */
.measure-control__line + .measure-control__line dt,
.measure-control__line + .measure-control__line dd {
    color: #868e96;
}

.measure-control__line dt {
    flex: 0 0 auto;
    margin: 0;
    font-size: 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6c757d;
    font-weight: normal;
}

.measure-control__line dd {
    flex: 1 1 auto;
    margin: 0;
    font-family: monospace;
    text-align: right;
}
`);var{MEASURE_AREA:ya,MEASURE_RADIUS:ba,MEAUSURE_LENGTH:xa}=be,{factory:Sa}=I,{measure:Ca}=Se,{useCallback:wa,useEffect:Ta,useMemo:Ea,useRef:Da,useState:Oa}=t.React,{Icon:ka}=t.elements,Aa={measure:`M`,length:`L`,area:`A`,radius:`R`,angle:`∠`,erase:`⌫`},ja=({icon:e,mark:n})=>t.React.createElement(t.React.Fragment,null,t.React.createElement(ka,{name:e,size:18,stroke:1.75,"aria-hidden":`true`}),t.React.createElement(`span`,{className:`measure-control__fallback`,"aria-hidden":`true`},n));ja.propTypes={icon:t.PropTypes.string.isRequired,mark:t.PropTypes.string};var X={length:{shape:`line`,options:xa,icon:`IconRuler2`,fallback:`Length`},area:{shape:`polygon`,options:ya,icon:`IconPolygon`,fallback:`Area`},radius:{shape:`circle`,options:ba,icon:`IconCircleDot`,fallback:`Radius`},angle:{shape:`line`,options:xa,icon:`IconAngle`,fallback:`Angle`}},Ma=({position:e=`topleft`,tools:n,expanded:r})=>typeof Ca?.anglesAlong==`function`&&Se.draw?t.React.createElement(Ri,{position:e},t.React.createElement(Na,{tools:n,expanded:r})):t.React.createElement(zi,{what:`measurement control`});Ma.propTypes={position:t.PropTypes.string,tools:t.PropTypes.array,expanded:t.PropTypes.bool};var Na=({tools:e=[`length`,`area`,`radius`,`angle`],expanded:n=!1})=>{let r=q(),i=Ea(()=>r.draw??Se.draw,[r]),[a,o]=Oa(n),[s,c]=Oa(null),[l,u]=Oa([]),d=Ea(()=>e.filter(e=>X[e]),[e]),f=Da(null);Ta(()=>{let e=Sa.layerGroup().addTo(r);return f.current=e,()=>{e.clearLayers(),r.removeLayer(e),f.current=null}},[r]);let p=Da({length:0,area:0}),m=s?X[s]:null,h=wa(()=>{Object.values(X).forEach(({shape:e})=>i[e]?.disable(`force`)),c(null)},[i]);Ta(()=>{if(!m)return;let e=e=>{let t=e?.layer;if(!t)return;f.current?.addLayer(t);let n=Di(s,t,p.current,Ca);n&&u(e=>[{tool:s,reading:n,at:Date.now()},...e].slice(0,3)),i[X[s].shape]?.isEnabled?.()||c(null)};return r.on(`new_shape`,e),()=>r.off(`new_shape`,e)},[m,s,r,i]),Ta(()=>h,[h]);let g=e=>{if(s===e){h();return}h(),c(e),i[X[e].shape]?.enable(X[e].options)},_=()=>{h(),f.current?.clearLayers(),p.current={length:0,area:0},u([])};return d.length?a?t.React.createElement(`div`,{className:`measure-control`},t.React.createElement(`div`,{className:`measure-control__tools leaflet-bar`,role:`group`,"aria-label":J(`measure`,`Measure`)},d.map(e=>t.React.createElement(`button`,{key:e,type:`button`,className:`measure-control__tool${s===e?` is-active`:``}`,onClick:()=>g(e),title:J(e,X[e].fallback),"aria-label":J(e,X[e].fallback),"aria-pressed":s===e},t.React.createElement(ja,{icon:X[e].icon,mark:Aa[e]}))),t.React.createElement(`span`,{className:`measure-control__divider`,"aria-hidden":`true`}),t.React.createElement(`button`,{type:`button`,className:`measure-control__tool`,onClick:_,title:J(`erase`,`Clear`),"aria-label":J(`erase`,`Clear`)},t.React.createElement(ja,{icon:`IconEraser`,mark:Aa.erase})),t.React.createElement(`button`,{type:`button`,className:`measure-control__tool measure-control__close`,onClick:()=>{_(),o(!1)},title:J(`cancel`,`Close`),"aria-label":J(`cancel`,`Close`),"aria-expanded":`true`},`×`)),l.length>0&&t.React.createElement(`dl`,{className:`measure-control__readout`,"aria-live":`polite`},l.map(({tool:e,reading:n,at:r})=>t.React.createElement(`div`,{className:`measure-control__line`,key:r},t.React.createElement(`dt`,null,J(e,X[e].fallback)),t.React.createElement(`dd`,null,n))))):t.React.createElement(`div`,{className:`measure-control measure-control--closed`},t.React.createElement(`div`,{className:`leaflet-bar`},t.React.createElement(`button`,{type:`button`,className:`measure-control__toggle`,onClick:()=>o(!0),title:J(`measure`,`Measure`),"aria-label":J(`measure`,`Measure`),"aria-expanded":`false`},t.React.createElement(ja,{icon:`IconRulerMeasure`,mark:Aa.measure})))):null};Na.propTypes={tools:t.PropTypes.array,expanded:t.PropTypes.bool};var{factory:Pa}=I,{useLayoutEffect:Fa}=t.React,Ia=140,La=({position:e=`bottomleft`,units:t,ratio:n=!0})=>{let r=q();return Fa(()=>{let i=t!==`imperial`,a=Pa.control.scale({position:e,metric:i,imperial:!i,maxWidth:Ia}).addTo(r);if(!n)return()=>{a.remove()};let o=Pa.DomUtil.create(`div`,`atlas-scale-ratio`,a.getContainer()),s=()=>{let e=r.getSize(),t=Math.round(e.y/2),n=Math.min(e.x,Ia),i=r.distance(r.containerPointToLatLng(Pa.point(0,t)),r.containerPointToLatLng(Pa.point(n,t)));o.textContent=vi(gi(i,n))??``};return r.on(`move zoomend`,s),s(),()=>{r.off(`move zoomend`,s),a.remove()}},[r,e,t,n]),null};La.propTypes={position:t.PropTypes.string,units:t.PropTypes.string,ratio:t.PropTypes.bool},Y(`/*
 * The zoom rail's structure, and nothing about its look.
 *
 * Same division as legend.css: what makes this a readable ladder rather than a
 * pile of absolutely positioned spans ships here, because a deployment serving
 * no stylesheet of its own must still get a working control. Colours and type
 * come from the panel's tokens, so a screen described entirely in a menu row
 * gets a rail that matches its accent.
 *
 * It places nothing. The rail is a Leaflet control, so its corner and its
 * stacking come from the map's own chrome.
 *
 * One length governs the whole thing. Every rung, every mark and the handle are
 * positioned as a percentage of it, so a deployment retunes the control by
 * setting \`--atlas-zoom-length\` and nothing else has to agree.
 */

.atlas-zoom {
  --atlas-zoom-length: 168px;
  /* Where the track sits across the control's width, and how wide it is. The
     numbers occupy everything to the left of it. */
  --atlas-zoom-axis: 22px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  /* Its own offset from the corner. Leaflet's stylesheet is where a control's
     margin normally comes from and spatial does not ship it, so every control
     in a corner carries one -- the legend and the measure control do the same. */
  margin: 10px;
  padding: 3px;
  /* Opaque, because it sits over tiles and every part of it is a position being
     read against a scale. */
  background: var(--ap-surface, #ffffff);
  border: 1px solid var(--ap-rule, rgba(0, 0, 0, 0.2));
  border-radius: var(--ap-radius, 3px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
  color: var(--ap-ink, #212529);
}

/*
 * The two buttons.
 *
 * 26 pixels, because that is what spatial's \`toolbar.css\` gives every other
 * button on this map and a control in the same corner that does not match them
 * reads as something else's chrome that wandered in. Centred as a grid for the
 * reason that file gives: what goes in one of these is an icon, not a character
 * on a baseline.
 *
 * Said rather than inherited: a deployment's bare \`button\` rules reach into this
 * package and win everything a class does not claim. \`frontend/style/README.md\`
 * has the case that taught us.
 */
.atlas-zoom__step {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: var(--ap-radius, 3px);
  background: transparent;
  color: inherit;
  font: 600 16px/1 system-ui, sans-serif;
  text-indent: 0;
  cursor: pointer;
}

/*
 * The same box again, where spatial's \`navigation.css\` would take it away.
 *
 * \`.control-bottomright button:not(.disabled)\` makes every button in that
 * corner absolute, padded, bordered and round -- written for spatial's own
 * navigation buttons, and it reaches every button anyone else puts there. The
 * bottom right is where the rail sits by default, so without this the \`+\`, the
 * \`-\` and the fit button all pile up at the top of the rail, under the slider,
 * which then takes their clicks. One class more specific than that rule, and
 * only its four properties, so everything else stays with the rule above.
 */
.control-bottomright .atlas-zoom .atlas-zoom__step {
  position: static;
  padding: 0;
  border: none;
  border-radius: var(--ap-radius, 3px);
}

.atlas-zoom__step:hover:not(:disabled) {
  background: var(--ap-rule, rgba(0, 0, 0, 0.08));
}

.atlas-zoom__step:disabled {
  color: var(--ap-muted, #6c757d);
  opacity: 0.45;
  cursor: default;
}

/*
 * The button that frames the data, set a little apart from the \`+\` under it.
 * It moves the view to the set rather than one level in, and a reader skimming
 * the rail should not take it for a third step. A shadow rather than a border,
 * so the rule costs no height and the button stays the 26 pixels its
 * neighbours are.
 */
.atlas-zoom__fit {
  margin-bottom: 3px;
  box-shadow: 0 1px 0 var(--ap-rule, rgba(0, 0, 0, 0.12));
}

.atlas-zoom__step:focus-visible {
  outline: 2px solid var(--ap-accent, #3399ff);
  outline-offset: -2px;
}

.atlas-zoom__rail {
  position: relative;
  width: 36px;
  height: var(--atlas-zoom-length);
  margin: 4px 0;
}

/* The axis the levels are read against. */
.atlas-zoom__track {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--atlas-zoom-axis) - 2px);
  width: 4px;
  border-radius: 2px;
  background: var(--ap-rule, #d8dde3);
}

/*
 * A threshold, drawn over the track.
 *
 * \`min-height\` is what makes a line and a band the same element: a mark with no
 * end has a span of zero, and zero percent of the rail is nothing to see.
 */
.atlas-zoom__mark {
  position: absolute;
  left: calc(var(--atlas-zoom-axis) - 4px);
  width: 8px;
  min-height: 2px;
  border-radius: 2px;
  background: var(--ap-muted, #6c757d);
}

/*
 * Above here the basemap is enlarged rather than sharper. Hatched rather than
 * filled: the map still works up there, it just stops gaining detail, and a
 * solid block reads as a part of the range that has been taken away.
 *
 * Lifted above the other marks. A screen's own bands are drawn after this one
 * -- \`AtlasMap\` puts what it knows first and the screen's after -- and a band
 * reaching the top of the range would otherwise bury the ceiling underneath it.
 * Of the two, the ceiling is the one nobody configured and nobody expects.
 */
.atlas-zoom__mark--upscaled {
  z-index: 1;
  background: repeating-linear-gradient(
    -45deg,
    var(--ap-muted, #6c757d) 0 1px,
    transparent 1px 4px
  );
  border: 1px solid var(--ap-rule, #d8dde3);
  border-radius: 2px;
}

/* A zoom band a screen declared -- where its labels open, where its rows change. */
.atlas-zoom__mark--labels {
  background: var(--ap-accent, #4a6a85);
  opacity: 0.35;
}

.atlas-zoom__rung {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
}

.atlas-zoom__rung::after {
  content: '';
  position: absolute;
  left: calc(var(--atlas-zoom-axis) + 4px);
  width: 5px;
  height: 1px;
  background: var(--ap-rule, #d8dde3);
}

.atlas-zoom__rung--numbered::after {
  width: 9px;
  background: var(--ap-muted, #6c757d);
}

/*
 * The number beside a rung.
 *
 * Positioned off the rung rather than flowed, so the type can change size
 * without moving the level it names. \`tabular-nums\` keeps a two-digit column
 * from stepping sideways at ten.
 */
.atlas-zoom__number {
  position: absolute;
  bottom: -6px;
  left: 0;
  width: calc(var(--atlas-zoom-axis) - 9px);
  font: 500 9px/12px system-ui, sans-serif;
  font-style: normal;
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: var(--ap-muted, #6c757d);
}

.atlas-zoom__rung--here .atlas-zoom__number {
  color: var(--ap-accent, #4a6a85);
  font-weight: 700;
}

/*
 * The native control, turned on its side.
 *
 * A rotation rather than one of the three vertical spellings -- see ZoomRail.jsx
 * for why. It is laid out horizontally at the rail's own length, then centred on
 * the axis and turned, so its travel is exactly the rail's travel and the two
 * cannot drift apart.
 *
 * The track is transparent because the rail underneath already draws one, with
 * the marks on it. Only the handle is the slider's own.
 */
.atlas-zoom__slider {
  position: absolute;
  top: 50%;
  left: var(--atlas-zoom-axis);
  width: var(--atlas-zoom-length);
  height: 24px;
  margin: 0;
  padding: 0;
  transform: translate(-50%, -50%) rotate(-90deg);
  background: transparent;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.atlas-zoom__slider::-webkit-slider-runnable-track {
  height: 24px;
  background: transparent;
  border: none;
}

.atlas-zoom__slider::-moz-range-track {
  height: 24px;
  background: transparent;
  border: none;
}

.atlas-zoom__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 8px;
  height: 14px;
  margin-top: 5px;
  border: 1px solid var(--ap-rule, #adb5bd);
  border-radius: 2px;
  background: var(--ap-surface, #ffffff);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.atlas-zoom__slider::-moz-range-thumb {
  width: 8px;
  height: 14px;
  border: 1px solid var(--ap-rule, #adb5bd);
  border-radius: 2px;
  background: var(--ap-surface, #ffffff);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.atlas-zoom__slider:focus-visible {
  outline: 2px solid var(--ap-accent, #3399ff);
  outline-offset: 1px;
}

/*
 * What the marks say, for a reader who cannot see where they are.
 *
 * Clipped rather than hidden: \`display: none\` and \`visibility: hidden\` both take
 * it out of the accessibility tree, which is the one place it exists to be.
 */
.atlas-zoom__described {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.atlas-zoom__level {
  display: block;
  min-width: 26px;
  padding: 1px 0 0;
  font: 600 10px/13px system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
  text-align: center;
  color: var(--ap-muted, #6c757d);
}

/*
 * A short window gets a short rail.
 *
 * The viewport rather than the container, which is the wrong question -- a map
 * in a modal can be short inside a tall window -- but it is the question CSS can
 * answer here, and it catches the case that actually happens: the whole screen
 * is small. The control degrades to its buttons by itself when even this does
 * not fit, because the rail is the only part with a height.
 */
@media (max-height: 640px) {
  .atlas-zoom {
    --atlas-zoom-length: 104px;
  }
}
`);var{useEffect:Ra,useMemo:za,useState:Ba}=t.React,Va={in:`Zoom in`,out:`Zoom out`,level:`Zoom level`,upscaled:`Above here the basemap is enlarged, not sharper`,fit:`Zoom to the data`},Ha=0,Ua=e=>`${(e*100).toFixed(4)}%`,Wa=({name:e})=>t.React.createElement(`svg`,{className:`atlas-icon atlas-icon--${e}`,width:18,height:18,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:ea,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,focusable:`false`},$i[e].map(e=>t.React.createElement(`path`,{key:e,d:e})));Wa.propTypes={name:t.PropTypes.oneOf(Object.keys($i)).isRequired};var Ga=({position:e=`bottomright`,marks:n=[],labels:r,onFit:i})=>{let a={...Va,...r},o=q(),[s]=Ba(()=>(Ha+=1,`atlas-zoom-marks-${Ha}`)),[c,l]=Ba(()=>({min:o.getMinZoom(),max:o.getMaxZoom()})),[u,d]=Ba(()=>o.getZoom());Ra(()=>{let e=()=>d(o.getZoom()),t=()=>{l({min:o.getMinZoom(),max:o.getMaxZoom()}),e()};return o.on(`zoomend`,e),o.on(`zoomlevelschange`,t),t(),()=>{o.off(`zoomend`,e),o.off(`zoomlevelschange`,t)}},[o]);let{min:f,max:p}=c,m=za(()=>pi(f,p),[f,p]),h=za(()=>mi(n,f,p),[n,f,p]),g=Math.round(u),_=h.filter(e=>e.label).map(e=>e.label).join(`. `),v=t.React.createElement(`div`,{className:`atlas-zoom`},i&&t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step atlas-zoom__fit`,onClick:i,title:a.fit,"aria-label":a.fit},t.React.createElement(Wa,{name:`zoom-scan`})),t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step`,onClick:()=>o.zoomIn(),disabled:g>=p,title:a.in,"aria-label":a.in},t.React.createElement(Wa,{name:`plus`})),m.length>1&&t.React.createElement(`div`,{className:`atlas-zoom__rail`},t.React.createElement(`div`,{className:`atlas-zoom__track`}),h.map(e=>t.React.createElement(`span`,{key:`${e.kind??`mark`}-${e.from}-${e.to}`,className:`atlas-zoom__mark atlas-zoom__mark--${e.kind??`plain`}`,style:{bottom:Ua(e.offset),height:Ua(e.span)},title:e.label})),m.map(e=>t.React.createElement(`span`,{key:e.zoom,className:[`atlas-zoom__rung`,e.labelled?`atlas-zoom__rung--numbered`:``,e.zoom===g?`atlas-zoom__rung--here`:``].filter(Boolean).join(` `),style:{bottom:Ua(e.offset)}},e.labelled?t.React.createElement(`i`,{className:`atlas-zoom__number`},e.zoom):null)),t.React.createElement(`input`,{type:`range`,className:`atlas-zoom__slider`,min:f,max:p,step:1,value:Math.min(Math.max(g,f),p),onChange:e=>o.setZoom(Number(e.target.value)),"aria-label":a.level,"aria-describedby":_?s:void 0}),_?t.React.createElement(`p`,{className:`atlas-zoom__described`,id:s},_):null),t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step`,onClick:()=>o.zoomOut(),disabled:g<=f,title:a.out,"aria-label":a.out},t.React.createElement(Wa,{name:`minus`})),t.React.createElement(`output`,{className:`atlas-zoom__level`,title:a.level},g));return t.React.createElement(Ri,{position:e},t.React.createElement(`div`,{className:`atlas-zoom__host`,ref:Bi},v))};Ga.propTypes={position:t.PropTypes.string,marks:t.PropTypes.array,labels:t.PropTypes.object,onFit:t.PropTypes.func};var{factory:Ka}=I,{useEffect:qa,useLayoutEffect:Ja,useRef:Ya}=t.React,Xa=({position:e=`bottomright`,fit:t=!0,extent:n=null,labels:r})=>{let i=q(),a=r?.fit??Va.fit,o=Ya(n);o.current=n;let s=Ya(null);return Ja(()=>{let n=Ka.control.zoom({position:e,zoomInText:ta(`plus`),zoomOutText:ta(`minus`)}).addTo(i);if(t){let e=n.getContainer(),t=Ka.DomUtil.create(`a`,`atlas-fit`);t.href=`#`,t.title=a,t.setAttribute(`role`,`button`),t.setAttribute(`aria-label`,a),t.innerHTML=ta(`zoom-scan`),t.style.display=o.current?``:`none`,Ka.DomEvent.disableClickPropagation(t),Ka.DomEvent.on(t,`click`,Ka.DomEvent.stop),Ka.DomEvent.on(t,`click`,()=>{o.current&&i.fitBounds(o.current,{padding:yi})}),e.insertBefore(t,e.firstChild),s.current=t}return()=>{n.remove(),s.current=null}},[i,e,t,a]),qa(()=>{s.current&&(s.current.style.display=n?``:`none`)},[n]),null};Xa.propTypes={position:t.PropTypes.string,fit:t.PropTypes.bool,extent:t.PropTypes.array,labels:t.PropTypes.object},Y(`/*
 * Controls, made clickable.
 *
 * Leaflet's stylesheet is a pair: the corner containers take
 * \`pointer-events: none\` so a drag can begin anywhere across them, and
 * \`.leaflet-control\` takes \`auto\` back so the controls themselves still
 * receive clicks.
 *
 * spatial replaces those corners with its own frame — \`control-center\` >
 * \`control-map\` > \`control-topright\` — and carries the first half of the pair
 * but not the second. Every control it places in a map corner therefore arrives
 * inert, and deployments have been restoring it one screen at a time with
 * \`!important\` rules keyed to a container id.
 *
 * Restore the missing half here, once, for anything that draws through this
 * package. The durable fix is the same declaration in spatial's own
 * control.css, after which this file can go.
 */
.leaflet-control {
  pointer-events: auto;
}

/*
 * Controls in a shared corner, sized to themselves.
 *
 * The other half of the same omission. Leaflet floats every control, which
 * shrink-wraps it; spatial does not ship that stylesheet, so a control in one
 * of its corners is an ordinary block and stretches to the corner's width. One
 * control per corner hides it -- the corner is shrink-to-fit, so the two agree.
 * Two do not: the narrower grows to the width of the wider, which is a
 * collapsed layer switcher as wide as the legend beneath it.
 *
 * Keyed to spatial's corners rather than Leaflet's \`.leaflet-top\` and
 * \`.leaflet-right\`. Those classes are never on anything here -- \`_initControlPos\`
 * builds \`control-topright\` and the rest -- which is exactly why the rules in
 * Leaflet's own stylesheet are not doing this already.
 *
 * On the right, keep each control against the edge as well: one narrower than
 * its neighbour would otherwise sit at the far side of a container that is only
 * that wide because of the neighbour.
 *
 * Duplicated in spatial's control.css, where it belongs and where it is now.
 * This copy covers deployments whose engine has not caught up yet, and can go
 * with the rest of this file once they have.
 */
.control-topleft > .leaflet-control,
.control-topright > .leaflet-control,
.control-bottomleft > .leaflet-control,
.control-bottomright > .leaflet-control,
.control-bottomcenter > .leaflet-control {
  width: fit-content;
}

.control-topright > .leaflet-control,
.control-bottomright > .leaflet-control {
  margin-left: auto;
}

/*
 * The scale bar's ratio line.
 *
 * Not a control. It is a div inside the scale control's own container, which is
 * what keeps it with the bar it restates -- see \`AtlasMap\` -- so it needs no
 * placement and takes the corner, the margin and the lifetime of its host.
 *
 * Styled to match what spatial's \`attribution.css\` gives the bar above it: the
 * same eleven pixels, the same ink, the same translucent ground. Said rather
 * than inherited, because the bar's own rules are keyed to
 * \`.leaflet-control-scale-line\` and none of them reaches a sibling.
 *
 * \`tabular-nums\` because the digits change under the reader's eye as the map
 * moves, and a denominator whose width changes with its value reads as movement
 * of its own.
 */
.atlas-scale-ratio {
  padding: 1px 5px 0;
  font: 11px/1.3 system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
  color: #333;
  background: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  text-indent: 0;
}

/* Nothing to say yet -- before the first measurement, and wherever a ratio
   cannot be computed -- takes no room rather than a blank strip. */
.atlas-scale-ratio:empty {
  display: none;
}

/*
 * The glyph in a Leaflet button.
 *
 * Three buttons on this map are Leaflet's rather than this package's -- the two
 * zoom buttons and the fullscreen toggle -- and all three now hold a Tabler
 * icon instead of a character or a sprite, so that the corner they share with
 * spatial's locate and measure controls reads as one instrument. The fit button
 * above the \`+\` is this package's, built the way Leaflet builds the other two,
 * so it takes the same rule. \`lib/icons.js\` says why the icons are transcribed
 * rather than taken from \`elements.Icon\`.
 *
 * Centred as a grid, which is what spatial's \`toolbar.css\` already does for the
 * bar's \`button\` elements and for the same reason it gives there: what goes in
 * one of these is an icon, not a character on a baseline, so there is no
 * line-height to centre it with.
 *
 * Both classes on purpose. \`.leaflet-bar a\` in spatial's toolbar.css sets
 * \`display: block\` and \`.leaflet-control-zoom-in\` in its zoom.css sets a
 * monospace face and a one-pixel indent for the character that used to be here;
 * a lone class selector loses to the first of those whatever the source order,
 * which is the same arithmetic spatial's own fullscreen rules had to do.
 */
.leaflet-bar a.leaflet-control-zoom-in,
.leaflet-bar a.leaflet-control-zoom-out,
.leaflet-bar a.leaflet-control-zoom-fullscreen,
.leaflet-bar a.atlas-fit {
  display: grid;
  place-items: center;
  line-height: 1;
  text-indent: 0;
}

.atlas-icon {
  display: block;
}

/*
 * One button, two glyphs, one of them showing.
 *
 * The fullscreen plugin writes the button's contents once and then only toggles
 * \`leaflet-fullscreen-on\`, so the state has to be drawn rather than rebuilt --
 * which is what its two-frame sprite was doing, done here in a form that can
 * say which frame is which.
 */
.leaflet-bar a.leaflet-control-zoom-fullscreen .atlas-icon--minimize,
.leaflet-bar a.leaflet-control-zoom-fullscreen.leaflet-fullscreen-on .atlas-icon--maximize {
  display: none;
}

.leaflet-bar a.leaflet-control-zoom-fullscreen.leaflet-fullscreen-on .atlas-icon--minimize {
  display: block;
}
`);var{Map:Z}=I,{useEffect:Za,useMemo:Qa,useRef:$a,useState:eo}=t.React,to=!1,no=new Set;Z.eachLayer(e=>no.add(e));var ro=()=>{let e=[];Z.eachLayer(t=>{no.has(t)||e.push(t)}),e.forEach(e=>Z.removeLayer(e))},io=({session:e,overrides:n,layerSwitcher:r=!1,zoomControl:i=!0,zoomPosition:a=`bottomright`,zoomMarks:o,zoomLabels:s,fit:c=!0,extent:l=null,view:u=null,coordinates:d=!0,coordinatesPosition:f=`bottomcenter`,measure:p=!0,measurePosition:m=`topleft`,measureTools:h,fullscreen:g=!0,fullscreenPosition:_=`topleft`,locate:v=!0,locatePosition:y=`topleft`,scale:b=!0,scalePosition:x=`bottomleft`,scaleRatio:S=!0,className:C=`atlas-map`,style:ee,onReady:te,onError:w,children:T})=>{let E=$a(null),D=$a(null),O=$a(null),[k,ne]=eo(null),[A,j]=eo(null),M=A!==null,[re,N]=eo(null),[ie,P]=eo(null);Za(()=>{let t=!1;if(to){let e=Error(`perun-atlas: a map is already mounted. spatial provides one instance per page until 2.0 introduces createMap; render at most one AtlasMap at a time.`);N(e),w?.(e);return}return to=!0,(async()=>{try{let r=await _e(n);if(t)return;Z.setView(r.center,r.zoom,{animate:!1}),Ge(r);let i=Z.getContainer();D.current={height:i.style.height,width:i.style.width},i.style.height=`100%`,i.style.width=`100%`,E.current?.appendChild(i),ro(),Z.setMinZoom(r.minZoom).setMaxZoom(r.maxZoom),Z.setView(u?.center??r.center,u?.zoom??r.zoom,{animate:!1}),ne({map:Z,config:r});let{basemap:a,overlays:o}=await st(e,{maxZoom:r.maxZoom});if(t)return;let s=lt(a,u?.basemap)??ct(a);s&&s.addTo(Z);let c=e=>P(e?.options?.maxNativeZoom??null);c(s);let l=e=>c(e.layer);Z.on(`baselayerchange`,l),O.current=()=>Z.off(`baselayerchange`,l),Z.invalidateSize(),te?.({map:Z,config:r,basemap:a,overlays:o}),j({basemap:a,overlays:o})}catch(e){if(t)return;console.error(e),N(e),w?.(e)}})(),()=>{t=!0,to=!1,O.current?.(),O.current=null,ro();let e=Z.getContainer();e&&D.current&&(e.style.height=D.current.height,e.style.width=D.current.width,D.current=null),e?.parentNode&&e.parentNode.removeChild(e)}},[]),Za(()=>{let e=E.current;if(!e||typeof ResizeObserver>`u`)return;let t=null,n=new ResizeObserver(e=>{let n=e[0]?.contentRect;n&&n.width!==0&&n.height!==0&&(t!==null&&cancelAnimationFrame(t),t=requestAnimationFrame(()=>{t=null,Z.invalidateSize()}))});return n.observe(e),()=>{t!==null&&cancelAnimationFrame(t),n.disconnect()}},[M]);let F=Qa(()=>[...ie===null?[]:[{from:ie,to:1/0,kind:`upscaled`,label:s?.upscaled??Va.upscaled}],...o??[]],[ie,o,s]);if(re)return t.React.createElement(`div`,{className:`${C} atlas-map-error`,role:`alert`},re.message);let ae=k?.config;return t.React.createElement(Si.Provider,{value:k?.map??null},t.React.createElement(`div`,{ref:E,className:C,style:{height:`100%`,...ee}}),k&&t.React.createElement(t.React.Fragment,null,g&&t.React.createElement(ia,{position:_}),v&&t.React.createElement(_a,{position:y}),t.React.createElement(Ti,{credit:ae.attribution}),i&&i!==`rail`&&t.React.createElement(Xa,{position:a,fit:c,extent:l,labels:s}),b&&t.React.createElement(La,{position:x,units:ae.units,ratio:S}),d&&t.React.createElement(Zi,{position:f}),p&&t.React.createElement(Ma,{position:m,tools:h})),M&&r&&t.React.createElement(sa,{basemap:A.basemap,overlays:A.overlays}),M&&i===`rail`&&t.React.createElement(Ga,{position:a,marks:F,labels:s,onFit:c&&l?()=>k.map.fitBounds(l,{padding:yi}):void 0}),M&&T)},{useEffect:ao,useRef:oo}=t.React,so=e=>{let t=oo(e);t.current=e;let n=oo(null);return ao(()=>{n.current?.(e)},[JSON.stringify(e)]),{hiddenRef:t,filterRef:n}},co=(e,t)=>{e&&t&&Object.entries(t).forEach(([t,n])=>{t.startsWith(`--`)?e.style.setProperty(t,n):e.style[t]=n})},lo=e=>e instanceof Node?e:document.createTextNode(String(e)),uo=(e,t,n)=>{let r=n.startsWith(`text/csv`)?`﻿`:``,i=URL.createObjectURL(new Blob([r,t],{type:n})),a=document.createElement(`a`);a.href=i,a.download=e,a.style.display=`none`,document.body.appendChild(a),a.click(),a.remove(),setTimeout(()=>URL.revokeObjectURL(i),0)},fo=async(e,t=document.body)=>{if(window.isSecureContext&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{}let n=document.createElement(`textarea`);n.value=e,n.setAttribute(`readonly`,``),n.setAttribute(`aria-hidden`,`true`),Object.assign(n.style,{position:`fixed`,top:`0`,left:`0`,opacity:`0`}),t.appendChild(n),n.select();let r=!1;try{r=document.execCommand(`copy`)}catch{r=!1}return n.remove(),r},po=(e,t=[])=>{let n=new Set(t),r=[],i=[];return e.forEach(e=>{let t=n.has(e.key);t!==!!e.hidden&&(e.hidden=t,(t?r:i).push(e))}),{leaving:r,returning:i}},mo=(e,t)=>{let n=e.filter(({hidden:e})=>!e);n.forEach(({layer:e})=>e.bringToFront?.()),n.forEach(({layer:e})=>t?.get(e)?.bringToFront?.())},ho=(e,t=[],n)=>{let r=e?.features;if(!Array.isArray(r)||!t.length)return e;let i=new Set(t),a=r.filter(e=>!i.has(n(e)));return a.length===r.length?e:{...e,features:a}},go=e=>{let t=e.filter(e=>!e.hidden),n=1/0,r=1/0,i=-1/0,a=-1/0,o=({lat:e,lng:t})=>{n=Math.min(n,e),r=Math.min(r,t),i=Math.max(i,e),a=Math.max(a,t)};return(t.length?t:e).forEach(({layer:e})=>{if(typeof e.getBounds==`function`){let t=e.getBounds();t?.isValid?.()&&(o(t.getSouthWest()),o(t.getNorthEast()))}else typeof e.getLatLng==`function`&&o(e.getLatLng())}),n===1/0?null:[[n,r],[i,a]]},_o=({title:e,rows:t},n={})=>{let r=document.createElement(`div`);if(r.className=[`atlas-popup`,n.className].filter(Boolean).join(` `),co(r,n.style),e){let t=document.createElement(`p`);t.className=`atlas-popup-title`,t.textContent=e,co(t,n.titleStyle),r.appendChild(t)}if(t.length){let e=document.createElement(`dl`);e.className=`atlas-popup-fields`,t.forEach(({label:t,value:r})=>{let i=document.createElement(`dt`);i.textContent=t,co(i,n.labelStyle);let a=document.createElement(`dd`);a.textContent=r,co(a,n.valueStyle),e.append(i,a)}),r.appendChild(e)}return r},vo=(e,t,{popup:n,labelResolver:r}={})=>{if(n){let t=n(e);return t==null?null:lo(t)}let i=h(t,e,r);return i?_o(i,t?.popup):null},yo={className:`atlas-popup-shell`,maxWidth:280},{Map:Q,factory:bo}=I,{useEffect:xo,useRef:So}=t.React,Co=[],wo=({servicePath:e,context:t,reload:n,srid:r,statusRows:i,join:a,field:o,palette:s,fallback:c,descriptor:u,hidden:d=Co,onFeatureClick:f,onLegend:p,onShown:m,onLoadStart:h,onLoad:_,onError:v,tooltip:y,popup:b,labelResolver:x})=>{let S=So(null),C=So(0),{hiddenRef:ee,filterRef:te}=so(d);return xo(()=>{let n=!1,d=M({field:o,palette:s,fallback:c}),w=N({field:o,palette:s}),T=async()=>{let c=++C.current;D={zoom:Q.getZoom(),bounds:Q.getBounds()};try{h?.();let v=await Ye(e,{...t||{},map:{...t?.map||{},bbox:je(r)}});if(n||c!==C.current)return;let T=a&&i?ie(v,i,a):v;S.current&&Q.removeLayer(S.current);let E=[],D=bo.geoJSON(T,{style:e=>l(u,{fillColor:d(e)}),onEachFeature:(e,t)=>{E.push({layer:t,feature:e,key:w(e),hidden:!1});let n=y?.(e);n&&t.bindTooltip(lo(n),{sticky:!0});let r=vo(e,u,{popup:b,labelResolver:x});r&&t.bindPopup(r,yo),f&&t.on(`click`,()=>f(e,g(u,e,x)))}}),O=e=>{let{leaving:t,returning:n}=po(E,e);return t.forEach(({layer:e})=>D.removeLayer(e)),n.forEach(({layer:e})=>D.addLayer(e)),n.length&&mo(E),t.length>0||n.length>0};O(ee.current),S.current=D.addTo(Q);let k=e=>m?.(ho(T,e,w));te.current=e=>{O(e)&&k(e)},p?.(re(T?.features,{field:o,palette:s})),k(ee.current),_?.(T)}catch(e){console.error(`perun-atlas: choropleth failed to render`,e),!n&&c===C.current&&v?.(e)}},E=null,D=null,O=()=>!!D&&Q.getZoom()===D.zoom&&D.bounds.contains(Q.getBounds()),k=()=>{clearTimeout(E),E=setTimeout(()=>{O()||T()},250)};return T(),Q.on(`moveend`,k),()=>{n=!0,te.current=null,clearTimeout(E),Q.off(`moveend`,k),S.current&&(Q.removeLayer(S.current),S.current=null)}},[e,o,r,n,i,JSON.stringify(t??{})]),null};Y(`/*
 * Drawing a shape, and the controls that go with it.
 *
 * Structure only, like the rest of this package's stylesheets: a deployment's
 * own sheet is later in the cascade and decides the colours. Everything here
 * that has a colour takes it from the panel's tokens, so a screen described
 * entirely in a menu row still gets handles that match its accent.
 */

.atlas-panel__draw {
  /* Its own row in the toolbar rather than another item in it: the shape's
     controls belong together, and the save button has to sit at the end of the
     row it belongs to rather than at the end of whatever else the toolbar
     happens to be carrying. The button that arms the map is not here -- it is in
     the panel's actions, with the file buttons -- so this row exists only while
     there is something to put in it. */
  flex-basis: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/*
 * What to click, while the map is armed and nothing is drawn yet.
 *
 * The instruction the button used to carry. Here it is a sentence in a row
 * instead of a sentence in a button, which is the difference between text that
 * reflows a toolbar and text that reads.
 */
.atlas-panel__drawhint {
  flex-basis: 100%;
  margin: 0;
  font: var(--ap-label-font, 500 11px/1.4 system-ui, sans-serif);
  color: var(--ap-muted, #6b6f7a);
}

/*
 * A field: a word, and a box holding the control it names.
 *
 * The border and the ground belong to the box rather than to the input,
 * because the radius is a number and a unit and those are one measurement. On
 * the input, the border stopped after the number and left \`m\` outside it --
 * a fourth loose item in a row of four, where the row actually holds two
 * fields. Inside, the number is the thing being edited and the unit is the
 * thing it is measured in, which is what they are.
 *
 * Focus moves to the box with it. \`:focus-within\` draws the ring the input
 * used to draw and the input's own outline is suppressed, so a keyboard reader
 * gets one ring around the control rather than one inside it.
 */
.atlas-panel__drawfield {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  /* Said, not inherited. These registries serve a bare
     \`label { display: block; margin-bottom: 3px; padding-left: 15px;
     text-indent: -15px }\` for their forms, and a deployment's sheet is later
     in the cascade than this package's. The class wins the display, but the
     rest went on applying -- and \`text-indent\` inherits, so it reached the
     unit inside the field and pulled \`m\` fifteen pixels left, over the number
     it measures, taking the span's width to nothing on the way: a flex base
     size of \`max-content - 15px\` clamps at zero.
     These two labels are the package's own and are not part of that form
     convention, so they say what they are. */
  margin: 0;
  padding: 0;
  text-indent: 0;
  font: var(--ap-label-font, 500 11px/1.4 system-ui, sans-serif);
  color: var(--ap-muted, #6b6f7a);
  letter-spacing: 0.02em;
}

.atlas-panel__drawbox {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  padding: 5px 8px;
  border: 1px solid var(--ap-rule, #d8dde3);
  border-radius: var(--ap-radius, 8px);
  background: var(--ap-surface, #ffffff);
}

.atlas-panel__drawbox:focus-within {
  outline: 2px solid var(--ap-accent, #4a6a85);
  outline-offset: 1px;
}

/* Disabled is drawn here because there is nothing left on the input to draw
   it on -- see \`box\` in DrawBar. */
.atlas-panel__drawbox--off {
  opacity: 0.55;
}

.atlas-panel__drawbox input {
  width: 4.5em;
  padding: 0;
  border: 0;
  background: none;
  color: var(--ap-ink, #14161a);
  font: var(--ap-value-font, 500 12px/1.4 system-ui, sans-serif);
  font-variant-numeric: tabular-nums;
  /* Against the unit, so the two read as one measurement however many digits
     the reader dragged their way to. */
  text-align: end;
}

.atlas-panel__drawbox input:focus,
.atlas-panel__drawbox input:focus-visible {
  outline: none;
}

/*
 * No steppers.
 *
 * They sit where the unit now is, they are the one control in this row a
 * deployment's stylesheet cannot reach, and at a step of 100 they move a
 * radius the reader dragged to 6663 in jumps that lose it. Arrow keys still
 * step by \`step\`, so a keyboard keeps everything the arrows offered.
 */
.atlas-panel__drawbox input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.atlas-panel__drawbox input::-webkit-outer-spin-button,
.atlas-panel__drawbox input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.atlas-panel__drawunit {
  color: var(--ap-muted, #6b6f7a);
  font: var(--ap-label-font, 500 11px/1.4 system-ui, sans-serif);
}

/*
 * The note, which is a sentence and takes what is left of the row.
 *
 * A fixed width was wrong in both directions: too narrow to read a sentence
 * back on a wide panel, and wide enough to push the buttons onto their own
 * line on a narrow one. Growing from a floor does both jobs, and it is the
 * floor rather than the width that decides when the row wraps.
 */
.atlas-panel__drawfield--wide {
  flex: 1 1 18em;
  min-width: 12em;
}

.atlas-panel__drawfield--wide .atlas-panel__drawbox {
  flex: 1;
}

.atlas-panel__drawfield--wide input {
  width: 100%;
  text-align: start;
  font-variant-numeric: normal;
}

/*
 * The fields a row described, as one item in this row.
 *
 * What lays them along the row rather than down it is in \`form.css\`, shared
 * with the date filter because both are RJSF and both were getting it wrong the
 * same way. This is the box's own behaviour in the row, and under it what only
 * this form needs.
 *
 * \`0 1 auto\`, not \`1 1 auto\`: a form that grows takes the whole line and puts
 * the radius, the count and the buttons on lines of their own -- and inside it,
 * a group stretched to the full width is a group per line. Sized to its content
 * it is what it is, another control in a row of them, and it wraps as a whole
 * when the row runs out. \`min-width: 0\` so it still gives room back when the
 * row wraps -- without the zero minimum a flex item refuses to shrink below its
 * content and a long field pushes the actions off the end.
 */
.atlas-panel__drawform {
  flex: 0 1 auto;
  min-width: 0;
}

.atlas-panel__drawform .rjsf {
  margin: 0;
}

/*
 * A group is a box around fields, and a row of controls has no room for boxes.
 *
 * RJSF wraps each grouppath in a \`div.form-group.field-object\` holding a
 * fieldset, and that wrapper is a block: as a flex item it takes the whole line
 * whatever its fields measure, so two groups are two lines and three are three
 * -- which is the entire reason the fields beside a shape were stacking while
 * every one of them would have fitted across.
 *
 * \`display: contents\` takes the wrapper's own box away and leaves its children
 * in the row, so a field is an item of this row no matter how deep the schema
 * put it. The fieldset inside goes the same way for the same reason.
 *
 * It costs the fieldset's grouping, which is a fair trade only because the
 * titles are hidden -- see \`form.css\`: a fieldset with no legend has no accessible name to
 * lose, and every field keeps its own label.
 */
.atlas-panel__drawform .rjsf fieldset .form-group.field-object,
.atlas-panel__drawform .rjsf fieldset fieldset {
  display: contents;
}

/*
 * A field's own label.
 *
 * These registries ship \`label { display: block; margin-bottom: 3px;
 * padding-left: 15px; text-indent: -15px }\` for their forms, and a form built
 * from a table's schema is exactly the markup that rule was written for -- it
 * simply arrived somewhere else. At the record-form size a label is 16px over a
 * 37px control, which is right on a page and is three times the height of the
 * row it is in here.
 *
 * This and the rules under it name the draw row alone. The date filter is the
 * other form on this panel and it is older than all of them: a deployment has
 * had it to style since it shipped, and \`atlas-panel.css\` styles it -- so a
 * default written now would either lose to that or, worse, win by a property
 * the deployment happened not to name. What both forms share is in
 * \`form.css\`: the fieldset that flows them along the row, and the legend.
 */
.atlas-panel__drawform .rjsf label {
  display: block;
  margin: 0 0 2px;
  padding: 0;
  text-indent: 0;
  font: var(--ap-label-font, 500 11px/1.4 system-ui, sans-serif);
  color: var(--ap-muted, #6b6f7a);
}

/*
 * The controls, drawn as the row's own are.
 *
 * The same border, radius, ground and 12px value font as
 * \`.atlas-panel__drawbox\` -- from the same tokens, so a deployment restyling
 * the panel restyles these with it. A field that arrived from a schema should
 * not be a different-looking control from the radius beside it.
 */
.atlas-panel__drawform .rjsf input,
.atlas-panel__drawform .rjsf select,
.atlas-panel__drawform .rjsf textarea {
  height: auto;
  /* A form control is 100% of its field on a page, where a field is a column.
     Here a field is as wide as what it holds. */
  width: auto;
  max-width: 100%;
  padding: 5px 8px;
  border: 1px solid var(--ap-rule, #d8dde3);
  border-radius: var(--ap-radius, 8px);
  background: var(--ap-surface, #ffffff);
  color: var(--ap-ink, #14161a);
  font: var(--ap-value-font, 500 12px/1.4 system-ui, sans-serif);
  box-shadow: none;
}

.atlas-panel__drawform .rjsf input:focus,
.atlas-panel__drawform .rjsf select:focus,
.atlas-panel__drawform .rjsf textarea:focus {
  outline: 2px solid var(--ap-accent, #4a6a85);
  outline-offset: 1px;
}

/*
 * One edge of a box this package draws, painted green by the app's form sheet.
 *
 * \`.form-control { border-bottom: 1px solid #385a38 !important }\` is the
 * underline these registries give a record form's inputs, and RJSF puts
 * \`form-control\` on every control it renders -- so the box above arrives with
 * three grey sides and a green one, beside a radius field that has four.
 *
 * \`!important\` is the only thing that reaches a declaration carrying it, and
 * this is the narrowest place to spend it: the fields beside a drawn shape, and
 * not the date filter, which a deployment styles for itself and whose inputs
 * this should keep its hands off.
 */
.atlas-panel__drawform .rjsf input,
.atlas-panel__drawform .rjsf select,
.atlas-panel__drawform .rjsf textarea {
  border-bottom: 1px solid var(--ap-rule, #d8dde3) !important;
}

/* Two lines to start with, and the reader's to drag. A text area sized for a
   record form is most of this row's height before anything is typed in it. */
.atlas-panel__drawform .rjsf textarea {
  min-height: 2.6em;
  resize: vertical;
}

/* A field is a box, not a table box. Some of these deployments lay a form group
   out as one, which shrink-wraps to its widest line and makes a field as wide
   as the longest error message under it. Said for the draw row only: the date
   filter has been laid out by these sheets for as long as it has existed, and
   this is not the change to start moving it with. */
.atlas-panel__drawform .rjsf .form-group {
  display: block;
}

/* What a field is refusing, under the field rather than beside it. Kept to the
   row's own size; the colour is the deployment's, as every other warning on
   this screen is. */
.atlas-panel__drawform .rjsf .error-detail {
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
  font: var(--ap-label-font, 500 11px/1.4 system-ui, sans-serif);
}

/*
 * What the shape covers.
 *
 * Beside the radius that decides it rather than under the map, because the two
 * are one control: the number being typed and the answer to typing it. It reads
 * as a count and a scale -- the caught figure carries the weight, the set it was
 * taken from sits behind it -- so that a reader sees \`12\` first and \`/ 340\` only
 * if they want to know what 12 is out of.
 *
 * \`tabular-nums\` because it changes under the reader's eye while a radius is
 * being typed, and digits that shift the width as they change read as movement
 * rather than as counting.
 */
.atlas-panel__drawcount {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  margin: 0;
  font: var(--ap-label-font, 500 11px/1.4 system-ui, sans-serif);
  font-variant-numeric: tabular-nums;
  color: var(--ap-muted, #6b6f7a);
}

.atlas-panel__drawcount b {
  font: var(--ap-value-font, 500 12px/1.4 system-ui, sans-serif);
  font-variant-numeric: tabular-nums;
  color: var(--ap-ink, #14161a);
}

.atlas-panel__drawtotal {
  color: var(--ap-muted, #6b6f7a);
  opacity: 0.8;
}

.atlas-panel__drawactions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-inline-start: auto;
}

/*
 * The handles.
 *
 * Small, because they sit on top of the thing being measured, and square for the
 * edge against round for the centre so the two are told apart at a glance
 * rather than by trying one.
 */
.atlas-draw-handle {
  background: var(--ap-surface, #ffffff);
  border: 2px solid var(--ap-accent, #b3261e);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  cursor: grab;
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
}

.atlas-draw-handle:active {
  cursor: grabbing;
}

.atlas-draw-handle--centre {
  border-radius: 50%;
}

.atlas-draw-handle--edge {
  border-radius: 2px;
}
`);var{Map:To,factory:Eo}=I,{useEffect:Do,useRef:Oo}=t.React,ko=(...e)=>e.forEach(e=>{e.current&&(To.removeLayer(e.current),e.current=null)}),Ao={color:`#b3261e`,weight:2,opacity:.95,fillColor:`#b3261e`,fillOpacity:.12},jo={...Ao,dashArray:`5 4`,fillOpacity:.06},Mo=({value:e,drawing:t=!1,onChange:n,onDrawn:r,style:i,editable:a=!0})=>{let o=Oo(null),s=Oo(null),c=Oo(null),l=Oo(n);l.current=n;let u=Oo(r);return u.current=r,Do(()=>{let e=Se?.draw?.circle;if(!t||!e){!t&&e?.isEnabled?.()&&e.disable(),t&&!e&&console.warn(`perun-atlas: the engine on this environment has no circle draw tool; skipping it.`);return}let n=({shape:e,layer:t})=>{if(e!==`circle`||!t)return;let n=t.getLatLng(),r=t.getRadius();To.removeLayer(t);let i={lat:n.lat,lng:n.lng,radius:r};l.current?.(i),u.current?.(i)};return To.on(`new_shape`,n),e.enable({templineStyle:jo,hintlineStyle:{...jo,fillOpacity:0},pathOptions:{...Ao,...i},cursorMarker:!0,tooltips:!1}),()=>{To.off(`new_shape`,n),e.isEnabled?.()&&e.disable()}},[t]),Do(()=>{if(!e||!(e.radius>0)){ko(o,s,c);return}let t=Eo.latLng({lat:e.lat,lng:e.lng});if(o.current?(o.current.setLatLng(t),o.current.setRadius(e.radius)):o.current=Eo.circle(t,{...Ao,...i,radius:e.radius,showMeasurements:!0,interactive:!1}).addTo(To),!a){ko(s,c);return}let n=Eo.latLng({lat:t.lat,lng:o.current.getBounds().getEast()});s.current?s.current.setLatLng(t):(s.current=Eo.marker(t,{icon:Eo.divIcon({className:`atlas-draw-handle atlas-draw-handle--centre`,html:``}),draggable:!0,zIndexOffset:1e3}).addTo(To),s.current.on(`drag`,e=>{let t=e.target.getLatLng();l.current?.({lat:t.lat,lng:t.lng,radius:o.current?.getRadius()})})),c.current?c.current.setLatLng(n):(c.current=Eo.marker(n,{icon:Eo.divIcon({className:`atlas-draw-handle atlas-draw-handle--edge`,html:``}),draggable:!0,zIndexOffset:1e3}).addTo(To),c.current.on(`drag`,e=>{let n=e.target.getLatLng(),r=s.current?.getLatLng()??t;l.current?.({lat:r.lat,lng:r.lng,radius:To.distance(r,n)})}))},[e?.lat,e?.lng,e?.radius,a]),Do(()=>()=>ko(o,s,c),[]),null};Y(`/*
 * The two RJSF forms on the panel -- the date filter above the map and the
 * fields beside a drawn shape -- and what they share.
 *
 * Imported by \`DateRange\` and by \`DrawBar\`, so either one rendered on its own
 * still lays its fields along a row. What only the draw row needs is in
 * \`draw.css\`; the date filter's widgets, labels and error text stay whatever
 * the deployment's form stylesheet makes them.
 */

/* The date filter's own spacing. */
.atlas-date-range .rjsf {
  margin-bottom: 8px;
}

/*
 * The two RJSF forms, laid along a row rather than down one.
 *
 * One rule about both rather than a copy beside each: the
 * date filter above the map and the fields beside a drawn shape are the same
 * kind of thing in the same kind of space, and a toolbar that flows one and
 * stacks the other reads as two unrelated controls.
 *
 * The flex container is the *fieldset*, and that is the whole of what this
 * fixes. RJSF builds a form as \`form.rjsf > div.form-group > fieldset >
 * (a form-group per field)\`, so \`.rjsf\` has exactly one child -- flexing it
 * lays out that single wrapper and changes nothing. The rule this replaces did
 * exactly that, which is why the date filter's From and To have been sitting one
 * above the other since they were written.
 *
 * A descendant selector rather than a child one, because a schema keyed by
 * grouppath nests: \`"a.b"\` holding an object is a fieldset of its own, and its
 * fields belong in the same row as everything else. What lets them get there is
 * the rule under this one.
 */
.atlas-date-range .rjsf fieldset,
.atlas-panel__drawform .rjsf fieldset {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 6px 12px;
  min-width: 0;
  margin: 0;
  padding: 0;
  /* The browser's default fieldset frame, which is a box drawn around fields
     that already sit in one. */
  border: 0;
}

/*
 * No titles on a toolbar.
 *
 * RJSF renders a schema's title as a \`<legend>\`, and so a form built from a
 * table brings one for the table and one for every grouppath in it. A legend is
 * also never a flex item: the browser takes a fieldset's first legend out of
 * flow and lays the rest of the children out in an anonymous box below it. So
 * each one costs a line of a row that has one -- to say "Basic Info" above two
 * fields that already say which dates they are.
 *
 * Hidden rather than styled small, because there is no size at which a section
 * heading belongs in a strip of controls. The fields keep their own labels,
 * which is what a reader needs and what a screen reader reads; what goes is the
 * heading over them, and with it anything a row writes in \`ui:title\`.
 */
.atlas-date-range .rjsf legend,
.atlas-panel__drawform .rjsf legend {
  display: none;
}

/* RJSF's per-field bottom margin: spacing for a stacked form, and a ragged
   baseline in a row. The gap above does that job here. */
.atlas-date-range .rjsf .form-group,
.atlas-panel__drawform .rjsf .form-group {
  margin-bottom: 0;
}
`);var{useMemo:No}=t.React,Po=({from:e,to:n,onChange:r,labels:i={},disabled:a=!1,className:o=`atlas-date-range`})=>{let s=No(()=>({type:`object`,properties:{from:{type:`string`,format:`date`,title:i.from??`From`},to:{type:`string`,format:`date`,title:i.to??`To`}}}),[i.from,i.to]),c=No(()=>({"ui:order":[`from`,`to`],"ui:submitButtonOptions":{norender:!0},from:{"ui:disabled":a},to:{"ui:disabled":a}}),[a]);return t.React.createElement(`div`,{className:o},t.React.createElement(t.Form,{idPrefix:`atlas-range`,schema:s,uiSchema:c,formData:{from:e,to:n},validator:t.validator,customValidate:(e,t)=>(e?.from&&e?.to&&e.from>e.to&&t.to.addError(i.invalidRange??`The end date is before the start date.`),t),liveValidate:!0,showErrorList:!1,noHtml5Validate:!0,onChange:({formData:e})=>r?.(e)},t.React.createElement(t.React.Fragment,null)))},{Icon:Fo}=t.elements,{useState:Io}=t.React,Lo=({drawing:e,busy:n,onStart:r,onCancel:i,labels:a={}})=>t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn ${e?`atlas-panel__btn--primary`:`atlas-panel__btn--ghost`}`,"aria-pressed":e,onClick:e?i:r,disabled:n},t.React.createElement(Fo,{name:`IconCircleDashed`,size:16,stroke:1.75,"aria-hidden":`true`}),a.draw??`Draw an area`),Ro=e=>`atlas-panel__drawbox${e?` atlas-panel__drawbox--off`:``}`,zo=0,Bo=()=>`atlas-draw-${zo+=1}`,Vo=({shape:e,drawing:n,busy:r,onCancel:i,onRadius:a,onSave:o,note:s,form:c,caught:l,savable:u=!0,limits:d={},labels:f={}})=>{let{min:p=50,max:m=5e5,step:h=50}=d,g=!!e,[_]=Io(Bo),v=`${_}-form`,y=!!c?.schema,b=r||!g||s?.required&&!String(s.value??``).trim()||!(!c||c.schema),x=()=>{!b&&u&&o?.()};return t.React.createElement(`div`,{className:`atlas-panel__draw`,role:`group`,"aria-label":f.draw??`Draw`},n&&!g&&t.React.createElement(`p`,{className:`atlas-panel__drawhint`},f.drawing??`Click a centre, then an edge`),g&&t.React.createElement(`label`,{className:`atlas-panel__drawfield`},t.React.createElement(`span`,null,f.radius??`Radius`),t.React.createElement(`span`,{className:Ro(r)},t.React.createElement(`input`,{type:`number`,inputMode:`numeric`,value:Math.round(e.radius),min:p,max:m,step:h,disabled:r,onChange:e=>{let t=Number(e.target.value);Number.isFinite(t)&&t>0&&a(t)}}),t.React.createElement(`span`,{className:`atlas-panel__drawunit`},f.metres??`m`))),g&&c&&!c.schema&&t.React.createElement(`p`,{className:`atlas-panel__drawhint`},c.loading?f.formLoading??`Loading the fields…`:f.formFailed??`These fields did not load, so there is nothing to save into.`),g&&c?.schema&&t.React.createElement(`div`,{className:`atlas-panel__drawform`},t.React.createElement(t.Form,{id:v,idPrefix:_,schema:c.schema,uiSchema:{"ui:submitButtonOptions":{norender:!0},...c.uiSchema},formData:c.data,validator:t.validator,disabled:r,liveValidate:!1,showErrorList:!1,onChange:({formData:e})=>c.onChange?.(e),onSubmit:x},t.React.createElement(t.React.Fragment,null))),g&&s&&t.React.createElement(`label`,{className:`atlas-panel__drawfield atlas-panel__drawfield--wide`},t.React.createElement(`span`,null,f.note??`Note`),t.React.createElement(`span`,{className:Ro(r)},t.React.createElement(`input`,{type:`text`,value:s.value??``,disabled:r,placeholder:f.notePlaceholder??``,onChange:e=>s.onChange(e.target.value)}))),g&&l&&t.React.createElement(`p`,{className:`atlas-panel__drawcount`,"aria-live":`polite`},t.React.createElement(`b`,null,l.count),t.React.createElement(`span`,null,f.caught??`inside`),t.React.createElement(`span`,{className:`atlas-panel__drawtotal`},`/ ${l.total}`)),g&&t.React.createElement(`div`,{className:`atlas-panel__drawactions`},u&&t.React.createElement(`button`,{type:y?`submit`:`button`,form:y?v:void 0,className:`atlas-panel__btn atlas-panel__btn--primary`,onClick:y?void 0:x,disabled:b},t.React.createElement(Fo,{name:`IconDeviceFloppy`,size:16,stroke:1.75,"aria-hidden":`true`}),f.save??`Save`),t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:i,disabled:r},f.discard??`Discard`)))},Ho=({lat:e,lng:t})=>`${e.toFixed(6)},${t.toFixed(6)}`,Uo=(e,t,n)=>{let r=e.original.map(e=>{let r=t[Ho(e)];if(!r)return e;let i=n(r);return i&&i!==r?i.getLatLng():e}),i=r.map(Ho).join(` `);return i===e.key?null:{next:r,key:i}},Wo=e=>e<.5?4*e*e*e:1-(-2*e+2)**3/2,Go=(e,t,n)=>t.map((t,r)=>{let i=e[r];return i?{lat:i.lat+(t.lat-i.lat)*n,lng:i.lng+(t.lng-i.lng)*n}:t}),Ko=e=>Array.isArray(e?.[0])?e.map(Ko).reverse():[...e??[]].reverse(),qo=({factory:e,group:t,into:n,arrowOf:r})=>{let i=new WeakMap;return t.eachLayer(t=>{let a=r(t.feature);if(!a||typeof t.getLatLngs!=`function`)return;let o=a.reverse?Ko(t.getLatLngs()):t;i.set(t,e.polylineDecorator(o,{patterns:[{offset:a.offset??`12%`,repeat:a.repeat??160,symbol:e.Symbol.arrowHead({pixelSize:a.pixelSize??12,polygon:!1,pathOptions:{stroke:!0,weight:2,color:t.options.color,opacity:1}})}]}).addTo(n))}),i},Jo=({map:e,surface:t,lines:n,markerAt:r,decoratorOf:i,glide:a})=>{let o=e=>t.getVisibleParent?.(e),s=(e,t)=>{e.layer.setLatLngs(t);let n=i?.get(e.layer);n&&n.setPaths(e.reverse?Ko(t):e.layer)},c=typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,l=null,u=[],d=()=>{l!==null&&cancelAnimationFrame(l),l=null,u=[]},f=e=>{d(),u=e;let t=e.map(({line:e})=>e.layer.getLatLngs()),n=performance.now(),r=i=>{let o=Math.min(1,(i-n)/a),c=Wo(o);e.forEach((e,n)=>s(e.line,Go(t[n],e.next,c))),o<1?l=requestAnimationFrame(r):(l=null,u=[],e.forEach(e=>s(e.line,e.next)))};l=requestAnimationFrame(r)},p=()=>{let e=[];if(n.forEach(t=>{let n=Uo(t,r,o);n&&(t.key=n.key,e.push({line:t,next:n.next}))}),!e.length)return;let t=new Set(e.map(({line:e})=>e)),i=[...u.filter(({line:e})=>!t.has(e)),...e];!a||c||i.length>150?(d(),i.forEach(e=>s(e.line,e.next))):f(i)};p(),t.on(`animationend`,p),e.on(`moveend`,p);let m=()=>{d(),t.off(`animationend`,p),e.off(`moveend`,p)};return m.reroute=p,m},Yo=(e,t,n,r)=>{let i=/Point$/.test(t.geometry?.type??``),a=(n.marker?.size??24)/2;return e.bindTooltip(lo(r),{permanent:!0,direction:n.label?.direction??(i?`top`:`center`),offset:n.label?.offset??(i?[0,-a]:[0,0]),className:[`atlas-label`,n.label?.className].filter(Boolean).join(` `),opacity:1}),n.label?.style&&e.on(`tooltipopen`,e=>co(e.tooltip.getElement(),n.label.style)),!!n.label?.scale},Xo=(e,t)=>{e.forEach(({layer:e,descriptor:n})=>{if(e._atlasHidden)return;let r=f(n,t);r!==e.isTooltipOpen()&&(r?e.openTooltip():e.closeTooltip())})},Zo=280,Qo={chunkedLoading:!0,showCoverageOnHover:!1,spiderfyDistanceMultiplier:2},$o=[{upTo:9,name:`sm`,size:32},{upTo:99,name:`md`,size:38},{upTo:1/0,name:`lg`,size:46}],es=e=>{if(!e)return null;if(e===!0)return{from:0,options:{...Qo},badge:{},glide:Zo};if(typeof e==`number`)return{from:e,options:{...Qo},badge:{},glide:Zo};let{from:t=0,className:n,style:r,glide:i=Zo,...a}=e;return{from:t,options:{...Qo,...a},badge:{className:n,style:r},glide:i===!0?Zo:i}},ts=(e,t={})=>{let n=$o.find(({upTo:t})=>e<=t)??$o[$o.length-1],r=document.createElement(`span`);return r.className=`atlas-cluster__count`,r.textContent=String(e),co(r,t.style),{element:r,size:n.size,className:[`atlas-cluster`,`atlas-cluster--${n.name}`,t.className].filter(Boolean).join(` `)}},ns=({map:e,factory:t,group:n,cluster:r,points:i})=>{let a=t.featureGroup().addTo(e),o=es(r),s=typeof t.markerClusterGroup==`function`;o!==null&&!s&&console.warn(`perun-atlas: clustering was configured, but the map engine on this deployment does not carry it`);let c=o!==null&&s&&i>=o.from,l=c?t.markerClusterGroup({...o.options,iconCreateFunction:e=>{let{element:n,size:r,className:i}=ts(e.getChildCount(),o.badge);return t.divIcon({html:n,className:i,iconSize:[r,r]})}}):n;if(l.addTo(e),c){let e=[];n.eachLayer(t=>{t._atlasPinned?e.push(t):l.addLayer(t)}),e.forEach(e=>a.addLayer(e))}let u=c?t.featureGroup().addTo(e):l,d=e=>c&&e._atlasPinned?a:l;return{surface:l,arrows:u,clustering:c,settings:o,layers:u===l?[l,a]:[l,u,a],move:(e,t,n)=>{let r=[];e.forEach(({layer:e})=>{e._atlasHidden=!t;let i=d(e);c&&i===l?r.push(e):t?i.addLayer(e):i.removeLayer(e);let a=n?.get(e);a&&t?u.addLayer(a):a&&u.removeLayer(a)}),r.length&&(t?l.addLayers(r):l.removeLayers(r))}}};Y(`/*
 * The one stylesheet this package ships.
 *
 * \`atlas-map\` and friends are left to the deployment's stylesheets, as the rest
 * of the front end is. These cannot be: a divIcon with no CSS has no size and no
 * background, so an unstyled marker is not plain, it is invisible. A package
 * whose job is that consumers do not reimplement the map should not ship a map
 * that renders nothing until someone edits a site stylesheet.
 *
 * Neutral on purpose. A descriptor names its own class when a screen wants its
 * own look, and these are single-class selectors, so anything loaded later wins.
 */

.atlas-marker {
  box-sizing: border-box;
  border-radius: 50%;
  background: #4a5c66;
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
}

/*
 * A cluster badge, on the same argument as the marker above: it is a divIcon, so
 * with no rules it is an invisible hole where a count should be.
 *
 * The chip is the span rather than the element around it. Leaflet builds that
 * element and gives it only the class and the size, so it is the child that can
 * be handed a colour by a menu row -- see \`clusterBadge\`. Sized from its parent
 * so the band's pixel size stays the one place a badge's size is decided.
 *
 * Deliberately the marker's own colour rather than a scale of its own. A cluster
 * is those markers, not a fourth kind of thing, and the count inside it is what
 * says how many. \`.atlas-cluster--sm\`, \`--md\` and \`--lg\` are there for a
 * deployment that disagrees.
 */
.atlas-cluster__count {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #4a5c66;
  border: 3px solid #fff;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
}

.leaflet-tooltip.atlas-label {
  padding: 2px 7px;
  border: 0;
  border-radius: 3px;
  background: #fff;
  color: #1f2a30;
  font-weight: 600;
  font-size: 12px;
  line-height: 1.35;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);

  /*
   * spatial draws every tooltip as white text inside a solid black outline,
   * which suits a label painted straight onto imagery and ruins one set in a
   * pill: at this size the outline closes up the counters of the letters and
   * the text reads as a dark smear. The pill is the legibility mechanism here,
   * so drop the outline rather than layer the two.
   */
  text-shadow: none;
}

.leaflet-tooltip.atlas-label::before {
  display: none;
}

/*
 * Popups.
 *
 * Leaflet supplies the frame — the wrapper, the tip, the close button — and these
 * style only what sits inside it. A deployment that restyles .leaflet-popup keeps
 * its own frame and keeps this layout, and one that wants neither overrides these
 * single-class selectors from a stylesheet loaded later.
 *
 * A definition list rather than a table: these are label/value pairs about one
 * feature, which is what a dl is, and it lets the grid line the values up without
 * either column being measured against the other rows of a table that is not
 * there.
 */
.atlas-popup {
  font-size: 12.5px;
  line-height: 1.45;
  color: #1f2a30;
}

.atlas-popup-title {
  margin: 0 0 6px;
  font-size: 13.5px;
  font-weight: 600;
}

.atlas-popup-fields {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 3px 14px;
  margin: 0;
}

.atlas-popup-fields dt {
  color: #5b6b73;
  font-weight: 400;
  /* The label is the narrow column, so it sets the grid's first track and should
     not be the thing that wraps; the value has the room. */
  white-space: nowrap;
}

.atlas-popup-fields dd {
  margin: 0;
  font-weight: 600;
  /* Identifiers and codes have no spaces to break at, and a popup is narrow. */
  overflow-wrap: anywhere;
}
`);var{Map:$,factory:rs}=I,{useEffect:is,useRef:as}=t.React,os=[],ss=({servicePath:e,context:t,reload:n,descriptors:r={},descriptorFor:i,cluster:a,fit:o=!0,tooltip:s,popup:c,labelResolver:u,pinned:d,hidden:f=os,onFeatureClick:m,onLegend:h,onShown:_,onExtent:v,onLoadStart:y,onLoad:b,onError:x})=>{let S=as([]),C=as([]),{hiddenRef:ee,filterRef:te}=so(f);return is(()=>{let n=!1,f=T({descriptors:r,nameOf:e=>i?.(e)??Xe(e)}),{entryFor:w}=f,E=()=>Xo(C.current,$.getZoom()),D=()=>{C.current=[],S.current.forEach(e=>$.removeLayer(e)),S.current=[]},O=Object.create(null),k=[],ne=[],A=e=>!!d?.(e),j=[];return(async()=>{try{y?.();let r=await Ye(e,t);if(n)return;D();let i=0,d=rs.geoJSON(r,{pointToLayer:(e,t)=>{i+=1;let{marker:n={}}=w(e)??{},r=n.size??24,a=rs.marker(t,{icon:rs.divIcon({className:n.className??`atlas-marker`,iconSize:[r,r]})});return n.style&&a.on(`add`,()=>co(a.getElement(),n.style)),O[Ho(t)]=a,a._atlasPinned=A(e),a},style:e=>l(w(e)),onEachFeature:(e,t)=>{let n=w(e)??{};j.push({layer:t,feature:e,key:f.note(e),hidden:!1});let r=s?s(e):p(n,e);if(r&&Yo(t,e,n,r)&&C.current.push({layer:t,descriptor:n}),typeof t.getLatLngs==`function`){let e=t.getLatLngs();Array.isArray(e)&&e.length>=2&&!Array.isArray(e[0])&&k.push({layer:t,original:e.map(({lat:e,lng:t})=>rs.latLng(e,t)),reverse:!!n.arrow?.reverse,key:null})}let i=n.details&&!c?null:vo(e,n,{popup:c,labelResolver:u});i&&t.bindPopup(i,yo),m&&t.on(`click`,()=>m(e,g(n,e,u)))}}),x=ns({map:$,factory:rs,group:d,cluster:a,points:i}),{surface:T,clustering:M,settings:re}=x;S.current=x.layers;let N=qo({factory:rs,group:d,into:x.arrows,arrowOf:e=>w(e)?.arrow}),ie=e=>{let{leaving:t,returning:n}=po(j,e);return x.move(t,!1,N),x.move(n,!0,N),n.length&&mo(j,N),t.length>0||n.length>0},P=e=>{_?.(ho(r,e,e=>f.kindOf(e).key)),v?.(go(j))};ie(ee.current);let F=null;M&&k.length&&(F=Jo({map:$,surface:T,lines:k,markerAt:O,decoratorOf:N,glide:re.glide}),ne.push(F)),h?.(f.drawn()),E(),$.on(`zoomend`,E),M&&$.on(`moveend`,E);let ae=go(j);o&&ae&&$.fitBounds(ae,{padding:yi}),te.current=e=>{ie(e)&&(F?.reroute(),E(),P(e))},P(ee.current),b?.(r)}catch(e){if(n)return;console.error(`perun-atlas: feature set failed to render`,e),x?.(e)}})(),()=>{n=!0,te.current=null,ne.forEach(e=>e()),$.off(`zoomend`,E),$.off(`moveend`,E),D()}},[e,JSON.stringify(t??{}),n]),null},cs=`#e8590c`,ls={className:`atlas-overlay`,color:cs,weight:2.5,opacity:1,dashArray:`6 5`,fillColor:cs,fillOpacity:.08},us={className:`atlas-overlay atlas-overlay--point`,radius:5,color:cs,weight:2.5,opacity:1,fillColor:`#ffffff`,fillOpacity:.85},ds=e=>({key:te,label:e,kind:`line`,path:ls,marker:null,arrow:null}),fs=e=>e==null||e===``||typeof e==`object`?null:String(e),ps=(e,t,n)=>{let r=e?.properties??{},i=fs(r.name),a=Object.entries(r).filter(([e])=>i===null||e!==`name`).map(([e,t])=>({field:e,label:n?.(e.toLowerCase())||e,value:fs(t)})).filter(e=>e.value!==null);return{title:i??t,rows:a,spec:{className:`atlas-panel__details--file`}}},ms=e=>`${Number((e/1048576).toFixed(1))} MB`,hs=e=>new Intl.NumberFormat().format(e),gs=(e,t={})=>b(e===1?t.fileFeature??`{count} feature`:t.fileFeatures??`{count} features`,{count:hs(e)}),_s=(e,t={})=>b(t.fileOpening??`Opening {name}…`,{name:e}),vs=(e,t={})=>b(t.fileAssumedDegrees??`{name} has no .prj, so its coordinates were read as longitude and latitude (WGS 84).`,{name:e}),ys={unreadable:[`fileUnreadable`,`{name} could not be read as GeoJSON, KML, GPX or a shapefile.`],empty:[`fileEmpty`,`{name} has nothing in it to draw.`],notDegrees:[`fileNotDegrees`,`{name} is not in longitude and latitude, so it cannot be placed on the map.`],tooLarge:[`fileTooLarge`,`{name} is {size}. Files up to {limit} can be opened.`],tooManyPoints:[`fileTooManyPoints`,`{name} has {count} points. Files with up to {limit} points can be opened.`],tooLargeUnzipped:[`fileTooLargeUnzipped`,`{name} is over {limit} once unzipped, and {limit} is the most that can be opened.`],noShapefile:[`fileNoShapefile`,`{name} holds no shapefile.`],shapefilePart:[`fileShapefilePart`,`{name} is one part of a shapefile and holds no shapes. Open the .zip holding all its parts, or its .shp.`],noPrj:[`fileNoPrj`,`{name} has no .prj, and its coordinates are not longitude and latitude, so nothing says where it belongs. Open it zipped with its .prj.`],unknownProjection:[`fileUnknownProjection`,`The projection in {name}'s .prj could not be read. Save it in WGS 84 (EPSG:4326) and open it again.`],noDatumShift:[`fileNoDatumShift`,`{name} is in {crs}, and its .prj does not say how to shift that to WGS 84, so it would land in the wrong place. Save it in WGS 84 (EPSG:4326) and open it again.`],readerUnavailable:[`fileReaderUnavailable`,`The shapefile reader could not be loaded, so {name} was not opened. Try again.`]},bs=(e,t,n={})=>{let[r,i]=ys[e?.refused]??ys.unreadable,a={name:t};return e?.refused===`tooLarge`&&(a.size=ms(e.size),a.limit=ms(e.limit)),e?.refused===`tooLargeUnzipped`&&(a.limit=ms(e.limit)),e?.refused===`tooManyPoints`&&(a.count=hs(e.count),a.limit=hs(e.limit)),e?.refused===`noDatumShift`&&(a.crs=e.crs||`a projection`),b(n[r]??i,a)};Y(`/*
 * A file the reader opened: its shapes on the map, and its chip in the toolbar.
 *
 * Structure only, like the rest of these sheets, except for the overlay's own
 * colour, which is the point of it. That colour is a token, \`--ap-overlay\`, so
 * a row can set it in \`tokens\` and a deployment's sheet can set it for every
 * screen. The token reaches the map because the map sits inside the panel,
 * fullscreen included.
 */

/*
 * Leaflet writes a path's colour as an SVG attribute, and an attribute loses to
 * any CSS property, so this decides the colour wherever the sheet is loaded and
 * the attribute is only the fallback. The key's swatch carries the same class,
 * so the key and the map cannot disagree.
 *
 * The fill only where there is one. A line is a path too, which Leaflet marks
 * \`fill="none"\`, and a CSS fill wins over that as well: a line would be filled
 * in solid, at the full opacity Leaflet leaves unset for a path it does not
 * fill.
 */
.atlas-overlay {
  stroke: var(--ap-overlay, #e8590c);
}

.atlas-overlay:not([fill="none"]) {
  fill: var(--ap-overlay, #e8590c);
}

/* A point is a ring: the colour on the edge, white inside. */
.atlas-overlay.atlas-overlay--point {
  fill: #ffffff;
}

/* Opened by the button beside it, so it is never shown. */
.atlas-panel__fileinput {
  display: none;
}

/*
 * The open file: a swatch, its name, how many features it drew, and the button
 * that closes it. It sits in the actions group, which a deployment's sheet does
 * not let shrink, so the chip has a width of its own and the name gives way
 * inside it, with an ellipsis. The full name is its title.
 */
.atlas-panel__file {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 18rem;
  padding: 3px 4px 3px 8px;
  border: 1px solid var(--ap-rule, #d9dde3);
  border-radius: var(--ap-radius, 4px);
  background: var(--ap-surface, #ffffff);
  font: var(--ap-value-font, 500 12px/1.4 system-ui, sans-serif);
  color: var(--ap-ink, #14161a);
}

.atlas-panel__filename {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.atlas-panel__filecount {
  flex: 0 0 auto;
  font: var(--ap-label-font, 500 11px/1.4 system-ui, sans-serif);
  font-variant-numeric: tabular-nums;
  color: var(--ap-muted, #6b6f7a);
}

.atlas-panel__file .atlas-legend__swatch {
  flex: 0 0 auto;
}

/*
 * Said, not inherited: a deployment's sheet may style every \`button\`, and this
 * one is a small cross inside a chip. See \`frontend/style/README.md\`.
 */
.atlas-panel__fileclose {
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--ap-radius, 4px);
  background: transparent;
  font: inherit;
  font-size: 15px;
  line-height: 1;
  color: var(--ap-muted, #6b6f7a);
  cursor: pointer;
}

.atlas-panel__fileclose:hover,
.atlas-panel__fileclose:focus-visible {
  color: var(--ap-ink, #14161a);
}

/*
 * Why a file was not opened. Its own line, because the message carries a name
 * and numbers and is worth reading whole. The mark on its edge is the overlay's
 * colour, which says which control it is about. Warning colours are the
 * deployment's, as everywhere else on this screen.
 */
.atlas-panel__filerefused {
  flex-basis: 100%;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 4px 4px 4px 10px;
  border-left: 3px solid var(--ap-overlay, #e8590c);
  font: var(--ap-label-font, 500 11px/1.4 system-ui, sans-serif);
  color: var(--ap-ink, #14161a);
}

.atlas-panel__filerefused > span {
  flex: 1 1 auto;
  min-width: 0;
  overflow-wrap: anywhere;
}

/*
 * Something to know about the file that did open: a shapefile with no .prj was
 * read as longitude and latitude. Laid out like a refusal, with a dashed mark
 * and quieter ink, since nothing went wrong and the file is on the map.
 */
.atlas-panel__filenote {
  flex-basis: 100%;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 4px 4px 4px 10px;
  border-left: 3px dashed var(--ap-overlay, #e8590c);
  font: var(--ap-label-font, 500 11px/1.4 system-ui, sans-serif);
  color: var(--ap-muted, #6b6f7a);
}

.atlas-panel__filenote > span {
  flex: 1 1 auto;
  min-width: 0;
  overflow-wrap: anywhere;
}
`);var{Map:xs,factory:Ss}=I,{useEffect:Cs,useRef:ws}=t.React,Ts=`atlasFilePoints`,Es=620,Ds=()=>(xs.getPane(Ts)||(xs.createPane(Ts).style.zIndex=String(Es)),Ts),Os=({file:e,srid:t,hidden:n=!1,labelResolver:r,onFeatureClick:i,onDrawn:a,onError:o})=>{let s=ws(null),c=ws(n);c.current=n;let l=ws({});l.current={labelResolver:r,onFeatureClick:i,onDrawn:a,onError:o};let u=ws(null);return Cs(()=>{if(!e)return;let n;try{n=Ss.geoJSON(Pe(e.collection,t),{pointToLayer:(e,t)=>Ss.circleMarker(t,{...us,pane:Ds()}),style:e=>/Point$/.test(e?.geometry?.type??``)?us:ls,onEachFeature:(t,n)=>{n.on(`click`,()=>{let{labelResolver:n,onFeatureClick:r}=l.current;r?.(t,{...ps(t,e.name,n),file:e})})}})}catch(e){console.error(`perun-atlas: a file could not be drawn`,e),l.current.onError?.(e);return}if(s.current=n,c.current||n.addTo(xs),u.current!==e){u.current=e;let t=n.getBounds();t.isValid()&&xs.fitBounds(t,{padding:yi})}return l.current.onDrawn?.(),()=>{xs.removeLayer(n),s.current=null}},[e,t]),Cs(()=>{let e=s.current;e&&(n?xs.removeLayer(e):xs.hasLayer(e)||e.addTo(xs))},[n]),null};Y(`/*
 * The legend's structure, and nothing about its look.
 *
 * Same division as panel.css: what makes this a readable box rather than a stack
 * of divs ships here, because a deployment serving no stylesheet must still get
 * a legend. Colours, type and radii belong to the deployment's own sheet, which
 * is later in the cascade and wins.
 *
 * It carries its own opaque ground because it sits over tiles. A translucent one
 * lets whatever is underneath through, and a swatch read against moving imagery
 * is not a swatch -- the colours are the content here, so they get a fixed white
 * behind them rather than a tinted approximation of one.
 *
 * It places nothing. The legend is a Leaflet control, so its corner, its offset
 * from the edge and its stacking all come from the map's own chrome -- which is
 * what keeps it inside the element that goes fullscreen and out of a z-index
 * argument with the frame drawn around it.
 */

.atlas-legend {
  /* Its own offset from the corner. Leaflet's stylesheet is where a control's
     margin normally comes from and spatial does not ship it, so every control
     in a corner carries one -- \`.measure-control\` and \`.locate-control\` do the
     same. Without it the legend is flush against the map edge and against the
     layer switcher above it. */
  margin: 10px;
  max-width: 15rem;
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
  font-size: 12px;
  line-height: 1.35;
  color: #212529;
}

.atlas-legend__toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 5px 8px;
  border: none;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.atlas-legend__title {
  flex: 1 1 auto;
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6c757d;
}

.atlas-legend__chevron {
  flex: 0 0 auto;
  font-family: monospace;
  font-size: 13px;
  line-height: 1;
  color: #6c757d;
}

.atlas-legend__toggle:hover .atlas-legend__title,
.atlas-legend__toggle:hover .atlas-legend__chevron {
  color: #212529;
}

.atlas-legend__toggle:focus-visible {
  outline: 2px solid #3399ff;
  outline-offset: -2px;
}

.atlas-legend__list {
  /* A long key scrolls rather than growing past the map it describes. */
  max-height: 40vh;
  overflow-y: auto;
  margin: 0;
  padding: 0 8px 6px;
  list-style: none;
}

.atlas-legend__row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
}

/* Fixed, so every label starts in the same column whatever its swatch draws. */
.atlas-legend__swatch {
  flex: 0 0 auto;
  width: 24px;
  height: 12px;
  overflow: visible;
}

.atlas-legend__point {
  flex: 0 0 auto;
  width: 12px;
  height: 12px;
  margin: 0 6px;
  border-radius: 50%;
  background-color: #B8C6CC;
}

.atlas-legend__label {
  flex: 1 1 auto;
  min-width: 0;
  overflow-wrap: anywhere;
}

/*
 * A row as a switch for what it stands for.
 *
 * Laid out exactly as a plain row, so a key that filters and one that does not
 * look the same until someone switches a row off. Every property that matters
 * is said here rather than inherited, because a deployment's bare \`button\`
 * rules reach into this package and win whatever a class does not claim.
 * \`frontend/style/README.md\` has the case that taught us.
 */
.atlas-legend__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 0;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 2px;
  background: transparent;
  font: inherit;
  line-height: inherit;
  letter-spacing: normal;
  text-transform: none;
  text-align: left;
  color: inherit;
  cursor: pointer;
}

.atlas-legend__item:hover .atlas-legend__label {
  text-decoration: underline;
}

.atlas-legend__item:focus-visible {
  outline: 2px solid #3399ff;
  outline-offset: 1px;
}

/*
 * Switched off: still in the key, so the way back is where the reader left it,
 * and plainly not on the map.
 *
 * The swatch keeps its colour, faded, because the colour is how the reader
 * finds the row again. The fade is a \`filter\` rather than \`opacity\` because a
 * point's swatch carries its marker's own CSS inline, and an inline \`opacity\`
 * in a menu row would win over any class here.
 */
.atlas-legend__item[aria-pressed='false'] .atlas-legend__swatch,
.atlas-legend__item[aria-pressed='false'] .atlas-legend__point {
  filter: opacity(0.3);
}

.atlas-legend__item[aria-pressed='false'] .atlas-legend__label {
  color: #6c757d;
  text-decoration: line-through;
}

/* Every row back on, offered only while one is off. */
.atlas-legend__reset {
  display: block;
  margin: 0 8px 6px;
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  font-size: 11px;
  line-height: 1.35;
  letter-spacing: normal;
  text-transform: none;
  color: #6c757d;
  text-decoration: underline;
  cursor: pointer;
}

.atlas-legend__reset:hover {
  color: #212529;
}

.atlas-legend__reset:focus-visible {
  outline: 2px solid #3399ff;
  outline-offset: 1px;
}

/*
 * The key moved to the bottom right, which a row may ask for.
 *
 * spatial's \`navigation.css\` makes every button in that corner absolute,
 * padded, bordered and round -- \`.control-bottomright button:not(.disabled)\`,
 * written for its own navigation buttons. Each of the key's buttons gets its
 * own box back here, one class more specific than that rule and only in its
 * four properties.
 */
.control-bottomright .atlas-legend .atlas-legend__toggle {
  position: static;
  padding: 5px 8px;
  border: none;
  border-radius: 0;
}

.control-bottomright .atlas-legend .atlas-legend__item {
  position: static;
  padding: 0;
  border: none;
  border-radius: 2px;
}

.control-bottomright .atlas-legend .atlas-legend__reset {
  position: static;
  padding: 0;
  border: none;
  border-radius: 0;
}

/* On a narrow map, room to be read matters more than the corner it sits in. */
@media (max-width: 30rem) {
  .atlas-legend {
    max-width: calc(100vw - 4rem);
  }
}
`);var{useEffect:ks,useRef:As,useState:js}=t.React,Ms=({marker:e})=>{let n=As(null);return ks(()=>{let t=n.current;t&&(co(t,e?.style),t.style.width=`12px`,t.style.height=`12px`)},[e]),t.React.createElement(`span`,{ref:n,className:[`atlas-legend__point`,e?.className].filter(Boolean).join(` `),"aria-hidden":`true`})};Ms.propTypes={marker:t.PropTypes.object};var Ns=({path:e,arrow:n})=>{let r=e?.color??`#4A5C66`,i=Array.isArray(e?.dashArray)?e.dashArray.join(` `):e?.dashArray,a=n?.reverse?`3,6 9,3 9,9`:`21,6 15,3 15,9`;return t.React.createElement(`svg`,{className:`atlas-legend__swatch`,width:`24`,height:`12`,viewBox:`0 0 24 12`,"aria-hidden":`true`},t.React.createElement(`line`,{className:e?.className,x1:`2`,y1:`6`,x2:`22`,y2:`6`,stroke:r,strokeWidth:Math.min(e?.weight??1,4),strokeDasharray:i||void 0,strokeOpacity:e?.opacity??1,strokeLinecap:`round`}),n&&t.React.createElement(`polygon`,{points:a,fill:r,fillOpacity:e?.opacity??1}))};Ns.propTypes={path:t.PropTypes.object,arrow:t.PropTypes.object};var Ps=({path:e})=>t.React.createElement(`svg`,{className:`atlas-legend__swatch`,width:`24`,height:`12`,viewBox:`0 0 24 12`,"aria-hidden":`true`},t.React.createElement(`rect`,{x:`4`,y:`1`,width:`16`,height:`10`,fill:e?.fillColor??`#B8C6CC`,fillOpacity:e?.fillOpacity??.55,stroke:e?.color??`#4A5C66`,strokeWidth:Math.min(e?.weight??1,2),strokeOpacity:e?.opacity??1}));Ps.propTypes={path:t.PropTypes.object};var Fs=({entry:e})=>e.kind===`point`?t.React.createElement(Ms,{marker:e.marker}):e.kind===`line`?t.React.createElement(Ns,{path:e.path,arrow:e.arrow}):t.React.createElement(Ps,{path:e.path});Fs.propTypes={entry:t.PropTypes.object.isRequired};var Is=({entries:e=[],title:n,open:r=!0,hidden:i=[],onToggle:a,onShowAll:o,showAllLabel:s,className:c=``})=>{let[l,u]=js(r);if(!S(e,i))return null;let d=n??`Legend`,f=e.some(e=>i.includes(e.key));return t.React.createElement(`div`,{className:`atlas-legend ${c}`.trim()},t.React.createElement(`button`,{type:`button`,className:`atlas-legend__toggle`,onClick:()=>u(!l),"aria-expanded":l},t.React.createElement(`span`,{className:`atlas-legend__title`},d),t.React.createElement(`span`,{className:`atlas-legend__chevron`,"aria-hidden":`true`},l?`−`:`+`)),l&&t.React.createElement(`ul`,{className:`atlas-legend__list`},e.map(e=>{let n=t.React.createElement(t.React.Fragment,null,t.React.createElement(Fs,{entry:e}),t.React.createElement(`span`,{className:`atlas-legend__label`},e.label));return t.React.createElement(`li`,{className:`atlas-legend__row`,key:e.key},a?t.React.createElement(`button`,{type:`button`,className:`atlas-legend__item`,"aria-pressed":!i.includes(e.key),onClick:()=>a(e.key)},n):n)})),l&&o&&f&&t.React.createElement(`button`,{type:`button`,className:`atlas-legend__reset`,onClick:o},s??`Show all`))};Is.propTypes={entries:t.PropTypes.array,title:t.PropTypes.string,open:t.PropTypes.bool,hidden:t.PropTypes.array,onToggle:t.PropTypes.func,onShowAll:t.PropTypes.func,showAllLabel:t.PropTypes.string,className:t.PropTypes.string};var Ls=({entries:e=[],title:n,open:r,hidden:i=[],onToggle:a,onShowAll:o,showAllLabel:s,position:c=`bottomleft`})=>{let l=S(e,i);return t.React.createElement(Ri,{position:c,shown:l},t.React.createElement(`div`,{className:`atlas-legend__host`,ref:Bi},t.React.createElement(Is,{entries:e,title:n,open:r,hidden:i,onToggle:a,onShowAll:o,showAllLabel:s})))};Ls.propTypes={entries:t.PropTypes.array,title:t.PropTypes.string,open:t.PropTypes.bool,hidden:t.PropTypes.array,onToggle:t.PropTypes.func,onShowAll:t.PropTypes.func,showAllLabel:t.PropTypes.string,position:t.PropTypes.string};var Rs=({className:e=`atlas-panel__close`,label:n,title:r,onClick:i})=>t.React.createElement(`button`,{type:`button`,className:e,"aria-label":n,title:r,onClick:i},`×`),zs=({timeScoped:e,longest:n,preset:r,applyPreset:i,onClose:a,labels:o={}})=>t.React.createElement(`div`,{className:`atlas-panel__empty`},t.React.createElement(`div`,{className:`atlas-panel__emptycard`},t.React.createElement(`div`,{className:`atlas-panel__emptytitle`},o.empty??(e?`Nothing in this range`:`Nothing to show`)),o.emptyHint&&t.React.createElement(`div`,{className:`atlas-panel__emptybody`},o.emptyHint),e&&n&&r!==n.months&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--primary`,onClick:()=>i(n.months)},[o.widen??`Try`,n.label].filter(Boolean).join(` `)),t.React.createElement(Rs,{label:o.close??`Close`,title:o.close??`Close`,onClick:a}))),{Icon:Bs}=t.elements,Vs=[{offer:`geojson`,icon:`IconJson`,label:`exportGeoJSON`,fallback:`GeoJSON`,save:`saveGeoJSON`},{offer:`csv`,icon:`IconFileTypeCsv`,label:`exportCsv`,fallback:`CSV`,save:`saveCSV`},{offer:`kml`,icon:`IconWorld`,label:`exportKml`,fallback:`KML`,save:`saveKML`},{offer:`shp`,icon:`IconFileTypeZip`,label:`exportShp`,fallback:`Shapefile`,save:`saveShapefile`}],Hs=({exporter:e,labels:n={}})=>t.React.createElement(t.React.Fragment,null,Vs.filter(({offer:t})=>e.offer[t]!==!1).map(({offer:r,icon:i,label:a,fallback:o,save:s})=>t.React.createElement(`button`,{key:r,type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:e[s]},t.React.createElement(Bs,{name:i,size:16,stroke:1.75,"aria-hidden":`true`}),n[a]??o))),{Icon:Us}=t.elements,Ws=({fileOverlay:e,labels:n={}})=>{let{offered:r,file:i,inputRef:a,choose:o,onPicked:s,close:c}=e;return t.React.createElement(t.React.Fragment,null,r&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:o},t.React.createElement(Us,{name:`IconFolderOpen`,size:16,stroke:1.75,"aria-hidden":`true`}),n.openFile??`Open file`),r&&t.React.createElement(`input`,{ref:a,type:`file`,className:`atlas-panel__fileinput`,accept:`.geojson,.json,.kml,.gpx,.zip,.shp`,tabIndex:-1,"aria-hidden":`true`,onChange:s}),i&&t.React.createElement(`div`,{className:`atlas-panel__file`},t.React.createElement(Ns,{path:ls}),t.React.createElement(`span`,{className:`atlas-panel__filename`,title:i.name},i.name),t.React.createElement(`span`,{className:`atlas-panel__filecount`},gs(i.count,n)),t.React.createElement(Rs,{className:`atlas-panel__fileclose`,label:n.closeFile??`Close file`,title:n.closeFile??`Close file`,onClick:c})))},Gs=({fileOverlay:e,labels:n={}})=>{let{note:r,refusal:i,dismiss:a,dismissNote:o}=e;return t.React.createElement(t.React.Fragment,null,r&&t.React.createElement(`p`,{className:`atlas-panel__filenote`,role:`status`},t.React.createElement(`span`,null,r),t.React.createElement(Rs,{className:`atlas-panel__fileclose`,label:n.close??`Close`,onClick:o})),i&&t.React.createElement(`p`,{className:`atlas-panel__filerefused`,role:`alert`},t.React.createElement(`span`,null,i),t.React.createElement(Rs,{className:`atlas-panel__fileclose`,label:n.close??`Close`,onClick:a})))},{Icon:Ks}=t.elements,qs=({viewLink:e,labels:n={}})=>t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:t=>e.copy(t.currentTarget)},t.React.createElement(Ks,{name:e.copied?`IconCheck`:`IconLink`,size:16,stroke:1.75,"aria-hidden":`true`}),e.copied?n.linkCopied??`Link copied`:n.copyLink??`Copy link`),Js=({saving:e,opening:n,labels:r={}})=>t.React.createElement(`div`,{className:`atlas-panel__loading`,role:`status`,"aria-live":`polite`},t.React.createElement(`div`,{className:`atlas-panel__loadingcard`},t.React.createElement(`div`,{className:`atlas-panel__spinner`,"aria-hidden":`true`}),t.React.createElement(`span`,null,e?r.saving??`Saving…`:n?_s(n,r):r.loading??`Loading…`))),Ys=({timeScoped:e,range:n,initial:r,applyPreset:i,onClose:a,labels:o={}})=>t.React.createElement(`div`,{className:`atlas-panel__footer`},e&&t.React.createElement(`div`,{className:`atlas-panel__summary`},`${n.from} → ${n.to}`),t.React.createElement(`div`,{className:`atlas-panel__actions`},e&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:()=>i(r)},o.reset??`Reset range`),a&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--dark`,onClick:a},o.close??`Close`))),Xs=({record:e,onClose:n,labels:r={}})=>t.React.createElement(`aside`,{className:[`atlas-panel__details`,e.spec?.className].filter(Boolean).join(` `),style:e.spec?.style,"aria-label":r.details??`Details`},t.React.createElement(`div`,{className:`atlas-panel__detailshead`},t.React.createElement(`div`,{className:`atlas-panel__detailstitle`,style:e.spec?.titleStyle},e.title??r.details??`Details`),t.React.createElement(Rs,{label:r.close??`Close`,onClick:n})),t.React.createElement(`dl`,{className:`atlas-panel__detailsbody`},e.rows.map(({field:n,label:r,value:i})=>t.React.createElement(`div`,{key:n,className:`atlas-panel__detailsrow`},t.React.createElement(`dt`,{style:e.spec?.labelStyle},r),t.React.createElement(`dd`,{style:e.spec?.valueStyle},i))))),Zs=({range:e,onRangeChange:n,presets:r=[],preset:i,applyPreset:a,labels:o={}})=>t.React.createElement(t.React.Fragment,null,t.React.createElement(Po,{from:e.from,to:e.to,onChange:n,labels:{from:o.from,to:o.to,invalidRange:o.invalidRange}}),r.length>0&&t.React.createElement(`div`,{className:`atlas-panel__segmented`},r.map(({months:e,label:n})=>t.React.createElement(`button`,{key:e,type:`button`,"aria-pressed":i===e,onClick:()=>a(e)},n)))),{useEffect:Qs,useMemo:$s,useState:ec}=t.React,tc=({choropleth:e,bindings:t,bindingKey:n})=>{let r=!!e,[i,a]=ec(null),o=r?e.status:null;return Qs(()=>{if(!o)return;let e=!1;return dt(o,t).then(t=>{e||a(t)}),()=>{e=!0}},[o,n]),{coloured:r,statusPath:o,rows:i,tooltip:$s(()=>{let t=e?.tooltip;if(!t)return;let n=y(t);return e=>n(e?.properties)??null},[e])}},nc=e=>e.toISOString().slice(0,10),rc=()=>nc(new Date),ic=e=>{let t=new Date;return t.setMonth(t.getMonth()-e),nc(t)},ac=e=>({from:ic(e),to:rc()}),oc=(e,t)=>e?.from===t?.from&&e?.to===t?.to,{useState:sc}=t.React,cc=({presets:e=[],defaultMonths:t,servicePath:n,opening:r,onMoved:i})=>{let a=t??e[e.length-1]?.months??12,[o,s]=sc(r?null:a),[c,l]=sc(()=>r??ac(a)),u=/\{(from|to)\}/.test(n??``),d=(e,t)=>{s(t),!oc(e,c)&&(l(e),i?.())};return{timeScoped:u,preset:o,range:c,applyPreset:e=>d(ac(e),e),onRangeChange:e=>d(e,null),longest:e[e.length-1],initial:a}},{useEffect:lc,useMemo:uc,useState:dc}=t.React,fc=(e,t)=>e?b(e,t??{}):null,pc=e=>({path:typeof e==`string`?e:null,inline:e&&typeof e==`object`?e:null}),mc=({form:e,bindings:t})=>{let{path:n,inline:r}=pc(e?.schema),i=pc(e?.uiSchema),a=fc(n,t),o=fc(i.path,t),[s,c]=dc(null),[l,u]=dc(null),[d,f]=dc(!!(n||i.path)),[p,m]=dc(!1);lc(()=>{if(!n&&!i.path){c(null),u(null),f(!1);let t=!!e&&!r;t&&console.error("perun-atlas: draw.form needs `schema` -- either the schema itself, or the path to a service that answers with one. Got",e?.schema),m(t);return}let a=!1;return f(!0),m(!1),Promise.all([n?mt(n,t):Promise.resolve(null),i.path?ht(i.path,t):Promise.resolve(null)]).then(([e,t])=>{a||(c(e),u(t),m(!!n&&!e),f(!1))}),()=>{a=!0}},[n,a,i.path,o,!!e,!!r]);let h=uc(()=>gt(n?s:r,e?.pick),[s,r,n,e?.pick?.join(`\0`)??null]);return{schema:h,uiSchema:uc(()=>St(i.path?l:i.inline,h)??void 0,[l,i.inline,i.path,h]),loading:d,failed:p}},{useMemo:hc}=t.React,gc={id:`{pkid}`,join:`,`},_c=({set:e,shape:t,dataSrid:n,select:r})=>{let i=r===!0?gc:r?{...gc,...r}:null,{mode:a,id:o,join:s}=i??{},c=!!i&&i.export!==!1;return hc(()=>{if(!i)return{selecting:!1,feedsExport:!1,count:0,total:0,inside:[],radius:null,has:()=>!1,metres:()=>null,context:null};let r=Et(e,t,{srid:n,mode:a});return{selecting:!0,feedsExport:c,count:r.inside.length,total:r.total,inside:r.inside,radius:t?.radius??null,has:r.has,metres:r.metres,context:{count:r.inside.length,total:r.total,ids:Dt(r.inside,{id:o,join:s}),geojson:{type:`FeatureCollection`,features:r.inside}}}},[e,t,n,a,o,s,c,!!i])},{useMemo:vc,useState:yc}=t.React,{alertUserResponse:bc}=t.elements,xc=(e,t)=>e?.type?void 0:t?`success`:`error`,Sc=({draw:e,dataSrid:n,set:r,bindings:i,labels:a={}})=>{let o=!!(e?.save?.onSave||e?.select),[s,c]=yc(!1),[l,u]=yc(null),[d,f]=yc(``),[p,m]=yc(!1),[h,g]=yc(0),[_,v]=yc(()=>e?.form?.data??{}),y=mc({form:e?.form,bindings:i}),b=vc(()=>y.schema?t.validator.validateFormData(_t(_,y.schema),y.schema)?.errors??[]:[],[_,y.schema]),x=_c({set:r,shape:l,dataSrid:n,select:e?.select}),S=()=>{c(!1),u(null),f(``),v(e?.form?.data??{})};return{drawable:o,drawing:s,shape:l,selection:x,note:d,form:e?.form?{schema:y.schema,uiSchema:y.uiSchema,data:_,errors:b,onChange:v,loading:y.loading,failed:y.failed}:void 0,saving:p,reload:h,setShape:u,setNote:f,startDrawing:()=>c(!0),finishDrawing:()=>c(!1),clearDrawing:S,saveShape:async()=>{if(!l||p)return;if(e.form&&!y.schema){console.error(`perun-atlas: nothing sent -- this row configures a form and its fields are not loaded.`);return}if(b.length){bc({type:`error`,response:a.saveIncomplete??`Some of these fields are mandatory and are empty. Nothing was sent.`}),console.error(`perun-atlas: nothing sent -- the form is not answerable as it stands:`,b.map(e=>`${e.property??``} ${e.message??``}`.trim()).join(`; `));return}let{context:t,units:r,tooSmall:o}=Lt(l,{draw:e,dataSrid:n,bindings:i,note:d,selected:x.context,form:_});if(o){bc({type:`error`,response:a.saveTooSmall??`This deployment stores geometry in EPSG:${n??`?`}, where ${Math.round(l.radius)} m is less than one unit. Nothing was sent.`}),console.error(`perun-atlas: a radius of ${Math.round(l.radius)} m is ${r} units in EPSG:${n}, which rounds to zero. A projection measured in degrees cannot carry an integer radius: send {draw.metres} for the size and {draw.ring} for the shape instead.`),console.error(`perun-atlas: the configured path is`,e.save.onSave);return}m(!0);let s=await It(e.save.onSave,t,{body:e.save.body===void 0?void 0:Ft(e.save.body,t),contentType:e.save.contentType,encoding:e.save.encoding,failure:e.save.failure});m(!1),s.ok&&(S(),g(e=>e+1)),bc({response:s.data||s.message,type:xc(s.data,s.ok)})}}},Cc=(()=>{let e=new Uint32Array(256);for(let t=0;t<256;t+=1){let n=t;for(let e=0;e<8;e+=1)n=n&1?3988292384^n>>>1:n>>>1;e[t]=n>>>0}return e})(),wc=e=>{let t=4294967295;for(let n=0;n<e.length;n+=1)t=Cc[(t^e[n])&255]^t>>>8;return(t^4294967295)>>>0},Tc=async e=>{if(typeof CompressionStream>`u`)return null;let t;try{t=new CompressionStream(`deflate-raw`)}catch{return null}return new Uint8Array(await new Response(new Blob([e]).stream().pipeThrough(t)).arrayBuffer())},Ec=e=>e.getHours()<<11|e.getMinutes()<<5|e.getSeconds()>>1,Dc=e=>Math.max(e.getFullYear()-1980,0)<<9|e.getMonth()+1<<5|e.getDate(),Oc=2048,kc=0,Ac=8,jc=async(e,{now:t=new Date,compress:n=!0}={})=>{let r=new TextEncoder,i=Ec(t),a=Dc(t),o=[];for(let{name:t,bytes:i}of e){let e=n?await Tc(i):null,a=e&&e.length<i.length?e:i;o.push({name:r.encode(t),method:a===i?kc:Ac,crc:wc(i),size:i.length,packed:a})}let s=o.reduce((e,t)=>e+30+t.name.length+t.packed.length+46+t.name.length,22),c=new Uint8Array(s),l=new DataView(c.buffer),u=0,d=e=>{l.setUint16(u,e,!0),u+=2},f=e=>{l.setUint32(u,e,!0),u+=4},p=e=>{c.set(e,u),u+=e.length},m=e=>{d(20),d(Oc),d(e.method),d(i),d(a),f(e.crc),f(e.packed.length),f(e.size),d(e.name.length),d(0)};o.forEach(e=>{e.offset=u,f(67324752),m(e),p(e.name),p(e.packed)});let h=u;o.forEach(e=>{f(33639248),d(20),m(e),d(0),d(0),d(0),f(0),f(e.offset),p(e.name)});let g=u-h;return f(101010256),d(0),d(0),d(o.length),d(o.length),f(g),f(h),d(0),c},Mc=({set:e,selection:t,exportable:n,labelResolver:r,timeScoped:i,range:a,srid:o,drawnWith:s})=>{let c=n===!1?null:n&&n!==!0?n:{},l=!!(t?.selecting&&t.feedsExport&&t.count>0),u=l?{type:`FeatureCollection`,features:t.inside}:e,d=c&&u&&(u.features?.length??0)>0,f=[c?.filename??`features`,l?`within-${Math.round(t.radius??0)||`shape`}`:null,i?`${a.from}_${a.to}`:rc()].filter(Boolean).join(`-`),p=()=>Ne(u,o),h=e=>{let t=c?.name?v(e?.properties,c.name):null;return t==null||t===``?m(s?.(e),e):String(t)},g={fields:c?.fields,exclude:c?.exclude,labelResolver:r};return{offer:c,canExport:d,saveGeoJSON:()=>uo(`${f}.geojson`,Rt(p()),`application/geo+json`),saveCSV:()=>uo(`${f}.csv`,Kt(p(),g),`text/csv;charset=utf-8`),saveKML:()=>uo(`${f}.kml`,en(p(),{...g,nameOf:h}),`application/vnd.google-earth.kml+xml`),saveShapefile:async()=>uo(`${f}.zip`,await jc(Ln(p(),{...g,stem:f})),`application/zip`)}},Nc={shp:`shp.perun-atlas.js?v=f8a962935bdb`},Pc=typeof document>`u`?null:document.currentScript?.src||null,Fc=()=>Pc??(typeof document>`u`?null:Array.from(document.scripts).find(e=>/\/perun-atlas\.js(\?|$)/.test(e.src))?.src??null),Ic=(e,t,n=Nc)=>t&&n[e]?new URL(n[e],t).href:null,Lc=new Map,Rc=(e,{base:t=Fc(),files:n=Nc,load:r=e=>import(e)}={})=>{if(!Lc.has(e)){let i=Ic(e,t,n),a=i?r(i):Promise.reject(Error(`perun-atlas: cannot tell where the ${e} module is. It is loaded from beside perun-atlas.js, and that script could not be found.`));a.catch(()=>Lc.delete(e)),Lc.set(e,a)}return Lc.get(e)},{useRef:zc,useState:Bc}=t.React,Vc=()=>new Promise(e=>{requestAnimationFrame(()=>setTimeout(e,0))}),Hc=async e=>{let t=await e.arrayBuffer(),n=ai(t,e.name);if(n===`text`)return si(new TextDecoder().decode(t));if(n===`part`)return{refused:`shapefilePart`};let r;try{r=await Rc(`shp`)}catch(e){return console.warn(`perun-atlas: the shapefile reader could not be loaded`,e),{refused:`readerUnavailable`}}return li(await r.readShapefile(t,{kind:n,limit:Gr.bytes}))},Uc=({overlay:e,labels:t,onChange:n})=>{let r=e!==!1,[i,a]=Bc(null),[o,s]=Bc(null),[c,l]=Bc(null),[u,d]=Bc(null),f=zc(null),p=zc(0),m=()=>f.current?.click(),h=async e=>{let r=++p.current,i=Kr(e.size);if(!i){if(d(e.name),await Vc(),r!==p.current)return;try{i=await Hc(e)}catch(e){console.warn(`perun-atlas: a file could not be read`,e),i={refused:`unreadable`}}}if(r===p.current){if(i.refused){d(null),s(bs(i,e.name,t));return}s(null),l(i.assumed?vs(e.name,t):null),a({name:e.name,collection:i.collection,count:i.collection.features.length}),n?.()}},g=e=>{let t=e.target.files?.[0];e.target.value=``,t&&h(t)},_=()=>{p.current+=1,d(null),l(null),a(null),n?.()};return{offered:r,file:i,refusal:o,note:c,opening:u,inputRef:f,choose:m,onPicked:g,close:_,drawn:()=>d(null),failed:()=>{i&&(s(bs({refused:`unreadable`},i.name,t)),_())},dismiss:()=>s(null),dismissNote:()=>l(null)}},{useState:Wc}=t.React,Gc=({coloured:e})=>{let[t,n]=Wc(null),[r,i]=Wc(!0),a=e?{values:[],usedFallback:!1}:[],[o,s]=Wc(a),[c,l]=Wc(null),u=t===null?null:c??t,[d,f]=Wc(null);return{set:t,visible:u,loading:r,drawn:o,extent:d,setDrawn:s,setShown:l,setExtent:f,onFetchStart:()=>{i(!0),s(a)},onFetched:e=>{n(e??{features:[]}),i(!1)},onFetchFailed:()=>{n({features:[]}),l(null),f(null),i(!1)},forget:()=>n(null)}},{useEffect:Kc,useState:qc}=t.React,Jc=({subject:e,drawing:t})=>{let[n,r]=qc(null),i=t=>Qe(t,e?.id,e?.match);return Kc(()=>{if(!n)return;let e=e=>{e.key===`Escape`&&r(null)};return document.addEventListener(`keydown`,e),()=>document.removeEventListener(`keydown`,e)},[n]),{record:n,openRecord:(e,n)=>{t||n&&r(n)},closeRecord:()=>r(null),isSubject:i,descriptorFor:t=>e?.descriptor&&i(t)?e.descriptor:null,isPinnedFeature:e=>i(e)}},Yc=[`map`,`at`,`base`,`from`,`to`],Xc=/^\d{4}-\d{2}-\d{2}$/,Zc=e=>{let t=Math.max(e.indexOf(`#`),0),n=e.indexOf(`?`,t);return n===-1?{head:e,query:``}:{head:e.slice(0,n),query:e.slice(n+1)}},Qc=e=>Xc.test(e??``)&&new Date(`${e}T00:00:00Z`).toISOString().slice(0,10)===e,$c=(e,t)=>String(Number(e.toFixed(t))),el=e=>((e+180)%360+360)%360-180,tl=(e,t)=>{if(t==null||t===``)return null;let n=new URLSearchParams(Zc(e).query);if(n.get(`map`)!==String(t))return null;let r={},i=(n.get(`at`)??``).split(`,`);if(i.length===3&&i.every(e=>e.trim()!==``)){let[e,t,n]=i.map(Number);Math.abs(e)<=90&&Math.abs(t)<=180&&n>=0&&n<=30&&(r.center=[e,t],r.zoom=n)}let a=n.get(`base`);a&&(r.basemap=a);let o=n.get(`from`),s=n.get(`to`);return Qc(o)&&Qc(s)&&o<=s&&(r.from=o,r.to=s),r},nl=(e,t,{center:n,zoom:r,basemap:i,from:a,to:o}={})=>{let{head:s,query:c}=Zc(e),l=new URLSearchParams(c);return Yc.forEach(e=>l.delete(e)),l.set(`map`,String(t)),n&&Number.isFinite(r)&&l.set(`at`,[$c(n[0],6),$c(el(n[1]),6),$c(r,2)].join(`,`)),i&&l.set(`base`,i),a&&o&&(l.set(`from`,a),l.set(`to`,o)),`${s}?${l.toString().replace(/%2C/gi,`,`)}`},rl=new Set,il=(e,t)=>{if(rl.has(e))return null;let n=tl(e,t);return n&&rl.add(e),n},{useEffect:al,useRef:ol,useState:sl}=t.React,cl=2e3,ll=({linkId:e,link:t,timeScoped:n,range:r,labels:i={}})=>{let a=e!=null&&e!==``&&t!==!1,o=ol(null),[s,c]=sl(!1);return al(()=>{if(!s)return;let e=setTimeout(()=>c(!1),cl);return()=>clearTimeout(e)},[s]),{offered:a,copied:s,attach:({map:e,basemap:t})=>{o.current={map:e,basemap:t}},copy:async t=>{let{map:a,basemap:s}=o.current??{};if(!a)return;let l=a.getCenter(),u=nl(window.location.href,e,{center:[l.lat,l.lng],zoom:a.getZoom(),basemap:ut(s,a),...n&&{from:r.from,to:r.to}});await fo(u,t?.parentNode??void 0)?c(!0):window.prompt(i.copyLinkPrompt??`Copy this link:`,u)}}};Y(`/*
 * The panel's structure, and nothing about its look.
 *
 * \`FeaturePanel\` ships in this package, so the rules that make it a panel rather
 * than a stack of divs have to ship with it: a deployment that serves no
 * stylesheet of its own must still get a header, a toolbar, a map that fills the
 * space left over, and an empty-state that sits on top of the map instead of
 * below it.
 *
 * What it deliberately does not carry is the design -- colours, type, radii,
 * shadows, spacing. That lives in the deployment's own \`atlas-panel.css\`, which
 * is how the look of every map screen changes without releasing a bundle.
 *
 * For that to work the deployment's sheet has to win, and it does: the build
 * inserts this at the *top* of \`<head>\`, before the links the page adds for its
 * own stylesheets. Appending would have put this last and made the package the
 * final word on a look it should not have an opinion about. See
 * \`stylesAtTopOfHead\` in vite.config.mjs.
 *
 * Everything stays scoped under \`.atlas-panel\`. The Leaflet container is a single
 * instance borrowed from spatial and handed back, so a bare \`.leaflet-container\`
 * rule here would follow it onto every other screen that draws a map.
 */

.atlas-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #fff;
}

.atlas-panel__header,
.atlas-panel__toolbar,
.atlas-panel__footer {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
}

.atlas-panel__toolbar {
  align-items: flex-end;
}

.atlas-panel__title {
  /* Takes the row and lets the close button keep its corner. \`min-width: 0\` so a
     long title ellipsises inside the flex item rather than widening it. */
  flex: 1 1 240px;
  min-width: 0;
}

.atlas-panel__summary {
  flex: 1 1 auto;
}

.atlas-panel__actions {
  display: flex;
  gap: 8px;
}

/*
 * The map and anything drawn over it.
 *
 * \`position: relative\` is what the empty-state is absolutely positioned against,
 * and \`min-height: 0\` is what stops a flex item from refusing to shrink below
 * its content -- without it the map pushes the footer off the bottom.
 */
/*
 * The map and the record beside it.
 *
 * One row, so a record opens next to what it describes rather than on top of
 * it. \`min-height: 0\` for the same reason the panel root has it -- a flex item
 * that will not shrink below its content pushes the footer off the bottom.
 */
.atlas-panel__body {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
}

/*
 * How tall a map is when nothing above it says.
 *
 * \`.atlas-panel\` takes its height from whatever contains it, and a good many
 * containers -- a bootstrap modal body among them -- have none of their own, so
 * the panel is only as tall as its parts and the map falls back to this floor.
 * At 20rem that was 320px of map under a toolbar, which is a thumbnail rather
 * than something to measure on.
 *
 * Viewport-relative rather than a fixed rem, because the containers that supply
 * no height are the ones filling the window, and a token rather than a constant
 * so a screen that wants a short map can say so from its menu row:
 *
 *     "tokens": { "--ap-map-height": "24rem" }
 *
 * Still a floor, not a height: a container that does give the panel a height
 * keeps deciding, and this never fights it.
 */
.atlas-panel__mapwrap {
  position: relative;
  flex: 1 1 auto;
  min-height: var(--ap-map-height, 55vh);
  /* The map is what gives way when the pane opens, and a flex item will not go
     below its content width without this. */
  min-width: 0;
}

.atlas-panel__map {
  width: 100%;
  height: 100%;
}

.atlas-panel__map .atlas-map {
  width: 100%;
  height: 100%;
}

/*
 * The record pane.
 *
 * A fixed column rather than a share of the row: a record of four fields and one
 * of twenty should not resize the map by different amounts. Only the list
 * scrolls, so the heading and its close button stay reachable however long the
 * record is -- which, with a spec that shows everything a feature carries, is
 * not a length this package gets to assume.
 */
.atlas-panel__details {
  flex: 0 0 20rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.atlas-panel__detailshead {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 12px 16px;
}

.atlas-panel__detailstitle {
  flex: 1 1 auto;
  min-width: 0;
}

.atlas-panel__detailsbody {
  margin: 0;
  padding: 0 16px 16px;
  /* Takes the space the heading leaves, and \`min-height: 0\` is what lets it:
     without it a flex item will not shrink below its content, so a long record
     would push past the pane and be clipped by the \`overflow: hidden\` above
     rather than scrolling inside it. */
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  /* A record scrolled to its end should not then scroll the page behind it. */
  overscroll-behavior: contain;
}

.atlas-panel__detailsrow {
  min-width: 0;
}

.atlas-panel__detailsrow dt,
.atlas-panel__detailsrow dd {
  margin: 0;
  /* An identifier or an address has no spaces to break at, and a column this
     narrow is where that shows as text running out of the panel. */
  overflow-wrap: anywhere;
}

/*
 * Narrow: the pane goes under the map rather than beside it, and takes a share
 * of the height instead of a fixed width. Half at most, so the map it is
 * describing is still on screen.
 */
@media (max-width: 40rem) {
  .atlas-panel__body {
    flex-direction: column;
  }

  .atlas-panel__details {
    flex: 0 1 auto;
    max-height: 50%;
  }
}

.atlas-panel__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Above Leaflet's panes (400) and its controls (1000 is the shadow pane), so
     the message is not drawn underneath the tiles it is explaining. */
  z-index: 1001;
  /* The map underneath stays usable: only the card takes pointer events. */
  pointer-events: none;
}

.atlas-panel__emptycard {
  /* What the close button below is placed against. */
  position: relative;
  pointer-events: auto;
  max-width: 22rem;
  padding: 16px 20px;
  text-align: center;
  background: #fff;
}

/*
 * The card's close, in its corner.
 *
 * \`atlas-panel__close\` like every other close on the panel, so a deployment's
 * sheet gives it the same look as the others; only its place and its size are
 * said here, at the size the record pane's close is drawn at. Two classes, so
 * this wins over a deployment's single-class \`.atlas-panel__close\` wherever the
 * two disagree about the size.
 */
.atlas-panel__emptycard .atlas-panel__close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

/* Room for the close on both sides, so the title stays centred and clear of it. */
.atlas-panel__emptycard .atlas-panel__emptytitle {
  padding-inline: 32px;
}

/*
 * The labels switch, which is behaviour rather than decoration.
 *
 * The button is part of the component now, so the rule that makes it do
 * something has to ship with it -- a deployment serving no stylesheet would
 * otherwise get a control that toggles a class nothing reads.
 *
 * Hiding is the honest half of the switch: a label is opened and closed by its
 * zoom band, and CSS can take one off the screen but cannot put one on the
 * screen that Leaflet has not opened. So this hides what is showing, and the
 * band still decides what shows.
 */
.atlas-panel--nolabels .atlas-label {
  display: none;
}

@media (max-width: 640px) {
  .atlas-panel__toolbar,
  .atlas-panel__footer {
    align-items: stretch;
    flex-direction: column;
  }
}

/*
 * What there is to do here: the tools, and the file buttons.
 *
 * One group at the far end of the toolbar, away from the controls that change
 * what is on screen -- the date window, the label switch -- because these are
 * the other kind of control: a tool changes what is on the server, a file button
 * takes a copy of what is on screen, and both are things the reader does rather
 * than ways of looking. Two groups made that one distinction into two, and the
 * two ends drifted apart as the row wrapped.
 *
 * \`margin-inline-start: auto\` rather than a spacer element, so the group still
 * wraps onto its own line at a narrow width instead of being held out by a gap.
 * It wraps within itself as well: a third tool takes the row it needs rather
 * than pushing the file buttons off the end.
 */
.atlas-panel__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-inline-start: auto;
}

/*
 * Icon and label on one line.
 *
 * Two classes deep, so this holds whatever the deployment's sheet does to
 * \`.atlas-panel__btn\` at one class: that rule owns the look of the button, and
 * this owns the arrangement of the two things inside it, which it cannot know
 * about. An icon that fails to load leaves the label where it was.
 */
.atlas-panel__actions .atlas-panel__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/*
 * Waiting.
 *
 * Its own overlay rather than perun-core's \`Loading\`: that component's
 * \`.fade-wrapper\` is a fixed, full-viewport blackout at z-index 9999, which is
 * right for a page transition and would black out the whole application every
 * time a map panel changed its date range.
 *
 * Non-blocking on purpose. \`pointer-events: none\` leaves the map underneath
 * usable while a request is out, so a slow service feels like a map still
 * loading rather than a screen that has seized. The chip is a report, not a
 * modal -- and it reports a write the same way, because the controls a write
 * must not be pressed twice from are disabled for its duration anyway.
 *
 * Same overlay-and-card shape as the empty state, and the same z-index, because
 * they are the same slot: one is what waiting looks like and the other is what
 * the answer looked like, and they are never both true.
 */
.atlas-panel__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  pointer-events: none;
}

.atlas-panel__loadingcard {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 14px;
  border-radius: 999px;
  background: #fff;
  font-size: 13px;
}

.atlas-panel__spinner {
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: atlas-panel-spin 700ms linear infinite;
}

@keyframes atlas-panel-spin {
  to { transform: rotate(360deg); }
}

/*
 * Slowed rather than stopped. A spinner that does not move is not a still
 * picture of waiting, it is a picture of something broken -- and this is the one
 * element on the panel whose whole job is to say that something is still
 * happening.
 */
@media (prefers-reduced-motion: reduce) {
  .atlas-panel__spinner { animation-duration: 2.4s; }
}
`);var{useEffect:ul,useMemo:dl,useState:fl}=t.React,pl=({session:e,servicePath:n,context:r,descriptors:i,labelResolver:a,cluster:o,subject:s,presets:c=[],defaultMonths:l,labels:u={},map:f,exportable:p,overlay:m,legend:h=!0,notice:g=!0,tokens:_,title:v,choropleth:y,draw:b,view:x,linkId:S,link:C,className:ee=``,onClose:w})=>{let[T,E]=fl(!0),[D,O]=fl(!!x?.center),j=()=>{D&&O(!1)},[M,re]=fl(null),{timeScoped:N,preset:ie,range:P,initial:F,longest:ae,applyPreset:oe,onRangeChange:se}=cc({presets:c,defaultMonths:l,servicePath:n,opening:x?.from&&x?.to?{from:x.from,to:x.to}:void 0,onMoved:()=>{we(),We()}}),ce=dl(()=>({...r||{},...N&&{from:P.from,to:P.to},...M&&{srid:M}}),[r,N,P.from,P.to,M]),le=JSON.stringify(ce),{coloured:ue,statusPath:de,rows:fe,tooltip:pe}=tc({choropleth:y,bindings:ce,bindingKey:le}),{set:me,visible:he,loading:ge,drawn:_e,extent:ve,setDrawn:ye,setShown:be,setExtent:I,onFetchStart:xe,onFetched:Se,onFetchFailed:Ce,forget:we}=Gc({coloured:ue}),[Te,Ee]=fl([]),De=e=>Ee(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e]),L=()=>Ee([]),[Oe,ke]=fl(null),{drawable:Ae,drawing:R,shape:je,selection:z,note:Me,form:Ne,saving:Pe,reload:Fe,setShape:Ie,setNote:Le,startDrawing:Re,finishDrawing:ze,clearDrawing:Be,saveShape:Ve}=Sc({draw:b,dataSrid:M,set:he,bindings:ce,labels:u}),{record:He,openRecord:Ue,closeRecord:We,descriptorFor:Ge,isPinnedFeature:Ke}=Jc({subject:s,drawing:R}),B=Uc({overlay:m,labels:u,onChange:()=>Ee(e=>e.filter(e=>e!==te))}),{file:qe}=B;ul(()=>{He?.file&&He.file!==qe&&We()},[qe]);let Je=Mc({set:he,selection:z,exportable:p,labelResolver:a,timeScoped:N,range:P,srid:M,drawnWith:e=>ue?i?.[y.descriptor]:d(i?.[Ge(e)??Xe(e)],e)}),Ye=ll({linkId:S,link:C,timeScoped:N,range:P,labels:u}),Ze=!ge&&me!==null&&(me.features?.length??0)===0&&g!==!1&&!R&&!je&&!qe&&Oe!==le;return t.React.createElement(`div`,{className:`atlas-panel ${ee}${T?``:` atlas-panel--nolabels`}`.trim(),style:_},t.React.createElement(`header`,{className:`atlas-panel__header`},t.React.createElement(`div`,{className:`atlas-panel__title`},v),w&&t.React.createElement(Rs,{label:u.close??`Close`,onClick:w})),t.React.createElement(`div`,{className:`atlas-panel__toolbar`},N&&t.React.createElement(Zs,{range:P,onRangeChange:se,presets:c,preset:ie,applyPreset:oe,labels:u}),!ue&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__switch`,"aria-pressed":T,onClick:()=>E(!T)},t.React.createElement(`span`,{className:`atlas-panel__track`},t.React.createElement(`span`,{className:`atlas-panel__knob`})),u.labels??`Labels`),(Ae||Je.canExport||B.offered||Ye.offered)&&t.React.createElement(`div`,{className:`atlas-panel__actions`},Ae&&t.React.createElement(Lo,{drawing:R,busy:Pe,labels:u,onStart:Re,onCancel:Be}),Je.canExport&&t.React.createElement(Hs,{exporter:Je,labels:u}),t.React.createElement(Ws,{fileOverlay:B,labels:u}),Ye.offered&&t.React.createElement(qs,{viewLink:Ye,labels:u})),t.React.createElement(Gs,{fileOverlay:B,labels:u}),Ae&&(R||je)&&t.React.createElement(Vo,{shape:je,drawing:R,busy:Pe,limits:b.radius,caught:z.selecting?{count:z.count,total:z.total}:void 0,savable:!!b.save?.onSave,note:b.note?{value:Me,onChange:Le,required:b.note.required}:void 0,form:Ne,labels:u,onCancel:Be,onRadius:e=>Ie(t=>t&&{...t,radius:e}),onSave:Ve})),t.React.createElement(`div`,{className:`atlas-panel__body`},t.React.createElement(`div`,{className:`atlas-panel__mapwrap`},t.React.createElement(`div`,{className:`atlas-panel__map`},t.React.createElement(io,{session:e,layerSwitcher:!0,...f,extent:ve,view:x,onReady:e=>{re(e.config?.dataSrid??null),Ye.attach(e)}},ue?(fe!==null||!de)&&t.React.createElement(wo,{servicePath:n,context:ce,srid:M,reload:Fe,statusRows:fe,join:y.join,field:y.field,palette:y.palette,fallback:y.fallback,descriptor:i?.[y.descriptor],labelResolver:a,tooltip:pe,hidden:Te,onFeatureClick:Ue,onLegend:ye,onShown:be,onLoadStart:xe,onLoad:Se,onError:Ce}):t.React.createElement(ss,{servicePath:n,context:ce,reload:Fe,descriptors:i,descriptorFor:Ge,labelResolver:a,cluster:o,pinned:Ke,hidden:Te,fit:!D,onFeatureClick:Ue,onLegend:ye,onShown:be,onExtent:I,onLoadStart:xe,onLoad:e=>{j(),Se(e)},onError:e=>{j(),Ce(e)}}),qe&&t.React.createElement(Os,{file:qe,srid:M,hidden:Te.includes(te),labelResolver:a,onFeatureClick:Ue,onDrawn:B.drawn,onError:B.failed}),Ae&&t.React.createElement(Mo,{value:je,drawing:R,style:b.style,onChange:Ie,onDrawn:ze}),h!==!1&&t.React.createElement(Ls,{entries:[...ue?ne({palette:y.palette,fallback:y.fallback??A.__unknown,unknownLabel:y.unknownLabel,..._e},a):k(_e,a),...qe?[ds(qe.name)]:[]],title:u.legend,hidden:Te,onToggle:De,onShowAll:L,showAllLabel:u.showAll,position:typeof h==`string`?h:void 0}))),(ge||Pe||B.opening)&&t.React.createElement(Js,{saving:Pe,opening:B.opening,labels:u}),Ze&&t.React.createElement(zs,{timeScoped:N,longest:ae,preset:ie,applyPreset:oe,labels:u,onClose:()=>ke(le)})),He&&t.React.createElement(Xs,{record:He,labels:u,onClose:We})),(N||w)&&t.React.createElement(Ys,{timeScoped:N,range:P,initial:F,applyPreset:oe,labels:u,onClose:w}))};Y(`/*
 * The default pin.
 *
 * Leaflet only applies \`leaflet-div-icon\` — a white box with a grey border —
 * when no className is given, but reset it here in case that ever changes.
 *
 * The pin takes its fill from \`color\`, so a consumer restyles it with one
 * declaration and does not have to supply its own markup.
 */
.atlas-pin {
  background: transparent;
  border: 0;
  color: #4a6a85;
  cursor: grab;
}

.atlas-pin:active {
  cursor: grabbing;
}

.atlas-pin svg {
  display: block;
  filter: drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.22));
}
`);var{Map:ml,factory:hl}=I,{useEffect:gl,useRef:_l}=t.React,vl=`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 26 36">
  <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 23 13 23s13-13.25 13-23C26 5.82 20.18 0 13 0z"
        fill="currentColor" stroke="#ffffff" stroke-width="1.75"/>
  <circle cx="13" cy="13" r="4" fill="#ffffff"/>
</svg>`,yl=({value:e,onChange:t,draggable:n=!0,className:r=`atlas-pin`,html:i=vl,size:a=[20,28],anchor:o=[10,28]})=>{let s=_l(null),c=_l(t);return c.current=t,gl(()=>{let e=e=>c.current?.({lat:e.latlng.lat,lng:e.latlng.lng});return ml.on(`click`,e),()=>{ml.off(`click`,e),s.current&&(ml.removeLayer(s.current),s.current=null)}},[]),gl(()=>{if(!e){s.current&&(ml.removeLayer(s.current),s.current=null);return}if(s.current){s.current.setLatLng(e);return}let t=hl.marker(e,{icon:hl.divIcon({className:r,html:i,iconSize:a,iconAnchor:o}),draggable:n}).addTo(ml);t.on(`drag`,e=>c.current?.({...e.target.getLatLng()})),s.current=t},[e?.lat,e?.lng]),null},{labelsManager:bl}=t.utils,{useMemo:xl,useState:Sl}=t.React,Cl=(e,n)=>{let{objConfig:r,objectId:i,session:a,labelDomain:o=`main`,title:s,className:c,linkId:l,onClose:u}=e,[d]=Sl(()=>il(window.location.href,l)),f=e=>{if(!e)return;let t=bl(e,n,o);return!t||t===`perun.${o}.${e}`?void 0:t},p=xl(()=>({session:a,objectId:i,...r?.context||{}}),[a,i,r]),m=xl(()=>(r?.presets||[]).map(({months:e,label:t})=>({months:e,label:f(t)??`${e}`})),[r]),h=xl(()=>Object.fromEntries(Object.entries(r?.labels||{}).map(([e,t])=>[e,f(t)])),[r]),g=r?.service;return g?t.React.createElement(pl,{session:a,servicePath:g,context:p,descriptors:r?.descriptors||{},labelResolver:f,cluster:r?.cluster,subject:r?.subject?{...r.subject,id:i}:void 0,title:s??f(r?.title),presets:m,defaultMonths:r?.defaultMonths,map:r?.map,choropleth:r?.choropleth,draw:r?.draw,exportable:r?.export,overlay:r?.overlay,legend:r?.legend,notice:r?.notice,tokens:r?.tokens,labels:h,view:d??void 0,linkId:l,link:r?.link,className:c,onClose:u}):t.React.createElement(`div`,{className:`atlas-panel-unavailable`},f(`map_service_missing`)??`This button has no map service configured.`)};Cl.contextTypes={intl:t.PropTypes.object.isRequired};var wl=(0,t.connect)((e,t)=>({session:t.session??e?.security?.svSession}))(Cl),Tl=a,El=o;e.AtlasMap=io,e.Choropleth=wo,e.CirclePicker=Mo,e.ConfiguredMap=wl,e.DateRange=Po,e.DrawBar=Vo,e.DrawTool=Lo,e.FeaturePanel=pl,e.FeatureSet=ss,e.Legend=Is,e.LegendControl=Ls,e.PointPicker=yl,e.ZoomRail=Ga,Object.defineProperty(e,"appearance",{enumerable:!0,get:function(){return P}}),Object.defineProperty(e,"bootstrap",{enumerable:!0,get:function(){return Ke}}),Object.defineProperty(e,"config",{enumerable:!0,get:function(){return oe}}),Object.defineProperty(e,"data",{enumerable:!0,get:function(){return ui}}),e.name=Tl,e.version=El});