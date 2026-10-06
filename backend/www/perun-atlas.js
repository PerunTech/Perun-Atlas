(function(e,t){typeof exports==`object`&&typeof module<`u`?t(exports,require("perun-core"),require("spatial")):typeof define==`function`&&define.amd?define([`exports`,`perun-core`,`spatial`],t):(e=typeof globalThis<`u`?globalThis:e||self,t(e[`perun-atlas`]={},e[`perun-core`],e.spatial))})(this,function(e,t,n){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});var r=Object.defineProperty,i=(e,t)=>{let n={};for(var i in e)r(n,i,{get:e[i],enumerable:!0});return t||r(n,Symbol.toStringTag,{value:`Module`}),n},a=`perun-atlas`,o=`1.0.0-rc.1`,s=[`DESCRIPTOR`,`pkid`,`parent_id`,`type`,`status`],c={weight:1,opacity:1,color:`#4A5C66`,fillOpacity:.55,fillColor:`#B8C6CC`},l=(e={},t={})=>({...c,...e.style,...t}),u=(e,t)=>e||t?{...e,...t}:void 0,d=(e,t)=>{let n=e?.variants;if(!n?.by)return e;let r=n.cases?.[t?.properties?.[n.by]];return r?{...e,...r,style:u(e.style,r.style),marker:u(e.marker,r.marker),label:u(e.label,r.label),popup:u(e.popup,r.popup),arrow:u(e.arrow,r.arrow)}:e},f=(e,t)=>{let n=e?.label?.scale;if(!n)return!1;let{min:r=0,max:i=24}=n;return t>=r&&t<=i},p=(e,t)=>{let n=e?.label?.field;if(!n)return null;let r=t?.properties?.[n];return r==null?null:String(r)},m=(e,t)=>{let n=e=>{let n=e?t?.properties?.[e]:void 0;return n==null||n===``?null:String(n)};return n(e?.label?.field)??n(e?.popup?.title)??n(e?.details?.title)},h=(e,t,n)=>{let r=e?.popup;if(!r)return null;let i=e=>{let n=t?.properties?.[e];return n==null||n===``?null:String(n)},a=r.title?i(r.title):null,o=(r.fields??[]).map(({label:e,field:t})=>({label:e&&n?.(e)||e||t,value:i(t)})).filter(e=>e.value!==null);return a===null&&o.length===0?null:{title:a,rows:o}},g=(e,t,n)=>{let r=e?.details;if(!r)return null;let i=t?.properties??{},a=new Set([...s,...r.exclude??[]]),o=e=>e==null||e===``?null:String(e),c=r.title?o(i[r.title]):null,l=Object.entries(i).filter(([e,t])=>!a.has(e)&&e!==r.title&&(typeof t!=`object`||!t)).map(([e,t])=>({field:e,label:n?.(e.toLowerCase())||e,value:o(t)})).filter(e=>e.value!==null);return c===null&&l.length===0?null:{title:c,rows:l,spec:r}},_=(e,t)=>{let n=e;for(let e=0;e<t.length;e+=1){if(n==null)return n;let r=t.length-e===1?t[e]:t.slice(e).join(`.`);if(Object.prototype.hasOwnProperty.call(Object(n),r))return n[r];n=n[t[e]]}return n},v=(e,t)=>_(e,String(t).split(`.`)),y=e=>{let t=String(e).split(`.`);return e=>_(e,t)},b=(e,t)=>e.replace(/\{([^}]+)\}/g,(e,n)=>{let r=v(t,n);return r==null?e:String(r)}),x=`::`,S=(e=[],t=[])=>e.length>=2||e.some(e=>t.includes(e.key)),C=(e,t)=>`${e??``}${x}${t??``}`,w=`${x}fallback`,ee=`${x}file`,T=(e,t,n)=>{let r=t?.variants?.by,i=r?n?.properties?.[r]:void 0,a=i!==void 0&&t?.variants?.cases?.[i]?i:void 0;return{name:e,value:a,key:C(e,a)}},E=({descriptors:e,nameOf:t})=>{let n=new WeakMap,r=r=>{if(n.has(r))return n.get(r);let i=d(e[t(r)],r);return n.set(r,i),i},i=n=>{let r=t(n);return T(r,e[r],n)},a=new Map;return{entryFor:r,kindOf:i,note:e=>{let{name:t,value:n,key:o}=i(e);return a.has(o)||a.set(o,{name:t,value:n,descriptor:r(e),geometry:e?.geometry?.type}),o},drawn:()=>[...a.values()]}},D=(e=``)=>/Point$/.test(e)?`point`:/LineString$/.test(e)?`line`:`area`,O=({name:e,value:t,descriptor:n},r)=>{let i=n?.legend;if(i){let e=r?.(i);if(e)return e}let a=t??e;return a==null||a===``?``:r?.(String(a).toLowerCase())||String(a)},k=(e,t)=>{let n=D(e.geometry),r=e.descriptor??{};return{key:C(e.name,e.value),label:O(e,t),kind:n,path:l(r),marker:n===`point`?r.marker??{}:null,arrow:n===`line`?r.arrow??null:null}},te=(e=[],t)=>e.map(e=>k(e,t)).filter(e=>e.label!==``),A=({palette:e={},values:t=[],fallback:n,usedFallback:r=!1,unknownLabel:i=`unknown`}={},a)=>{let o=e=>({...c,color:e,fillColor:e,fillOpacity:.7}),s=t.filter(t=>Object.prototype.hasOwnProperty.call(Object(e),t)&&e[t]).map(t=>({key:String(t),label:a?.(String(t).toLowerCase())||String(t),kind:`area`,path:o(e[t]),marker:null,arrow:null}));return!r||!n?s:[...s,{key:w,label:a?.(i)||`Not classified`,kind:`area`,path:o(n),marker:null,arrow:null}]},j={__unknown:`#B8C6CC`},M=(e,t)=>Object.prototype.hasOwnProperty.call(Object(e),t)&&!!e[t],N=({field:e,palette:t=j,fallback:n=j.__unknown})=>{let r=new Set,i=y(e),a=e=>i(e?.properties);return i=>{let o=a(i);return o==null?n:M(t,o)?t[o]:(r.has(o)||(r.add(o),console.warn(`perun-atlas: no palette entry for ${e}="${o}"`)),n)}},ne=(e=[],{field:t,palette:n=j}={})=>{let r=y(t),i=e=>r(e?.properties),a=new Set,o=[],s=!1;return e.forEach(e=>{let t=i(e);if(t==null){s=!0;return}M(n,t)||(s=!0),!a.has(t)&&(a.add(t),o.push(t))}),{values:o,usedFallback:s}},re=({field:e,palette:t=j}={})=>{let n=y(e);return e=>{let r=n(e?.properties);return r!=null&&M(t,r)?String(r):w}},ie=(e,t,{featureKey:n,rowKey:r,as:i=`status`})=>{let a=y(r),o=y(n),s=new Map((t??[]).map(e=>[String(a(e)),e]));return{...e,features:(e?.features??[]).map(e=>{let t=s.get(String(o(e?.properties)));return t?{...e,properties:{...e.properties,[i]:t}}:e})}},P=i({BASE_STYLE:()=>c,DEFAULT_PALETTE:()=>j,categoriesDrawn:()=>ne,colourBy:()=>N,detailsFor:()=>g,joinStatus:()=>ie,labelFor:()=>p,labelVisible:()=>f,legendFrom:()=>te,legendFromPalette:()=>A,nameFor:()=>m,pathOptions:()=>l,popupFor:()=>h,variantOf:()=>d}),F={crs:{type:`crs`,param:`SPATIAL_CRS`,legacy:`sysCrs`,required:!0,doc:`EPSG code, or { code, def } for a proj4 definition.`},center:{type:`latlng`,param:`SPATIAL_CENTER`,legacy:`sysCenter`,required:!0,doc:`Initial map centre as { lat, lng }.`},bounds:{type:`bounds`,param:`SPATIAL_BOUNDS`,legacy:`sysBounds`,doc:`Spatial limits as [ {lat,lng} southwest, {lat,lng} northeast ].`},zoom:{type:`int`,param:`SPATIAL_ZOOM`,default:8},minZoom:{type:`int`,param:`SPATIAL_MIN_ZOOM`,default:0},maxZoom:{type:`int`,param:`SPATIAL_MAX_ZOOM`,default:18},bboxOrder:{type:`bool`,param:`SPATIAL_SWITCH_BBOX_ORDER`,legacy:`switchBboxOrder`,default:!1,doc:`Reverse WMS bounding box axis order.`},units:{type:`enum`,param:`SPATIAL_MEASUREMENT_SYSTEM`,legacy:`measurementSystem`,values:[`metric`,`imperial`],default:`metric`},attribution:{type:`string`,param:`SPATIAL_ATTRIBUTION`,default:``},dataSrid:{type:`srid`,param:`sys.gis.default_srid`,default:`4326`,doc:`EPSG code the database stores geometry in, without the prefix.`}},I=Object.keys(F).filter(e=>F[e].required),ae=i({REQUIRED:()=>I,SCHEMA:()=>F}),oe=(e,t,n)=>{throw TypeError(`perun-atlas: cannot read "${e}" as ${n} (got ${JSON.stringify(t)})`)},se=e=>{if(typeof e!=`string`)return e;let t=e.trim();if(!t.startsWith(`{`)&&!t.startsWith(`[`))return e;try{return JSON.parse(t)}catch{return e}},ce=(e,t)=>{let n=se(t);if(n&&typeof n==`object`&&`lat`in n&&`lng`in n)return{lat:Number(n.lat),lng:Number(n.lng)};if(typeof n==`string`&&n.includes(`,`)){let[e,t]=n.split(`,`).map(Number);if(Number.isFinite(e)&&Number.isFinite(t))return{lat:e,lng:t}}return oe(e,t,`a { lat, lng } pair`)},le={string:(e,t)=>String(t),int:(e,t)=>{let n=Number(t);return Number.isInteger(n)?n:oe(e,t,`an integer`)},bool:(e,t)=>{if(typeof t==`boolean`)return t;let n=String(t).trim().toLowerCase();return[`true`,`1`,`yes`].includes(n)?!0:![`false`,`0`,`no`].includes(n)&&oe(e,t,`a boolean`)},enum:(e,t,n)=>n.values.includes(t)?t:oe(e,t,`one of ${n.values.join(`, `)}`),latlng:ce,bounds:(e,t)=>{let n=se(t);return Array.isArray(n)&&n.length===2?[ce(e,n[0]),ce(e,n[1])]:oe(e,t,`a [southwest, northeast] pair`)},srid:(e,t)=>{let n=String(t).trim().replace(/^EPSG:/i,``);return/^\d{4,6}$/.test(n)?n:oe(e,t,`an EPSG code such as 4326`)},crs:(e,t)=>{let n=se(t);return typeof n==`string`&&n.startsWith(`EPSG:`)||n&&typeof n==`object`&&n.code?n:oe(e,t,`an EPSG code or { code, def } object`)}},ue=(e,t,n)=>{let r=le[n.type];if(!r)throw TypeError(`perun-atlas: no coercion for type "${n.type}" on "${e}"`);return r(e,t,n)},de=async()=>{let e=Object.entries(F).filter(([,e])=>e.param),n=await Promise.all(e.map(([e,n])=>t.axios.get(`${window.server}/WsConf/params/get/sys/${n.param}`).then(t=>[e,t?.data?.VALUE]).catch(()=>[e,void 0])));return Object.fromEntries(n.filter(([,e])=>e!==void 0&&e!==``))},fe=async e=>(await t.axios.get(`${window.server}/spatial/config/${e}`))?.data?.params??{},pe=()=>{let e={};return Object.entries(F).forEach(([t,n])=>{if(!n.legacy)return;let r=window[n.legacy];r!=null&&r!==``&&(e[t]=r)}),e},me=()=>Object.fromEntries(Object.entries(F).filter(([,e])=>`default`in e).map(([e,t])=>[e,t.default])),he=(e,t,n)=>{let r=Object.keys(e).filter(e=>!(e in t)&&!(e in n));r.length&&console.warn(`perun-atlas: ${r.length} setting(s) still come from window globals — `+r.map(e=>`window.${F[e].legacy}`).join(`, `)+`. Seed `+r.map(e=>F[e].param).join(`, `)+` in SVAROG_SYS_PARAMS; this fallback is temporary.`)},ge=async(e={})=>{let t=await de(),n=pe(),r={...me(),...n,...t,...e};he(n,t,e);let i={},a=[];Object.entries(F).forEach(([e,t])=>{let n=r[e];if(n!==void 0)try{i[e]=ue(e,n,t)}catch(e){a.push(e.message)}});let o=I.filter(e=>i[e]===void 0);if(o.length&&a.push(`missing required setting(s): `+o.map(e=>`${e} (parameter ${F[e].param})`).join(`, `)),a.length)throw Error(`perun-atlas: configuration could not be resolved.
  - `+a.join(`
  - `));return i},_e=async()=>{let[e,t,n]=[await de(),pe(),me()];return Object.fromEntries(Object.keys(F).map(r=>[r,r in e?{source:`SVAROG_SYS_PARAMS`,value:e[r]}:r in t?{source:`window.${F[r].legacy}`,value:t[r]}:r in n?{source:`schema default`,value:n[r]}:{source:`unresolved`,value:void 0}]))},L=Object.getPrototypeOf(n.spatial);L.assets;var ve=L.config,R=L.core,ye=L.data,be=L.tools;L.ui,L.proj4;var xe=e=>Array.isArray(e)&&typeof e[0]==`number`,Se=e=>{if(!e)return[];if(e.type===`GeometryCollection`)return(e.geometries??[]).flatMap(Se);let t=e=>Array.isArray(e)?xe(e)?[e]:e.flatMap(t):[];return t(e.coordinates)},Ce=(e,t)=>{if(!e)return e;if(e.type===`GeometryCollection`)return{...e,geometries:(e.geometries??[]).map(e=>Ce(e,t))};let n=e=>Array.isArray(e)?xe(e)?t(e):e.map(n):e;return{...e,coordinates:n(e.coordinates)}},we=(e,t)=>Array.isArray(e?.features)?{...e,features:e.features.map(e=>e?.geometry?{...e,geometry:Ce(e.geometry,t)}:e)}:e,{Map:Te,factory:z}=R,Ee={3857:()=>z.CRS.EPSG3857,3395:()=>z.CRS.EPSG3395,4326:()=>z.CRS.EPSG4326},De=e=>Ee[String(e)]?.()??null,Oe=e=>e??Te,ke=new Set,Ae=e=>e==null?null:De(e)||(ke.has(String(e))||(ke.add(String(e)),console.warn(`perun-atlas: cannot express a coordinate in EPSG:${e} — the engine builds 3857, 3395 and 4326. Using the map's own projection instead, which is correct only if this deployment stores geometry in it.`)),null),B=(e,t)=>{let n=Ae(e);if(!n)return Oe(t).getBBox();let r=Oe(t).getBounds(),i=n.projection.project(r.getSouthWest()),a=n.projection.project(r.getNorthEast());return`${i.x},${i.y},${a.x},${a.y}`},V=(e,t,n)=>{let{x:r,y:i}=(Ae(t)??Oe(n).getCRS()).projection.project(z.latLng(e));return{x:r,y:i}},je=(e,t,n)=>{let[r,i]=Array.isArray(e)?e:[e?.x,e?.y],{lat:a,lng:o}=(Ae(t)??Oe(n).getCRS()).projection.unproject(z.point(r,i));return{lat:a,lng:o}},Me=(e,t,n)=>we(e,e=>{let{lat:r,lng:i}=je(e,t,n);return[i,r,...e.slice(2)]}),Ne=(e,t,n)=>we(e,e=>{let{x:r,y:i}=V({lat:e[1],lng:e[0]},t,n);return[r,i,...e.slice(2)]}),Pe=(e,t,n)=>Fe(e,t,n).ew,Fe=(e,t,n)=>{let r=.001,i=z.latLng(e),a=z.latLng({lat:i.lat,lng:i.lng+r}),o=z.latLng({lat:i.lat+r,lng:i.lng}),s=V(i,t,n),c=Oe(n).distance(i,a),l=Oe(n).distance(i,o);return{ew:c?Math.abs(V(a,t,n).x-s.x)/c:1,ns:l?Math.abs(V(o,t,n).y-s.y)/l:1}},Ie=e=>e>0?Math.min(12,Math.max(0,3-Math.floor(Math.log10(e)))):6,Le=(e,t)=>{let n=10**t;return Math.round(e*n)/n},Re=(e,t,n,r=24,i)=>{let{ew:a,ns:o}=Fe(e,n,i),{x:s,y:c}=V(e,n,i),l=t*a,u=t*o,d=Ie(Math.min(l,u));return Array.from({length:Math.max(3,r)},(e,t)=>{let n=2*Math.PI*t/Math.max(3,r);return{x:Le(s+l*Math.cos(n),d),y:Le(c+u*Math.sin(n),d)}})},{Map:ze,store:Be}=R,Ve={crs:`crs`,center:`center`,bounds:`bounds`,zoom:`zoom`,minZoom:`minZoom`,maxZoom:`maxZoom`,units:`measurementSystem`,bboxOrder:`switchBboxOrder`},He=e=>{if(!e)return;let t=ze.getCRS?.()?.code,n=typeof e==`object`?e.code:e;t&&n&&t!==n&&console.warn(`perun-atlas: this deployment declares ${n}, but the map is on ${t}. The engine could not resolve the declared value — as a plain code it must be EPSG:3857, EPSG:3395 or EPSG:4326, and any other projection needs a proj4 definition. Basemap tiles will be requested outside the grid they are published on.`)},Ue=e=>{if(!e)return;Be.addState(`dbCRSCode`,{dbCRS:e});let t=De(e);if(t){Be.addState(`dbCRS`,t);return}let n=ze.getCRS?.()?.code;e!==n?.split(`:`)[1]&&console.warn(`perun-atlas: this deployment stores geometry in EPSG:${e}, which spatial cannot convert from — it handles 3857, 3395 and 4326. Geometry will be read as though it were already in ${n}, and will be drawn in the wrong place.`)},We=(e={})=>{let t={};Object.entries(Ve).forEach(([n,r])=>{e[n]!==void 0&&(t[r]=e[n])});let n=ve.configure(t);return He(e.crs),Ue(e.dataSrid),n},Ge=i({COERCE:()=>le,applyToEngine:()=>We,batchSource:()=>fe,coerce:()=>ue,defaultSource:()=>me,explain:()=>_e,legacySource:()=>pe,remoteSource:()=>de,resolve:()=>ge}),{geobuf:Ke,Pbf:H}=ye,U=(e,t,n)=>{window.PERUN_ATLAS_LAST=n,console.groupCollapsed(`perun-atlas: ${n.features.length} feature(s), ${t} bytes — ${e}`),console.log(`collection`,n),console.log(`also at window.PERUN_ATLAS_LAST`),console.groupEnd()},qe=async(e,n={})=>{let r=`${window.server}${b(e,n)}`,i=await(0,t.axios)({method:`get`,url:r,responseType:`arraybuffer`}),a=i?.data?.byteLength??0;if(!i?.data||a===0){let e={type:`FeatureCollection`,features:[]};return U(r,a,e),e}let o=Ke.decode(new H(new Uint8Array(i.data)));if(!o||!o.type){console.warn(`perun-atlas: response from ${r} decoded to no GeoJSON type; treating as empty`),console.warn(`perun-atlas: response body was`,new TextDecoder().decode(i.data).slice(0,500));let e={type:`FeatureCollection`,features:[]};return U(r,a,e),e}let s=o.type===`FeatureCollection`?o:{type:`FeatureCollection`,features:[o]};return U(r,a,s),s},Je=e=>e?.properties?.DESCRIPTOR??e?.properties?.descriptor??null,Ye=e=>({id:e?.id??e?.properties?.OBJECT_ID??null,parentId:e?.properties?.parent_id??e?.properties?.PARENT_ID??null}),Xe=(e,t,n=`id`)=>{if(t==null)return!1;let r=Ye(e),i=n===`parent`?r.parentId:r.id;return i!=null&&String(i)===String(t)},{factory:Ze}=R,{getServerOrigin:Qe}=t.utils,$e=`GEO_LAYER_TYPE`,et={BASEMAP:`1`,OVERLAY:`2`},tt=(e,t=$e)=>({layerType:e?.[`${t}.LAYER_TYPE`],protocol:(e?.[`${t}.PROTOCOL`]??``).toLowerCase(),version:e?.[`${t}.VERSION`]||`1.1.1`,format:e?.[`${t}.FORMAT`]||`image/png`,url:e?.[`${t}.URL`],group:e?.[`${t}.LAYER_GROUP`]||`Other`,title:e?.[`${t}.TITLE`],label:e?.[`${t}.LABEL_CODE`]||e?.[`${t}.TITLE`]}),nt=[{match:/openstreetmap\.org/i,maxNativeZoom:19,attribution:`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`},{match:/opentopomap\.org/i,maxNativeZoom:17,attribution:`&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)`},{match:/cartocdn\.com/i,maxNativeZoom:20,attribution:`&copy; <a href="https://carto.com/attributions">CARTO</a>`},{match:/arcgisonline\.com/i,attribution:`Tiles &copy; <a href="https://www.esri.com">Esri</a>`}],rt=e=>nt.find(t=>t.match.test(e??``))??{},it=(e,{maxZoom:t}={})=>{let n=e.url||Qe(),r=rt(n),i={...t!=null&&{maxZoom:t},...r.maxNativeZoom!=null&&{maxNativeZoom:r.maxNativeZoom}},a=r.attribution?{attribution:r.attribution}:{};if(e.protocol===`wms`)return Ze.tileLayer.extendedWMS(n,{layers:e.title,format:e.format,version:e.version,transparent:!0,uppercase:!0,...i,...a,...e.layerType===et.OVERLAY&&{tiled:!0,isOverlay:!0}});if(e.protocol===`tile`){let e=/google|mt\{s\}/i.test(n);return Ze.tileLayer(n,{...i,...a,...e&&{subdomains:[`mt0`,`mt1`,`mt2`,`mt3`]}})}return e.protocol===`grid`?e.url?.includes(`google`)?Ze.gridLayer.googleMutant({maxZoom:24,type:e.url.split(`_`)[1]}):(console.warn(`perun-atlas: grid layer "${e.title}" has no recognised provider in its URL`),null):(console.warn(`perun-atlas: unsupported layer protocol "${e.protocol}" for "${e.title}"`),null)},at=async(e,n={})=>{let r={},i={},a=(await t.axios.get(`${window.server}/ReactElements/getTableData/${e}/${$e}/0`).catch(e=>(console.error(`perun-atlas: layer catalogue unavailable`,e),null)))?.data;return Array.isArray(a)&&a.forEach(e=>{let t=tt(e),a=it(t,n);if(!a)return;let o=t.layerType===et.OVERLAY?i:r;o[t.group]=o[t.group]||{},o[t.group][t.label]=a}),{basemap:r,overlays:i}},ot=e=>{let t=Object.values(e??{})[0];return t?Object.values(t)[0]:null},st=(e,t)=>{if(!t)return null;let n=Object.values(e??{}).find(e=>Object.prototype.hasOwnProperty.call(e,t));return n?n[t]:null},ct=(e,t)=>{for(let n of Object.values(e??{})){let e=Object.entries(n).find(([,e])=>t?.hasLayer?.(e));if(e)return e[0]}return null},lt=async(e,n={})=>{if(!e)return[];let r=`${window.server}${b(e,n)}`,i=(await t.axios.get(r).catch(e=>(console.error(`perun-atlas: rows unavailable from ${r}`,e),null)))?.data;return i&&!Array.isArray(i)&&console.warn(`perun-atlas: ${r} answered with no array of rows; treating as empty`),Array.isArray(i)?i:[]},ut=async(e,n,r,i)=>{if(!e)return null;let a=`${window.server}${b(e,n)}`,o=await t.axios.get(a).catch(e=>(console.error(`perun-atlas: no ${r} from ${a}`,e),null));if(!o)return null;let s=o.data;return i(s)?s:(console.error(`perun-atlas: ${a} answered with no ${r}`,s),null)},dt=e=>!!e&&typeof e==`object`&&!Array.isArray(e),ft=(e,t={})=>ut(e,t,`form schema`,e=>dt(e)&&!!e.properties),pt=(e,t={})=>ut(e,t,`form layout`,dt),mt=(e,t)=>{if(!e?.properties||!t?.length)return e??null;let n=e.properties,r={},i=new Set;t.forEach(e=>{if(Object.prototype.hasOwnProperty.call(n,e)){r[e]=n[e],i.add(e);return}let t=e.lastIndexOf(`.`),a=t===-1?``:e.slice(0,t),o=t===-1?``:e.slice(t+1),s=a?n[a]:null,c=s?.properties?.[o];if(!c){console.warn(`perun-atlas: the form schema has no "${e}", so it is not on the form`);return}if(i.has(a))return;let l=r[a]??{...s,properties:{}};l.properties={...l.properties,[o]:c},r[a]=l}),Object.keys(r).forEach(e=>{if(i.has(e))return;let t=r[e],a=(n[e].required??[]).filter(e=>e in t.properties);a.length?t.required=a:delete t.required});let a={...e,properties:r};delete a.title;let o=(e.required??[]).filter(e=>e in r);if(o.length?a.required=o:delete a.required,a.dependencies){let e=Object.entries(a.dependencies).filter(([e])=>e in r);e.length?a.dependencies=Object.fromEntries(e):delete a.dependencies}return a},ht=(e,t)=>{if(!t?.properties)return e??{};let n={...e??{}};return Object.entries(t.properties).forEach(([e,t])=>{t?.properties&&(n[e]=ht(n[e],t))}),n},gt={boolean:[`checkbox`,`radio`,`select`,`hidden`],string:[`text`,`password`,`email`,`hostname`,`ipv4`,`ipv6`,`uri`,`data-url`,`radio`,`select`,`textarea`,`hidden`,`date`,`datetime`,`date-time`,`alt-date`,`alt-datetime`,`time`,`color`,`file`],number:[`text`,`select`,`updown`,`range`,`radio`,`hidden`],integer:[`text`,`select`,`updown`,`range`,`radio`,`hidden`],array:[`select`,`checkboxes`,`files`,`hidden`]},_t=new Set([`AltDateTimeWidget`,`AltDateWidget`,`CheckboxWidget`,`CheckboxesWidget`,`ColorWidget`,`DateTimeWidget`,`DateWidget`,`EmailWidget`,`FileWidget`,`HiddenWidget`,`PasswordWidget`,`RadioWidget`,`RangeWidget`,`SelectWidget`,`TextWidget`,`TextareaWidget`,`TimeWidget`,`URLWidget`,`UpDownWidget`]),vt=new Set(Object.values(gt).flat()),yt=(e,t)=>_t.has(e)||(t?(gt[t]??[]).includes(e):vt.has(e)),bt=(e,t)=>{if(!dt(e))return e??null;let n=[],r=(e,t)=>{let i={};return Object.entries(e).forEach(([e,a])=>{if(e===`ui:widget`&&typeof a==`string`&&!yt(a,t?.type)){n.push(a);return}let o=e===`items`?t?.items:t?.properties?.[e];i[e]=dt(a)&&!e.startsWith(`ui:`)?r(a,o):a}),i},i=r(e,t);return n.length&&console.warn(`perun-atlas: this form cannot draw ${[...new Set(n)].map(e=>`"${e}"`).join(`, `)} -- those are the widgets a record form registers, and the draw row is not one. The fields keep the widget their schema implies.`),n.length?i:e},{Map:xt,factory:St}=R,Ct=(e,t,n,r)=>{let i=Se(e?.geometry);if(i.length===0)return null;let a=St.latLng(t),o=r??xt,s=1/0,c=0;return i.forEach(e=>{let t=o.distance(a,St.latLng(je(e,n,r)));t<s&&(s=t),t>c&&(c=t)}),{nearest:s,furthest:c}},wt=(e,t,n={})=>{let{srid:r,mode:i=`touches`,map:a}=n,o=e?.features??[],s={inside:[],outside:o,has:()=>!1,metres:()=>null,total:o.length};if(!t||!(t.radius>0))return s;let c={lat:t.lat,lng:t.lng};if(!Number.isFinite(c.lat)||!Number.isFinite(c.lng))return s;let l=new WeakMap,u=new WeakSet,d=[],f=[];return o.forEach(e=>{let n=Ct(e,c,r,a);if(!n){f.push(e);return}l.set(e,n.nearest),(i===`contains`?n.furthest<=t.radius:n.nearest<=t.radius)?(u.add(e),d.push(e)):f.push(e)}),d.sort((e,t)=>l.get(e)-l.get(t)),{inside:d,outside:f,has:e=>e?u.has(e):!1,metres:e=>e&&l.has(e)?l.get(e):null,total:o.length}},Tt=(e,t={})=>{let{id:n=`{pkid}`,join:r=`,`}=t;return(e??[]).map(e=>b(n,e?.properties??{})).filter(e=>e&&e!==n).join(r)},Et=e=>encodeURIComponent(JSON.stringify(e)),Dt=e=>e.replace(/ /g,`%20`),Ot=(e,t,n)=>e==null?``:t===`form`||!t&&/form-urlencoded/.test(n??``)?Et(e):JSON.stringify(e),kt=(e,t)=>{let n=typeof e==`string`?At(e):e,r=String(n?.type??``).toUpperCase();return r===`ERROR`||r===`EXCEPTION`?{ok:!1,message:[n?.title,n?.message].filter(Boolean).join(` — `)}:t&&typeof e==`string`&&new RegExp(t,`i`).test(e)?{ok:!1,message:e.trim().slice(0,300)}:{ok:!0,message:null}},At=e=>{try{return JSON.parse(e)}catch{return null}},jt=/^\{([^{}]+)\}$/,Mt=`...`,Nt=(e,t)=>{if(typeof e==`string`){let n=e.match(jt);return n?v(t,n[1])??e:b(e,t)}if(Array.isArray(e))return e.map(e=>Nt(e,t));if(e&&typeof e==`object`){let n={};return Object.entries(e).forEach(([e,r])=>{let i=Nt(r,t);if(e===Mt){i&&typeof i==`object`&&!Array.isArray(i)?Object.assign(n,i):n[e]=i;return}n[e]=i}),n}return e},Pt=async(e,n={},r={})=>{let{body:i,contentType:a=`application/x-www-form-urlencoded`,encoding:o,failure:s}=r,c=`${window.server}${Dt(b(e,n))}`;try{let e=await(0,t.axios)({method:`post`,url:c,headers:{"Content-Type":a},data:Ot(i,o,a)}),n=kt(e?.data,s);return n.ok||(console.error(`perun-atlas: ${c} refused the save`,e?.data),console.error(`perun-atlas: the payload was`,i)),{...n,data:e?.data}}catch(e){return console.error(`perun-atlas: save to ${c} failed`,e),{ok:!1,message:e?.message??String(e),data:null}}},Ft=(e,{draw:t,dataSrid:n,bindings:r,note:i,selected:a,form:o,map:s})=>{let c={lat:e.lat,lng:e.lng},{x:l,y:u}=V(c,n,s),d=e.radius*Pe(c,n,s),f=Math.round(d),p=Re(c,e.radius,n,t.points,s),m=p.map(e=>b(t.ring?.point??`{x} {y}`,e)).join(t.ring?.join??`, `),h={type:`Polygon`,coordinates:[[...p,p[0]].map(e=>[e.x,e.y])]},g=[t.save.onSave,JSON.stringify(t.save.body??null)].some(e=>String(e).includes(`{draw.radius}`));return{context:{...r,note:i,draw:{lat:e.lat,lng:e.lng,metres:Math.round(e.radius),x:l,y:u,radius:f,ring:m,geojson:h,...a?{selected:a}:{}},...t.form?{form:o}:{}},units:d,tooSmall:g&&!(f>=1)}},It=e=>JSON.stringify(e??{type:`FeatureCollection`,features:[]},null,2),Lt=(e,t=[])=>{let n=new Set([...s,...t]),r=new Set;return e.forEach(e=>{Object.entries(e?.properties??{}).forEach(([e,t])=>{!n.has(e)&&(typeof t!=`object`||!t)&&r.add(e)})}),[...r]},Rt=(e,{fields:t,exclude:n,labelResolver:r}={})=>t?.length?t.map(({field:e,label:t,short:n})=>({field:e,header:t&&r?.(t)||t||e,short:n})):Lt(e,n).map(e=>({field:e,header:r?.(e.toLowerCase())||e})),zt=e=>e.map(([e,t])=>`${e} ${t}`).join(`, `),Bt=e=>e.map(e=>`(${zt(e)})`).join(`, `),Vt={Point:([e,t])=>`POINT (${e} ${t})`,MultiPoint:e=>`MULTIPOINT (${zt(e)})`,LineString:e=>`LINESTRING (${zt(e)})`,MultiLineString:e=>`MULTILINESTRING (${Bt(e)})`,Polygon:e=>`POLYGON (${Bt(e)})`,MultiPolygon:e=>`MULTIPOLYGON (${e.map(e=>`(${Bt(e)})`).join(`, `)})`},Ht=e=>{let t=Vt[e?.type];return t&&e.coordinates?.length?t(e.coordinates):``},Ut=e=>{if(e==null)return``;let t=String(e),n=!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t)&&/^[=+\-@\t\r]/.test(t)?`'${t}`:t;return/[",\r\n]/.test(n)?`"${n.replace(/"/g,`""`)}"`:n},Wt=(e,{fields:t,exclude:n,labelResolver:r}={})=>{let i=e?.features??[],a=Rt(i,{fields:t,exclude:n,labelResolver:r}),o=e=>e?.geometry?.type??``,s=i.some(e=>/Point$/.test(o(e))),c=i.some(e=>o(e)&&!/Point$/.test(o(e))),l=[...a.map(e=>e.header),...s?[`latitude`,`longitude`]:[],...c?[`geometry`]:[]],u=i.map(e=>{let t=a.map(t=>Ut(v(e?.properties,t.field)));if(s){let[n,r]=/^Point$/.test(o(e))?e.geometry.coordinates??[]:[];t.push(Ut(r),Ut(n))}return c&&t.push(Ut(Ht(e?.geometry))),t});return[l.map(Ut),...u].map(e=>e.join(`,`)).join(`\r
`)},Gt={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&apos;`},Kt=e=>String(e).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g,``).replace(/[&<>"']/g,e=>Gt[e]),qt=e=>`<coordinates>${e.map(e=>e.join(`,`)).join(` `)}</coordinates>`,Jt=e=>`<LinearRing>${qt(e)}</LinearRing>`,Yt={Point:e=>`<Point>${qt([e])}</Point>`,LineString:e=>`<LineString><tessellate>1</tessellate>${qt(e)}</LineString>`,Polygon:([e,...t])=>`<Polygon><tessellate>1</tessellate><outerBoundaryIs>${Jt(e)}</outerBoundaryIs>`+t.map(e=>`<innerBoundaryIs>${Jt(e)}</innerBoundaryIs>`).join(``)+`</Polygon>`,MultiPoint:e=>`<MultiGeometry>${e.map(Yt.Point).join(``)}</MultiGeometry>`,MultiLineString:e=>`<MultiGeometry>${e.map(Yt.LineString).join(``)}</MultiGeometry>`,MultiPolygon:e=>`<MultiGeometry>${e.map(Yt.Polygon).join(``)}</MultiGeometry>`},Xt=e=>{let t=Yt[e?.type];return t&&e.coordinates?.length?t(e.coordinates):``},Zt=(e,t,n)=>{let r=n?.(e),i=Xt(e?.geometry),a=t.map(({field:t,header:n})=>{let r=v(e?.properties,t),i=r==null?``:Kt(r);return`        <Data name="${Kt(t)}"><displayName>${Kt(n)}</displayName><value>${i}</value></Data>`});return[`    <Placemark>`,...r==null||r===``?[]:[`      <name>${Kt(r)}</name>`],...a.length?[`      <ExtendedData>`,...a,`      </ExtendedData>`]:[],...i?[`      ${i}`]:[],`    </Placemark>`].join(`
`)},Qt=(e,{fields:t,exclude:n,labelResolver:r,nameOf:i}={})=>{let a=e?.features??[],o=Rt(a,{fields:t,exclude:n,labelResolver:r});return[`<?xml version="1.0" encoding="UTF-8"?>`,`<kml xmlns="http://www.opengis.net/kml/2.2">`,`  <Document>`,...a.map(e=>Zt(e,o,i)),`  </Document>`,`</kml>`,``].join(`
`)},$t=`GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]`,en=1,tn=3,nn=5,rn=8,an=[{name:`points`,types:[`Point`,`MultiPoint`]},{name:`lines`,types:[`LineString`,`MultiLineString`],shape:tn},{name:`polygons`,types:[`Polygon`,`MultiPolygon`],shape:nn}],on=e=>Array.isArray(e)&&Number.isFinite(e[0])&&Number.isFinite(e[1]),sn=e=>Array.isArray(e)?e.filter(on):[],cn=e=>{let[t,n]=[e[0],e[e.length-1]];return t[0]===n[0]&&t[1]===n[1]?e:[...e,t]},ln=e=>{let t=0;for(let n=1;n<e.length;n+=1)t+=(e[n][0]-e[n-1][0])*(e[n][1]+e[n-1][1]);return t>0},un=e=>{let[t,...n]=(Array.isArray(e)?e:[]).map(sn);return t?.length?[t,...n.filter(e=>e.length)].map(cn).map((e,t)=>ln(e)===(t===0)?e:[...e].reverse()):[]},dn=e=>Array.isArray(e)?e.map(sn).filter(e=>e.length):[],fn={Point:e=>on(e)?[[e]]:[],MultiPoint:e=>{let t=sn(e);return t.length?[t]:[]},LineString:e=>dn([e]),MultiLineString:dn,Polygon:un,MultiPolygon:e=>Array.isArray(e)?e.flatMap(un):[]},pn=e=>fn[e?.type]?.(e.coordinates)??[],mn=e=>e.reduce(([e,t,n,r],[i,a])=>[Math.min(e,i),Math.min(t,a),Math.max(n,i),Math.max(r,a)],[1/0,1/0,-1/0,-1/0]),hn=(e,t,n)=>n.forEach((n,r)=>e.setFloat64(t+8*r,n,!0)),gn=(e,t)=>{let n=t.reduce((e,t)=>e+t.length,0);return e===en?20:e===rn?40+16*n:44+4*t.length+16*n},_n=(e,t,n,r)=>{if(e.setInt32(t,n,!0),n===en){let[[[n,i]]]=r;e.setFloat64(t+4,n,!0),e.setFloat64(t+12,i,!0);return}let i=r.flat();hn(e,t+4,mn(i));let a=t+36;if(n!==rn&&(e.setInt32(a,r.length,!0),a+=4),e.setInt32(a,i.length,!0),a+=4,n!==rn){let t=0;r.forEach(n=>{e.setInt32(a,t,!0),a+=4,t+=n.length})}i.forEach(([t,n])=>{e.setFloat64(a,t,!0),e.setFloat64(a+8,n,!0),a+=16})},vn=(e,t,n)=>{e.setInt32(0,9994),e.setInt32(24,e.byteLength/2),e.setInt32(28,1e3,!0),e.setInt32(32,t,!0),hn(e,36,n)},yn=(e,t)=>{let n=t.map(t=>gn(e,t)),r=new DataView(new ArrayBuffer(n.reduce((e,t)=>e+8+t,100))),i=new DataView(new ArrayBuffer(100+8*t.length)),a=mn(t.flatMap(e=>e.flat()));vn(r,e,a),vn(i,e,a);let o=100;return t.forEach((t,a)=>{i.setInt32(100+8*a,o/2),i.setInt32(104+8*a,n[a]/2),r.setInt32(o,a+1),r.setInt32(o+4,n[a]/2),_n(r,o+8,e,t),o+=8+n[a]}),{shp:new Uint8Array(r.buffer),shx:new Uint8Array(i.buffer)}},bn=10,xn=e=>{let t=new Set;return e.map(e=>{let n=String(e.short||e.field).replace(/[^A-Za-z0-9_]/g,`_`),r=(/[A-Za-z0-9]/.test(n)?n:`FIELD`).slice(0,bn),i=r;for(let e=1;t.has(i.toUpperCase());e+=1){let t=`_${e}`;i=r.slice(0,bn-t.length)+t}return t.add(i.toUpperCase()),{...e,short:i}})},Sn=new TextEncoder,Cn=32,wn=254,Tn=19,En=15,Dn=e=>{let t=Sn.encode(String(e));if(t.length<=wn)return t;let n=wn;for(;n>0&&(t[n]&192)==128;)--n;return t.subarray(0,n)},On=(e,t=0)=>e.reduce((e,t)=>Math.max(e,t),t),kn=e=>{for(let t=0;t<En;t+=1)if(Number(e.toFixed(t))===e)return t;return En},An=e=>{let t=On(e.filter(e=>e!==null).map(kn)),n=e.map(e=>e===null?null:e.toFixed(t));if(n.some(e=>e?.includes(`e`)))return null;let r=On(n.map(e=>e?.length??0));return r<=Tn?{type:`N`,width:r,decimals:t,cells:n.map(e=>e&&Sn.encode(e))}:null},jn=e=>{let t=e.filter(e=>e!=null),n=e.map(e=>e===void 0?null:e);if(t.length&&t.every(e=>typeof e==`number`&&Number.isFinite(e))){let e=An(n);if(e)return e}if(t.length&&t.every(e=>typeof e==`boolean`))return{type:`L`,width:1,decimals:0,cells:n.map(e=>Sn.encode(e===null?`?`:e?`T`:`F`))};let r=n.map(e=>e===null?null:Dn(e));return{type:`C`,width:On(r.map(e=>e?.length??0),1),decimals:0,cells:r}},Mn=(e,t,n)=>{let r=e.length?e.map(e=>({name:e.short,...jn(t.map(t=>v(t?.properties,e.field)))})):[{name:`FID`,...jn(t.map((e,t)=>t))}],i=32+32*r.length+1,a=r.reduce((e,t)=>e+t.width,1),o=new Uint8Array(i+a*t.length+1),s=new DataView(o.buffer);s.setUint8(0,3),s.setUint8(1,n.getFullYear()-1900),s.setUint8(2,n.getMonth()+1),s.setUint8(3,n.getDate()),s.setUint32(4,t.length,!0),s.setUint16(8,i,!0),s.setUint16(10,a,!0),r.forEach(({name:e,type:t,width:n,decimals:r},i)=>{let a=32+32*i;o.set(Sn.encode(e),a),s.setUint8(a+11,t.charCodeAt(0)),s.setUint8(a+16,n),s.setUint8(a+17,r)}),s.setUint8(i-1,13),o.fill(Cn,i,o.length-1);let c=i;return t.forEach((e,t)=>{c+=1,r.forEach(({type:e,width:n,cells:r})=>{let i=r[t];i&&o.set(i,e===`N`?c+n-i.length:c),c+=n})}),s.setUint8(o.length-1,26),o},Nn=e=>`﻿`+[[`short`,`column`,`header`],...e.map(({short:e,field:t,header:n})=>[e,t,n])].map(e=>e.map(Ut).join(`,`)).join(`\r
`),Pn=(e,t,n)=>{let r=new Set(Rt(t,{exclude:n}).map(({field:e})=>e));return e.filter(({field:e})=>r.has(e))},Fn=(e,{stem:t=`features`,fields:n,exclude:r,labelResolver:i,today:a=new Date}={})=>{let o=e?.features??[],s=xn(Rt(o,{fields:n,exclude:r,labelResolver:i})),c=[];return an.forEach(({name:e,types:i,shape:l})=>{let u=o.filter(e=>i.includes(e?.geometry?.type)).map(e=>({feature:e,parts:pn(e.geometry)})).filter(({parts:e})=>e.length);if(!u.length)return;let d=l??(u.every(({feature:e})=>e.geometry.type===`Point`)?en:rn),f=n?.length?s:Pn(s,u.map(({feature:e})=>e),r),{shp:p,shx:m}=yn(d,u.map(({parts:e})=>e)),h=`${t}-${e}`;c.push({name:`${h}.shp`,bytes:p},{name:`${h}.shx`,bytes:m},{name:`${h}.dbf`,bytes:Mn(f,u.map(({feature:e})=>e),a)},{name:`${h}.prj`,bytes:Sn.encode($t)},{name:`${h}.cpg`,bytes:Sn.encode(`UTF-8`)})}),c.push({name:`${t}-fields.csv`,bytes:Sn.encode(Nn(s))}),c};function W(e,t){return Array.from(e.getElementsByTagName(t))}function In(e){return e[0]===`#`?e:`#${e}`}function Ln(e,t,n){return Array.from(e.getElementsByTagNameNS(n,t))}function G(e){return e?.normalize(),e?.textContent||``}function K(e,t,n){let r=e.getElementsByTagName(t),i=r.length?r[0]:null;return i&&n&&n(i),i}function q(e,t,n){let r={};if(!e)return r;let i=e.getElementsByTagName(t),a=i.length?i[0]:null;return a&&n?n(a,r):r}function Rn(e,t,n){let r=G(K(e,t));return r&&n&&n(r)||{}}function zn(e,t,n){let r=Number.parseFloat(G(K(e,t)));if(!Number.isNaN(r))return r&&n&&n(r)||{}}function J(e,t,n){let r=Number.parseFloat(G(K(e,t)));if(!Number.isNaN(r))return n&&n(r),r}function Bn(e,t){let n={};for(let r of t)Rn(e,r,e=>{n[r]=e});return n}function Vn(e){return e?.nodeType===1}function Hn(e){let t=[];if(e===null)return t;for(let n of Array.from(e.childNodes)){if(!Vn(n))continue;let e=Un(n.nodeName);if(e===`gpxtpx:TrackPointExtension`)t=t.concat(Hn(n));else{let r=G(n);t.push([e,Wn(r)])}}return t}function Un(e){return[`heart`,`gpxtpx:hr`,`hr`].includes(e)?`heart`:e}function Wn(e){let t=Number.parseFloat(e);return Number.isNaN(t)?e:t}function Gn(e){let t=[Number.parseFloat(e.getAttribute(`lon`)||``),Number.parseFloat(e.getAttribute(`lat`)||``)];if(Number.isNaN(t[0])||Number.isNaN(t[1]))return null;J(e,`ele`,e=>{t.push(e)});let n=K(e,`time`);return{coordinates:t,time:n?G(n):null,extendedValues:Hn(K(e,`extensions`))}}function Kn(e){return q(e,`line`,e=>Object.assign({},Rn(e,`color`,e=>({stroke:`#${e}`})),zn(e,`opacity`,e=>({"stroke-opacity":e})),zn(e,`width`,e=>({"stroke-width":e*96/25.4}))))}function qn(e,t){let n=Bn(t,[`name`,`cmt`,`desc`,`type`,`time`,`keywords`]);for(let[r,i]of e)for(let e of Array.from(t.getElementsByTagNameNS(i,`*`)))n[e.tagName.replace(`:`,`_`)]=G(e)?.trim();let r=W(t,`link`);return r.length&&(n.links=r.map(e=>Object.assign({href:e.getAttribute(`href`)},Bn(e,[`text`,`type`])))),n}function Jn(e,t){let n=W(e,t),r=[],i=[],a={};for(let e=0;e<n.length;e++){let t=Gn(n[e]);if(t){r.push(t.coordinates),t.time&&i.push(t.time);for(let[r,i]of t.extendedValues){let t=r===`heart`?r:`${r.replace(`gpxtpx:`,``)}s`;a[t]||(a[t]=Array(n.length).fill(null)),a[t][e]=i}}}if(!(r.length<2))return{line:r,times:i,extendedValues:a}}function Yn(e,t){let n=Jn(t,`rtept`);if(n)return{type:`Feature`,properties:Object.assign({_gpxType:`rte`},qn(e,t),Kn(K(t,`extensions`))),geometry:{type:`LineString`,coordinates:n.line}}}function Xn(e,t){let n=W(t,`trkseg`),r=[],i=[],a=[];for(let e of n){let t=Jn(e,`trkpt`);t&&(a.push(t),t.times?.length&&i.push(t.times))}if(a.length===0)return null;let o=a.length>1,s=Object.assign({_gpxType:`trk`},qn(e,t),Kn(K(t,`extensions`)),i.length?{coordinateProperties:{times:o?i:i[0]}}:{});for(let e=0;e<a.length;e++){let t=a[e];r.push(t.line),s.coordinateProperties||(s.coordinateProperties={});let n=s.coordinateProperties;for(let[r,i]of Object.entries(t.extendedValues))o?(n[r]||(n[r]=a.map(e=>Array(e.line.length).fill(null))),n[r][e]=i):n[r]=i}return{type:`Feature`,properties:s,geometry:o?{type:`MultiLineString`,coordinates:r}:{type:`LineString`,coordinates:r[0]}}}function Zn(e,t){let n=Object.assign(qn(e,t),Bn(t,[`sym`])),r=Gn(t);return r?{type:`Feature`,properties:n,geometry:{type:`Point`,coordinates:r.coordinates}}:null}function*Qn(e){let t=e,n=`http://www.garmin.com/xmlschemas/GpxExtensions/v3`,r=[[`gpxx`,n]],i=t.getElementsByTagName(`gpx`)[0]?.attributes;if(i)for(let e of Array.from(i))e.name?.startsWith(`xmlns:`)&&e.value!==n&&r.push([e.name,e.value]);for(let e of W(t,`trk`)){let t=Xn(r,e);t&&(yield t)}for(let e of W(t,`rte`)){let t=Yn(r,e);t&&(yield t)}for(let e of W(t,`wpt`)){let t=Zn(r,e);t&&(yield t)}}function $n(e){return{type:`FeatureCollection`,features:Array.from(Qn(e))}}function er(e,t){let n={},r=t===`stroke`||t===`fill`?t:`${t}-color`;return e[0]===`#`&&(e=e.substring(1)),e.length===6||e.length===3?n[r]=`#${e}`:e.length===8&&(n[`${t}-opacity`]=Number.parseInt(e.substring(0,2),16)/255,n[r]=`#${e.substring(6,8)}${e.substring(4,6)}${e.substring(2,4)}`),n}function tr(e,t,n){let r={};return J(e,t,e=>{r[n]=e}),r}function nr(e,t){return q(e,`color`,e=>er(G(e),t))}function rr(e){return q(e,`Icon`,(e,t)=>(Rn(e,`href`,e=>{t.icon=e}),t))}function ir(e){return q(e,`IconStyle`,e=>Object.assign(nr(e,`icon`),tr(e,`scale`,`icon-scale`),tr(e,`heading`,`icon-heading`),q(e,`hotSpot`,e=>{let t=Number.parseFloat(e.getAttribute(`x`)||``),n=Number.parseFloat(e.getAttribute(`y`)||``),r=e.getAttribute(`xunits`)||``,i=e.getAttribute(`yunits`)||``;return!Number.isNaN(t)&&!Number.isNaN(n)?{"icon-offset":[t,n],"icon-offset-units":[r,i]}:{}}),rr(e)))}function ar(e){return q(e,`LabelStyle`,e=>Object.assign(nr(e,`label`),tr(e,`scale`,`label-scale`)))}function or(e){return q(e,`LineStyle`,e=>Object.assign(nr(e,`stroke`),tr(e,`width`,`stroke-width`)))}function sr(e){return q(e,`PolyStyle`,(e,t)=>Object.assign(t,q(e,`color`,e=>er(G(e),`fill`)),Rn(e,`fill`,e=>{if(e===`0`)return{"fill-opacity":0}}),Rn(e,`outline`,e=>{if(e===`0`)return{"stroke-opacity":0}})))}function cr(e){return Object.assign({},sr(e),or(e),ar(e),ir(e))}var lr=/\s*/g,ur=/^\s*|\s*$/g,dr=/\s+/;function fr(e){return e.replace(lr,``).split(`,`).map(Number.parseFloat).filter(e=>!Number.isNaN(e)).slice(0,3)}function pr(e){return e.replace(ur,``).split(dr).map(fr).filter(e=>e.length>=2)}function mr(e){let t=W(e,`coord`);t.length===0&&(t=Ln(e,`coord`,`*`));let n=t.map(e=>G(e).split(` `).map(Number.parseFloat));return n.length===0?null:{geometry:n.length>2?{type:`LineString`,coordinates:n}:{type:`Point`,coordinates:n[0]},times:W(e,`when`).map(e=>G(e))}}function hr(e){if(e.length===0)return e;let t=e[0],n=e[e.length-1],r=!0;for(let e=0;e<Math.max(t.length,n.length);e++)if(t[e]!==n[e]){r=!1;break}return r?e:e.concat([e[0]])}function gr(e){return G(K(e,`coordinates`))}function _r(e){let t=[],n=[];for(let r=0;r<e.childNodes.length;r++){let i=e.childNodes.item(r);if(Vn(i))switch(i.tagName){case`MultiGeometry`:case`MultiTrack`:case`gx:MultiTrack`:{let e=_r(i);t=t.concat(e.geometries),n=n.concat(e.coordTimes);break}case`Point`:{let e=fr(gr(i));e.length>=2&&t.push({type:`Point`,coordinates:e});break}case`LinearRing`:case`LineString`:{let e=pr(gr(i));e.length>=2&&t.push({type:`LineString`,coordinates:e});break}case`Polygon`:{let e=[];for(let t of W(i,`LinearRing`)){let n=hr(pr(gr(t)));n.length>=4&&e.push(n)}e.length&&t.push({type:`Polygon`,coordinates:e});break}case`Track`:case`gx:Track`:{let e=mr(i);if(!e)break;let{times:r,geometry:a}=e;t.push(a),r.length&&n.push(r);break}}}return{geometries:t,coordTimes:n}}var vr=e=>Number(e),yr={string:e=>e,int:vr,uint:vr,short:vr,ushort:vr,float:vr,double:vr,bool:e=>!!e};function br(e,t){return q(e,`ExtendedData`,(e,n)=>{for(let t of W(e,`Data`))n[t.getAttribute(`name`)||``]=G(K(t,`value`));for(let r of W(e,`SimpleData`)){let e=r.getAttribute(`name`)||``;n[e]=(t[e]||yr.string)(G(r))}return n})}function xr(e){let t=K(e,`description`);for(let e of Array.from(t?.childNodes||[]))if(e.nodeType===4)return{description:{"@type":`html`,value:G(e)}};return{}}function Sr(e){return q(e,`TimeSpan`,e=>({timespan:{begin:G(K(e,`begin`)),end:G(K(e,`end`))}}))}function Cr(e){return q(e,`TimeStamp`,e=>({timestamp:G(K(e,`when`))}))}function wr(e,t){return Rn(e,`styleUrl`,e=>(e=In(e),t[e]?Object.assign({styleUrl:e},t[e]):{styleUrl:e}))}var Y;(function(e){e.ABSOLUTE=`absolute`,e.RELATIVE_TO_GROUND=`relativeToGround`,e.CLAMP_TO_GROUND=`clampToGround`,e.CLAMP_TO_SEAFLOOR=`clampToSeaFloor`,e.RELATIVE_TO_SEAFLOOR=`relativeToSeaFloor`})(Y||(Y={}));function Tr(e){switch(e?.textContent){case Y.ABSOLUTE:return Y.ABSOLUTE;case Y.CLAMP_TO_GROUND:return Y.CLAMP_TO_GROUND;case Y.CLAMP_TO_SEAFLOOR:return Y.CLAMP_TO_SEAFLOOR;case Y.RELATIVE_TO_GROUND:return Y.RELATIVE_TO_GROUND;case Y.RELATIVE_TO_SEAFLOOR:return Y.RELATIVE_TO_SEAFLOOR}return null}function Er(e){return K(e,`gx:LatLonQuad`)?{geometry:{type:`Polygon`,coordinates:[hr(pr(gr(e)))]}}:kr(e)}var Dr=Math.PI/180;function Or(e,t,n){let r=[(e[0]+e[2])/2,(e[1]+e[3])/2];return[t[0].map(e=>{let t=e[1]-r[1],i=e[0]-r[0],a=Math.sqrt(t**2+i**2),o=Math.atan2(t,i)+n*Dr;return[r[0]+Math.cos(o)*a,r[1]+Math.sin(o)*a]})]}function kr(e){let t=K(e,`LatLonBox`);if(t){let e=J(t,`north`),n=J(t,`west`),r=J(t,`east`),i=J(t,`south`),a=J(t,`rotation`);if(typeof e==`number`&&typeof i==`number`&&typeof n==`number`&&typeof r==`number`){let t=[n,i,r,e],o=[[[n,e],[r,e],[r,i],[n,i],[n,e]]];return typeof a==`number`&&(o=Or(t,o,a)),{bbox:t,geometry:{type:`Polygon`,coordinates:o}}}}return null}function Ar(e,t,n,r){let i=Er(e),a=i?.geometry||null;if(!a&&r.skipNullGeometry)return null;let o={type:`Feature`,geometry:a,properties:Object.assign({"@geometry-type":`groundoverlay`},Bn(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`description`]),xr(e),wr(e,t),cr(e),rr(e),br(e,n),Sr(e),Cr(e))};i?.bbox&&(o.bbox=i.bbox),o.properties?.visibility!==void 0&&(o.properties.visibility=o.properties.visibility!==`0`);let s=e.getAttribute(`id`);return s!==null&&s!==``&&(o.id=s),o}function jr(e){let t=K(e,`Region`);return t?{coordinateBox:Nr(t),lod:Mr(e)}:null}function Mr(e){let t=K(e,`Lod`);return t?[J(t,`minLodPixels`)??-1,J(t,`maxLodPixels`)??-1,J(t,`minFadeExtent`)??null,J(t,`maxFadeExtent`)??null]:null}function Nr(e){let t=K(e,`LatLonAltBox`);if(t){let e=J(t,`north`),n=J(t,`west`),r=J(t,`east`),i=J(t,`south`);if(Tr(K(t,`altitudeMode`)||K(t,`gx:altitudeMode`))&&console.debug(`Encountered an unsupported feature of KML for togeojson: please contact developers for support of altitude mode.`),typeof e==`number`&&typeof i==`number`&&typeof n==`number`&&typeof r==`number`)return{bbox:[n,i,r,e],geometry:{type:`Polygon`,coordinates:[[[n,e],[r,e],[r,i],[n,i],[n,e]]]}}}return null}function Pr(e){let t=K(e,`Link`);return t?Bn(t,[`href`,`refreshMode`,`refreshInterval`,`viewRefreshMode`,`viewRefreshTime`,`viewBoundScale`,`viewFormat`,`httpQuery`]):{}}function Fr(e,t,n,r){let i=jr(e),a=i?.coordinateBox?.geometry||null;if(!a&&r.skipNullGeometry)return null;let o={type:`Feature`,geometry:a,properties:Object.assign({"@geometry-type":`networklink`},Bn(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`styleUrl`,`refreshVisibility`,`flyToView`,`description`]),xr(e),wr(e,t),cr(e),rr(e),br(e,n),Sr(e),Cr(e),Pr(e),i?.lod?{lod:i.lod}:{})};i?.coordinateBox?.bbox&&(o.bbox=i.coordinateBox.bbox),o.properties?.visibility!==void 0&&(o.properties.visibility=o.properties.visibility!==`0`);let s=e.getAttribute(`id`);return s!==null&&s!==``&&(o.id=s),o}function Ir(e){return e.length===0?null:e.length===1?e[0]:{type:`GeometryCollection`,geometries:e}}function Lr(e,t,n,r){let{coordTimes:i,geometries:a}=_r(e),o=Ir(a);if(!o&&r.skipNullGeometry)return null;let s={type:`Feature`,geometry:o,properties:Object.assign(Bn(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`description`]),xr(e),wr(e,t),cr(e),br(e,n),Sr(e),Cr(e),i.length?{coordinateProperties:{times:i.length===1?i[0]:i}}:{})};s.properties?.visibility!==void 0&&(s.properties.visibility=s.properties.visibility!==`0`);let c=e.getAttribute(`id`);return c!==null&&c!==``&&(s.id=c),s}function Rr(e){let t=e.getAttribute(`id`),n=e.parentNode;return!t&&Vn(n)&&n.localName===`CascadingStyle`&&(t=n.getAttribute(`kml:id`)||n.getAttribute(`id`)),In(t||``)}function zr(e){let t={};for(let n of W(e,`Style`))t[Rr(n)]=cr(n);for(let n of W(e,`StyleMap`)){let e=In(n.getAttribute(`id`)||``);Rn(n,`styleUrl`,n=>{n=In(n),t[n]&&(t[e]=t[n])})}return t}function Br(e){let t={};for(let n of W(e,`SimpleField`))t[n.getAttribute(`name`)||``]=yr[n.getAttribute(`type`)||``]||yr.string;return t}function*Vr(e,t={skipNullGeometry:!1}){let n=e,r=zr(n),i=Br(n);for(let e of W(n,`Placemark`)){let n=Lr(e,r,i,t);n&&(yield n)}for(let e of W(n,`GroundOverlay`)){let n=Ar(e,r,i,t);n&&(yield n)}for(let e of W(n,`NetworkLink`)){let n=Fr(e,r,i,t);n&&(yield n)}}function Hr(e,t={skipNullGeometry:!1}){return{type:`FeatureCollection`,features:Array.from(Vr(e,t))}}var Ur={bytes:20971520,positions:2e5},Wr=(e,t=Ur)=>e>t.bytes?{refused:`tooLarge`,size:e,limit:t.bytes}:null,Gr=e=>new DOMParser().parseFromString(e,`application/xml`),Kr=e=>!e?.documentElement||e.getElementsByTagName(`parsererror`).length>0,qr=e=>({type:`Feature`,...e.id!==void 0&&{id:e.id},properties:e.properties&&typeof e.properties==`object`?e.properties:{},geometry:e.geometry??null}),Jr=new Set([`Point`,`MultiPoint`,`LineString`,`MultiLineString`,`Polygon`,`MultiPolygon`,`GeometryCollection`]),Yr=e=>{let t;try{t=JSON.parse(e)}catch{return null}return t?.type===`FeatureCollection`&&Array.isArray(t.features)?{type:`FeatureCollection`,features:t.features.filter(e=>e?.type===`Feature`).map(qr)}:t?.type===`Feature`?{type:`FeatureCollection`,features:[qr(t)]}:Jr.has(t?.type)?{type:`FeatureCollection`,features:[qr({geometry:t})]}:null},Xr=[`Style`,`StyleMap`,`styleUrl`],Zr=e=>(Xr.forEach(t=>{Array.from(e.getElementsByTagName(t)).forEach(e=>e.parentNode?.removeChild(e))}),e),Qr=e=>{let t=e.properties?.description;return t&&typeof t==`object`&&`value`in t?{...e,properties:{...e.properties,description:String(t.value??``)}}:e},$r=e=>({type:`FeatureCollection`,features:Hr(Zr(e),{skipNullGeometry:!0}).features.map(Qr).map(qr)}),ei=e=>({type:`FeatureCollection`,features:$n(e).features.map(qr)}),ti=(e,t)=>{let n;try{n=t(e)}catch{return null}if(Kr(n))return null;let r=n.documentElement.localName??n.documentElement.nodeName;return r===`kml`?{format:`kml`,collection:$r(n)}:r===`gpx`?{format:`gpx`,collection:ei(n)}:null},ni=e=>{let[t,n]=e;return!Number.isFinite(t)||!Number.isFinite(n)?`unreadable`:Math.abs(t)>180||Math.abs(n)>90?`notDegrees`:null},ri=(e,t=``)=>{let n=new Uint8Array(e,0,Math.min(4,e.byteLength));return n[0]===80&&n[1]===75&&(n[2]===3&&n[3]===4||n[2]===5&&n[3]===6)?`zip`:n[0]===0&&n[1]===0&&n[2]===39&&n[3]===10?`shp`:/\.(dbf|shx|prj|cpg)$/i.test(t)?`part`:`text`},ii=({format:e,collection:t},n)=>{let r=t.features.map(e=>({feature:e,positions:Se(e.geometry)})).filter(({positions:e})=>e.length>0);if(r.length===0)return{refused:`empty`};let i=r.reduce((e,t)=>e+t.positions.length,0);if(i>n.positions)return{refused:`tooManyPoints`,count:i,limit:n.positions};for(let e of r)for(let t of e.positions){let e=ni(t);if(e)return{refused:e}}return{format:e,collection:{type:`FeatureCollection`,features:r.map(({feature:e})=>e)},positions:i}},ai=(e,{parse:t=Gr,limits:n=Ur}={})=>{let r=String(e??``).replace(/^﻿/,``).trimStart(),i=null;try{if(r.startsWith(`{`)){let e=Yr(r);i=e&&{format:`geojson`,collection:e}}else r.startsWith(`<`)&&(i=ti(r,t))}catch(e){console.warn(`perun-atlas: a file could not be read`,e),i=null}return i?ii(i,n):{refused:`unreadable`}},oi=e=>{let t=new Set(e.flatMap(({collection:e})=>e.features.flatMap(e=>Object.keys(e?.properties??{})))),n=`layer`;for(let e=2;t.has(n);e+=1)n=`layer_${e}`;return n},si=(e,{limits:t=Ur}={})=>{if(e.refused)return e;let n=e.layers.length>1?oi(e.layers):null,r=e.layers.flatMap(({name:e,collection:t})=>t.features.map(t=>{let r=qr(t);return n?{...r,properties:{[n]:e,...r.properties}}:r})),i=e.layers.some(e=>e.assumed),a=ii({format:`shapefile`,collection:{type:`FeatureCollection`,features:r}},t);return a.refused===`notDegrees`&&i?{refused:`noPrj`}:a.refused?a:{...a,assumed:i}},ci=i({FILE_LIMITS:()=>Ur,SYSTEM_FIELDS:()=>s,bboxIn:()=>B,bindPath:()=>b,crsFor:()=>De,descriptorOf:()=>Je,fetchGeometry:()=>qe,fetchLayers:()=>at,fetchRows:()=>lt,fetchSchema:()=>ft,fetchUISchema:()=>pt,fileKind:()=>ri,fillBody:()=>Nt,firstOf:()=>ot,fromDegrees:()=>Ne,identifiersOf:()=>Tt,identityOf:()=>Ye,inDegrees:()=>Me,latLngOf:()=>je,mapPositions:()=>we,matchesIdentity:()=>Xe,pickFields:()=>mt,pointIn:()=>V,positionsOf:()=>Se,postTo:()=>Pt,readFile:()=>ai,readLayers:()=>si,ringIn:()=>Re,sizeRefusal:()=>Wr,spanTo:()=>Ct,toCSV:()=>Wt,toGeoJSON:()=>It,toKML:()=>Qt,toShapefile:()=>Fn,unitsPerMetre:()=>Pe,usableUI:()=>bt,valueAt:()=>v,withGroups:()=>ht,withinCircle:()=>wt}),li=(e,t,n)=>n>t?(Math.min(Math.max(e,t),n)-t)/(n-t):0,ui=e=>e<=10?1:e<=20?2:5,di=(e,t)=>{if(!Number.isFinite(e)||!Number.isFinite(t)||!(t>e))return[];let n=ui(t-e+1),r=[];for(let i=Math.ceil(e);i<=t;i+=1){let a=(i-e)%n===0;r.push({zoom:i,offset:li(i,e,t),labelled:i===e||i===t||a&&t-i>=n})}return r},fi=(e,t,n)=>!Number.isFinite(t)||!Number.isFinite(n)||!(n>t)?[]:(e??[]).filter(e=>Number.isFinite(e?.from)).map(e=>({mark:e,to:e.to??e.from})).filter(({mark:e,to:r})=>r>=t&&e.from<=n).map(({mark:e,to:r})=>{let i=li(e.from,t,n),a=li(Math.max(r,e.from),t,n);return{...e,from:Math.min(Math.max(e.from,t),n),to:Math.min(Math.max(r,t),n),offset:i,span:a-i}}),pi=.0254/96,mi=(e,t)=>!(e>0)||!(t>0)?null:e/t/pi,hi=e=>{if(!(e>0)||!Number.isFinite(e))return null;let t=10**(Math.floor(Math.log10(e))-1);return Math.round(e/t)*t},gi=e=>{let t=hi(e);return t===null?null:`1:${String(Math.max(Math.round(t),1)).replace(/\B(?=(\d{3})+(?!\d))/g,`\xA0`)}`},_i=[24,24],{createContext:vi,useContext:yi}=t.React,bi=vi(null),X=()=>yi(bi)??R.Map,{factory:xi}=R,{useLayoutEffect:Si}=t.React,Ci=({credit:e})=>{let t=X();return Si(()=>{let n=xi.control.attribution({prefix:!1}).addTo(t);return e&&n.addAttribution(e),()=>{n.remove()}},[t,e]),null};Ci.propTypes={credit:t.PropTypes.string};var wi=e=>{let t=e?.getLatLngs?.()??[];return Array.isArray(t[0])?t[0]:t},Ti=(e,t,n,r)=>{let i=wi(t);if(e===`radius`){let e=t?.getRadius?.();return Number.isFinite(e)?`${r.asDistance(e)} · ${r.asArea(r.circleArea(e))}`:null}if(e===`angle`){let e=r.anglesAlong(i).filter(Number.isFinite);return e.length?e.map(r.asAngle).join(`, `):i.length===2?r.asBearing(r.bearing(i[0],i[1])):null}let a=e===`area`?r.area(i):r.distance(i);if(!Number.isFinite(a)||a===0)return null;n[e]+=a;let o=e===`area`?r.asArea:r.asDistance;return`${o(a)}   (Σ ${o(n[e])})`},Ei=(e,t)=>e!==void 0&&`geolocation`in e&&t?.isSecureContext!==!1,Di=e=>e===`unavailable`?`explain`:e===`found`||e===`outside`||e===`error`?`clear`:`locate`,Oi=(e,t,n)=>e?.[t]?t:n,{factory:ki}=R,{useEffect:Ai,useLayoutEffect:ji,useState:Mi}=t.React,Ni=null,Pi=()=>(Ni||(Ni=ki.Control.extend({onAdd(){return this.options.container}})),Ni),Fi=(e,t=!0)=>{let n=X(),[r]=Mi(()=>ki.DomUtil.create(`div`,`leaflet-control`));return ji(()=>{if(!t)return;let i=new(Pi())({position:e,container:r}).addTo(n);return()=>{i.remove()}},[n,e,t,r]),r},Ii=({position:e,shown:n=!0,children:r})=>t.ReactDOM.createPortal(r,Fi(e,n)),Li=({what:e})=>(Ai(()=>{console.warn(`perun-atlas: the engine on this environment has no ${e}; skipping it.`)},[e]),null),Ri=e=>{e&&(ki.DomEvent.disableClickPropagation(e),ki.DomEvent.disableScrollPropagation(e))},Z=(e,n)=>t.redux.store.getState().intl?.messages?.[`perun.spatial.${e}`]||n;function Q(e){let t=document.createElement(`style`);t.textContent=e,document.head.insertBefore(t,document.head.firstChild)}Q(`/* ------------------- */
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
`);var{setting:zi}=ve,{util:Bi}=R,{readout:Vi}=be,{useEffect:Hi,useMemo:Ui,useRef:Wi,useState:Gi}=t.React,Ki={latitude:[`latitude`,`Lat`],longitude:[`longitude`,`Lng`],abscissa_x:[`abscissa_x`,`X`],ordinate_y:[`ordinate_y`,`Y`]},qi=e=>{let t=e.getCRS();return{code:t?.code,label:t?.desc||t?.code,project:t=>e.transform(t),unproject:t=>e.untransform(t)}},Ji=e=>{try{return e.getCenter()}catch{return zi(`center`)}},Yi=({position:e=`bottomcenter`,precision:n,systems:r})=>{let i=X();return typeof Vi?.resolve==`function`?t.React.createElement(Ii,{position:Oi(i._controlCorners,e,`bottomleft`)},t.React.createElement(Xi,{precision:n,systems:r})):t.React.createElement(Li,{what:`coordinate readout`})};Yi.propTypes={position:t.PropTypes.string,precision:t.PropTypes.number,systems:t.PropTypes.array};var Xi=({precision:e=5,systems:n})=>{let r=X(),[i,a]=Gi(()=>Ji(r)),[o,s]=Gi(null),[c,l]=Gi(null),[u,d]=Gi(!1),[f,p]=Gi(!1),[m,h]=Gi(()=>r.getCRS()?.code);Hi(()=>{let e=()=>h(r.getCRS()?.code);return r.on(`viewreset`,e),()=>r.off(`viewreset`,e)},[r]);let g=Ui(()=>Vi.resolve(n??zi(`coordinateSystems`),qi(r),e),[n,e,m,r]),_=g.find(e=>e.key===o)??g[0],v=Ui(()=>Bi.throttle(e=>a(e.latlng),100),[]);Hi(()=>{if(!c)return r.on(`mousemove`,v),()=>r.off(`mousemove`,v)},[c,v,r]);let y=Wi(null);Hi(()=>()=>clearTimeout(y.current),[]);let b=_?c??_.toText(i):[``,``],x=(e,t)=>{d(!1),l(b.map((n,r)=>r===e?t:n))},S=()=>{let e=_?.toLatLng(b);if(!e||!Vi.inside(e,zi(`bounds`))){d(!0);return}d(!1),l(null),r.setView(e,r.getZoom())},C=e=>{e.key===`Enter`&&(e.preventDefault(),S()),e.key===`Escape`&&(l(null),d(!1),e.target.blur())};return _?t.React.createElement(`div`,{id:`coordinates-control`,className:`coordinates-control`,onBlur:e=>{e.currentTarget.contains(e.relatedTarget)||(l(null),d(!1))}},g.length>1&&t.React.createElement(`select`,{className:`coordinates-control__system`,value:_.key,onChange:e=>{s(e.target.value),l(null)},"aria-label":Z(`coordinate_system`,`Coordinate system`)},g.map(e=>t.React.createElement(`option`,{key:e.key,value:e.key},e.label))),t.React.createElement(`div`,{className:`coordinates-control__pair`},b.map((e,n)=>{let[r,i]=Ki[_.axes[n]]??[``,``];return t.React.createElement(`label`,{className:`coordinates-control__field`,key:_.axes[n]},t.React.createElement(`span`,{className:`coordinates-control__axis`},Z(r,i)),t.React.createElement(`input`,{type:`text`,className:`coordinates-control__value`,value:e,spellCheck:`false`,autoComplete:`off`,"aria-invalid":u||void 0,onChange:e=>x(n,e.target.value),onKeyDown:C,onFocus:e=>{l(b),e.target.select()}}))})),t.React.createElement(`button`,{type:`button`,className:`coordinates-control__copy`,onClick:()=>{let e=navigator.clipboard?.writeText?.(b.join(`, `));e&&e.then(()=>{p(!0),clearTimeout(y.current),y.current=setTimeout(()=>p(!1),1500)}).catch(()=>{})},title:Z(`copy`,`Copy`),"aria-label":Z(`copy`,`Copy`)},f?`✓`:`⧉`),u&&t.React.createElement(`div`,{className:`coordinates-control__rejected`,role:`status`},Z(`outside_bounds`,`Outside this map`))):null};Xi.propTypes={precision:t.PropTypes.number,systems:t.PropTypes.array};var Zi={plus:[`M12 5l0 14`,`M5 12l14 0`],minus:[`M5 12l14 0`],maximize:[`M4 8v-2a2 2 0 0 1 2 -2h2`,`M4 16v2a2 2 0 0 0 2 2h2`,`M16 4h2a2 2 0 0 1 2 2v2`,`M16 20h2a2 2 0 0 0 2 -2v-2`],minimize:[`M15 19v-2a2 2 0 0 1 2 -2h2`,`M15 5v2a2 2 0 0 0 2 2h2`,`M5 15h2a2 2 0 0 1 2 2v2`,`M5 9h2a2 2 0 0 0 2 -2v-2`],"zoom-scan":[`M4 8v-2a2 2 0 0 1 2 -2h2`,`M4 16v2a2 2 0 0 0 2 2h2`,`M16 4h2a2 2 0 0 1 2 2v2`,`M16 20h2a2 2 0 0 0 2 -2v-2`,`M8 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0`,`M16 16l-2.5 -2.5`]},Qi=1.75,$i=(e,t={})=>{let n=Zi[e];if(!n)return``;let{className:r=`atlas-icon atlas-icon--${e}`,size:i=18,stroke:a=Qi}=t;return`<svg xmlns="http://www.w3.org/2000/svg" class="${r}" width="${i}" height="${i}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${a}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">`+n.map(e=>`<path d="${e}"/>`).join(``)+`</svg>`},{factory:ea}=R,{useLayoutEffect:ta}=t.React,na=({position:e=`topleft`})=>{let t=X();return ta(()=>{if(!ea.control.fullscreen)return;let n=ea.control.fullscreen({position:e,content:$i(`maximize`)+$i(`minimize`)}).addTo(t);return()=>{n._toggleState&&t.off(`enterFullscreen exitFullscreen`,n._toggleState,n),n.remove()}},[t,e]),null};na.propTypes={position:t.PropTypes.string};var{layerControl:ra}=ye,{useLayoutEffect:ia}=t.React,aa=({basemap:e,overlays:t})=>{let n=X();return ia(()=>{let r=ra(e,t,{collapsed:!0}).addTo(n);return()=>{n.off(`click`,r.collapse,r),r.remove()}},[n,e,t]),null};aa.propTypes={basemap:t.PropTypes.object,overlays:t.PropTypes.object},Q(`/* -------------- */
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
`);var{setting:oa}=ve,{factory:sa}=R,{readout:ca}=be,{useCallback:la,useEffect:ua,useRef:da,useState:fa}=t.React,{Icon:pa}=t.elements,ma=()=>Ei(typeof navigator>`u`?void 0:navigator,typeof window>`u`?void 0:window),ha=({position:e=`topleft`,maxZoom:n})=>typeof ca?.inside==`function`?t.React.createElement(Ii,{position:e},t.React.createElement(ga,{maxZoom:n})):t.React.createElement(Li,{what:`locate control`});ha.propTypes={position:t.PropTypes.string,maxZoom:t.PropTypes.number};var ga=({maxZoom:e=16})=>{let n=X(),[r,i]=fa(ma()?`idle`:`unavailable`),[a,o]=fa(null),s=da(null);ua(()=>{let e=sa.layerGroup().addTo(n);return s.current=e,()=>{n.stopLocate(),e.clearLayers(),n.removeLayer(e),s.current=null}},[n]);let c=la(()=>{s.current?.clearLayers(),o(null),i(ma()?`idle`:`unavailable`)},[]);ua(()=>{let t=t=>{let r=s.current;if(r){if(r.clearLayers(),sa.circleMarker(t.latlng,{radius:5,weight:2,color:`#1a73e8`,fillColor:`#1a73e8`,fillOpacity:1}).addTo(r),Number.isFinite(t.accuracy)&&t.accuracy>0&&sa.circle(t.latlng,{radius:t.accuracy,weight:1,color:`#1a73e8`,fillColor:`#1a73e8`,fillOpacity:.12}).addTo(r),ca.inside(t.latlng,oa(`bounds`))){n.setView(t.latlng,Math.min(e,n.getMaxZoom())),i(`found`),o(null);return}i(`outside`),o(Z(`outside_bounds`,`You are outside this map`))}},r=e=>{i(`error`),o(Z(`geolocation_failed`,`Could not find your position`)+(e?.message?` — ${e.message}`:``))};return n.on(`locationfound`,t),n.on(`locationerror`,r),()=>{n.off(`locationfound`,t),n.off(`locationerror`,r)}},[n,e]);let l=()=>{let e=Di(r);if(e===`explain`){o(Z(`geolocation_insecure`,`Your position is only available over https`));return}if(e===`clear`){c();return}i(`locating`),o(null),n.locate({setView:!1,enableHighAccuracy:!0,timeout:1e4})},u=r===`unavailable`||r===`error`?`IconCurrentLocationOff`:`IconCurrentLocation`;return t.React.createElement(`div`,{className:`locate-control`},t.React.createElement(`div`,{className:`leaflet-bar`},t.React.createElement(`button`,{type:`button`,className:`locate-control__button${r===`locating`?` is-busy`:``}${r===`found`?` is-found`:``}`,onClick:l,title:Z(`geolocation`,`Show my position`),"aria-label":Z(`geolocation`,`Show my position`),"aria-busy":r===`locating`||void 0},t.React.createElement(pa,{name:u,size:18,stroke:1.75,"aria-hidden":`true`}),t.React.createElement(`span`,{className:`locate-control__fallback`,"aria-hidden":`true`},`◎`))),a&&t.React.createElement(`div`,{className:`locate-control__message`,role:`status`},a))};ga.propTypes={maxZoom:t.PropTypes.number},Q(`/* --------------- */
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
`);var{MEASURE_AREA:_a,MEASURE_RADIUS:va,MEAUSURE_LENGTH:ya}=ve,{factory:ba}=R,{measure:xa}=be,{useCallback:Sa,useEffect:Ca,useMemo:wa,useRef:Ta,useState:Ea}=t.React,{Icon:Da}=t.elements,Oa={measure:`M`,length:`L`,area:`A`,radius:`R`,angle:`∠`,erase:`⌫`},ka=({icon:e,mark:n})=>t.React.createElement(t.React.Fragment,null,t.React.createElement(Da,{name:e,size:18,stroke:1.75,"aria-hidden":`true`}),t.React.createElement(`span`,{className:`measure-control__fallback`,"aria-hidden":`true`},n));ka.propTypes={icon:t.PropTypes.string.isRequired,mark:t.PropTypes.string};var $={length:{shape:`line`,options:ya,icon:`IconRuler2`,fallback:`Length`},area:{shape:`polygon`,options:_a,icon:`IconPolygon`,fallback:`Area`},radius:{shape:`circle`,options:va,icon:`IconCircleDot`,fallback:`Radius`},angle:{shape:`line`,options:ya,icon:`IconAngle`,fallback:`Angle`}},Aa=({position:e=`topleft`,tools:n,expanded:r})=>typeof xa?.anglesAlong==`function`&&be.draw?t.React.createElement(Ii,{position:e},t.React.createElement(ja,{tools:n,expanded:r})):t.React.createElement(Li,{what:`measurement control`});Aa.propTypes={position:t.PropTypes.string,tools:t.PropTypes.array,expanded:t.PropTypes.bool};var ja=({tools:e=[`length`,`area`,`radius`,`angle`],expanded:n=!1})=>{let r=X(),i=wa(()=>r.draw??be.draw,[r]),[a,o]=Ea(n),[s,c]=Ea(null),[l,u]=Ea([]),d=wa(()=>e.filter(e=>$[e]),[e]),f=Ta(null);Ca(()=>{let e=ba.layerGroup().addTo(r);return f.current=e,()=>{e.clearLayers(),r.removeLayer(e),f.current=null}},[r]);let p=Ta({length:0,area:0}),m=s?$[s]:null,h=Sa(()=>{Object.values($).forEach(({shape:e})=>i[e]?.disable(`force`)),c(null)},[i]);Ca(()=>{if(!m)return;let e=e=>{let t=e?.layer;if(!t)return;f.current?.addLayer(t);let n=Ti(s,t,p.current,xa);n&&u(e=>[{tool:s,reading:n,at:Date.now()},...e].slice(0,3)),i[$[s].shape]?.isEnabled?.()||c(null)};return r.on(`new_shape`,e),()=>r.off(`new_shape`,e)},[m,s,r,i]),Ca(()=>h,[h]);let g=e=>{if(s===e){h();return}h(),c(e),i[$[e].shape]?.enable($[e].options)},_=()=>{h(),f.current?.clearLayers(),p.current={length:0,area:0},u([])};return d.length?a?t.React.createElement(`div`,{className:`measure-control`},t.React.createElement(`div`,{className:`measure-control__tools leaflet-bar`,role:`group`,"aria-label":Z(`measure`,`Measure`)},d.map(e=>t.React.createElement(`button`,{key:e,type:`button`,className:`measure-control__tool${s===e?` is-active`:``}`,onClick:()=>g(e),title:Z(e,$[e].fallback),"aria-label":Z(e,$[e].fallback),"aria-pressed":s===e},t.React.createElement(ka,{icon:$[e].icon,mark:Oa[e]}))),t.React.createElement(`span`,{className:`measure-control__divider`,"aria-hidden":`true`}),t.React.createElement(`button`,{type:`button`,className:`measure-control__tool`,onClick:_,title:Z(`erase`,`Clear`),"aria-label":Z(`erase`,`Clear`)},t.React.createElement(ka,{icon:`IconEraser`,mark:Oa.erase})),t.React.createElement(`button`,{type:`button`,className:`measure-control__tool measure-control__close`,onClick:()=>{_(),o(!1)},title:Z(`cancel`,`Close`),"aria-label":Z(`cancel`,`Close`),"aria-expanded":`true`},`×`)),l.length>0&&t.React.createElement(`dl`,{className:`measure-control__readout`,"aria-live":`polite`},l.map(({tool:e,reading:n,at:r})=>t.React.createElement(`div`,{className:`measure-control__line`,key:r},t.React.createElement(`dt`,null,Z(e,$[e].fallback)),t.React.createElement(`dd`,null,n))))):t.React.createElement(`div`,{className:`measure-control measure-control--closed`},t.React.createElement(`div`,{className:`leaflet-bar`},t.React.createElement(`button`,{type:`button`,className:`measure-control__toggle`,onClick:()=>o(!0),title:Z(`measure`,`Measure`),"aria-label":Z(`measure`,`Measure`),"aria-expanded":`false`},t.React.createElement(ka,{icon:`IconRulerMeasure`,mark:Oa.measure})))):null};ja.propTypes={tools:t.PropTypes.array,expanded:t.PropTypes.bool};var{factory:Ma}=R,{useLayoutEffect:Na}=t.React,Pa=140,Fa=({position:e=`bottomleft`,units:t,ratio:n=!0})=>{let r=X();return Na(()=>{let i=t!==`imperial`,a=Ma.control.scale({position:e,metric:i,imperial:!i,maxWidth:Pa}).addTo(r);if(!n)return()=>{a.remove()};let o=Ma.DomUtil.create(`div`,`atlas-scale-ratio`,a.getContainer()),s=()=>{let e=r.getSize(),t=Math.round(e.y/2),n=Math.min(e.x,Pa),i=r.distance(r.containerPointToLatLng(Ma.point(0,t)),r.containerPointToLatLng(Ma.point(n,t)));o.textContent=gi(mi(i,n))??``};return r.on(`move zoomend`,s),s(),()=>{r.off(`move zoomend`,s),a.remove()}},[r,e,t,n]),null};Fa.propTypes={position:t.PropTypes.string,units:t.PropTypes.string,ratio:t.PropTypes.bool},Q(`/*
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
`);var{useEffect:Ia,useMemo:La,useState:Ra}=t.React,za={in:`Zoom in`,out:`Zoom out`,level:`Zoom level`,upscaled:`Above here the basemap is enlarged, not sharper`,fit:`Zoom to the data`},Ba=0,Va=e=>`${(e*100).toFixed(4)}%`,Ha=({name:e})=>t.React.createElement(`svg`,{className:`atlas-icon atlas-icon--${e}`,width:18,height:18,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:Qi,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,focusable:`false`},Zi[e].map(e=>t.React.createElement(`path`,{key:e,d:e})));Ha.propTypes={name:t.PropTypes.oneOf(Object.keys(Zi)).isRequired};var Ua=({position:e=`bottomright`,marks:n=[],labels:r,onFit:i})=>{let a={...za,...r},o=X(),[s]=Ra(()=>(Ba+=1,`atlas-zoom-marks-${Ba}`)),[c,l]=Ra(()=>({min:o.getMinZoom(),max:o.getMaxZoom()})),[u,d]=Ra(()=>o.getZoom());Ia(()=>{let e=()=>d(o.getZoom()),t=()=>{l({min:o.getMinZoom(),max:o.getMaxZoom()}),e()};return o.on(`zoomend`,e),o.on(`zoomlevelschange`,t),t(),()=>{o.off(`zoomend`,e),o.off(`zoomlevelschange`,t)}},[o]);let{min:f,max:p}=c,m=La(()=>di(f,p),[f,p]),h=La(()=>fi(n,f,p),[n,f,p]),g=Math.round(u),_=h.filter(e=>e.label).map(e=>e.label).join(`. `),v=t.React.createElement(`div`,{className:`atlas-zoom`},i&&t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step atlas-zoom__fit`,onClick:i,title:a.fit,"aria-label":a.fit},t.React.createElement(Ha,{name:`zoom-scan`})),t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step`,onClick:()=>o.zoomIn(),disabled:g>=p,title:a.in,"aria-label":a.in},t.React.createElement(Ha,{name:`plus`})),m.length>1&&t.React.createElement(`div`,{className:`atlas-zoom__rail`},t.React.createElement(`div`,{className:`atlas-zoom__track`}),h.map(e=>t.React.createElement(`span`,{key:`${e.kind??`mark`}-${e.from}-${e.to}`,className:`atlas-zoom__mark atlas-zoom__mark--${e.kind??`plain`}`,style:{bottom:Va(e.offset),height:Va(e.span)},title:e.label})),m.map(e=>t.React.createElement(`span`,{key:e.zoom,className:[`atlas-zoom__rung`,e.labelled?`atlas-zoom__rung--numbered`:``,e.zoom===g?`atlas-zoom__rung--here`:``].filter(Boolean).join(` `),style:{bottom:Va(e.offset)}},e.labelled?t.React.createElement(`i`,{className:`atlas-zoom__number`},e.zoom):null)),t.React.createElement(`input`,{type:`range`,className:`atlas-zoom__slider`,min:f,max:p,step:1,value:Math.min(Math.max(g,f),p),onChange:e=>o.setZoom(Number(e.target.value)),"aria-label":a.level,"aria-describedby":_?s:void 0}),_?t.React.createElement(`p`,{className:`atlas-zoom__described`,id:s},_):null),t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step`,onClick:()=>o.zoomOut(),disabled:g<=f,title:a.out,"aria-label":a.out},t.React.createElement(Ha,{name:`minus`})),t.React.createElement(`output`,{className:`atlas-zoom__level`,title:a.level},g));return t.React.createElement(Ii,{position:e},t.React.createElement(`div`,{className:`atlas-zoom__host`,ref:Ri},v))};Ua.propTypes={position:t.PropTypes.string,marks:t.PropTypes.array,labels:t.PropTypes.object,onFit:t.PropTypes.func};var{factory:Wa}=R,{useEffect:Ga,useLayoutEffect:Ka,useRef:qa}=t.React,Ja=({position:e=`bottomright`,fit:t=!0,extent:n=null,labels:r})=>{let i=X(),a=r?.fit??za.fit,o=qa(n);o.current=n;let s=qa(null);return Ka(()=>{let n=Wa.control.zoom({position:e,zoomInText:$i(`plus`),zoomOutText:$i(`minus`)}).addTo(i);if(t){let e=n.getContainer(),t=Wa.DomUtil.create(`a`,`atlas-fit`);t.href=`#`,t.title=a,t.setAttribute(`role`,`button`),t.setAttribute(`aria-label`,a),t.innerHTML=$i(`zoom-scan`),t.style.display=o.current?``:`none`,Wa.DomEvent.disableClickPropagation(t),Wa.DomEvent.on(t,`click`,Wa.DomEvent.stop),Wa.DomEvent.on(t,`click`,()=>{o.current&&i.fitBounds(o.current,{padding:_i})}),e.insertBefore(t,e.firstChild),s.current=t}return()=>{n.remove(),s.current=null}},[i,e,t,a]),Ga(()=>{s.current&&(s.current.style.display=n?``:`none`)},[n]),null};Ja.propTypes={position:t.PropTypes.string,fit:t.PropTypes.bool,extent:t.PropTypes.array,labels:t.PropTypes.object},Q(`/*
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
`);var{useEffect:Ya,useMemo:Xa,useRef:Za,useState:Qa}=t.React,$a=({session:e,overrides:n,layerSwitcher:r=!1,zoomControl:i=!0,zoomPosition:a=`bottomright`,zoomMarks:o,zoomLabels:s,fit:c=!0,extent:l=null,view:u=null,coordinates:d=!0,coordinatesPosition:f=`bottomcenter`,measure:p=!0,measurePosition:m=`topleft`,measureTools:h,fullscreen:g=!0,fullscreenPosition:_=`topleft`,locate:v=!0,locatePosition:y=`topleft`,scale:b=!0,scalePosition:x=`bottomleft`,scaleRatio:S=!0,className:C=`atlas-map`,style:w,onReady:ee,onError:T,children:E})=>{let D=Za(null),O=Za(null),[k,te]=Qa(null),[A,j]=Qa(null),M=A!==null,[N,ne]=Qa(null),[re,ie]=Qa(null);Ya(()=>{let t=!1;if(typeof R.createMap!=`function`){let e=Error(`perun-atlas: this map needs spatial 4.2.1 or later, which builds a map per screen with createMap. The spatial on this page has no createMap, so no map is shown.`);ne(e),T?.(e);return}return(async()=>{try{let r=await ge(n);if(t)return;We(r);let i=document.createElement(`div`);i.style.height=`100%`,i.style.width=`100%`,D.current?.appendChild(i);let a=R.createMap(i,{center:u?.center??r.center,zoom:u?.zoom??r.zoom,minZoom:r.minZoom,maxZoom:r.maxZoom});O.current=a,te({map:a,config:r});let{basemap:o,overlays:s}=await at(e,{maxZoom:r.maxZoom});if(t)return;let c=st(o,u?.basemap)??ot(o);c&&c.addTo(a);let l=e=>ie(e?.options?.maxNativeZoom??null);l(c),a.on(`baselayerchange`,e=>l(e.layer)),a.invalidateSize(),ee?.({map:a,config:r,basemap:o,overlays:s}),j({basemap:o,overlays:s})}catch(e){if(t)return;console.error(e),ne(e),T?.(e)}})(),()=>{t=!0;let e=O.current;if(O.current=null,e){let t=e.getContainer();e.remove(),e.off(),t.parentNode?.removeChild(t)}}},[]),Ya(()=>{let e=D.current;if(!e||typeof ResizeObserver>`u`)return;let t=null,n=new ResizeObserver(e=>{let n=e[0]?.contentRect;n&&n.width!==0&&n.height!==0&&(t!==null&&cancelAnimationFrame(t),t=requestAnimationFrame(()=>{t=null,O.current?.invalidateSize()}))});return n.observe(e),()=>{t!==null&&cancelAnimationFrame(t),n.disconnect()}},[M]);let P=Xa(()=>[...re===null?[]:[{from:re,to:1/0,kind:`upscaled`,label:s?.upscaled??za.upscaled}],...o??[]],[re,o,s]);if(N)return t.React.createElement(`div`,{className:`${C} atlas-map-error`,role:`alert`},N.message);let F=k?.config;return t.React.createElement(bi.Provider,{value:k?.map??null},t.React.createElement(`div`,{ref:D,className:C,style:{height:`100%`,...w}}),k&&t.React.createElement(t.React.Fragment,null,g&&t.React.createElement(na,{position:_}),v&&t.React.createElement(ha,{position:y}),t.React.createElement(Ci,{credit:F.attribution}),i&&i!==`rail`&&t.React.createElement(Ja,{position:a,fit:c,extent:l,labels:s}),b&&t.React.createElement(Fa,{position:x,units:F.units,ratio:S}),d&&t.React.createElement(Yi,{position:f}),p&&t.React.createElement(Aa,{position:m,tools:h})),M&&r&&t.React.createElement(aa,{basemap:A.basemap,overlays:A.overlays}),M&&i===`rail`&&t.React.createElement(Ua,{position:a,marks:P,labels:s,onFit:c&&l?()=>k.map.fitBounds(l,{padding:_i}):void 0}),M&&E)},{useEffect:eo,useRef:to}=t.React,no=e=>{let t=to(e);t.current=e;let n=to(null);return eo(()=>{n.current?.(e)},[JSON.stringify(e)]),{hiddenRef:t,filterRef:n}},ro=(e,t)=>{e&&t&&Object.entries(t).forEach(([t,n])=>{t.startsWith(`--`)?e.style.setProperty(t,n):e.style[t]=n})},io=e=>e instanceof Node?e:document.createTextNode(String(e)),ao=(e,t,n)=>{let r=n.startsWith(`text/csv`)?`﻿`:``,i=URL.createObjectURL(new Blob([r,t],{type:n})),a=document.createElement(`a`);a.href=i,a.download=e,a.style.display=`none`,document.body.appendChild(a),a.click(),a.remove(),setTimeout(()=>URL.revokeObjectURL(i),0)},oo=async(e,t=document.body)=>{if(window.isSecureContext&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{}let n=document.createElement(`textarea`);n.value=e,n.setAttribute(`readonly`,``),n.setAttribute(`aria-hidden`,`true`),Object.assign(n.style,{position:`fixed`,top:`0`,left:`0`,opacity:`0`}),t.appendChild(n),n.select();let r=!1;try{r=document.execCommand(`copy`)}catch{r=!1}return n.remove(),r},so=(e,t=[])=>{let n=new Set(t),r=[],i=[];return e.forEach(e=>{let t=n.has(e.key);t!==!!e.hidden&&(e.hidden=t,(t?r:i).push(e))}),{leaving:r,returning:i}},co=(e,t)=>{let n=e.filter(({hidden:e})=>!e);n.forEach(({layer:e})=>e.bringToFront?.()),n.forEach(({layer:e})=>t?.get(e)?.bringToFront?.())},lo=(e,t=[],n)=>{let r=e?.features;if(!Array.isArray(r)||!t.length)return e;let i=new Set(t),a=r.filter(e=>!i.has(n(e)));return a.length===r.length?e:{...e,features:a}},uo=e=>{let t=e.filter(e=>!e.hidden),n=1/0,r=1/0,i=-1/0,a=-1/0,o=({lat:e,lng:t})=>{n=Math.min(n,e),r=Math.min(r,t),i=Math.max(i,e),a=Math.max(a,t)};return(t.length?t:e).forEach(({layer:e})=>{if(typeof e.getBounds==`function`){let t=e.getBounds();t?.isValid?.()&&(o(t.getSouthWest()),o(t.getNorthEast()))}else typeof e.getLatLng==`function`&&o(e.getLatLng())}),n===1/0?null:[[n,r],[i,a]]},fo=({title:e,rows:t},n={})=>{let r=document.createElement(`div`);if(r.className=[`atlas-popup`,n.className].filter(Boolean).join(` `),ro(r,n.style),e){let t=document.createElement(`p`);t.className=`atlas-popup-title`,t.textContent=e,ro(t,n.titleStyle),r.appendChild(t)}if(t.length){let e=document.createElement(`dl`);e.className=`atlas-popup-fields`,t.forEach(({label:t,value:r})=>{let i=document.createElement(`dt`);i.textContent=t,ro(i,n.labelStyle);let a=document.createElement(`dd`);a.textContent=r,ro(a,n.valueStyle),e.append(i,a)}),r.appendChild(e)}return r},po=(e,t,{popup:n,labelResolver:r}={})=>{if(n){let t=n(e);return t==null?null:io(t)}let i=h(t,e,r);return i?fo(i,t?.popup):null},mo={className:`atlas-popup-shell`,maxWidth:280},{factory:ho}=R,{useEffect:go,useRef:_o}=t.React,vo=[],yo=({servicePath:e,context:t,reload:n,srid:r,statusRows:i,join:a,field:o,palette:s,fallback:c,descriptor:u,hidden:d=vo,onFeatureClick:f,onLegend:p,onShown:m,onLoadStart:h,onLoad:_,onError:v,tooltip:y,popup:b,labelResolver:x})=>{let S=X(),C=_o(null),w=_o(0),{hiddenRef:ee,filterRef:T}=no(d);return go(()=>{let n=!1,d=N({field:o,palette:s,fallback:c}),E=re({field:o,palette:s}),D=async()=>{let c=++w.current;k={zoom:S.getZoom(),bounds:S.getBounds()};try{h?.();let v=await qe(e,{...t||{},map:{...t?.map||{},bbox:B(r,S)}});if(n||c!==w.current)return;let D=a&&i?ie(v,i,a):v;C.current&&S.removeLayer(C.current);let O=[],k=ho.geoJSON(D,{crs:S.getCRS(),style:e=>l(u,{fillColor:d(e)}),onEachFeature:(e,t)=>{O.push({layer:t,feature:e,key:E(e),hidden:!1});let n=y?.(e);n&&t.bindTooltip(io(n),{sticky:!0});let r=po(e,u,{popup:b,labelResolver:x});r&&t.bindPopup(r,mo),f&&t.on(`click`,()=>f(e,g(u,e,x)))}}),te=e=>{let{leaving:t,returning:n}=so(O,e);return t.forEach(({layer:e})=>k.removeLayer(e)),n.forEach(({layer:e})=>k.addLayer(e)),n.length&&co(O),t.length>0||n.length>0};te(ee.current),C.current=k.addTo(S);let A=e=>m?.(lo(D,e,E));T.current=e=>{te(e)&&A(e)},p?.(ne(D?.features,{field:o,palette:s})),A(ee.current),_?.(D)}catch(e){console.error(`perun-atlas: choropleth failed to render`,e),!n&&c===w.current&&v?.(e)}},O=null,k=null,te=()=>!!k&&S.getZoom()===k.zoom&&k.bounds.contains(S.getBounds()),A=()=>{clearTimeout(O),O=setTimeout(()=>{te()||D()},250)};return D(),S.on(`moveend`,A),()=>{n=!0,T.current=null,clearTimeout(O),S.off(`moveend`,A),C.current&&(S.removeLayer(C.current),C.current=null)}},[S,e,o,r,n,i,JSON.stringify(t??{})]),null};Q(`/*
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
`);var{factory:bo}=R,{useEffect:xo,useRef:So}=t.React,Co=(e,...t)=>t.forEach(t=>{t.current&&(e.removeLayer(t.current),t.current=null)}),wo={color:`#b3261e`,weight:2,opacity:.95,fillColor:`#b3261e`,fillOpacity:.12},To={...wo,dashArray:`5 4`,fillOpacity:.06},Eo=({value:e,drawing:t=!1,onChange:n,onDrawn:r,style:i,editable:a=!0})=>{let o=X(),s=So(null),c=So(null),l=So(null),u=So(n);u.current=n;let d=So(r);return d.current=r,xo(()=>{let e=(o.draw??be?.draw)?.circle;if(!t||!e){!t&&e?.isEnabled?.()&&e.disable(),t&&!e&&console.warn(`perun-atlas: the engine on this environment has no circle draw tool; skipping it.`);return}let n=({shape:e,layer:t})=>{if(e!==`circle`||!t)return;let n=t.getLatLng(),r=t.getRadius();o.removeLayer(t);let i={lat:n.lat,lng:n.lng,radius:r};u.current?.(i),d.current?.(i)};return o.on(`new_shape`,n),e.enable({templineStyle:To,hintlineStyle:{...To,fillOpacity:0},pathOptions:{...wo,...i},cursorMarker:!0,tooltips:!1}),()=>{o.off(`new_shape`,n),e.isEnabled?.()&&e.disable()}},[o,t]),xo(()=>{if(!e||!(e.radius>0)){Co(o,s,c,l);return}let t=bo.latLng({lat:e.lat,lng:e.lng});if(s.current?(s.current.setLatLng(t),s.current.setRadius(e.radius)):s.current=bo.circle(t,{...wo,...i,radius:e.radius,showMeasurements:!0,interactive:!1}).addTo(o),!a){Co(o,c,l);return}let n=bo.latLng({lat:t.lat,lng:s.current.getBounds().getEast()});c.current?c.current.setLatLng(t):(c.current=bo.marker(t,{icon:bo.divIcon({className:`atlas-draw-handle atlas-draw-handle--centre`,html:``}),draggable:!0,zIndexOffset:1e3}).addTo(o),c.current.on(`drag`,e=>{let t=e.target.getLatLng();u.current?.({lat:t.lat,lng:t.lng,radius:s.current?.getRadius()})})),l.current?l.current.setLatLng(n):(l.current=bo.marker(n,{icon:bo.divIcon({className:`atlas-draw-handle atlas-draw-handle--edge`,html:``}),draggable:!0,zIndexOffset:1e3}).addTo(o),l.current.on(`drag`,e=>{let n=e.target.getLatLng(),r=c.current?.getLatLng()??t;u.current?.({lat:r.lat,lng:r.lng,radius:o.distance(r,n)})}))},[o,e?.lat,e?.lng,e?.radius,a]),xo(()=>()=>Co(o,s,c,l),[o]),null};Q(`/*
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
`);var{useMemo:Do}=t.React,Oo=({from:e,to:n,onChange:r,labels:i={},disabled:a=!1,className:o=`atlas-date-range`})=>{let s=Do(()=>({type:`object`,properties:{from:{type:`string`,format:`date`,title:i.from??`From`},to:{type:`string`,format:`date`,title:i.to??`To`}}}),[i.from,i.to]),c=Do(()=>({"ui:order":[`from`,`to`],"ui:submitButtonOptions":{norender:!0},from:{"ui:disabled":a},to:{"ui:disabled":a}}),[a]);return t.React.createElement(`div`,{className:o},t.React.createElement(t.Form,{idPrefix:`atlas-range`,schema:s,uiSchema:c,formData:{from:e,to:n},validator:t.validator,customValidate:(e,t)=>(e?.from&&e?.to&&e.from>e.to&&t.to.addError(i.invalidRange??`The end date is before the start date.`),t),liveValidate:!0,showErrorList:!1,noHtml5Validate:!0,onChange:({formData:e})=>r?.(e)},t.React.createElement(t.React.Fragment,null)))},{Icon:ko}=t.elements,{useState:Ao}=t.React,jo=({drawing:e,busy:n,onStart:r,onCancel:i,labels:a={}})=>t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn ${e?`atlas-panel__btn--primary`:`atlas-panel__btn--ghost`}`,"aria-pressed":e,onClick:e?i:r,disabled:n},t.React.createElement(ko,{name:`IconCircleDashed`,size:16,stroke:1.75,"aria-hidden":`true`}),a.draw??`Draw an area`),Mo=e=>`atlas-panel__drawbox${e?` atlas-panel__drawbox--off`:``}`,No=0,Po=()=>`atlas-draw-${No+=1}`,Fo=({shape:e,drawing:n,busy:r,onCancel:i,onRadius:a,onSave:o,note:s,form:c,caught:l,savable:u=!0,limits:d={},labels:f={}})=>{let{min:p=50,max:m=5e5,step:h=50}=d,g=!!e,[_]=Ao(Po),v=`${_}-form`,y=!!c?.schema,b=r||!g||s?.required&&!String(s.value??``).trim()||!(!c||c.schema),x=()=>{!b&&u&&o?.()};return t.React.createElement(`div`,{className:`atlas-panel__draw`,role:`group`,"aria-label":f.draw??`Draw`},n&&!g&&t.React.createElement(`p`,{className:`atlas-panel__drawhint`},f.drawing??`Click a centre, then an edge`),g&&t.React.createElement(`label`,{className:`atlas-panel__drawfield`},t.React.createElement(`span`,null,f.radius??`Radius`),t.React.createElement(`span`,{className:Mo(r)},t.React.createElement(`input`,{type:`number`,inputMode:`numeric`,value:Math.round(e.radius),min:p,max:m,step:h,disabled:r,onChange:e=>{let t=Number(e.target.value);Number.isFinite(t)&&t>0&&a(t)}}),t.React.createElement(`span`,{className:`atlas-panel__drawunit`},f.metres??`m`))),g&&c&&!c.schema&&t.React.createElement(`p`,{className:`atlas-panel__drawhint`},c.loading?f.formLoading??`Loading the fields…`:f.formFailed??`These fields did not load, so there is nothing to save into.`),g&&c?.schema&&t.React.createElement(`div`,{className:`atlas-panel__drawform`},t.React.createElement(t.Form,{id:v,idPrefix:_,schema:c.schema,uiSchema:{"ui:submitButtonOptions":{norender:!0},...c.uiSchema},formData:c.data,validator:t.validator,disabled:r,liveValidate:!1,showErrorList:!1,onChange:({formData:e})=>c.onChange?.(e),onSubmit:x},t.React.createElement(t.React.Fragment,null))),g&&s&&t.React.createElement(`label`,{className:`atlas-panel__drawfield atlas-panel__drawfield--wide`},t.React.createElement(`span`,null,f.note??`Note`),t.React.createElement(`span`,{className:Mo(r)},t.React.createElement(`input`,{type:`text`,value:s.value??``,disabled:r,placeholder:f.notePlaceholder??``,onChange:e=>s.onChange(e.target.value)}))),g&&l&&t.React.createElement(`p`,{className:`atlas-panel__drawcount`,"aria-live":`polite`},t.React.createElement(`b`,null,l.count),t.React.createElement(`span`,null,f.caught??`inside`),t.React.createElement(`span`,{className:`atlas-panel__drawtotal`},`/ ${l.total}`)),g&&t.React.createElement(`div`,{className:`atlas-panel__drawactions`},u&&t.React.createElement(`button`,{type:y?`submit`:`button`,form:y?v:void 0,className:`atlas-panel__btn atlas-panel__btn--primary`,onClick:y?void 0:x,disabled:b},t.React.createElement(ko,{name:`IconDeviceFloppy`,size:16,stroke:1.75,"aria-hidden":`true`}),f.save??`Save`),t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:i,disabled:r},f.discard??`Discard`)))},Io=({lat:e,lng:t})=>`${e.toFixed(6)},${t.toFixed(6)}`,Lo=(e,t,n)=>{let r=e.original.map(e=>{let r=t[Io(e)];if(!r)return e;let i=n(r);return i&&i!==r?i.getLatLng():e}),i=r.map(Io).join(` `);return i===e.key?null:{next:r,key:i}},Ro=e=>e<.5?4*e*e*e:1-(-2*e+2)**3/2,zo=(e,t,n)=>t.map((t,r)=>{let i=e[r];return i?{lat:i.lat+(t.lat-i.lat)*n,lng:i.lng+(t.lng-i.lng)*n}:t}),Bo=e=>Array.isArray(e?.[0])?e.map(Bo).reverse():[...e??[]].reverse(),Vo=({factory:e,group:t,into:n,arrowOf:r})=>{let i=new WeakMap;return t.eachLayer(t=>{let a=r(t.feature);if(!a||typeof t.getLatLngs!=`function`)return;let o=a.reverse?Bo(t.getLatLngs()):t;i.set(t,e.polylineDecorator(o,{patterns:[{offset:a.offset??`12%`,repeat:a.repeat??160,symbol:e.Symbol.arrowHead({pixelSize:a.pixelSize??12,polygon:!1,pathOptions:{stroke:!0,weight:2,color:t.options.color,opacity:1}})}]}).addTo(n))}),i},Ho=({map:e,surface:t,lines:n,markerAt:r,decoratorOf:i,glide:a})=>{let o=e=>t.getVisibleParent?.(e),s=(e,t)=>{e.layer.setLatLngs(t);let n=i?.get(e.layer);n&&n.setPaths(e.reverse?Bo(t):e.layer)},c=typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,l=null,u=[],d=()=>{l!==null&&cancelAnimationFrame(l),l=null,u=[]},f=e=>{d(),u=e;let t=e.map(({line:e})=>e.layer.getLatLngs()),n=performance.now(),r=i=>{let o=Math.min(1,(i-n)/a),c=Ro(o);e.forEach((e,n)=>s(e.line,zo(t[n],e.next,c))),o<1?l=requestAnimationFrame(r):(l=null,u=[],e.forEach(e=>s(e.line,e.next)))};l=requestAnimationFrame(r)},p=()=>{let e=[];if(n.forEach(t=>{let n=Lo(t,r,o);n&&(t.key=n.key,e.push({line:t,next:n.next}))}),!e.length)return;let t=new Set(e.map(({line:e})=>e)),i=[...u.filter(({line:e})=>!t.has(e)),...e];!a||c||i.length>150?(d(),i.forEach(e=>s(e.line,e.next))):f(i)};p(),t.on(`animationend`,p),e.on(`moveend`,p);let m=()=>{d(),t.off(`animationend`,p),e.off(`moveend`,p)};return m.reroute=p,m},Uo=(e,t,n,r)=>{let i=/Point$/.test(t.geometry?.type??``),a=(n.marker?.size??24)/2;return e.bindTooltip(io(r),{permanent:!0,direction:n.label?.direction??(i?`top`:`center`),offset:n.label?.offset??(i?[0,-a]:[0,0]),className:[`atlas-label`,n.label?.className].filter(Boolean).join(` `),opacity:1}),n.label?.style&&e.on(`tooltipopen`,e=>ro(e.tooltip.getElement(),n.label.style)),!!n.label?.scale},Wo=(e,t)=>{e.forEach(({layer:e,descriptor:n})=>{if(e._atlasHidden)return;let r=f(n,t);r!==e.isTooltipOpen()&&(r?e.openTooltip():e.closeTooltip())})},Go=280,Ko={chunkedLoading:!0,showCoverageOnHover:!1,spiderfyDistanceMultiplier:2},qo=[{upTo:9,name:`sm`,size:32},{upTo:99,name:`md`,size:38},{upTo:1/0,name:`lg`,size:46}],Jo=e=>{if(!e)return null;if(e===!0)return{from:0,options:{...Ko},badge:{},glide:Go};if(typeof e==`number`)return{from:e,options:{...Ko},badge:{},glide:Go};let{from:t=0,className:n,style:r,glide:i=Go,...a}=e;return{from:t,options:{...Ko,...a},badge:{className:n,style:r},glide:i===!0?Go:i}},Yo=(e,t={})=>{let n=qo.find(({upTo:t})=>e<=t)??qo[qo.length-1],r=document.createElement(`span`);return r.className=`atlas-cluster__count`,r.textContent=String(e),ro(r,t.style),{element:r,size:n.size,className:[`atlas-cluster`,`atlas-cluster--${n.name}`,t.className].filter(Boolean).join(` `)}},Xo=({map:e,factory:t,group:n,cluster:r,points:i})=>{let a=t.featureGroup().addTo(e),o=Jo(r),s=typeof t.markerClusterGroup==`function`;o!==null&&!s&&console.warn(`perun-atlas: clustering was configured, but the map engine on this deployment does not carry it`);let c=o!==null&&s&&i>=o.from,l=c?t.markerClusterGroup({...o.options,iconCreateFunction:e=>{let{element:n,size:r,className:i}=Yo(e.getChildCount(),o.badge);return t.divIcon({html:n,className:i,iconSize:[r,r]})}}):n;if(l.addTo(e),c){let e=[];n.eachLayer(t=>{t._atlasPinned?e.push(t):l.addLayer(t)}),e.forEach(e=>a.addLayer(e))}let u=c?t.featureGroup().addTo(e):l,d=e=>c&&e._atlasPinned?a:l;return{surface:l,arrows:u,clustering:c,settings:o,layers:u===l?[l,a]:[l,u,a],move:(e,t,n)=>{let r=[];e.forEach(({layer:e})=>{e._atlasHidden=!t;let i=d(e);c&&i===l?r.push(e):t?i.addLayer(e):i.removeLayer(e);let a=n?.get(e);a&&t?u.addLayer(a):a&&u.removeLayer(a)}),r.length&&(t?l.addLayers(r):l.removeLayers(r))}}};Q(`/*
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
`);var{factory:Zo}=R,{useEffect:Qo,useRef:$o}=t.React,es=[],ts=({servicePath:e,context:t,reload:n,descriptors:r={},descriptorFor:i,cluster:a,fit:o=!0,tooltip:s,popup:c,labelResolver:u,pinned:d,hidden:f=es,onFeatureClick:m,onLegend:h,onShown:_,onExtent:v,onLoadStart:y,onLoad:b,onError:x})=>{let S=X(),C=$o([]),w=$o([]),{hiddenRef:ee,filterRef:T}=no(f);return Qo(()=>{let n=!1,f=E({descriptors:r,nameOf:e=>i?.(e)??Je(e)}),{entryFor:D}=f,O=()=>Wo(w.current,S.getZoom()),k=()=>{w.current=[],C.current.forEach(e=>S.removeLayer(e)),C.current=[]},te=Object.create(null),A=[],j=[],M=e=>!!d?.(e),N=[];return(async()=>{try{y?.();let r=await qe(e,t);if(n)return;k();let i=0,d=Zo.geoJSON(r,{crs:S.getCRS(),pointToLayer:(e,t)=>{i+=1;let{marker:n={}}=D(e)??{},r=n.size??24,a=Zo.marker(t,{icon:Zo.divIcon({className:n.className??`atlas-marker`,iconSize:[r,r]})});return n.style&&a.on(`add`,()=>ro(a.getElement(),n.style)),te[Io(t)]=a,a._atlasPinned=M(e),a},style:e=>l(D(e)),onEachFeature:(e,t)=>{let n=D(e)??{};N.push({layer:t,feature:e,key:f.note(e),hidden:!1});let r=s?s(e):p(n,e);if(r&&Uo(t,e,n,r)&&w.current.push({layer:t,descriptor:n}),typeof t.getLatLngs==`function`){let e=t.getLatLngs();Array.isArray(e)&&e.length>=2&&!Array.isArray(e[0])&&A.push({layer:t,original:e.map(({lat:e,lng:t})=>Zo.latLng(e,t)),reverse:!!n.arrow?.reverse,key:null})}let i=n.details&&!c?null:po(e,n,{popup:c,labelResolver:u});i&&t.bindPopup(i,mo),m&&t.on(`click`,()=>m(e,g(n,e,u)))}}),x=Xo({map:S,factory:Zo,group:d,cluster:a,points:i}),{surface:E,clustering:ne,settings:re}=x;C.current=x.layers;let ie=Vo({factory:Zo,group:d,into:x.arrows,arrowOf:e=>D(e)?.arrow}),P=e=>{let{leaving:t,returning:n}=so(N,e);return x.move(t,!1,ie),x.move(n,!0,ie),n.length&&co(N,ie),t.length>0||n.length>0},F=e=>{_?.(lo(r,e,e=>f.kindOf(e).key)),v?.(uo(N))};P(ee.current);let I=null;ne&&A.length&&(I=Ho({map:S,surface:E,lines:A,markerAt:te,decoratorOf:ie,glide:re.glide}),j.push(I)),h?.(f.drawn()),O(),S.on(`zoomend`,O),ne&&S.on(`moveend`,O);let ae=uo(N);o&&ae&&S.fitBounds(ae,{padding:_i}),T.current=e=>{P(e)&&(I?.reroute(),O(),F(e))},F(ee.current),b?.(r)}catch(e){if(n)return;console.error(`perun-atlas: feature set failed to render`,e),x?.(e)}})(),()=>{n=!0,T.current=null,j.forEach(e=>e()),S.off(`zoomend`,O),S.off(`moveend`,O),k()}},[S,e,JSON.stringify(t??{}),n]),null},ns=`#e8590c`,rs={className:`atlas-overlay`,color:ns,weight:2.5,opacity:1,dashArray:`6 5`,fillColor:ns,fillOpacity:.08},is={className:`atlas-overlay atlas-overlay--point`,radius:5,color:ns,weight:2.5,opacity:1,fillColor:`#ffffff`,fillOpacity:.85},as=e=>({key:ee,label:e,kind:`line`,path:rs,marker:null,arrow:null}),os=e=>e==null||e===``||typeof e==`object`?null:String(e),ss=(e,t,n)=>{let r=e?.properties??{},i=os(r.name),a=Object.entries(r).filter(([e])=>i===null||e!==`name`).map(([e,t])=>({field:e,label:n?.(e.toLowerCase())||e,value:os(t)})).filter(e=>e.value!==null);return{title:i??t,rows:a,spec:{className:`atlas-panel__details--file`}}},cs=e=>`${Number((e/1048576).toFixed(1))} MB`,ls=e=>new Intl.NumberFormat().format(e),us=(e,t={})=>b(e===1?t.fileFeature??`{count} feature`:t.fileFeatures??`{count} features`,{count:ls(e)}),ds=(e,t={})=>b(t.fileOpening??`Opening {name}…`,{name:e}),fs=(e,t={})=>b(t.fileAssumedDegrees??`{name} has no .prj, so its coordinates were read as longitude and latitude (WGS 84).`,{name:e}),ps={unreadable:[`fileUnreadable`,`{name} could not be read as GeoJSON, KML, GPX or a shapefile.`],empty:[`fileEmpty`,`{name} has nothing in it to draw.`],notDegrees:[`fileNotDegrees`,`{name} is not in longitude and latitude, so it cannot be placed on the map.`],tooLarge:[`fileTooLarge`,`{name} is {size}. Files up to {limit} can be opened.`],tooManyPoints:[`fileTooManyPoints`,`{name} has {count} points. Files with up to {limit} points can be opened.`],tooLargeUnzipped:[`fileTooLargeUnzipped`,`{name} is over {limit} once unzipped, and {limit} is the most that can be opened.`],noShapefile:[`fileNoShapefile`,`{name} holds no shapefile.`],shapefilePart:[`fileShapefilePart`,`{name} is one part of a shapefile and holds no shapes. Open the .zip holding all its parts, or its .shp.`],noPrj:[`fileNoPrj`,`{name} has no .prj, and its coordinates are not longitude and latitude, so nothing says where it belongs. Open it zipped with its .prj.`],unknownProjection:[`fileUnknownProjection`,`The projection in {name}'s .prj could not be read. Save it in WGS 84 (EPSG:4326) and open it again.`],noDatumShift:[`fileNoDatumShift`,`{name} is in {crs}, and its .prj does not say how to shift that to WGS 84, so it would land in the wrong place. Save it in WGS 84 (EPSG:4326) and open it again.`],readerUnavailable:[`fileReaderUnavailable`,`The shapefile reader could not be loaded, so {name} was not opened. Try again.`]},ms=(e,t,n={})=>{let[r,i]=ps[e?.refused]??ps.unreadable,a={name:t};return e?.refused===`tooLarge`&&(a.size=cs(e.size),a.limit=cs(e.limit)),e?.refused===`tooLargeUnzipped`&&(a.limit=cs(e.limit)),e?.refused===`tooManyPoints`&&(a.count=ls(e.count),a.limit=ls(e.limit)),e?.refused===`noDatumShift`&&(a.crs=e.crs||`a projection`),b(n[r]??i,a)};Q(`/*
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
`);var{factory:hs}=R,{useEffect:gs,useRef:_s}=t.React,vs=`atlasFilePoints`,ys=620,bs=e=>(e.getPane(vs)||(e.createPane(vs).style.zIndex=String(ys)),vs),xs=({file:e,srid:t,hidden:n=!1,labelResolver:r,onFeatureClick:i,onDrawn:a,onError:o})=>{let s=X(),c=_s(null),l=_s(n);l.current=n;let u=_s({});u.current={labelResolver:r,onFeatureClick:i,onDrawn:a,onError:o};let d=_s(null);return gs(()=>{if(!e)return;let n;try{n=hs.geoJSON(Ne(e.collection,t,s),{crs:s.getCRS(),pointToLayer:(e,t)=>hs.circleMarker(t,{...is,pane:bs(s)}),style:e=>/Point$/.test(e?.geometry?.type??``)?is:rs,onEachFeature:(t,n)=>{n.on(`click`,()=>{let{labelResolver:n,onFeatureClick:r}=u.current;r?.(t,{...ss(t,e.name,n),file:e})})}})}catch(e){console.error(`perun-atlas: a file could not be drawn`,e),u.current.onError?.(e);return}if(c.current=n,l.current||n.addTo(s),d.current!==e){d.current=e;let t=n.getBounds();t.isValid()&&s.fitBounds(t,{padding:_i})}return u.current.onDrawn?.(),()=>{s.removeLayer(n),c.current=null}},[s,e,t]),gs(()=>{let e=c.current;e&&(n?s.removeLayer(e):s.hasLayer(e)||e.addTo(s))},[s,n]),null};Q(`/*
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
`);var{useEffect:Ss,useRef:Cs,useState:ws}=t.React,Ts=({marker:e})=>{let n=Cs(null);return Ss(()=>{let t=n.current;t&&(ro(t,e?.style),t.style.width=`12px`,t.style.height=`12px`)},[e]),t.React.createElement(`span`,{ref:n,className:[`atlas-legend__point`,e?.className].filter(Boolean).join(` `),"aria-hidden":`true`})};Ts.propTypes={marker:t.PropTypes.object};var Es=({path:e,arrow:n})=>{let r=e?.color??`#4A5C66`,i=Array.isArray(e?.dashArray)?e.dashArray.join(` `):e?.dashArray,a=n?.reverse?`3,6 9,3 9,9`:`21,6 15,3 15,9`;return t.React.createElement(`svg`,{className:`atlas-legend__swatch`,width:`24`,height:`12`,viewBox:`0 0 24 12`,"aria-hidden":`true`},t.React.createElement(`line`,{className:e?.className,x1:`2`,y1:`6`,x2:`22`,y2:`6`,stroke:r,strokeWidth:Math.min(e?.weight??1,4),strokeDasharray:i||void 0,strokeOpacity:e?.opacity??1,strokeLinecap:`round`}),n&&t.React.createElement(`polygon`,{points:a,fill:r,fillOpacity:e?.opacity??1}))};Es.propTypes={path:t.PropTypes.object,arrow:t.PropTypes.object};var Ds=({path:e})=>t.React.createElement(`svg`,{className:`atlas-legend__swatch`,width:`24`,height:`12`,viewBox:`0 0 24 12`,"aria-hidden":`true`},t.React.createElement(`rect`,{x:`4`,y:`1`,width:`16`,height:`10`,fill:e?.fillColor??`#B8C6CC`,fillOpacity:e?.fillOpacity??.55,stroke:e?.color??`#4A5C66`,strokeWidth:Math.min(e?.weight??1,2),strokeOpacity:e?.opacity??1}));Ds.propTypes={path:t.PropTypes.object};var Os=({entry:e})=>e.kind===`point`?t.React.createElement(Ts,{marker:e.marker}):e.kind===`line`?t.React.createElement(Es,{path:e.path,arrow:e.arrow}):t.React.createElement(Ds,{path:e.path});Os.propTypes={entry:t.PropTypes.object.isRequired};var ks=({entries:e=[],title:n,open:r=!0,hidden:i=[],onToggle:a,onShowAll:o,showAllLabel:s,className:c=``})=>{let[l,u]=ws(r);if(!S(e,i))return null;let d=n??`Legend`,f=e.some(e=>i.includes(e.key));return t.React.createElement(`div`,{className:`atlas-legend ${c}`.trim()},t.React.createElement(`button`,{type:`button`,className:`atlas-legend__toggle`,onClick:()=>u(!l),"aria-expanded":l},t.React.createElement(`span`,{className:`atlas-legend__title`},d),t.React.createElement(`span`,{className:`atlas-legend__chevron`,"aria-hidden":`true`},l?`−`:`+`)),l&&t.React.createElement(`ul`,{className:`atlas-legend__list`},e.map(e=>{let n=t.React.createElement(t.React.Fragment,null,t.React.createElement(Os,{entry:e}),t.React.createElement(`span`,{className:`atlas-legend__label`},e.label));return t.React.createElement(`li`,{className:`atlas-legend__row`,key:e.key},a?t.React.createElement(`button`,{type:`button`,className:`atlas-legend__item`,"aria-pressed":!i.includes(e.key),onClick:()=>a(e.key)},n):n)})),l&&o&&f&&t.React.createElement(`button`,{type:`button`,className:`atlas-legend__reset`,onClick:o},s??`Show all`))};ks.propTypes={entries:t.PropTypes.array,title:t.PropTypes.string,open:t.PropTypes.bool,hidden:t.PropTypes.array,onToggle:t.PropTypes.func,onShowAll:t.PropTypes.func,showAllLabel:t.PropTypes.string,className:t.PropTypes.string};var As=({entries:e=[],title:n,open:r,hidden:i=[],onToggle:a,onShowAll:o,showAllLabel:s,position:c=`bottomleft`})=>{let l=S(e,i);return t.React.createElement(Ii,{position:c,shown:l},t.React.createElement(`div`,{className:`atlas-legend__host`,ref:Ri},t.React.createElement(ks,{entries:e,title:n,open:r,hidden:i,onToggle:a,onShowAll:o,showAllLabel:s})))};As.propTypes={entries:t.PropTypes.array,title:t.PropTypes.string,open:t.PropTypes.bool,hidden:t.PropTypes.array,onToggle:t.PropTypes.func,onShowAll:t.PropTypes.func,showAllLabel:t.PropTypes.string,position:t.PropTypes.string};var js=({className:e=`atlas-panel__close`,label:n,title:r,onClick:i})=>t.React.createElement(`button`,{type:`button`,className:e,"aria-label":n,title:r,onClick:i},`×`),Ms=({timeScoped:e,longest:n,preset:r,applyPreset:i,onClose:a,labels:o={}})=>t.React.createElement(`div`,{className:`atlas-panel__empty`},t.React.createElement(`div`,{className:`atlas-panel__emptycard`},t.React.createElement(`div`,{className:`atlas-panel__emptytitle`},o.empty??(e?`Nothing in this range`:`Nothing to show`)),o.emptyHint&&t.React.createElement(`div`,{className:`atlas-panel__emptybody`},o.emptyHint),e&&n&&r!==n.months&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--primary`,onClick:()=>i(n.months)},[o.widen??`Try`,n.label].filter(Boolean).join(` `)),t.React.createElement(js,{label:o.close??`Close`,title:o.close??`Close`,onClick:a}))),{Icon:Ns}=t.elements,Ps=[{offer:`geojson`,icon:`IconJson`,label:`exportGeoJSON`,fallback:`GeoJSON`,save:`saveGeoJSON`},{offer:`csv`,icon:`IconFileTypeCsv`,label:`exportCsv`,fallback:`CSV`,save:`saveCSV`},{offer:`kml`,icon:`IconWorld`,label:`exportKml`,fallback:`KML`,save:`saveKML`},{offer:`shp`,icon:`IconFileTypeZip`,label:`exportShp`,fallback:`Shapefile`,save:`saveShapefile`}],Fs=({exporter:e,labels:n={}})=>t.React.createElement(t.React.Fragment,null,Ps.filter(({offer:t})=>e.offer[t]!==!1).map(({offer:r,icon:i,label:a,fallback:o,save:s})=>t.React.createElement(`button`,{key:r,type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:e[s]},t.React.createElement(Ns,{name:i,size:16,stroke:1.75,"aria-hidden":`true`}),n[a]??o))),{Icon:Is}=t.elements,Ls=({fileOverlay:e,labels:n={}})=>{let{offered:r,file:i,inputRef:a,choose:o,onPicked:s,close:c}=e;return t.React.createElement(t.React.Fragment,null,r&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:o},t.React.createElement(Is,{name:`IconFolderOpen`,size:16,stroke:1.75,"aria-hidden":`true`}),n.openFile??`Open file`),r&&t.React.createElement(`input`,{ref:a,type:`file`,className:`atlas-panel__fileinput`,accept:`.geojson,.json,.kml,.gpx,.zip,.shp`,tabIndex:-1,"aria-hidden":`true`,onChange:s}),i&&t.React.createElement(`div`,{className:`atlas-panel__file`},t.React.createElement(Es,{path:rs}),t.React.createElement(`span`,{className:`atlas-panel__filename`,title:i.name},i.name),t.React.createElement(`span`,{className:`atlas-panel__filecount`},us(i.count,n)),t.React.createElement(js,{className:`atlas-panel__fileclose`,label:n.closeFile??`Close file`,title:n.closeFile??`Close file`,onClick:c})))},Rs=({fileOverlay:e,labels:n={}})=>{let{note:r,refusal:i,dismiss:a,dismissNote:o}=e;return t.React.createElement(t.React.Fragment,null,r&&t.React.createElement(`p`,{className:`atlas-panel__filenote`,role:`status`},t.React.createElement(`span`,null,r),t.React.createElement(js,{className:`atlas-panel__fileclose`,label:n.close??`Close`,onClick:o})),i&&t.React.createElement(`p`,{className:`atlas-panel__filerefused`,role:`alert`},t.React.createElement(`span`,null,i),t.React.createElement(js,{className:`atlas-panel__fileclose`,label:n.close??`Close`,onClick:a})))},{Icon:zs}=t.elements,Bs=({viewLink:e,labels:n={}})=>t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:t=>e.copy(t.currentTarget)},t.React.createElement(zs,{name:e.copied?`IconCheck`:`IconLink`,size:16,stroke:1.75,"aria-hidden":`true`}),e.copied?n.linkCopied??`Link copied`:n.copyLink??`Copy link`),Vs=({saving:e,opening:n,labels:r={}})=>t.React.createElement(`div`,{className:`atlas-panel__loading`,role:`status`,"aria-live":`polite`},t.React.createElement(`div`,{className:`atlas-panel__loadingcard`},t.React.createElement(`div`,{className:`atlas-panel__spinner`,"aria-hidden":`true`}),t.React.createElement(`span`,null,e?r.saving??`Saving…`:n?ds(n,r):r.loading??`Loading…`))),Hs=({timeScoped:e,range:n,initial:r,applyPreset:i,onClose:a,labels:o={}})=>t.React.createElement(`div`,{className:`atlas-panel__footer`},e&&t.React.createElement(`div`,{className:`atlas-panel__summary`},`${n.from} → ${n.to}`),t.React.createElement(`div`,{className:`atlas-panel__actions`},e&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:()=>i(r)},o.reset??`Reset range`),a&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--dark`,onClick:a},o.close??`Close`))),Us=({record:e,onClose:n,labels:r={}})=>t.React.createElement(`aside`,{className:[`atlas-panel__details`,e.spec?.className].filter(Boolean).join(` `),style:e.spec?.style,"aria-label":r.details??`Details`},t.React.createElement(`div`,{className:`atlas-panel__detailshead`},t.React.createElement(`div`,{className:`atlas-panel__detailstitle`,style:e.spec?.titleStyle},e.title??r.details??`Details`),t.React.createElement(js,{label:r.close??`Close`,onClick:n})),t.React.createElement(`dl`,{className:`atlas-panel__detailsbody`},e.rows.map(({field:n,label:r,value:i})=>t.React.createElement(`div`,{key:n,className:`atlas-panel__detailsrow`},t.React.createElement(`dt`,{style:e.spec?.labelStyle},r),t.React.createElement(`dd`,{style:e.spec?.valueStyle},i))))),Ws=({range:e,onRangeChange:n,presets:r=[],preset:i,applyPreset:a,labels:o={}})=>t.React.createElement(t.React.Fragment,null,t.React.createElement(Oo,{from:e.from,to:e.to,onChange:n,labels:{from:o.from,to:o.to,invalidRange:o.invalidRange}}),r.length>0&&t.React.createElement(`div`,{className:`atlas-panel__segmented`},r.map(({months:e,label:n})=>t.React.createElement(`button`,{key:e,type:`button`,"aria-pressed":i===e,onClick:()=>a(e)},n)))),{useEffect:Gs,useMemo:Ks,useState:qs}=t.React,Js=({choropleth:e,bindings:t,bindingKey:n})=>{let r=!!e,[i,a]=qs(null),o=r?e.status:null;return Gs(()=>{if(!o)return;let e=!1;return lt(o,t).then(t=>{e||a(t)}),()=>{e=!0}},[o,n]),{coloured:r,statusPath:o,rows:i,tooltip:Ks(()=>{let t=e?.tooltip;if(!t)return;let n=y(t);return e=>n(e?.properties)??null},[e])}},Ys=e=>e.toISOString().slice(0,10),Xs=()=>Ys(new Date),Zs=e=>{let t=new Date;return t.setMonth(t.getMonth()-e),Ys(t)},Qs=e=>({from:Zs(e),to:Xs()}),$s=(e,t)=>e?.from===t?.from&&e?.to===t?.to,{useState:ec}=t.React,tc=({presets:e=[],defaultMonths:t,servicePath:n,opening:r,onMoved:i})=>{let a=t??e[e.length-1]?.months??12,[o,s]=ec(r?null:a),[c,l]=ec(()=>r??Qs(a)),u=/\{(from|to)\}/.test(n??``),d=(e,t)=>{s(t),!$s(e,c)&&(l(e),i?.())};return{timeScoped:u,preset:o,range:c,applyPreset:e=>d(Qs(e),e),onRangeChange:e=>d(e,null),longest:e[e.length-1],initial:a}},{useEffect:nc,useMemo:rc,useState:ic}=t.React,ac=(e,t)=>e?b(e,t??{}):null,oc=e=>({path:typeof e==`string`?e:null,inline:e&&typeof e==`object`?e:null}),sc=({form:e,bindings:t})=>{let{path:n,inline:r}=oc(e?.schema),i=oc(e?.uiSchema),a=ac(n,t),o=ac(i.path,t),[s,c]=ic(null),[l,u]=ic(null),[d,f]=ic(!!(n||i.path)),[p,m]=ic(!1);nc(()=>{if(!n&&!i.path){c(null),u(null),f(!1);let t=!!e&&!r;t&&console.error("perun-atlas: draw.form needs `schema` -- either the schema itself, or the path to a service that answers with one. Got",e?.schema),m(t);return}let a=!1;return f(!0),m(!1),Promise.all([n?ft(n,t):Promise.resolve(null),i.path?pt(i.path,t):Promise.resolve(null)]).then(([e,t])=>{a||(c(e),u(t),m(!!n&&!e),f(!1))}),()=>{a=!0}},[n,a,i.path,o,!!e,!!r]);let h=rc(()=>mt(n?s:r,e?.pick),[s,r,n,e?.pick?.join(`\0`)??null]);return{schema:h,uiSchema:rc(()=>bt(i.path?l:i.inline,h)??void 0,[l,i.inline,i.path,h]),loading:d,failed:p}},{useMemo:cc}=t.React,lc={id:`{pkid}`,join:`,`},uc=({set:e,shape:t,dataSrid:n,select:r,map:i})=>{let a=r===!0?lc:r?{...lc,...r}:null,{mode:o,id:s,join:c}=a??{},l=!!a&&a.export!==!1;return cc(()=>{if(!a)return{selecting:!1,feedsExport:!1,count:0,total:0,inside:[],radius:null,has:()=>!1,metres:()=>null,context:null};let r=wt(e,t,{srid:n,mode:o,map:i});return{selecting:!0,feedsExport:l,count:r.inside.length,total:r.total,inside:r.inside,radius:t?.radius??null,has:r.has,metres:r.metres,context:{count:r.inside.length,total:r.total,ids:Tt(r.inside,{id:s,join:c}),geojson:{type:`FeatureCollection`,features:r.inside}}}},[e,t,n,i,o,s,c,l,!!a])},{useMemo:dc,useState:fc}=t.React,{alertUserResponse:pc}=t.elements,mc=(e,t)=>e?.type?void 0:t?`success`:`error`,hc=({draw:e,dataSrid:n,set:r,bindings:i,labels:a={},map:o})=>{let s=!!(e?.save?.onSave||e?.select),[c,l]=fc(!1),[u,d]=fc(null),[f,p]=fc(``),[m,h]=fc(!1),[g,_]=fc(0),[v,y]=fc(()=>e?.form?.data??{}),b=sc({form:e?.form,bindings:i}),x=dc(()=>b.schema?t.validator.validateFormData(ht(v,b.schema),b.schema)?.errors??[]:[],[v,b.schema]),S=uc({set:r,shape:u,dataSrid:n,select:e?.select,map:o}),C=()=>{l(!1),d(null),p(``),y(e?.form?.data??{})};return{drawable:s,drawing:c,shape:u,selection:S,note:f,form:e?.form?{schema:b.schema,uiSchema:b.uiSchema,data:v,errors:x,onChange:y,loading:b.loading,failed:b.failed}:void 0,saving:m,reload:g,setShape:d,setNote:p,startDrawing:()=>l(!0),finishDrawing:()=>l(!1),clearDrawing:C,saveShape:async()=>{if(!u||m)return;if(e.form&&!b.schema){console.error(`perun-atlas: nothing sent -- this row configures a form and its fields are not loaded.`);return}if(x.length){pc({type:`error`,response:a.saveIncomplete??`Some of these fields are mandatory and are empty. Nothing was sent.`}),console.error(`perun-atlas: nothing sent -- the form is not answerable as it stands:`,x.map(e=>`${e.property??``} ${e.message??``}`.trim()).join(`; `));return}let{context:t,units:r,tooSmall:s}=Ft(u,{draw:e,dataSrid:n,bindings:i,note:f,selected:S.context,form:v,map:o});if(s){pc({type:`error`,response:a.saveTooSmall??`This deployment stores geometry in EPSG:${n??`?`}, where ${Math.round(u.radius)} m is less than one unit. Nothing was sent.`}),console.error(`perun-atlas: a radius of ${Math.round(u.radius)} m is ${r} units in EPSG:${n}, which rounds to zero. A projection measured in degrees cannot carry an integer radius: send {draw.metres} for the size and {draw.ring} for the shape instead.`),console.error(`perun-atlas: the configured path is`,e.save.onSave);return}h(!0);let c=await Pt(e.save.onSave,t,{body:e.save.body===void 0?void 0:Nt(e.save.body,t),contentType:e.save.contentType,encoding:e.save.encoding,failure:e.save.failure});h(!1),c.ok&&(C(),_(e=>e+1)),pc({response:c.data||c.message,type:mc(c.data,c.ok)})}}},gc=(()=>{let e=new Uint32Array(256);for(let t=0;t<256;t+=1){let n=t;for(let e=0;e<8;e+=1)n=n&1?3988292384^n>>>1:n>>>1;e[t]=n>>>0}return e})(),_c=e=>{let t=4294967295;for(let n=0;n<e.length;n+=1)t=gc[(t^e[n])&255]^t>>>8;return(t^4294967295)>>>0},vc=async e=>{if(typeof CompressionStream>`u`)return null;let t;try{t=new CompressionStream(`deflate-raw`)}catch{return null}return new Uint8Array(await new Response(new Blob([e]).stream().pipeThrough(t)).arrayBuffer())},yc=e=>e.getHours()<<11|e.getMinutes()<<5|e.getSeconds()>>1,bc=e=>Math.max(e.getFullYear()-1980,0)<<9|e.getMonth()+1<<5|e.getDate(),xc=2048,Sc=0,Cc=8,wc=async(e,{now:t=new Date,compress:n=!0}={})=>{let r=new TextEncoder,i=yc(t),a=bc(t),o=[];for(let{name:t,bytes:i}of e){let e=n?await vc(i):null,a=e&&e.length<i.length?e:i;o.push({name:r.encode(t),method:a===i?Sc:Cc,crc:_c(i),size:i.length,packed:a})}let s=o.reduce((e,t)=>e+30+t.name.length+t.packed.length+46+t.name.length,22),c=new Uint8Array(s),l=new DataView(c.buffer),u=0,d=e=>{l.setUint16(u,e,!0),u+=2},f=e=>{l.setUint32(u,e,!0),u+=4},p=e=>{c.set(e,u),u+=e.length},m=e=>{d(20),d(xc),d(e.method),d(i),d(a),f(e.crc),f(e.packed.length),f(e.size),d(e.name.length),d(0)};o.forEach(e=>{e.offset=u,f(67324752),m(e),p(e.name),p(e.packed)});let h=u;o.forEach(e=>{f(33639248),d(20),m(e),d(0),d(0),d(0),f(0),f(e.offset),p(e.name)});let g=u-h;return f(101010256),d(0),d(0),d(o.length),d(o.length),f(g),f(h),d(0),c},Tc=({set:e,selection:t,exportable:n,labelResolver:r,timeScoped:i,range:a,srid:o,map:s,drawnWith:c})=>{let l=n===!1?null:n&&n!==!0?n:{},u=!!(t?.selecting&&t.feedsExport&&t.count>0),d=u?{type:`FeatureCollection`,features:t.inside}:e,f=l&&d&&(d.features?.length??0)>0,p=[l?.filename??`features`,u?`within-${Math.round(t.radius??0)||`shape`}`:null,i?`${a.from}_${a.to}`:Xs()].filter(Boolean).join(`-`),h=()=>Me(d,o,s),g=e=>{let t=l?.name?v(e?.properties,l.name):null;return t==null||t===``?m(c?.(e),e):String(t)},_={fields:l?.fields,exclude:l?.exclude,labelResolver:r};return{offer:l,canExport:f,saveGeoJSON:()=>ao(`${p}.geojson`,It(h()),`application/geo+json`),saveCSV:()=>ao(`${p}.csv`,Wt(h(),_),`text/csv;charset=utf-8`),saveKML:()=>ao(`${p}.kml`,Qt(h(),{..._,nameOf:g}),`application/vnd.google-earth.kml+xml`),saveShapefile:async()=>ao(`${p}.zip`,await wc(Fn(h(),{..._,stem:p})),`application/zip`)}},Ec={shp:`shp.perun-atlas.js?v=f8a962935bdb`},Dc=typeof document>`u`?null:document.currentScript?.src||null,Oc=()=>Dc??(typeof document>`u`?null:Array.from(document.scripts).find(e=>/\/perun-atlas\.js(\?|$)/.test(e.src))?.src??null),kc=(e,t,n=Ec)=>t&&n[e]?new URL(n[e],t).href:null,Ac=new Map,jc=(e,{base:t=Oc(),files:n=Ec,load:r=e=>import(e)}={})=>{if(!Ac.has(e)){let i=kc(e,t,n),a=i?r(i):Promise.reject(Error(`perun-atlas: cannot tell where the ${e} module is. It is loaded from beside perun-atlas.js, and that script could not be found.`));a.catch(()=>Ac.delete(e)),Ac.set(e,a)}return Ac.get(e)},{useRef:Mc,useState:Nc}=t.React,Pc=()=>new Promise(e=>{requestAnimationFrame(()=>setTimeout(e,0))}),Fc=async e=>{let t=await e.arrayBuffer(),n=ri(t,e.name);if(n===`text`)return ai(new TextDecoder().decode(t));if(n===`part`)return{refused:`shapefilePart`};let r;try{r=await jc(`shp`)}catch(e){return console.warn(`perun-atlas: the shapefile reader could not be loaded`,e),{refused:`readerUnavailable`}}return si(await r.readShapefile(t,{kind:n,limit:Ur.bytes}))},Ic=({overlay:e,labels:t,onChange:n})=>{let r=e!==!1,[i,a]=Nc(null),[o,s]=Nc(null),[c,l]=Nc(null),[u,d]=Nc(null),f=Mc(null),p=Mc(0),m=()=>f.current?.click(),h=async e=>{let r=++p.current,i=Wr(e.size);if(!i){if(d(e.name),await Pc(),r!==p.current)return;try{i=await Fc(e)}catch(e){console.warn(`perun-atlas: a file could not be read`,e),i={refused:`unreadable`}}}if(r===p.current){if(i.refused){d(null),s(ms(i,e.name,t));return}s(null),l(i.assumed?fs(e.name,t):null),a({name:e.name,collection:i.collection,count:i.collection.features.length}),n?.()}},g=e=>{let t=e.target.files?.[0];e.target.value=``,t&&h(t)},_=()=>{p.current+=1,d(null),l(null),a(null),n?.()};return{offered:r,file:i,refusal:o,note:c,opening:u,inputRef:f,choose:m,onPicked:g,close:_,drawn:()=>d(null),failed:()=>{i&&(s(ms({refused:`unreadable`},i.name,t)),_())},dismiss:()=>s(null),dismissNote:()=>l(null)}},{useState:Lc}=t.React,Rc=({coloured:e})=>{let[t,n]=Lc(null),[r,i]=Lc(!0),a=e?{values:[],usedFallback:!1}:[],[o,s]=Lc(a),[c,l]=Lc(null),u=t===null?null:c??t,[d,f]=Lc(null);return{set:t,visible:u,loading:r,drawn:o,extent:d,setDrawn:s,setShown:l,setExtent:f,onFetchStart:()=>{i(!0),s(a)},onFetched:e=>{n(e??{features:[]}),i(!1)},onFetchFailed:()=>{n({features:[]}),l(null),f(null),i(!1)},forget:()=>n(null)}},{useEffect:zc,useState:Bc}=t.React,Vc=({subject:e,drawing:t})=>{let[n,r]=Bc(null),i=t=>Xe(t,e?.id,e?.match);return zc(()=>{if(!n)return;let e=e=>{e.key===`Escape`&&r(null)};return document.addEventListener(`keydown`,e),()=>document.removeEventListener(`keydown`,e)},[n]),{record:n,openRecord:(e,n)=>{t||n&&r(n)},closeRecord:()=>r(null),isSubject:i,descriptorFor:t=>e?.descriptor&&i(t)?e.descriptor:null,isPinnedFeature:e=>i(e)}},Hc=[`map`,`at`,`base`,`from`,`to`],Uc=/^\d{4}-\d{2}-\d{2}$/,Wc=e=>{let t=Math.max(e.indexOf(`#`),0),n=e.indexOf(`?`,t);return n===-1?{head:e,query:``}:{head:e.slice(0,n),query:e.slice(n+1)}},Gc=e=>Uc.test(e??``)&&new Date(`${e}T00:00:00Z`).toISOString().slice(0,10)===e,Kc=(e,t)=>String(Number(e.toFixed(t))),qc=e=>((e+180)%360+360)%360-180,Jc=(e,t)=>{if(t==null||t===``)return null;let n=new URLSearchParams(Wc(e).query);if(n.get(`map`)!==String(t))return null;let r={},i=(n.get(`at`)??``).split(`,`);if(i.length===3&&i.every(e=>e.trim()!==``)){let[e,t,n]=i.map(Number);Math.abs(e)<=90&&Math.abs(t)<=180&&n>=0&&n<=30&&(r.center=[e,t],r.zoom=n)}let a=n.get(`base`);a&&(r.basemap=a);let o=n.get(`from`),s=n.get(`to`);return Gc(o)&&Gc(s)&&o<=s&&(r.from=o,r.to=s),r},Yc=(e,t,{center:n,zoom:r,basemap:i,from:a,to:o}={})=>{let{head:s,query:c}=Wc(e),l=new URLSearchParams(c);return Hc.forEach(e=>l.delete(e)),l.set(`map`,String(t)),n&&Number.isFinite(r)&&l.set(`at`,[Kc(n[0],6),Kc(qc(n[1]),6),Kc(r,2)].join(`,`)),i&&l.set(`base`,i),a&&o&&(l.set(`from`,a),l.set(`to`,o)),`${s}?${l.toString().replace(/%2C/gi,`,`)}`},Xc=new Set,Zc=(e,t)=>{if(Xc.has(e))return null;let n=Jc(e,t);return n&&Xc.add(e),n},{useEffect:Qc,useRef:$c,useState:el}=t.React,tl=2e3,nl=({linkId:e,link:t,timeScoped:n,range:r,labels:i={}})=>{let a=e!=null&&e!==``&&t!==!1,o=$c(null),[s,c]=el(!1);return Qc(()=>{if(!s)return;let e=setTimeout(()=>c(!1),tl);return()=>clearTimeout(e)},[s]),{offered:a,copied:s,attach:({map:e,basemap:t})=>{o.current={map:e,basemap:t}},copy:async t=>{let{map:a,basemap:s}=o.current??{};if(!a)return;let l=a.getCenter(),u=Yc(window.location.href,e,{center:[l.lat,l.lng],zoom:a.getZoom(),basemap:ct(s,a),...n&&{from:r.from,to:r.to}});await oo(u,t?.parentNode??void 0)?c(!0):window.prompt(i.copyLinkPrompt??`Copy this link:`,u)}}};Q(`/*
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
`);var{useEffect:rl,useMemo:il,useState:al}=t.React,ol=({session:e,servicePath:n,context:r,descriptors:i,labelResolver:a,cluster:o,subject:s,presets:c=[],defaultMonths:l,labels:u={},map:f,exportable:p,overlay:m,legend:h=!0,notice:g=!0,tokens:_,title:v,choropleth:y,draw:b,view:x,linkId:S,link:C,className:w=``,onClose:T})=>{let[E,D]=al(!0),[O,k]=al(!!x?.center),M=()=>{O&&k(!1)},[N,ne]=al(null),[re,ie]=al(void 0),{timeScoped:P,preset:F,range:I,initial:ae,longest:oe,applyPreset:se,onRangeChange:ce}=tc({presets:c,defaultMonths:l,servicePath:n,opening:x?.from&&x?.to?{from:x.from,to:x.to}:void 0,onMoved:()=>{we(),We()}}),le=il(()=>({...r||{},...P&&{from:I.from,to:I.to},...N&&{srid:N}}),[r,P,I.from,I.to,N]),ue=JSON.stringify(le),{coloured:de,statusPath:fe,rows:pe,tooltip:me}=Js({choropleth:y,bindings:le,bindingKey:ue}),{set:he,visible:ge,loading:_e,drawn:L,extent:ve,setDrawn:R,setShown:ye,setExtent:be,onFetchStart:xe,onFetched:Se,onFetchFailed:Ce,forget:we}=Rc({coloured:de}),[Te,z]=al([]),Ee=e=>z(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e]),De=()=>z([]),[Oe,ke]=al(null),{drawable:Ae,drawing:B,shape:V,selection:je,note:Me,form:Ne,saving:Pe,reload:Fe,setShape:Ie,setNote:Le,startDrawing:Re,finishDrawing:ze,clearDrawing:Be,saveShape:Ve}=hc({draw:b,dataSrid:N,set:ge,bindings:le,labels:u,map:re}),{record:He,openRecord:Ue,closeRecord:We,descriptorFor:Ge,isPinnedFeature:Ke}=Vc({subject:s,drawing:B}),H=Ic({overlay:m,labels:u,onChange:()=>z(e=>e.filter(e=>e!==ee))}),{file:U}=H;rl(()=>{He?.file&&He.file!==U&&We()},[U]);let qe=Tc({set:ge,selection:je,exportable:p,labelResolver:a,timeScoped:P,range:I,srid:N,map:re,drawnWith:e=>de?i?.[y.descriptor]:d(i?.[Ge(e)??Je(e)],e)}),Ye=nl({linkId:S,link:C,timeScoped:P,range:I,labels:u}),Xe=!_e&&he!==null&&(he.features?.length??0)===0&&g!==!1&&!B&&!V&&!U&&Oe!==ue;return t.React.createElement(`div`,{className:`atlas-panel ${w}${E?``:` atlas-panel--nolabels`}`.trim(),style:_},t.React.createElement(`header`,{className:`atlas-panel__header`},t.React.createElement(`div`,{className:`atlas-panel__title`},v),T&&t.React.createElement(js,{label:u.close??`Close`,onClick:T})),t.React.createElement(`div`,{className:`atlas-panel__toolbar`},P&&t.React.createElement(Ws,{range:I,onRangeChange:ce,presets:c,preset:F,applyPreset:se,labels:u}),!de&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__switch`,"aria-pressed":E,onClick:()=>D(!E)},t.React.createElement(`span`,{className:`atlas-panel__track`},t.React.createElement(`span`,{className:`atlas-panel__knob`})),u.labels??`Labels`),(Ae||qe.canExport||H.offered||Ye.offered)&&t.React.createElement(`div`,{className:`atlas-panel__actions`},Ae&&t.React.createElement(jo,{drawing:B,busy:Pe,labels:u,onStart:Re,onCancel:Be}),qe.canExport&&t.React.createElement(Fs,{exporter:qe,labels:u}),t.React.createElement(Ls,{fileOverlay:H,labels:u}),Ye.offered&&t.React.createElement(Bs,{viewLink:Ye,labels:u})),t.React.createElement(Rs,{fileOverlay:H,labels:u}),Ae&&(B||V)&&t.React.createElement(Fo,{shape:V,drawing:B,busy:Pe,limits:b.radius,caught:je.selecting?{count:je.count,total:je.total}:void 0,savable:!!b.save?.onSave,note:b.note?{value:Me,onChange:Le,required:b.note.required}:void 0,form:Ne,labels:u,onCancel:Be,onRadius:e=>Ie(t=>t&&{...t,radius:e}),onSave:Ve})),t.React.createElement(`div`,{className:`atlas-panel__body`},t.React.createElement(`div`,{className:`atlas-panel__mapwrap`},t.React.createElement(`div`,{className:`atlas-panel__map`},t.React.createElement($a,{session:e,layerSwitcher:!0,...f,extent:ve,view:x,onReady:e=>{ie(e.map),ne(e.config?.dataSrid??null),Ye.attach(e)}},de?(pe!==null||!fe)&&t.React.createElement(yo,{servicePath:n,context:le,srid:N,reload:Fe,statusRows:pe,join:y.join,field:y.field,palette:y.palette,fallback:y.fallback,descriptor:i?.[y.descriptor],labelResolver:a,tooltip:me,hidden:Te,onFeatureClick:Ue,onLegend:R,onShown:ye,onLoadStart:xe,onLoad:Se,onError:Ce}):t.React.createElement(ts,{servicePath:n,context:le,reload:Fe,descriptors:i,descriptorFor:Ge,labelResolver:a,cluster:o,pinned:Ke,hidden:Te,fit:!O,onFeatureClick:Ue,onLegend:R,onShown:ye,onExtent:be,onLoadStart:xe,onLoad:e=>{M(),Se(e)},onError:e=>{M(),Ce(e)}}),U&&t.React.createElement(xs,{file:U,srid:N,hidden:Te.includes(ee),labelResolver:a,onFeatureClick:Ue,onDrawn:H.drawn,onError:H.failed}),Ae&&t.React.createElement(Eo,{value:V,drawing:B,style:b.style,onChange:Ie,onDrawn:ze}),h!==!1&&t.React.createElement(As,{entries:[...de?A({palette:y.palette,fallback:y.fallback??j.__unknown,unknownLabel:y.unknownLabel,...L},a):te(L,a),...U?[as(U.name)]:[]],title:u.legend,hidden:Te,onToggle:Ee,onShowAll:De,showAllLabel:u.showAll,position:typeof h==`string`?h:void 0}))),(_e||Pe||H.opening)&&t.React.createElement(Vs,{saving:Pe,opening:H.opening,labels:u}),Xe&&t.React.createElement(Ms,{timeScoped:P,longest:oe,preset:F,applyPreset:se,labels:u,onClose:()=>ke(ue)})),He&&t.React.createElement(Us,{record:He,labels:u,onClose:We})),(P||T)&&t.React.createElement(Hs,{timeScoped:P,range:I,initial:ae,applyPreset:se,labels:u,onClose:T}))};Q(`/*
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
`);var{factory:sl}=R,{useEffect:cl,useRef:ll}=t.React,ul=`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 26 36">
  <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 23 13 23s13-13.25 13-23C26 5.82 20.18 0 13 0z"
        fill="currentColor" stroke="#ffffff" stroke-width="1.75"/>
  <circle cx="13" cy="13" r="4" fill="#ffffff"/>
</svg>`,dl=({value:e,onChange:t,draggable:n=!0,className:r=`atlas-pin`,html:i=ul,size:a=[20,28],anchor:o=[10,28]})=>{let s=X(),c=ll(null),l=ll(t);return l.current=t,cl(()=>{let e=e=>l.current?.({lat:e.latlng.lat,lng:e.latlng.lng});return s.on(`click`,e),()=>{s.off(`click`,e),c.current&&(s.removeLayer(c.current),c.current=null)}},[s]),cl(()=>{if(!e){c.current&&(s.removeLayer(c.current),c.current=null);return}if(c.current){c.current.setLatLng(e);return}let t=sl.marker(e,{icon:sl.divIcon({className:r,html:i,iconSize:a,iconAnchor:o}),draggable:n}).addTo(s);t.on(`drag`,e=>l.current?.({...e.target.getLatLng()})),c.current=t},[s,e?.lat,e?.lng]),null},{labelsManager:fl}=t.utils,{useMemo:pl,useState:ml}=t.React,hl=(e,n)=>{let{objConfig:r,objectId:i,session:a,labelDomain:o=`main`,title:s,className:c,linkId:l,onClose:u}=e,[d]=ml(()=>Zc(window.location.href,l)),f=e=>{if(!e)return;let t=fl(e,n,o);return!t||t===`perun.${o}.${e}`?void 0:t},p=pl(()=>({session:a,objectId:i,...r?.context||{}}),[a,i,r]),m=pl(()=>(r?.presets||[]).map(({months:e,label:t})=>({months:e,label:f(t)??`${e}`})),[r]),h=pl(()=>Object.fromEntries(Object.entries(r?.labels||{}).map(([e,t])=>[e,f(t)])),[r]),g=r?.service;return g?t.React.createElement(ol,{session:a,servicePath:g,context:p,descriptors:r?.descriptors||{},labelResolver:f,cluster:r?.cluster,subject:r?.subject?{...r.subject,id:i}:void 0,title:s??f(r?.title),presets:m,defaultMonths:r?.defaultMonths,map:r?.map,choropleth:r?.choropleth,draw:r?.draw,exportable:r?.export,overlay:r?.overlay,legend:r?.legend,notice:r?.notice,tokens:r?.tokens,labels:h,view:d??void 0,linkId:l,link:r?.link,className:c,onClose:u}):t.React.createElement(`div`,{className:`atlas-panel-unavailable`},f(`map_service_missing`)??`This button has no map service configured.`)};hl.contextTypes={intl:t.PropTypes.object.isRequired};var gl=(0,t.connect)((e,t)=>({session:t.session??e?.security?.svSession}))(hl),_l=a,vl=o;e.AtlasMap=$a,e.Choropleth=yo,e.CirclePicker=Eo,e.ConfiguredMap=gl,e.DateRange=Oo,e.DrawBar=Fo,e.DrawTool=jo,e.FeaturePanel=ol,e.FeatureSet=ts,e.Legend=ks,e.LegendControl=As,e.PointPicker=dl,e.ZoomRail=Ua,Object.defineProperty(e,"appearance",{enumerable:!0,get:function(){return P}}),Object.defineProperty(e,"bootstrap",{enumerable:!0,get:function(){return Ge}}),Object.defineProperty(e,"config",{enumerable:!0,get:function(){return ae}}),Object.defineProperty(e,"data",{enumerable:!0,get:function(){return ci}}),e.name=_l,e.version=vl});