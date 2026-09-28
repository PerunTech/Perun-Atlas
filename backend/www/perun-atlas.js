(function(e,t){typeof exports==`object`&&typeof module<`u`?t(exports,require("perun-core"),require("spatial")):typeof define==`function`&&define.amd?define([`exports`,`perun-core`,`spatial`],t):(e=typeof globalThis<`u`?globalThis:e||self,t(e[`perun-atlas`]={},e[`perun-core`],e.spatial))})(this,function(e,t,n){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});var r=Object.defineProperty,i=(e,t)=>{let n={};for(var i in e)r(n,i,{get:e[i],enumerable:!0});return t||r(n,Symbol.toStringTag,{value:`Module`}),n},a=`perun-atlas`,o=`1.0.0`,s=[`DESCRIPTOR`,`pkid`,`parent_id`,`type`,`status`],c={weight:1,opacity:1,color:`#4A5C66`,fillOpacity:.55,fillColor:`#B8C6CC`},l=(e={},t={})=>({...c,...e.style,...t}),u=(e,t)=>e||t?{...e,...t}:void 0,d=(e,t)=>{let n=e?.variants;if(!n?.by)return e;let r=n.cases?.[t?.properties?.[n.by]];return r?{...e,...r,style:u(e.style,r.style),marker:u(e.marker,r.marker),label:u(e.label,r.label),popup:u(e.popup,r.popup),arrow:u(e.arrow,r.arrow)}:e},f=(e,t)=>{let n=e?.label?.scale;if(!n)return!1;let{min:r=0,max:i=24}=n;return t>=r&&t<=i},p=(e,t)=>{let n=e?.label?.field;if(!n)return null;let r=t?.properties?.[n];return r==null?null:String(r)},m=(e,t)=>{let n=e=>{let n=e?t?.properties?.[e]:void 0;return n==null||n===``?null:String(n)};return n(e?.label?.field)??n(e?.popup?.title)??n(e?.details?.title)},h=(e,t,n)=>{let r=e?.popup;if(!r)return null;let i=e=>{let n=t?.properties?.[e];return n==null||n===``?null:String(n)},a=r.title?i(r.title):null,o=(r.fields??[]).map(({label:e,field:t})=>({label:e&&n?.(e)||e||t,value:i(t)})).filter(e=>e.value!==null);return a===null&&o.length===0?null:{title:a,rows:o}},g=(e,t,n)=>{let r=e?.details;if(!r)return null;let i=t?.properties??{},a=new Set([...s,...r.exclude??[]]),o=e=>e==null||e===``?null:String(e),c=r.title?o(i[r.title]):null,l=Object.entries(i).filter(([e,t])=>!a.has(e)&&e!==r.title&&(typeof t!=`object`||!t)).map(([e,t])=>({field:e,label:n?.(e.toLowerCase())||e,value:o(t)})).filter(e=>e.value!==null);return c===null&&l.length===0?null:{title:c,rows:l,spec:r}},_=(e,t)=>{let n=e;for(let e=0;e<t.length;e+=1){if(n==null)return n;let r=t.length-e===1?t[e]:t.slice(e).join(`.`);if(Object.prototype.hasOwnProperty.call(Object(n),r))return n[r];n=n[t[e]]}return n},v=(e,t)=>_(e,String(t).split(`.`)),y=e=>{let t=String(e).split(`.`);return e=>_(e,t)},b=(e,t)=>e.replace(/\{([^}]+)\}/g,(e,n)=>{let r=v(t,n);return r==null?e:String(r)}),x=`::`,S=(e=[],t=[])=>e.length>=2||e.some(e=>t.includes(e.key)),C=(e,t)=>`${e??``}${x}${t??``}`,w=`${x}fallback`,T=(e,t,n)=>{let r=t?.variants?.by,i=r?n?.properties?.[r]:void 0,a=i!==void 0&&t?.variants?.cases?.[i]?i:void 0;return{name:e,value:a,key:C(e,a)}},E=(e=``)=>/Point$/.test(e)?`point`:/LineString$/.test(e)?`line`:`area`,D=({name:e,value:t,descriptor:n},r)=>{let i=n?.legend;if(i){let e=r?.(i);if(e)return e}let a=t??e;return a==null||a===``?``:r?.(String(a).toLowerCase())||String(a)},O=(e,t)=>{let n=E(e.geometry),r=e.descriptor??{};return{key:C(e.name,e.value),label:D(e,t),kind:n,path:l(r),marker:n===`point`?r.marker??{}:null,arrow:n===`line`?r.arrow??null:null}},k=(e=[],t)=>e.map(e=>O(e,t)).filter(e=>e.label!==``),A=({palette:e={},values:t=[],fallback:n,usedFallback:r=!1,unknownLabel:i=`unknown`}={},a)=>{let o=e=>({...c,color:e,fillColor:e,fillOpacity:.7}),s=t.filter(t=>Object.prototype.hasOwnProperty.call(Object(e),t)&&e[t]).map(t=>({key:String(t),label:a?.(String(t).toLowerCase())||String(t),kind:`area`,path:o(e[t]),marker:null,arrow:null}));return!r||!n?s:[...s,{key:w,label:a?.(i)||`Not classified`,kind:`area`,path:o(n),marker:null,arrow:null}]},j={__unknown:`#B8C6CC`},M=(e,t)=>Object.prototype.hasOwnProperty.call(Object(e),t)&&!!e[t],N=({field:e,palette:t=j,fallback:n=j.__unknown})=>{let r=new Set,i=y(e),a=e=>i(e?.properties);return i=>{let o=a(i);return o==null?n:M(t,o)?t[o]:(r.has(o)||(r.add(o),console.warn(`perun-atlas: no palette entry for ${e}="${o}"`)),n)}},P=(e=[],{field:t,palette:n=j}={})=>{let r=y(t),i=e=>r(e?.properties),a=new Set,o=[],s=!1;return e.forEach(e=>{let t=i(e);if(t==null){s=!0;return}M(n,t)||(s=!0),!a.has(t)&&(a.add(t),o.push(t))}),{values:o,usedFallback:s}},F=({field:e,palette:t=j}={})=>{let n=y(e);return e=>{let r=n(e?.properties);return r!=null&&M(t,r)?String(r):w}},I=(e,t,{featureKey:n,rowKey:r,as:i=`status`})=>{let a=y(r),o=y(n),s=new Map((t??[]).map(e=>[String(a(e)),e]));return{...e,features:(e?.features??[]).map(e=>{let t=s.get(String(o(e?.properties)));return t?{...e,properties:{...e.properties,[i]:t}}:e})}},L=i({BASE_STYLE:()=>c,DEFAULT_PALETTE:()=>j,categoriesDrawn:()=>P,colourBy:()=>N,detailsFor:()=>g,joinStatus:()=>I,labelFor:()=>p,labelVisible:()=>f,legendFrom:()=>k,legendFromPalette:()=>A,nameFor:()=>m,pathOptions:()=>l,popupFor:()=>h,variantOf:()=>d}),R={crs:{type:`crs`,param:`SPATIAL_CRS`,legacy:`sysCrs`,required:!0,doc:`EPSG code, or { code, def } for a proj4 definition.`},center:{type:`latlng`,param:`SPATIAL_CENTER`,legacy:`sysCenter`,required:!0,doc:`Initial map centre as { lat, lng }.`},bounds:{type:`bounds`,param:`SPATIAL_BOUNDS`,legacy:`sysBounds`,doc:`Spatial limits as [ {lat,lng} southwest, {lat,lng} northeast ].`},zoom:{type:`int`,param:`SPATIAL_ZOOM`,default:8},minZoom:{type:`int`,param:`SPATIAL_MIN_ZOOM`,default:0},maxZoom:{type:`int`,param:`SPATIAL_MAX_ZOOM`,default:18},bboxOrder:{type:`bool`,param:`SPATIAL_SWITCH_BBOX_ORDER`,legacy:`switchBboxOrder`,default:!1,doc:`Reverse WMS bounding box axis order.`},units:{type:`enum`,param:`SPATIAL_MEASUREMENT_SYSTEM`,legacy:`measurementSystem`,values:[`metric`,`imperial`],default:`metric`},attribution:{type:`string`,param:`SPATIAL_ATTRIBUTION`,default:``},dataSrid:{type:`srid`,param:`sys.gis.default_srid`,default:`4326`,doc:`EPSG code the database stores geometry in, without the prefix.`}},ee=Object.keys(R).filter(e=>R[e].required),z=i({REQUIRED:()=>ee,SCHEMA:()=>R}),B=(e,t,n)=>{throw TypeError(`perun-atlas: cannot read "${e}" as ${n} (got ${JSON.stringify(t)})`)},te=e=>{if(typeof e!=`string`)return e;let t=e.trim();if(!t.startsWith(`{`)&&!t.startsWith(`[`))return e;try{return JSON.parse(t)}catch{return e}},V=(e,t)=>{let n=te(t);if(n&&typeof n==`object`&&`lat`in n&&`lng`in n)return{lat:Number(n.lat),lng:Number(n.lng)};if(typeof n==`string`&&n.includes(`,`)){let[e,t]=n.split(`,`).map(Number);if(Number.isFinite(e)&&Number.isFinite(t))return{lat:e,lng:t}}return B(e,t,`a { lat, lng } pair`)},ne={string:(e,t)=>String(t),int:(e,t)=>{let n=Number(t);return Number.isInteger(n)?n:B(e,t,`an integer`)},bool:(e,t)=>{if(typeof t==`boolean`)return t;let n=String(t).trim().toLowerCase();return[`true`,`1`,`yes`].includes(n)?!0:![`false`,`0`,`no`].includes(n)&&B(e,t,`a boolean`)},enum:(e,t,n)=>n.values.includes(t)?t:B(e,t,`one of ${n.values.join(`, `)}`),latlng:V,bounds:(e,t)=>{let n=te(t);return Array.isArray(n)&&n.length===2?[V(e,n[0]),V(e,n[1])]:B(e,t,`a [southwest, northeast] pair`)},srid:(e,t)=>{let n=String(t).trim().replace(/^EPSG:/i,``);return/^\d{4,6}$/.test(n)?n:B(e,t,`an EPSG code such as 4326`)},crs:(e,t)=>{let n=te(t);return typeof n==`string`&&n.startsWith(`EPSG:`)||n&&typeof n==`object`&&n.code?n:B(e,t,`an EPSG code or { code, def } object`)}},re=(e,t,n)=>{let r=ne[n.type];if(!r)throw TypeError(`perun-atlas: no coercion for type "${n.type}" on "${e}"`);return r(e,t,n)},ie=async()=>{let e=Object.entries(R).filter(([,e])=>e.param),n=await Promise.all(e.map(([e,n])=>t.axios.get(`${window.server}/WsConf/params/get/sys/${n.param}`).then(t=>[e,t?.data?.VALUE]).catch(()=>[e,void 0])));return Object.fromEntries(n.filter(([,e])=>e!==void 0&&e!==``))},ae=async e=>(await t.axios.get(`${window.server}/spatial/config/${e}`))?.data?.params??{},oe=()=>{let e={};return Object.entries(R).forEach(([t,n])=>{if(!n.legacy)return;let r=window[n.legacy];r!=null&&r!==``&&(e[t]=r)}),e},se=()=>Object.fromEntries(Object.entries(R).filter(([,e])=>`default`in e).map(([e,t])=>[e,t.default])),ce=(e,t,n)=>{let r=Object.keys(e).filter(e=>!(e in t)&&!(e in n));r.length&&console.warn(`perun-atlas: ${r.length} setting(s) still come from window globals — `+r.map(e=>`window.${R[e].legacy}`).join(`, `)+`. Seed `+r.map(e=>R[e].param).join(`, `)+` in SVAROG_SYS_PARAMS; this fallback is temporary.`)},le=async(e={})=>{let t=await ie(),n=oe(),r={...se(),...n,...t,...e};ce(n,t,e);let i={},a=[];Object.entries(R).forEach(([e,t])=>{let n=r[e];if(n!==void 0)try{i[e]=re(e,n,t)}catch(e){a.push(e.message)}});let o=ee.filter(e=>i[e]===void 0);if(o.length&&a.push(`missing required setting(s): `+o.map(e=>`${e} (parameter ${R[e].param})`).join(`, `)),a.length)throw Error(`perun-atlas: configuration could not be resolved.
  - `+a.join(`
  - `));return i},ue=async()=>{let[e,t,n]=[await ie(),oe(),se()];return Object.fromEntries(Object.keys(R).map(r=>[r,r in e?{source:`SVAROG_SYS_PARAMS`,value:e[r]}:r in t?{source:`window.${R[r].legacy}`,value:t[r]}:r in n?{source:`schema default`,value:n[r]}:{source:`unresolved`,value:void 0}]))},H=Object.getPrototypeOf(n.spatial);H.assets;var de=H.config,U=H.core,fe=H.data,pe=H.tools,W=H.ui;H.proj4;var me=e=>Array.isArray(e)&&typeof e[0]==`number`,he=e=>{if(!e)return[];if(e.type===`GeometryCollection`)return(e.geometries??[]).flatMap(he);let t=e=>Array.isArray(e)?me(e)?[e]:e.flatMap(t):[];return t(e.coordinates)},ge=(e,t)=>{if(!e)return e;if(e.type===`GeometryCollection`)return{...e,geometries:(e.geometries??[]).map(e=>ge(e,t))};let n=e=>Array.isArray(e)?me(e)?t(e):e.map(n):e;return{...e,coordinates:n(e.coordinates)}},_e=(e,t)=>Array.isArray(e?.features)?{...e,features:e.features.map(e=>e?.geometry?{...e,geometry:ge(e.geometry,t)}:e)}:e,{Map:G,factory:K}=U,ve={3857:()=>K.CRS.EPSG3857,3395:()=>K.CRS.EPSG3395,4326:()=>K.CRS.EPSG4326},ye=e=>ve[String(e)]?.()??null,be=new Set,xe=e=>e==null?null:ye(e)||(be.has(String(e))||(be.add(String(e)),console.warn(`perun-atlas: cannot express a coordinate in EPSG:${e} — the engine builds 3857, 3395 and 4326. Using the map's own projection instead, which is correct only if this deployment stores geometry in it.`)),null),Se=e=>{let t=xe(e);if(!t)return G.getBBox();let n=G.getBounds(),r=t.projection.project(n.getSouthWest()),i=t.projection.project(n.getNorthEast());return`${r.x},${r.y},${i.x},${i.y}`},Ce=(e,t)=>{let{x:n,y:r}=(xe(t)??G.getCRS()).projection.project(K.latLng(e));return{x:n,y:r}},q=(e,t)=>{let[n,r]=Array.isArray(e)?e:[e?.x,e?.y],{lat:i,lng:a}=(xe(t)??G.getCRS()).projection.unproject(K.point(n,r));return{lat:i,lng:a}},we=(e,t)=>_e(e,e=>{let{lat:n,lng:r}=q(e,t);return[r,n,...e.slice(2)]}),Te=(e,t)=>Ee(e,t).ew,Ee=(e,t)=>{let n=.001,r=K.latLng(e),i=K.latLng({lat:r.lat,lng:r.lng+n}),a=K.latLng({lat:r.lat+n,lng:r.lng}),o=Ce(r,t),s=G.distance(r,i),c=G.distance(r,a);return{ew:s?Math.abs(Ce(i,t).x-o.x)/s:1,ns:c?Math.abs(Ce(a,t).y-o.y)/c:1}},De=e=>e>0?Math.min(12,Math.max(0,3-Math.floor(Math.log10(e)))):6,Oe=(e,t)=>{let n=10**t;return Math.round(e*n)/n},ke=(e,t,n,r=24)=>{let{ew:i,ns:a}=Ee(e,n),{x:o,y:s}=Ce(e,n),c=t*i,l=t*a,u=De(Math.min(c,l));return Array.from({length:Math.max(3,r)},(e,t)=>{let n=2*Math.PI*t/Math.max(3,r);return{x:Oe(o+c*Math.cos(n),u),y:Oe(s+l*Math.sin(n),u)}})},{Map:Ae,store:je}=U,Me={crs:`crs`,center:`center`,bounds:`bounds`,zoom:`zoom`,minZoom:`minZoom`,maxZoom:`maxZoom`,units:`measurementSystem`,bboxOrder:`switchBboxOrder`},Ne=e=>{if(!e)return;let t=Ae.getCRS?.()?.code,n=typeof e==`object`?e.code:e;t&&n&&t!==n&&console.warn(`perun-atlas: this deployment declares ${n}, but the map is on ${t}. The engine could not resolve the declared value — as a plain code it must be EPSG:3857, EPSG:3395 or EPSG:4326, and any other projection needs a proj4 definition. Basemap tiles will be requested outside the grid they are published on.`)},Pe=e=>{if(!e)return;je.addState(`dbCRSCode`,{dbCRS:e});let t=ye(e);if(t){je.addState(`dbCRS`,t);return}let n=Ae.getCRS?.()?.code;e!==n?.split(`:`)[1]&&console.warn(`perun-atlas: this deployment stores geometry in EPSG:${e}, which spatial cannot convert from — it handles 3857, 3395 and 4326. Geometry will be read as though it were already in ${n}, and will be drawn in the wrong place.`)},Fe=(e={})=>{let t={};Object.entries(Me).forEach(([n,r])=>{e[n]!==void 0&&(t[r]=e[n])});let n=de.configure(t);return Ne(e.crs),Pe(e.dataSrid),n},Ie=i({COERCE:()=>ne,applyToEngine:()=>Fe,batchSource:()=>ae,coerce:()=>re,defaultSource:()=>se,explain:()=>ue,legacySource:()=>oe,remoteSource:()=>ie,resolve:()=>le}),{geobuf:Le,Pbf:Re}=fe,ze=(e,t,n)=>{window.PERUN_ATLAS_LAST=n,console.groupCollapsed(`perun-atlas: ${n.features.length} feature(s), ${t} bytes — ${e}`),console.log(`collection`,n),console.log(`also at window.PERUN_ATLAS_LAST`),console.groupEnd()},Be=async(e,n={})=>{let r=`${window.server}${b(e,n)}`,i=await(0,t.axios)({method:`get`,url:r,responseType:`arraybuffer`}),a=i?.data?.byteLength??0;if(!i?.data||a===0){let e={type:`FeatureCollection`,features:[]};return ze(r,a,e),e}let o=Le.decode(new Re(new Uint8Array(i.data)));if(!o||!o.type){console.warn(`perun-atlas: response from ${r} decoded to no GeoJSON type; treating as empty`),console.warn(`perun-atlas: response body was`,new TextDecoder().decode(i.data).slice(0,500));let e={type:`FeatureCollection`,features:[]};return ze(r,a,e),e}let s=o.type===`FeatureCollection`?o:{type:`FeatureCollection`,features:[o]};return ze(r,a,s),s},Ve=e=>e?.properties?.DESCRIPTOR??e?.properties?.descriptor??null,He=e=>({id:e?.id??e?.properties?.OBJECT_ID??null,parentId:e?.properties?.parent_id??e?.properties?.PARENT_ID??null}),Ue=(e,t,n=`id`)=>{if(t==null)return!1;let r=He(e),i=n===`parent`?r.parentId:r.id;return i!=null&&String(i)===String(t)},{factory:We}=U,{getServerOrigin:Ge}=t.utils,Ke=`GEO_LAYER_TYPE`,qe={BASEMAP:`1`,OVERLAY:`2`},Je=(e,t=Ke)=>({layerType:e?.[`${t}.LAYER_TYPE`],protocol:(e?.[`${t}.PROTOCOL`]??``).toLowerCase(),version:e?.[`${t}.VERSION`]||`1.1.1`,format:e?.[`${t}.FORMAT`]||`image/png`,url:e?.[`${t}.URL`],group:e?.[`${t}.LAYER_GROUP`]||`Other`,title:e?.[`${t}.TITLE`],label:e?.[`${t}.LABEL_CODE`]||e?.[`${t}.TITLE`]}),Ye=[{match:/openstreetmap\.org/i,maxNativeZoom:19,attribution:`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`},{match:/opentopomap\.org/i,maxNativeZoom:17,attribution:`&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)`},{match:/cartocdn\.com/i,maxNativeZoom:20,attribution:`&copy; <a href="https://carto.com/attributions">CARTO</a>`},{match:/arcgisonline\.com/i,attribution:`Tiles &copy; <a href="https://www.esri.com">Esri</a>`}],Xe=e=>Ye.find(t=>t.match.test(e??``))??{},Ze=(e,{maxZoom:t}={})=>{let n=e.url||Ge(),r=Xe(n),i={...t!=null&&{maxZoom:t},...r.maxNativeZoom!=null&&{maxNativeZoom:r.maxNativeZoom}},a=r.attribution?{attribution:r.attribution}:{};if(e.protocol===`wms`)return We.tileLayer.extendedWMS(n,{layers:e.title,format:e.format,version:e.version,transparent:!0,uppercase:!0,...i,...a,...e.layerType===qe.OVERLAY&&{tiled:!0,isOverlay:!0}});if(e.protocol===`tile`){let e=/google|mt\{s\}/i.test(n);return We.tileLayer(n,{...i,...a,...e&&{subdomains:[`mt0`,`mt1`,`mt2`,`mt3`]}})}return e.protocol===`grid`?e.url?.includes(`google`)?We.gridLayer.googleMutant({maxZoom:24,type:e.url.split(`_`)[1]}):(console.warn(`perun-atlas: grid layer "${e.title}" has no recognised provider in its URL`),null):(console.warn(`perun-atlas: unsupported layer protocol "${e.protocol}" for "${e.title}"`),null)},Qe=async(e,n={})=>{let r={},i={},a=(await t.axios.get(`${window.server}/ReactElements/getTableData/${e}/${Ke}/0`).catch(e=>(console.error(`perun-atlas: layer catalogue unavailable`,e),null)))?.data;return Array.isArray(a)&&a.forEach(e=>{let t=Je(e),a=Ze(t,n);if(!a)return;let o=t.layerType===qe.OVERLAY?i:r;o[t.group]=o[t.group]||{},o[t.group][t.label]=a}),{basemap:r,overlays:i}},$e=e=>{let t=Object.values(e??{})[0];return t?Object.values(t)[0]:null},et=async(e,n={})=>{if(!e)return[];let r=`${window.server}${b(e,n)}`,i=(await t.axios.get(r).catch(e=>(console.error(`perun-atlas: rows unavailable from ${r}`,e),null)))?.data;return i&&!Array.isArray(i)&&console.warn(`perun-atlas: ${r} answered with no array of rows; treating as empty`),Array.isArray(i)?i:[]},tt=async(e,n,r,i)=>{if(!e)return null;let a=`${window.server}${b(e,n)}`,o=await t.axios.get(a).catch(e=>(console.error(`perun-atlas: no ${r} from ${a}`,e),null));if(!o)return null;let s=o.data;return i(s)?s:(console.error(`perun-atlas: ${a} answered with no ${r}`,s),null)},nt=e=>!!e&&typeof e==`object`&&!Array.isArray(e),rt=(e,t={})=>tt(e,t,`form schema`,e=>nt(e)&&!!e.properties),it=(e,t={})=>tt(e,t,`form layout`,nt),at=(e,t)=>{if(!e?.properties||!t?.length)return e??null;let n=e.properties,r={},i=new Set;t.forEach(e=>{if(Object.prototype.hasOwnProperty.call(n,e)){r[e]=n[e],i.add(e);return}let t=e.lastIndexOf(`.`),a=t===-1?``:e.slice(0,t),o=t===-1?``:e.slice(t+1),s=a?n[a]:null,c=s?.properties?.[o];if(!c){console.warn(`perun-atlas: the form schema has no "${e}", so it is not on the form`);return}if(i.has(a))return;let l=r[a]??{...s,properties:{}};l.properties={...l.properties,[o]:c},r[a]=l}),Object.keys(r).forEach(e=>{if(i.has(e))return;let t=r[e],a=(n[e].required??[]).filter(e=>e in t.properties);a.length?t.required=a:delete t.required});let a={...e,properties:r};delete a.title;let o=(e.required??[]).filter(e=>e in r);if(o.length?a.required=o:delete a.required,a.dependencies){let e=Object.entries(a.dependencies).filter(([e])=>e in r);e.length?a.dependencies=Object.fromEntries(e):delete a.dependencies}return a},ot=(e,t)=>{if(!t?.properties)return e??{};let n={...e??{}};return Object.entries(t.properties).forEach(([e,t])=>{t?.properties&&(n[e]=ot(n[e],t))}),n},st={boolean:[`checkbox`,`radio`,`select`,`hidden`],string:[`text`,`password`,`email`,`hostname`,`ipv4`,`ipv6`,`uri`,`data-url`,`radio`,`select`,`textarea`,`hidden`,`date`,`datetime`,`date-time`,`alt-date`,`alt-datetime`,`time`,`color`,`file`],number:[`text`,`select`,`updown`,`range`,`radio`,`hidden`],integer:[`text`,`select`,`updown`,`range`,`radio`,`hidden`],array:[`select`,`checkboxes`,`files`,`hidden`]},ct=new Set([`AltDateTimeWidget`,`AltDateWidget`,`CheckboxWidget`,`CheckboxesWidget`,`ColorWidget`,`DateTimeWidget`,`DateWidget`,`EmailWidget`,`FileWidget`,`HiddenWidget`,`PasswordWidget`,`RadioWidget`,`RangeWidget`,`SelectWidget`,`TextWidget`,`TextareaWidget`,`TimeWidget`,`URLWidget`,`UpDownWidget`]),lt=new Set(Object.values(st).flat()),ut=(e,t)=>ct.has(e)||(t?(st[t]??[]).includes(e):lt.has(e)),dt=(e,t)=>{if(!nt(e))return e??null;let n=[],r=(e,t)=>{let i={};return Object.entries(e).forEach(([e,a])=>{if(e===`ui:widget`&&typeof a==`string`&&!ut(a,t?.type)){n.push(a);return}let o=e===`items`?t?.items:t?.properties?.[e];i[e]=nt(a)&&!e.startsWith(`ui:`)?r(a,o):a}),i},i=r(e,t);return n.length&&console.warn(`perun-atlas: this form cannot draw ${[...new Set(n)].map(e=>`"${e}"`).join(`, `)} -- those are the widgets a record form registers, and the draw row is not one. The fields keep the widget their schema implies.`),n.length?i:e},{Map:ft,factory:pt}=U,mt=(e,t,n)=>{let r=he(e?.geometry);if(r.length===0)return null;let i=pt.latLng(t),a=1/0,o=0;return r.forEach(e=>{let t=ft.distance(i,pt.latLng(q(e,n)));t<a&&(a=t),t>o&&(o=t)}),{nearest:a,furthest:o}},ht=(e,t,n={})=>{let{srid:r,mode:i=`touches`}=n,a=e?.features??[],o={inside:[],outside:a,has:()=>!1,metres:()=>null,total:a.length};if(!t||!(t.radius>0))return o;let s={lat:t.lat,lng:t.lng};if(!Number.isFinite(s.lat)||!Number.isFinite(s.lng))return o;let c=new WeakMap,l=new WeakSet,u=[],d=[];return a.forEach(e=>{let n=mt(e,s,r);if(!n){d.push(e);return}c.set(e,n.nearest),(i===`contains`?n.furthest<=t.radius:n.nearest<=t.radius)?(l.add(e),u.push(e)):d.push(e)}),u.sort((e,t)=>c.get(e)-c.get(t)),{inside:u,outside:d,has:e=>e?l.has(e):!1,metres:e=>e&&c.has(e)?c.get(e):null,total:a.length}},gt=(e,t={})=>{let{id:n=`{pkid}`,join:r=`,`}=t;return(e??[]).map(e=>b(n,e?.properties??{})).filter(e=>e&&e!==n).join(r)},_t=e=>encodeURIComponent(JSON.stringify(e)),vt=e=>e.replace(/ /g,`%20`),yt=(e,t,n)=>e==null?``:t===`form`||!t&&/form-urlencoded/.test(n??``)?_t(e):JSON.stringify(e),bt=(e,t)=>{let n=typeof e==`string`?xt(e):e,r=String(n?.type??``).toUpperCase();return r===`ERROR`||r===`EXCEPTION`?{ok:!1,message:[n?.title,n?.message].filter(Boolean).join(` — `)}:t&&typeof e==`string`&&new RegExp(t,`i`).test(e)?{ok:!1,message:e.trim().slice(0,300)}:{ok:!0,message:null}},xt=e=>{try{return JSON.parse(e)}catch{return null}},St=/^\{([^{}]+)\}$/,Ct=`...`,wt=(e,t)=>{if(typeof e==`string`){let n=e.match(St);return n?v(t,n[1])??e:b(e,t)}if(Array.isArray(e))return e.map(e=>wt(e,t));if(e&&typeof e==`object`){let n={};return Object.entries(e).forEach(([e,r])=>{let i=wt(r,t);if(e===Ct){i&&typeof i==`object`&&!Array.isArray(i)?Object.assign(n,i):n[e]=i;return}n[e]=i}),n}return e},Tt=async(e,n={},r={})=>{let{body:i,contentType:a=`application/x-www-form-urlencoded`,encoding:o,failure:s}=r,c=`${window.server}${vt(b(e,n))}`;try{let e=await(0,t.axios)({method:`post`,url:c,headers:{"Content-Type":a},data:yt(i,o,a)}),n=bt(e?.data,s);return n.ok||(console.error(`perun-atlas: ${c} refused the save`,e?.data),console.error(`perun-atlas: the payload was`,i)),{...n,data:e?.data}}catch(e){return console.error(`perun-atlas: save to ${c} failed`,e),{ok:!1,message:e?.message??String(e),data:null}}},Et=e=>JSON.stringify(e??{type:`FeatureCollection`,features:[]},null,2),Dt=(e,t=[])=>{let n=new Set([...s,...t]),r=new Set;return e.forEach(e=>{Object.entries(e?.properties??{}).forEach(([e,t])=>{!n.has(e)&&(typeof t!=`object`||!t)&&r.add(e)})}),[...r]},Ot=(e,{fields:t,exclude:n,labelResolver:r}={})=>t?.length?t.map(({field:e,label:t})=>({field:e,header:t&&r?.(t)||t||e})):Dt(e,n).map(e=>({field:e,header:r?.(e.toLowerCase())||e})),kt=e=>e.map(([e,t])=>`${e} ${t}`).join(`, `),At=e=>e.map(e=>`(${kt(e)})`).join(`, `),jt={Point:([e,t])=>`POINT (${e} ${t})`,MultiPoint:e=>`MULTIPOINT (${kt(e)})`,LineString:e=>`LINESTRING (${kt(e)})`,MultiLineString:e=>`MULTILINESTRING (${At(e)})`,Polygon:e=>`POLYGON (${At(e)})`,MultiPolygon:e=>`MULTIPOLYGON (${e.map(e=>`(${At(e)})`).join(`, `)})`},Mt=e=>{let t=jt[e?.type];return t&&e.coordinates?.length?t(e.coordinates):``},Nt=e=>{if(e==null)return``;let t=String(e),n=!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t)&&/^[=+\-@\t\r]/.test(t)?`'${t}`:t;return/[",\r\n]/.test(n)?`"${n.replace(/"/g,`""`)}"`:n},Pt=(e,{fields:t,exclude:n,labelResolver:r}={})=>{let i=e?.features??[],a=Ot(i,{fields:t,exclude:n,labelResolver:r}),o=e=>e?.geometry?.type??``,s=i.some(e=>/Point$/.test(o(e))),c=i.some(e=>o(e)&&!/Point$/.test(o(e))),l=[...a.map(e=>e.header),...s?[`latitude`,`longitude`]:[],...c?[`geometry`]:[]],u=i.map(e=>{let t=a.map(t=>Nt(v(e?.properties,t.field)));if(s){let[n,r]=/^Point$/.test(o(e))?e.geometry.coordinates??[]:[];t.push(Nt(r),Nt(n))}return c&&t.push(Nt(Mt(e?.geometry))),t});return[l.map(Nt),...u].map(e=>e.join(`,`)).join(`\r
`)},Ft={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&apos;`},It=e=>String(e).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g,``).replace(/[&<>"']/g,e=>Ft[e]),Lt=e=>`<coordinates>${e.map(e=>e.join(`,`)).join(` `)}</coordinates>`,Rt=e=>`<LinearRing>${Lt(e)}</LinearRing>`,zt={Point:e=>`<Point>${Lt([e])}</Point>`,LineString:e=>`<LineString><tessellate>1</tessellate>${Lt(e)}</LineString>`,Polygon:([e,...t])=>`<Polygon><tessellate>1</tessellate><outerBoundaryIs>${Rt(e)}</outerBoundaryIs>`+t.map(e=>`<innerBoundaryIs>${Rt(e)}</innerBoundaryIs>`).join(``)+`</Polygon>`,MultiPoint:e=>`<MultiGeometry>${e.map(zt.Point).join(``)}</MultiGeometry>`,MultiLineString:e=>`<MultiGeometry>${e.map(zt.LineString).join(``)}</MultiGeometry>`,MultiPolygon:e=>`<MultiGeometry>${e.map(zt.Polygon).join(``)}</MultiGeometry>`},Bt=e=>{let t=zt[e?.type];return t&&e.coordinates?.length?t(e.coordinates):``},Vt=(e,t,n)=>{let r=n?.(e),i=Bt(e?.geometry),a=t.map(({field:t,header:n})=>{let r=v(e?.properties,t),i=r==null?``:It(r);return`        <Data name="${It(t)}"><displayName>${It(n)}</displayName><value>${i}</value></Data>`});return[`    <Placemark>`,...r==null||r===``?[]:[`      <name>${It(r)}</name>`],...a.length?[`      <ExtendedData>`,...a,`      </ExtendedData>`]:[],...i?[`      ${i}`]:[],`    </Placemark>`].join(`
`)},Ht=(e,{fields:t,exclude:n,labelResolver:r,nameOf:i}={})=>{let a=e?.features??[],o=Ot(a,{fields:t,exclude:n,labelResolver:r});return[`<?xml version="1.0" encoding="UTF-8"?>`,`<kml xmlns="http://www.opengis.net/kml/2.2">`,`  <Document>`,...a.map(e=>Vt(e,o,i)),`  </Document>`,`</kml>`,``].join(`
`)},Ut=i({SYSTEM_FIELDS:()=>s,bboxIn:()=>Se,bindPath:()=>b,crsFor:()=>ye,descriptorOf:()=>Ve,fetchGeometry:()=>Be,fetchLayers:()=>Qe,fetchRows:()=>et,fetchSchema:()=>rt,fetchUISchema:()=>it,fillBody:()=>wt,firstOf:()=>$e,identifiersOf:()=>gt,identityOf:()=>He,inDegrees:()=>we,latLngOf:()=>q,mapPositions:()=>_e,matchesIdentity:()=>Ue,pickFields:()=>at,pointIn:()=>Ce,positionsOf:()=>he,postTo:()=>Tt,ringIn:()=>ke,spanTo:()=>mt,toCSV:()=>Pt,toGeoJSON:()=>Et,toKML:()=>Ht,unitsPerMetre:()=>Te,usableUI:()=>dt,valueAt:()=>v,withGroups:()=>ot,withinCircle:()=>ht}),Wt={plus:[`M12 5l0 14`,`M5 12l14 0`],minus:[`M5 12l14 0`],maximize:[`M4 8v-2a2 2 0 0 1 2 -2h2`,`M4 16v2a2 2 0 0 0 2 2h2`,`M16 4h2a2 2 0 0 1 2 2v2`,`M16 20h2a2 2 0 0 0 2 -2v-2`],minimize:[`M15 19v-2a2 2 0 0 1 2 -2h2`,`M15 5v2a2 2 0 0 0 2 2h2`,`M5 15h2a2 2 0 0 1 2 2v2`,`M5 9h2a2 2 0 0 0 2 -2v-2`],"zoom-scan":[`M4 8v-2a2 2 0 0 1 2 -2h2`,`M4 16v2a2 2 0 0 0 2 2h2`,`M16 4h2a2 2 0 0 1 2 2v2`,`M16 20h2a2 2 0 0 0 2 -2v-2`,`M8 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0`,`M16 16l-2.5 -2.5`]},Gt=1.75,Kt=(e,t={})=>{let n=Wt[e];if(!n)return``;let{className:r=`atlas-icon atlas-icon--${e}`,size:i=18,stroke:a=Gt}=t;return`<svg xmlns="http://www.w3.org/2000/svg" class="${r}" width="${i}" height="${i}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${a}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">`+n.map(e=>`<path d="${e}"/>`).join(``)+`</svg>`},qt=(e,t,n)=>n>t?(Math.min(Math.max(e,t),n)-t)/(n-t):0,Jt=e=>e<=10?1:e<=20?2:5,Yt=(e,t)=>{if(!Number.isFinite(e)||!Number.isFinite(t)||!(t>e))return[];let n=Jt(t-e+1),r=[];for(let i=Math.ceil(e);i<=t;i+=1){let a=(i-e)%n===0;r.push({zoom:i,offset:qt(i,e,t),labelled:i===e||i===t||a&&t-i>=n})}return r},Xt=(e,t,n)=>!Number.isFinite(t)||!Number.isFinite(n)||!(n>t)?[]:(e??[]).filter(e=>Number.isFinite(e?.from)).map(e=>({mark:e,to:e.to??e.from})).filter(({mark:e,to:r})=>r>=t&&e.from<=n).map(({mark:e,to:r})=>{let i=qt(e.from,t,n),a=qt(Math.max(r,e.from),t,n);return{...e,from:Math.min(Math.max(e.from,t),n),to:Math.min(Math.max(r,t),n),offset:i,span:a-i}}),Zt=.0254/96,Qt=(e,t)=>!(e>0)||!(t>0)?null:e/t/Zt,$t=e=>{if(!(e>0)||!Number.isFinite(e))return null;let t=10**(Math.floor(Math.log10(e))-1);return Math.round(e/t)*t},en=e=>{let t=$t(e);return t===null?null:`1:${String(Math.max(Math.round(t),1)).replace(/\B(?=(\d{3})+(?!\d))/g,`\xA0`)}`},tn=[24,24];function nn(e){let t=document.createElement(`style`);t.textContent=e,document.head.insertBefore(t,document.head.firstChild)}nn(`/*
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
`);var{Map:J,control:rn,factory:an}=U,{useEffect:on,useMemo:sn,useState:cn}=t.React,ln={in:`Zoom in`,out:`Zoom out`,level:`Zoom level`,upscaled:`Above here the basemap is enlarged, not sharper`,fit:`Zoom to the data`},un=0,dn=e=>`${(e*100).toFixed(4)}%`,fn=({name:e})=>t.React.createElement(`svg`,{className:`atlas-icon atlas-icon--${e}`,width:18,height:18,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:Gt,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,focusable:`false`},Wt[e].map(e=>t.React.createElement(`path`,{key:e,d:e})));fn.propTypes={name:t.PropTypes.oneOf(Object.keys(Wt)).isRequired};var pn=({position:e=`bottomright`,marks:n=[],labels:r,onFit:i})=>{let a={...ln,...r},[o]=cn(()=>{let e=an.DomUtil.create(`div`,`atlas-zoom__host`);return an.DomEvent.disableClickPropagation(e),an.DomEvent.disableScrollPropagation(e),e}),[s]=cn(()=>(un+=1,`atlas-zoom-marks-${un}`)),[c,l]=cn(()=>({min:J.getMinZoom(),max:J.getMaxZoom()})),[u,d]=cn(()=>J.getZoom());on(()=>{let e=()=>d(J.getZoom()),t=()=>{l({min:J.getMinZoom(),max:J.getMaxZoom()}),e()};return J.on(`zoomend`,e),J.on(`zoomlevelschange`,t),t(),()=>{J.off(`zoomend`,e),J.off(`zoomlevelschange`,t)}},[]),on(()=>{let t=rn(o,{},{position:e});return()=>{t.remove()}},[e,o]);let{min:f,max:p}=c,m=sn(()=>Yt(f,p),[f,p]),h=sn(()=>Xt(n,f,p),[n,f,p]),g=Math.round(u),_=h.filter(e=>e.label).map(e=>e.label).join(`. `);return t.ReactDOM.createPortal(t.React.createElement(`div`,{className:`atlas-zoom`},i&&t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step atlas-zoom__fit`,onClick:i,title:a.fit,"aria-label":a.fit},t.React.createElement(fn,{name:`zoom-scan`})),t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step`,onClick:()=>J.zoomIn(),disabled:g>=p,title:a.in,"aria-label":a.in},t.React.createElement(fn,{name:`plus`})),m.length>1&&t.React.createElement(`div`,{className:`atlas-zoom__rail`},t.React.createElement(`div`,{className:`atlas-zoom__track`}),h.map(e=>t.React.createElement(`span`,{key:`${e.kind??`mark`}-${e.from}-${e.to}`,className:`atlas-zoom__mark atlas-zoom__mark--${e.kind??`plain`}`,style:{bottom:dn(e.offset),height:dn(e.span)},title:e.label})),m.map(e=>t.React.createElement(`span`,{key:e.zoom,className:[`atlas-zoom__rung`,e.labelled?`atlas-zoom__rung--numbered`:``,e.zoom===g?`atlas-zoom__rung--here`:``].filter(Boolean).join(` `),style:{bottom:dn(e.offset)}},e.labelled?t.React.createElement(`i`,{className:`atlas-zoom__number`},e.zoom):null)),t.React.createElement(`input`,{type:`range`,className:`atlas-zoom__slider`,min:f,max:p,step:1,value:Math.min(Math.max(g,f),p),onChange:e=>J.setZoom(Number(e.target.value)),"aria-label":a.level,"aria-describedby":_?s:void 0}),_?t.React.createElement(`p`,{className:`atlas-zoom__described`,id:s},_):null),t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step`,onClick:()=>J.zoomOut(),disabled:g<=f,title:a.out,"aria-label":a.out},t.React.createElement(fn,{name:`minus`})),t.React.createElement(`output`,{className:`atlas-zoom__level`,title:a.level},g)),o)};pn.propTypes={position:t.PropTypes.string,marks:t.PropTypes.array,labels:t.PropTypes.object,onFit:t.PropTypes.func},nn(`/*
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
`);var{Map:Y,control:mn,factory:X}=U,{layerControl:hn}=fe,{useEffect:gn,useMemo:_n,useRef:Z,useState:vn}=t.React,yn=140,bn=!1,xn=new Set;Y.eachLayer(e=>xn.add(e));var Sn=()=>{let e=[];Y.eachLayer(t=>{xn.has(t)||e.push(t)}),e.forEach(e=>Y.removeLayer(e))},Cn=({session:e,overrides:n,layerSwitcher:r=!1,zoomControl:i=!0,zoomPosition:a=`bottomright`,zoomMarks:o,zoomLabels:s,fit:c=!0,extent:l=null,coordinates:u=!0,coordinatesPosition:d=`bottomcenter`,measure:f=!0,measurePosition:p=`topleft`,measureTools:m,fullscreen:h=!0,fullscreenPosition:g=`topleft`,locate:_=!0,locatePosition:v=`topleft`,scale:y=!0,scalePosition:b=`bottomleft`,scaleRatio:x=!0,className:S=`atlas-map`,style:C,onReady:w,onError:T,children:E})=>{let D=Z(null),O=Z(null),k=Z(null),A=Z(null),j=Z(null),M=Z(null),N=Z(null),P=Z(null),F=Z(null),I=Z(null),L=Z(null),R=Z(null),ee=Z(null),z=Z(l);z.current=l;let[B,te]=vn(!1),[V,ne]=vn(null),[re,ie]=vn(null);gn(()=>{let t=!1;if(bn){let e=Error(`perun-atlas: a map is already mounted. spatial provides one instance per page until 2.0 introduces createMap; render at most one AtlasMap at a time.`);ne(e),T?.(e);return}return bn=!0,(async()=>{try{let o=await le(n);if(t)return;Fe(o);let l=Y.getContainer();if(I.current={height:l.style.height,width:l.style.width},l.style.height=`100%`,l.style.width=`100%`,D.current?.appendChild(l),Sn(),Y.setMinZoom(o.minZoom).setMaxZoom(o.maxZoom),Y.setView(o.center,o.zoom),h&&X.control.fullscreen&&(M.current=X.control.fullscreen({position:g,content:Kt(`maximize`)+Kt(`minimize`)}).addTo(Y)),_&&W.LocateControl?N.current=mn(W.LocateControl,{},{position:v}):_&&console.warn(`perun-atlas: the engine on this environment has no locate control; skipping it.`),F.current=X.control.attribution({prefix:!1}).addTo(Y),o.attribution&&F.current.addAttribution(o.attribution),i&&i!==`rail`&&(k.current=X.control.zoom({position:a,zoomInText:Kt(`plus`),zoomOutText:Kt(`minus`)}).addTo(Y),c)){let e=s?.fit??ln.fit,t=k.current.getContainer(),n=X.DomUtil.create(`a`,`atlas-fit`);n.href=`#`,n.title=e,n.setAttribute(`role`,`button`),n.setAttribute(`aria-label`,e),n.innerHTML=Kt(`zoom-scan`),n.style.display=z.current?``:`none`,X.DomEvent.disableClickPropagation(n),X.DomEvent.on(n,`click`,X.DomEvent.stop),X.DomEvent.on(n,`click`,()=>{z.current&&Y.fitBounds(z.current,{padding:tn})}),t.insertBefore(n,t.firstChild),ee.current=n}if(y){let e=o.units!==`imperial`;P.current=X.control.scale({position:b,metric:e,imperial:!e,maxWidth:yn}).addTo(Y)}if(y&&x&&P.current){let e=X.DomUtil.create(`div`,`atlas-scale-ratio`,P.current.getContainer()),t=()=>{let t=Y.getSize(),n=Math.round(t.y/2),r=Math.min(t.x,yn),i=Y.distance(Y.containerPointToLatLng(X.point(0,n)),Y.containerPointToLatLng(X.point(r,n)));e.textContent=en(Qt(i,r))??``};Y.on(`move zoomend`,t),t(),L.current=()=>Y.off(`move zoomend`,t)}if(u&&W.CoordinatesControl){let e=Y._controlCorners?.[d]?d:`bottomleft`;A.current=mn(W.CoordinatesControl,{},{position:e})}else u&&console.warn(`perun-atlas: the engine on this environment has no coordinate readout; skipping it.`);f&&W.MeasureControl?j.current=mn(W.MeasureControl,m?{tools:m}:{},{position:p}):f&&console.warn(`perun-atlas: the engine on this environment has no measurement control; skipping it.`);let{basemap:S,overlays:C}=await Qe(e,{maxZoom:o.maxZoom});if(t)return;let T=$e(S);T&&T.addTo(Y);let E=e=>ie(e?.options?.maxNativeZoom??null);E(T);let B=e=>E(e.layer);Y.on(`baselayerchange`,B),R.current=()=>Y.off(`baselayerchange`,B),r&&(O.current=hn(S,C,{collapsed:!0}).addTo(Y)),Y.invalidateSize(),w?.({map:Y,config:o,basemap:S,overlays:C}),te(!0)}catch(e){if(t)return;console.error(e),ne(e),T?.(e)}})(),()=>{t=!0,bn=!1,M.current?._toggleState&&Y.off(`enterFullscreen exitFullscreen`,M.current._toggleState,M.current),[O,k,A,j,M,N,P,F].forEach(e=>{e.current&&(e.current.remove(),e.current=null)}),L.current?.(),L.current=null,R.current?.(),R.current=null,ee.current=null,Sn();let e=Y.getContainer();e&&I.current&&(e.style.height=I.current.height,e.style.width=I.current.width,I.current=null),e?.parentNode&&e.parentNode.removeChild(e)}},[]),gn(()=>{ee.current&&(ee.current.style.display=l?``:`none`)},[l]),gn(()=>{let e=D.current;if(!e||typeof ResizeObserver>`u`)return;let t=null,n=new ResizeObserver(e=>{let n=e[0]?.contentRect;n&&n.width!==0&&n.height!==0&&(t!==null&&cancelAnimationFrame(t),t=requestAnimationFrame(()=>{t=null,Y.invalidateSize()}))});return n.observe(e),()=>{t!==null&&cancelAnimationFrame(t),n.disconnect()}},[B]);let ae=_n(()=>[...re===null?[]:[{from:re,to:1/0,kind:`upscaled`,label:s?.upscaled??ln.upscaled}],...o??[]],[re,o,s]);return V?t.React.createElement(`div`,{className:`${S} atlas-map-error`,role:`alert`},V.message):t.React.createElement(t.React.Fragment,null,t.React.createElement(`div`,{ref:D,className:S,style:{height:`100%`,...C}}),B&&i===`rail`&&t.React.createElement(pn,{position:a,marks:ae,labels:s,onFit:c&&l?()=>Y.fitBounds(l,{padding:tn}):void 0}),B&&E)},wn=(e,t)=>{e&&t&&Object.entries(t).forEach(([t,n])=>{t.startsWith(`--`)?e.style.setProperty(t,n):e.style[t]=n})},Tn=e=>e instanceof Node?e:document.createTextNode(String(e)),En=(e,t,n)=>{let r=n.startsWith(`text/csv`)?`﻿`:``,i=URL.createObjectURL(new Blob([r,t],{type:n})),a=document.createElement(`a`);a.href=i,a.download=e,a.style.display=`none`,document.body.appendChild(a),a.click(),a.remove(),setTimeout(()=>URL.revokeObjectURL(i),0)},Dn=(e,t=[])=>{let n=new Set(t),r=[],i=[];return e.forEach(e=>{let t=n.has(e.key);t!==!!e.hidden&&(e.hidden=t,(t?r:i).push(e))}),{leaving:r,returning:i}},On=(e,t)=>{let n=e.filter(({hidden:e})=>!e);n.forEach(({layer:e})=>e.bringToFront?.()),n.forEach(({layer:e})=>t?.get(e)?.bringToFront?.())},kn=(e,t=[],n)=>{let r=e?.features;if(!Array.isArray(r)||!t.length)return e;let i=new Set(t),a=r.filter(e=>!i.has(n(e)));return a.length===r.length?e:{...e,features:a}},An=({title:e,rows:t},n={})=>{let r=document.createElement(`div`);if(r.className=[`atlas-popup`,n.className].filter(Boolean).join(` `),wn(r,n.style),e){let t=document.createElement(`p`);t.className=`atlas-popup-title`,t.textContent=e,wn(t,n.titleStyle),r.appendChild(t)}if(t.length){let e=document.createElement(`dl`);e.className=`atlas-popup-fields`,t.forEach(({label:t,value:r})=>{let i=document.createElement(`dt`);i.textContent=t,wn(i,n.labelStyle);let a=document.createElement(`dd`);a.textContent=r,wn(a,n.valueStyle),e.append(i,a)}),r.appendChild(e)}return r},jn={className:`atlas-popup-shell`,maxWidth:280},{Map:Mn,factory:Nn}=U,{useEffect:Pn,useRef:Fn}=t.React,In=[],Ln=({servicePath:e,context:t,reload:n,srid:r,statusRows:i,join:a,field:o,palette:s,fallback:c,descriptor:u,hidden:d=In,onFeatureClick:f,onLegend:p,onShown:m,onLoadStart:_,onLoad:v,onError:y,tooltip:b,popup:x,labelResolver:S})=>{let C=Fn(null),w=Fn(0),T=Fn(d);T.current=d;let E=Fn(null),D=JSON.stringify(d);return Pn(()=>{let n=!1,d=N({field:o,palette:s,fallback:c}),D=F({field:o,palette:s}),O=async()=>{let c=++w.current;A={zoom:Mn.getZoom(),bounds:Mn.getBounds()};try{_?.();let y=await Be(e,{...t||{},map:{...t?.map||{},bbox:Se(r)}});if(n||c!==w.current)return;let O=a&&i?I(y,i,a):y;C.current&&Mn.removeLayer(C.current);let k=[],A=Nn.geoJSON(O,{style:e=>l(u,{fillColor:d(e)}),onEachFeature:(e,t)=>{k.push({layer:t,feature:e,key:D(e),hidden:!1});let n=b?.(e);n&&t.bindTooltip(Tn(n),{sticky:!0});let r=x?.(e),i=x?null:h(u,e,S),a=r==null?i?An(i,u?.popup):null:Tn(r);a&&t.bindPopup(a,jn),f&&t.on(`click`,()=>f(e,g(u,e,S)))}}),j=e=>{let{leaving:t,returning:n}=Dn(k,e);return t.forEach(({layer:e})=>A.removeLayer(e)),n.forEach(({layer:e})=>A.addLayer(e)),n.length&&On(k),t.length>0||n.length>0};j(T.current),C.current=A.addTo(Mn);let M=e=>m?.(kn(O,e,D));E.current=e=>{j(e)&&M(e)},p?.(P(O?.features,{field:o,palette:s})),M(T.current),v?.(O)}catch(e){console.error(`perun-atlas: choropleth failed to render`,e),!n&&c===w.current&&y?.(e)}},k=null,A=null,j=()=>!!A&&Mn.getZoom()===A.zoom&&A.bounds.contains(Mn.getBounds()),M=()=>{clearTimeout(k),k=setTimeout(()=>{j()||O()},250)};return O(),Mn.on(`moveend`,M),()=>{n=!0,E.current=null,clearTimeout(k),Mn.off(`moveend`,M),C.current&&(Mn.removeLayer(C.current),C.current=null)}},[e,o,r,n,i,JSON.stringify(t??{})]),Pn(()=>{E.current?.(d)},[D]),null};nn(`/*
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
`);var{Map:Rn,factory:zn}=U,{useEffect:Bn,useRef:Vn}=t.React,Hn=(...e)=>e.forEach(e=>{e.current&&(Rn.removeLayer(e.current),e.current=null)}),Un={color:`#b3261e`,weight:2,opacity:.95,fillColor:`#b3261e`,fillOpacity:.12},Wn={...Un,dashArray:`5 4`,fillOpacity:.06},Gn=({value:e,drawing:t=!1,onChange:n,onDrawn:r,style:i,editable:a=!0})=>{let o=Vn(null),s=Vn(null),c=Vn(null),l=Vn(n);l.current=n;let u=Vn(r);return u.current=r,Bn(()=>{let e=pe?.draw?.circle;if(!t||!e){!t&&e?.isEnabled?.()&&e.disable(),t&&!e&&console.warn(`perun-atlas: the engine on this environment has no circle draw tool; skipping it.`);return}let n=({shape:e,layer:t})=>{if(e!==`circle`||!t)return;let n=t.getLatLng(),r=t.getRadius();Rn.removeLayer(t);let i={lat:n.lat,lng:n.lng,radius:r};l.current?.(i),u.current?.(i)};return Rn.on(`new_shape`,n),e.enable({templineStyle:Wn,hintlineStyle:{...Wn,fillOpacity:0},pathOptions:{...Un,...i},cursorMarker:!0,tooltips:!1}),()=>{Rn.off(`new_shape`,n),e.isEnabled?.()&&e.disable()}},[t]),Bn(()=>{if(!e||!(e.radius>0)){Hn(o,s,c);return}let t=zn.latLng({lat:e.lat,lng:e.lng});if(o.current?(o.current.setLatLng(t),o.current.setRadius(e.radius)):o.current=zn.circle(t,{...Un,...i,radius:e.radius,showMeasurements:!0,interactive:!1}).addTo(Rn),!a){Hn(s,c);return}let n=zn.latLng({lat:t.lat,lng:o.current.getBounds().getEast()});s.current?s.current.setLatLng(t):(s.current=zn.marker(t,{icon:zn.divIcon({className:`atlas-draw-handle atlas-draw-handle--centre`,html:``}),draggable:!0,zIndexOffset:1e3}).addTo(Rn),s.current.on(`drag`,e=>{let t=e.target.getLatLng();l.current?.({lat:t.lat,lng:t.lng,radius:o.current?.getRadius()})})),c.current?c.current.setLatLng(n):(c.current=zn.marker(n,{icon:zn.divIcon({className:`atlas-draw-handle atlas-draw-handle--edge`,html:``}),draggable:!0,zIndexOffset:1e3}).addTo(Rn),c.current.on(`drag`,e=>{let n=e.target.getLatLng(),r=s.current?.getLatLng()??t;l.current?.({lat:r.lat,lng:r.lng,radius:Rn.distance(r,n)})}))},[e?.lat,e?.lng,e?.radius,a]),Bn(()=>()=>Hn(o,s,c),[]),null};nn(`/*
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
`);var{useMemo:Kn}=t.React,qn=({from:e,to:n,onChange:r,labels:i={},disabled:a=!1,className:o=`atlas-date-range`})=>{let s=Kn(()=>({type:`object`,properties:{from:{type:`string`,format:`date`,title:i.from??`From`},to:{type:`string`,format:`date`,title:i.to??`To`}}}),[i.from,i.to]),c=Kn(()=>({"ui:order":[`from`,`to`],"ui:submitButtonOptions":{norender:!0},from:{"ui:disabled":a},to:{"ui:disabled":a}}),[a]);return t.React.createElement(`div`,{className:o},t.React.createElement(t.Form,{idPrefix:`atlas-range`,schema:s,uiSchema:c,formData:{from:e,to:n},validator:t.validator,customValidate:(e,t)=>(e?.from&&e?.to&&e.from>e.to&&t.to.addError(i.invalidRange??`The end date is before the start date.`),t),liveValidate:!0,showErrorList:!1,noHtml5Validate:!0,onChange:({formData:e})=>r?.(e)},t.React.createElement(t.React.Fragment,null)))},{Icon:Jn}=t.elements,{useState:Yn}=t.React,Xn=({drawing:e,busy:n,onStart:r,onCancel:i,labels:a={}})=>t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn ${e?`atlas-panel__btn--primary`:`atlas-panel__btn--ghost`}`,"aria-pressed":e,onClick:e?i:r,disabled:n},t.React.createElement(Jn,{name:`IconCircleDashed`,size:16,stroke:1.75,"aria-hidden":`true`}),a.draw??`Draw an area`),Zn=e=>`atlas-panel__drawbox${e?` atlas-panel__drawbox--off`:``}`,Qn=0,$n=()=>`atlas-draw-${Qn+=1}`,er=({shape:e,drawing:n,busy:r,onCancel:i,onRadius:a,onSave:o,note:s,form:c,caught:l,savable:u=!0,limits:d={},labels:f={}})=>{let{min:p=50,max:m=5e5,step:h=50}=d,g=!!e,[_]=Yn($n),v=`${_}-form`,y=!!c?.schema,b=r||!g||s?.required&&!String(s.value??``).trim()||!(!c||c.schema),x=()=>{!b&&u&&o?.()};return t.React.createElement(`div`,{className:`atlas-panel__draw`,role:`group`,"aria-label":f.draw??`Draw`},n&&!g&&t.React.createElement(`p`,{className:`atlas-panel__drawhint`},f.drawing??`Click a centre, then an edge`),g&&t.React.createElement(`label`,{className:`atlas-panel__drawfield`},t.React.createElement(`span`,null,f.radius??`Radius`),t.React.createElement(`span`,{className:Zn(r)},t.React.createElement(`input`,{type:`number`,inputMode:`numeric`,value:Math.round(e.radius),min:p,max:m,step:h,disabled:r,onChange:e=>{let t=Number(e.target.value);Number.isFinite(t)&&t>0&&a(t)}}),t.React.createElement(`span`,{className:`atlas-panel__drawunit`},f.metres??`m`))),g&&c&&!c.schema&&t.React.createElement(`p`,{className:`atlas-panel__drawhint`},c.loading?f.formLoading??`Loading the fields…`:f.formFailed??`These fields did not load, so there is nothing to save into.`),g&&c?.schema&&t.React.createElement(`div`,{className:`atlas-panel__drawform`},t.React.createElement(t.Form,{id:v,idPrefix:_,schema:c.schema,uiSchema:{"ui:submitButtonOptions":{norender:!0},...c.uiSchema},formData:c.data,validator:t.validator,disabled:r,liveValidate:!1,showErrorList:!1,onChange:({formData:e})=>c.onChange?.(e),onSubmit:x},t.React.createElement(t.React.Fragment,null))),g&&s&&t.React.createElement(`label`,{className:`atlas-panel__drawfield atlas-panel__drawfield--wide`},t.React.createElement(`span`,null,f.note??`Note`),t.React.createElement(`span`,{className:Zn(r)},t.React.createElement(`input`,{type:`text`,value:s.value??``,disabled:r,placeholder:f.notePlaceholder??``,onChange:e=>s.onChange(e.target.value)}))),g&&l&&t.React.createElement(`p`,{className:`atlas-panel__drawcount`,"aria-live":`polite`},t.React.createElement(`b`,null,l.count),t.React.createElement(`span`,null,f.caught??`inside`),t.React.createElement(`span`,{className:`atlas-panel__drawtotal`},`/ ${l.total}`)),g&&t.React.createElement(`div`,{className:`atlas-panel__drawactions`},u&&t.React.createElement(`button`,{type:y?`submit`:`button`,form:y?v:void 0,className:`atlas-panel__btn atlas-panel__btn--primary`,onClick:y?void 0:x,disabled:b},t.React.createElement(Jn,{name:`IconDeviceFloppy`,size:16,stroke:1.75,"aria-hidden":`true`}),f.save??`Save`),t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:i,disabled:r},f.discard??`Discard`)))},tr=280,nr={chunkedLoading:!0,showCoverageOnHover:!1,spiderfyDistanceMultiplier:2},rr=[{upTo:9,name:`sm`,size:32},{upTo:99,name:`md`,size:38},{upTo:1/0,name:`lg`,size:46}],ir=e=>{if(!e)return null;if(e===!0)return{from:0,options:{...nr},badge:{},glide:tr};if(typeof e==`number`)return{from:e,options:{...nr},badge:{},glide:tr};let{from:t=0,className:n,style:r,glide:i=tr,...a}=e;return{from:t,options:{...nr,...a},badge:{className:n,style:r},glide:i===!0?tr:i}},ar=(e,t={})=>{let n=rr.find(({upTo:t})=>e<=t)??rr[rr.length-1],r=document.createElement(`span`);return r.className=`atlas-cluster__count`,r.textContent=String(e),wn(r,t.style),{element:r,size:n.size,className:[`atlas-cluster`,`atlas-cluster--${n.name}`,t.className].filter(Boolean).join(` `)}},or=({lat:e,lng:t})=>`${e.toFixed(6)},${t.toFixed(6)}`,sr=(e,t,n)=>{let r=e.original.map(e=>{let r=t[or(e)];if(!r)return e;let i=n(r);return i&&i!==r?i.getLatLng():e}),i=r.map(or).join(` `);return i===e.key?null:{next:r,key:i}},cr=e=>e<.5?4*e*e*e:1-(-2*e+2)**3/2,lr=(e,t,n)=>t.map((t,r)=>{let i=e[r];return i?{lat:i.lat+(t.lat-i.lat)*n,lng:i.lng+(t.lng-i.lng)*n}:t}),ur=e=>Array.isArray(e?.[0])?e.map(ur).reverse():[...e??[]].reverse(),dr=({map:e,surface:t,lines:n,markerAt:r,decoratorOf:i,glide:a})=>{let o=e=>t.getVisibleParent?.(e),s=(e,t)=>{e.layer.setLatLngs(t);let n=i?.get(e.layer);n&&n.setPaths(e.reverse?ur(t):e.layer)},c=typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,l=null,u=[],d=()=>{l!==null&&cancelAnimationFrame(l),l=null,u=[]},f=e=>{d(),u=e;let t=e.map(({line:e})=>e.layer.getLatLngs()),n=performance.now(),r=i=>{let o=Math.min(1,(i-n)/a),c=cr(o);e.forEach((e,n)=>s(e.line,lr(t[n],e.next,c))),o<1?l=requestAnimationFrame(r):(l=null,u=[],e.forEach(e=>s(e.line,e.next)))};l=requestAnimationFrame(r)},p=()=>{let e=[];if(n.forEach(t=>{let n=sr(t,r,o);n&&(t.key=n.key,e.push({line:t,next:n.next}))}),!e.length)return;let t=new Set(e.map(({line:e})=>e)),i=[...u.filter(({line:e})=>!t.has(e)),...e];!a||c||i.length>150?(d(),i.forEach(e=>s(e.line,e.next))):f(i)};p(),t.on(`animationend`,p),e.on(`moveend`,p);let m=()=>{d(),t.off(`animationend`,p),e.off(`moveend`,p)};return m.reroute=p,m};nn(`/*
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
`);var{Map:Q,factory:$}=U,{useEffect:fr,useRef:pr}=t.React,mr=[],hr=({servicePath:e,context:t,reload:n,descriptors:r={},descriptorFor:i,cluster:a,fit:o=!0,tooltip:s,popup:c,labelResolver:u,pinned:m,hidden:_=mr,onFeatureClick:v,onLegend:y,onShown:b,onExtent:x,onLoadStart:S,onLoad:C,onError:w})=>{let E=pr([]),D=pr([]),O=pr(_);O.current=_;let k=pr(null),A=JSON.stringify(t??{}),j=JSON.stringify(_);return fr(()=>{let n=!1,_=e=>i?.(e)??Ve(e),A=new WeakMap,j=e=>{if(A.has(e))return A.get(e);let t=d(r[_(e)],e);return A.set(e,t),t},M=(e,t)=>{if(c){let t=c(e);return t==null?null:Tn(t)}let n=h(t,e,u);return n?An(n,t?.popup):null},N=()=>{let e=Q.getZoom();D.current.forEach(({layer:t,descriptor:n})=>{if(t._atlasHidden)return;let r=f(n,e);r!==t.isTooltipOpen()&&(r?t.openTooltip():t.closeTooltip())})},P=()=>{D.current=[],E.current.forEach(e=>Q.removeLayer(e)),E.current=[]},F=Object.create(null),I=[],L=new WeakMap,R=[],ee=e=>!!m?.(e),z=Object.create(null),B=e=>{let t=_(e);return T(t,r[t],e)},te=e=>{let{name:t,value:n,key:r}=B(e);return r in z||(z[r]={name:t,value:n,descriptor:j(e),geometry:e?.geometry?.type}),r},V=[];return(async()=>{try{S?.();let r=await Be(e,t);if(n)return;P();let i=0,d=$.geoJSON(r,{pointToLayer:(e,t)=>{i+=1;let{marker:n={}}=j(e)??{},r=n.size??24,a=$.marker(t,{icon:$.divIcon({className:n.className??`atlas-marker`,iconSize:[r,r]})});return n.style&&a.on(`add`,()=>wn(a.getElement(),n.style)),F[or(t)]=a,a._atlasPinned=ee(e),a},style:e=>l(j(e)),onEachFeature:(e,t)=>{let n=j(e)??{};V.push({layer:t,feature:e,key:te(e),hidden:!1});let r=s?s(e):p(n,e);if(r){let i=/Point$/.test(e.geometry?.type??``),a=(n.marker?.size??24)/2;t.bindTooltip(Tn(r),{permanent:!0,direction:n.label?.direction??(i?`top`:`center`),offset:n.label?.offset??(i?[0,-a]:[0,0]),className:[`atlas-label`,n.label?.className].filter(Boolean).join(` `),opacity:1}),n.label?.style&&t.on(`tooltipopen`,e=>wn(e.tooltip.getElement(),n.label.style)),n.label?.scale&&D.current.push({layer:t,descriptor:n})}if(typeof t.getLatLngs==`function`){let e=t.getLatLngs();Array.isArray(e)&&e.length>=2&&!Array.isArray(e[0])&&I.push({layer:t,original:e.map(({lat:e,lng:t})=>$.latLng(e,t)),reverse:!!n.arrow?.reverse,key:null})}let i=n.details&&!c?null:M(e,n);i&&t.bindPopup(i,jn),v&&t.on(`click`,()=>v(e,g(n,e,u)))}}),f=$.featureGroup().addTo(Q),m=ir(a),h=typeof $.markerClusterGroup==`function`;m!==null&&!h&&console.warn(`perun-atlas: clustering was configured, but the map engine on this deployment does not carry it`);let _=m!==null&&h&&i>=m.from,w=_?$.markerClusterGroup({...m.options,iconCreateFunction:e=>{let{element:t,size:n,className:r}=ar(e.getChildCount(),m.badge);return $.divIcon({html:t,className:r,iconSize:[n,n]})}}):d;if(w.addTo(Q),_){let e=[];d.eachLayer(t=>{t._atlasPinned?e.push(t):w.addLayer(t)}),e.forEach(e=>f.addLayer(e))}let T=_?$.featureGroup().addTo(Q):w;E.current=T===w?[w,f]:[w,T,f],d.eachLayer(e=>{let t=j(e.feature)?.arrow;if(!t||typeof e.getLatLngs!=`function`)return;let n=t.reverse?ur(e.getLatLngs()):e;L.set(e,$.polylineDecorator(n,{patterns:[{offset:t.offset??`12%`,repeat:t.repeat??160,symbol:$.Symbol.arrowHead({pixelSize:t.pixelSize??12,polygon:!1,pathOptions:{stroke:!0,weight:2,color:e.options.color,opacity:1}})}]}).addTo(T))});let A=e=>_&&e._atlasPinned?f:w,ne=e=>{let{leaving:t,returning:n}=Dn(V,e),r=(e,t)=>{let n=[];e.forEach(({layer:e})=>{e._atlasHidden=!t;let r=A(e);_&&r===w?n.push(e):t?r.addLayer(e):r.removeLayer(e);let i=L.get(e);i&&t?T.addLayer(i):i&&T.removeLayer(i)}),n.length&&(t?w.addLayers(n):w.removeLayers(n))};return r(t,!1),r(n,!0),n.length&&On(V,L),t.length>0||n.length>0},re=()=>{let e=V.filter(e=>!e.hidden),t=$.latLngBounds([]);if((e.length?e:V).forEach(({layer:e})=>{typeof e.getBounds==`function`?t.extend(e.getBounds()):typeof e.getLatLng==`function`&&t.extend(e.getLatLng())}),!t.isValid())return null;let n=t.getSouthWest(),r=t.getNorthEast();return[[n.lat,n.lng],[r.lat,r.lng]]},ie=e=>{b?.(kn(r,e,e=>B(e).key)),x?.(re())};ne(O.current);let ae=null;_&&I.length&&(ae=dr({map:Q,surface:w,lines:I,markerAt:F,decoratorOf:L,glide:m.glide}),R.push(ae)),y?.(Object.values(z)),N(),Q.on(`zoomend`,N),_&&Q.on(`moveend`,N);let oe=re();o&&oe&&Q.fitBounds(oe,{padding:tn}),k.current=e=>{ne(e)&&(ae?.reroute(),N(),ie(e))},ie(O.current),C?.(r)}catch(e){if(n)return;console.error(`perun-atlas: feature set failed to render`,e),w?.(e)}})(),()=>{n=!0,k.current=null,R.forEach(e=>e()),Q.off(`zoomend`,N),Q.off(`moveend`,N),P()}},[e,A,n]),fr(()=>{k.current?.(_)},[j]),null};nn(`/*
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
`);var{useEffect:gr,useRef:_r,useState:vr}=t.React,yr=({marker:e})=>{let n=_r(null);return gr(()=>{let t=n.current;t&&(wn(t,e?.style),t.style.width=`12px`,t.style.height=`12px`)},[e]),t.React.createElement(`span`,{ref:n,className:[`atlas-legend__point`,e?.className].filter(Boolean).join(` `),"aria-hidden":`true`})};yr.propTypes={marker:t.PropTypes.object};var br=({path:e,arrow:n})=>{let r=e?.color??`#4A5C66`,i=Array.isArray(e?.dashArray)?e.dashArray.join(` `):e?.dashArray,a=n?.reverse?`3,6 9,3 9,9`:`21,6 15,3 15,9`;return t.React.createElement(`svg`,{className:`atlas-legend__swatch`,width:`24`,height:`12`,viewBox:`0 0 24 12`,"aria-hidden":`true`},t.React.createElement(`line`,{x1:`2`,y1:`6`,x2:`22`,y2:`6`,stroke:r,strokeWidth:Math.min(e?.weight??1,4),strokeDasharray:i||void 0,strokeOpacity:e?.opacity??1,strokeLinecap:`round`}),n&&t.React.createElement(`polygon`,{points:a,fill:r,fillOpacity:e?.opacity??1}))};br.propTypes={path:t.PropTypes.object,arrow:t.PropTypes.object};var xr=({path:e})=>t.React.createElement(`svg`,{className:`atlas-legend__swatch`,width:`24`,height:`12`,viewBox:`0 0 24 12`,"aria-hidden":`true`},t.React.createElement(`rect`,{x:`4`,y:`1`,width:`16`,height:`10`,fill:e?.fillColor??`#B8C6CC`,fillOpacity:e?.fillOpacity??.55,stroke:e?.color??`#4A5C66`,strokeWidth:Math.min(e?.weight??1,2),strokeOpacity:e?.opacity??1}));xr.propTypes={path:t.PropTypes.object};var Sr=({entry:e})=>e.kind===`point`?t.React.createElement(yr,{marker:e.marker}):e.kind===`line`?t.React.createElement(br,{path:e.path,arrow:e.arrow}):t.React.createElement(xr,{path:e.path});Sr.propTypes={entry:t.PropTypes.object.isRequired};var Cr=({entries:e=[],title:n,open:r=!0,hidden:i=[],onToggle:a,onShowAll:o,showAllLabel:s,className:c=``})=>{let[l,u]=vr(r);if(!S(e,i))return null;let d=n??`Legend`,f=e.some(e=>i.includes(e.key));return t.React.createElement(`div`,{className:`atlas-legend ${c}`.trim()},t.React.createElement(`button`,{type:`button`,className:`atlas-legend__toggle`,onClick:()=>u(!l),"aria-expanded":l},t.React.createElement(`span`,{className:`atlas-legend__title`},d),t.React.createElement(`span`,{className:`atlas-legend__chevron`,"aria-hidden":`true`},l?`−`:`+`)),l&&t.React.createElement(`ul`,{className:`atlas-legend__list`},e.map(e=>{let n=t.React.createElement(t.React.Fragment,null,t.React.createElement(Sr,{entry:e}),t.React.createElement(`span`,{className:`atlas-legend__label`},e.label));return t.React.createElement(`li`,{className:`atlas-legend__row`,key:e.key},a?t.React.createElement(`button`,{type:`button`,className:`atlas-legend__item`,"aria-pressed":!i.includes(e.key),onClick:()=>a(e.key)},n):n)})),l&&o&&f&&t.React.createElement(`button`,{type:`button`,className:`atlas-legend__reset`,onClick:o},s??`Show all`))};Cr.propTypes={entries:t.PropTypes.array,title:t.PropTypes.string,open:t.PropTypes.bool,hidden:t.PropTypes.array,onToggle:t.PropTypes.func,onShowAll:t.PropTypes.func,showAllLabel:t.PropTypes.string,className:t.PropTypes.string};var{control:wr,factory:Tr}=U,{useEffect:Er,useState:Dr}=t.React,Or=({entries:e=[],title:n,open:r,hidden:i=[],onToggle:a,onShowAll:o,showAllLabel:s,position:c=`bottomleft`})=>{let[l]=Dr(()=>{let e=Tr.DomUtil.create(`div`,`atlas-legend__host`);return Tr.DomEvent.disableClickPropagation(e),Tr.DomEvent.disableScrollPropagation(e),e}),u=S(e,i);return Er(()=>{if(!u)return;let e=wr(l,{},{position:c});return()=>{e.remove()}},[u,c,l]),t.ReactDOM.createPortal(t.React.createElement(Cr,{entries:e,title:n,open:r,hidden:i,onToggle:a,onShowAll:o,showAllLabel:s}),l)};Or.propTypes={entries:t.PropTypes.array,title:t.PropTypes.string,open:t.PropTypes.bool,hidden:t.PropTypes.array,onToggle:t.PropTypes.func,onShowAll:t.PropTypes.func,showAllLabel:t.PropTypes.string,position:t.PropTypes.string};var{useEffect:kr,useMemo:Ar,useState:jr}=t.React,Mr=({choropleth:e,bindings:t,bindingKey:n})=>{let r=!!e,[i,a]=jr(null),o=r?e.status:null;return kr(()=>{if(!o)return;let e=!1;return et(o,t).then(t=>{e||a(t)}),()=>{e=!0}},[o,n]),{coloured:r,statusPath:o,rows:i,tooltip:Ar(()=>{let t=e?.tooltip;if(!t)return;let n=y(t);return e=>n(e?.properties)??null},[e])}},Nr=e=>e.toISOString().slice(0,10),Pr=()=>Nr(new Date),Fr=e=>{let t=new Date;return t.setMonth(t.getMonth()-e),Nr(t)},Ir=e=>({from:Fr(e),to:Pr()}),Lr=(e,t)=>e?.from===t?.from&&e?.to===t?.to,{useState:Rr}=t.React,zr=({presets:e=[],defaultMonths:t,servicePath:n,onMoved:r})=>{let i=t??e[e.length-1]?.months??12,[a,o]=Rr(i),[s,c]=Rr(()=>Ir(i)),l=/\{(from|to)\}/.test(n??``),u=(e,t)=>{o(t),!Lr(e,s)&&(c(e),r?.())};return{timeScoped:l,preset:a,range:s,applyPreset:e=>u(Ir(e),e),onRangeChange:e=>u(e,null),longest:e[e.length-1],initial:i}},{useEffect:Br,useMemo:Vr,useState:Hr}=t.React,Ur=(e,t)=>e?b(e,t??{}):null,Wr=e=>({path:typeof e==`string`?e:null,inline:e&&typeof e==`object`?e:null}),Gr=({form:e,bindings:t})=>{let{path:n,inline:r}=Wr(e?.schema),i=Wr(e?.uiSchema),a=Ur(n,t),o=Ur(i.path,t),[s,c]=Hr(null),[l,u]=Hr(null),[d,f]=Hr(!!(n||i.path)),[p,m]=Hr(!1);Br(()=>{if(!n&&!i.path){c(null),u(null),f(!1);let t=!!e&&!r;t&&console.error("perun-atlas: draw.form needs `schema` -- either the schema itself, or the path to a service that answers with one. Got",e?.schema),m(t);return}let a=!1;return f(!0),m(!1),Promise.all([n?rt(n,t):Promise.resolve(null),i.path?it(i.path,t):Promise.resolve(null)]).then(([e,t])=>{a||(c(e),u(t),m(!!n&&!e),f(!1))}),()=>{a=!0}},[n,a,i.path,o,!!e,!!r]);let h=Vr(()=>at(n?s:r,e?.pick),[s,r,n,e?.pick?.join(`\0`)??null]);return{schema:h,uiSchema:Vr(()=>dt(i.path?l:i.inline,h)??void 0,[l,i.inline,i.path,h]),loading:d,failed:p}},{useMemo:Kr}=t.React,qr={id:`{pkid}`,join:`,`},Jr=({set:e,shape:t,dataSrid:n,select:r})=>{let i=r===!0?qr:r?{...qr,...r}:null,{mode:a,id:o,join:s}=i??{},c=!!i&&i.export!==!1;return Kr(()=>{if(!i)return{selecting:!1,feedsExport:!1,count:0,total:0,inside:[],radius:null,has:()=>!1,metres:()=>null,context:null};let r=ht(e,t,{srid:n,mode:a});return{selecting:!0,feedsExport:c,count:r.inside.length,total:r.total,inside:r.inside,radius:t?.radius??null,has:r.has,metres:r.metres,context:{count:r.inside.length,total:r.total,ids:gt(r.inside,{id:o,join:s}),geojson:{type:`FeatureCollection`,features:r.inside}}}},[e,t,n,a,o,s,c,!!i])},{useMemo:Yr,useState:Xr}=t.React,{alertUserResponse:Zr}=t.elements,Qr=(e,t)=>e?.type?void 0:t?`success`:`error`,$r=({draw:e,dataSrid:n,set:r,bindings:i,labels:a={}})=>{let o=!!(e?.save?.onSave||e?.select),[s,c]=Xr(!1),[l,u]=Xr(null),[d,f]=Xr(``),[p,m]=Xr(!1),[h,g]=Xr(0),[_,v]=Xr(()=>e?.form?.data??{}),y=Gr({form:e?.form,bindings:i}),x=Yr(()=>y.schema?t.validator.validateFormData(ot(_,y.schema),y.schema)?.errors??[]:[],[_,y.schema]),S=Jr({set:r,shape:l,dataSrid:n,select:e?.select}),C=()=>{c(!1),u(null),f(``),v(e?.form?.data??{})};return{drawable:o,drawing:s,shape:l,selection:S,note:d,form:e?.form?{schema:y.schema,uiSchema:y.uiSchema,data:_,errors:x,onChange:v,loading:y.loading,failed:y.failed}:void 0,saving:p,reload:h,setShape:u,setNote:f,startDrawing:()=>c(!0),finishDrawing:()=>c(!1),clearDrawing:C,saveShape:async()=>{if(!l||p)return;if(e.form&&!y.schema){console.error(`perun-atlas: nothing sent -- this row configures a form and its fields are not loaded.`);return}if(x.length){Zr({type:`error`,response:a.saveIncomplete??`Some of these fields are mandatory and are empty. Nothing was sent.`}),console.error(`perun-atlas: nothing sent -- the form is not answerable as it stands:`,x.map(e=>`${e.property??``} ${e.message??``}`.trim()).join(`; `));return}m(!0);let t={lat:l.lat,lng:l.lng},{x:r,y:o}=Ce(t,n),s=Te(t,n),c=Math.round(l.radius*s),u=ke(t,l.radius,n,e.points),f=u.map(t=>b(e.ring?.point??`{x} {y}`,t)).join(e.ring?.join??`, `),h={type:`Polygon`,coordinates:[[...u,u[0]].map(e=>[e.x,e.y])]};if([e.save.onSave,JSON.stringify(e.save.body??null)].some(e=>String(e).includes(`{draw.radius}`))&&!(c>=1)){m(!1),Zr({type:`error`,response:a.saveTooSmall??`This deployment stores geometry in EPSG:${n??`?`}, where ${Math.round(l.radius)} m is less than one unit. Nothing was sent.`}),console.error(`perun-atlas: a radius of ${Math.round(l.radius)} m is ${l.radius*s} units in EPSG:${n}, which rounds to zero. A projection measured in degrees cannot carry an integer radius: send {draw.metres} for the size and {draw.ring} for the shape instead.`),console.error(`perun-atlas: the configured path is`,e.save.onSave);return}let v={...i,note:d,draw:{lat:l.lat,lng:l.lng,metres:Math.round(l.radius),x:r,y:o,radius:c,ring:f,geojson:h,...S.context?{selected:S.context}:{}},...e?.form?{form:_}:{}},w=await Tt(e.save.onSave,v,{body:e.save.body===void 0?void 0:wt(e.save.body,v),contentType:e.save.contentType,encoding:e.save.encoding,failure:e.save.failure});m(!1),w.ok&&(C(),g(e=>e+1)),Zr({response:w.data||w.message,type:Qr(w.data,w.ok)})}}},ei=({set:e,selection:t,exportable:n,labelResolver:r,timeScoped:i,range:a,srid:o,drawnWith:s})=>{let c=n===!1?null:n&&n!==!0?n:{},l=!!(t?.selecting&&t.feedsExport&&t.count>0),u=l?{type:`FeatureCollection`,features:t.inside}:e,d=c&&u&&(u.features?.length??0)>0,f=[c?.filename??`features`,l?`within-${Math.round(t.radius??0)||`shape`}`:null,i?`${a.from}_${a.to}`:Pr()].filter(Boolean).join(`-`),p=()=>we(u,o),h=e=>{let t=c?.name?v(e?.properties,c.name):null;return t==null||t===``?m(s?.(e),e):String(t)},g={fields:c?.fields,exclude:c?.exclude,labelResolver:r};return{offer:c,canExport:d,saveGeoJSON:()=>En(`${f}.geojson`,Et(p()),`application/geo+json`),saveCSV:()=>En(`${f}.csv`,Pt(p(),g),`text/csv;charset=utf-8`),saveKML:()=>En(`${f}.kml`,Ht(p(),{...g,nameOf:h}),`application/vnd.google-earth.kml+xml`)}},{useEffect:ti,useState:ni}=t.React,ri=({subject:e,drawing:t})=>{let[n,r]=ni(null),i=t=>Ue(t,e?.id,e?.match);return ti(()=>{if(!n)return;let e=e=>{e.key===`Escape`&&r(null)};return document.addEventListener(`keydown`,e),()=>document.removeEventListener(`keydown`,e)},[n]),{record:n,openRecord:(e,n)=>{t||n&&r(n)},closeRecord:()=>r(null),isSubject:i,descriptorFor:t=>e?.descriptor&&i(t)?e.descriptor:null,isPinnedFeature:e=>i(e)}};nn(`/*
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
  pointer-events: auto;
  max-width: 22rem;
  padding: 16px 20px;
  text-align: center;
  background: #fff;
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
`);var{useMemo:ii,useState:ai}=t.React,{Icon:oi}=t.elements,si=({session:e,servicePath:n,context:r,descriptors:i,labelResolver:a,cluster:o,subject:s,presets:c=[],defaultMonths:l,labels:u={},map:f,exportable:p,legend:m=!0,notice:h=!0,tokens:g,title:_,choropleth:v,draw:y,className:b=``,onClose:x})=>{let[S,C]=ai(null),[w,T]=ai(!0),[E,D]=ai(!0),[O,M]=ai(null),{timeScoped:N,preset:P,range:F,initial:I,longest:L,applyPreset:R,onRangeChange:ee}=zr({presets:c,defaultMonths:l,servicePath:n,onMoved:()=>{C(null),Te()}}),z=ii(()=>({...r||{},...N&&{from:F.from,to:F.to},...O&&{srid:O}}),[r,N,F.from,F.to,O]),{coloured:B,statusPath:te,rows:V,tooltip:ne}=Mr({choropleth:v,bindings:z,bindingKey:JSON.stringify(z)}),re=B?{values:[],usedFallback:!1}:[],[ie,ae]=ai(re),[oe,se]=ai([]),ce=e=>se(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e]),le=()=>se([]),[ue,H]=ai(null),de=S===null?null:ue??S,[U,fe]=ai(null),{drawable:pe,drawing:W,shape:me,selection:he,note:ge,form:_e,saving:G,reload:K,setShape:ve,setNote:ye,startDrawing:be,finishDrawing:xe,clearDrawing:Se,saveShape:Ce}=$r({draw:y,dataSrid:O,set:de,bindings:z,labels:u}),{record:q,openRecord:we,closeRecord:Te,descriptorFor:Ee,isPinnedFeature:De}=ri({subject:s,drawing:W}),Oe=()=>{T(!0),ae(re)},ke=()=>{C({features:[]}),H(null),fe(null),T(!1)},{offer:Ae,canExport:je,saveGeoJSON:Me,saveCSV:Ne,saveKML:Pe}=ei({set:de,selection:he,exportable:p,labelResolver:a,timeScoped:N,range:F,srid:O,drawnWith:e=>B?i?.[v.descriptor]:d(i?.[Ee(e)??Ve(e)],e)}),Fe=!w&&S!==null&&(S.features?.length??0)===0&&h!==!1&&!W&&!me;return t.React.createElement(`div`,{className:`atlas-panel ${b}${E?``:` atlas-panel--nolabels`}`.trim(),style:g},t.React.createElement(`header`,{className:`atlas-panel__header`},t.React.createElement(`div`,{className:`atlas-panel__title`},_),x&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__close`,"aria-label":u.close??`Close`,onClick:x},`×`)),t.React.createElement(`div`,{className:`atlas-panel__toolbar`},N&&t.React.createElement(qn,{from:F.from,to:F.to,onChange:ee,labels:{from:u.from,to:u.to,invalidRange:u.invalidRange}}),N&&c.length>0&&t.React.createElement(`div`,{className:`atlas-panel__segmented`},c.map(({months:e,label:n})=>t.React.createElement(`button`,{key:e,type:`button`,"aria-pressed":P===e,onClick:()=>R(e)},n))),!B&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__switch`,"aria-pressed":E,onClick:()=>D(!E)},t.React.createElement(`span`,{className:`atlas-panel__track`},t.React.createElement(`span`,{className:`atlas-panel__knob`})),u.labels??`Labels`),(pe||je)&&t.React.createElement(`div`,{className:`atlas-panel__actions`},pe&&t.React.createElement(Xn,{drawing:W,busy:G,labels:u,onStart:be,onCancel:Se}),je&&Ae.geojson!==!1&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:Me},t.React.createElement(oi,{name:`IconJson`,size:16,stroke:1.75,"aria-hidden":`true`}),u.exportGeoJSON??`GeoJSON`),je&&Ae.csv!==!1&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:Ne},t.React.createElement(oi,{name:`IconFileTypeCsv`,size:16,stroke:1.75,"aria-hidden":`true`}),u.exportCsv??`CSV`),je&&Ae.kml!==!1&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:Pe},t.React.createElement(oi,{name:`IconWorld`,size:16,stroke:1.75,"aria-hidden":`true`}),u.exportKml??`KML`)),pe&&(W||me)&&t.React.createElement(er,{shape:me,drawing:W,busy:G,limits:y.radius,caught:he.selecting?{count:he.count,total:he.total}:void 0,savable:!!y.save?.onSave,note:y.note?{value:ge,onChange:ye,required:y.note.required}:void 0,form:_e,labels:u,onCancel:Se,onRadius:e=>ve(t=>t&&{...t,radius:e}),onSave:Ce})),t.React.createElement(`div`,{className:`atlas-panel__body`},t.React.createElement(`div`,{className:`atlas-panel__mapwrap`},t.React.createElement(`div`,{className:`atlas-panel__map`},t.React.createElement(Cn,{session:e,layerSwitcher:!0,...f,extent:U,onReady:({config:e})=>M(e?.dataSrid??null)},B?(V!==null||!te)&&t.React.createElement(Ln,{servicePath:n,context:z,srid:O,reload:K,statusRows:V,join:v.join,field:v.field,palette:v.palette,fallback:v.fallback,descriptor:i?.[v.descriptor],labelResolver:a,tooltip:ne,hidden:oe,onFeatureClick:we,onLegend:ae,onShown:H,onLoadStart:Oe,onLoad:e=>{C(e??{features:[]}),T(!1)},onError:ke}):t.React.createElement(hr,{servicePath:n,context:z,reload:K,descriptors:i,descriptorFor:Ee,labelResolver:a,cluster:o,pinned:De,hidden:oe,onFeatureClick:we,onLegend:ae,onShown:H,onExtent:fe,onLoadStart:Oe,onLoad:e=>{C(e??{features:[]}),T(!1)},onError:ke}),pe&&t.React.createElement(Gn,{value:me,drawing:W,style:y.style,onChange:ve,onDrawn:xe}),m!==!1&&t.React.createElement(Or,{entries:B?A({palette:v.palette,fallback:v.fallback??j.__unknown,unknownLabel:v.unknownLabel,...ie},a):k(ie,a),title:u.legend,hidden:oe,onToggle:ce,onShowAll:le,showAllLabel:u.showAll,position:typeof m==`string`?m:void 0}))),(w||G)&&t.React.createElement(`div`,{className:`atlas-panel__loading`,role:`status`,"aria-live":`polite`},t.React.createElement(`div`,{className:`atlas-panel__loadingcard`},t.React.createElement(`div`,{className:`atlas-panel__spinner`,"aria-hidden":`true`}),t.React.createElement(`span`,null,G?u.saving??`Saving…`:u.loading??`Loading…`))),Fe&&t.React.createElement(`div`,{className:`atlas-panel__empty`},t.React.createElement(`div`,{className:`atlas-panel__emptycard`},t.React.createElement(`div`,{className:`atlas-panel__emptytitle`},u.empty??(N?`Nothing in this range`:`Nothing to show`)),u.emptyHint&&t.React.createElement(`div`,{className:`atlas-panel__emptybody`},u.emptyHint),N&&L&&P!==L.months&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--primary`,onClick:()=>R(L.months)},[u.widen??`Try`,L.label].filter(Boolean).join(` `))))),q&&t.React.createElement(`aside`,{className:[`atlas-panel__details`,q.spec?.className].filter(Boolean).join(` `),style:q.spec?.style,"aria-label":u.details??`Details`},t.React.createElement(`div`,{className:`atlas-panel__detailshead`},t.React.createElement(`div`,{className:`atlas-panel__detailstitle`,style:q.spec?.titleStyle},q.title??u.details??`Details`),t.React.createElement(`button`,{type:`button`,className:`atlas-panel__close`,"aria-label":u.close??`Close`,onClick:Te},`×`)),t.React.createElement(`dl`,{className:`atlas-panel__detailsbody`},q.rows.map(({field:e,label:n,value:r})=>t.React.createElement(`div`,{key:e,className:`atlas-panel__detailsrow`},t.React.createElement(`dt`,{style:q.spec?.labelStyle},n),t.React.createElement(`dd`,{style:q.spec?.valueStyle},r)))))),(N||x)&&t.React.createElement(`div`,{className:`atlas-panel__footer`},N&&t.React.createElement(`div`,{className:`atlas-panel__summary`},`${F.from} → ${F.to}`),t.React.createElement(`div`,{className:`atlas-panel__actions`},N&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:()=>R(I)},u.reset??`Reset range`),x&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--dark`,onClick:x},u.close??`Close`))))};nn(`/*
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
`);var{Map:ci,factory:li}=U,{useEffect:ui,useRef:di}=t.React,fi=`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 26 36">
  <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 23 13 23s13-13.25 13-23C26 5.82 20.18 0 13 0z"
        fill="currentColor" stroke="#ffffff" stroke-width="1.75"/>
  <circle cx="13" cy="13" r="4" fill="#ffffff"/>
</svg>`,pi=({value:e,onChange:t,draggable:n=!0,className:r=`atlas-pin`,html:i=fi,size:a=[20,28],anchor:o=[10,28]})=>{let s=di(null),c=di(t);return c.current=t,ui(()=>{let e=e=>c.current?.({lat:e.latlng.lat,lng:e.latlng.lng});return ci.on(`click`,e),()=>{ci.off(`click`,e),s.current&&(ci.removeLayer(s.current),s.current=null)}},[]),ui(()=>{if(!e){s.current&&(ci.removeLayer(s.current),s.current=null);return}if(s.current){s.current.setLatLng(e);return}let t=li.marker(e,{icon:li.divIcon({className:r,html:i,iconSize:a,iconAnchor:o}),draggable:n}).addTo(ci);t.on(`drag`,e=>c.current?.({...e.target.getLatLng()})),s.current=t},[e?.lat,e?.lng]),null},{labelsManager:mi}=t.utils,{useMemo:hi}=t.React,gi=(e,n)=>{let{objConfig:r,objectId:i,session:a,labelDomain:o=`main`,title:s,className:c,onClose:l}=e,u=e=>{if(!e)return;let t=mi(e,n,o);return!t||t===`perun.${o}.${e}`?void 0:t},d=hi(()=>({session:a,objectId:i,...r?.context||{}}),[a,i,r]),f=hi(()=>(r?.presets||[]).map(({months:e,label:t})=>({months:e,label:u(t)??`${e}`})),[r]),p=hi(()=>Object.fromEntries(Object.entries(r?.labels||{}).map(([e,t])=>[e,u(t)])),[r]),m=r?.service;return m?t.React.createElement(si,{session:a,servicePath:m,context:d,descriptors:r?.descriptors||{},labelResolver:u,cluster:r?.cluster,subject:r?.subject?{...r.subject,id:i}:void 0,title:s??u(r?.title),presets:f,defaultMonths:r?.defaultMonths,map:r?.map,choropleth:r?.choropleth,draw:r?.draw,exportable:r?.export,legend:r?.legend,notice:r?.notice,tokens:r?.tokens,labels:p,className:c,onClose:l}):t.React.createElement(`div`,{className:`atlas-panel-unavailable`},u(`map_service_missing`)??`This button has no map service configured.`)};gi.contextTypes={intl:t.PropTypes.object.isRequired};var _i=(0,t.connect)((e,t)=>({session:t.session??e?.security?.svSession}))(gi),vi=a,yi=o;e.AtlasMap=Cn,e.Choropleth=Ln,e.CirclePicker=Gn,e.ConfiguredMap=_i,e.DateRange=qn,e.DrawBar=er,e.DrawTool=Xn,e.FeaturePanel=si,e.FeatureSet=hr,e.Legend=Cr,e.LegendControl=Or,e.PointPicker=pi,e.ZoomRail=pn,Object.defineProperty(e,"appearance",{enumerable:!0,get:function(){return L}}),Object.defineProperty(e,"bootstrap",{enumerable:!0,get:function(){return Ie}}),Object.defineProperty(e,"config",{enumerable:!0,get:function(){return z}}),Object.defineProperty(e,"data",{enumerable:!0,get:function(){return Ut}}),e.name=vi,e.version=yi});