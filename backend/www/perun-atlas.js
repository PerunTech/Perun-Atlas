(function(e,t){typeof exports==`object`&&typeof module<`u`?t(exports,require("perun-core"),require("spatial")):typeof define==`function`&&define.amd?define([`exports`,`perun-core`,`spatial`],t):(e=typeof globalThis<`u`?globalThis:e||self,t(e[`perun-atlas`]={},e[`perun-core`],e.spatial))})(this,function(e,t,n){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});var r=Object.defineProperty,i=(e,t)=>{let n={};for(var i in e)r(n,i,{get:e[i],enumerable:!0});return t||r(n,Symbol.toStringTag,{value:`Module`}),n},a=`perun-atlas`,o=`1.0.0-rc.1`,s={crs:{type:`crs`,param:`SPATIAL_CRS`,legacy:`sysCrs`,required:!0,doc:`EPSG code, or { code, def } for a proj4 definition.`},center:{type:`latlng`,param:`SPATIAL_CENTER`,legacy:`sysCenter`,required:!0,doc:`Initial map centre as { lat, lng }.`},bounds:{type:`bounds`,param:`SPATIAL_BOUNDS`,legacy:`sysBounds`,doc:`Spatial limits as [ {lat,lng} southwest, {lat,lng} northeast ].`},zoom:{type:`int`,param:`SPATIAL_ZOOM`,default:8},minZoom:{type:`int`,param:`SPATIAL_MIN_ZOOM`,default:0},maxZoom:{type:`int`,param:`SPATIAL_MAX_ZOOM`,default:18},bboxOrder:{type:`bool`,param:`SPATIAL_SWITCH_BBOX_ORDER`,legacy:`switchBboxOrder`,default:!1,doc:`Reverse WMS bounding box axis order.`},units:{type:`enum`,param:`SPATIAL_MEASUREMENT_SYSTEM`,legacy:`measurementSystem`,values:[`metric`,`imperial`],default:`metric`},attribution:{type:`string`,param:`SPATIAL_ATTRIBUTION`,default:``},dataSrid:{type:`srid`,param:`sys.gis.default_srid`,default:`4326`,doc:`EPSG code the database stores geometry in, without the prefix.`}},c=Object.keys(s).filter(e=>s[e].required),l=i({REQUIRED:()=>c,SCHEMA:()=>s}),u=Object.getPrototypeOf(n.spatial);u.assets;var d=u.config,f=u.core,p=u.data,m=u.tools;u.ui,u.proj4;var h=(e,t,n)=>{throw TypeError(`perun-atlas: cannot read "${e}" as ${n} (got ${JSON.stringify(t)})`)},g=e=>{if(typeof e!=`string`)return e;let t=e.trim();if(!t.startsWith(`{`)&&!t.startsWith(`[`))return e;try{return JSON.parse(t)}catch{return e}},_=(e,t)=>{let n=g(t);if(n&&typeof n==`object`&&`lat`in n&&`lng`in n)return{lat:Number(n.lat),lng:Number(n.lng)};if(typeof n==`string`&&n.includes(`,`)){let[e,t]=n.split(`,`).map(Number);if(Number.isFinite(e)&&Number.isFinite(t))return{lat:e,lng:t}}return h(e,t,`a { lat, lng } pair`)},v={string:(e,t)=>String(t),int:(e,t)=>{let n=Number(t);return Number.isInteger(n)?n:h(e,t,`an integer`)},bool:(e,t)=>{if(typeof t==`boolean`)return t;let n=String(t).trim().toLowerCase();return[`true`,`1`,`yes`].includes(n)?!0:![`false`,`0`,`no`].includes(n)&&h(e,t,`a boolean`)},enum:(e,t,n)=>n.values.includes(t)?t:h(e,t,`one of ${n.values.join(`, `)}`),latlng:_,bounds:(e,t)=>{let n=g(t);return Array.isArray(n)&&n.length===2?[_(e,n[0]),_(e,n[1])]:h(e,t,`a [southwest, northeast] pair`)},srid:(e,t)=>{let n=String(t).trim().replace(/^EPSG:/i,``);return/^\d{4,6}$/.test(n)?n:h(e,t,`an EPSG code such as 4326`)},crs:(e,t)=>{let n=g(t);return typeof n==`string`&&n.startsWith(`EPSG:`)||n&&typeof n==`object`&&n.code?n:h(e,t,`an EPSG code or { code, def } object`)}},y=(e,t,n)=>{let r=v[n.type];if(!r)throw TypeError(`perun-atlas: no coercion for type "${n.type}" on "${e}"`);return r(e,t,n)},b=async()=>{let e=Object.entries(s).filter(([,e])=>e.param),n=await Promise.all(e.map(([e,n])=>t.axios.get(`${window.server}/WsConf/params/get/sys/${n.param}`).then(t=>[e,t?.data?.VALUE]).catch(()=>[e,void 0])));return Object.fromEntries(n.filter(([,e])=>e!==void 0&&e!==``))},x=()=>{let e={};return Object.entries(s).forEach(([t,n])=>{if(!n.legacy)return;let r=window[n.legacy];r!=null&&r!==``&&(e[t]=r)}),e},S=()=>Object.fromEntries(Object.entries(s).filter(([,e])=>`default`in e).map(([e,t])=>[e,t.default])),C=(e,t,n)=>{let r=Object.keys(e).filter(e=>!(e in t)&&!(e in n));r.length&&console.warn(`perun-atlas: ${r.length} setting(s) still come from window globals — `+r.map(e=>`window.${s[e].legacy}`).join(`, `)+`. Seed `+r.map(e=>s[e].param).join(`, `)+` in SVAROG_SYS_PARAMS; this fallback is temporary.`)},w=async(e={})=>{let t=await b(),n=x(),r={...S(),...n,...t,...e};C(n,t,e);let i={},a=[];Object.entries(s).forEach(([e,t])=>{let n=r[e];if(n!==void 0)try{i[e]=y(e,n,t)}catch(e){a.push(e.message)}});let o=c.filter(e=>i[e]===void 0);if(o.length&&a.push(`missing required setting(s): `+o.map(e=>`${e} (parameter ${s[e].param})`).join(`, `)),a.length)throw Error(`perun-atlas: configuration could not be resolved.
  - `+a.join(`
  - `));return i},T=e=>Array.isArray(e)&&typeof e[0]==`number`,E=e=>{if(!e)return[];if(e.type===`GeometryCollection`)return(e.geometries??[]).flatMap(E);let t=e=>Array.isArray(e)?T(e)?[e]:e.flatMap(t):[];return t(e.coordinates)},D=(e,t)=>{if(!e)return e;if(e.type===`GeometryCollection`)return{...e,geometries:(e.geometries??[]).map(e=>D(e,t))};let n=e=>Array.isArray(e)?T(e)?t(e):e.map(n):e;return{...e,coordinates:n(e.coordinates)}},O=(e,t)=>Array.isArray(e?.features)?{...e,features:e.features.map(e=>e?.geometry?{...e,geometry:D(e.geometry,t)}:e)}:e,{Map:k,factory:A}=f,j={3857:()=>A.CRS.EPSG3857,3395:()=>A.CRS.EPSG3395,4326:()=>A.CRS.EPSG4326},M=e=>j[String(e)]?.()??null,N=e=>e??k,P=new Set,F=e=>e==null?null:M(e)||(P.has(String(e))||(P.add(String(e)),console.warn(`perun-atlas: cannot express a coordinate in EPSG:${e} — the engine builds 3857, 3395 and 4326. Using the map's own projection instead, which is correct only if this deployment stores geometry in it.`)),null),I=(e,t)=>{let n=F(e);if(!n)return N(t).getBBox();let r=N(t).getBounds(),i=n.projection.project(r.getSouthWest()),a=n.projection.project(r.getNorthEast());return`${i.x},${i.y},${a.x},${a.y}`},L=(e,t,n)=>{let{x:r,y:i}=(F(t)??N(n).getCRS()).projection.project(A.latLng(e));return{x:r,y:i}},R=(e,t,n)=>{let[r,i]=Array.isArray(e)?e:[e?.x,e?.y],{lat:a,lng:o}=(F(t)??N(n).getCRS()).projection.unproject(A.point(r,i));return{lat:a,lng:o}},z=(e,t,n)=>O(e,e=>{let{lat:r,lng:i}=R(e,t,n);return[i,r,...e.slice(2)]}),ee=(e,t,n)=>O(e,e=>{let{x:r,y:i}=L({lat:e[1],lng:e[0]},t,n);return[r,i,...e.slice(2)]}),te=(e,t,n)=>ne(e,t,n).ew,ne=(e,t,n)=>{let r=.001,i=A.latLng(e),a=A.latLng({lat:i.lat,lng:i.lng+r}),o=A.latLng({lat:i.lat+r,lng:i.lng}),s=L(i,t,n),c=N(n).distance(i,a),l=N(n).distance(i,o);return{ew:c?Math.abs(L(a,t,n).x-s.x)/c:1,ns:l?Math.abs(L(o,t,n).y-s.y)/l:1}},re=e=>e>0?Math.min(12,Math.max(0,3-Math.floor(Math.log10(e)))):6,ie=(e,t)=>{let n=10**t;return Math.round(e*n)/n},ae=(e,t,n,r=24,i)=>{let{ew:a,ns:o}=ne(e,n,i),{x:s,y:c}=L(e,n,i),l=t*a,u=t*o,d=re(Math.min(l,u));return Array.from({length:Math.max(3,r)},(e,t)=>{let n=2*Math.PI*t/Math.max(3,r);return{x:ie(s+l*Math.cos(n),d),y:ie(c+u*Math.sin(n),d)}})},{Map:oe,store:se}=f,ce={crs:`crs`,center:`center`,bounds:`bounds`,zoom:`zoom`,minZoom:`minZoom`,maxZoom:`maxZoom`,units:`measurementSystem`,bboxOrder:`switchBboxOrder`},le=e=>{if(!e)return;let t=oe.getCRS?.()?.code,n=typeof e==`object`?e.code:e;t&&n&&t!==n&&console.warn(`perun-atlas: this deployment declares ${n}, but the map is on ${t}. The engine could not resolve the declared value — as a plain code it must be EPSG:3857, EPSG:3395 or EPSG:4326, and any other projection needs a proj4 definition. Basemap tiles will be requested outside the grid they are published on.`)},ue=e=>{if(!e)return;se.addState(`dbCRSCode`,{dbCRS:e});let t=M(e);if(t){se.addState(`dbCRS`,t);return}let n=oe.getCRS?.()?.code;e!==n?.split(`:`)[1]&&console.warn(`perun-atlas: this deployment stores geometry in EPSG:${e}, which spatial cannot convert from — it handles 3857, 3395 and 4326. Geometry will be read as though it were already in ${n}, and will be drawn in the wrong place.`)},de=(e={})=>{let t={};Object.entries(ce).forEach(([n,r])=>{e[n]!==void 0&&(t[r]=e[n])});let n=d.configure(t);return le(e.crs),ue(e.dataSrid),n},fe=(e,t)=>{let n=e;for(let e=0;e<t.length;e+=1){if(n==null)return n;let r=t.length-e===1?t[e]:t.slice(e).join(`.`);if(Object.prototype.hasOwnProperty.call(Object(n),r))return n[r];n=n[t[e]]}return n},B=(e,t)=>fe(e,String(t).split(`.`)),pe=e=>{let t=String(e).split(`.`);return e=>fe(e,t)},V=(e,t)=>e.replace(/\{([^}]+)\}/g,(e,n)=>{let r=B(t,n);return r==null?e:String(r)}),{geobuf:me,Pbf:he}=p,ge=(e,t,n)=>{window.PERUN_ATLAS_LAST=n,console.groupCollapsed(`perun-atlas: ${n.features.length} feature(s), ${t} bytes — ${e}`),console.log(`collection`,n),console.log(`also at window.PERUN_ATLAS_LAST`),console.groupEnd()},_e=async(e,n={})=>{let r=`${window.server}${V(e,n)}`,i=await(0,t.axios)({method:`get`,url:r,responseType:`arraybuffer`}),a=i?.data?.byteLength??0;if(!i?.data||a===0){let e={type:`FeatureCollection`,features:[]};return ge(r,a,e),e}let o=me.decode(new he(new Uint8Array(i.data)));if(!o||!o.type){console.warn(`perun-atlas: response from ${r} decoded to no GeoJSON type; treating as empty`),console.warn(`perun-atlas: response body was`,new TextDecoder().decode(i.data).slice(0,500));let e={type:`FeatureCollection`,features:[]};return ge(r,a,e),e}let s=o.type===`FeatureCollection`?o:{type:`FeatureCollection`,features:[o]};return ge(r,a,s),s},ve=e=>e?.properties?.DESCRIPTOR??e?.properties?.descriptor??null,ye=e=>({id:e?.id??e?.properties?.OBJECT_ID??null,parentId:e?.properties?.parent_id??e?.properties?.PARENT_ID??null}),be=(e,t,n=`id`)=>{if(t==null)return!1;let r=ye(e),i=n===`parent`?r.parentId:r.id;return i!=null&&String(i)===String(t)},{factory:xe}=f,{getServerOrigin:Se}=t.utils,Ce=`GEO_LAYER_TYPE`,we={BASEMAP:`1`,OVERLAY:`2`},Te=(e,t=Ce)=>({layerType:e?.[`${t}.LAYER_TYPE`],protocol:(e?.[`${t}.PROTOCOL`]??``).toLowerCase(),version:e?.[`${t}.VERSION`]||`1.1.1`,format:e?.[`${t}.FORMAT`]||`image/png`,url:e?.[`${t}.URL`],group:e?.[`${t}.LAYER_GROUP`]||`Other`,title:e?.[`${t}.TITLE`],label:e?.[`${t}.LABEL_CODE`]||e?.[`${t}.TITLE`]}),Ee=[{match:/openstreetmap\.org/i,maxNativeZoom:19,attribution:`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`},{match:/opentopomap\.org/i,maxNativeZoom:17,attribution:`&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)`},{match:/cartocdn\.com/i,maxNativeZoom:20,attribution:`&copy; <a href="https://carto.com/attributions">CARTO</a>`},{match:/arcgisonline\.com/i,attribution:`Tiles &copy; <a href="https://www.esri.com">Esri</a>`}],De=e=>Ee.find(t=>t.match.test(e??``))??{},Oe=(e,{maxZoom:t}={})=>{let n=e.url||Se(),r=De(n),i={...t!=null&&{maxZoom:t},...r.maxNativeZoom!=null&&{maxNativeZoom:r.maxNativeZoom}},a=r.attribution?{attribution:r.attribution}:{};if(e.protocol===`wms`)return xe.tileLayer.extendedWMS(n,{layers:e.title,format:e.format,version:e.version,transparent:!0,uppercase:!0,...i,...a,...e.layerType===we.OVERLAY&&{tiled:!0,isOverlay:!0}});if(e.protocol===`tile`){let e=/google|mt\{s\}/i.test(n);return xe.tileLayer(n,{...i,...a,...e&&{subdomains:[`mt0`,`mt1`,`mt2`,`mt3`]}})}return e.protocol===`grid`?e.url?.includes(`google`)?xe.gridLayer.googleMutant({maxZoom:24,type:e.url.split(`_`)[1]}):(console.warn(`perun-atlas: grid layer "${e.title}" has no recognised provider in its URL`),null):(console.warn(`perun-atlas: unsupported layer protocol "${e.protocol}" for "${e.title}"`),null)},ke=async(e,n={})=>{let r={},i={},a=(await t.axios.get(`${window.server}/ReactElements/getTableData/${e}/${Ce}/0`).catch(e=>(console.error(`perun-atlas: layer catalogue unavailable`,e),null)))?.data;return Array.isArray(a)&&a.forEach(e=>{let t=Te(e),a=Oe(t,n);if(!a)return;let o=t.layerType===we.OVERLAY?i:r;o[t.group]=o[t.group]||{},o[t.group][t.label]=a}),{basemap:r,overlays:i}},Ae=e=>{let t=Object.values(e??{})[0];return t?Object.values(t)[0]:null},je=(e,t)=>{if(!t)return null;let n=Object.values(e??{}).find(e=>Object.prototype.hasOwnProperty.call(e,t));return n?n[t]:null},Me=(e,t)=>{for(let n of Object.values(e??{})){let e=Object.entries(n).find(([,e])=>t?.hasLayer?.(e));if(e)return e[0]}return null},Ne=async(e,n={})=>{if(!e)return[];let r=`${window.server}${V(e,n)}`,i=(await t.axios.get(r).catch(e=>(console.error(`perun-atlas: rows unavailable from ${r}`,e),null)))?.data;return i&&!Array.isArray(i)&&console.warn(`perun-atlas: ${r} answered with no array of rows; treating as empty`),Array.isArray(i)?i:[]},Pe=async(e,n,r,i)=>{if(!e)return null;let a=`${window.server}${V(e,n)}`,o=await t.axios.get(a).catch(e=>(console.error(`perun-atlas: no ${r} from ${a}`,e),null));if(!o)return null;let s=o.data;return i(s)?s:(console.error(`perun-atlas: ${a} answered with no ${r}`,s),null)},Fe=e=>!!e&&typeof e==`object`&&!Array.isArray(e),Ie=(e,t={})=>Pe(e,t,`form schema`,e=>Fe(e)&&!!e.properties),Le=(e,t={})=>Pe(e,t,`form layout`,Fe),Re=(e,t)=>{if(!e?.properties||!t?.length)return e??null;let n=e.properties,r={},i=new Set;t.forEach(e=>{if(Object.prototype.hasOwnProperty.call(n,e)){r[e]=n[e],i.add(e);return}let t=e.lastIndexOf(`.`),a=t===-1?``:e.slice(0,t),o=t===-1?``:e.slice(t+1),s=a?n[a]:null,c=s?.properties?.[o];if(!c){console.warn(`perun-atlas: the form schema has no "${e}", so it is not on the form`);return}if(i.has(a))return;let l=r[a]??{...s,properties:{}};l.properties={...l.properties,[o]:c},r[a]=l}),Object.keys(r).forEach(e=>{if(i.has(e))return;let t=r[e],a=(n[e].required??[]).filter(e=>e in t.properties);a.length?t.required=a:delete t.required});let a={...e,properties:r};delete a.title;let o=(e.required??[]).filter(e=>e in r);if(o.length?a.required=o:delete a.required,a.dependencies){let e=Object.entries(a.dependencies).filter(([e])=>e in r);e.length?a.dependencies=Object.fromEntries(e):delete a.dependencies}return a},ze=(e,t)=>{if(!t?.properties)return e??{};let n={...e??{}};return Object.entries(t.properties).forEach(([e,t])=>{t?.properties&&(n[e]=ze(n[e],t))}),n},Be={boolean:[`checkbox`,`radio`,`select`,`hidden`],string:[`text`,`password`,`email`,`hostname`,`ipv4`,`ipv6`,`uri`,`data-url`,`radio`,`select`,`textarea`,`hidden`,`date`,`datetime`,`date-time`,`alt-date`,`alt-datetime`,`time`,`color`,`file`],number:[`text`,`select`,`updown`,`range`,`radio`,`hidden`],integer:[`text`,`select`,`updown`,`range`,`radio`,`hidden`],array:[`select`,`checkboxes`,`files`,`hidden`]},Ve=new Set([`AltDateTimeWidget`,`AltDateWidget`,`CheckboxWidget`,`CheckboxesWidget`,`ColorWidget`,`DateTimeWidget`,`DateWidget`,`EmailWidget`,`FileWidget`,`HiddenWidget`,`PasswordWidget`,`RadioWidget`,`RangeWidget`,`SelectWidget`,`TextWidget`,`TextareaWidget`,`TimeWidget`,`URLWidget`,`UpDownWidget`]),He=new Set(Object.values(Be).flat()),H=(e,t)=>Ve.has(e)||(t?(Be[t]??[]).includes(e):He.has(e)),U=(e,t)=>{if(!Fe(e))return e??null;let n=[],r=(e,t)=>{let i={};return Object.entries(e).forEach(([e,a])=>{if(e===`ui:widget`&&typeof a==`string`&&!H(a,t?.type)){n.push(a);return}let o=e===`items`?t?.items:t?.properties?.[e];i[e]=Fe(a)&&!e.startsWith(`ui:`)?r(a,o):a}),i},i=r(e,t);return n.length&&console.warn(`perun-atlas: this form cannot draw ${[...new Set(n)].map(e=>`"${e}"`).join(`, `)} -- those are the widgets a record form registers, and the draw row is not one. The fields keep the widget their schema implies.`),n.length?i:e},{Map:Ue,factory:We}=f,Ge=(e,t,n,r)=>{let i=E(e?.geometry);if(i.length===0)return null;let a=We.latLng(t),o=r??Ue,s=1/0,c=0;return i.forEach(e=>{let t=o.distance(a,We.latLng(R(e,n,r)));t<s&&(s=t),t>c&&(c=t)}),{nearest:s,furthest:c}},Ke=(e,t,n={})=>{let{srid:r,mode:i=`touches`,map:a}=n,o=e?.features??[],s={inside:[],outside:o,has:()=>!1,metres:()=>null,total:o.length};if(!t||!(t.radius>0))return s;let c={lat:t.lat,lng:t.lng};if(!Number.isFinite(c.lat)||!Number.isFinite(c.lng))return s;let l=new WeakMap,u=new WeakSet,d=[],f=[];return o.forEach(e=>{let n=Ge(e,c,r,a);if(!n){f.push(e);return}l.set(e,n.nearest),(i===`contains`?n.furthest<=t.radius:n.nearest<=t.radius)?(u.add(e),d.push(e)):f.push(e)}),d.sort((e,t)=>l.get(e)-l.get(t)),{inside:d,outside:f,has:e=>e?u.has(e):!1,metres:e=>e&&l.has(e)?l.get(e):null,total:o.length}},qe=(e,t={})=>{let{id:n=`{pkid}`,join:r=`,`}=t;return(e??[]).map(e=>V(n,e?.properties??{})).filter(e=>e&&e!==n).join(r)},Je=e=>encodeURIComponent(JSON.stringify(e)),Ye=e=>e.replace(/ /g,`%20`),Xe=(e,t,n)=>e==null?``:t===`form`||!t&&/form-urlencoded/.test(n??``)?Je(e):JSON.stringify(e),Ze=(e,t)=>{let n=typeof e==`string`?Qe(e):e,r=String(n?.type??``).toUpperCase();return r===`ERROR`||r===`EXCEPTION`?{ok:!1,message:[n?.title,n?.message].filter(Boolean).join(` — `)}:t&&typeof e==`string`&&new RegExp(t,`i`).test(e)?{ok:!1,message:e.trim().slice(0,300)}:{ok:!0,message:null}},Qe=e=>{try{return JSON.parse(e)}catch{return null}},$e=/^\{([^{}]+)\}$/,et=`...`,tt=(e,t)=>{if(typeof e==`string`){let n=e.match($e);return n?B(t,n[1])??e:V(e,t)}if(Array.isArray(e))return e.map(e=>tt(e,t));if(e&&typeof e==`object`){let n={};return Object.entries(e).forEach(([e,r])=>{let i=tt(r,t);if(e===et){i&&typeof i==`object`&&!Array.isArray(i)?Object.assign(n,i):n[e]=i;return}n[e]=i}),n}return e},nt=async(e,n={},r={})=>{let{body:i,contentType:a=`application/x-www-form-urlencoded`,encoding:o,failure:s}=r,c=`${window.server}${Ye(V(e,n))}`;try{let e=await(0,t.axios)({method:`post`,url:c,headers:{"Content-Type":a},data:Xe(i,o,a)}),n=Ze(e?.data,s);return n.ok||(console.error(`perun-atlas: ${c} refused the save`,e?.data),console.error(`perun-atlas: the payload was`,i)),{...n,data:e?.data}}catch(e){return console.error(`perun-atlas: save to ${c} failed`,e),{ok:!1,message:e?.message??String(e),data:null}}},rt=(e,{draw:t,dataSrid:n,bindings:r,note:i,selected:a,form:o,map:s})=>{let c={lat:e.lat,lng:e.lng},{x:l,y:u}=L(c,n,s),d=e.radius*te(c,n,s),f=Math.round(d),p=ae(c,e.radius,n,t.points,s),m=p.map(e=>V(t.ring?.point??`{x} {y}`,e)).join(t.ring?.join??`, `),h={type:`Polygon`,coordinates:[[...p,p[0]].map(e=>[e.x,e.y])]},g=[t.save.onSave,JSON.stringify(t.save.body??null)].some(e=>String(e).includes(`{draw.radius}`));return{context:{...r,note:i,draw:{lat:e.lat,lng:e.lng,metres:Math.round(e.radius),x:l,y:u,radius:f,ring:m,geojson:h,...a?{selected:a}:{}},...t.form?{form:o}:{}},units:d,tooSmall:g&&!(f>=1)}},it=[`DESCRIPTOR`,`pkid`,`parent_id`,`type`,`status`],at=e=>JSON.stringify(e??{type:`FeatureCollection`,features:[]},null,2),ot=(e,t=[])=>{let n=new Set([...it,...t]),r=new Set;return e.forEach(e=>{Object.entries(e?.properties??{}).forEach(([e,t])=>{!n.has(e)&&(typeof t!=`object`||!t)&&r.add(e)})}),[...r]},st=(e,{fields:t,exclude:n,labelResolver:r}={})=>t?.length?t.map(({field:e,label:t,short:n})=>({field:e,header:t&&r?.(t)||t||e,short:n})):ot(e,n).map(e=>({field:e,header:r?.(e.toLowerCase())||e})),ct=e=>e.map(([e,t])=>`${e} ${t}`).join(`, `),lt=e=>e.map(e=>`(${ct(e)})`).join(`, `),ut={Point:([e,t])=>`POINT (${e} ${t})`,MultiPoint:e=>`MULTIPOINT (${ct(e)})`,LineString:e=>`LINESTRING (${ct(e)})`,MultiLineString:e=>`MULTILINESTRING (${lt(e)})`,Polygon:e=>`POLYGON (${lt(e)})`,MultiPolygon:e=>`MULTIPOLYGON (${e.map(e=>`(${lt(e)})`).join(`, `)})`},dt=e=>{let t=ut[e?.type];return t&&e.coordinates?.length?t(e.coordinates):``},ft=e=>{if(e==null)return``;let t=String(e),n=!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t)&&/^[=+\-@\t\r]/.test(t)?`'${t}`:t;return/[",\r\n]/.test(n)?`"${n.replace(/"/g,`""`)}"`:n},pt=(e,{fields:t,exclude:n,labelResolver:r}={})=>{let i=e?.features??[],a=st(i,{fields:t,exclude:n,labelResolver:r}),o=e=>e?.geometry?.type??``,s=i.some(e=>/Point$/.test(o(e))),c=i.some(e=>o(e)&&!/Point$/.test(o(e))),l=[...a.map(e=>e.header),...s?[`latitude`,`longitude`]:[],...c?[`geometry`]:[]],u=i.map(e=>{let t=a.map(t=>ft(B(e?.properties,t.field)));if(s){let[n,r]=/^Point$/.test(o(e))?e.geometry.coordinates??[]:[];t.push(ft(r),ft(n))}return c&&t.push(ft(dt(e?.geometry))),t});return[l.map(ft),...u].map(e=>e.join(`,`)).join(`\r
`)},mt={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&apos;`},ht=e=>String(e).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g,``).replace(/[&<>"']/g,e=>mt[e]),gt=e=>`<coordinates>${e.map(e=>e.join(`,`)).join(` `)}</coordinates>`,_t=e=>`<LinearRing>${gt(e)}</LinearRing>`,vt={Point:e=>`<Point>${gt([e])}</Point>`,LineString:e=>`<LineString><tessellate>1</tessellate>${gt(e)}</LineString>`,Polygon:([e,...t])=>`<Polygon><tessellate>1</tessellate><outerBoundaryIs>${_t(e)}</outerBoundaryIs>`+t.map(e=>`<innerBoundaryIs>${_t(e)}</innerBoundaryIs>`).join(``)+`</Polygon>`,MultiPoint:e=>`<MultiGeometry>${e.map(vt.Point).join(``)}</MultiGeometry>`,MultiLineString:e=>`<MultiGeometry>${e.map(vt.LineString).join(``)}</MultiGeometry>`,MultiPolygon:e=>`<MultiGeometry>${e.map(vt.Polygon).join(``)}</MultiGeometry>`},yt=e=>{let t=vt[e?.type];return t&&e.coordinates?.length?t(e.coordinates):``},bt=(e,t,n)=>{let r=n?.(e),i=yt(e?.geometry),a=t.map(({field:t,header:n})=>{let r=B(e?.properties,t),i=r==null?``:ht(r);return`        <Data name="${ht(t)}"><displayName>${ht(n)}</displayName><value>${i}</value></Data>`});return[`    <Placemark>`,...r==null||r===``?[]:[`      <name>${ht(r)}</name>`],...a.length?[`      <ExtendedData>`,...a,`      </ExtendedData>`]:[],...i?[`      ${i}`]:[],`    </Placemark>`].join(`
`)},xt=(e,{fields:t,exclude:n,labelResolver:r,nameOf:i}={})=>{let a=e?.features??[],o=st(a,{fields:t,exclude:n,labelResolver:r});return[`<?xml version="1.0" encoding="UTF-8"?>`,`<kml xmlns="http://www.opengis.net/kml/2.2">`,`  <Document>`,...a.map(e=>bt(e,o,i)),`  </Document>`,`</kml>`,``].join(`
`)},St=`GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]`,Ct=1,wt=3,Tt=5,Et=8,Dt=[{name:`points`,types:[`Point`,`MultiPoint`]},{name:`lines`,types:[`LineString`,`MultiLineString`],shape:wt},{name:`polygons`,types:[`Polygon`,`MultiPolygon`],shape:Tt}],Ot=e=>Array.isArray(e)&&Number.isFinite(e[0])&&Number.isFinite(e[1]),kt=e=>Array.isArray(e)?e.filter(Ot):[],At=e=>{let[t,n]=[e[0],e[e.length-1]];return t[0]===n[0]&&t[1]===n[1]?e:[...e,t]},jt=e=>{let t=0;for(let n=1;n<e.length;n+=1)t+=(e[n][0]-e[n-1][0])*(e[n][1]+e[n-1][1]);return t>0},Mt=e=>{let[t,...n]=(Array.isArray(e)?e:[]).map(kt);return t?.length?[t,...n.filter(e=>e.length)].map(At).map((e,t)=>jt(e)===(t===0)?e:[...e].reverse()):[]},Nt=e=>Array.isArray(e)?e.map(kt).filter(e=>e.length):[],Pt={Point:e=>Ot(e)?[[e]]:[],MultiPoint:e=>{let t=kt(e);return t.length?[t]:[]},LineString:e=>Nt([e]),MultiLineString:Nt,Polygon:Mt,MultiPolygon:e=>Array.isArray(e)?e.flatMap(Mt):[]},Ft=e=>Pt[e?.type]?.(e.coordinates)??[],It=e=>e.reduce(([e,t,n,r],[i,a])=>[Math.min(e,i),Math.min(t,a),Math.max(n,i),Math.max(r,a)],[1/0,1/0,-1/0,-1/0]),Lt=(e,t,n)=>n.forEach((n,r)=>e.setFloat64(t+8*r,n,!0)),Rt=(e,t)=>{let n=t.reduce((e,t)=>e+t.length,0);return e===Ct?20:e===Et?40+16*n:44+4*t.length+16*n},zt=(e,t,n,r)=>{if(e.setInt32(t,n,!0),n===Ct){let[[[n,i]]]=r;e.setFloat64(t+4,n,!0),e.setFloat64(t+12,i,!0);return}let i=r.flat();Lt(e,t+4,It(i));let a=t+36;if(n!==Et&&(e.setInt32(a,r.length,!0),a+=4),e.setInt32(a,i.length,!0),a+=4,n!==Et){let t=0;r.forEach(n=>{e.setInt32(a,t,!0),a+=4,t+=n.length})}i.forEach(([t,n])=>{e.setFloat64(a,t,!0),e.setFloat64(a+8,n,!0),a+=16})},Bt=(e,t,n)=>{e.setInt32(0,9994),e.setInt32(24,e.byteLength/2),e.setInt32(28,1e3,!0),e.setInt32(32,t,!0),Lt(e,36,n)},Vt=(e,t)=>{let n=t.map(t=>Rt(e,t)),r=new DataView(new ArrayBuffer(n.reduce((e,t)=>e+8+t,100))),i=new DataView(new ArrayBuffer(100+8*t.length)),a=It(t.flatMap(e=>e.flat()));Bt(r,e,a),Bt(i,e,a);let o=100;return t.forEach((t,a)=>{i.setInt32(100+8*a,o/2),i.setInt32(104+8*a,n[a]/2),r.setInt32(o,a+1),r.setInt32(o+4,n[a]/2),zt(r,o+8,e,t),o+=8+n[a]}),{shp:new Uint8Array(r.buffer),shx:new Uint8Array(i.buffer)}},Ht=10,Ut=e=>{let t=new Set;return e.map(e=>{let n=String(e.short||e.field).replace(/[^A-Za-z0-9_]/g,`_`),r=(/[A-Za-z0-9]/.test(n)?n:`FIELD`).slice(0,Ht),i=r;for(let e=1;t.has(i.toUpperCase());e+=1){let t=`_${e}`;i=r.slice(0,Ht-t.length)+t}return t.add(i.toUpperCase()),{...e,short:i}})},Wt=new TextEncoder,Gt=32,Kt=254,qt=19,Jt=15,Yt=e=>{let t=Wt.encode(String(e));if(t.length<=Kt)return t;let n=Kt;for(;n>0&&(t[n]&192)==128;)--n;return t.subarray(0,n)},Xt=(e,t=0)=>e.reduce((e,t)=>Math.max(e,t),t),Zt=e=>{for(let t=0;t<Jt;t+=1)if(Number(e.toFixed(t))===e)return t;return Jt},Qt=e=>{let t=Xt(e.filter(e=>e!==null).map(Zt)),n=e.map(e=>e===null?null:e.toFixed(t));if(n.some(e=>e?.includes(`e`)))return null;let r=Xt(n.map(e=>e?.length??0));return r<=qt?{type:`N`,width:r,decimals:t,cells:n.map(e=>e&&Wt.encode(e))}:null},$t=e=>{let t=e.filter(e=>e!=null),n=e.map(e=>e===void 0?null:e);if(t.length&&t.every(e=>typeof e==`number`&&Number.isFinite(e))){let e=Qt(n);if(e)return e}if(t.length&&t.every(e=>typeof e==`boolean`))return{type:`L`,width:1,decimals:0,cells:n.map(e=>Wt.encode(e===null?`?`:e?`T`:`F`))};let r=n.map(e=>e===null?null:Yt(e));return{type:`C`,width:Xt(r.map(e=>e?.length??0),1),decimals:0,cells:r}},en=(e,t,n)=>{let r=e.length?e.map(e=>({name:e.short,...$t(t.map(t=>B(t?.properties,e.field)))})):[{name:`FID`,...$t(t.map((e,t)=>t))}],i=32+32*r.length+1,a=r.reduce((e,t)=>e+t.width,1),o=new Uint8Array(i+a*t.length+1),s=new DataView(o.buffer);s.setUint8(0,3),s.setUint8(1,n.getFullYear()-1900),s.setUint8(2,n.getMonth()+1),s.setUint8(3,n.getDate()),s.setUint32(4,t.length,!0),s.setUint16(8,i,!0),s.setUint16(10,a,!0),r.forEach(({name:e,type:t,width:n,decimals:r},i)=>{let a=32+32*i;o.set(Wt.encode(e),a),s.setUint8(a+11,t.charCodeAt(0)),s.setUint8(a+16,n),s.setUint8(a+17,r)}),s.setUint8(i-1,13),o.fill(Gt,i,o.length-1);let c=i;return t.forEach((e,t)=>{c+=1,r.forEach(({type:e,width:n,cells:r})=>{let i=r[t];i&&o.set(i,e===`N`?c+n-i.length:c),c+=n})}),s.setUint8(o.length-1,26),o},tn=e=>`﻿`+[[`short`,`column`,`header`],...e.map(({short:e,field:t,header:n})=>[e,t,n])].map(e=>e.map(ft).join(`,`)).join(`\r
`),nn=(e,t,n)=>{let r=new Set(st(t,{exclude:n}).map(({field:e})=>e));return e.filter(({field:e})=>r.has(e))},rn=(e,{stem:t=`features`,fields:n,exclude:r,labelResolver:i,today:a=new Date}={})=>{let o=e?.features??[],s=Ut(st(o,{fields:n,exclude:r,labelResolver:i})),c=[];return Dt.forEach(({name:e,types:i,shape:l})=>{let u=o.filter(e=>i.includes(e?.geometry?.type)).map(e=>({feature:e,parts:Ft(e.geometry)})).filter(({parts:e})=>e.length);if(!u.length)return;let d=l??(u.every(({feature:e})=>e.geometry.type===`Point`)?Ct:Et),f=n?.length?s:nn(s,u.map(({feature:e})=>e),r),{shp:p,shx:m}=Vt(d,u.map(({parts:e})=>e)),h=`${t}-${e}`;c.push({name:`${h}.shp`,bytes:p},{name:`${h}.shx`,bytes:m},{name:`${h}.dbf`,bytes:en(f,u.map(({feature:e})=>e),a)},{name:`${h}.prj`,bytes:Wt.encode(St)},{name:`${h}.cpg`,bytes:Wt.encode(`UTF-8`)})}),c.push({name:`${t}-fields.csv`,bytes:Wt.encode(tn(s))}),c};function W(e,t){return Array.from(e.getElementsByTagName(t))}function an(e){return e[0]===`#`?e:`#${e}`}function on(e,t,n){return Array.from(e.getElementsByTagNameNS(n,t))}function G(e){return e?.normalize(),e?.textContent||``}function K(e,t,n){let r=e.getElementsByTagName(t),i=r.length?r[0]:null;return i&&n&&n(i),i}function q(e,t,n){let r={};if(!e)return r;let i=e.getElementsByTagName(t),a=i.length?i[0]:null;return a&&n?n(a,r):r}function sn(e,t,n){let r=G(K(e,t));return r&&n&&n(r)||{}}function cn(e,t,n){let r=Number.parseFloat(G(K(e,t)));if(!Number.isNaN(r))return r&&n&&n(r)||{}}function J(e,t,n){let r=Number.parseFloat(G(K(e,t)));if(!Number.isNaN(r))return n&&n(r),r}function ln(e,t){let n={};for(let r of t)sn(e,r,e=>{n[r]=e});return n}function un(e){return e?.nodeType===1}function dn(e){let t=[];if(e===null)return t;for(let n of Array.from(e.childNodes)){if(!un(n))continue;let e=fn(n.nodeName);if(e===`gpxtpx:TrackPointExtension`)t=t.concat(dn(n));else{let r=G(n);t.push([e,pn(r)])}}return t}function fn(e){return[`heart`,`gpxtpx:hr`,`hr`].includes(e)?`heart`:e}function pn(e){let t=Number.parseFloat(e);return Number.isNaN(t)?e:t}function mn(e){let t=[Number.parseFloat(e.getAttribute(`lon`)||``),Number.parseFloat(e.getAttribute(`lat`)||``)];if(Number.isNaN(t[0])||Number.isNaN(t[1]))return null;J(e,`ele`,e=>{t.push(e)});let n=K(e,`time`);return{coordinates:t,time:n?G(n):null,extendedValues:dn(K(e,`extensions`))}}function hn(e){return q(e,`line`,e=>Object.assign({},sn(e,`color`,e=>({stroke:`#${e}`})),cn(e,`opacity`,e=>({"stroke-opacity":e})),cn(e,`width`,e=>({"stroke-width":e*96/25.4}))))}function gn(e,t){let n=ln(t,[`name`,`cmt`,`desc`,`type`,`time`,`keywords`]);for(let[r,i]of e)for(let e of Array.from(t.getElementsByTagNameNS(i,`*`)))n[e.tagName.replace(`:`,`_`)]=G(e)?.trim();let r=W(t,`link`);return r.length&&(n.links=r.map(e=>Object.assign({href:e.getAttribute(`href`)},ln(e,[`text`,`type`])))),n}function _n(e,t){let n=W(e,t),r=[],i=[],a={};for(let e=0;e<n.length;e++){let t=mn(n[e]);if(t){r.push(t.coordinates),t.time&&i.push(t.time);for(let[r,i]of t.extendedValues){let t=r===`heart`?r:`${r.replace(`gpxtpx:`,``)}s`;a[t]||(a[t]=Array(n.length).fill(null)),a[t][e]=i}}}if(!(r.length<2))return{line:r,times:i,extendedValues:a}}function vn(e,t){let n=_n(t,`rtept`);if(n)return{type:`Feature`,properties:Object.assign({_gpxType:`rte`},gn(e,t),hn(K(t,`extensions`))),geometry:{type:`LineString`,coordinates:n.line}}}function yn(e,t){let n=W(t,`trkseg`),r=[],i=[],a=[];for(let e of n){let t=_n(e,`trkpt`);t&&(a.push(t),t.times?.length&&i.push(t.times))}if(a.length===0)return null;let o=a.length>1,s=Object.assign({_gpxType:`trk`},gn(e,t),hn(K(t,`extensions`)),i.length?{coordinateProperties:{times:o?i:i[0]}}:{});for(let e=0;e<a.length;e++){let t=a[e];r.push(t.line),s.coordinateProperties||(s.coordinateProperties={});let n=s.coordinateProperties;for(let[r,i]of Object.entries(t.extendedValues))o?(n[r]||(n[r]=a.map(e=>Array(e.line.length).fill(null))),n[r][e]=i):n[r]=i}return{type:`Feature`,properties:s,geometry:o?{type:`MultiLineString`,coordinates:r}:{type:`LineString`,coordinates:r[0]}}}function bn(e,t){let n=Object.assign(gn(e,t),ln(t,[`sym`])),r=mn(t);return r?{type:`Feature`,properties:n,geometry:{type:`Point`,coordinates:r.coordinates}}:null}function*xn(e){let t=e,n=`http://www.garmin.com/xmlschemas/GpxExtensions/v3`,r=[[`gpxx`,n]],i=t.getElementsByTagName(`gpx`)[0]?.attributes;if(i)for(let e of Array.from(i))e.name?.startsWith(`xmlns:`)&&e.value!==n&&r.push([e.name,e.value]);for(let e of W(t,`trk`)){let t=yn(r,e);t&&(yield t)}for(let e of W(t,`rte`)){let t=vn(r,e);t&&(yield t)}for(let e of W(t,`wpt`)){let t=bn(r,e);t&&(yield t)}}function Sn(e){return{type:`FeatureCollection`,features:Array.from(xn(e))}}function Cn(e,t){let n={},r=t===`stroke`||t===`fill`?t:`${t}-color`;return e[0]===`#`&&(e=e.substring(1)),e.length===6||e.length===3?n[r]=`#${e}`:e.length===8&&(n[`${t}-opacity`]=Number.parseInt(e.substring(0,2),16)/255,n[r]=`#${e.substring(6,8)}${e.substring(4,6)}${e.substring(2,4)}`),n}function wn(e,t,n){let r={};return J(e,t,e=>{r[n]=e}),r}function Tn(e,t){return q(e,`color`,e=>Cn(G(e),t))}function En(e){return q(e,`Icon`,(e,t)=>(sn(e,`href`,e=>{t.icon=e}),t))}function Dn(e){return q(e,`IconStyle`,e=>Object.assign(Tn(e,`icon`),wn(e,`scale`,`icon-scale`),wn(e,`heading`,`icon-heading`),q(e,`hotSpot`,e=>{let t=Number.parseFloat(e.getAttribute(`x`)||``),n=Number.parseFloat(e.getAttribute(`y`)||``),r=e.getAttribute(`xunits`)||``,i=e.getAttribute(`yunits`)||``;return!Number.isNaN(t)&&!Number.isNaN(n)?{"icon-offset":[t,n],"icon-offset-units":[r,i]}:{}}),En(e)))}function On(e){return q(e,`LabelStyle`,e=>Object.assign(Tn(e,`label`),wn(e,`scale`,`label-scale`)))}function kn(e){return q(e,`LineStyle`,e=>Object.assign(Tn(e,`stroke`),wn(e,`width`,`stroke-width`)))}function An(e){return q(e,`PolyStyle`,(e,t)=>Object.assign(t,q(e,`color`,e=>Cn(G(e),`fill`)),sn(e,`fill`,e=>{if(e===`0`)return{"fill-opacity":0}}),sn(e,`outline`,e=>{if(e===`0`)return{"stroke-opacity":0}})))}function jn(e){return Object.assign({},An(e),kn(e),On(e),Dn(e))}var Mn=/\s*/g,Nn=/^\s*|\s*$/g,Pn=/\s+/;function Fn(e){return e.replace(Mn,``).split(`,`).map(Number.parseFloat).filter(e=>!Number.isNaN(e)).slice(0,3)}function In(e){return e.replace(Nn,``).split(Pn).map(Fn).filter(e=>e.length>=2)}function Ln(e){let t=W(e,`coord`);t.length===0&&(t=on(e,`coord`,`*`));let n=t.map(e=>G(e).split(` `).map(Number.parseFloat));return n.length===0?null:{geometry:n.length>2?{type:`LineString`,coordinates:n}:{type:`Point`,coordinates:n[0]},times:W(e,`when`).map(e=>G(e))}}function Rn(e){if(e.length===0)return e;let t=e[0],n=e[e.length-1],r=!0;for(let e=0;e<Math.max(t.length,n.length);e++)if(t[e]!==n[e]){r=!1;break}return r?e:e.concat([e[0]])}function zn(e){return G(K(e,`coordinates`))}function Bn(e){let t=[],n=[];for(let r=0;r<e.childNodes.length;r++){let i=e.childNodes.item(r);if(un(i))switch(i.tagName){case`MultiGeometry`:case`MultiTrack`:case`gx:MultiTrack`:{let e=Bn(i);t=t.concat(e.geometries),n=n.concat(e.coordTimes);break}case`Point`:{let e=Fn(zn(i));e.length>=2&&t.push({type:`Point`,coordinates:e});break}case`LinearRing`:case`LineString`:{let e=In(zn(i));e.length>=2&&t.push({type:`LineString`,coordinates:e});break}case`Polygon`:{let e=[];for(let t of W(i,`LinearRing`)){let n=Rn(In(zn(t)));n.length>=4&&e.push(n)}e.length&&t.push({type:`Polygon`,coordinates:e});break}case`Track`:case`gx:Track`:{let e=Ln(i);if(!e)break;let{times:r,geometry:a}=e;t.push(a),r.length&&n.push(r);break}}}return{geometries:t,coordTimes:n}}var Vn=e=>Number(e),Hn={string:e=>e,int:Vn,uint:Vn,short:Vn,ushort:Vn,float:Vn,double:Vn,bool:e=>!!e};function Un(e,t){return q(e,`ExtendedData`,(e,n)=>{for(let t of W(e,`Data`))n[t.getAttribute(`name`)||``]=G(K(t,`value`));for(let r of W(e,`SimpleData`)){let e=r.getAttribute(`name`)||``;n[e]=(t[e]||Hn.string)(G(r))}return n})}function Wn(e){let t=K(e,`description`);for(let e of Array.from(t?.childNodes||[]))if(e.nodeType===4)return{description:{"@type":`html`,value:G(e)}};return{}}function Gn(e){return q(e,`TimeSpan`,e=>({timespan:{begin:G(K(e,`begin`)),end:G(K(e,`end`))}}))}function Kn(e){return q(e,`TimeStamp`,e=>({timestamp:G(K(e,`when`))}))}function qn(e,t){return sn(e,`styleUrl`,e=>(e=an(e),t[e]?Object.assign({styleUrl:e},t[e]):{styleUrl:e}))}var Y;(function(e){e.ABSOLUTE=`absolute`,e.RELATIVE_TO_GROUND=`relativeToGround`,e.CLAMP_TO_GROUND=`clampToGround`,e.CLAMP_TO_SEAFLOOR=`clampToSeaFloor`,e.RELATIVE_TO_SEAFLOOR=`relativeToSeaFloor`})(Y||(Y={}));function Jn(e){switch(e?.textContent){case Y.ABSOLUTE:return Y.ABSOLUTE;case Y.CLAMP_TO_GROUND:return Y.CLAMP_TO_GROUND;case Y.CLAMP_TO_SEAFLOOR:return Y.CLAMP_TO_SEAFLOOR;case Y.RELATIVE_TO_GROUND:return Y.RELATIVE_TO_GROUND;case Y.RELATIVE_TO_SEAFLOOR:return Y.RELATIVE_TO_SEAFLOOR}return null}function Yn(e){return K(e,`gx:LatLonQuad`)?{geometry:{type:`Polygon`,coordinates:[Rn(In(zn(e)))]}}:Qn(e)}var Xn=Math.PI/180;function Zn(e,t,n){let r=[(e[0]+e[2])/2,(e[1]+e[3])/2];return[t[0].map(e=>{let t=e[1]-r[1],i=e[0]-r[0],a=Math.sqrt(t**2+i**2),o=Math.atan2(t,i)+n*Xn;return[r[0]+Math.cos(o)*a,r[1]+Math.sin(o)*a]})]}function Qn(e){let t=K(e,`LatLonBox`);if(t){let e=J(t,`north`),n=J(t,`west`),r=J(t,`east`),i=J(t,`south`),a=J(t,`rotation`);if(typeof e==`number`&&typeof i==`number`&&typeof n==`number`&&typeof r==`number`){let t=[n,i,r,e],o=[[[n,e],[r,e],[r,i],[n,i],[n,e]]];return typeof a==`number`&&(o=Zn(t,o,a)),{bbox:t,geometry:{type:`Polygon`,coordinates:o}}}}return null}function $n(e,t,n,r){let i=Yn(e),a=i?.geometry||null;if(!a&&r.skipNullGeometry)return null;let o={type:`Feature`,geometry:a,properties:Object.assign({"@geometry-type":`groundoverlay`},ln(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`description`]),Wn(e),qn(e,t),jn(e),En(e),Un(e,n),Gn(e),Kn(e))};i?.bbox&&(o.bbox=i.bbox),o.properties?.visibility!==void 0&&(o.properties.visibility=o.properties.visibility!==`0`);let s=e.getAttribute(`id`);return s!==null&&s!==``&&(o.id=s),o}function er(e){let t=K(e,`Region`);return t?{coordinateBox:nr(t),lod:tr(e)}:null}function tr(e){let t=K(e,`Lod`);return t?[J(t,`minLodPixels`)??-1,J(t,`maxLodPixels`)??-1,J(t,`minFadeExtent`)??null,J(t,`maxFadeExtent`)??null]:null}function nr(e){let t=K(e,`LatLonAltBox`);if(t){let e=J(t,`north`),n=J(t,`west`),r=J(t,`east`),i=J(t,`south`);if(Jn(K(t,`altitudeMode`)||K(t,`gx:altitudeMode`))&&console.debug(`Encountered an unsupported feature of KML for togeojson: please contact developers for support of altitude mode.`),typeof e==`number`&&typeof i==`number`&&typeof n==`number`&&typeof r==`number`)return{bbox:[n,i,r,e],geometry:{type:`Polygon`,coordinates:[[[n,e],[r,e],[r,i],[n,i],[n,e]]]}}}return null}function rr(e){let t=K(e,`Link`);return t?ln(t,[`href`,`refreshMode`,`refreshInterval`,`viewRefreshMode`,`viewRefreshTime`,`viewBoundScale`,`viewFormat`,`httpQuery`]):{}}function ir(e,t,n,r){let i=er(e),a=i?.coordinateBox?.geometry||null;if(!a&&r.skipNullGeometry)return null;let o={type:`Feature`,geometry:a,properties:Object.assign({"@geometry-type":`networklink`},ln(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`styleUrl`,`refreshVisibility`,`flyToView`,`description`]),Wn(e),qn(e,t),jn(e),En(e),Un(e,n),Gn(e),Kn(e),rr(e),i?.lod?{lod:i.lod}:{})};i?.coordinateBox?.bbox&&(o.bbox=i.coordinateBox.bbox),o.properties?.visibility!==void 0&&(o.properties.visibility=o.properties.visibility!==`0`);let s=e.getAttribute(`id`);return s!==null&&s!==``&&(o.id=s),o}function ar(e){return e.length===0?null:e.length===1?e[0]:{type:`GeometryCollection`,geometries:e}}function or(e,t,n,r){let{coordTimes:i,geometries:a}=Bn(e),o=ar(a);if(!o&&r.skipNullGeometry)return null;let s={type:`Feature`,geometry:o,properties:Object.assign(ln(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`description`]),Wn(e),qn(e,t),jn(e),Un(e,n),Gn(e),Kn(e),i.length?{coordinateProperties:{times:i.length===1?i[0]:i}}:{})};s.properties?.visibility!==void 0&&(s.properties.visibility=s.properties.visibility!==`0`);let c=e.getAttribute(`id`);return c!==null&&c!==``&&(s.id=c),s}function sr(e){let t=e.getAttribute(`id`),n=e.parentNode;return!t&&un(n)&&n.localName===`CascadingStyle`&&(t=n.getAttribute(`kml:id`)||n.getAttribute(`id`)),an(t||``)}function cr(e){let t={};for(let n of W(e,`Style`))t[sr(n)]=jn(n);for(let n of W(e,`StyleMap`)){let e=an(n.getAttribute(`id`)||``);sn(n,`styleUrl`,n=>{n=an(n),t[n]&&(t[e]=t[n])})}return t}function lr(e){let t={};for(let n of W(e,`SimpleField`))t[n.getAttribute(`name`)||``]=Hn[n.getAttribute(`type`)||``]||Hn.string;return t}function*ur(e,t={skipNullGeometry:!1}){let n=e,r=cr(n),i=lr(n);for(let e of W(n,`Placemark`)){let n=or(e,r,i,t);n&&(yield n)}for(let e of W(n,`GroundOverlay`)){let n=$n(e,r,i,t);n&&(yield n)}for(let e of W(n,`NetworkLink`)){let n=ir(e,r,i,t);n&&(yield n)}}function dr(e,t={skipNullGeometry:!1}){return{type:`FeatureCollection`,features:Array.from(ur(e,t))}}var fr={bytes:20971520,positions:2e5},pr=(e,t=fr)=>e>t.bytes?{refused:`tooLarge`,size:e,limit:t.bytes}:null,mr=e=>new DOMParser().parseFromString(e,`application/xml`),hr=e=>!e?.documentElement||e.getElementsByTagName(`parsererror`).length>0,gr=e=>({type:`Feature`,...e.id!==void 0&&{id:e.id},properties:e.properties&&typeof e.properties==`object`?e.properties:{},geometry:e.geometry??null}),_r=new Set([`Point`,`MultiPoint`,`LineString`,`MultiLineString`,`Polygon`,`MultiPolygon`,`GeometryCollection`]),vr=e=>{let t;try{t=JSON.parse(e)}catch{return null}return t?.type===`FeatureCollection`&&Array.isArray(t.features)?{type:`FeatureCollection`,features:t.features.filter(e=>e?.type===`Feature`).map(gr)}:t?.type===`Feature`?{type:`FeatureCollection`,features:[gr(t)]}:_r.has(t?.type)?{type:`FeatureCollection`,features:[gr({geometry:t})]}:null},yr=[`Style`,`StyleMap`,`styleUrl`],br=e=>(yr.forEach(t=>{Array.from(e.getElementsByTagName(t)).forEach(e=>e.parentNode?.removeChild(e))}),e),xr=e=>{let t=e.properties?.description;return t&&typeof t==`object`&&`value`in t?{...e,properties:{...e.properties,description:String(t.value??``)}}:e},Sr=e=>({type:`FeatureCollection`,features:dr(br(e),{skipNullGeometry:!0}).features.map(xr).map(gr)}),Cr=e=>({type:`FeatureCollection`,features:Sn(e).features.map(gr)}),wr=(e,t)=>{let n;try{n=t(e)}catch{return null}if(hr(n))return null;let r=n.documentElement.localName??n.documentElement.nodeName;return r===`kml`?{format:`kml`,collection:Sr(n)}:r===`gpx`?{format:`gpx`,collection:Cr(n)}:null},Tr=e=>{let[t,n]=e;return!Number.isFinite(t)||!Number.isFinite(n)?`unreadable`:Math.abs(t)>180||Math.abs(n)>90?`notDegrees`:null},Er=(e,t=``)=>{let n=new Uint8Array(e,0,Math.min(4,e.byteLength));return n[0]===80&&n[1]===75&&(n[2]===3&&n[3]===4||n[2]===5&&n[3]===6)?`zip`:n[0]===0&&n[1]===0&&n[2]===39&&n[3]===10?`shp`:/\.(dbf|shx|prj|cpg)$/i.test(t)?`part`:`text`},Dr=({format:e,collection:t},n)=>{let r=t.features.map(e=>({feature:e,positions:E(e.geometry)})).filter(({positions:e})=>e.length>0);if(r.length===0)return{refused:`empty`};let i=r.reduce((e,t)=>e+t.positions.length,0);if(i>n.positions)return{refused:`tooManyPoints`,count:i,limit:n.positions};for(let e of r)for(let t of e.positions){let e=Tr(t);if(e)return{refused:e}}return{format:e,collection:{type:`FeatureCollection`,features:r.map(({feature:e})=>e)},positions:i}},Or=(e,{parse:t=mr,limits:n=fr}={})=>{let r=String(e??``).replace(/^﻿/,``).trimStart(),i=null;try{if(r.startsWith(`{`)){let e=vr(r);i=e&&{format:`geojson`,collection:e}}else r.startsWith(`<`)&&(i=wr(r,t))}catch(e){console.warn(`perun-atlas: a file could not be read`,e),i=null}return i?Dr(i,n):{refused:`unreadable`}},kr=e=>{let t=new Set(e.flatMap(({collection:e})=>e.features.flatMap(e=>Object.keys(e?.properties??{})))),n=`layer`;for(let e=2;t.has(n);e+=1)n=`layer_${e}`;return n},Ar=(e,{limits:t=fr}={})=>{if(e.refused)return e;let n=e.layers.length>1?kr(e.layers):null,r=e.layers.flatMap(({name:e,collection:t})=>t.features.map(t=>{let r=gr(t);return n?{...r,properties:{[n]:e,...r.properties}}:r})),i=e.layers.some(e=>e.assumed),a=Dr({format:`shapefile`,collection:{type:`FeatureCollection`,features:r}},t);return a.refused===`notDegrees`&&i?{refused:`noPrj`}:a.refused?a:{...a,assumed:i}},jr=(e,t,n)=>n>t?(Math.min(Math.max(e,t),n)-t)/(n-t):0,Mr=e=>e<=10?1:e<=20?2:5,Nr=(e,t)=>{if(!Number.isFinite(e)||!Number.isFinite(t)||!(t>e))return[];let n=Mr(t-e+1),r=[];for(let i=Math.ceil(e);i<=t;i+=1){let a=(i-e)%n===0;r.push({zoom:i,offset:jr(i,e,t),labelled:i===e||i===t||a&&t-i>=n})}return r},Pr=(e,t,n)=>!Number.isFinite(t)||!Number.isFinite(n)||!(n>t)?[]:(e??[]).filter(e=>Number.isFinite(e?.from)).map(e=>({mark:e,to:e.to??e.from})).filter(({mark:e,to:r})=>r>=t&&e.from<=n).map(({mark:e,to:r})=>{let i=jr(e.from,t,n),a=jr(Math.max(r,e.from),t,n);return{...e,from:Math.min(Math.max(e.from,t),n),to:Math.min(Math.max(r,t),n),offset:i,span:a-i}}),Fr=.0254/96,Ir=(e,t)=>!(e>0)||!(t>0)?null:e/t/Fr,Lr=e=>{if(!(e>0)||!Number.isFinite(e))return null;let t=10**(Math.floor(Math.log10(e))-1);return Math.round(e/t)*t},Rr=e=>{let t=Lr(e);return t===null?null:`1:${String(Math.max(Math.round(t),1)).replace(/\B(?=(\d{3})+(?!\d))/g,`\xA0`)}`},zr=[24,24],{createContext:Br,useContext:Vr}=t.React,Hr=Br(null),X=()=>Vr(Hr)??f.Map,{factory:Ur}=f,{useLayoutEffect:Wr}=t.React,Gr=({credit:e})=>{let t=X();return Wr(()=>{let n=Ur.control.attribution({prefix:!1}).addTo(t);return e&&n.addAttribution(e),()=>{n.remove()}},[t,e]),null};Gr.propTypes={credit:t.PropTypes.string};var Kr=e=>{let t=e?.getLatLngs?.()??[];return Array.isArray(t[0])?t[0]:t},qr=(e,t,n,r)=>{let i=Kr(t);if(e===`radius`){let e=t?.getRadius?.();return Number.isFinite(e)?`${r.asDistance(e)} · ${r.asArea(r.circleArea(e))}`:null}if(e===`angle`){let e=r.anglesAlong(i).filter(Number.isFinite);return e.length?e.map(r.asAngle).join(`, `):i.length===2?r.asBearing(r.bearing(i[0],i[1])):null}let a=e===`area`?r.area(i):r.distance(i);if(!Number.isFinite(a)||a===0)return null;n[e]+=a;let o=e===`area`?r.asArea:r.asDistance;return`${o(a)}   (Σ ${o(n[e])})`},Jr=(e,t)=>e!==void 0&&`geolocation`in e&&t?.isSecureContext!==!1,Yr=e=>e===`unavailable`?`explain`:e===`found`||e===`outside`||e===`error`?`clear`:`locate`,Xr=(e,t,n)=>e?.[t]?t:n,{factory:Zr}=f,{useEffect:Qr,useLayoutEffect:$r,useState:ei}=t.React,ti=null,ni=()=>(ti||(ti=Zr.Control.extend({onAdd(){return this.options.container}})),ti),ri=(e,t=!0)=>{let n=X(),[r]=ei(()=>Zr.DomUtil.create(`div`,`leaflet-control`));return $r(()=>{if(!t)return;let i=new(ni())({position:e,container:r}).addTo(n);return()=>{i.remove()}},[n,e,t,r]),r},ii=({position:e,shown:n=!0,children:r})=>t.ReactDOM.createPortal(r,ri(e,n)),ai=({what:e})=>(Qr(()=>{console.warn(`perun-atlas: the engine on this environment has no ${e}; skipping it.`)},[e]),null),oi=e=>{e&&(Zr.DomEvent.disableClickPropagation(e),Zr.DomEvent.disableScrollPropagation(e))},Z=(e,n)=>t.redux.store.getState().intl?.messages?.[`perun.spatial.${e}`]||n;function Q(e){let t=document.createElement(`style`);t.textContent=e,document.head.insertBefore(t,document.head.firstChild)}Q(`/* ------------------- */
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
`);var{setting:si}=d,{util:ci}=f,{readout:li}=m,{useEffect:ui,useMemo:di,useRef:fi,useState:pi}=t.React,mi={latitude:[`latitude`,`Lat`],longitude:[`longitude`,`Lng`],abscissa_x:[`abscissa_x`,`X`],ordinate_y:[`ordinate_y`,`Y`]},hi=e=>{let t=e.getCRS();return{code:t?.code,label:t?.desc||t?.code,project:t=>e.transform(t),unproject:t=>e.untransform(t)}},gi=e=>{try{return e.getCenter()}catch{return si(`center`)}},_i=({position:e=`bottomcenter`,precision:n,systems:r})=>{let i=X();return typeof li?.resolve==`function`?t.React.createElement(ii,{position:Xr(i._controlCorners,e,`bottomleft`)},t.React.createElement(vi,{precision:n,systems:r})):t.React.createElement(ai,{what:`coordinate readout`})};_i.propTypes={position:t.PropTypes.string,precision:t.PropTypes.number,systems:t.PropTypes.array};var vi=({precision:e=5,systems:n})=>{let r=X(),[i,a]=pi(()=>gi(r)),[o,s]=pi(null),[c,l]=pi(null),[u,d]=pi(!1),[f,p]=pi(!1),[m,h]=pi(()=>r.getCRS()?.code);ui(()=>{let e=()=>h(r.getCRS()?.code);return r.on(`viewreset`,e),()=>r.off(`viewreset`,e)},[r]);let g=di(()=>li.resolve(n??si(`coordinateSystems`),hi(r),e),[n,e,m,r]),_=g.find(e=>e.key===o)??g[0],v=di(()=>ci.throttle(e=>a(e.latlng),100),[]);ui(()=>{if(!c)return r.on(`mousemove`,v),()=>r.off(`mousemove`,v)},[c,v,r]);let y=fi(null);ui(()=>()=>clearTimeout(y.current),[]);let b=_?c??_.toText(i):[``,``],x=(e,t)=>{d(!1),l(b.map((n,r)=>r===e?t:n))},S=()=>{let e=_?.toLatLng(b);if(!e||!li.inside(e,si(`bounds`))){d(!0);return}d(!1),l(null),r.setView(e,r.getZoom())},C=e=>{e.key===`Enter`&&(e.preventDefault(),S()),e.key===`Escape`&&(l(null),d(!1),e.target.blur())};return _?t.React.createElement(`div`,{id:`coordinates-control`,className:`coordinates-control`,onBlur:e=>{e.currentTarget.contains(e.relatedTarget)||(l(null),d(!1))}},g.length>1&&t.React.createElement(`select`,{className:`coordinates-control__system`,value:_.key,onChange:e=>{s(e.target.value),l(null)},"aria-label":Z(`coordinate_system`,`Coordinate system`)},g.map(e=>t.React.createElement(`option`,{key:e.key,value:e.key},e.label))),t.React.createElement(`div`,{className:`coordinates-control__pair`},b.map((e,n)=>{let[r,i]=mi[_.axes[n]]??[``,``];return t.React.createElement(`label`,{className:`coordinates-control__field`,key:_.axes[n]},t.React.createElement(`span`,{className:`coordinates-control__axis`},Z(r,i)),t.React.createElement(`input`,{type:`text`,className:`coordinates-control__value`,value:e,spellCheck:`false`,autoComplete:`off`,"aria-invalid":u||void 0,onChange:e=>x(n,e.target.value),onKeyDown:C,onFocus:e=>{l(b),e.target.select()}}))})),t.React.createElement(`button`,{type:`button`,className:`coordinates-control__copy`,onClick:()=>{let e=navigator.clipboard?.writeText?.(b.join(`, `));e&&e.then(()=>{p(!0),clearTimeout(y.current),y.current=setTimeout(()=>p(!1),1500)}).catch(()=>{})},title:Z(`copy`,`Copy`),"aria-label":Z(`copy`,`Copy`)},f?`✓`:`⧉`),u&&t.React.createElement(`div`,{className:`coordinates-control__rejected`,role:`status`},Z(`outside_bounds`,`Outside this map`))):null};vi.propTypes={precision:t.PropTypes.number,systems:t.PropTypes.array};var yi={plus:[`M12 5l0 14`,`M5 12l14 0`],minus:[`M5 12l14 0`],maximize:[`M4 8v-2a2 2 0 0 1 2 -2h2`,`M4 16v2a2 2 0 0 0 2 2h2`,`M16 4h2a2 2 0 0 1 2 2v2`,`M16 20h2a2 2 0 0 0 2 -2v-2`],minimize:[`M15 19v-2a2 2 0 0 1 2 -2h2`,`M15 5v2a2 2 0 0 0 2 2h2`,`M5 15h2a2 2 0 0 1 2 2v2`,`M5 9h2a2 2 0 0 0 2 -2v-2`],"zoom-scan":[`M4 8v-2a2 2 0 0 1 2 -2h2`,`M4 16v2a2 2 0 0 0 2 2h2`,`M16 4h2a2 2 0 0 1 2 2v2`,`M16 20h2a2 2 0 0 0 2 -2v-2`,`M8 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0`,`M16 16l-2.5 -2.5`]},bi=1.75,xi=(e,t={})=>{let n=yi[e];if(!n)return``;let{className:r=`atlas-icon atlas-icon--${e}`,size:i=18,stroke:a=bi}=t;return`<svg xmlns="http://www.w3.org/2000/svg" class="${r}" width="${i}" height="${i}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${a}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">`+n.map(e=>`<path d="${e}"/>`).join(``)+`</svg>`},{factory:Si}=f,{useLayoutEffect:Ci}=t.React,wi=({position:e=`topleft`})=>{let t=X();return Ci(()=>{if(!Si.control.fullscreen)return;let n=Si.control.fullscreen({position:e,content:xi(`maximize`)+xi(`minimize`)}).addTo(t);return()=>{n._toggleState&&t.off(`enterFullscreen exitFullscreen`,n._toggleState,n),n.remove()}},[t,e]),null};wi.propTypes={position:t.PropTypes.string};var{layerControl:Ti}=p,{useLayoutEffect:Ei}=t.React,Di=({basemap:e,overlays:t})=>{let n=X();return Ei(()=>{let r=Ti(e,t,{collapsed:!0}).addTo(n);return()=>{n.off(`click`,r.collapse,r),r.remove()}},[n,e,t]),null};Di.propTypes={basemap:t.PropTypes.object,overlays:t.PropTypes.object},Q(`/* -------------- */
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
`);var{setting:Oi}=d,{factory:ki}=f,{readout:Ai}=m,{useCallback:ji,useEffect:Mi,useRef:Ni,useState:Pi}=t.React,{Icon:Fi}=t.elements,Ii=()=>Jr(typeof navigator>`u`?void 0:navigator,typeof window>`u`?void 0:window),Li=({position:e=`topleft`,maxZoom:n})=>typeof Ai?.inside==`function`?t.React.createElement(ii,{position:e},t.React.createElement(Ri,{maxZoom:n})):t.React.createElement(ai,{what:`locate control`});Li.propTypes={position:t.PropTypes.string,maxZoom:t.PropTypes.number};var Ri=({maxZoom:e=16})=>{let n=X(),[r,i]=Pi(Ii()?`idle`:`unavailable`),[a,o]=Pi(null),s=Ni(null);Mi(()=>{let e=ki.layerGroup().addTo(n);return s.current=e,()=>{n.stopLocate(),e.clearLayers(),n.removeLayer(e),s.current=null}},[n]);let c=ji(()=>{s.current?.clearLayers(),o(null),i(Ii()?`idle`:`unavailable`)},[]);Mi(()=>{let t=t=>{let r=s.current;if(r){if(r.clearLayers(),ki.circleMarker(t.latlng,{radius:5,weight:2,color:`#1a73e8`,fillColor:`#1a73e8`,fillOpacity:1}).addTo(r),Number.isFinite(t.accuracy)&&t.accuracy>0&&ki.circle(t.latlng,{radius:t.accuracy,weight:1,color:`#1a73e8`,fillColor:`#1a73e8`,fillOpacity:.12}).addTo(r),Ai.inside(t.latlng,Oi(`bounds`))){n.setView(t.latlng,Math.min(e,n.getMaxZoom())),i(`found`),o(null);return}i(`outside`),o(Z(`outside_bounds`,`You are outside this map`))}},r=e=>{i(`error`),o(Z(`geolocation_failed`,`Could not find your position`)+(e?.message?` — ${e.message}`:``))};return n.on(`locationfound`,t),n.on(`locationerror`,r),()=>{n.off(`locationfound`,t),n.off(`locationerror`,r)}},[n,e]);let l=()=>{let e=Yr(r);if(e===`explain`){o(Z(`geolocation_insecure`,`Your position is only available over https`));return}if(e===`clear`){c();return}i(`locating`),o(null),n.locate({setView:!1,enableHighAccuracy:!0,timeout:1e4})},u=r===`unavailable`||r===`error`?`IconCurrentLocationOff`:`IconCurrentLocation`;return t.React.createElement(`div`,{className:`locate-control`},t.React.createElement(`div`,{className:`leaflet-bar`},t.React.createElement(`button`,{type:`button`,className:`locate-control__button${r===`locating`?` is-busy`:``}${r===`found`?` is-found`:``}`,onClick:l,title:Z(`geolocation`,`Show my position`),"aria-label":Z(`geolocation`,`Show my position`),"aria-busy":r===`locating`||void 0},t.React.createElement(Fi,{name:u,size:18,stroke:1.75,"aria-hidden":`true`}),t.React.createElement(`span`,{className:`locate-control__fallback`,"aria-hidden":`true`},`◎`))),a&&t.React.createElement(`div`,{className:`locate-control__message`,role:`status`},a))};Ri.propTypes={maxZoom:t.PropTypes.number},Q(`/* --------------- */
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
`);var{MEASURE_AREA:zi,MEASURE_RADIUS:Bi,MEAUSURE_LENGTH:Vi}=d,{factory:Hi}=f,{measure:Ui}=m,{useCallback:Wi,useEffect:Gi,useMemo:Ki,useRef:qi,useState:Ji}=t.React,{Icon:Yi}=t.elements,Xi={measure:`M`,length:`L`,area:`A`,radius:`R`,angle:`∠`,erase:`⌫`},Zi=({icon:e,mark:n})=>t.React.createElement(t.React.Fragment,null,t.React.createElement(Yi,{name:e,size:18,stroke:1.75,"aria-hidden":`true`}),t.React.createElement(`span`,{className:`measure-control__fallback`,"aria-hidden":`true`},n));Zi.propTypes={icon:t.PropTypes.string.isRequired,mark:t.PropTypes.string};var $={length:{shape:`line`,options:Vi,icon:`IconRuler2`,fallback:`Length`},area:{shape:`polygon`,options:zi,icon:`IconPolygon`,fallback:`Area`},radius:{shape:`circle`,options:Bi,icon:`IconCircleDot`,fallback:`Radius`},angle:{shape:`line`,options:Vi,icon:`IconAngle`,fallback:`Angle`}},Qi=({position:e=`topleft`,tools:n,expanded:r})=>typeof Ui?.anglesAlong==`function`&&m.draw?t.React.createElement(ii,{position:e},t.React.createElement($i,{tools:n,expanded:r})):t.React.createElement(ai,{what:`measurement control`});Qi.propTypes={position:t.PropTypes.string,tools:t.PropTypes.array,expanded:t.PropTypes.bool};var $i=({tools:e=[`length`,`area`,`radius`,`angle`],expanded:n=!1})=>{let r=X(),i=Ki(()=>r.draw??m.draw,[r]),[a,o]=Ji(n),[s,c]=Ji(null),[l,u]=Ji([]),d=Ki(()=>e.filter(e=>$[e]),[e]),f=qi(null);Gi(()=>{let e=Hi.layerGroup().addTo(r);return f.current=e,()=>{e.clearLayers(),r.removeLayer(e),f.current=null}},[r]);let p=qi({length:0,area:0}),h=s?$[s]:null,g=Wi(()=>{Object.values($).forEach(({shape:e})=>i[e]?.disable(`force`)),c(null)},[i]);Gi(()=>{if(!h)return;let e=e=>{let t=e?.layer;if(!t)return;f.current?.addLayer(t);let n=qr(s,t,p.current,Ui);n&&u(e=>[{tool:s,reading:n,at:Date.now()},...e].slice(0,3)),i[$[s].shape]?.isEnabled?.()||c(null)};return r.on(`new_shape`,e),()=>r.off(`new_shape`,e)},[h,s,r,i]),Gi(()=>g,[g]);let _=e=>{if(s===e){g();return}g(),c(e),i[$[e].shape]?.enable($[e].options)},v=()=>{g(),f.current?.clearLayers(),p.current={length:0,area:0},u([])};return d.length?a?t.React.createElement(`div`,{className:`measure-control`},t.React.createElement(`div`,{className:`measure-control__tools leaflet-bar`,role:`group`,"aria-label":Z(`measure`,`Measure`)},d.map(e=>t.React.createElement(`button`,{key:e,type:`button`,className:`measure-control__tool${s===e?` is-active`:``}`,onClick:()=>_(e),title:Z(e,$[e].fallback),"aria-label":Z(e,$[e].fallback),"aria-pressed":s===e},t.React.createElement(Zi,{icon:$[e].icon,mark:Xi[e]}))),t.React.createElement(`span`,{className:`measure-control__divider`,"aria-hidden":`true`}),t.React.createElement(`button`,{type:`button`,className:`measure-control__tool`,onClick:v,title:Z(`erase`,`Clear`),"aria-label":Z(`erase`,`Clear`)},t.React.createElement(Zi,{icon:`IconEraser`,mark:Xi.erase})),t.React.createElement(`button`,{type:`button`,className:`measure-control__tool measure-control__close`,onClick:()=>{v(),o(!1)},title:Z(`cancel`,`Close`),"aria-label":Z(`cancel`,`Close`),"aria-expanded":`true`},`×`)),l.length>0&&t.React.createElement(`dl`,{className:`measure-control__readout`,"aria-live":`polite`},l.map(({tool:e,reading:n,at:r})=>t.React.createElement(`div`,{className:`measure-control__line`,key:r},t.React.createElement(`dt`,null,Z(e,$[e].fallback)),t.React.createElement(`dd`,null,n))))):t.React.createElement(`div`,{className:`measure-control measure-control--closed`},t.React.createElement(`div`,{className:`leaflet-bar`},t.React.createElement(`button`,{type:`button`,className:`measure-control__toggle`,onClick:()=>o(!0),title:Z(`measure`,`Measure`),"aria-label":Z(`measure`,`Measure`),"aria-expanded":`false`},t.React.createElement(Zi,{icon:`IconRulerMeasure`,mark:Xi.measure})))):null};$i.propTypes={tools:t.PropTypes.array,expanded:t.PropTypes.bool};var{factory:ea}=f,{useLayoutEffect:ta}=t.React,na=140,ra=({position:e=`bottomleft`,units:t,ratio:n=!0})=>{let r=X();return ta(()=>{let i=t!==`imperial`,a=ea.control.scale({position:e,metric:i,imperial:!i,maxWidth:na}).addTo(r);if(!n)return()=>{a.remove()};let o=ea.DomUtil.create(`div`,`atlas-scale-ratio`,a.getContainer()),s=()=>{let e=r.getSize(),t=Math.round(e.y/2),n=Math.min(e.x,na),i=r.distance(r.containerPointToLatLng(ea.point(0,t)),r.containerPointToLatLng(ea.point(n,t)));o.textContent=Rr(Ir(i,n))??``};return r.on(`move zoomend`,s),s(),()=>{r.off(`move zoomend`,s),a.remove()}},[r,e,t,n]),null};ra.propTypes={position:t.PropTypes.string,units:t.PropTypes.string,ratio:t.PropTypes.bool},Q(`/*
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
`);var{useEffect:ia,useMemo:aa,useState:oa}=t.React,sa={in:`Zoom in`,out:`Zoom out`,level:`Zoom level`,upscaled:`Above here the basemap is enlarged, not sharper`,fit:`Zoom to the data`},ca=0,la=e=>`${(e*100).toFixed(4)}%`,ua=({name:e})=>t.React.createElement(`svg`,{className:`atlas-icon atlas-icon--${e}`,width:18,height:18,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:bi,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,focusable:`false`},yi[e].map(e=>t.React.createElement(`path`,{key:e,d:e})));ua.propTypes={name:t.PropTypes.oneOf(Object.keys(yi)).isRequired};var da=({position:e=`bottomright`,marks:n=[],labels:r,onFit:i})=>{let a={...sa,...r},o=X(),[s]=oa(()=>(ca+=1,`atlas-zoom-marks-${ca}`)),[c,l]=oa(()=>({min:o.getMinZoom(),max:o.getMaxZoom()})),[u,d]=oa(()=>o.getZoom());ia(()=>{let e=()=>d(o.getZoom()),t=()=>{l({min:o.getMinZoom(),max:o.getMaxZoom()}),e()};return o.on(`zoomend`,e),o.on(`zoomlevelschange`,t),t(),()=>{o.off(`zoomend`,e),o.off(`zoomlevelschange`,t)}},[o]);let{min:f,max:p}=c,m=aa(()=>Nr(f,p),[f,p]),h=aa(()=>Pr(n,f,p),[n,f,p]),g=Math.round(u),_=h.filter(e=>e.label).map(e=>e.label).join(`. `),v=t.React.createElement(`div`,{className:`atlas-zoom`},i&&t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step atlas-zoom__fit`,onClick:i,title:a.fit,"aria-label":a.fit},t.React.createElement(ua,{name:`zoom-scan`})),t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step`,onClick:()=>o.zoomIn(),disabled:g>=p,title:a.in,"aria-label":a.in},t.React.createElement(ua,{name:`plus`})),m.length>1&&t.React.createElement(`div`,{className:`atlas-zoom__rail`},t.React.createElement(`div`,{className:`atlas-zoom__track`}),h.map(e=>t.React.createElement(`span`,{key:`${e.kind??`mark`}-${e.from}-${e.to}`,className:`atlas-zoom__mark atlas-zoom__mark--${e.kind??`plain`}`,style:{bottom:la(e.offset),height:la(e.span)},title:e.label})),m.map(e=>t.React.createElement(`span`,{key:e.zoom,className:[`atlas-zoom__rung`,e.labelled?`atlas-zoom__rung--numbered`:``,e.zoom===g?`atlas-zoom__rung--here`:``].filter(Boolean).join(` `),style:{bottom:la(e.offset)}},e.labelled?t.React.createElement(`i`,{className:`atlas-zoom__number`},e.zoom):null)),t.React.createElement(`input`,{type:`range`,className:`atlas-zoom__slider`,min:f,max:p,step:1,value:Math.min(Math.max(g,f),p),onChange:e=>o.setZoom(Number(e.target.value)),"aria-label":a.level,"aria-describedby":_?s:void 0}),_?t.React.createElement(`p`,{className:`atlas-zoom__described`,id:s},_):null),t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step`,onClick:()=>o.zoomOut(),disabled:g<=f,title:a.out,"aria-label":a.out},t.React.createElement(ua,{name:`minus`})),t.React.createElement(`output`,{className:`atlas-zoom__level`,title:a.level},g));return t.React.createElement(ii,{position:e},t.React.createElement(`div`,{className:`atlas-zoom__host`,ref:oi},v))};da.propTypes={position:t.PropTypes.string,marks:t.PropTypes.array,labels:t.PropTypes.object,onFit:t.PropTypes.func};var{factory:fa}=f,{useEffect:pa,useLayoutEffect:ma,useRef:ha}=t.React,ga=({position:e=`bottomright`,fit:t=!0,extent:n=null,labels:r})=>{let i=X(),a=r?.fit??sa.fit,o=ha(n);o.current=n;let s=ha(null);return ma(()=>{let n=fa.control.zoom({position:e,zoomInText:xi(`plus`),zoomOutText:xi(`minus`)}).addTo(i);if(t){let e=n.getContainer(),t=fa.DomUtil.create(`a`,`atlas-fit`);t.href=`#`,t.title=a,t.setAttribute(`role`,`button`),t.setAttribute(`aria-label`,a),t.innerHTML=xi(`zoom-scan`),t.style.display=o.current?``:`none`,fa.DomEvent.disableClickPropagation(t),fa.DomEvent.on(t,`click`,fa.DomEvent.stop),fa.DomEvent.on(t,`click`,()=>{o.current&&i.fitBounds(o.current,{padding:zr})}),e.insertBefore(t,e.firstChild),s.current=t}return()=>{n.remove(),s.current=null}},[i,e,t,a]),pa(()=>{s.current&&(s.current.style.display=n?``:`none`)},[n]),null};ga.propTypes={position:t.PropTypes.string,fit:t.PropTypes.bool,extent:t.PropTypes.array,labels:t.PropTypes.object},Q(`/*
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
`);var{useEffect:_a,useMemo:va,useRef:ya,useState:ba}=t.React,xa=({session:e,overrides:n,layerSwitcher:r=!1,zoomControl:i=!0,zoomPosition:a=`bottomright`,zoomMarks:o,zoomLabels:s,fit:c=!0,extent:l=null,view:u=null,coordinates:d=!0,coordinatesPosition:p=`bottomcenter`,measure:m=!0,measurePosition:h=`topleft`,measureTools:g,fullscreen:_=!0,fullscreenPosition:v=`topleft`,locate:y=!0,locatePosition:b=`topleft`,scale:x=!0,scalePosition:S=`bottomleft`,scaleRatio:C=!0,className:T=`atlas-map`,style:E,onReady:D,onError:O,children:k})=>{let A=ya(null),j=ya(null),[M,N]=ba(null),[P,F]=ba(null),I=P!==null,[L,R]=ba(null),[z,ee]=ba(null);_a(()=>{let t=!1;if(typeof f.createMap!=`function`){let e=Error(`perun-atlas: this map needs spatial 4.2.1 or later, which builds a map per screen with createMap. The spatial on this page has no createMap, so no map is shown.`);R(e),O?.(e);return}return(async()=>{try{let r=await w(n);if(t)return;de(r);let i=document.createElement(`div`);i.style.height=`100%`,i.style.width=`100%`,A.current?.appendChild(i);let a=f.createMap(i,{center:u?.center??r.center,zoom:u?.zoom??r.zoom,minZoom:r.minZoom,maxZoom:r.maxZoom});j.current=a,N({map:a,config:r});let{basemap:o,overlays:s}=await ke(e,{maxZoom:r.maxZoom});if(t)return;let c=je(o,u?.basemap)??Ae(o);c&&c.addTo(a);let l=e=>ee(e?.options?.maxNativeZoom??null);l(c),a.on(`baselayerchange`,e=>l(e.layer)),a.invalidateSize(),D?.({map:a,config:r,basemap:o,overlays:s}),F({basemap:o,overlays:s})}catch(e){if(t)return;console.error(e),R(e),O?.(e)}})(),()=>{t=!0;let e=j.current;if(j.current=null,e){let t=e.getContainer();e.remove(),e.off(),t.parentNode?.removeChild(t)}}},[]),_a(()=>{let e=A.current;if(!e||typeof ResizeObserver>`u`)return;let t=null,n=new ResizeObserver(e=>{let n=e[0]?.contentRect;n&&n.width!==0&&n.height!==0&&(t!==null&&cancelAnimationFrame(t),t=requestAnimationFrame(()=>{t=null,j.current?.invalidateSize()}))});return n.observe(e),()=>{t!==null&&cancelAnimationFrame(t),n.disconnect()}},[I]);let te=va(()=>[...z===null?[]:[{from:z,to:1/0,kind:`upscaled`,label:s?.upscaled??sa.upscaled}],...o??[]],[z,o,s]);if(L)return t.React.createElement(`div`,{className:`${T} atlas-map-error`,role:`alert`},L.message);let ne=M?.config;return t.React.createElement(Hr.Provider,{value:M?.map??null},t.React.createElement(`div`,{ref:A,className:T,style:{height:`100%`,...E}}),M&&t.React.createElement(t.React.Fragment,null,_&&t.React.createElement(wi,{position:v}),y&&t.React.createElement(Li,{position:b}),t.React.createElement(Gr,{credit:ne.attribution}),i&&i!==`rail`&&t.React.createElement(ga,{position:a,fit:c,extent:l,labels:s}),x&&t.React.createElement(ra,{position:S,units:ne.units,ratio:C}),d&&t.React.createElement(_i,{position:p}),m&&t.React.createElement(Qi,{position:h,tools:g})),I&&r&&t.React.createElement(Di,{basemap:P.basemap,overlays:P.overlays}),I&&i===`rail`&&t.React.createElement(da,{position:a,marks:te,labels:s,onFit:c&&l?()=>M.map.fitBounds(l,{padding:zr}):void 0}),I&&k)},Sa={weight:1,opacity:1,color:`#4A5C66`,fillOpacity:.55,fillColor:`#B8C6CC`},Ca=(e={},t={})=>({...Sa,...e.style,...t}),wa=(e,t)=>e||t?{...e,...t}:void 0,Ta=(e,t)=>{let n=e?.variants;if(!n?.by)return e;let r=n.cases?.[t?.properties?.[n.by]];return r?{...e,...r,style:wa(e.style,r.style),marker:wa(e.marker,r.marker),label:wa(e.label,r.label),popup:wa(e.popup,r.popup),arrow:wa(e.arrow,r.arrow)}:e},Ea=(e,t)=>{let n=e?.label?.scale;if(!n)return!1;let{min:r=0,max:i=24}=n;return t>=r&&t<=i},Da=(e,t)=>{let n=e?.label?.field;if(!n)return null;let r=t?.properties?.[n];return r==null?null:String(r)},Oa=(e,t)=>{let n=e=>{let n=e?t?.properties?.[e]:void 0;return n==null||n===``?null:String(n)};return n(e?.label?.field)??n(e?.popup?.title)??n(e?.details?.title)},ka=(e,t,n)=>{let r=e?.popup;if(!r)return null;let i=e=>{let n=t?.properties?.[e];return n==null||n===``?null:String(n)},a=r.title?i(r.title):null,o=(r.fields??[]).map(({label:e,field:t})=>({label:e&&n?.(e)||e||t,value:i(t)})).filter(e=>e.value!==null);return a===null&&o.length===0?null:{title:a,rows:o}},Aa=(e,t,n)=>{let r=e?.details;if(!r)return null;let i=t?.properties??{},a=new Set([...it,...r.exclude??[]]),o=e=>e==null||e===``?null:String(e),s=r.title?o(i[r.title]):null,c=Object.entries(i).filter(([e,t])=>!a.has(e)&&e!==r.title&&(typeof t!=`object`||!t)).map(([e,t])=>({field:e,label:n?.(e.toLowerCase())||e,value:o(t)})).filter(e=>e.value!==null);return s===null&&c.length===0?null:{title:s,rows:c,spec:r}},ja=`::`,Ma=(e=[],t=[])=>e.length>=2||e.some(e=>t.includes(e.key)),Na=(e,t)=>`${e??``}${ja}${t??``}`,Pa=`${ja}fallback`,Fa=`${ja}file`,Ia=(e,t,n)=>{let r=t?.variants?.by,i=r?n?.properties?.[r]:void 0,a=i!==void 0&&t?.variants?.cases?.[i]?i:void 0;return{name:e,value:a,key:Na(e,a)}},La=({descriptors:e,nameOf:t})=>{let n=new WeakMap,r=r=>{if(n.has(r))return n.get(r);let i=Ta(e[t(r)],r);return n.set(r,i),i},i=n=>{let r=t(n);return Ia(r,e[r],n)},a=new Map;return{entryFor:r,kindOf:i,note:e=>{let{name:t,value:n,key:o}=i(e);return a.has(o)||a.set(o,{name:t,value:n,descriptor:r(e),geometry:e?.geometry?.type}),o},drawn:()=>[...a.values()]}},Ra=(e=``)=>/Point$/.test(e)?`point`:/LineString$/.test(e)?`line`:`area`,za=({name:e,value:t,descriptor:n},r)=>{let i=n?.legend;if(i){let e=r?.(i);if(e)return e}let a=t??e;return a==null||a===``?``:r?.(String(a).toLowerCase())||String(a)},Ba=(e,t)=>{let n=Ra(e.geometry),r=e.descriptor??{};return{key:Na(e.name,e.value),label:za(e,t),kind:n,path:Ca(r),marker:n===`point`?r.marker??{}:null,arrow:n===`line`?r.arrow??null:null}},Va=(e=[],t)=>e.map(e=>Ba(e,t)).filter(e=>e.label!==``),Ha=({palette:e={},values:t=[],fallback:n,usedFallback:r=!1,unknownLabel:i=`unknown`}={},a)=>{let o=e=>({...Sa,color:e,fillColor:e,fillOpacity:.7}),s=t.filter(t=>Object.prototype.hasOwnProperty.call(Object(e),t)&&e[t]).map(t=>({key:String(t),label:a?.(String(t).toLowerCase())||String(t),kind:`area`,path:o(e[t]),marker:null,arrow:null}));return!r||!n?s:[...s,{key:Pa,label:a?.(i)||`Not classified`,kind:`area`,path:o(n),marker:null,arrow:null}]},Ua={__unknown:`#B8C6CC`},Wa=(e,t)=>Object.prototype.hasOwnProperty.call(Object(e),t)&&!!e[t],Ga=({field:e,palette:t=Ua,fallback:n=Ua.__unknown})=>{let r=new Set,i=pe(e),a=e=>i(e?.properties);return i=>{let o=a(i);return o==null?n:Wa(t,o)?t[o]:(r.has(o)||(r.add(o),console.warn(`perun-atlas: no palette entry for ${e}="${o}"`)),n)}},Ka=(e=[],{field:t,palette:n=Ua}={})=>{let r=pe(t),i=e=>r(e?.properties),a=new Set,o=[],s=!1;return e.forEach(e=>{let t=i(e);if(t==null){s=!0;return}Wa(n,t)||(s=!0),!a.has(t)&&(a.add(t),o.push(t))}),{values:o,usedFallback:s}},qa=({field:e,palette:t=Ua}={})=>{let n=pe(e);return e=>{let r=n(e?.properties);return r!=null&&Wa(t,r)?String(r):Pa}},Ja=(e,t,{featureKey:n,rowKey:r,as:i=`status`})=>{let a=pe(r),o=pe(n),s=new Map((t??[]).map(e=>[String(a(e)),e]));return{...e,features:(e?.features??[]).map(e=>{let t=s.get(String(o(e?.properties)));return t?{...e,properties:{...e.properties,[i]:t}}:e})}},{useEffect:Ya,useRef:Xa}=t.React,Za=e=>{let t=Xa(e);t.current=e;let n=Xa(null);return Ya(()=>{n.current?.(e)},[JSON.stringify(e)]),{hiddenRef:t,filterRef:n}},Qa=(e,t)=>{e&&t&&Object.entries(t).forEach(([t,n])=>{t.startsWith(`--`)?e.style.setProperty(t,n):e.style[t]=n})},$a=e=>e instanceof Node?e:document.createTextNode(String(e)),eo=(e,t,n)=>{let r=n.startsWith(`text/csv`)?`﻿`:``,i=URL.createObjectURL(new Blob([r,t],{type:n})),a=document.createElement(`a`);a.href=i,a.download=e,a.style.display=`none`,document.body.appendChild(a),a.click(),a.remove(),setTimeout(()=>URL.revokeObjectURL(i),0)},to=async(e,t=document.body)=>{if(window.isSecureContext&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{}let n=document.createElement(`textarea`);n.value=e,n.setAttribute(`readonly`,``),n.setAttribute(`aria-hidden`,`true`),Object.assign(n.style,{position:`fixed`,top:`0`,left:`0`,opacity:`0`}),t.appendChild(n),n.select();let r=!1;try{r=document.execCommand(`copy`)}catch{r=!1}return n.remove(),r},no=(e,t=[])=>{let n=new Set(t),r=[],i=[];return e.forEach(e=>{let t=n.has(e.key);t!==!!e.hidden&&(e.hidden=t,(t?r:i).push(e))}),{leaving:r,returning:i}},ro=(e,t)=>{let n=e.filter(({hidden:e})=>!e);n.forEach(({layer:e})=>e.bringToFront?.()),n.forEach(({layer:e})=>t?.get(e)?.bringToFront?.())},io=(e,t=[],n)=>{let r=e?.features;if(!Array.isArray(r)||!t.length)return e;let i=new Set(t),a=r.filter(e=>!i.has(n(e)));return a.length===r.length?e:{...e,features:a}},ao=e=>{let t=e.filter(e=>!e.hidden),n=1/0,r=1/0,i=-1/0,a=-1/0,o=({lat:e,lng:t})=>{n=Math.min(n,e),r=Math.min(r,t),i=Math.max(i,e),a=Math.max(a,t)};return(t.length?t:e).forEach(({layer:e})=>{if(typeof e.getBounds==`function`){let t=e.getBounds();t?.isValid?.()&&(o(t.getSouthWest()),o(t.getNorthEast()))}else typeof e.getLatLng==`function`&&o(e.getLatLng())}),n===1/0?null:[[n,r],[i,a]]},oo=({title:e,rows:t},n={})=>{let r=document.createElement(`div`);if(r.className=[`atlas-popup`,n.className].filter(Boolean).join(` `),Qa(r,n.style),e){let t=document.createElement(`p`);t.className=`atlas-popup-title`,t.textContent=e,Qa(t,n.titleStyle),r.appendChild(t)}if(t.length){let e=document.createElement(`dl`);e.className=`atlas-popup-fields`,t.forEach(({label:t,value:r})=>{let i=document.createElement(`dt`);i.textContent=t,Qa(i,n.labelStyle);let a=document.createElement(`dd`);a.textContent=r,Qa(a,n.valueStyle),e.append(i,a)}),r.appendChild(e)}return r},so=(e,t,{popup:n,labelResolver:r}={})=>{if(n){let t=n(e);return t==null?null:$a(t)}let i=ka(t,e,r);return i?oo(i,t?.popup):null},co={className:`atlas-popup-shell`,maxWidth:280},{factory:lo}=f,{useEffect:uo,useRef:fo}=t.React,po=[],mo=({servicePath:e,context:t,reload:n,srid:r,statusRows:i,join:a,field:o,palette:s,fallback:c,descriptor:l,hidden:u=po,onFeatureClick:d,onLegend:f,onShown:p,onLoadStart:m,onLoad:h,onError:g,tooltip:_,popup:v,labelResolver:y})=>{let b=X(),x=fo(null),S=fo(0),{hiddenRef:C,filterRef:w}=Za(u);return uo(()=>{let n=!1,u=Ga({field:o,palette:s,fallback:c}),T=qa({field:o,palette:s}),E=async()=>{let c=++S.current;O={zoom:b.getZoom(),bounds:b.getBounds()};try{m?.();let g=await _e(e,{...t||{},map:{...t?.map||{},bbox:I(r,b)}});if(n||c!==S.current)return;let E=a&&i?Ja(g,i,a):g;x.current&&b.removeLayer(x.current);let D=[],O=lo.geoJSON(E,{crs:b.getCRS(),style:e=>Ca(l,{fillColor:u(e)}),onEachFeature:(e,t)=>{D.push({layer:t,feature:e,key:T(e),hidden:!1});let n=_?.(e);n&&t.bindTooltip($a(n),{sticky:!0});let r=so(e,l,{popup:v,labelResolver:y});r&&t.bindPopup(r,co),d&&t.on(`click`,()=>d(e,Aa(l,e,y)))}}),k=e=>{let{leaving:t,returning:n}=no(D,e);return t.forEach(({layer:e})=>O.removeLayer(e)),n.forEach(({layer:e})=>O.addLayer(e)),n.length&&ro(D),t.length>0||n.length>0};k(C.current),x.current=O.addTo(b);let A=e=>p?.(io(E,e,T));w.current=e=>{k(e)&&A(e)},f?.(Ka(E?.features,{field:o,palette:s})),A(C.current),h?.(E)}catch(e){console.error(`perun-atlas: choropleth failed to render`,e),!n&&c===S.current&&g?.(e)}},D=null,O=null,k=()=>!!O&&b.getZoom()===O.zoom&&O.bounds.contains(b.getBounds()),A=()=>{clearTimeout(D),D=setTimeout(()=>{k()||E()},250)};return E(),b.on(`moveend`,A),()=>{n=!0,w.current=null,clearTimeout(D),b.off(`moveend`,A),x.current&&(b.removeLayer(x.current),x.current=null)}},[b,e,o,r,n,i,JSON.stringify(t??{})]),null};Q(`/*
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
`);var{factory:ho}=f,{useEffect:go,useRef:_o}=t.React,vo=(e,...t)=>t.forEach(t=>{t.current&&(e.removeLayer(t.current),t.current=null)}),yo={color:`#b3261e`,weight:2,opacity:.95,fillColor:`#b3261e`,fillOpacity:.12},bo={...yo,dashArray:`5 4`,fillOpacity:.06},xo=({value:e,drawing:t=!1,onChange:n,onDrawn:r,style:i,editable:a=!0})=>{let o=X(),s=_o(null),c=_o(null),l=_o(null),u=_o(n);u.current=n;let d=_o(r);return d.current=r,go(()=>{let e=(o.draw??m?.draw)?.circle;if(!t||!e){!t&&e?.isEnabled?.()&&e.disable(),t&&!e&&console.warn(`perun-atlas: the engine on this environment has no circle draw tool; skipping it.`);return}let n=({shape:e,layer:t})=>{if(e!==`circle`||!t)return;let n=t.getLatLng(),r=t.getRadius();o.removeLayer(t);let i={lat:n.lat,lng:n.lng,radius:r};u.current?.(i),d.current?.(i)};return o.on(`new_shape`,n),e.enable({templineStyle:bo,hintlineStyle:{...bo,fillOpacity:0},pathOptions:{...yo,...i},cursorMarker:!0,tooltips:!1}),()=>{o.off(`new_shape`,n),e.isEnabled?.()&&e.disable()}},[o,t]),go(()=>{if(!e||!(e.radius>0)){vo(o,s,c,l);return}let t=ho.latLng({lat:e.lat,lng:e.lng});if(s.current?(s.current.setLatLng(t),s.current.setRadius(e.radius)):s.current=ho.circle(t,{...yo,...i,radius:e.radius,showMeasurements:!0,interactive:!1}).addTo(o),!a){vo(o,c,l);return}let n=ho.latLng({lat:t.lat,lng:s.current.getBounds().getEast()});c.current?c.current.setLatLng(t):(c.current=ho.marker(t,{icon:ho.divIcon({className:`atlas-draw-handle atlas-draw-handle--centre`,html:``}),draggable:!0,zIndexOffset:1e3}).addTo(o),c.current.on(`drag`,e=>{let t=e.target.getLatLng();u.current?.({lat:t.lat,lng:t.lng,radius:s.current?.getRadius()})})),l.current?l.current.setLatLng(n):(l.current=ho.marker(n,{icon:ho.divIcon({className:`atlas-draw-handle atlas-draw-handle--edge`,html:``}),draggable:!0,zIndexOffset:1e3}).addTo(o),l.current.on(`drag`,e=>{let n=e.target.getLatLng(),r=c.current?.getLatLng()??t;u.current?.({lat:r.lat,lng:r.lng,radius:o.distance(r,n)})}))},[o,e?.lat,e?.lng,e?.radius,a]),go(()=>()=>vo(o,s,c,l),[o]),null};Q(`/*
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
`);var{useMemo:So}=t.React,Co=({from:e,to:n,onChange:r,labels:i={},disabled:a=!1,className:o=`atlas-date-range`})=>{let s=So(()=>({type:`object`,properties:{from:{type:`string`,format:`date`,title:i.from??`From`},to:{type:`string`,format:`date`,title:i.to??`To`}}}),[i.from,i.to]),c=So(()=>({"ui:order":[`from`,`to`],"ui:submitButtonOptions":{norender:!0},from:{"ui:disabled":a},to:{"ui:disabled":a}}),[a]);return t.React.createElement(`div`,{className:o},t.React.createElement(t.Form,{idPrefix:`atlas-range`,schema:s,uiSchema:c,formData:{from:e,to:n},validator:t.validator,customValidate:(e,t)=>(e?.from&&e?.to&&e.from>e.to&&t.to.addError(i.invalidRange??`The end date is before the start date.`),t),liveValidate:!0,showErrorList:!1,noHtml5Validate:!0,onChange:({formData:e})=>r?.(e)},t.React.createElement(t.React.Fragment,null)))},{Icon:wo}=t.elements,{useState:To}=t.React,Eo=({drawing:e,busy:n,onStart:r,onCancel:i,labels:a={}})=>t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn ${e?`atlas-panel__btn--primary`:`atlas-panel__btn--ghost`}`,"aria-pressed":e,onClick:e?i:r,disabled:n},t.React.createElement(wo,{name:`IconCircleDashed`,size:16,stroke:1.75,"aria-hidden":`true`}),a.draw??`Draw an area`),Do=e=>`atlas-panel__drawbox${e?` atlas-panel__drawbox--off`:``}`,Oo=0,ko=()=>`atlas-draw-${Oo+=1}`,Ao=({shape:e,drawing:n,busy:r,onCancel:i,onRadius:a,onSave:o,note:s,form:c,caught:l,savable:u=!0,limits:d={},labels:f={}})=>{let{min:p=50,max:m=5e5,step:h=50}=d,g=!!e,[_]=To(ko),v=`${_}-form`,y=!!c?.schema,b=r||!g||s?.required&&!String(s.value??``).trim()||!(!c||c.schema),x=()=>{!b&&u&&o?.()};return t.React.createElement(`div`,{className:`atlas-panel__draw`,role:`group`,"aria-label":f.draw??`Draw`},n&&!g&&t.React.createElement(`p`,{className:`atlas-panel__drawhint`},f.drawing??`Click a centre, then an edge`),g&&t.React.createElement(`label`,{className:`atlas-panel__drawfield`},t.React.createElement(`span`,null,f.radius??`Radius`),t.React.createElement(`span`,{className:Do(r)},t.React.createElement(`input`,{type:`number`,inputMode:`numeric`,value:Math.round(e.radius),min:p,max:m,step:h,disabled:r,onChange:e=>{let t=Number(e.target.value);Number.isFinite(t)&&t>0&&a(t)}}),t.React.createElement(`span`,{className:`atlas-panel__drawunit`},f.metres??`m`))),g&&c&&!c.schema&&t.React.createElement(`p`,{className:`atlas-panel__drawhint`},c.loading?f.formLoading??`Loading the fields…`:f.formFailed??`These fields did not load, so there is nothing to save into.`),g&&c?.schema&&t.React.createElement(`div`,{className:`atlas-panel__drawform`},t.React.createElement(t.Form,{id:v,idPrefix:_,schema:c.schema,uiSchema:{"ui:submitButtonOptions":{norender:!0},...c.uiSchema},formData:c.data,validator:t.validator,disabled:r,liveValidate:!1,showErrorList:!1,onChange:({formData:e})=>c.onChange?.(e),onSubmit:x},t.React.createElement(t.React.Fragment,null))),g&&s&&t.React.createElement(`label`,{className:`atlas-panel__drawfield atlas-panel__drawfield--wide`},t.React.createElement(`span`,null,f.note??`Note`),t.React.createElement(`span`,{className:Do(r)},t.React.createElement(`input`,{type:`text`,value:s.value??``,disabled:r,placeholder:f.notePlaceholder??``,onChange:e=>s.onChange(e.target.value)}))),g&&l&&t.React.createElement(`p`,{className:`atlas-panel__drawcount`,"aria-live":`polite`},t.React.createElement(`b`,null,l.count),t.React.createElement(`span`,null,f.caught??`inside`),t.React.createElement(`span`,{className:`atlas-panel__drawtotal`},`/ ${l.total}`)),g&&t.React.createElement(`div`,{className:`atlas-panel__drawactions`},u&&t.React.createElement(`button`,{type:y?`submit`:`button`,form:y?v:void 0,className:`atlas-panel__btn atlas-panel__btn--primary`,onClick:y?void 0:x,disabled:b},t.React.createElement(wo,{name:`IconDeviceFloppy`,size:16,stroke:1.75,"aria-hidden":`true`}),f.save??`Save`),t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:i,disabled:r},f.discard??`Discard`)))},jo=({lat:e,lng:t})=>`${e.toFixed(6)},${t.toFixed(6)}`,Mo=(e,t,n)=>{let r=e.original.map(e=>{let r=t[jo(e)];if(!r)return e;let i=n(r);return i&&i!==r?i.getLatLng():e}),i=r.map(jo).join(` `);return i===e.key?null:{next:r,key:i}},No=e=>e<.5?4*e*e*e:1-(-2*e+2)**3/2,Po=(e,t,n)=>t.map((t,r)=>{let i=e[r];return i?{lat:i.lat+(t.lat-i.lat)*n,lng:i.lng+(t.lng-i.lng)*n}:t}),Fo=e=>Array.isArray(e?.[0])?e.map(Fo).reverse():[...e??[]].reverse(),Io=({factory:e,group:t,into:n,arrowOf:r})=>{let i=new WeakMap;return t.eachLayer(t=>{let a=r(t.feature);if(!a||typeof t.getLatLngs!=`function`)return;let o=a.reverse?Fo(t.getLatLngs()):t;i.set(t,e.polylineDecorator(o,{patterns:[{offset:a.offset??`12%`,repeat:a.repeat??160,symbol:e.Symbol.arrowHead({pixelSize:a.pixelSize??12,polygon:!1,pathOptions:{stroke:!0,weight:2,color:t.options.color,opacity:1}})}]}).addTo(n))}),i},Lo=({map:e,surface:t,lines:n,markerAt:r,decoratorOf:i,glide:a})=>{let o=e=>t.getVisibleParent?.(e),s=(e,t)=>{e.layer.setLatLngs(t);let n=i?.get(e.layer);n&&n.setPaths(e.reverse?Fo(t):e.layer)},c=typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,l=null,u=[],d=()=>{l!==null&&cancelAnimationFrame(l),l=null,u=[]},f=e=>{d(),u=e;let t=e.map(({line:e})=>e.layer.getLatLngs()),n=performance.now(),r=i=>{let o=Math.min(1,(i-n)/a),c=No(o);e.forEach((e,n)=>s(e.line,Po(t[n],e.next,c))),o<1?l=requestAnimationFrame(r):(l=null,u=[],e.forEach(e=>s(e.line,e.next)))};l=requestAnimationFrame(r)},p=()=>{let e=[];if(n.forEach(t=>{let n=Mo(t,r,o);n&&(t.key=n.key,e.push({line:t,next:n.next}))}),!e.length)return;let t=new Set(e.map(({line:e})=>e)),i=[...u.filter(({line:e})=>!t.has(e)),...e];!a||c||i.length>150?(d(),i.forEach(e=>s(e.line,e.next))):f(i)};p(),t.on(`animationend`,p),e.on(`moveend`,p);let m=()=>{d(),t.off(`animationend`,p),e.off(`moveend`,p)};return m.reroute=p,m},Ro=(e,t,n,r)=>{let i=/Point$/.test(t.geometry?.type??``),a=(n.marker?.size??24)/2;return e.bindTooltip($a(r),{permanent:!0,direction:n.label?.direction??(i?`top`:`center`),offset:n.label?.offset??(i?[0,-a]:[0,0]),className:[`atlas-label`,n.label?.className].filter(Boolean).join(` `),opacity:1}),n.label?.style&&e.on(`tooltipopen`,e=>Qa(e.tooltip.getElement(),n.label.style)),!!n.label?.scale},zo=(e,t)=>{e.forEach(({layer:e,descriptor:n})=>{if(e._atlasHidden)return;let r=Ea(n,t);r!==e.isTooltipOpen()&&(r?e.openTooltip():e.closeTooltip())})},Bo=280,Vo={chunkedLoading:!0,showCoverageOnHover:!1,spiderfyDistanceMultiplier:2},Ho=[{upTo:9,name:`sm`,size:32},{upTo:99,name:`md`,size:38},{upTo:1/0,name:`lg`,size:46}],Uo=e=>{if(!e)return null;if(e===!0)return{from:0,options:{...Vo},badge:{},glide:Bo};if(typeof e==`number`)return{from:e,options:{...Vo},badge:{},glide:Bo};let{from:t=0,className:n,style:r,glide:i=Bo,...a}=e;return{from:t,options:{...Vo,...a},badge:{className:n,style:r},glide:i===!0?Bo:i}},Wo=(e,t={})=>{let n=Ho.find(({upTo:t})=>e<=t)??Ho[Ho.length-1],r=document.createElement(`span`);return r.className=`atlas-cluster__count`,r.textContent=String(e),Qa(r,t.style),{element:r,size:n.size,className:[`atlas-cluster`,`atlas-cluster--${n.name}`,t.className].filter(Boolean).join(` `)}},Go=({map:e,factory:t,group:n,cluster:r,points:i})=>{let a=t.featureGroup().addTo(e),o=Uo(r),s=typeof t.markerClusterGroup==`function`;o!==null&&!s&&console.warn(`perun-atlas: clustering was configured, but the map engine on this deployment does not carry it`);let c=o!==null&&s&&i>=o.from,l=c?t.markerClusterGroup({...o.options,iconCreateFunction:e=>{let{element:n,size:r,className:i}=Wo(e.getChildCount(),o.badge);return t.divIcon({html:n,className:i,iconSize:[r,r]})}}):n;if(l.addTo(e),c){let e=[];n.eachLayer(t=>{t._atlasPinned?e.push(t):l.addLayer(t)}),e.forEach(e=>a.addLayer(e))}let u=c?t.featureGroup().addTo(e):l,d=e=>c&&e._atlasPinned?a:l;return{surface:l,arrows:u,clustering:c,settings:o,layers:u===l?[l,a]:[l,u,a],move:(e,t,n)=>{let r=[];e.forEach(({layer:e})=>{e._atlasHidden=!t;let i=d(e);c&&i===l?r.push(e):t?i.addLayer(e):i.removeLayer(e);let a=n?.get(e);a&&t?u.addLayer(a):a&&u.removeLayer(a)}),r.length&&(t?l.addLayers(r):l.removeLayers(r))}}};Q(`/*
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
`);var{factory:Ko}=f,{useEffect:qo,useRef:Jo}=t.React,Yo=[],Xo=({servicePath:e,context:t,reload:n,descriptors:r={},descriptorFor:i,cluster:a,fit:o=!0,tooltip:s,popup:c,labelResolver:l,pinned:u,hidden:d=Yo,onFeatureClick:f,onLegend:p,onShown:m,onExtent:h,onLoadStart:g,onLoad:_,onError:v})=>{let y=X(),b=Jo([]),x=Jo([]),{hiddenRef:S,filterRef:C}=Za(d);return qo(()=>{let n=!1,d=La({descriptors:r,nameOf:e=>i?.(e)??ve(e)}),{entryFor:w}=d,T=()=>zo(x.current,y.getZoom()),E=()=>{x.current=[],b.current.forEach(e=>y.removeLayer(e)),b.current=[]},D=Object.create(null),O=[],k=[],A=e=>!!u?.(e),j=[];return(async()=>{try{g?.();let r=await _e(e,t);if(n)return;E();let i=0,u=Ko.geoJSON(r,{crs:y.getCRS(),pointToLayer:(e,t)=>{i+=1;let{marker:n={}}=w(e)??{},r=n.size??24,a=Ko.marker(t,{icon:Ko.divIcon({className:n.className??`atlas-marker`,iconSize:[r,r]})});return n.style&&a.on(`add`,()=>Qa(a.getElement(),n.style)),D[jo(t)]=a,a._atlasPinned=A(e),a},style:e=>Ca(w(e)),onEachFeature:(e,t)=>{let n=w(e)??{};j.push({layer:t,feature:e,key:d.note(e),hidden:!1});let r=s?s(e):Da(n,e);if(r&&Ro(t,e,n,r)&&x.current.push({layer:t,descriptor:n}),typeof t.getLatLngs==`function`){let e=t.getLatLngs();Array.isArray(e)&&e.length>=2&&!Array.isArray(e[0])&&O.push({layer:t,original:e.map(({lat:e,lng:t})=>Ko.latLng(e,t)),reverse:!!n.arrow?.reverse,key:null})}let i=n.details&&!c?null:so(e,n,{popup:c,labelResolver:l});i&&t.bindPopup(i,co),f&&t.on(`click`,()=>f(e,Aa(n,e,l)))}}),v=Go({map:y,factory:Ko,group:u,cluster:a,points:i}),{surface:M,clustering:N,settings:P}=v;b.current=v.layers;let F=Io({factory:Ko,group:u,into:v.arrows,arrowOf:e=>w(e)?.arrow}),I=e=>{let{leaving:t,returning:n}=no(j,e);return v.move(t,!1,F),v.move(n,!0,F),n.length&&ro(j,F),t.length>0||n.length>0},L=e=>{m?.(io(r,e,e=>d.kindOf(e).key)),h?.(ao(j))};I(S.current);let R=null;N&&O.length&&(R=Lo({map:y,surface:M,lines:O,markerAt:D,decoratorOf:F,glide:P.glide}),k.push(R)),p?.(d.drawn()),T(),y.on(`zoomend`,T),N&&y.on(`moveend`,T);let z=ao(j);o&&z&&y.fitBounds(z,{padding:zr}),C.current=e=>{I(e)&&(R?.reroute(),T(),L(e))},L(S.current),_?.(r)}catch(e){if(n)return;console.error(`perun-atlas: feature set failed to render`,e),v?.(e)}})(),()=>{n=!0,C.current=null,k.forEach(e=>e()),y.off(`zoomend`,T),y.off(`moveend`,T),E()}},[y,e,JSON.stringify(t??{}),n]),null},Zo=`#e8590c`,Qo={className:`atlas-overlay`,color:Zo,weight:2.5,opacity:1,dashArray:`6 5`,fillColor:Zo,fillOpacity:.08},$o={className:`atlas-overlay atlas-overlay--point`,radius:5,color:Zo,weight:2.5,opacity:1,fillColor:`#ffffff`,fillOpacity:.85},es=e=>({key:Fa,label:e,kind:`line`,path:Qo,marker:null,arrow:null}),ts=e=>e==null||e===``||typeof e==`object`?null:String(e),ns=(e,t,n)=>{let r=e?.properties??{},i=ts(r.name),a=Object.entries(r).filter(([e])=>i===null||e!==`name`).map(([e,t])=>({field:e,label:n?.(e.toLowerCase())||e,value:ts(t)})).filter(e=>e.value!==null);return{title:i??t,rows:a,spec:{className:`atlas-panel__details--file`}}},rs=e=>`${Number((e/1048576).toFixed(1))} MB`,is=e=>new Intl.NumberFormat().format(e),as=(e,t={})=>V(e===1?t.fileFeature??`{count} feature`:t.fileFeatures??`{count} features`,{count:is(e)}),os=(e,t={})=>V(t.fileOpening??`Opening {name}…`,{name:e}),ss=(e,t={})=>V(t.fileAssumedDegrees??`{name} has no .prj, so its coordinates were read as longitude and latitude (WGS 84).`,{name:e}),cs={unreadable:[`fileUnreadable`,`{name} could not be read as GeoJSON, KML, GPX or a shapefile.`],empty:[`fileEmpty`,`{name} has nothing in it to draw.`],notDegrees:[`fileNotDegrees`,`{name} is not in longitude and latitude, so it cannot be placed on the map.`],tooLarge:[`fileTooLarge`,`{name} is {size}. Files up to {limit} can be opened.`],tooManyPoints:[`fileTooManyPoints`,`{name} has {count} points. Files with up to {limit} points can be opened.`],tooLargeUnzipped:[`fileTooLargeUnzipped`,`{name} is over {limit} once unzipped, and {limit} is the most that can be opened.`],noShapefile:[`fileNoShapefile`,`{name} holds no shapefile.`],shapefilePart:[`fileShapefilePart`,`{name} is one part of a shapefile and holds no shapes. Open the .zip holding all its parts, or its .shp.`],noPrj:[`fileNoPrj`,`{name} has no .prj, and its coordinates are not longitude and latitude, so nothing says where it belongs. Open it zipped with its .prj.`],unknownProjection:[`fileUnknownProjection`,`The projection in {name}'s .prj could not be read. Save it in WGS 84 (EPSG:4326) and open it again.`],noDatumShift:[`fileNoDatumShift`,`{name} is in {crs}, and its .prj does not say how to shift that to WGS 84, so it would land in the wrong place. Save it in WGS 84 (EPSG:4326) and open it again.`],readerUnavailable:[`fileReaderUnavailable`,`The shapefile reader could not be loaded, so {name} was not opened. Try again.`]},ls=(e,t,n={})=>{let[r,i]=cs[e?.refused]??cs.unreadable,a={name:t};return e?.refused===`tooLarge`&&(a.size=rs(e.size),a.limit=rs(e.limit)),e?.refused===`tooLargeUnzipped`&&(a.limit=rs(e.limit)),e?.refused===`tooManyPoints`&&(a.count=is(e.count),a.limit=is(e.limit)),e?.refused===`noDatumShift`&&(a.crs=e.crs||`a projection`),V(n[r]??i,a)};Q(`/*
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
`);var{factory:us}=f,{useEffect:ds,useRef:fs}=t.React,ps=`atlasFilePoints`,ms=620,hs=e=>(e.getPane(ps)||(e.createPane(ps).style.zIndex=String(ms)),ps),gs=({file:e,srid:t,hidden:n=!1,labelResolver:r,onFeatureClick:i,onDrawn:a,onError:o})=>{let s=X(),c=fs(null),l=fs(n);l.current=n;let u=fs({});u.current={labelResolver:r,onFeatureClick:i,onDrawn:a,onError:o};let d=fs(null);return ds(()=>{if(!e)return;let n;try{n=us.geoJSON(ee(e.collection,t,s),{crs:s.getCRS(),pointToLayer:(e,t)=>us.circleMarker(t,{...$o,pane:hs(s)}),style:e=>/Point$/.test(e?.geometry?.type??``)?$o:Qo,onEachFeature:(t,n)=>{n.on(`click`,()=>{let{labelResolver:n,onFeatureClick:r}=u.current;r?.(t,{...ns(t,e.name,n),file:e})})}})}catch(e){console.error(`perun-atlas: a file could not be drawn`,e),u.current.onError?.(e);return}if(c.current=n,l.current||n.addTo(s),d.current!==e){d.current=e;let t=n.getBounds();t.isValid()&&s.fitBounds(t,{padding:zr})}return u.current.onDrawn?.(),()=>{s.removeLayer(n),c.current=null}},[s,e,t]),ds(()=>{let e=c.current;e&&(n?s.removeLayer(e):s.hasLayer(e)||e.addTo(s))},[s,n]),null};Q(`/*
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
`);var{useEffect:_s,useRef:vs,useState:ys}=t.React,bs=({marker:e})=>{let n=vs(null);return _s(()=>{let t=n.current;t&&(Qa(t,e?.style),t.style.width=`12px`,t.style.height=`12px`)},[e]),t.React.createElement(`span`,{ref:n,className:[`atlas-legend__point`,e?.className].filter(Boolean).join(` `),"aria-hidden":`true`})};bs.propTypes={marker:t.PropTypes.object};var xs=({path:e,arrow:n})=>{let r=e?.color??`#4A5C66`,i=Array.isArray(e?.dashArray)?e.dashArray.join(` `):e?.dashArray,a=n?.reverse?`3,6 9,3 9,9`:`21,6 15,3 15,9`;return t.React.createElement(`svg`,{className:`atlas-legend__swatch`,width:`24`,height:`12`,viewBox:`0 0 24 12`,"aria-hidden":`true`},t.React.createElement(`line`,{className:e?.className,x1:`2`,y1:`6`,x2:`22`,y2:`6`,stroke:r,strokeWidth:Math.min(e?.weight??1,4),strokeDasharray:i||void 0,strokeOpacity:e?.opacity??1,strokeLinecap:`round`}),n&&t.React.createElement(`polygon`,{points:a,fill:r,fillOpacity:e?.opacity??1}))};xs.propTypes={path:t.PropTypes.object,arrow:t.PropTypes.object};var Ss=({path:e})=>t.React.createElement(`svg`,{className:`atlas-legend__swatch`,width:`24`,height:`12`,viewBox:`0 0 24 12`,"aria-hidden":`true`},t.React.createElement(`rect`,{x:`4`,y:`1`,width:`16`,height:`10`,fill:e?.fillColor??`#B8C6CC`,fillOpacity:e?.fillOpacity??.55,stroke:e?.color??`#4A5C66`,strokeWidth:Math.min(e?.weight??1,2),strokeOpacity:e?.opacity??1}));Ss.propTypes={path:t.PropTypes.object};var Cs=({entry:e})=>e.kind===`point`?t.React.createElement(bs,{marker:e.marker}):e.kind===`line`?t.React.createElement(xs,{path:e.path,arrow:e.arrow}):t.React.createElement(Ss,{path:e.path});Cs.propTypes={entry:t.PropTypes.object.isRequired};var ws=({entries:e=[],title:n,open:r=!0,hidden:i=[],onToggle:a,onShowAll:o,showAllLabel:s,className:c=``})=>{let[l,u]=ys(r);if(!Ma(e,i))return null;let d=n??`Legend`,f=e.some(e=>i.includes(e.key));return t.React.createElement(`div`,{className:`atlas-legend ${c}`.trim()},t.React.createElement(`button`,{type:`button`,className:`atlas-legend__toggle`,onClick:()=>u(!l),"aria-expanded":l},t.React.createElement(`span`,{className:`atlas-legend__title`},d),t.React.createElement(`span`,{className:`atlas-legend__chevron`,"aria-hidden":`true`},l?`−`:`+`)),l&&t.React.createElement(`ul`,{className:`atlas-legend__list`},e.map(e=>{let n=t.React.createElement(t.React.Fragment,null,t.React.createElement(Cs,{entry:e}),t.React.createElement(`span`,{className:`atlas-legend__label`},e.label));return t.React.createElement(`li`,{className:`atlas-legend__row`,key:e.key},a?t.React.createElement(`button`,{type:`button`,className:`atlas-legend__item`,"aria-pressed":!i.includes(e.key),onClick:()=>a(e.key)},n):n)})),l&&o&&f&&t.React.createElement(`button`,{type:`button`,className:`atlas-legend__reset`,onClick:o},s??`Show all`))};ws.propTypes={entries:t.PropTypes.array,title:t.PropTypes.string,open:t.PropTypes.bool,hidden:t.PropTypes.array,onToggle:t.PropTypes.func,onShowAll:t.PropTypes.func,showAllLabel:t.PropTypes.string,className:t.PropTypes.string};var Ts=({entries:e=[],title:n,open:r,hidden:i=[],onToggle:a,onShowAll:o,showAllLabel:s,position:c=`bottomleft`})=>{let l=Ma(e,i);return t.React.createElement(ii,{position:c,shown:l},t.React.createElement(`div`,{className:`atlas-legend__host`,ref:oi},t.React.createElement(ws,{entries:e,title:n,open:r,hidden:i,onToggle:a,onShowAll:o,showAllLabel:s})))};Ts.propTypes={entries:t.PropTypes.array,title:t.PropTypes.string,open:t.PropTypes.bool,hidden:t.PropTypes.array,onToggle:t.PropTypes.func,onShowAll:t.PropTypes.func,showAllLabel:t.PropTypes.string,position:t.PropTypes.string};var Es=({className:e=`atlas-panel__close`,label:n,title:r,onClick:i})=>t.React.createElement(`button`,{type:`button`,className:e,"aria-label":n,title:r,onClick:i},`×`),Ds=({timeScoped:e,longest:n,preset:r,applyPreset:i,onClose:a,labels:o={}})=>t.React.createElement(`div`,{className:`atlas-panel__empty`},t.React.createElement(`div`,{className:`atlas-panel__emptycard`},t.React.createElement(`div`,{className:`atlas-panel__emptytitle`},o.empty??(e?`Nothing in this range`:`Nothing to show`)),o.emptyHint&&t.React.createElement(`div`,{className:`atlas-panel__emptybody`},o.emptyHint),e&&n&&r!==n.months&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--primary`,onClick:()=>i(n.months)},[o.widen??`Try`,n.label].filter(Boolean).join(` `)),t.React.createElement(Es,{label:o.close??`Close`,title:o.close??`Close`,onClick:a}))),{Icon:Os}=t.elements,ks=[{offer:`geojson`,icon:`IconJson`,label:`exportGeoJSON`,fallback:`GeoJSON`,save:`saveGeoJSON`},{offer:`csv`,icon:`IconFileTypeCsv`,label:`exportCsv`,fallback:`CSV`,save:`saveCSV`},{offer:`kml`,icon:`IconWorld`,label:`exportKml`,fallback:`KML`,save:`saveKML`},{offer:`shp`,icon:`IconFileTypeZip`,label:`exportShp`,fallback:`Shapefile`,save:`saveShapefile`}],As=({exporter:e,labels:n={}})=>t.React.createElement(t.React.Fragment,null,ks.filter(({offer:t})=>e.offer[t]!==!1).map(({offer:r,icon:i,label:a,fallback:o,save:s})=>t.React.createElement(`button`,{key:r,type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:e[s]},t.React.createElement(Os,{name:i,size:16,stroke:1.75,"aria-hidden":`true`}),n[a]??o))),{Icon:js}=t.elements,Ms=({fileOverlay:e,labels:n={}})=>{let{offered:r,file:i,inputRef:a,choose:o,onPicked:s,close:c}=e;return t.React.createElement(t.React.Fragment,null,r&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:o},t.React.createElement(js,{name:`IconFolderOpen`,size:16,stroke:1.75,"aria-hidden":`true`}),n.openFile??`Open file`),r&&t.React.createElement(`input`,{ref:a,type:`file`,className:`atlas-panel__fileinput`,accept:`.geojson,.json,.kml,.gpx,.zip,.shp`,tabIndex:-1,"aria-hidden":`true`,onChange:s}),i&&t.React.createElement(`div`,{className:`atlas-panel__file`},t.React.createElement(xs,{path:Qo}),t.React.createElement(`span`,{className:`atlas-panel__filename`,title:i.name},i.name),t.React.createElement(`span`,{className:`atlas-panel__filecount`},as(i.count,n)),t.React.createElement(Es,{className:`atlas-panel__fileclose`,label:n.closeFile??`Close file`,title:n.closeFile??`Close file`,onClick:c})))},Ns=({fileOverlay:e,labels:n={}})=>{let{note:r,refusal:i,dismiss:a,dismissNote:o}=e;return t.React.createElement(t.React.Fragment,null,r&&t.React.createElement(`p`,{className:`atlas-panel__filenote`,role:`status`},t.React.createElement(`span`,null,r),t.React.createElement(Es,{className:`atlas-panel__fileclose`,label:n.close??`Close`,onClick:o})),i&&t.React.createElement(`p`,{className:`atlas-panel__filerefused`,role:`alert`},t.React.createElement(`span`,null,i),t.React.createElement(Es,{className:`atlas-panel__fileclose`,label:n.close??`Close`,onClick:a})))},{Icon:Ps}=t.elements,Fs=({viewLink:e,labels:n={}})=>t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:t=>e.copy(t.currentTarget)},t.React.createElement(Ps,{name:e.copied?`IconCheck`:`IconLink`,size:16,stroke:1.75,"aria-hidden":`true`}),e.copied?n.linkCopied??`Link copied`:n.copyLink??`Copy link`),Is=({saving:e,opening:n,labels:r={}})=>t.React.createElement(`div`,{className:`atlas-panel__loading`,role:`status`,"aria-live":`polite`},t.React.createElement(`div`,{className:`atlas-panel__loadingcard`},t.React.createElement(`div`,{className:`atlas-panel__spinner`,"aria-hidden":`true`}),t.React.createElement(`span`,null,e?r.saving??`Saving…`:n?os(n,r):r.loading??`Loading…`))),Ls=({timeScoped:e,range:n,initial:r,applyPreset:i,onClose:a,labels:o={}})=>t.React.createElement(`div`,{className:`atlas-panel__footer`},e&&t.React.createElement(`div`,{className:`atlas-panel__summary`},`${n.from} → ${n.to}`),t.React.createElement(`div`,{className:`atlas-panel__actions`},e&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:()=>i(r)},o.reset??`Reset range`),a&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--dark`,onClick:a},o.close??`Close`))),Rs=({record:e,onClose:n,labels:r={}})=>t.React.createElement(`aside`,{className:[`atlas-panel__details`,e.spec?.className].filter(Boolean).join(` `),style:e.spec?.style,"aria-label":r.details??`Details`},t.React.createElement(`div`,{className:`atlas-panel__detailshead`},t.React.createElement(`div`,{className:`atlas-panel__detailstitle`,style:e.spec?.titleStyle},e.title??r.details??`Details`),t.React.createElement(Es,{label:r.close??`Close`,onClick:n})),t.React.createElement(`dl`,{className:`atlas-panel__detailsbody`},e.rows.map(({field:n,label:r,value:i})=>t.React.createElement(`div`,{key:n,className:`atlas-panel__detailsrow`},t.React.createElement(`dt`,{style:e.spec?.labelStyle},r),t.React.createElement(`dd`,{style:e.spec?.valueStyle},i))))),zs=({range:e,onRangeChange:n,presets:r=[],preset:i,applyPreset:a,labels:o={}})=>t.React.createElement(t.React.Fragment,null,t.React.createElement(Co,{from:e.from,to:e.to,onChange:n,labels:{from:o.from,to:o.to,invalidRange:o.invalidRange}}),r.length>0&&t.React.createElement(`div`,{className:`atlas-panel__segmented`},r.map(({months:e,label:n})=>t.React.createElement(`button`,{key:e,type:`button`,"aria-pressed":i===e,onClick:()=>a(e)},n)))),{useEffect:Bs,useMemo:Vs,useState:Hs}=t.React,Us=({choropleth:e,bindings:t,bindingKey:n})=>{let r=!!e,[i,a]=Hs(null),o=r?e.status:null;return Bs(()=>{if(!o)return;let e=!1;return Ne(o,t).then(t=>{e||a(t)}),()=>{e=!0}},[o,n]),{coloured:r,statusPath:o,rows:i,tooltip:Vs(()=>{let t=e?.tooltip;if(!t)return;let n=pe(t);return e=>n(e?.properties)??null},[e])}},Ws=e=>e.toISOString().slice(0,10),Gs=()=>Ws(new Date),Ks=e=>{let t=new Date;return t.setMonth(t.getMonth()-e),Ws(t)},qs=e=>({from:Ks(e),to:Gs()}),Js=(e,t)=>e?.from===t?.from&&e?.to===t?.to,{useState:Ys}=t.React,Xs=({presets:e=[],defaultMonths:t,servicePath:n,opening:r,onMoved:i})=>{let a=t??e[e.length-1]?.months??12,[o,s]=Ys(r?null:a),[c,l]=Ys(()=>r??qs(a)),u=/\{(from|to)\}/.test(n??``),d=(e,t)=>{s(t),!Js(e,c)&&(l(e),i?.())};return{timeScoped:u,preset:o,range:c,applyPreset:e=>d(qs(e),e),onRangeChange:e=>d(e,null),longest:e[e.length-1],initial:a}},{useEffect:Zs,useMemo:Qs,useState:$s}=t.React,ec=(e,t)=>e?V(e,t??{}):null,tc=e=>({path:typeof e==`string`?e:null,inline:e&&typeof e==`object`?e:null}),nc=({form:e,bindings:t})=>{let{path:n,inline:r}=tc(e?.schema),i=tc(e?.uiSchema),a=ec(n,t),o=ec(i.path,t),[s,c]=$s(null),[l,u]=$s(null),[d,f]=$s(!!(n||i.path)),[p,m]=$s(!1);Zs(()=>{if(!n&&!i.path){c(null),u(null),f(!1);let t=!!e&&!r;t&&console.error("perun-atlas: draw.form needs `schema` -- either the schema itself, or the path to a service that answers with one. Got",e?.schema),m(t);return}let a=!1;return f(!0),m(!1),Promise.all([n?Ie(n,t):Promise.resolve(null),i.path?Le(i.path,t):Promise.resolve(null)]).then(([e,t])=>{a||(c(e),u(t),m(!!n&&!e),f(!1))}),()=>{a=!0}},[n,a,i.path,o,!!e,!!r]);let h=Qs(()=>Re(n?s:r,e?.pick),[s,r,n,e?.pick?.join(`\0`)??null]);return{schema:h,uiSchema:Qs(()=>U(i.path?l:i.inline,h)??void 0,[l,i.inline,i.path,h]),loading:d,failed:p}},{useMemo:rc}=t.React,ic={id:`{pkid}`,join:`,`},ac=({set:e,shape:t,dataSrid:n,select:r,map:i})=>{let a=r===!0?ic:r?{...ic,...r}:null,{mode:o,id:s,join:c}=a??{},l=!!a&&a.export!==!1;return rc(()=>{if(!a)return{selecting:!1,feedsExport:!1,count:0,total:0,inside:[],radius:null,has:()=>!1,metres:()=>null,context:null};let r=Ke(e,t,{srid:n,mode:o,map:i});return{selecting:!0,feedsExport:l,count:r.inside.length,total:r.total,inside:r.inside,radius:t?.radius??null,has:r.has,metres:r.metres,context:{count:r.inside.length,total:r.total,ids:qe(r.inside,{id:s,join:c}),geojson:{type:`FeatureCollection`,features:r.inside}}}},[e,t,n,i,o,s,c,l,!!a])},{useMemo:oc,useState:sc}=t.React,{alertUserResponse:cc}=t.elements,lc=(e,t)=>e?.type?void 0:t?`success`:`error`,uc=({draw:e,dataSrid:n,set:r,bindings:i,labels:a={},map:o})=>{let s=!!(e?.save?.onSave||e?.select),[c,l]=sc(!1),[u,d]=sc(null),[f,p]=sc(``),[m,h]=sc(!1),[g,_]=sc(0),[v,y]=sc(()=>e?.form?.data??{}),b=nc({form:e?.form,bindings:i}),x=oc(()=>b.schema?t.validator.validateFormData(ze(v,b.schema),b.schema)?.errors??[]:[],[v,b.schema]),S=ac({set:r,shape:u,dataSrid:n,select:e?.select,map:o}),C=()=>{l(!1),d(null),p(``),y(e?.form?.data??{})};return{drawable:s,drawing:c,shape:u,selection:S,note:f,form:e?.form?{schema:b.schema,uiSchema:b.uiSchema,data:v,errors:x,onChange:y,loading:b.loading,failed:b.failed}:void 0,saving:m,reload:g,setShape:d,setNote:p,startDrawing:()=>l(!0),finishDrawing:()=>l(!1),clearDrawing:C,saveShape:async()=>{if(!u||m)return;if(e.form&&!b.schema){console.error(`perun-atlas: nothing sent -- this row configures a form and its fields are not loaded.`);return}if(x.length){cc({type:`error`,response:a.saveIncomplete??`Some of these fields are mandatory and are empty. Nothing was sent.`}),console.error(`perun-atlas: nothing sent -- the form is not answerable as it stands:`,x.map(e=>`${e.property??``} ${e.message??``}`.trim()).join(`; `));return}let{context:t,units:r,tooSmall:s}=rt(u,{draw:e,dataSrid:n,bindings:i,note:f,selected:S.context,form:v,map:o});if(s){cc({type:`error`,response:a.saveTooSmall??`This deployment stores geometry in EPSG:${n??`?`}, where ${Math.round(u.radius)} m is less than one unit. Nothing was sent.`}),console.error(`perun-atlas: a radius of ${Math.round(u.radius)} m is ${r} units in EPSG:${n}, which rounds to zero. A projection measured in degrees cannot carry an integer radius: send {draw.metres} for the size and {draw.ring} for the shape instead.`),console.error(`perun-atlas: the configured path is`,e.save.onSave);return}h(!0);let c=await nt(e.save.onSave,t,{body:e.save.body===void 0?void 0:tt(e.save.body,t),contentType:e.save.contentType,encoding:e.save.encoding,failure:e.save.failure});h(!1),c.ok&&(C(),_(e=>e+1)),cc({response:c.data||c.message,type:lc(c.data,c.ok)})}}},dc=(()=>{let e=new Uint32Array(256);for(let t=0;t<256;t+=1){let n=t;for(let e=0;e<8;e+=1)n=n&1?3988292384^n>>>1:n>>>1;e[t]=n>>>0}return e})(),fc=e=>{let t=4294967295;for(let n=0;n<e.length;n+=1)t=dc[(t^e[n])&255]^t>>>8;return(t^4294967295)>>>0},pc=async e=>{if(typeof CompressionStream>`u`)return null;let t;try{t=new CompressionStream(`deflate-raw`)}catch{return null}return new Uint8Array(await new Response(new Blob([e]).stream().pipeThrough(t)).arrayBuffer())},mc=e=>e.getHours()<<11|e.getMinutes()<<5|e.getSeconds()>>1,hc=e=>Math.max(e.getFullYear()-1980,0)<<9|e.getMonth()+1<<5|e.getDate(),gc=2048,_c=0,vc=8,yc=async(e,{now:t=new Date,compress:n=!0}={})=>{let r=new TextEncoder,i=mc(t),a=hc(t),o=[];for(let{name:t,bytes:i}of e){let e=n?await pc(i):null,a=e&&e.length<i.length?e:i;o.push({name:r.encode(t),method:a===i?_c:vc,crc:fc(i),size:i.length,packed:a})}let s=o.reduce((e,t)=>e+30+t.name.length+t.packed.length+46+t.name.length,22),c=new Uint8Array(s),l=new DataView(c.buffer),u=0,d=e=>{l.setUint16(u,e,!0),u+=2},f=e=>{l.setUint32(u,e,!0),u+=4},p=e=>{c.set(e,u),u+=e.length},m=e=>{d(20),d(gc),d(e.method),d(i),d(a),f(e.crc),f(e.packed.length),f(e.size),d(e.name.length),d(0)};o.forEach(e=>{e.offset=u,f(67324752),m(e),p(e.name),p(e.packed)});let h=u;o.forEach(e=>{f(33639248),d(20),m(e),d(0),d(0),d(0),f(0),f(e.offset),p(e.name)});let g=u-h;return f(101010256),d(0),d(0),d(o.length),d(o.length),f(g),f(h),d(0),c},bc=({set:e,selection:t,exportable:n,labelResolver:r,timeScoped:i,range:a,srid:o,map:s,drawnWith:c})=>{let l=n===!1?null:n&&n!==!0?n:{},u=!!(t?.selecting&&t.feedsExport&&t.count>0),d=u?{type:`FeatureCollection`,features:t.inside}:e,f=l&&d&&(d.features?.length??0)>0,p=[l?.filename??`features`,u?`within-${Math.round(t.radius??0)||`shape`}`:null,i?`${a.from}_${a.to}`:Gs()].filter(Boolean).join(`-`),m=()=>z(d,o,s),h=e=>{let t=l?.name?B(e?.properties,l.name):null;return t==null||t===``?Oa(c?.(e),e):String(t)},g={fields:l?.fields,exclude:l?.exclude,labelResolver:r};return{offer:l,canExport:f,saveGeoJSON:()=>eo(`${p}.geojson`,at(m()),`application/geo+json`),saveCSV:()=>eo(`${p}.csv`,pt(m(),g),`text/csv;charset=utf-8`),saveKML:()=>eo(`${p}.kml`,xt(m(),{...g,nameOf:h}),`application/vnd.google-earth.kml+xml`),saveShapefile:async()=>eo(`${p}.zip`,await yc(rn(m(),{...g,stem:p})),`application/zip`)}},xc={shp:`shp.perun-atlas.js?v=f8a962935bdb`},Sc=typeof document>`u`?null:document.currentScript?.src||null,Cc=()=>Sc??(typeof document>`u`?null:Array.from(document.scripts).find(e=>/\/perun-atlas\.js(\?|$)/.test(e.src))?.src??null),wc=(e,t,n=xc)=>t&&n[e]?new URL(n[e],t).href:null,Tc=new Map,Ec=(e,{base:t=Cc(),files:n=xc,load:r=e=>import(e)}={})=>{if(!Tc.has(e)){let i=wc(e,t,n),a=i?r(i):Promise.reject(Error(`perun-atlas: cannot tell where the ${e} module is. It is loaded from beside perun-atlas.js, and that script could not be found.`));a.catch(()=>Tc.delete(e)),Tc.set(e,a)}return Tc.get(e)},{useRef:Dc,useState:Oc}=t.React,kc=()=>new Promise(e=>{requestAnimationFrame(()=>setTimeout(e,0))}),Ac=async e=>{let t=await e.arrayBuffer(),n=Er(t,e.name);if(n===`text`)return Or(new TextDecoder().decode(t));if(n===`part`)return{refused:`shapefilePart`};let r;try{r=await Ec(`shp`)}catch(e){return console.warn(`perun-atlas: the shapefile reader could not be loaded`,e),{refused:`readerUnavailable`}}return Ar(await r.readShapefile(t,{kind:n,limit:fr.bytes}))},jc=({overlay:e,labels:t,onChange:n})=>{let r=e!==!1,[i,a]=Oc(null),[o,s]=Oc(null),[c,l]=Oc(null),[u,d]=Oc(null),f=Dc(null),p=Dc(0),m=()=>f.current?.click(),h=async e=>{let r=++p.current,i=pr(e.size);if(!i){if(d(e.name),await kc(),r!==p.current)return;try{i=await Ac(e)}catch(e){console.warn(`perun-atlas: a file could not be read`,e),i={refused:`unreadable`}}}if(r===p.current){if(i.refused){d(null),s(ls(i,e.name,t));return}s(null),l(i.assumed?ss(e.name,t):null),a({name:e.name,collection:i.collection,count:i.collection.features.length}),n?.()}},g=e=>{let t=e.target.files?.[0];e.target.value=``,t&&h(t)},_=()=>{p.current+=1,d(null),l(null),a(null),n?.()};return{offered:r,file:i,refusal:o,note:c,opening:u,inputRef:f,choose:m,onPicked:g,close:_,drawn:()=>d(null),failed:()=>{i&&(s(ls({refused:`unreadable`},i.name,t)),_())},dismiss:()=>s(null),dismissNote:()=>l(null)}},{useState:Mc}=t.React,Nc=({coloured:e})=>{let[t,n]=Mc(null),[r,i]=Mc(!0),a=e?{values:[],usedFallback:!1}:[],[o,s]=Mc(a),[c,l]=Mc(null),u=t===null?null:c??t,[d,f]=Mc(null);return{set:t,visible:u,loading:r,drawn:o,extent:d,setDrawn:s,setShown:l,setExtent:f,onFetchStart:()=>{i(!0),s(a)},onFetched:e=>{n(e??{features:[]}),i(!1)},onFetchFailed:()=>{n({features:[]}),l(null),f(null),i(!1)},forget:()=>n(null)}},{useEffect:Pc,useState:Fc}=t.React,Ic=({subject:e,drawing:t})=>{let[n,r]=Fc(null),i=t=>be(t,e?.id,e?.match);return Pc(()=>{if(!n)return;let e=e=>{e.key===`Escape`&&r(null)};return document.addEventListener(`keydown`,e),()=>document.removeEventListener(`keydown`,e)},[n]),{record:n,openRecord:(e,n)=>{t||n&&r(n)},closeRecord:()=>r(null),isSubject:i,descriptorFor:t=>e?.descriptor&&i(t)?e.descriptor:null,isPinnedFeature:e=>i(e)}},Lc=[`map`,`at`,`base`,`from`,`to`],Rc=/^\d{4}-\d{2}-\d{2}$/,zc=e=>{let t=Math.max(e.indexOf(`#`),0),n=e.indexOf(`?`,t);return n===-1?{head:e,query:``}:{head:e.slice(0,n),query:e.slice(n+1)}},Bc=e=>Rc.test(e??``)&&new Date(`${e}T00:00:00Z`).toISOString().slice(0,10)===e,Vc=(e,t)=>String(Number(e.toFixed(t))),Hc=e=>((e+180)%360+360)%360-180,Uc=(e,t)=>{if(t==null||t===``)return null;let n=new URLSearchParams(zc(e).query);if(n.get(`map`)!==String(t))return null;let r={},i=(n.get(`at`)??``).split(`,`);if(i.length===3&&i.every(e=>e.trim()!==``)){let[e,t,n]=i.map(Number);Math.abs(e)<=90&&Math.abs(t)<=180&&n>=0&&n<=30&&(r.center=[e,t],r.zoom=n)}let a=n.get(`base`);a&&(r.basemap=a);let o=n.get(`from`),s=n.get(`to`);return Bc(o)&&Bc(s)&&o<=s&&(r.from=o,r.to=s),r},Wc=(e,t,{center:n,zoom:r,basemap:i,from:a,to:o}={})=>{let{head:s,query:c}=zc(e),l=new URLSearchParams(c);return Lc.forEach(e=>l.delete(e)),l.set(`map`,String(t)),n&&Number.isFinite(r)&&l.set(`at`,[Vc(n[0],6),Vc(Hc(n[1]),6),Vc(r,2)].join(`,`)),i&&l.set(`base`,i),a&&o&&(l.set(`from`,a),l.set(`to`,o)),`${s}?${l.toString().replace(/%2C/gi,`,`)}`},Gc=new Set,Kc=(e,t)=>{if(Gc.has(e))return null;let n=Uc(e,t);return n&&Gc.add(e),n},{useEffect:qc,useRef:Jc,useState:Yc}=t.React,Xc=2e3,Zc=({linkId:e,link:t,timeScoped:n,range:r,labels:i={}})=>{let a=e!=null&&e!==``&&t!==!1,o=Jc(null),[s,c]=Yc(!1);return qc(()=>{if(!s)return;let e=setTimeout(()=>c(!1),Xc);return()=>clearTimeout(e)},[s]),{offered:a,copied:s,attach:({map:e,basemap:t})=>{o.current={map:e,basemap:t}},copy:async t=>{let{map:a,basemap:s}=o.current??{};if(!a)return;let l=a.getCenter(),u=Wc(window.location.href,e,{center:[l.lat,l.lng],zoom:a.getZoom(),basemap:Me(s,a),...n&&{from:r.from,to:r.to}});await to(u,t?.parentNode??void 0)?c(!0):window.prompt(i.copyLinkPrompt??`Copy this link:`,u)}}};Q(`/*
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
`);var{useEffect:Qc,useMemo:$c,useState:el}=t.React,tl=({session:e,servicePath:n,context:r,descriptors:i,labelResolver:a,cluster:o,subject:s,presets:c=[],defaultMonths:l,labels:u={},map:d,exportable:f,overlay:p,legend:m=!0,notice:h=!0,tokens:g,title:_,choropleth:v,draw:y,view:b,linkId:x,link:S,className:C=``,onClose:w})=>{let[T,E]=el(!0),[D,O]=el(!!b?.center),k=()=>{D&&O(!1)},[A,j]=el(null),[M,N]=el(void 0),{timeScoped:P,preset:F,range:I,initial:L,longest:R,applyPreset:z,onRangeChange:ee}=Xs({presets:c,defaultMonths:l,servicePath:n,opening:b?.from&&b?.to?{from:b.from,to:b.to}:void 0,onMoved:()=>{ge(),Be()}}),te=$c(()=>({...r||{},...P&&{from:I.from,to:I.to},...A&&{srid:A}}),[r,P,I.from,I.to,A]),ne=JSON.stringify(te),{coloured:re,statusPath:ie,rows:ae,tooltip:oe}=Us({choropleth:v,bindings:te,bindingKey:ne}),{set:se,visible:ce,loading:le,drawn:ue,extent:de,setDrawn:fe,setShown:B,setExtent:pe,onFetchStart:V,onFetched:me,onFetchFailed:he,forget:ge}=Nc({coloured:re}),[_e,ye]=el([]),be=e=>ye(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e]),xe=()=>ye([]),[Se,Ce]=el(null),{drawable:we,drawing:Te,shape:Ee,selection:De,note:Oe,form:ke,saving:Ae,reload:je,setShape:Me,setNote:Ne,startDrawing:Pe,finishDrawing:Fe,clearDrawing:Ie,saveShape:Le}=uc({draw:y,dataSrid:A,set:ce,bindings:te,labels:u,map:M}),{record:Re,openRecord:ze,closeRecord:Be,descriptorFor:Ve,isPinnedFeature:He}=Ic({subject:s,drawing:Te}),H=jc({overlay:p,labels:u,onChange:()=>ye(e=>e.filter(e=>e!==Fa))}),{file:U}=H;Qc(()=>{Re?.file&&Re.file!==U&&Be()},[U]);let Ue=bc({set:ce,selection:De,exportable:f,labelResolver:a,timeScoped:P,range:I,srid:A,map:M,drawnWith:e=>re?i?.[v.descriptor]:Ta(i?.[Ve(e)??ve(e)],e)}),We=Zc({linkId:x,link:S,timeScoped:P,range:I,labels:u}),Ge=!le&&se!==null&&(se.features?.length??0)===0&&h!==!1&&!Te&&!Ee&&!U&&Se!==ne;return t.React.createElement(`div`,{className:`atlas-panel ${C}${T?``:` atlas-panel--nolabels`}`.trim(),style:g},t.React.createElement(`header`,{className:`atlas-panel__header`},t.React.createElement(`div`,{className:`atlas-panel__title`},_),w&&t.React.createElement(Es,{label:u.close??`Close`,onClick:w})),t.React.createElement(`div`,{className:`atlas-panel__toolbar`},P&&t.React.createElement(zs,{range:I,onRangeChange:ee,presets:c,preset:F,applyPreset:z,labels:u}),!re&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__switch`,"aria-pressed":T,onClick:()=>E(!T)},t.React.createElement(`span`,{className:`atlas-panel__track`},t.React.createElement(`span`,{className:`atlas-panel__knob`})),u.labels??`Labels`),(we||Ue.canExport||H.offered||We.offered)&&t.React.createElement(`div`,{className:`atlas-panel__actions`},we&&t.React.createElement(Eo,{drawing:Te,busy:Ae,labels:u,onStart:Pe,onCancel:Ie}),Ue.canExport&&t.React.createElement(As,{exporter:Ue,labels:u}),t.React.createElement(Ms,{fileOverlay:H,labels:u}),We.offered&&t.React.createElement(Fs,{viewLink:We,labels:u})),t.React.createElement(Ns,{fileOverlay:H,labels:u}),we&&(Te||Ee)&&t.React.createElement(Ao,{shape:Ee,drawing:Te,busy:Ae,limits:y.radius,caught:De.selecting?{count:De.count,total:De.total}:void 0,savable:!!y.save?.onSave,note:y.note?{value:Oe,onChange:Ne,required:y.note.required}:void 0,form:ke,labels:u,onCancel:Ie,onRadius:e=>Me(t=>t&&{...t,radius:e}),onSave:Le})),t.React.createElement(`div`,{className:`atlas-panel__body`},t.React.createElement(`div`,{className:`atlas-panel__mapwrap`},t.React.createElement(`div`,{className:`atlas-panel__map`},t.React.createElement(xa,{session:e,layerSwitcher:!0,...d,extent:de,view:b,onReady:e=>{N(e.map),j(e.config?.dataSrid??null),We.attach(e)}},re?(ae!==null||!ie)&&t.React.createElement(mo,{servicePath:n,context:te,srid:A,reload:je,statusRows:ae,join:v.join,field:v.field,palette:v.palette,fallback:v.fallback,descriptor:i?.[v.descriptor],labelResolver:a,tooltip:oe,hidden:_e,onFeatureClick:ze,onLegend:fe,onShown:B,onLoadStart:V,onLoad:me,onError:he}):t.React.createElement(Xo,{servicePath:n,context:te,reload:je,descriptors:i,descriptorFor:Ve,labelResolver:a,cluster:o,pinned:He,hidden:_e,fit:!D,onFeatureClick:ze,onLegend:fe,onShown:B,onExtent:pe,onLoadStart:V,onLoad:e=>{k(),me(e)},onError:e=>{k(),he(e)}}),U&&t.React.createElement(gs,{file:U,srid:A,hidden:_e.includes(Fa),labelResolver:a,onFeatureClick:ze,onDrawn:H.drawn,onError:H.failed}),we&&t.React.createElement(xo,{value:Ee,drawing:Te,style:y.style,onChange:Me,onDrawn:Fe}),m!==!1&&t.React.createElement(Ts,{entries:[...re?Ha({palette:v.palette,fallback:v.fallback??Ua.__unknown,unknownLabel:v.unknownLabel,...ue},a):Va(ue,a),...U?[es(U.name)]:[]],title:u.legend,hidden:_e,onToggle:be,onShowAll:xe,showAllLabel:u.showAll,position:typeof m==`string`?m:void 0}))),(le||Ae||H.opening)&&t.React.createElement(Is,{saving:Ae,opening:H.opening,labels:u}),Ge&&t.React.createElement(Ds,{timeScoped:P,longest:R,preset:F,applyPreset:z,labels:u,onClose:()=>Ce(ne)})),Re&&t.React.createElement(Rs,{record:Re,labels:u,onClose:Be})),(P||w)&&t.React.createElement(Ls,{timeScoped:P,range:I,initial:L,applyPreset:z,labels:u,onClose:w}))};Q(`/*
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
`);var{factory:nl}=f,{useEffect:rl,useRef:il}=t.React,al=`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 26 36">
  <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 23 13 23s13-13.25 13-23C26 5.82 20.18 0 13 0z"
        fill="currentColor" stroke="#ffffff" stroke-width="1.75"/>
  <circle cx="13" cy="13" r="4" fill="#ffffff"/>
</svg>`,ol=({value:e,onChange:t,draggable:n=!0,className:r=`atlas-pin`,html:i=al,size:a=[20,28],anchor:o=[10,28]})=>{let s=X(),c=il(null),l=il(t);return l.current=t,rl(()=>{let e=e=>l.current?.({lat:e.latlng.lat,lng:e.latlng.lng});return s.on(`click`,e),()=>{s.off(`click`,e),c.current&&(s.removeLayer(c.current),c.current=null)}},[s]),rl(()=>{if(!e){c.current&&(s.removeLayer(c.current),c.current=null);return}if(c.current){c.current.setLatLng(e);return}let t=nl.marker(e,{icon:nl.divIcon({className:r,html:i,iconSize:a,iconAnchor:o}),draggable:n}).addTo(s);t.on(`drag`,e=>l.current?.({...e.target.getLatLng()})),c.current=t},[s,e?.lat,e?.lng]),null},{labelsManager:sl}=t.utils,{useMemo:cl,useState:ll}=t.React,ul=(e,n)=>{let{objConfig:r,objectId:i,session:a,labelDomain:o=`main`,title:s,className:c,linkId:l,onClose:u}=e,[d]=ll(()=>Kc(window.location.href,l)),f=e=>{if(!e)return;let t=sl(e,n,o);return!t||t===`perun.${o}.${e}`?void 0:t},p=cl(()=>({session:a,objectId:i,...r?.context||{}}),[a,i,r]),m=cl(()=>(r?.presets||[]).map(({months:e,label:t})=>({months:e,label:f(t)??`${e}`})),[r]),h=cl(()=>Object.fromEntries(Object.entries(r?.labels||{}).map(([e,t])=>[e,f(t)])),[r]),g=r?.service;return g?t.React.createElement(tl,{session:a,servicePath:g,context:p,descriptors:r?.descriptors||{},labelResolver:f,cluster:r?.cluster,subject:r?.subject?{...r.subject,id:i}:void 0,title:s??f(r?.title),presets:m,defaultMonths:r?.defaultMonths,map:r?.map,choropleth:r?.choropleth,draw:r?.draw,exportable:r?.export,overlay:r?.overlay,legend:r?.legend,notice:r?.notice,tokens:r?.tokens,labels:h,view:d??void 0,linkId:l,link:r?.link,className:c,onClose:u}):t.React.createElement(`div`,{className:`atlas-panel-unavailable`},f(`map_service_missing`)??`This button has no map service configured.`)};ul.contextTypes={intl:t.PropTypes.object.isRequired};var dl=(0,t.connect)((e,t)=>({session:t.session??e?.security?.svSession}))(ul),fl=a,pl=o;e.AtlasMap=xa,e.Choropleth=mo,e.CirclePicker=xo,e.ConfiguredMap=dl,e.DateRange=Co,e.DrawBar=Ao,e.DrawTool=Eo,e.FeaturePanel=tl,e.FeatureSet=Xo,e.Legend=ws,e.LegendControl=Ts,e.PointPicker=ol,e.ZoomRail=da,Object.defineProperty(e,"config",{enumerable:!0,get:function(){return l}}),e.name=fl,e.version=pl});