(function(e,t){typeof exports==`object`&&typeof module<`u`?t(exports,require("perun-core"),require("spatial")):typeof define==`function`&&define.amd?define([`exports`,`perun-core`,`spatial`],t):(e=typeof globalThis<`u`?globalThis:e||self,t(e[`perun-atlas`]={},e[`perun-core`],e.spatial))})(this,function(e,t,n){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});var r=Object.defineProperty,i=(e,t)=>{let n={};for(var i in e)r(n,i,{get:e[i],enumerable:!0});return t||r(n,Symbol.toStringTag,{value:`Module`}),n},a=`perun-atlas`,o=`1.0.0`,s=[`DESCRIPTOR`,`pkid`,`parent_id`,`type`,`status`],c={weight:1,opacity:1,color:`#4A5C66`,fillOpacity:.55,fillColor:`#B8C6CC`},l=(e={},t={})=>({...c,...e.style,...t}),u=(e,t)=>e||t?{...e,...t}:void 0,d=(e,t)=>{let n=e?.variants;if(!n?.by)return e;let r=n.cases?.[t?.properties?.[n.by]];return r?{...e,...r,style:u(e.style,r.style),marker:u(e.marker,r.marker),label:u(e.label,r.label),popup:u(e.popup,r.popup),arrow:u(e.arrow,r.arrow)}:e},f=(e,t)=>{let n=e?.label?.scale;if(!n)return!1;let{min:r=0,max:i=24}=n;return t>=r&&t<=i},p=(e,t)=>{let n=e?.label?.field;if(!n)return null;let r=t?.properties?.[n];return r==null?null:String(r)},m=(e,t)=>{let n=e=>{let n=e?t?.properties?.[e]:void 0;return n==null||n===``?null:String(n)};return n(e?.label?.field)??n(e?.popup?.title)??n(e?.details?.title)},h=(e,t,n)=>{let r=e?.popup;if(!r)return null;let i=e=>{let n=t?.properties?.[e];return n==null||n===``?null:String(n)},a=r.title?i(r.title):null,o=(r.fields??[]).map(({label:e,field:t})=>({label:e&&n?.(e)||e||t,value:i(t)})).filter(e=>e.value!==null);return a===null&&o.length===0?null:{title:a,rows:o}},g=(e,t,n)=>{let r=e?.details;if(!r)return null;let i=t?.properties??{},a=new Set([...s,...r.exclude??[]]),o=e=>e==null||e===``?null:String(e),c=r.title?o(i[r.title]):null,l=Object.entries(i).filter(([e,t])=>!a.has(e)&&e!==r.title&&(typeof t!=`object`||!t)).map(([e,t])=>({field:e,label:n?.(e.toLowerCase())||e,value:o(t)})).filter(e=>e.value!==null);return c===null&&l.length===0?null:{title:c,rows:l,spec:r}},_=(e,t)=>{let n=e;for(let e=0;e<t.length;e+=1){if(n==null)return n;let r=t.length-e===1?t[e]:t.slice(e).join(`.`);if(Object.prototype.hasOwnProperty.call(Object(n),r))return n[r];n=n[t[e]]}return n},v=(e,t)=>_(e,String(t).split(`.`)),y=e=>{let t=String(e).split(`.`);return e=>_(e,t)},b=(e,t)=>e.replace(/\{([^}]+)\}/g,(e,n)=>{let r=v(t,n);return r==null?e:String(r)}),x=`::`,S=(e=[],t=[])=>e.length>=2||e.some(e=>t.includes(e.key)),C=(e,t)=>`${e??``}${x}${t??``}`,w=`${x}fallback`,ee=`${x}file`,T=(e,t,n)=>{let r=t?.variants?.by,i=r?n?.properties?.[r]:void 0,a=i!==void 0&&t?.variants?.cases?.[i]?i:void 0;return{name:e,value:a,key:C(e,a)}},E=({descriptors:e,nameOf:t})=>{let n=new WeakMap,r=r=>{if(n.has(r))return n.get(r);let i=d(e[t(r)],r);return n.set(r,i),i},i=n=>{let r=t(n);return T(r,e[r],n)},a=new Map;return{entryFor:r,kindOf:i,note:e=>{let{name:t,value:n,key:o}=i(e);return a.has(o)||a.set(o,{name:t,value:n,descriptor:r(e),geometry:e?.geometry?.type}),o},drawn:()=>[...a.values()]}},D=(e=``)=>/Point$/.test(e)?`point`:/LineString$/.test(e)?`line`:`area`,O=({name:e,value:t,descriptor:n},r)=>{let i=n?.legend;if(i){let e=r?.(i);if(e)return e}let a=t??e;return a==null||a===``?``:r?.(String(a).toLowerCase())||String(a)},k=(e,t)=>{let n=D(e.geometry),r=e.descriptor??{};return{key:C(e.name,e.value),label:O(e,t),kind:n,path:l(r),marker:n===`point`?r.marker??{}:null,arrow:n===`line`?r.arrow??null:null}},A=(e=[],t)=>e.map(e=>k(e,t)).filter(e=>e.label!==``),te=({palette:e={},values:t=[],fallback:n,usedFallback:r=!1,unknownLabel:i=`unknown`}={},a)=>{let o=e=>({...c,color:e,fillColor:e,fillOpacity:.7}),s=t.filter(t=>Object.prototype.hasOwnProperty.call(Object(e),t)&&e[t]).map(t=>({key:String(t),label:a?.(String(t).toLowerCase())||String(t),kind:`area`,path:o(e[t]),marker:null,arrow:null}));return!r||!n?s:[...s,{key:w,label:a?.(i)||`Not classified`,kind:`area`,path:o(n),marker:null,arrow:null}]},j={__unknown:`#B8C6CC`},M=(e,t)=>Object.prototype.hasOwnProperty.call(Object(e),t)&&!!e[t],N=({field:e,palette:t=j,fallback:n=j.__unknown})=>{let r=new Set,i=y(e),a=e=>i(e?.properties);return i=>{let o=a(i);return o==null?n:M(t,o)?t[o]:(r.has(o)||(r.add(o),console.warn(`perun-atlas: no palette entry for ${e}="${o}"`)),n)}},ne=(e=[],{field:t,palette:n=j}={})=>{let r=y(t),i=e=>r(e?.properties),a=new Set,o=[],s=!1;return e.forEach(e=>{let t=i(e);if(t==null){s=!0;return}M(n,t)||(s=!0),!a.has(t)&&(a.add(t),o.push(t))}),{values:o,usedFallback:s}},P=({field:e,palette:t=j}={})=>{let n=y(e);return e=>{let r=n(e?.properties);return r!=null&&M(t,r)?String(r):w}},re=(e,t,{featureKey:n,rowKey:r,as:i=`status`})=>{let a=y(r),o=y(n),s=new Map((t??[]).map(e=>[String(a(e)),e]));return{...e,features:(e?.features??[]).map(e=>{let t=s.get(String(o(e?.properties)));return t?{...e,properties:{...e.properties,[i]:t}}:e})}},F=i({BASE_STYLE:()=>c,DEFAULT_PALETTE:()=>j,categoriesDrawn:()=>ne,colourBy:()=>N,detailsFor:()=>g,joinStatus:()=>re,labelFor:()=>p,labelVisible:()=>f,legendFrom:()=>A,legendFromPalette:()=>te,nameFor:()=>m,pathOptions:()=>l,popupFor:()=>h,variantOf:()=>d}),I={crs:{type:`crs`,param:`SPATIAL_CRS`,legacy:`sysCrs`,required:!0,doc:`EPSG code, or { code, def } for a proj4 definition.`},center:{type:`latlng`,param:`SPATIAL_CENTER`,legacy:`sysCenter`,required:!0,doc:`Initial map centre as { lat, lng }.`},bounds:{type:`bounds`,param:`SPATIAL_BOUNDS`,legacy:`sysBounds`,doc:`Spatial limits as [ {lat,lng} southwest, {lat,lng} northeast ].`},zoom:{type:`int`,param:`SPATIAL_ZOOM`,default:8},minZoom:{type:`int`,param:`SPATIAL_MIN_ZOOM`,default:0},maxZoom:{type:`int`,param:`SPATIAL_MAX_ZOOM`,default:18},bboxOrder:{type:`bool`,param:`SPATIAL_SWITCH_BBOX_ORDER`,legacy:`switchBboxOrder`,default:!1,doc:`Reverse WMS bounding box axis order.`},units:{type:`enum`,param:`SPATIAL_MEASUREMENT_SYSTEM`,legacy:`measurementSystem`,values:[`metric`,`imperial`],default:`metric`},attribution:{type:`string`,param:`SPATIAL_ATTRIBUTION`,default:``},dataSrid:{type:`srid`,param:`sys.gis.default_srid`,default:`4326`,doc:`EPSG code the database stores geometry in, without the prefix.`}},L=Object.keys(I).filter(e=>I[e].required),R=i({REQUIRED:()=>L,SCHEMA:()=>I}),z=(e,t,n)=>{throw TypeError(`perun-atlas: cannot read "${e}" as ${n} (got ${JSON.stringify(t)})`)},B=e=>{if(typeof e!=`string`)return e;let t=e.trim();if(!t.startsWith(`{`)&&!t.startsWith(`[`))return e;try{return JSON.parse(t)}catch{return e}},ie=(e,t)=>{let n=B(t);if(n&&typeof n==`object`&&`lat`in n&&`lng`in n)return{lat:Number(n.lat),lng:Number(n.lng)};if(typeof n==`string`&&n.includes(`,`)){let[e,t]=n.split(`,`).map(Number);if(Number.isFinite(e)&&Number.isFinite(t))return{lat:e,lng:t}}return z(e,t,`a { lat, lng } pair`)},V={string:(e,t)=>String(t),int:(e,t)=>{let n=Number(t);return Number.isInteger(n)?n:z(e,t,`an integer`)},bool:(e,t)=>{if(typeof t==`boolean`)return t;let n=String(t).trim().toLowerCase();return[`true`,`1`,`yes`].includes(n)?!0:![`false`,`0`,`no`].includes(n)&&z(e,t,`a boolean`)},enum:(e,t,n)=>n.values.includes(t)?t:z(e,t,`one of ${n.values.join(`, `)}`),latlng:ie,bounds:(e,t)=>{let n=B(t);return Array.isArray(n)&&n.length===2?[ie(e,n[0]),ie(e,n[1])]:z(e,t,`a [southwest, northeast] pair`)},srid:(e,t)=>{let n=String(t).trim().replace(/^EPSG:/i,``);return/^\d{4,6}$/.test(n)?n:z(e,t,`an EPSG code such as 4326`)},crs:(e,t)=>{let n=B(t);return typeof n==`string`&&n.startsWith(`EPSG:`)||n&&typeof n==`object`&&n.code?n:z(e,t,`an EPSG code or { code, def } object`)}},ae=(e,t,n)=>{let r=V[n.type];if(!r)throw TypeError(`perun-atlas: no coercion for type "${n.type}" on "${e}"`);return r(e,t,n)},oe=async()=>{let e=Object.entries(I).filter(([,e])=>e.param),n=await Promise.all(e.map(([e,n])=>t.axios.get(`${window.server}/WsConf/params/get/sys/${n.param}`).then(t=>[e,t?.data?.VALUE]).catch(()=>[e,void 0])));return Object.fromEntries(n.filter(([,e])=>e!==void 0&&e!==``))},se=async e=>(await t.axios.get(`${window.server}/spatial/config/${e}`))?.data?.params??{},ce=()=>{let e={};return Object.entries(I).forEach(([t,n])=>{if(!n.legacy)return;let r=window[n.legacy];r!=null&&r!==``&&(e[t]=r)}),e},le=()=>Object.fromEntries(Object.entries(I).filter(([,e])=>`default`in e).map(([e,t])=>[e,t.default])),ue=(e,t,n)=>{let r=Object.keys(e).filter(e=>!(e in t)&&!(e in n));r.length&&console.warn(`perun-atlas: ${r.length} setting(s) still come from window globals — `+r.map(e=>`window.${I[e].legacy}`).join(`, `)+`. Seed `+r.map(e=>I[e].param).join(`, `)+` in SVAROG_SYS_PARAMS; this fallback is temporary.`)},de=async(e={})=>{let t=await oe(),n=ce(),r={...le(),...n,...t,...e};ue(n,t,e);let i={},a=[];Object.entries(I).forEach(([e,t])=>{let n=r[e];if(n!==void 0)try{i[e]=ae(e,n,t)}catch(e){a.push(e.message)}});let o=L.filter(e=>i[e]===void 0);if(o.length&&a.push(`missing required setting(s): `+o.map(e=>`${e} (parameter ${I[e].param})`).join(`, `)),a.length)throw Error(`perun-atlas: configuration could not be resolved.
  - `+a.join(`
  - `));return i},fe=async()=>{let[e,t,n]=[await oe(),ce(),le()];return Object.fromEntries(Object.keys(I).map(r=>[r,r in e?{source:`SVAROG_SYS_PARAMS`,value:e[r]}:r in t?{source:`window.${I[r].legacy}`,value:t[r]}:r in n?{source:`schema default`,value:n[r]}:{source:`unresolved`,value:void 0}]))},H=Object.getPrototypeOf(n.spatial);H.assets;var pe=H.config,U=H.core,me=H.data,he=H.tools,ge=H.ui;H.proj4;var _e=e=>Array.isArray(e)&&typeof e[0]==`number`,ve=e=>{if(!e)return[];if(e.type===`GeometryCollection`)return(e.geometries??[]).flatMap(ve);let t=e=>Array.isArray(e)?_e(e)?[e]:e.flatMap(t):[];return t(e.coordinates)},ye=(e,t)=>{if(!e)return e;if(e.type===`GeometryCollection`)return{...e,geometries:(e.geometries??[]).map(e=>ye(e,t))};let n=e=>Array.isArray(e)?_e(e)?t(e):e.map(n):e;return{...e,coordinates:n(e.coordinates)}},be=(e,t)=>Array.isArray(e?.features)?{...e,features:e.features.map(e=>e?.geometry?{...e,geometry:ye(e.geometry,t)}:e)}:e,{Map:xe,factory:W}=U,Se={3857:()=>W.CRS.EPSG3857,3395:()=>W.CRS.EPSG3395,4326:()=>W.CRS.EPSG4326},Ce=e=>Se[String(e)]?.()??null,we=new Set,Te=e=>e==null?null:Ce(e)||(we.has(String(e))||(we.add(String(e)),console.warn(`perun-atlas: cannot express a coordinate in EPSG:${e} — the engine builds 3857, 3395 and 4326. Using the map's own projection instead, which is correct only if this deployment stores geometry in it.`)),null),Ee=e=>{let t=Te(e);if(!t)return xe.getBBox();let n=xe.getBounds(),r=t.projection.project(n.getSouthWest()),i=t.projection.project(n.getNorthEast());return`${r.x},${r.y},${i.x},${i.y}`},De=(e,t)=>{let{x:n,y:r}=(Te(t)??xe.getCRS()).projection.project(W.latLng(e));return{x:n,y:r}},Oe=(e,t)=>{let[n,r]=Array.isArray(e)?e:[e?.x,e?.y],{lat:i,lng:a}=(Te(t)??xe.getCRS()).projection.unproject(W.point(n,r));return{lat:i,lng:a}},ke=(e,t)=>be(e,e=>{let{lat:n,lng:r}=Oe(e,t);return[r,n,...e.slice(2)]}),Ae=(e,t)=>be(e,e=>{let{x:n,y:r}=De({lat:e[1],lng:e[0]},t);return[n,r,...e.slice(2)]}),je=(e,t)=>Me(e,t).ew,Me=(e,t)=>{let n=.001,r=W.latLng(e),i=W.latLng({lat:r.lat,lng:r.lng+n}),a=W.latLng({lat:r.lat+n,lng:r.lng}),o=De(r,t),s=xe.distance(r,i),c=xe.distance(r,a);return{ew:s?Math.abs(De(i,t).x-o.x)/s:1,ns:c?Math.abs(De(a,t).y-o.y)/c:1}},Ne=e=>e>0?Math.min(12,Math.max(0,3-Math.floor(Math.log10(e)))):6,Pe=(e,t)=>{let n=10**t;return Math.round(e*n)/n},Fe=(e,t,n,r=24)=>{let{ew:i,ns:a}=Me(e,n),{x:o,y:s}=De(e,n),c=t*i,l=t*a,u=Ne(Math.min(c,l));return Array.from({length:Math.max(3,r)},(e,t)=>{let n=2*Math.PI*t/Math.max(3,r);return{x:Pe(o+c*Math.cos(n),u),y:Pe(s+l*Math.sin(n),u)}})},{Map:Ie,store:Le}=U,Re={crs:`crs`,center:`center`,bounds:`bounds`,zoom:`zoom`,minZoom:`minZoom`,maxZoom:`maxZoom`,units:`measurementSystem`,bboxOrder:`switchBboxOrder`},ze=e=>{if(!e)return;let t=Ie.getCRS?.()?.code,n=typeof e==`object`?e.code:e;t&&n&&t!==n&&console.warn(`perun-atlas: this deployment declares ${n}, but the map is on ${t}. The engine could not resolve the declared value — as a plain code it must be EPSG:3857, EPSG:3395 or EPSG:4326, and any other projection needs a proj4 definition. Basemap tiles will be requested outside the grid they are published on.`)},Be=e=>{if(!e)return;Le.addState(`dbCRSCode`,{dbCRS:e});let t=Ce(e);if(t){Le.addState(`dbCRS`,t);return}let n=Ie.getCRS?.()?.code;e!==n?.split(`:`)[1]&&console.warn(`perun-atlas: this deployment stores geometry in EPSG:${e}, which spatial cannot convert from — it handles 3857, 3395 and 4326. Geometry will be read as though it were already in ${n}, and will be drawn in the wrong place.`)},Ve=(e={})=>{let t={};Object.entries(Re).forEach(([n,r])=>{e[n]!==void 0&&(t[r]=e[n])});let n=pe.configure(t);return ze(e.crs),Be(e.dataSrid),n},He=i({COERCE:()=>V,applyToEngine:()=>Ve,batchSource:()=>se,coerce:()=>ae,defaultSource:()=>le,explain:()=>fe,legacySource:()=>ce,remoteSource:()=>oe,resolve:()=>de}),{geobuf:Ue,Pbf:We}=me,Ge=(e,t,n)=>{window.PERUN_ATLAS_LAST=n,console.groupCollapsed(`perun-atlas: ${n.features.length} feature(s), ${t} bytes — ${e}`),console.log(`collection`,n),console.log(`also at window.PERUN_ATLAS_LAST`),console.groupEnd()},Ke=async(e,n={})=>{let r=`${window.server}${b(e,n)}`,i=await(0,t.axios)({method:`get`,url:r,responseType:`arraybuffer`}),a=i?.data?.byteLength??0;if(!i?.data||a===0){let e={type:`FeatureCollection`,features:[]};return Ge(r,a,e),e}let o=Ue.decode(new We(new Uint8Array(i.data)));if(!o||!o.type){console.warn(`perun-atlas: response from ${r} decoded to no GeoJSON type; treating as empty`),console.warn(`perun-atlas: response body was`,new TextDecoder().decode(i.data).slice(0,500));let e={type:`FeatureCollection`,features:[]};return Ge(r,a,e),e}let s=o.type===`FeatureCollection`?o:{type:`FeatureCollection`,features:[o]};return Ge(r,a,s),s},qe=e=>e?.properties?.DESCRIPTOR??e?.properties?.descriptor??null,Je=e=>({id:e?.id??e?.properties?.OBJECT_ID??null,parentId:e?.properties?.parent_id??e?.properties?.PARENT_ID??null}),Ye=(e,t,n=`id`)=>{if(t==null)return!1;let r=Je(e),i=n===`parent`?r.parentId:r.id;return i!=null&&String(i)===String(t)},{factory:Xe}=U,{getServerOrigin:Ze}=t.utils,Qe=`GEO_LAYER_TYPE`,$e={BASEMAP:`1`,OVERLAY:`2`},et=(e,t=Qe)=>({layerType:e?.[`${t}.LAYER_TYPE`],protocol:(e?.[`${t}.PROTOCOL`]??``).toLowerCase(),version:e?.[`${t}.VERSION`]||`1.1.1`,format:e?.[`${t}.FORMAT`]||`image/png`,url:e?.[`${t}.URL`],group:e?.[`${t}.LAYER_GROUP`]||`Other`,title:e?.[`${t}.TITLE`],label:e?.[`${t}.LABEL_CODE`]||e?.[`${t}.TITLE`]}),tt=[{match:/openstreetmap\.org/i,maxNativeZoom:19,attribution:`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`},{match:/opentopomap\.org/i,maxNativeZoom:17,attribution:`&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)`},{match:/cartocdn\.com/i,maxNativeZoom:20,attribution:`&copy; <a href="https://carto.com/attributions">CARTO</a>`},{match:/arcgisonline\.com/i,attribution:`Tiles &copy; <a href="https://www.esri.com">Esri</a>`}],nt=e=>tt.find(t=>t.match.test(e??``))??{},rt=(e,{maxZoom:t}={})=>{let n=e.url||Ze(),r=nt(n),i={...t!=null&&{maxZoom:t},...r.maxNativeZoom!=null&&{maxNativeZoom:r.maxNativeZoom}},a=r.attribution?{attribution:r.attribution}:{};if(e.protocol===`wms`)return Xe.tileLayer.extendedWMS(n,{layers:e.title,format:e.format,version:e.version,transparent:!0,uppercase:!0,...i,...a,...e.layerType===$e.OVERLAY&&{tiled:!0,isOverlay:!0}});if(e.protocol===`tile`){let e=/google|mt\{s\}/i.test(n);return Xe.tileLayer(n,{...i,...a,...e&&{subdomains:[`mt0`,`mt1`,`mt2`,`mt3`]}})}return e.protocol===`grid`?e.url?.includes(`google`)?Xe.gridLayer.googleMutant({maxZoom:24,type:e.url.split(`_`)[1]}):(console.warn(`perun-atlas: grid layer "${e.title}" has no recognised provider in its URL`),null):(console.warn(`perun-atlas: unsupported layer protocol "${e.protocol}" for "${e.title}"`),null)},it=async(e,n={})=>{let r={},i={},a=(await t.axios.get(`${window.server}/ReactElements/getTableData/${e}/${Qe}/0`).catch(e=>(console.error(`perun-atlas: layer catalogue unavailable`,e),null)))?.data;return Array.isArray(a)&&a.forEach(e=>{let t=et(e),a=rt(t,n);if(!a)return;let o=t.layerType===$e.OVERLAY?i:r;o[t.group]=o[t.group]||{},o[t.group][t.label]=a}),{basemap:r,overlays:i}},at=e=>{let t=Object.values(e??{})[0];return t?Object.values(t)[0]:null},ot=(e,t)=>{if(!t)return null;let n=Object.values(e??{}).find(e=>Object.prototype.hasOwnProperty.call(e,t));return n?n[t]:null},st=(e,t)=>{for(let n of Object.values(e??{})){let e=Object.entries(n).find(([,e])=>t?.hasLayer?.(e));if(e)return e[0]}return null},ct=async(e,n={})=>{if(!e)return[];let r=`${window.server}${b(e,n)}`,i=(await t.axios.get(r).catch(e=>(console.error(`perun-atlas: rows unavailable from ${r}`,e),null)))?.data;return i&&!Array.isArray(i)&&console.warn(`perun-atlas: ${r} answered with no array of rows; treating as empty`),Array.isArray(i)?i:[]},lt=async(e,n,r,i)=>{if(!e)return null;let a=`${window.server}${b(e,n)}`,o=await t.axios.get(a).catch(e=>(console.error(`perun-atlas: no ${r} from ${a}`,e),null));if(!o)return null;let s=o.data;return i(s)?s:(console.error(`perun-atlas: ${a} answered with no ${r}`,s),null)},ut=e=>!!e&&typeof e==`object`&&!Array.isArray(e),dt=(e,t={})=>lt(e,t,`form schema`,e=>ut(e)&&!!e.properties),ft=(e,t={})=>lt(e,t,`form layout`,ut),pt=(e,t)=>{if(!e?.properties||!t?.length)return e??null;let n=e.properties,r={},i=new Set;t.forEach(e=>{if(Object.prototype.hasOwnProperty.call(n,e)){r[e]=n[e],i.add(e);return}let t=e.lastIndexOf(`.`),a=t===-1?``:e.slice(0,t),o=t===-1?``:e.slice(t+1),s=a?n[a]:null,c=s?.properties?.[o];if(!c){console.warn(`perun-atlas: the form schema has no "${e}", so it is not on the form`);return}if(i.has(a))return;let l=r[a]??{...s,properties:{}};l.properties={...l.properties,[o]:c},r[a]=l}),Object.keys(r).forEach(e=>{if(i.has(e))return;let t=r[e],a=(n[e].required??[]).filter(e=>e in t.properties);a.length?t.required=a:delete t.required});let a={...e,properties:r};delete a.title;let o=(e.required??[]).filter(e=>e in r);if(o.length?a.required=o:delete a.required,a.dependencies){let e=Object.entries(a.dependencies).filter(([e])=>e in r);e.length?a.dependencies=Object.fromEntries(e):delete a.dependencies}return a},mt=(e,t)=>{if(!t?.properties)return e??{};let n={...e??{}};return Object.entries(t.properties).forEach(([e,t])=>{t?.properties&&(n[e]=mt(n[e],t))}),n},ht={boolean:[`checkbox`,`radio`,`select`,`hidden`],string:[`text`,`password`,`email`,`hostname`,`ipv4`,`ipv6`,`uri`,`data-url`,`radio`,`select`,`textarea`,`hidden`,`date`,`datetime`,`date-time`,`alt-date`,`alt-datetime`,`time`,`color`,`file`],number:[`text`,`select`,`updown`,`range`,`radio`,`hidden`],integer:[`text`,`select`,`updown`,`range`,`radio`,`hidden`],array:[`select`,`checkboxes`,`files`,`hidden`]},gt=new Set([`AltDateTimeWidget`,`AltDateWidget`,`CheckboxWidget`,`CheckboxesWidget`,`ColorWidget`,`DateTimeWidget`,`DateWidget`,`EmailWidget`,`FileWidget`,`HiddenWidget`,`PasswordWidget`,`RadioWidget`,`RangeWidget`,`SelectWidget`,`TextWidget`,`TextareaWidget`,`TimeWidget`,`URLWidget`,`UpDownWidget`]),_t=new Set(Object.values(ht).flat()),vt=(e,t)=>gt.has(e)||(t?(ht[t]??[]).includes(e):_t.has(e)),yt=(e,t)=>{if(!ut(e))return e??null;let n=[],r=(e,t)=>{let i={};return Object.entries(e).forEach(([e,a])=>{if(e===`ui:widget`&&typeof a==`string`&&!vt(a,t?.type)){n.push(a);return}let o=e===`items`?t?.items:t?.properties?.[e];i[e]=ut(a)&&!e.startsWith(`ui:`)?r(a,o):a}),i},i=r(e,t);return n.length&&console.warn(`perun-atlas: this form cannot draw ${[...new Set(n)].map(e=>`"${e}"`).join(`, `)} -- those are the widgets a record form registers, and the draw row is not one. The fields keep the widget their schema implies.`),n.length?i:e},{Map:bt,factory:xt}=U,St=(e,t,n)=>{let r=ve(e?.geometry);if(r.length===0)return null;let i=xt.latLng(t),a=1/0,o=0;return r.forEach(e=>{let t=bt.distance(i,xt.latLng(Oe(e,n)));t<a&&(a=t),t>o&&(o=t)}),{nearest:a,furthest:o}},Ct=(e,t,n={})=>{let{srid:r,mode:i=`touches`}=n,a=e?.features??[],o={inside:[],outside:a,has:()=>!1,metres:()=>null,total:a.length};if(!t||!(t.radius>0))return o;let s={lat:t.lat,lng:t.lng};if(!Number.isFinite(s.lat)||!Number.isFinite(s.lng))return o;let c=new WeakMap,l=new WeakSet,u=[],d=[];return a.forEach(e=>{let n=St(e,s,r);if(!n){d.push(e);return}c.set(e,n.nearest),(i===`contains`?n.furthest<=t.radius:n.nearest<=t.radius)?(l.add(e),u.push(e)):d.push(e)}),u.sort((e,t)=>c.get(e)-c.get(t)),{inside:u,outside:d,has:e=>e?l.has(e):!1,metres:e=>e&&c.has(e)?c.get(e):null,total:a.length}},wt=(e,t={})=>{let{id:n=`{pkid}`,join:r=`,`}=t;return(e??[]).map(e=>b(n,e?.properties??{})).filter(e=>e&&e!==n).join(r)},Tt=e=>encodeURIComponent(JSON.stringify(e)),Et=e=>e.replace(/ /g,`%20`),Dt=(e,t,n)=>e==null?``:t===`form`||!t&&/form-urlencoded/.test(n??``)?Tt(e):JSON.stringify(e),Ot=(e,t)=>{let n=typeof e==`string`?kt(e):e,r=String(n?.type??``).toUpperCase();return r===`ERROR`||r===`EXCEPTION`?{ok:!1,message:[n?.title,n?.message].filter(Boolean).join(` — `)}:t&&typeof e==`string`&&new RegExp(t,`i`).test(e)?{ok:!1,message:e.trim().slice(0,300)}:{ok:!0,message:null}},kt=e=>{try{return JSON.parse(e)}catch{return null}},At=/^\{([^{}]+)\}$/,jt=`...`,Mt=(e,t)=>{if(typeof e==`string`){let n=e.match(At);return n?v(t,n[1])??e:b(e,t)}if(Array.isArray(e))return e.map(e=>Mt(e,t));if(e&&typeof e==`object`){let n={};return Object.entries(e).forEach(([e,r])=>{let i=Mt(r,t);if(e===jt){i&&typeof i==`object`&&!Array.isArray(i)?Object.assign(n,i):n[e]=i;return}n[e]=i}),n}return e},Nt=async(e,n={},r={})=>{let{body:i,contentType:a=`application/x-www-form-urlencoded`,encoding:o,failure:s}=r,c=`${window.server}${Et(b(e,n))}`;try{let e=await(0,t.axios)({method:`post`,url:c,headers:{"Content-Type":a},data:Dt(i,o,a)}),n=Ot(e?.data,s);return n.ok||(console.error(`perun-atlas: ${c} refused the save`,e?.data),console.error(`perun-atlas: the payload was`,i)),{...n,data:e?.data}}catch(e){return console.error(`perun-atlas: save to ${c} failed`,e),{ok:!1,message:e?.message??String(e),data:null}}},Pt=(e,{draw:t,dataSrid:n,bindings:r,note:i,selected:a,form:o})=>{let s={lat:e.lat,lng:e.lng},{x:c,y:l}=De(s,n),u=e.radius*je(s,n),d=Math.round(u),f=Fe(s,e.radius,n,t.points),p=f.map(e=>b(t.ring?.point??`{x} {y}`,e)).join(t.ring?.join??`, `),m={type:`Polygon`,coordinates:[[...f,f[0]].map(e=>[e.x,e.y])]},h=[t.save.onSave,JSON.stringify(t.save.body??null)].some(e=>String(e).includes(`{draw.radius}`));return{context:{...r,note:i,draw:{lat:e.lat,lng:e.lng,metres:Math.round(e.radius),x:c,y:l,radius:d,ring:p,geojson:m,...a?{selected:a}:{}},...t.form?{form:o}:{}},units:u,tooSmall:h&&!(d>=1)}},Ft=e=>JSON.stringify(e??{type:`FeatureCollection`,features:[]},null,2),It=(e,t=[])=>{let n=new Set([...s,...t]),r=new Set;return e.forEach(e=>{Object.entries(e?.properties??{}).forEach(([e,t])=>{!n.has(e)&&(typeof t!=`object`||!t)&&r.add(e)})}),[...r]},Lt=(e,{fields:t,exclude:n,labelResolver:r}={})=>t?.length?t.map(({field:e,label:t,short:n})=>({field:e,header:t&&r?.(t)||t||e,short:n})):It(e,n).map(e=>({field:e,header:r?.(e.toLowerCase())||e})),Rt=e=>e.map(([e,t])=>`${e} ${t}`).join(`, `),zt=e=>e.map(e=>`(${Rt(e)})`).join(`, `),Bt={Point:([e,t])=>`POINT (${e} ${t})`,MultiPoint:e=>`MULTIPOINT (${Rt(e)})`,LineString:e=>`LINESTRING (${Rt(e)})`,MultiLineString:e=>`MULTILINESTRING (${zt(e)})`,Polygon:e=>`POLYGON (${zt(e)})`,MultiPolygon:e=>`MULTIPOLYGON (${e.map(e=>`(${zt(e)})`).join(`, `)})`},Vt=e=>{let t=Bt[e?.type];return t&&e.coordinates?.length?t(e.coordinates):``},Ht=e=>{if(e==null)return``;let t=String(e),n=!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t)&&/^[=+\-@\t\r]/.test(t)?`'${t}`:t;return/[",\r\n]/.test(n)?`"${n.replace(/"/g,`""`)}"`:n},Ut=(e,{fields:t,exclude:n,labelResolver:r}={})=>{let i=e?.features??[],a=Lt(i,{fields:t,exclude:n,labelResolver:r}),o=e=>e?.geometry?.type??``,s=i.some(e=>/Point$/.test(o(e))),c=i.some(e=>o(e)&&!/Point$/.test(o(e))),l=[...a.map(e=>e.header),...s?[`latitude`,`longitude`]:[],...c?[`geometry`]:[]],u=i.map(e=>{let t=a.map(t=>Ht(v(e?.properties,t.field)));if(s){let[n,r]=/^Point$/.test(o(e))?e.geometry.coordinates??[]:[];t.push(Ht(r),Ht(n))}return c&&t.push(Ht(Vt(e?.geometry))),t});return[l.map(Ht),...u].map(e=>e.join(`,`)).join(`\r
`)},Wt={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&apos;`},Gt=e=>String(e).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g,``).replace(/[&<>"']/g,e=>Wt[e]),Kt=e=>`<coordinates>${e.map(e=>e.join(`,`)).join(` `)}</coordinates>`,qt=e=>`<LinearRing>${Kt(e)}</LinearRing>`,Jt={Point:e=>`<Point>${Kt([e])}</Point>`,LineString:e=>`<LineString><tessellate>1</tessellate>${Kt(e)}</LineString>`,Polygon:([e,...t])=>`<Polygon><tessellate>1</tessellate><outerBoundaryIs>${qt(e)}</outerBoundaryIs>`+t.map(e=>`<innerBoundaryIs>${qt(e)}</innerBoundaryIs>`).join(``)+`</Polygon>`,MultiPoint:e=>`<MultiGeometry>${e.map(Jt.Point).join(``)}</MultiGeometry>`,MultiLineString:e=>`<MultiGeometry>${e.map(Jt.LineString).join(``)}</MultiGeometry>`,MultiPolygon:e=>`<MultiGeometry>${e.map(Jt.Polygon).join(``)}</MultiGeometry>`},Yt=e=>{let t=Jt[e?.type];return t&&e.coordinates?.length?t(e.coordinates):``},Xt=(e,t,n)=>{let r=n?.(e),i=Yt(e?.geometry),a=t.map(({field:t,header:n})=>{let r=v(e?.properties,t),i=r==null?``:Gt(r);return`        <Data name="${Gt(t)}"><displayName>${Gt(n)}</displayName><value>${i}</value></Data>`});return[`    <Placemark>`,...r==null||r===``?[]:[`      <name>${Gt(r)}</name>`],...a.length?[`      <ExtendedData>`,...a,`      </ExtendedData>`]:[],...i?[`      ${i}`]:[],`    </Placemark>`].join(`
`)},Zt=(e,{fields:t,exclude:n,labelResolver:r,nameOf:i}={})=>{let a=e?.features??[],o=Lt(a,{fields:t,exclude:n,labelResolver:r});return[`<?xml version="1.0" encoding="UTF-8"?>`,`<kml xmlns="http://www.opengis.net/kml/2.2">`,`  <Document>`,...a.map(e=>Xt(e,o,i)),`  </Document>`,`</kml>`,``].join(`
`)},Qt=`GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]`,$t=1,en=3,tn=5,nn=8,rn=[{name:`points`,types:[`Point`,`MultiPoint`]},{name:`lines`,types:[`LineString`,`MultiLineString`],shape:en},{name:`polygons`,types:[`Polygon`,`MultiPolygon`],shape:tn}],an=e=>Array.isArray(e)&&Number.isFinite(e[0])&&Number.isFinite(e[1]),on=e=>Array.isArray(e)?e.filter(an):[],sn=e=>{let[t,n]=[e[0],e[e.length-1]];return t[0]===n[0]&&t[1]===n[1]?e:[...e,t]},cn=e=>{let t=0;for(let n=1;n<e.length;n+=1)t+=(e[n][0]-e[n-1][0])*(e[n][1]+e[n-1][1]);return t>0},ln=e=>{let[t,...n]=(Array.isArray(e)?e:[]).map(on);return t?.length?[t,...n.filter(e=>e.length)].map(sn).map((e,t)=>cn(e)===(t===0)?e:[...e].reverse()):[]},un=e=>Array.isArray(e)?e.map(on).filter(e=>e.length):[],dn={Point:e=>an(e)?[[e]]:[],MultiPoint:e=>{let t=on(e);return t.length?[t]:[]},LineString:e=>un([e]),MultiLineString:un,Polygon:ln,MultiPolygon:e=>Array.isArray(e)?e.flatMap(ln):[]},fn=e=>dn[e?.type]?.(e.coordinates)??[],pn=e=>e.reduce(([e,t,n,r],[i,a])=>[Math.min(e,i),Math.min(t,a),Math.max(n,i),Math.max(r,a)],[1/0,1/0,-1/0,-1/0]),mn=(e,t,n)=>n.forEach((n,r)=>e.setFloat64(t+8*r,n,!0)),hn=(e,t)=>{let n=t.reduce((e,t)=>e+t.length,0);return e===$t?20:e===nn?40+16*n:44+4*t.length+16*n},gn=(e,t,n,r)=>{if(e.setInt32(t,n,!0),n===$t){let[[[n,i]]]=r;e.setFloat64(t+4,n,!0),e.setFloat64(t+12,i,!0);return}let i=r.flat();mn(e,t+4,pn(i));let a=t+36;if(n!==nn&&(e.setInt32(a,r.length,!0),a+=4),e.setInt32(a,i.length,!0),a+=4,n!==nn){let t=0;r.forEach(n=>{e.setInt32(a,t,!0),a+=4,t+=n.length})}i.forEach(([t,n])=>{e.setFloat64(a,t,!0),e.setFloat64(a+8,n,!0),a+=16})},_n=(e,t,n)=>{e.setInt32(0,9994),e.setInt32(24,e.byteLength/2),e.setInt32(28,1e3,!0),e.setInt32(32,t,!0),mn(e,36,n)},vn=(e,t)=>{let n=t.map(t=>hn(e,t)),r=new DataView(new ArrayBuffer(n.reduce((e,t)=>e+8+t,100))),i=new DataView(new ArrayBuffer(100+8*t.length)),a=pn(t.flatMap(e=>e.flat()));_n(r,e,a),_n(i,e,a);let o=100;return t.forEach((t,a)=>{i.setInt32(100+8*a,o/2),i.setInt32(104+8*a,n[a]/2),r.setInt32(o,a+1),r.setInt32(o+4,n[a]/2),gn(r,o+8,e,t),o+=8+n[a]}),{shp:new Uint8Array(r.buffer),shx:new Uint8Array(i.buffer)}},yn=10,bn=e=>{let t=new Set;return e.map(e=>{let n=String(e.short||e.field).replace(/[^A-Za-z0-9_]/g,`_`),r=(/[A-Za-z0-9]/.test(n)?n:`FIELD`).slice(0,yn),i=r;for(let e=1;t.has(i.toUpperCase());e+=1){let t=`_${e}`;i=r.slice(0,yn-t.length)+t}return t.add(i.toUpperCase()),{...e,short:i}})},xn=new TextEncoder,Sn=32,Cn=254,wn=19,Tn=15,En=e=>{let t=xn.encode(String(e));if(t.length<=Cn)return t;let n=Cn;for(;n>0&&(t[n]&192)==128;)--n;return t.subarray(0,n)},Dn=(e,t=0)=>e.reduce((e,t)=>Math.max(e,t),t),On=e=>{for(let t=0;t<Tn;t+=1)if(Number(e.toFixed(t))===e)return t;return Tn},kn=e=>{let t=Dn(e.filter(e=>e!==null).map(On)),n=e.map(e=>e===null?null:e.toFixed(t));if(n.some(e=>e?.includes(`e`)))return null;let r=Dn(n.map(e=>e?.length??0));return r<=wn?{type:`N`,width:r,decimals:t,cells:n.map(e=>e&&xn.encode(e))}:null},An=e=>{let t=e.filter(e=>e!=null),n=e.map(e=>e===void 0?null:e);if(t.length&&t.every(e=>typeof e==`number`&&Number.isFinite(e))){let e=kn(n);if(e)return e}if(t.length&&t.every(e=>typeof e==`boolean`))return{type:`L`,width:1,decimals:0,cells:n.map(e=>xn.encode(e===null?`?`:e?`T`:`F`))};let r=n.map(e=>e===null?null:En(e));return{type:`C`,width:Dn(r.map(e=>e?.length??0),1),decimals:0,cells:r}},jn=(e,t,n)=>{let r=e.length?e.map(e=>({name:e.short,...An(t.map(t=>v(t?.properties,e.field)))})):[{name:`FID`,...An(t.map((e,t)=>t))}],i=32+32*r.length+1,a=r.reduce((e,t)=>e+t.width,1),o=new Uint8Array(i+a*t.length+1),s=new DataView(o.buffer);s.setUint8(0,3),s.setUint8(1,n.getFullYear()-1900),s.setUint8(2,n.getMonth()+1),s.setUint8(3,n.getDate()),s.setUint32(4,t.length,!0),s.setUint16(8,i,!0),s.setUint16(10,a,!0),r.forEach(({name:e,type:t,width:n,decimals:r},i)=>{let a=32+32*i;o.set(xn.encode(e),a),s.setUint8(a+11,t.charCodeAt(0)),s.setUint8(a+16,n),s.setUint8(a+17,r)}),s.setUint8(i-1,13),o.fill(Sn,i,o.length-1);let c=i;return t.forEach((e,t)=>{c+=1,r.forEach(({type:e,width:n,cells:r})=>{let i=r[t];i&&o.set(i,e===`N`?c+n-i.length:c),c+=n})}),s.setUint8(o.length-1,26),o},Mn=e=>`﻿`+[[`short`,`column`,`header`],...e.map(({short:e,field:t,header:n})=>[e,t,n])].map(e=>e.map(Ht).join(`,`)).join(`\r
`),Nn=(e,t,n)=>{let r=new Set(Lt(t,{exclude:n}).map(({field:e})=>e));return e.filter(({field:e})=>r.has(e))},Pn=(e,{stem:t=`features`,fields:n,exclude:r,labelResolver:i,today:a=new Date}={})=>{let o=e?.features??[],s=bn(Lt(o,{fields:n,exclude:r,labelResolver:i})),c=[];return rn.forEach(({name:e,types:i,shape:l})=>{let u=o.filter(e=>i.includes(e?.geometry?.type)).map(e=>({feature:e,parts:fn(e.geometry)})).filter(({parts:e})=>e.length);if(!u.length)return;let d=l??(u.every(({feature:e})=>e.geometry.type===`Point`)?$t:nn),f=n?.length?s:Nn(s,u.map(({feature:e})=>e),r),{shp:p,shx:m}=vn(d,u.map(({parts:e})=>e)),h=`${t}-${e}`;c.push({name:`${h}.shp`,bytes:p},{name:`${h}.shx`,bytes:m},{name:`${h}.dbf`,bytes:jn(f,u.map(({feature:e})=>e),a)},{name:`${h}.prj`,bytes:xn.encode(Qt)},{name:`${h}.cpg`,bytes:xn.encode(`UTF-8`)})}),c.push({name:`${t}-fields.csv`,bytes:xn.encode(Mn(s))}),c};function G(e,t){return Array.from(e.getElementsByTagName(t))}function Fn(e){return e[0]===`#`?e:`#${e}`}function In(e,t,n){return Array.from(e.getElementsByTagNameNS(n,t))}function K(e){return e?.normalize(),e?.textContent||``}function q(e,t,n){let r=e.getElementsByTagName(t),i=r.length?r[0]:null;return i&&n&&n(i),i}function J(e,t,n){let r={};if(!e)return r;let i=e.getElementsByTagName(t),a=i.length?i[0]:null;return a&&n?n(a,r):r}function Ln(e,t,n){let r=K(q(e,t));return r&&n&&n(r)||{}}function Rn(e,t,n){let r=Number.parseFloat(K(q(e,t)));if(!Number.isNaN(r))return r&&n&&n(r)||{}}function Y(e,t,n){let r=Number.parseFloat(K(q(e,t)));if(!Number.isNaN(r))return n&&n(r),r}function zn(e,t){let n={};for(let r of t)Ln(e,r,e=>{n[r]=e});return n}function Bn(e){return e?.nodeType===1}function Vn(e){let t=[];if(e===null)return t;for(let n of Array.from(e.childNodes)){if(!Bn(n))continue;let e=Hn(n.nodeName);if(e===`gpxtpx:TrackPointExtension`)t=t.concat(Vn(n));else{let r=K(n);t.push([e,Un(r)])}}return t}function Hn(e){return[`heart`,`gpxtpx:hr`,`hr`].includes(e)?`heart`:e}function Un(e){let t=Number.parseFloat(e);return Number.isNaN(t)?e:t}function Wn(e){let t=[Number.parseFloat(e.getAttribute(`lon`)||``),Number.parseFloat(e.getAttribute(`lat`)||``)];if(Number.isNaN(t[0])||Number.isNaN(t[1]))return null;Y(e,`ele`,e=>{t.push(e)});let n=q(e,`time`);return{coordinates:t,time:n?K(n):null,extendedValues:Vn(q(e,`extensions`))}}function Gn(e){return J(e,`line`,e=>Object.assign({},Ln(e,`color`,e=>({stroke:`#${e}`})),Rn(e,`opacity`,e=>({"stroke-opacity":e})),Rn(e,`width`,e=>({"stroke-width":e*96/25.4}))))}function Kn(e,t){let n=zn(t,[`name`,`cmt`,`desc`,`type`,`time`,`keywords`]);for(let[r,i]of e)for(let e of Array.from(t.getElementsByTagNameNS(i,`*`)))n[e.tagName.replace(`:`,`_`)]=K(e)?.trim();let r=G(t,`link`);return r.length&&(n.links=r.map(e=>Object.assign({href:e.getAttribute(`href`)},zn(e,[`text`,`type`])))),n}function qn(e,t){let n=G(e,t),r=[],i=[],a={};for(let e=0;e<n.length;e++){let t=Wn(n[e]);if(t){r.push(t.coordinates),t.time&&i.push(t.time);for(let[r,i]of t.extendedValues){let t=r===`heart`?r:`${r.replace(`gpxtpx:`,``)}s`;a[t]||(a[t]=Array(n.length).fill(null)),a[t][e]=i}}}if(!(r.length<2))return{line:r,times:i,extendedValues:a}}function Jn(e,t){let n=qn(t,`rtept`);if(n)return{type:`Feature`,properties:Object.assign({_gpxType:`rte`},Kn(e,t),Gn(q(t,`extensions`))),geometry:{type:`LineString`,coordinates:n.line}}}function Yn(e,t){let n=G(t,`trkseg`),r=[],i=[],a=[];for(let e of n){let t=qn(e,`trkpt`);t&&(a.push(t),t.times?.length&&i.push(t.times))}if(a.length===0)return null;let o=a.length>1,s=Object.assign({_gpxType:`trk`},Kn(e,t),Gn(q(t,`extensions`)),i.length?{coordinateProperties:{times:o?i:i[0]}}:{});for(let e=0;e<a.length;e++){let t=a[e];r.push(t.line),s.coordinateProperties||(s.coordinateProperties={});let n=s.coordinateProperties;for(let[r,i]of Object.entries(t.extendedValues))o?(n[r]||(n[r]=a.map(e=>Array(e.line.length).fill(null))),n[r][e]=i):n[r]=i}return{type:`Feature`,properties:s,geometry:o?{type:`MultiLineString`,coordinates:r}:{type:`LineString`,coordinates:r[0]}}}function Xn(e,t){let n=Object.assign(Kn(e,t),zn(t,[`sym`])),r=Wn(t);return r?{type:`Feature`,properties:n,geometry:{type:`Point`,coordinates:r.coordinates}}:null}function*Zn(e){let t=e,n=`http://www.garmin.com/xmlschemas/GpxExtensions/v3`,r=[[`gpxx`,n]],i=t.getElementsByTagName(`gpx`)[0]?.attributes;if(i)for(let e of Array.from(i))e.name?.startsWith(`xmlns:`)&&e.value!==n&&r.push([e.name,e.value]);for(let e of G(t,`trk`)){let t=Yn(r,e);t&&(yield t)}for(let e of G(t,`rte`)){let t=Jn(r,e);t&&(yield t)}for(let e of G(t,`wpt`)){let t=Xn(r,e);t&&(yield t)}}function Qn(e){return{type:`FeatureCollection`,features:Array.from(Zn(e))}}function $n(e,t){let n={},r=t===`stroke`||t===`fill`?t:`${t}-color`;return e[0]===`#`&&(e=e.substring(1)),e.length===6||e.length===3?n[r]=`#${e}`:e.length===8&&(n[`${t}-opacity`]=Number.parseInt(e.substring(0,2),16)/255,n[r]=`#${e.substring(6,8)}${e.substring(4,6)}${e.substring(2,4)}`),n}function er(e,t,n){let r={};return Y(e,t,e=>{r[n]=e}),r}function tr(e,t){return J(e,`color`,e=>$n(K(e),t))}function nr(e){return J(e,`Icon`,(e,t)=>(Ln(e,`href`,e=>{t.icon=e}),t))}function rr(e){return J(e,`IconStyle`,e=>Object.assign(tr(e,`icon`),er(e,`scale`,`icon-scale`),er(e,`heading`,`icon-heading`),J(e,`hotSpot`,e=>{let t=Number.parseFloat(e.getAttribute(`x`)||``),n=Number.parseFloat(e.getAttribute(`y`)||``),r=e.getAttribute(`xunits`)||``,i=e.getAttribute(`yunits`)||``;return!Number.isNaN(t)&&!Number.isNaN(n)?{"icon-offset":[t,n],"icon-offset-units":[r,i]}:{}}),nr(e)))}function ir(e){return J(e,`LabelStyle`,e=>Object.assign(tr(e,`label`),er(e,`scale`,`label-scale`)))}function ar(e){return J(e,`LineStyle`,e=>Object.assign(tr(e,`stroke`),er(e,`width`,`stroke-width`)))}function or(e){return J(e,`PolyStyle`,(e,t)=>Object.assign(t,J(e,`color`,e=>$n(K(e),`fill`)),Ln(e,`fill`,e=>{if(e===`0`)return{"fill-opacity":0}}),Ln(e,`outline`,e=>{if(e===`0`)return{"stroke-opacity":0}})))}function sr(e){return Object.assign({},or(e),ar(e),ir(e),rr(e))}var cr=/\s*/g,lr=/^\s*|\s*$/g,ur=/\s+/;function dr(e){return e.replace(cr,``).split(`,`).map(Number.parseFloat).filter(e=>!Number.isNaN(e)).slice(0,3)}function fr(e){return e.replace(lr,``).split(ur).map(dr).filter(e=>e.length>=2)}function pr(e){let t=G(e,`coord`);t.length===0&&(t=In(e,`coord`,`*`));let n=t.map(e=>K(e).split(` `).map(Number.parseFloat));return n.length===0?null:{geometry:n.length>2?{type:`LineString`,coordinates:n}:{type:`Point`,coordinates:n[0]},times:G(e,`when`).map(e=>K(e))}}function mr(e){if(e.length===0)return e;let t=e[0],n=e[e.length-1],r=!0;for(let e=0;e<Math.max(t.length,n.length);e++)if(t[e]!==n[e]){r=!1;break}return r?e:e.concat([e[0]])}function hr(e){return K(q(e,`coordinates`))}function gr(e){let t=[],n=[];for(let r=0;r<e.childNodes.length;r++){let i=e.childNodes.item(r);if(Bn(i))switch(i.tagName){case`MultiGeometry`:case`MultiTrack`:case`gx:MultiTrack`:{let e=gr(i);t=t.concat(e.geometries),n=n.concat(e.coordTimes);break}case`Point`:{let e=dr(hr(i));e.length>=2&&t.push({type:`Point`,coordinates:e});break}case`LinearRing`:case`LineString`:{let e=fr(hr(i));e.length>=2&&t.push({type:`LineString`,coordinates:e});break}case`Polygon`:{let e=[];for(let t of G(i,`LinearRing`)){let n=mr(fr(hr(t)));n.length>=4&&e.push(n)}e.length&&t.push({type:`Polygon`,coordinates:e});break}case`Track`:case`gx:Track`:{let e=pr(i);if(!e)break;let{times:r,geometry:a}=e;t.push(a),r.length&&n.push(r);break}}}return{geometries:t,coordTimes:n}}var _r=e=>Number(e),vr={string:e=>e,int:_r,uint:_r,short:_r,ushort:_r,float:_r,double:_r,bool:e=>!!e};function yr(e,t){return J(e,`ExtendedData`,(e,n)=>{for(let t of G(e,`Data`))n[t.getAttribute(`name`)||``]=K(q(t,`value`));for(let r of G(e,`SimpleData`)){let e=r.getAttribute(`name`)||``;n[e]=(t[e]||vr.string)(K(r))}return n})}function br(e){let t=q(e,`description`);for(let e of Array.from(t?.childNodes||[]))if(e.nodeType===4)return{description:{"@type":`html`,value:K(e)}};return{}}function xr(e){return J(e,`TimeSpan`,e=>({timespan:{begin:K(q(e,`begin`)),end:K(q(e,`end`))}}))}function Sr(e){return J(e,`TimeStamp`,e=>({timestamp:K(q(e,`when`))}))}function Cr(e,t){return Ln(e,`styleUrl`,e=>(e=Fn(e),t[e]?Object.assign({styleUrl:e},t[e]):{styleUrl:e}))}var X;(function(e){e.ABSOLUTE=`absolute`,e.RELATIVE_TO_GROUND=`relativeToGround`,e.CLAMP_TO_GROUND=`clampToGround`,e.CLAMP_TO_SEAFLOOR=`clampToSeaFloor`,e.RELATIVE_TO_SEAFLOOR=`relativeToSeaFloor`})(X||(X={}));function wr(e){switch(e?.textContent){case X.ABSOLUTE:return X.ABSOLUTE;case X.CLAMP_TO_GROUND:return X.CLAMP_TO_GROUND;case X.CLAMP_TO_SEAFLOOR:return X.CLAMP_TO_SEAFLOOR;case X.RELATIVE_TO_GROUND:return X.RELATIVE_TO_GROUND;case X.RELATIVE_TO_SEAFLOOR:return X.RELATIVE_TO_SEAFLOOR}return null}function Tr(e){return q(e,`gx:LatLonQuad`)?{geometry:{type:`Polygon`,coordinates:[mr(fr(hr(e)))]}}:Or(e)}var Er=Math.PI/180;function Dr(e,t,n){let r=[(e[0]+e[2])/2,(e[1]+e[3])/2];return[t[0].map(e=>{let t=e[1]-r[1],i=e[0]-r[0],a=Math.sqrt(t**2+i**2),o=Math.atan2(t,i)+n*Er;return[r[0]+Math.cos(o)*a,r[1]+Math.sin(o)*a]})]}function Or(e){let t=q(e,`LatLonBox`);if(t){let e=Y(t,`north`),n=Y(t,`west`),r=Y(t,`east`),i=Y(t,`south`),a=Y(t,`rotation`);if(typeof e==`number`&&typeof i==`number`&&typeof n==`number`&&typeof r==`number`){let t=[n,i,r,e],o=[[[n,e],[r,e],[r,i],[n,i],[n,e]]];return typeof a==`number`&&(o=Dr(t,o,a)),{bbox:t,geometry:{type:`Polygon`,coordinates:o}}}}return null}function kr(e,t,n,r){let i=Tr(e),a=i?.geometry||null;if(!a&&r.skipNullGeometry)return null;let o={type:`Feature`,geometry:a,properties:Object.assign({"@geometry-type":`groundoverlay`},zn(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`description`]),br(e),Cr(e,t),sr(e),nr(e),yr(e,n),xr(e),Sr(e))};i?.bbox&&(o.bbox=i.bbox),o.properties?.visibility!==void 0&&(o.properties.visibility=o.properties.visibility!==`0`);let s=e.getAttribute(`id`);return s!==null&&s!==``&&(o.id=s),o}function Ar(e){let t=q(e,`Region`);return t?{coordinateBox:Mr(t),lod:jr(e)}:null}function jr(e){let t=q(e,`Lod`);return t?[Y(t,`minLodPixels`)??-1,Y(t,`maxLodPixels`)??-1,Y(t,`minFadeExtent`)??null,Y(t,`maxFadeExtent`)??null]:null}function Mr(e){let t=q(e,`LatLonAltBox`);if(t){let e=Y(t,`north`),n=Y(t,`west`),r=Y(t,`east`),i=Y(t,`south`);if(wr(q(t,`altitudeMode`)||q(t,`gx:altitudeMode`))&&console.debug(`Encountered an unsupported feature of KML for togeojson: please contact developers for support of altitude mode.`),typeof e==`number`&&typeof i==`number`&&typeof n==`number`&&typeof r==`number`)return{bbox:[n,i,r,e],geometry:{type:`Polygon`,coordinates:[[[n,e],[r,e],[r,i],[n,i],[n,e]]]}}}return null}function Nr(e){let t=q(e,`Link`);return t?zn(t,[`href`,`refreshMode`,`refreshInterval`,`viewRefreshMode`,`viewRefreshTime`,`viewBoundScale`,`viewFormat`,`httpQuery`]):{}}function Pr(e,t,n,r){let i=Ar(e),a=i?.coordinateBox?.geometry||null;if(!a&&r.skipNullGeometry)return null;let o={type:`Feature`,geometry:a,properties:Object.assign({"@geometry-type":`networklink`},zn(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`styleUrl`,`refreshVisibility`,`flyToView`,`description`]),br(e),Cr(e,t),sr(e),nr(e),yr(e,n),xr(e),Sr(e),Nr(e),i?.lod?{lod:i.lod}:{})};i?.coordinateBox?.bbox&&(o.bbox=i.coordinateBox.bbox),o.properties?.visibility!==void 0&&(o.properties.visibility=o.properties.visibility!==`0`);let s=e.getAttribute(`id`);return s!==null&&s!==``&&(o.id=s),o}function Fr(e){return e.length===0?null:e.length===1?e[0]:{type:`GeometryCollection`,geometries:e}}function Ir(e,t,n,r){let{coordTimes:i,geometries:a}=gr(e),o=Fr(a);if(!o&&r.skipNullGeometry)return null;let s={type:`Feature`,geometry:o,properties:Object.assign(zn(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`description`]),br(e),Cr(e,t),sr(e),yr(e,n),xr(e),Sr(e),i.length?{coordinateProperties:{times:i.length===1?i[0]:i}}:{})};s.properties?.visibility!==void 0&&(s.properties.visibility=s.properties.visibility!==`0`);let c=e.getAttribute(`id`);return c!==null&&c!==``&&(s.id=c),s}function Lr(e){let t=e.getAttribute(`id`),n=e.parentNode;return!t&&Bn(n)&&n.localName===`CascadingStyle`&&(t=n.getAttribute(`kml:id`)||n.getAttribute(`id`)),Fn(t||``)}function Rr(e){let t={};for(let n of G(e,`Style`))t[Lr(n)]=sr(n);for(let n of G(e,`StyleMap`)){let e=Fn(n.getAttribute(`id`)||``);Ln(n,`styleUrl`,n=>{n=Fn(n),t[n]&&(t[e]=t[n])})}return t}function zr(e){let t={};for(let n of G(e,`SimpleField`))t[n.getAttribute(`name`)||``]=vr[n.getAttribute(`type`)||``]||vr.string;return t}function*Br(e,t={skipNullGeometry:!1}){let n=e,r=Rr(n),i=zr(n);for(let e of G(n,`Placemark`)){let n=Ir(e,r,i,t);n&&(yield n)}for(let e of G(n,`GroundOverlay`)){let n=kr(e,r,i,t);n&&(yield n)}for(let e of G(n,`NetworkLink`)){let n=Pr(e,r,i,t);n&&(yield n)}}function Vr(e,t={skipNullGeometry:!1}){return{type:`FeatureCollection`,features:Array.from(Br(e,t))}}var Hr={bytes:20971520,positions:2e5},Ur=(e,t=Hr)=>e>t.bytes?{refused:`tooLarge`,size:e,limit:t.bytes}:null,Wr=e=>new DOMParser().parseFromString(e,`application/xml`),Gr=e=>!e?.documentElement||e.getElementsByTagName(`parsererror`).length>0,Kr=e=>({type:`Feature`,...e.id!==void 0&&{id:e.id},properties:e.properties&&typeof e.properties==`object`?e.properties:{},geometry:e.geometry??null}),qr=new Set([`Point`,`MultiPoint`,`LineString`,`MultiLineString`,`Polygon`,`MultiPolygon`,`GeometryCollection`]),Jr=e=>{let t;try{t=JSON.parse(e)}catch{return null}return t?.type===`FeatureCollection`&&Array.isArray(t.features)?{type:`FeatureCollection`,features:t.features.filter(e=>e?.type===`Feature`).map(Kr)}:t?.type===`Feature`?{type:`FeatureCollection`,features:[Kr(t)]}:qr.has(t?.type)?{type:`FeatureCollection`,features:[Kr({geometry:t})]}:null},Yr=[`Style`,`StyleMap`,`styleUrl`],Xr=e=>(Yr.forEach(t=>{Array.from(e.getElementsByTagName(t)).forEach(e=>e.parentNode?.removeChild(e))}),e),Zr=e=>{let t=e.properties?.description;return t&&typeof t==`object`&&`value`in t?{...e,properties:{...e.properties,description:String(t.value??``)}}:e},Qr=e=>({type:`FeatureCollection`,features:Vr(Xr(e),{skipNullGeometry:!0}).features.map(Zr).map(Kr)}),$r=e=>({type:`FeatureCollection`,features:Qn(e).features.map(Kr)}),ei=(e,t)=>{let n;try{n=t(e)}catch{return null}if(Gr(n))return null;let r=n.documentElement.localName??n.documentElement.nodeName;return r===`kml`?{format:`kml`,collection:Qr(n)}:r===`gpx`?{format:`gpx`,collection:$r(n)}:null},ti=e=>{let[t,n]=e;return!Number.isFinite(t)||!Number.isFinite(n)?`unreadable`:Math.abs(t)>180||Math.abs(n)>90?`notDegrees`:null},ni=(e,t=``)=>{let n=new Uint8Array(e,0,Math.min(4,e.byteLength));return n[0]===80&&n[1]===75&&(n[2]===3&&n[3]===4||n[2]===5&&n[3]===6)?`zip`:n[0]===0&&n[1]===0&&n[2]===39&&n[3]===10?`shp`:/\.(dbf|shx|prj|cpg)$/i.test(t)?`part`:`text`},ri=({format:e,collection:t},n)=>{let r=t.features.map(e=>({feature:e,positions:ve(e.geometry)})).filter(({positions:e})=>e.length>0);if(r.length===0)return{refused:`empty`};let i=r.reduce((e,t)=>e+t.positions.length,0);if(i>n.positions)return{refused:`tooManyPoints`,count:i,limit:n.positions};for(let e of r)for(let t of e.positions){let e=ti(t);if(e)return{refused:e}}return{format:e,collection:{type:`FeatureCollection`,features:r.map(({feature:e})=>e)},positions:i}},ii=(e,{parse:t=Wr,limits:n=Hr}={})=>{let r=String(e??``).replace(/^﻿/,``).trimStart(),i=null;try{if(r.startsWith(`{`)){let e=Jr(r);i=e&&{format:`geojson`,collection:e}}else r.startsWith(`<`)&&(i=ei(r,t))}catch(e){console.warn(`perun-atlas: a file could not be read`,e),i=null}return i?ri(i,n):{refused:`unreadable`}},ai=e=>{let t=new Set(e.flatMap(({collection:e})=>e.features.flatMap(e=>Object.keys(e?.properties??{})))),n=`layer`;for(let e=2;t.has(n);e+=1)n=`layer_${e}`;return n},oi=(e,{limits:t=Hr}={})=>{if(e.refused)return e;let n=e.layers.length>1?ai(e.layers):null,r=e.layers.flatMap(({name:e,collection:t})=>t.features.map(t=>{let r=Kr(t);return n?{...r,properties:{[n]:e,...r.properties}}:r})),i=e.layers.some(e=>e.assumed),a=ri({format:`shapefile`,collection:{type:`FeatureCollection`,features:r}},t);return a.refused===`notDegrees`&&i?{refused:`noPrj`}:a.refused?a:{...a,assumed:i}},si=i({FILE_LIMITS:()=>Hr,SYSTEM_FIELDS:()=>s,bboxIn:()=>Ee,bindPath:()=>b,crsFor:()=>Ce,descriptorOf:()=>qe,fetchGeometry:()=>Ke,fetchLayers:()=>it,fetchRows:()=>ct,fetchSchema:()=>dt,fetchUISchema:()=>ft,fileKind:()=>ni,fillBody:()=>Mt,firstOf:()=>at,fromDegrees:()=>Ae,identifiersOf:()=>wt,identityOf:()=>Je,inDegrees:()=>ke,latLngOf:()=>Oe,mapPositions:()=>be,matchesIdentity:()=>Ye,pickFields:()=>pt,pointIn:()=>De,positionsOf:()=>ve,postTo:()=>Nt,readFile:()=>ii,readLayers:()=>oi,ringIn:()=>Fe,sizeRefusal:()=>Ur,spanTo:()=>St,toCSV:()=>Ut,toGeoJSON:()=>Ft,toKML:()=>Zt,toShapefile:()=>Pn,unitsPerMetre:()=>je,usableUI:()=>yt,valueAt:()=>v,withGroups:()=>mt,withinCircle:()=>Ct}),ci={plus:[`M12 5l0 14`,`M5 12l14 0`],minus:[`M5 12l14 0`],maximize:[`M4 8v-2a2 2 0 0 1 2 -2h2`,`M4 16v2a2 2 0 0 0 2 2h2`,`M16 4h2a2 2 0 0 1 2 2v2`,`M16 20h2a2 2 0 0 0 2 -2v-2`],minimize:[`M15 19v-2a2 2 0 0 1 2 -2h2`,`M15 5v2a2 2 0 0 0 2 2h2`,`M5 15h2a2 2 0 0 1 2 2v2`,`M5 9h2a2 2 0 0 0 2 -2v-2`],"zoom-scan":[`M4 8v-2a2 2 0 0 1 2 -2h2`,`M4 16v2a2 2 0 0 0 2 2h2`,`M16 4h2a2 2 0 0 1 2 2v2`,`M16 20h2a2 2 0 0 0 2 -2v-2`,`M8 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0`,`M16 16l-2.5 -2.5`]},li=1.75,ui=(e,t={})=>{let n=ci[e];if(!n)return``;let{className:r=`atlas-icon atlas-icon--${e}`,size:i=18,stroke:a=li}=t;return`<svg xmlns="http://www.w3.org/2000/svg" class="${r}" width="${i}" height="${i}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${a}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">`+n.map(e=>`<path d="${e}"/>`).join(``)+`</svg>`},di=(e,t,n)=>n>t?(Math.min(Math.max(e,t),n)-t)/(n-t):0,fi=e=>e<=10?1:e<=20?2:5,pi=(e,t)=>{if(!Number.isFinite(e)||!Number.isFinite(t)||!(t>e))return[];let n=fi(t-e+1),r=[];for(let i=Math.ceil(e);i<=t;i+=1){let a=(i-e)%n===0;r.push({zoom:i,offset:di(i,e,t),labelled:i===e||i===t||a&&t-i>=n})}return r},mi=(e,t,n)=>!Number.isFinite(t)||!Number.isFinite(n)||!(n>t)?[]:(e??[]).filter(e=>Number.isFinite(e?.from)).map(e=>({mark:e,to:e.to??e.from})).filter(({mark:e,to:r})=>r>=t&&e.from<=n).map(({mark:e,to:r})=>{let i=di(e.from,t,n),a=di(Math.max(r,e.from),t,n);return{...e,from:Math.min(Math.max(e.from,t),n),to:Math.min(Math.max(r,t),n),offset:i,span:a-i}}),hi=.0254/96,gi=(e,t)=>!(e>0)||!(t>0)?null:e/t/hi,_i=e=>{if(!(e>0)||!Number.isFinite(e))return null;let t=10**(Math.floor(Math.log10(e))-1);return Math.round(e/t)*t},vi=e=>{let t=_i(e);return t===null?null:`1:${String(Math.max(Math.round(t),1)).replace(/\B(?=(\d{3})+(?!\d))/g,`\xA0`)}`},yi=[24,24],{createContext:bi,useContext:xi}=t.React,Si=bi(null),Ci=()=>xi(Si)??U.Map,{factory:wi}=U,{useEffect:Ti,useState:Ei}=t.React,Di=null,Oi=()=>(Di||(Di=wi.Control.extend({onAdd(){return this.options.container}})),Di),ki=(e,t=!0)=>{let n=Ci(),[r]=Ei(()=>wi.DomUtil.create(`div`,`leaflet-control`));return Ti(()=>{if(!t)return;let i=new(Oi())({position:e,container:r}).addTo(n);return()=>{i.remove()}},[n,e,t,r]),r},Ai=({position:e,shown:n=!0,children:r})=>t.ReactDOM.createPortal(r,ki(e,n)),ji=e=>{e&&(wi.DomEvent.disableClickPropagation(e),wi.DomEvent.disableScrollPropagation(e))};function Mi(e){let t=document.createElement(`style`);t.textContent=e,document.head.insertBefore(t,document.head.firstChild)}Mi(`/*
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
`);var{useEffect:Ni,useMemo:Pi,useState:Fi}=t.React,Ii={in:`Zoom in`,out:`Zoom out`,level:`Zoom level`,upscaled:`Above here the basemap is enlarged, not sharper`,fit:`Zoom to the data`},Li=0,Ri=e=>`${(e*100).toFixed(4)}%`,zi=({name:e})=>t.React.createElement(`svg`,{className:`atlas-icon atlas-icon--${e}`,width:18,height:18,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:li,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,focusable:`false`},ci[e].map(e=>t.React.createElement(`path`,{key:e,d:e})));zi.propTypes={name:t.PropTypes.oneOf(Object.keys(ci)).isRequired};var Bi=({position:e=`bottomright`,marks:n=[],labels:r,onFit:i})=>{let a={...Ii,...r},o=Ci(),[s]=Fi(()=>(Li+=1,`atlas-zoom-marks-${Li}`)),[c,l]=Fi(()=>({min:o.getMinZoom(),max:o.getMaxZoom()})),[u,d]=Fi(()=>o.getZoom());Ni(()=>{let e=()=>d(o.getZoom()),t=()=>{l({min:o.getMinZoom(),max:o.getMaxZoom()}),e()};return o.on(`zoomend`,e),o.on(`zoomlevelschange`,t),t(),()=>{o.off(`zoomend`,e),o.off(`zoomlevelschange`,t)}},[o]);let{min:f,max:p}=c,m=Pi(()=>pi(f,p),[f,p]),h=Pi(()=>mi(n,f,p),[n,f,p]),g=Math.round(u),_=h.filter(e=>e.label).map(e=>e.label).join(`. `),v=t.React.createElement(`div`,{className:`atlas-zoom`},i&&t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step atlas-zoom__fit`,onClick:i,title:a.fit,"aria-label":a.fit},t.React.createElement(zi,{name:`zoom-scan`})),t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step`,onClick:()=>o.zoomIn(),disabled:g>=p,title:a.in,"aria-label":a.in},t.React.createElement(zi,{name:`plus`})),m.length>1&&t.React.createElement(`div`,{className:`atlas-zoom__rail`},t.React.createElement(`div`,{className:`atlas-zoom__track`}),h.map(e=>t.React.createElement(`span`,{key:`${e.kind??`mark`}-${e.from}-${e.to}`,className:`atlas-zoom__mark atlas-zoom__mark--${e.kind??`plain`}`,style:{bottom:Ri(e.offset),height:Ri(e.span)},title:e.label})),m.map(e=>t.React.createElement(`span`,{key:e.zoom,className:[`atlas-zoom__rung`,e.labelled?`atlas-zoom__rung--numbered`:``,e.zoom===g?`atlas-zoom__rung--here`:``].filter(Boolean).join(` `),style:{bottom:Ri(e.offset)}},e.labelled?t.React.createElement(`i`,{className:`atlas-zoom__number`},e.zoom):null)),t.React.createElement(`input`,{type:`range`,className:`atlas-zoom__slider`,min:f,max:p,step:1,value:Math.min(Math.max(g,f),p),onChange:e=>o.setZoom(Number(e.target.value)),"aria-label":a.level,"aria-describedby":_?s:void 0}),_?t.React.createElement(`p`,{className:`atlas-zoom__described`,id:s},_):null),t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step`,onClick:()=>o.zoomOut(),disabled:g<=f,title:a.out,"aria-label":a.out},t.React.createElement(zi,{name:`minus`})),t.React.createElement(`output`,{className:`atlas-zoom__level`,title:a.level},g));return t.React.createElement(Ai,{position:e},t.React.createElement(`div`,{className:`atlas-zoom__host`,ref:ji},v))};Bi.propTypes={position:t.PropTypes.string,marks:t.PropTypes.array,labels:t.PropTypes.object,onFit:t.PropTypes.func},Mi(`/*
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
`);var{Map:Z,control:Vi,factory:Q}=U,{layerControl:Hi}=me,{useEffect:Ui,useMemo:Wi,useRef:$,useState:Gi}=t.React,Ki=140,qi=!1,Ji=new Set;Z.eachLayer(e=>Ji.add(e));var Yi=()=>{let e=[];Z.eachLayer(t=>{Ji.has(t)||e.push(t)}),e.forEach(e=>Z.removeLayer(e))},Xi=({session:e,overrides:n,layerSwitcher:r=!1,zoomControl:i=!0,zoomPosition:a=`bottomright`,zoomMarks:o,zoomLabels:s,fit:c=!0,extent:l=null,view:u=null,coordinates:d=!0,coordinatesPosition:f=`bottomcenter`,measure:p=!0,measurePosition:m=`topleft`,measureTools:h,fullscreen:g=!0,fullscreenPosition:_=`topleft`,locate:v=!0,locatePosition:y=`topleft`,scale:b=!0,scalePosition:x=`bottomleft`,scaleRatio:S=!0,className:C=`atlas-map`,style:w,onReady:ee,onError:T,children:E})=>{let D=$(null),O=$(null),k=$(null),A=$(null),te=$(null),j=$(null),M=$(null),N=$(null),ne=$(null),P=$(null),re=$(null),F=$(null),I=$(null),L=$(l);L.current=l;let[R,z]=Gi(!1),[B,ie]=Gi(null),[V,ae]=Gi(null);Ui(()=>{let t=!1;if(qi){let e=Error(`perun-atlas: a map is already mounted. spatial provides one instance per page until 2.0 introduces createMap; render at most one AtlasMap at a time.`);ie(e),T?.(e);return}return qi=!0,(async()=>{try{let o=await de(n);if(t)return;Z.setView(o.center,o.zoom,{animate:!1}),Ve(o);let l=Z.getContainer();if(P.current={height:l.style.height,width:l.style.width},l.style.height=`100%`,l.style.width=`100%`,D.current?.appendChild(l),Yi(),Z.setMinZoom(o.minZoom).setMaxZoom(o.maxZoom),Z.setView(u?.center??o.center,u?.zoom??o.zoom,{animate:!1}),g&&Q.control.fullscreen&&(j.current=Q.control.fullscreen({position:_,content:ui(`maximize`)+ui(`minimize`)}).addTo(Z)),v&&ge.LocateControl?M.current=Vi(ge.LocateControl,{},{position:y}):v&&console.warn(`perun-atlas: the engine on this environment has no locate control; skipping it.`),ne.current=Q.control.attribution({prefix:!1}).addTo(Z),o.attribution&&ne.current.addAttribution(o.attribution),i&&i!==`rail`&&(k.current=Q.control.zoom({position:a,zoomInText:ui(`plus`),zoomOutText:ui(`minus`)}).addTo(Z),c)){let e=s?.fit??Ii.fit,t=k.current.getContainer(),n=Q.DomUtil.create(`a`,`atlas-fit`);n.href=`#`,n.title=e,n.setAttribute(`role`,`button`),n.setAttribute(`aria-label`,e),n.innerHTML=ui(`zoom-scan`),n.style.display=L.current?``:`none`,Q.DomEvent.disableClickPropagation(n),Q.DomEvent.on(n,`click`,Q.DomEvent.stop),Q.DomEvent.on(n,`click`,()=>{L.current&&Z.fitBounds(L.current,{padding:yi})}),t.insertBefore(n,t.firstChild),I.current=n}if(b){let e=o.units!==`imperial`;N.current=Q.control.scale({position:x,metric:e,imperial:!e,maxWidth:Ki}).addTo(Z)}if(b&&S&&N.current){let e=Q.DomUtil.create(`div`,`atlas-scale-ratio`,N.current.getContainer()),t=()=>{let t=Z.getSize(),n=Math.round(t.y/2),r=Math.min(t.x,Ki),i=Z.distance(Z.containerPointToLatLng(Q.point(0,n)),Z.containerPointToLatLng(Q.point(r,n)));e.textContent=vi(gi(i,r))??``};Z.on(`move zoomend`,t),t(),re.current=()=>Z.off(`move zoomend`,t)}if(d&&ge.CoordinatesControl){let e=Z._controlCorners?.[f]?f:`bottomleft`;A.current=Vi(ge.CoordinatesControl,{},{position:e})}else d&&console.warn(`perun-atlas: the engine on this environment has no coordinate readout; skipping it.`);p&&ge.MeasureControl?te.current=Vi(ge.MeasureControl,h?{tools:h}:{},{position:m}):p&&console.warn(`perun-atlas: the engine on this environment has no measurement control; skipping it.`);let{basemap:C,overlays:w}=await it(e,{maxZoom:o.maxZoom});if(t)return;let T=ot(C,u?.basemap)??at(C);T&&T.addTo(Z);let E=e=>ae(e?.options?.maxNativeZoom??null);E(T);let R=e=>E(e.layer);Z.on(`baselayerchange`,R),F.current=()=>Z.off(`baselayerchange`,R),r&&(O.current=Hi(C,w,{collapsed:!0}).addTo(Z)),Z.invalidateSize(),ee?.({map:Z,config:o,basemap:C,overlays:w}),z(!0)}catch(e){if(t)return;console.error(e),ie(e),T?.(e)}})(),()=>{t=!0,qi=!1,j.current?._toggleState&&Z.off(`enterFullscreen exitFullscreen`,j.current._toggleState,j.current),[O,k,A,te,j,M,N,ne].forEach(e=>{e.current&&(e.current.remove(),e.current=null)}),re.current?.(),re.current=null,F.current?.(),F.current=null,I.current=null,Yi();let e=Z.getContainer();e&&P.current&&(e.style.height=P.current.height,e.style.width=P.current.width,P.current=null),e?.parentNode&&e.parentNode.removeChild(e)}},[]),Ui(()=>{I.current&&(I.current.style.display=l?``:`none`)},[l]),Ui(()=>{let e=D.current;if(!e||typeof ResizeObserver>`u`)return;let t=null,n=new ResizeObserver(e=>{let n=e[0]?.contentRect;n&&n.width!==0&&n.height!==0&&(t!==null&&cancelAnimationFrame(t),t=requestAnimationFrame(()=>{t=null,Z.invalidateSize()}))});return n.observe(e),()=>{t!==null&&cancelAnimationFrame(t),n.disconnect()}},[R]);let oe=Wi(()=>[...V===null?[]:[{from:V,to:1/0,kind:`upscaled`,label:s?.upscaled??Ii.upscaled}],...o??[]],[V,o,s]);return B?t.React.createElement(`div`,{className:`${C} atlas-map-error`,role:`alert`},B.message):t.React.createElement(Si.Provider,{value:Z},t.React.createElement(`div`,{ref:D,className:C,style:{height:`100%`,...w}}),R&&i===`rail`&&t.React.createElement(Bi,{position:a,marks:oe,labels:s,onFit:c&&l?()=>Z.fitBounds(l,{padding:yi}):void 0}),R&&E)},{useEffect:Zi,useRef:Qi}=t.React,$i=e=>{let t=Qi(e);t.current=e;let n=Qi(null);return Zi(()=>{n.current?.(e)},[JSON.stringify(e)]),{hiddenRef:t,filterRef:n}},ea=(e,t)=>{e&&t&&Object.entries(t).forEach(([t,n])=>{t.startsWith(`--`)?e.style.setProperty(t,n):e.style[t]=n})},ta=e=>e instanceof Node?e:document.createTextNode(String(e)),na=(e,t,n)=>{let r=n.startsWith(`text/csv`)?`﻿`:``,i=URL.createObjectURL(new Blob([r,t],{type:n})),a=document.createElement(`a`);a.href=i,a.download=e,a.style.display=`none`,document.body.appendChild(a),a.click(),a.remove(),setTimeout(()=>URL.revokeObjectURL(i),0)},ra=async(e,t=document.body)=>{if(window.isSecureContext&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{}let n=document.createElement(`textarea`);n.value=e,n.setAttribute(`readonly`,``),n.setAttribute(`aria-hidden`,`true`),Object.assign(n.style,{position:`fixed`,top:`0`,left:`0`,opacity:`0`}),t.appendChild(n),n.select();let r=!1;try{r=document.execCommand(`copy`)}catch{r=!1}return n.remove(),r},ia=(e,t=[])=>{let n=new Set(t),r=[],i=[];return e.forEach(e=>{let t=n.has(e.key);t!==!!e.hidden&&(e.hidden=t,(t?r:i).push(e))}),{leaving:r,returning:i}},aa=(e,t)=>{let n=e.filter(({hidden:e})=>!e);n.forEach(({layer:e})=>e.bringToFront?.()),n.forEach(({layer:e})=>t?.get(e)?.bringToFront?.())},oa=(e,t=[],n)=>{let r=e?.features;if(!Array.isArray(r)||!t.length)return e;let i=new Set(t),a=r.filter(e=>!i.has(n(e)));return a.length===r.length?e:{...e,features:a}},sa=e=>{let t=e.filter(e=>!e.hidden),n=1/0,r=1/0,i=-1/0,a=-1/0,o=({lat:e,lng:t})=>{n=Math.min(n,e),r=Math.min(r,t),i=Math.max(i,e),a=Math.max(a,t)};return(t.length?t:e).forEach(({layer:e})=>{if(typeof e.getBounds==`function`){let t=e.getBounds();t?.isValid?.()&&(o(t.getSouthWest()),o(t.getNorthEast()))}else typeof e.getLatLng==`function`&&o(e.getLatLng())}),n===1/0?null:[[n,r],[i,a]]},ca=({title:e,rows:t},n={})=>{let r=document.createElement(`div`);if(r.className=[`atlas-popup`,n.className].filter(Boolean).join(` `),ea(r,n.style),e){let t=document.createElement(`p`);t.className=`atlas-popup-title`,t.textContent=e,ea(t,n.titleStyle),r.appendChild(t)}if(t.length){let e=document.createElement(`dl`);e.className=`atlas-popup-fields`,t.forEach(({label:t,value:r})=>{let i=document.createElement(`dt`);i.textContent=t,ea(i,n.labelStyle);let a=document.createElement(`dd`);a.textContent=r,ea(a,n.valueStyle),e.append(i,a)}),r.appendChild(e)}return r},la=(e,t,{popup:n,labelResolver:r}={})=>{if(n){let t=n(e);return t==null?null:ta(t)}let i=h(t,e,r);return i?ca(i,t?.popup):null},ua={className:`atlas-popup-shell`,maxWidth:280},{Map:da,factory:fa}=U,{useEffect:pa,useRef:ma}=t.React,ha=[],ga=({servicePath:e,context:t,reload:n,srid:r,statusRows:i,join:a,field:o,palette:s,fallback:c,descriptor:u,hidden:d=ha,onFeatureClick:f,onLegend:p,onShown:m,onLoadStart:h,onLoad:_,onError:v,tooltip:y,popup:b,labelResolver:x})=>{let S=ma(null),C=ma(0),{hiddenRef:w,filterRef:ee}=$i(d);return pa(()=>{let n=!1,d=N({field:o,palette:s,fallback:c}),T=P({field:o,palette:s}),E=async()=>{let c=++C.current;O={zoom:da.getZoom(),bounds:da.getBounds()};try{h?.();let v=await Ke(e,{...t||{},map:{...t?.map||{},bbox:Ee(r)}});if(n||c!==C.current)return;let E=a&&i?re(v,i,a):v;S.current&&da.removeLayer(S.current);let D=[],O=fa.geoJSON(E,{style:e=>l(u,{fillColor:d(e)}),onEachFeature:(e,t)=>{D.push({layer:t,feature:e,key:T(e),hidden:!1});let n=y?.(e);n&&t.bindTooltip(ta(n),{sticky:!0});let r=la(e,u,{popup:b,labelResolver:x});r&&t.bindPopup(r,ua),f&&t.on(`click`,()=>f(e,g(u,e,x)))}}),k=e=>{let{leaving:t,returning:n}=ia(D,e);return t.forEach(({layer:e})=>O.removeLayer(e)),n.forEach(({layer:e})=>O.addLayer(e)),n.length&&aa(D),t.length>0||n.length>0};k(w.current),S.current=O.addTo(da);let A=e=>m?.(oa(E,e,T));ee.current=e=>{k(e)&&A(e)},p?.(ne(E?.features,{field:o,palette:s})),A(w.current),_?.(E)}catch(e){console.error(`perun-atlas: choropleth failed to render`,e),!n&&c===C.current&&v?.(e)}},D=null,O=null,k=()=>!!O&&da.getZoom()===O.zoom&&O.bounds.contains(da.getBounds()),A=()=>{clearTimeout(D),D=setTimeout(()=>{k()||E()},250)};return E(),da.on(`moveend`,A),()=>{n=!0,ee.current=null,clearTimeout(D),da.off(`moveend`,A),S.current&&(da.removeLayer(S.current),S.current=null)}},[e,o,r,n,i,JSON.stringify(t??{})]),null};Mi(`/*
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
`);var{Map:_a,factory:va}=U,{useEffect:ya,useRef:ba}=t.React,xa=(...e)=>e.forEach(e=>{e.current&&(_a.removeLayer(e.current),e.current=null)}),Sa={color:`#b3261e`,weight:2,opacity:.95,fillColor:`#b3261e`,fillOpacity:.12},Ca={...Sa,dashArray:`5 4`,fillOpacity:.06},wa=({value:e,drawing:t=!1,onChange:n,onDrawn:r,style:i,editable:a=!0})=>{let o=ba(null),s=ba(null),c=ba(null),l=ba(n);l.current=n;let u=ba(r);return u.current=r,ya(()=>{let e=he?.draw?.circle;if(!t||!e){!t&&e?.isEnabled?.()&&e.disable(),t&&!e&&console.warn(`perun-atlas: the engine on this environment has no circle draw tool; skipping it.`);return}let n=({shape:e,layer:t})=>{if(e!==`circle`||!t)return;let n=t.getLatLng(),r=t.getRadius();_a.removeLayer(t);let i={lat:n.lat,lng:n.lng,radius:r};l.current?.(i),u.current?.(i)};return _a.on(`new_shape`,n),e.enable({templineStyle:Ca,hintlineStyle:{...Ca,fillOpacity:0},pathOptions:{...Sa,...i},cursorMarker:!0,tooltips:!1}),()=>{_a.off(`new_shape`,n),e.isEnabled?.()&&e.disable()}},[t]),ya(()=>{if(!e||!(e.radius>0)){xa(o,s,c);return}let t=va.latLng({lat:e.lat,lng:e.lng});if(o.current?(o.current.setLatLng(t),o.current.setRadius(e.radius)):o.current=va.circle(t,{...Sa,...i,radius:e.radius,showMeasurements:!0,interactive:!1}).addTo(_a),!a){xa(s,c);return}let n=va.latLng({lat:t.lat,lng:o.current.getBounds().getEast()});s.current?s.current.setLatLng(t):(s.current=va.marker(t,{icon:va.divIcon({className:`atlas-draw-handle atlas-draw-handle--centre`,html:``}),draggable:!0,zIndexOffset:1e3}).addTo(_a),s.current.on(`drag`,e=>{let t=e.target.getLatLng();l.current?.({lat:t.lat,lng:t.lng,radius:o.current?.getRadius()})})),c.current?c.current.setLatLng(n):(c.current=va.marker(n,{icon:va.divIcon({className:`atlas-draw-handle atlas-draw-handle--edge`,html:``}),draggable:!0,zIndexOffset:1e3}).addTo(_a),c.current.on(`drag`,e=>{let n=e.target.getLatLng(),r=s.current?.getLatLng()??t;l.current?.({lat:r.lat,lng:r.lng,radius:_a.distance(r,n)})}))},[e?.lat,e?.lng,e?.radius,a]),ya(()=>()=>xa(o,s,c),[]),null};Mi(`/*
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
`);var{useMemo:Ta}=t.React,Ea=({from:e,to:n,onChange:r,labels:i={},disabled:a=!1,className:o=`atlas-date-range`})=>{let s=Ta(()=>({type:`object`,properties:{from:{type:`string`,format:`date`,title:i.from??`From`},to:{type:`string`,format:`date`,title:i.to??`To`}}}),[i.from,i.to]),c=Ta(()=>({"ui:order":[`from`,`to`],"ui:submitButtonOptions":{norender:!0},from:{"ui:disabled":a},to:{"ui:disabled":a}}),[a]);return t.React.createElement(`div`,{className:o},t.React.createElement(t.Form,{idPrefix:`atlas-range`,schema:s,uiSchema:c,formData:{from:e,to:n},validator:t.validator,customValidate:(e,t)=>(e?.from&&e?.to&&e.from>e.to&&t.to.addError(i.invalidRange??`The end date is before the start date.`),t),liveValidate:!0,showErrorList:!1,noHtml5Validate:!0,onChange:({formData:e})=>r?.(e)},t.React.createElement(t.React.Fragment,null)))},{Icon:Da}=t.elements,{useState:Oa}=t.React,ka=({drawing:e,busy:n,onStart:r,onCancel:i,labels:a={}})=>t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn ${e?`atlas-panel__btn--primary`:`atlas-panel__btn--ghost`}`,"aria-pressed":e,onClick:e?i:r,disabled:n},t.React.createElement(Da,{name:`IconCircleDashed`,size:16,stroke:1.75,"aria-hidden":`true`}),a.draw??`Draw an area`),Aa=e=>`atlas-panel__drawbox${e?` atlas-panel__drawbox--off`:``}`,ja=0,Ma=()=>`atlas-draw-${ja+=1}`,Na=({shape:e,drawing:n,busy:r,onCancel:i,onRadius:a,onSave:o,note:s,form:c,caught:l,savable:u=!0,limits:d={},labels:f={}})=>{let{min:p=50,max:m=5e5,step:h=50}=d,g=!!e,[_]=Oa(Ma),v=`${_}-form`,y=!!c?.schema,b=r||!g||s?.required&&!String(s.value??``).trim()||!(!c||c.schema),x=()=>{!b&&u&&o?.()};return t.React.createElement(`div`,{className:`atlas-panel__draw`,role:`group`,"aria-label":f.draw??`Draw`},n&&!g&&t.React.createElement(`p`,{className:`atlas-panel__drawhint`},f.drawing??`Click a centre, then an edge`),g&&t.React.createElement(`label`,{className:`atlas-panel__drawfield`},t.React.createElement(`span`,null,f.radius??`Radius`),t.React.createElement(`span`,{className:Aa(r)},t.React.createElement(`input`,{type:`number`,inputMode:`numeric`,value:Math.round(e.radius),min:p,max:m,step:h,disabled:r,onChange:e=>{let t=Number(e.target.value);Number.isFinite(t)&&t>0&&a(t)}}),t.React.createElement(`span`,{className:`atlas-panel__drawunit`},f.metres??`m`))),g&&c&&!c.schema&&t.React.createElement(`p`,{className:`atlas-panel__drawhint`},c.loading?f.formLoading??`Loading the fields…`:f.formFailed??`These fields did not load, so there is nothing to save into.`),g&&c?.schema&&t.React.createElement(`div`,{className:`atlas-panel__drawform`},t.React.createElement(t.Form,{id:v,idPrefix:_,schema:c.schema,uiSchema:{"ui:submitButtonOptions":{norender:!0},...c.uiSchema},formData:c.data,validator:t.validator,disabled:r,liveValidate:!1,showErrorList:!1,onChange:({formData:e})=>c.onChange?.(e),onSubmit:x},t.React.createElement(t.React.Fragment,null))),g&&s&&t.React.createElement(`label`,{className:`atlas-panel__drawfield atlas-panel__drawfield--wide`},t.React.createElement(`span`,null,f.note??`Note`),t.React.createElement(`span`,{className:Aa(r)},t.React.createElement(`input`,{type:`text`,value:s.value??``,disabled:r,placeholder:f.notePlaceholder??``,onChange:e=>s.onChange(e.target.value)}))),g&&l&&t.React.createElement(`p`,{className:`atlas-panel__drawcount`,"aria-live":`polite`},t.React.createElement(`b`,null,l.count),t.React.createElement(`span`,null,f.caught??`inside`),t.React.createElement(`span`,{className:`atlas-panel__drawtotal`},`/ ${l.total}`)),g&&t.React.createElement(`div`,{className:`atlas-panel__drawactions`},u&&t.React.createElement(`button`,{type:y?`submit`:`button`,form:y?v:void 0,className:`atlas-panel__btn atlas-panel__btn--primary`,onClick:y?void 0:x,disabled:b},t.React.createElement(Da,{name:`IconDeviceFloppy`,size:16,stroke:1.75,"aria-hidden":`true`}),f.save??`Save`),t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:i,disabled:r},f.discard??`Discard`)))},Pa=({lat:e,lng:t})=>`${e.toFixed(6)},${t.toFixed(6)}`,Fa=(e,t,n)=>{let r=e.original.map(e=>{let r=t[Pa(e)];if(!r)return e;let i=n(r);return i&&i!==r?i.getLatLng():e}),i=r.map(Pa).join(` `);return i===e.key?null:{next:r,key:i}},Ia=e=>e<.5?4*e*e*e:1-(-2*e+2)**3/2,La=(e,t,n)=>t.map((t,r)=>{let i=e[r];return i?{lat:i.lat+(t.lat-i.lat)*n,lng:i.lng+(t.lng-i.lng)*n}:t}),Ra=e=>Array.isArray(e?.[0])?e.map(Ra).reverse():[...e??[]].reverse(),za=({factory:e,group:t,into:n,arrowOf:r})=>{let i=new WeakMap;return t.eachLayer(t=>{let a=r(t.feature);if(!a||typeof t.getLatLngs!=`function`)return;let o=a.reverse?Ra(t.getLatLngs()):t;i.set(t,e.polylineDecorator(o,{patterns:[{offset:a.offset??`12%`,repeat:a.repeat??160,symbol:e.Symbol.arrowHead({pixelSize:a.pixelSize??12,polygon:!1,pathOptions:{stroke:!0,weight:2,color:t.options.color,opacity:1}})}]}).addTo(n))}),i},Ba=({map:e,surface:t,lines:n,markerAt:r,decoratorOf:i,glide:a})=>{let o=e=>t.getVisibleParent?.(e),s=(e,t)=>{e.layer.setLatLngs(t);let n=i?.get(e.layer);n&&n.setPaths(e.reverse?Ra(t):e.layer)},c=typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,l=null,u=[],d=()=>{l!==null&&cancelAnimationFrame(l),l=null,u=[]},f=e=>{d(),u=e;let t=e.map(({line:e})=>e.layer.getLatLngs()),n=performance.now(),r=i=>{let o=Math.min(1,(i-n)/a),c=Ia(o);e.forEach((e,n)=>s(e.line,La(t[n],e.next,c))),o<1?l=requestAnimationFrame(r):(l=null,u=[],e.forEach(e=>s(e.line,e.next)))};l=requestAnimationFrame(r)},p=()=>{let e=[];if(n.forEach(t=>{let n=Fa(t,r,o);n&&(t.key=n.key,e.push({line:t,next:n.next}))}),!e.length)return;let t=new Set(e.map(({line:e})=>e)),i=[...u.filter(({line:e})=>!t.has(e)),...e];!a||c||i.length>150?(d(),i.forEach(e=>s(e.line,e.next))):f(i)};p(),t.on(`animationend`,p),e.on(`moveend`,p);let m=()=>{d(),t.off(`animationend`,p),e.off(`moveend`,p)};return m.reroute=p,m},Va=(e,t,n,r)=>{let i=/Point$/.test(t.geometry?.type??``),a=(n.marker?.size??24)/2;return e.bindTooltip(ta(r),{permanent:!0,direction:n.label?.direction??(i?`top`:`center`),offset:n.label?.offset??(i?[0,-a]:[0,0]),className:[`atlas-label`,n.label?.className].filter(Boolean).join(` `),opacity:1}),n.label?.style&&e.on(`tooltipopen`,e=>ea(e.tooltip.getElement(),n.label.style)),!!n.label?.scale},Ha=(e,t)=>{e.forEach(({layer:e,descriptor:n})=>{if(e._atlasHidden)return;let r=f(n,t);r!==e.isTooltipOpen()&&(r?e.openTooltip():e.closeTooltip())})},Ua=280,Wa={chunkedLoading:!0,showCoverageOnHover:!1,spiderfyDistanceMultiplier:2},Ga=[{upTo:9,name:`sm`,size:32},{upTo:99,name:`md`,size:38},{upTo:1/0,name:`lg`,size:46}],Ka=e=>{if(!e)return null;if(e===!0)return{from:0,options:{...Wa},badge:{},glide:Ua};if(typeof e==`number`)return{from:e,options:{...Wa},badge:{},glide:Ua};let{from:t=0,className:n,style:r,glide:i=Ua,...a}=e;return{from:t,options:{...Wa,...a},badge:{className:n,style:r},glide:i===!0?Ua:i}},qa=(e,t={})=>{let n=Ga.find(({upTo:t})=>e<=t)??Ga[Ga.length-1],r=document.createElement(`span`);return r.className=`atlas-cluster__count`,r.textContent=String(e),ea(r,t.style),{element:r,size:n.size,className:[`atlas-cluster`,`atlas-cluster--${n.name}`,t.className].filter(Boolean).join(` `)}},Ja=({map:e,factory:t,group:n,cluster:r,points:i})=>{let a=t.featureGroup().addTo(e),o=Ka(r),s=typeof t.markerClusterGroup==`function`;o!==null&&!s&&console.warn(`perun-atlas: clustering was configured, but the map engine on this deployment does not carry it`);let c=o!==null&&s&&i>=o.from,l=c?t.markerClusterGroup({...o.options,iconCreateFunction:e=>{let{element:n,size:r,className:i}=qa(e.getChildCount(),o.badge);return t.divIcon({html:n,className:i,iconSize:[r,r]})}}):n;if(l.addTo(e),c){let e=[];n.eachLayer(t=>{t._atlasPinned?e.push(t):l.addLayer(t)}),e.forEach(e=>a.addLayer(e))}let u=c?t.featureGroup().addTo(e):l,d=e=>c&&e._atlasPinned?a:l;return{surface:l,arrows:u,clustering:c,settings:o,layers:u===l?[l,a]:[l,u,a],move:(e,t,n)=>{let r=[];e.forEach(({layer:e})=>{e._atlasHidden=!t;let i=d(e);c&&i===l?r.push(e):t?i.addLayer(e):i.removeLayer(e);let a=n?.get(e);a&&t?u.addLayer(a):a&&u.removeLayer(a)}),r.length&&(t?l.addLayers(r):l.removeLayers(r))}}};Mi(`/*
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
`);var{Map:Ya,factory:Xa}=U,{useEffect:Za,useRef:Qa}=t.React,$a=[],eo=({servicePath:e,context:t,reload:n,descriptors:r={},descriptorFor:i,cluster:a,fit:o=!0,tooltip:s,popup:c,labelResolver:u,pinned:d,hidden:f=$a,onFeatureClick:m,onLegend:h,onShown:_,onExtent:v,onLoadStart:y,onLoad:b,onError:x})=>{let S=Qa([]),C=Qa([]),{hiddenRef:w,filterRef:ee}=$i(f);return Za(()=>{let n=!1,f=E({descriptors:r,nameOf:e=>i?.(e)??qe(e)}),{entryFor:T}=f,D=()=>Ha(C.current,Ya.getZoom()),O=()=>{C.current=[],S.current.forEach(e=>Ya.removeLayer(e)),S.current=[]},k=Object.create(null),A=[],te=[],j=e=>!!d?.(e),M=[];return(async()=>{try{y?.();let r=await Ke(e,t);if(n)return;O();let i=0,d=Xa.geoJSON(r,{pointToLayer:(e,t)=>{i+=1;let{marker:n={}}=T(e)??{},r=n.size??24,a=Xa.marker(t,{icon:Xa.divIcon({className:n.className??`atlas-marker`,iconSize:[r,r]})});return n.style&&a.on(`add`,()=>ea(a.getElement(),n.style)),k[Pa(t)]=a,a._atlasPinned=j(e),a},style:e=>l(T(e)),onEachFeature:(e,t)=>{let n=T(e)??{};M.push({layer:t,feature:e,key:f.note(e),hidden:!1});let r=s?s(e):p(n,e);if(r&&Va(t,e,n,r)&&C.current.push({layer:t,descriptor:n}),typeof t.getLatLngs==`function`){let e=t.getLatLngs();Array.isArray(e)&&e.length>=2&&!Array.isArray(e[0])&&A.push({layer:t,original:e.map(({lat:e,lng:t})=>Xa.latLng(e,t)),reverse:!!n.arrow?.reverse,key:null})}let i=n.details&&!c?null:la(e,n,{popup:c,labelResolver:u});i&&t.bindPopup(i,ua),m&&t.on(`click`,()=>m(e,g(n,e,u)))}}),x=Ja({map:Ya,factory:Xa,group:d,cluster:a,points:i}),{surface:E,clustering:N,settings:ne}=x;S.current=x.layers;let P=za({factory:Xa,group:d,into:x.arrows,arrowOf:e=>T(e)?.arrow}),re=e=>{let{leaving:t,returning:n}=ia(M,e);return x.move(t,!1,P),x.move(n,!0,P),n.length&&aa(M,P),t.length>0||n.length>0},F=e=>{_?.(oa(r,e,e=>f.kindOf(e).key)),v?.(sa(M))};re(w.current);let I=null;N&&A.length&&(I=Ba({map:Ya,surface:E,lines:A,markerAt:k,decoratorOf:P,glide:ne.glide}),te.push(I)),h?.(f.drawn()),D(),Ya.on(`zoomend`,D),N&&Ya.on(`moveend`,D);let L=sa(M);o&&L&&Ya.fitBounds(L,{padding:yi}),ee.current=e=>{re(e)&&(I?.reroute(),D(),F(e))},F(w.current),b?.(r)}catch(e){if(n)return;console.error(`perun-atlas: feature set failed to render`,e),x?.(e)}})(),()=>{n=!0,ee.current=null,te.forEach(e=>e()),Ya.off(`zoomend`,D),Ya.off(`moveend`,D),O()}},[e,JSON.stringify(t??{}),n]),null},to=`#e8590c`,no={className:`atlas-overlay`,color:to,weight:2.5,opacity:1,dashArray:`6 5`,fillColor:to,fillOpacity:.08},ro={className:`atlas-overlay atlas-overlay--point`,radius:5,color:to,weight:2.5,opacity:1,fillColor:`#ffffff`,fillOpacity:.85},io=e=>({key:ee,label:e,kind:`line`,path:no,marker:null,arrow:null}),ao=e=>e==null||e===``||typeof e==`object`?null:String(e),oo=(e,t,n)=>{let r=e?.properties??{},i=ao(r.name),a=Object.entries(r).filter(([e])=>i===null||e!==`name`).map(([e,t])=>({field:e,label:n?.(e.toLowerCase())||e,value:ao(t)})).filter(e=>e.value!==null);return{title:i??t,rows:a,spec:{className:`atlas-panel__details--file`}}},so=e=>`${Number((e/1048576).toFixed(1))} MB`,co=e=>new Intl.NumberFormat().format(e),lo=(e,t={})=>b(e===1?t.fileFeature??`{count} feature`:t.fileFeatures??`{count} features`,{count:co(e)}),uo=(e,t={})=>b(t.fileOpening??`Opening {name}…`,{name:e}),fo=(e,t={})=>b(t.fileAssumedDegrees??`{name} has no .prj, so its coordinates were read as longitude and latitude (WGS 84).`,{name:e}),po={unreadable:[`fileUnreadable`,`{name} could not be read as GeoJSON, KML, GPX or a shapefile.`],empty:[`fileEmpty`,`{name} has nothing in it to draw.`],notDegrees:[`fileNotDegrees`,`{name} is not in longitude and latitude, so it cannot be placed on the map.`],tooLarge:[`fileTooLarge`,`{name} is {size}. Files up to {limit} can be opened.`],tooManyPoints:[`fileTooManyPoints`,`{name} has {count} points. Files with up to {limit} points can be opened.`],tooLargeUnzipped:[`fileTooLargeUnzipped`,`{name} is over {limit} once unzipped, and {limit} is the most that can be opened.`],noShapefile:[`fileNoShapefile`,`{name} holds no shapefile.`],shapefilePart:[`fileShapefilePart`,`{name} is one part of a shapefile and holds no shapes. Open the .zip holding all its parts, or its .shp.`],noPrj:[`fileNoPrj`,`{name} has no .prj, and its coordinates are not longitude and latitude, so nothing says where it belongs. Open it zipped with its .prj.`],unknownProjection:[`fileUnknownProjection`,`The projection in {name}'s .prj could not be read. Save it in WGS 84 (EPSG:4326) and open it again.`],noDatumShift:[`fileNoDatumShift`,`{name} is in {crs}, and its .prj does not say how to shift that to WGS 84, so it would land in the wrong place. Save it in WGS 84 (EPSG:4326) and open it again.`],readerUnavailable:[`fileReaderUnavailable`,`The shapefile reader could not be loaded, so {name} was not opened. Try again.`]},mo=(e,t,n={})=>{let[r,i]=po[e?.refused]??po.unreadable,a={name:t};return e?.refused===`tooLarge`&&(a.size=so(e.size),a.limit=so(e.limit)),e?.refused===`tooLargeUnzipped`&&(a.limit=so(e.limit)),e?.refused===`tooManyPoints`&&(a.count=co(e.count),a.limit=co(e.limit)),e?.refused===`noDatumShift`&&(a.crs=e.crs||`a projection`),b(n[r]??i,a)};Mi(`/*
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
`);var{Map:ho,factory:go}=U,{useEffect:_o,useRef:vo}=t.React,yo=`atlasFilePoints`,bo=620,xo=()=>(ho.getPane(yo)||(ho.createPane(yo).style.zIndex=String(bo)),yo),So=({file:e,srid:t,hidden:n=!1,labelResolver:r,onFeatureClick:i,onDrawn:a,onError:o})=>{let s=vo(null),c=vo(n);c.current=n;let l=vo({});l.current={labelResolver:r,onFeatureClick:i,onDrawn:a,onError:o};let u=vo(null);return _o(()=>{if(!e)return;let n;try{n=go.geoJSON(Ae(e.collection,t),{pointToLayer:(e,t)=>go.circleMarker(t,{...ro,pane:xo()}),style:e=>/Point$/.test(e?.geometry?.type??``)?ro:no,onEachFeature:(t,n)=>{n.on(`click`,()=>{let{labelResolver:n,onFeatureClick:r}=l.current;r?.(t,{...oo(t,e.name,n),file:e})})}})}catch(e){console.error(`perun-atlas: a file could not be drawn`,e),l.current.onError?.(e);return}if(s.current=n,c.current||n.addTo(ho),u.current!==e){u.current=e;let t=n.getBounds();t.isValid()&&ho.fitBounds(t,{padding:yi})}return l.current.onDrawn?.(),()=>{ho.removeLayer(n),s.current=null}},[e,t]),_o(()=>{let e=s.current;e&&(n?ho.removeLayer(e):ho.hasLayer(e)||e.addTo(ho))},[n]),null};Mi(`/*
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
`);var{useEffect:Co,useRef:wo,useState:To}=t.React,Eo=({marker:e})=>{let n=wo(null);return Co(()=>{let t=n.current;t&&(ea(t,e?.style),t.style.width=`12px`,t.style.height=`12px`)},[e]),t.React.createElement(`span`,{ref:n,className:[`atlas-legend__point`,e?.className].filter(Boolean).join(` `),"aria-hidden":`true`})};Eo.propTypes={marker:t.PropTypes.object};var Do=({path:e,arrow:n})=>{let r=e?.color??`#4A5C66`,i=Array.isArray(e?.dashArray)?e.dashArray.join(` `):e?.dashArray,a=n?.reverse?`3,6 9,3 9,9`:`21,6 15,3 15,9`;return t.React.createElement(`svg`,{className:`atlas-legend__swatch`,width:`24`,height:`12`,viewBox:`0 0 24 12`,"aria-hidden":`true`},t.React.createElement(`line`,{className:e?.className,x1:`2`,y1:`6`,x2:`22`,y2:`6`,stroke:r,strokeWidth:Math.min(e?.weight??1,4),strokeDasharray:i||void 0,strokeOpacity:e?.opacity??1,strokeLinecap:`round`}),n&&t.React.createElement(`polygon`,{points:a,fill:r,fillOpacity:e?.opacity??1}))};Do.propTypes={path:t.PropTypes.object,arrow:t.PropTypes.object};var Oo=({path:e})=>t.React.createElement(`svg`,{className:`atlas-legend__swatch`,width:`24`,height:`12`,viewBox:`0 0 24 12`,"aria-hidden":`true`},t.React.createElement(`rect`,{x:`4`,y:`1`,width:`16`,height:`10`,fill:e?.fillColor??`#B8C6CC`,fillOpacity:e?.fillOpacity??.55,stroke:e?.color??`#4A5C66`,strokeWidth:Math.min(e?.weight??1,2),strokeOpacity:e?.opacity??1}));Oo.propTypes={path:t.PropTypes.object};var ko=({entry:e})=>e.kind===`point`?t.React.createElement(Eo,{marker:e.marker}):e.kind===`line`?t.React.createElement(Do,{path:e.path,arrow:e.arrow}):t.React.createElement(Oo,{path:e.path});ko.propTypes={entry:t.PropTypes.object.isRequired};var Ao=({entries:e=[],title:n,open:r=!0,hidden:i=[],onToggle:a,onShowAll:o,showAllLabel:s,className:c=``})=>{let[l,u]=To(r);if(!S(e,i))return null;let d=n??`Legend`,f=e.some(e=>i.includes(e.key));return t.React.createElement(`div`,{className:`atlas-legend ${c}`.trim()},t.React.createElement(`button`,{type:`button`,className:`atlas-legend__toggle`,onClick:()=>u(!l),"aria-expanded":l},t.React.createElement(`span`,{className:`atlas-legend__title`},d),t.React.createElement(`span`,{className:`atlas-legend__chevron`,"aria-hidden":`true`},l?`−`:`+`)),l&&t.React.createElement(`ul`,{className:`atlas-legend__list`},e.map(e=>{let n=t.React.createElement(t.React.Fragment,null,t.React.createElement(ko,{entry:e}),t.React.createElement(`span`,{className:`atlas-legend__label`},e.label));return t.React.createElement(`li`,{className:`atlas-legend__row`,key:e.key},a?t.React.createElement(`button`,{type:`button`,className:`atlas-legend__item`,"aria-pressed":!i.includes(e.key),onClick:()=>a(e.key)},n):n)})),l&&o&&f&&t.React.createElement(`button`,{type:`button`,className:`atlas-legend__reset`,onClick:o},s??`Show all`))};Ao.propTypes={entries:t.PropTypes.array,title:t.PropTypes.string,open:t.PropTypes.bool,hidden:t.PropTypes.array,onToggle:t.PropTypes.func,onShowAll:t.PropTypes.func,showAllLabel:t.PropTypes.string,className:t.PropTypes.string};var jo=({entries:e=[],title:n,open:r,hidden:i=[],onToggle:a,onShowAll:o,showAllLabel:s,position:c=`bottomleft`})=>{let l=S(e,i);return t.React.createElement(Ai,{position:c,shown:l},t.React.createElement(`div`,{className:`atlas-legend__host`,ref:ji},t.React.createElement(Ao,{entries:e,title:n,open:r,hidden:i,onToggle:a,onShowAll:o,showAllLabel:s})))};jo.propTypes={entries:t.PropTypes.array,title:t.PropTypes.string,open:t.PropTypes.bool,hidden:t.PropTypes.array,onToggle:t.PropTypes.func,onShowAll:t.PropTypes.func,showAllLabel:t.PropTypes.string,position:t.PropTypes.string};var Mo=({className:e=`atlas-panel__close`,label:n,title:r,onClick:i})=>t.React.createElement(`button`,{type:`button`,className:e,"aria-label":n,title:r,onClick:i},`×`),No=({timeScoped:e,longest:n,preset:r,applyPreset:i,onClose:a,labels:o={}})=>t.React.createElement(`div`,{className:`atlas-panel__empty`},t.React.createElement(`div`,{className:`atlas-panel__emptycard`},t.React.createElement(`div`,{className:`atlas-panel__emptytitle`},o.empty??(e?`Nothing in this range`:`Nothing to show`)),o.emptyHint&&t.React.createElement(`div`,{className:`atlas-panel__emptybody`},o.emptyHint),e&&n&&r!==n.months&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--primary`,onClick:()=>i(n.months)},[o.widen??`Try`,n.label].filter(Boolean).join(` `)),t.React.createElement(Mo,{label:o.close??`Close`,title:o.close??`Close`,onClick:a}))),{Icon:Po}=t.elements,Fo=[{offer:`geojson`,icon:`IconJson`,label:`exportGeoJSON`,fallback:`GeoJSON`,save:`saveGeoJSON`},{offer:`csv`,icon:`IconFileTypeCsv`,label:`exportCsv`,fallback:`CSV`,save:`saveCSV`},{offer:`kml`,icon:`IconWorld`,label:`exportKml`,fallback:`KML`,save:`saveKML`},{offer:`shp`,icon:`IconFileTypeZip`,label:`exportShp`,fallback:`Shapefile`,save:`saveShapefile`}],Io=({exporter:e,labels:n={}})=>t.React.createElement(t.React.Fragment,null,Fo.filter(({offer:t})=>e.offer[t]!==!1).map(({offer:r,icon:i,label:a,fallback:o,save:s})=>t.React.createElement(`button`,{key:r,type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:e[s]},t.React.createElement(Po,{name:i,size:16,stroke:1.75,"aria-hidden":`true`}),n[a]??o))),{Icon:Lo}=t.elements,Ro=({fileOverlay:e,labels:n={}})=>{let{offered:r,file:i,inputRef:a,choose:o,onPicked:s,close:c}=e;return t.React.createElement(t.React.Fragment,null,r&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:o},t.React.createElement(Lo,{name:`IconFolderOpen`,size:16,stroke:1.75,"aria-hidden":`true`}),n.openFile??`Open file`),r&&t.React.createElement(`input`,{ref:a,type:`file`,className:`atlas-panel__fileinput`,accept:`.geojson,.json,.kml,.gpx,.zip,.shp`,tabIndex:-1,"aria-hidden":`true`,onChange:s}),i&&t.React.createElement(`div`,{className:`atlas-panel__file`},t.React.createElement(Do,{path:no}),t.React.createElement(`span`,{className:`atlas-panel__filename`,title:i.name},i.name),t.React.createElement(`span`,{className:`atlas-panel__filecount`},lo(i.count,n)),t.React.createElement(Mo,{className:`atlas-panel__fileclose`,label:n.closeFile??`Close file`,title:n.closeFile??`Close file`,onClick:c})))},zo=({fileOverlay:e,labels:n={}})=>{let{note:r,refusal:i,dismiss:a,dismissNote:o}=e;return t.React.createElement(t.React.Fragment,null,r&&t.React.createElement(`p`,{className:`atlas-panel__filenote`,role:`status`},t.React.createElement(`span`,null,r),t.React.createElement(Mo,{className:`atlas-panel__fileclose`,label:n.close??`Close`,onClick:o})),i&&t.React.createElement(`p`,{className:`atlas-panel__filerefused`,role:`alert`},t.React.createElement(`span`,null,i),t.React.createElement(Mo,{className:`atlas-panel__fileclose`,label:n.close??`Close`,onClick:a})))},{Icon:Bo}=t.elements,Vo=({viewLink:e,labels:n={}})=>t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:t=>e.copy(t.currentTarget)},t.React.createElement(Bo,{name:e.copied?`IconCheck`:`IconLink`,size:16,stroke:1.75,"aria-hidden":`true`}),e.copied?n.linkCopied??`Link copied`:n.copyLink??`Copy link`),Ho=({saving:e,opening:n,labels:r={}})=>t.React.createElement(`div`,{className:`atlas-panel__loading`,role:`status`,"aria-live":`polite`},t.React.createElement(`div`,{className:`atlas-panel__loadingcard`},t.React.createElement(`div`,{className:`atlas-panel__spinner`,"aria-hidden":`true`}),t.React.createElement(`span`,null,e?r.saving??`Saving…`:n?uo(n,r):r.loading??`Loading…`))),Uo=({timeScoped:e,range:n,initial:r,applyPreset:i,onClose:a,labels:o={}})=>t.React.createElement(`div`,{className:`atlas-panel__footer`},e&&t.React.createElement(`div`,{className:`atlas-panel__summary`},`${n.from} → ${n.to}`),t.React.createElement(`div`,{className:`atlas-panel__actions`},e&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:()=>i(r)},o.reset??`Reset range`),a&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--dark`,onClick:a},o.close??`Close`))),Wo=({record:e,onClose:n,labels:r={}})=>t.React.createElement(`aside`,{className:[`atlas-panel__details`,e.spec?.className].filter(Boolean).join(` `),style:e.spec?.style,"aria-label":r.details??`Details`},t.React.createElement(`div`,{className:`atlas-panel__detailshead`},t.React.createElement(`div`,{className:`atlas-panel__detailstitle`,style:e.spec?.titleStyle},e.title??r.details??`Details`),t.React.createElement(Mo,{label:r.close??`Close`,onClick:n})),t.React.createElement(`dl`,{className:`atlas-panel__detailsbody`},e.rows.map(({field:n,label:r,value:i})=>t.React.createElement(`div`,{key:n,className:`atlas-panel__detailsrow`},t.React.createElement(`dt`,{style:e.spec?.labelStyle},r),t.React.createElement(`dd`,{style:e.spec?.valueStyle},i))))),Go=({range:e,onRangeChange:n,presets:r=[],preset:i,applyPreset:a,labels:o={}})=>t.React.createElement(t.React.Fragment,null,t.React.createElement(Ea,{from:e.from,to:e.to,onChange:n,labels:{from:o.from,to:o.to,invalidRange:o.invalidRange}}),r.length>0&&t.React.createElement(`div`,{className:`atlas-panel__segmented`},r.map(({months:e,label:n})=>t.React.createElement(`button`,{key:e,type:`button`,"aria-pressed":i===e,onClick:()=>a(e)},n)))),{useEffect:Ko,useMemo:qo,useState:Jo}=t.React,Yo=({choropleth:e,bindings:t,bindingKey:n})=>{let r=!!e,[i,a]=Jo(null),o=r?e.status:null;return Ko(()=>{if(!o)return;let e=!1;return ct(o,t).then(t=>{e||a(t)}),()=>{e=!0}},[o,n]),{coloured:r,statusPath:o,rows:i,tooltip:qo(()=>{let t=e?.tooltip;if(!t)return;let n=y(t);return e=>n(e?.properties)??null},[e])}},Xo=e=>e.toISOString().slice(0,10),Zo=()=>Xo(new Date),Qo=e=>{let t=new Date;return t.setMonth(t.getMonth()-e),Xo(t)},$o=e=>({from:Qo(e),to:Zo()}),es=(e,t)=>e?.from===t?.from&&e?.to===t?.to,{useState:ts}=t.React,ns=({presets:e=[],defaultMonths:t,servicePath:n,opening:r,onMoved:i})=>{let a=t??e[e.length-1]?.months??12,[o,s]=ts(r?null:a),[c,l]=ts(()=>r??$o(a)),u=/\{(from|to)\}/.test(n??``),d=(e,t)=>{s(t),!es(e,c)&&(l(e),i?.())};return{timeScoped:u,preset:o,range:c,applyPreset:e=>d($o(e),e),onRangeChange:e=>d(e,null),longest:e[e.length-1],initial:a}},{useEffect:rs,useMemo:is,useState:as}=t.React,os=(e,t)=>e?b(e,t??{}):null,ss=e=>({path:typeof e==`string`?e:null,inline:e&&typeof e==`object`?e:null}),cs=({form:e,bindings:t})=>{let{path:n,inline:r}=ss(e?.schema),i=ss(e?.uiSchema),a=os(n,t),o=os(i.path,t),[s,c]=as(null),[l,u]=as(null),[d,f]=as(!!(n||i.path)),[p,m]=as(!1);rs(()=>{if(!n&&!i.path){c(null),u(null),f(!1);let t=!!e&&!r;t&&console.error("perun-atlas: draw.form needs `schema` -- either the schema itself, or the path to a service that answers with one. Got",e?.schema),m(t);return}let a=!1;return f(!0),m(!1),Promise.all([n?dt(n,t):Promise.resolve(null),i.path?ft(i.path,t):Promise.resolve(null)]).then(([e,t])=>{a||(c(e),u(t),m(!!n&&!e),f(!1))}),()=>{a=!0}},[n,a,i.path,o,!!e,!!r]);let h=is(()=>pt(n?s:r,e?.pick),[s,r,n,e?.pick?.join(`\0`)??null]);return{schema:h,uiSchema:is(()=>yt(i.path?l:i.inline,h)??void 0,[l,i.inline,i.path,h]),loading:d,failed:p}},{useMemo:ls}=t.React,us={id:`{pkid}`,join:`,`},ds=({set:e,shape:t,dataSrid:n,select:r})=>{let i=r===!0?us:r?{...us,...r}:null,{mode:a,id:o,join:s}=i??{},c=!!i&&i.export!==!1;return ls(()=>{if(!i)return{selecting:!1,feedsExport:!1,count:0,total:0,inside:[],radius:null,has:()=>!1,metres:()=>null,context:null};let r=Ct(e,t,{srid:n,mode:a});return{selecting:!0,feedsExport:c,count:r.inside.length,total:r.total,inside:r.inside,radius:t?.radius??null,has:r.has,metres:r.metres,context:{count:r.inside.length,total:r.total,ids:wt(r.inside,{id:o,join:s}),geojson:{type:`FeatureCollection`,features:r.inside}}}},[e,t,n,a,o,s,c,!!i])},{useMemo:fs,useState:ps}=t.React,{alertUserResponse:ms}=t.elements,hs=(e,t)=>e?.type?void 0:t?`success`:`error`,gs=({draw:e,dataSrid:n,set:r,bindings:i,labels:a={}})=>{let o=!!(e?.save?.onSave||e?.select),[s,c]=ps(!1),[l,u]=ps(null),[d,f]=ps(``),[p,m]=ps(!1),[h,g]=ps(0),[_,v]=ps(()=>e?.form?.data??{}),y=cs({form:e?.form,bindings:i}),b=fs(()=>y.schema?t.validator.validateFormData(mt(_,y.schema),y.schema)?.errors??[]:[],[_,y.schema]),x=ds({set:r,shape:l,dataSrid:n,select:e?.select}),S=()=>{c(!1),u(null),f(``),v(e?.form?.data??{})};return{drawable:o,drawing:s,shape:l,selection:x,note:d,form:e?.form?{schema:y.schema,uiSchema:y.uiSchema,data:_,errors:b,onChange:v,loading:y.loading,failed:y.failed}:void 0,saving:p,reload:h,setShape:u,setNote:f,startDrawing:()=>c(!0),finishDrawing:()=>c(!1),clearDrawing:S,saveShape:async()=>{if(!l||p)return;if(e.form&&!y.schema){console.error(`perun-atlas: nothing sent -- this row configures a form and its fields are not loaded.`);return}if(b.length){ms({type:`error`,response:a.saveIncomplete??`Some of these fields are mandatory and are empty. Nothing was sent.`}),console.error(`perun-atlas: nothing sent -- the form is not answerable as it stands:`,b.map(e=>`${e.property??``} ${e.message??``}`.trim()).join(`; `));return}let{context:t,units:r,tooSmall:o}=Pt(l,{draw:e,dataSrid:n,bindings:i,note:d,selected:x.context,form:_});if(o){ms({type:`error`,response:a.saveTooSmall??`This deployment stores geometry in EPSG:${n??`?`}, where ${Math.round(l.radius)} m is less than one unit. Nothing was sent.`}),console.error(`perun-atlas: a radius of ${Math.round(l.radius)} m is ${r} units in EPSG:${n}, which rounds to zero. A projection measured in degrees cannot carry an integer radius: send {draw.metres} for the size and {draw.ring} for the shape instead.`),console.error(`perun-atlas: the configured path is`,e.save.onSave);return}m(!0);let s=await Nt(e.save.onSave,t,{body:e.save.body===void 0?void 0:Mt(e.save.body,t),contentType:e.save.contentType,encoding:e.save.encoding,failure:e.save.failure});m(!1),s.ok&&(S(),g(e=>e+1)),ms({response:s.data||s.message,type:hs(s.data,s.ok)})}}},_s=(()=>{let e=new Uint32Array(256);for(let t=0;t<256;t+=1){let n=t;for(let e=0;e<8;e+=1)n=n&1?3988292384^n>>>1:n>>>1;e[t]=n>>>0}return e})(),vs=e=>{let t=4294967295;for(let n=0;n<e.length;n+=1)t=_s[(t^e[n])&255]^t>>>8;return(t^4294967295)>>>0},ys=async e=>{if(typeof CompressionStream>`u`)return null;let t;try{t=new CompressionStream(`deflate-raw`)}catch{return null}return new Uint8Array(await new Response(new Blob([e]).stream().pipeThrough(t)).arrayBuffer())},bs=e=>e.getHours()<<11|e.getMinutes()<<5|e.getSeconds()>>1,xs=e=>Math.max(e.getFullYear()-1980,0)<<9|e.getMonth()+1<<5|e.getDate(),Ss=2048,Cs=0,ws=8,Ts=async(e,{now:t=new Date,compress:n=!0}={})=>{let r=new TextEncoder,i=bs(t),a=xs(t),o=[];for(let{name:t,bytes:i}of e){let e=n?await ys(i):null,a=e&&e.length<i.length?e:i;o.push({name:r.encode(t),method:a===i?Cs:ws,crc:vs(i),size:i.length,packed:a})}let s=o.reduce((e,t)=>e+30+t.name.length+t.packed.length+46+t.name.length,22),c=new Uint8Array(s),l=new DataView(c.buffer),u=0,d=e=>{l.setUint16(u,e,!0),u+=2},f=e=>{l.setUint32(u,e,!0),u+=4},p=e=>{c.set(e,u),u+=e.length},m=e=>{d(20),d(Ss),d(e.method),d(i),d(a),f(e.crc),f(e.packed.length),f(e.size),d(e.name.length),d(0)};o.forEach(e=>{e.offset=u,f(67324752),m(e),p(e.name),p(e.packed)});let h=u;o.forEach(e=>{f(33639248),d(20),m(e),d(0),d(0),d(0),f(0),f(e.offset),p(e.name)});let g=u-h;return f(101010256),d(0),d(0),d(o.length),d(o.length),f(g),f(h),d(0),c},Es=({set:e,selection:t,exportable:n,labelResolver:r,timeScoped:i,range:a,srid:o,drawnWith:s})=>{let c=n===!1?null:n&&n!==!0?n:{},l=!!(t?.selecting&&t.feedsExport&&t.count>0),u=l?{type:`FeatureCollection`,features:t.inside}:e,d=c&&u&&(u.features?.length??0)>0,f=[c?.filename??`features`,l?`within-${Math.round(t.radius??0)||`shape`}`:null,i?`${a.from}_${a.to}`:Zo()].filter(Boolean).join(`-`),p=()=>ke(u,o),h=e=>{let t=c?.name?v(e?.properties,c.name):null;return t==null||t===``?m(s?.(e),e):String(t)},g={fields:c?.fields,exclude:c?.exclude,labelResolver:r};return{offer:c,canExport:d,saveGeoJSON:()=>na(`${f}.geojson`,Ft(p()),`application/geo+json`),saveCSV:()=>na(`${f}.csv`,Ut(p(),g),`text/csv;charset=utf-8`),saveKML:()=>na(`${f}.kml`,Zt(p(),{...g,nameOf:h}),`application/vnd.google-earth.kml+xml`),saveShapefile:async()=>na(`${f}.zip`,await Ts(Pn(p(),{...g,stem:f})),`application/zip`)}},Ds={shp:`shp.perun-atlas.js?v=f8a962935bdb`},Os=typeof document>`u`?null:document.currentScript?.src||null,ks=()=>Os??(typeof document>`u`?null:Array.from(document.scripts).find(e=>/\/perun-atlas\.js(\?|$)/.test(e.src))?.src??null),As=(e,t,n=Ds)=>t&&n[e]?new URL(n[e],t).href:null,js=new Map,Ms=(e,{base:t=ks(),files:n=Ds,load:r=e=>import(e)}={})=>{if(!js.has(e)){let i=As(e,t,n),a=i?r(i):Promise.reject(Error(`perun-atlas: cannot tell where the ${e} module is. It is loaded from beside perun-atlas.js, and that script could not be found.`));a.catch(()=>js.delete(e)),js.set(e,a)}return js.get(e)},{useRef:Ns,useState:Ps}=t.React,Fs=()=>new Promise(e=>{requestAnimationFrame(()=>setTimeout(e,0))}),Is=async e=>{let t=await e.arrayBuffer(),n=ni(t,e.name);if(n===`text`)return ii(new TextDecoder().decode(t));if(n===`part`)return{refused:`shapefilePart`};let r;try{r=await Ms(`shp`)}catch(e){return console.warn(`perun-atlas: the shapefile reader could not be loaded`,e),{refused:`readerUnavailable`}}return oi(await r.readShapefile(t,{kind:n,limit:Hr.bytes}))},Ls=({overlay:e,labels:t,onChange:n})=>{let r=e!==!1,[i,a]=Ps(null),[o,s]=Ps(null),[c,l]=Ps(null),[u,d]=Ps(null),f=Ns(null),p=Ns(0),m=()=>f.current?.click(),h=async e=>{let r=++p.current,i=Ur(e.size);if(!i){if(d(e.name),await Fs(),r!==p.current)return;try{i=await Is(e)}catch(e){console.warn(`perun-atlas: a file could not be read`,e),i={refused:`unreadable`}}}if(r===p.current){if(i.refused){d(null),s(mo(i,e.name,t));return}s(null),l(i.assumed?fo(e.name,t):null),a({name:e.name,collection:i.collection,count:i.collection.features.length}),n?.()}},g=e=>{let t=e.target.files?.[0];e.target.value=``,t&&h(t)},_=()=>{p.current+=1,d(null),l(null),a(null),n?.()};return{offered:r,file:i,refusal:o,note:c,opening:u,inputRef:f,choose:m,onPicked:g,close:_,drawn:()=>d(null),failed:()=>{i&&(s(mo({refused:`unreadable`},i.name,t)),_())},dismiss:()=>s(null),dismissNote:()=>l(null)}},{useState:Rs}=t.React,zs=({coloured:e})=>{let[t,n]=Rs(null),[r,i]=Rs(!0),a=e?{values:[],usedFallback:!1}:[],[o,s]=Rs(a),[c,l]=Rs(null),u=t===null?null:c??t,[d,f]=Rs(null);return{set:t,visible:u,loading:r,drawn:o,extent:d,setDrawn:s,setShown:l,setExtent:f,onFetchStart:()=>{i(!0),s(a)},onFetched:e=>{n(e??{features:[]}),i(!1)},onFetchFailed:()=>{n({features:[]}),l(null),f(null),i(!1)},forget:()=>n(null)}},{useEffect:Bs,useState:Vs}=t.React,Hs=({subject:e,drawing:t})=>{let[n,r]=Vs(null),i=t=>Ye(t,e?.id,e?.match);return Bs(()=>{if(!n)return;let e=e=>{e.key===`Escape`&&r(null)};return document.addEventListener(`keydown`,e),()=>document.removeEventListener(`keydown`,e)},[n]),{record:n,openRecord:(e,n)=>{t||n&&r(n)},closeRecord:()=>r(null),isSubject:i,descriptorFor:t=>e?.descriptor&&i(t)?e.descriptor:null,isPinnedFeature:e=>i(e)}},Us=[`map`,`at`,`base`,`from`,`to`],Ws=/^\d{4}-\d{2}-\d{2}$/,Gs=e=>{let t=Math.max(e.indexOf(`#`),0),n=e.indexOf(`?`,t);return n===-1?{head:e,query:``}:{head:e.slice(0,n),query:e.slice(n+1)}},Ks=e=>Ws.test(e??``)&&new Date(`${e}T00:00:00Z`).toISOString().slice(0,10)===e,qs=(e,t)=>String(Number(e.toFixed(t))),Js=e=>((e+180)%360+360)%360-180,Ys=(e,t)=>{if(t==null||t===``)return null;let n=new URLSearchParams(Gs(e).query);if(n.get(`map`)!==String(t))return null;let r={},i=(n.get(`at`)??``).split(`,`);if(i.length===3&&i.every(e=>e.trim()!==``)){let[e,t,n]=i.map(Number);Math.abs(e)<=90&&Math.abs(t)<=180&&n>=0&&n<=30&&(r.center=[e,t],r.zoom=n)}let a=n.get(`base`);a&&(r.basemap=a);let o=n.get(`from`),s=n.get(`to`);return Ks(o)&&Ks(s)&&o<=s&&(r.from=o,r.to=s),r},Xs=(e,t,{center:n,zoom:r,basemap:i,from:a,to:o}={})=>{let{head:s,query:c}=Gs(e),l=new URLSearchParams(c);return Us.forEach(e=>l.delete(e)),l.set(`map`,String(t)),n&&Number.isFinite(r)&&l.set(`at`,[qs(n[0],6),qs(Js(n[1]),6),qs(r,2)].join(`,`)),i&&l.set(`base`,i),a&&o&&(l.set(`from`,a),l.set(`to`,o)),`${s}?${l.toString().replace(/%2C/gi,`,`)}`},Zs=new Set,Qs=(e,t)=>{if(Zs.has(e))return null;let n=Ys(e,t);return n&&Zs.add(e),n},{useEffect:$s,useRef:ec,useState:tc}=t.React,nc=2e3,rc=({linkId:e,link:t,timeScoped:n,range:r,labels:i={}})=>{let a=e!=null&&e!==``&&t!==!1,o=ec(null),[s,c]=tc(!1);return $s(()=>{if(!s)return;let e=setTimeout(()=>c(!1),nc);return()=>clearTimeout(e)},[s]),{offered:a,copied:s,attach:({map:e,basemap:t})=>{o.current={map:e,basemap:t}},copy:async t=>{let{map:a,basemap:s}=o.current??{};if(!a)return;let l=a.getCenter(),u=Xs(window.location.href,e,{center:[l.lat,l.lng],zoom:a.getZoom(),basemap:st(s,a),...n&&{from:r.from,to:r.to}});await ra(u,t?.parentNode??void 0)?c(!0):window.prompt(i.copyLinkPrompt??`Copy this link:`,u)}}};Mi(`/*
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
`);var{useEffect:ic,useMemo:ac,useState:oc}=t.React,sc=({session:e,servicePath:n,context:r,descriptors:i,labelResolver:a,cluster:o,subject:s,presets:c=[],defaultMonths:l,labels:u={},map:f,exportable:p,overlay:m,legend:h=!0,notice:g=!0,tokens:_,title:v,choropleth:y,draw:b,view:x,linkId:S,link:C,className:w=``,onClose:T})=>{let[E,D]=oc(!0),[O,k]=oc(!!x?.center),M=()=>{O&&k(!1)},[N,ne]=oc(null),{timeScoped:P,preset:re,range:F,initial:I,longest:L,applyPreset:R,onRangeChange:z}=ns({presets:c,defaultMonths:l,servicePath:n,opening:x?.from&&x?.to?{from:x.from,to:x.to}:void 0,onMoved:()=>{_e(),ze()}}),B=ac(()=>({...r||{},...P&&{from:F.from,to:F.to},...N&&{srid:N}}),[r,P,F.from,F.to,N]),ie=JSON.stringify(B),{coloured:V,statusPath:ae,rows:oe,tooltip:se}=Yo({choropleth:y,bindings:B,bindingKey:ie}),{set:ce,visible:le,loading:ue,drawn:de,extent:fe,setDrawn:H,setShown:pe,setExtent:U,onFetchStart:me,onFetched:he,onFetchFailed:ge,forget:_e}=zs({coloured:V}),[ve,ye]=oc([]),be=e=>ye(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e]),xe=()=>ye([]),[W,Se]=oc(null),{drawable:Ce,drawing:we,shape:Te,selection:Ee,note:De,form:Oe,saving:ke,reload:Ae,setShape:je,setNote:Me,startDrawing:Ne,finishDrawing:Pe,clearDrawing:Fe,saveShape:Ie}=gs({draw:b,dataSrid:N,set:le,bindings:B,labels:u}),{record:Le,openRecord:Re,closeRecord:ze,descriptorFor:Be,isPinnedFeature:Ve}=Hs({subject:s,drawing:we}),He=Ls({overlay:m,labels:u,onChange:()=>ye(e=>e.filter(e=>e!==ee))}),{file:Ue}=He;ic(()=>{Le?.file&&Le.file!==Ue&&ze()},[Ue]);let We=Es({set:le,selection:Ee,exportable:p,labelResolver:a,timeScoped:P,range:F,srid:N,drawnWith:e=>V?i?.[y.descriptor]:d(i?.[Be(e)??qe(e)],e)}),Ge=rc({linkId:S,link:C,timeScoped:P,range:F,labels:u}),Ke=!ue&&ce!==null&&(ce.features?.length??0)===0&&g!==!1&&!we&&!Te&&!Ue&&W!==ie;return t.React.createElement(`div`,{className:`atlas-panel ${w}${E?``:` atlas-panel--nolabels`}`.trim(),style:_},t.React.createElement(`header`,{className:`atlas-panel__header`},t.React.createElement(`div`,{className:`atlas-panel__title`},v),T&&t.React.createElement(Mo,{label:u.close??`Close`,onClick:T})),t.React.createElement(`div`,{className:`atlas-panel__toolbar`},P&&t.React.createElement(Go,{range:F,onRangeChange:z,presets:c,preset:re,applyPreset:R,labels:u}),!V&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__switch`,"aria-pressed":E,onClick:()=>D(!E)},t.React.createElement(`span`,{className:`atlas-panel__track`},t.React.createElement(`span`,{className:`atlas-panel__knob`})),u.labels??`Labels`),(Ce||We.canExport||He.offered||Ge.offered)&&t.React.createElement(`div`,{className:`atlas-panel__actions`},Ce&&t.React.createElement(ka,{drawing:we,busy:ke,labels:u,onStart:Ne,onCancel:Fe}),We.canExport&&t.React.createElement(Io,{exporter:We,labels:u}),t.React.createElement(Ro,{fileOverlay:He,labels:u}),Ge.offered&&t.React.createElement(Vo,{viewLink:Ge,labels:u})),t.React.createElement(zo,{fileOverlay:He,labels:u}),Ce&&(we||Te)&&t.React.createElement(Na,{shape:Te,drawing:we,busy:ke,limits:b.radius,caught:Ee.selecting?{count:Ee.count,total:Ee.total}:void 0,savable:!!b.save?.onSave,note:b.note?{value:De,onChange:Me,required:b.note.required}:void 0,form:Oe,labels:u,onCancel:Fe,onRadius:e=>je(t=>t&&{...t,radius:e}),onSave:Ie})),t.React.createElement(`div`,{className:`atlas-panel__body`},t.React.createElement(`div`,{className:`atlas-panel__mapwrap`},t.React.createElement(`div`,{className:`atlas-panel__map`},t.React.createElement(Xi,{session:e,layerSwitcher:!0,...f,extent:fe,view:x,onReady:e=>{ne(e.config?.dataSrid??null),Ge.attach(e)}},V?(oe!==null||!ae)&&t.React.createElement(ga,{servicePath:n,context:B,srid:N,reload:Ae,statusRows:oe,join:y.join,field:y.field,palette:y.palette,fallback:y.fallback,descriptor:i?.[y.descriptor],labelResolver:a,tooltip:se,hidden:ve,onFeatureClick:Re,onLegend:H,onShown:pe,onLoadStart:me,onLoad:he,onError:ge}):t.React.createElement(eo,{servicePath:n,context:B,reload:Ae,descriptors:i,descriptorFor:Be,labelResolver:a,cluster:o,pinned:Ve,hidden:ve,fit:!O,onFeatureClick:Re,onLegend:H,onShown:pe,onExtent:U,onLoadStart:me,onLoad:e=>{M(),he(e)},onError:e=>{M(),ge(e)}}),Ue&&t.React.createElement(So,{file:Ue,srid:N,hidden:ve.includes(ee),labelResolver:a,onFeatureClick:Re,onDrawn:He.drawn,onError:He.failed}),Ce&&t.React.createElement(wa,{value:Te,drawing:we,style:b.style,onChange:je,onDrawn:Pe}),h!==!1&&t.React.createElement(jo,{entries:[...V?te({palette:y.palette,fallback:y.fallback??j.__unknown,unknownLabel:y.unknownLabel,...de},a):A(de,a),...Ue?[io(Ue.name)]:[]],title:u.legend,hidden:ve,onToggle:be,onShowAll:xe,showAllLabel:u.showAll,position:typeof h==`string`?h:void 0}))),(ue||ke||He.opening)&&t.React.createElement(Ho,{saving:ke,opening:He.opening,labels:u}),Ke&&t.React.createElement(No,{timeScoped:P,longest:L,preset:re,applyPreset:R,labels:u,onClose:()=>Se(ie)})),Le&&t.React.createElement(Wo,{record:Le,labels:u,onClose:ze})),(P||T)&&t.React.createElement(Uo,{timeScoped:P,range:F,initial:I,applyPreset:R,labels:u,onClose:T}))};Mi(`/*
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
`);var{Map:cc,factory:lc}=U,{useEffect:uc,useRef:dc}=t.React,fc=`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 26 36">
  <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 23 13 23s13-13.25 13-23C26 5.82 20.18 0 13 0z"
        fill="currentColor" stroke="#ffffff" stroke-width="1.75"/>
  <circle cx="13" cy="13" r="4" fill="#ffffff"/>
</svg>`,pc=({value:e,onChange:t,draggable:n=!0,className:r=`atlas-pin`,html:i=fc,size:a=[20,28],anchor:o=[10,28]})=>{let s=dc(null),c=dc(t);return c.current=t,uc(()=>{let e=e=>c.current?.({lat:e.latlng.lat,lng:e.latlng.lng});return cc.on(`click`,e),()=>{cc.off(`click`,e),s.current&&(cc.removeLayer(s.current),s.current=null)}},[]),uc(()=>{if(!e){s.current&&(cc.removeLayer(s.current),s.current=null);return}if(s.current){s.current.setLatLng(e);return}let t=lc.marker(e,{icon:lc.divIcon({className:r,html:i,iconSize:a,iconAnchor:o}),draggable:n}).addTo(cc);t.on(`drag`,e=>c.current?.({...e.target.getLatLng()})),s.current=t},[e?.lat,e?.lng]),null},{labelsManager:mc}=t.utils,{useMemo:hc,useState:gc}=t.React,_c=(e,n)=>{let{objConfig:r,objectId:i,session:a,labelDomain:o=`main`,title:s,className:c,linkId:l,onClose:u}=e,[d]=gc(()=>Qs(window.location.href,l)),f=e=>{if(!e)return;let t=mc(e,n,o);return!t||t===`perun.${o}.${e}`?void 0:t},p=hc(()=>({session:a,objectId:i,...r?.context||{}}),[a,i,r]),m=hc(()=>(r?.presets||[]).map(({months:e,label:t})=>({months:e,label:f(t)??`${e}`})),[r]),h=hc(()=>Object.fromEntries(Object.entries(r?.labels||{}).map(([e,t])=>[e,f(t)])),[r]),g=r?.service;return g?t.React.createElement(sc,{session:a,servicePath:g,context:p,descriptors:r?.descriptors||{},labelResolver:f,cluster:r?.cluster,subject:r?.subject?{...r.subject,id:i}:void 0,title:s??f(r?.title),presets:m,defaultMonths:r?.defaultMonths,map:r?.map,choropleth:r?.choropleth,draw:r?.draw,exportable:r?.export,overlay:r?.overlay,legend:r?.legend,notice:r?.notice,tokens:r?.tokens,labels:h,view:d??void 0,linkId:l,link:r?.link,className:c,onClose:u}):t.React.createElement(`div`,{className:`atlas-panel-unavailable`},f(`map_service_missing`)??`This button has no map service configured.`)};_c.contextTypes={intl:t.PropTypes.object.isRequired};var vc=(0,t.connect)((e,t)=>({session:t.session??e?.security?.svSession}))(_c),yc=a,bc=o;e.AtlasMap=Xi,e.Choropleth=ga,e.CirclePicker=wa,e.ConfiguredMap=vc,e.DateRange=Ea,e.DrawBar=Na,e.DrawTool=ka,e.FeaturePanel=sc,e.FeatureSet=eo,e.Legend=Ao,e.LegendControl=jo,e.PointPicker=pc,e.ZoomRail=Bi,Object.defineProperty(e,"appearance",{enumerable:!0,get:function(){return F}}),Object.defineProperty(e,"bootstrap",{enumerable:!0,get:function(){return He}}),Object.defineProperty(e,"config",{enumerable:!0,get:function(){return R}}),Object.defineProperty(e,"data",{enumerable:!0,get:function(){return si}}),e.name=yc,e.version=bc});