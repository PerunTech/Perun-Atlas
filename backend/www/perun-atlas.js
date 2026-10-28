(function(e,t){typeof exports==`object`&&typeof module<`u`?t(exports,require("perun-core"),require("spatial")):typeof define==`function`&&define.amd?define([`exports`,`perun-core`,`spatial`],t):(e=typeof globalThis<`u`?globalThis:e||self,t(e[`perun-atlas`]={},e[`perun-core`],e.spatial))})(this,function(e,t,n){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});var r=Object.defineProperty,i=(e,t)=>{let n={};for(var i in e)r(n,i,{get:e[i],enumerable:!0});return t||r(n,Symbol.toStringTag,{value:`Module`}),n},a=`perun-atlas`,o=`1.0.1-rc.1`,s={crs:{type:`crs`,param:`SPATIAL_CRS`,required:!0,doc:`EPSG code, or { code, def } for a proj4 definition.`},center:{type:`latlng`,param:`SPATIAL_CENTER`,required:!0,doc:`Initial map centre as { lat, lng }.`},bounds:{type:`bounds`,param:`SPATIAL_BOUNDS`,doc:`Spatial limits as [ {lat,lng} southwest, {lat,lng} northeast ].`},zoom:{type:`int`,param:`SPATIAL_ZOOM`,default:8},minZoom:{type:`int`,param:`SPATIAL_MIN_ZOOM`,default:0},maxZoom:{type:`int`,param:`SPATIAL_MAX_ZOOM`,default:18},bboxOrder:{type:`bool`,param:`SPATIAL_SWITCH_BBOX_ORDER`,default:!1,doc:`Reverse WMS bounding box axis order.`},units:{type:`enum`,param:`SPATIAL_MEASUREMENT_SYSTEM`,values:[`metric`,`imperial`],default:`metric`},attribution:{type:`string`,param:`SPATIAL_ATTRIBUTION`,default:``},fallbackBasemap:{type:`string`,param:`SPATIAL_FALLBACK_BASEMAP`,default:`https://tile.openstreetmap.org/{z}/{x}/{y}.png`,doc:`Tile URL drawn when the layer catalogue lists no basemap, on a Web Mercator map only. "none" turns it off.`},dataSrid:{type:`srid`,param:`sys.gis.default_srid`,default:`4326`,doc:`EPSG code the database stores geometry in, without the prefix.`}},c=Object.keys(s).filter(e=>s[e].required),l=i({REQUIRED:()=>c,SCHEMA:()=>s}),u=Object.getPrototypeOf(n.spatial),d=u.config,f=u.core,p=u.data,m=u.tools,h=e=>Array.isArray(e)&&typeof e[0]==`number`,g=e=>{if(!e)return[];if(e.type===`GeometryCollection`)return(e.geometries??[]).flatMap(g);let t=e=>Array.isArray(e)?h(e)?[e]:e.flatMap(t):[];return t(e.coordinates)},_=(e,t)=>{if(!e)return e;if(e.type===`GeometryCollection`)return{...e,geometries:(e.geometries??[]).map(e=>_(e,t))};let n=e=>Array.isArray(e)?h(e)?t(e):e.map(n):e;return{...e,coordinates:n(e.coordinates)}},v=(e,t)=>Array.isArray(e?.features)?{...e,features:e.features.map(e=>e?.geometry?{...e,geometry:_(e.geometry,t)}:e)}:e,{Map:y,factory:b}=f,x={3857:()=>b.CRS.EPSG3857,3395:()=>b.CRS.EPSG3395,4326:()=>b.CRS.EPSG4326},S=e=>x[String(e)]?.()??null,C=e=>e??y,w=new Set,T=e=>e==null?null:S(e)||(w.has(String(e))||(w.add(String(e)),console.warn(`perun-atlas: cannot express a coordinate in EPSG:${e} — the engine builds 3857, 3395 and 4326. Using the map's own projection instead, which is correct only if this deployment stores geometry in it.`)),null),ee=(e,t)=>{let n=T(e);if(!n)return C(t).getBBox();let r=C(t).getBounds(),i=n.projection.project(r.getSouthWest()),a=n.projection.project(r.getNorthEast());return`${i.x},${i.y},${a.x},${a.y}`},E=(e,t,n)=>{let{x:r,y:i}=(T(t)??C(n).getCRS()).projection.project(b.latLng(e));return{x:r,y:i}},D=(e,t,n)=>{let[r,i]=Array.isArray(e)?e:[e?.x,e?.y],{lat:a,lng:o}=(T(t)??C(n).getCRS()).projection.unproject(b.point(r,i));return{lat:a,lng:o}},O=(e,t,n)=>v(e,e=>{let{lat:r,lng:i}=D(e,t,n);return[i,r,...e.slice(2)]}),k=(e,t,n)=>v(e,e=>{let{x:r,y:i}=E({lat:e[1],lng:e[0]},t,n);return[r,i,...e.slice(2)]}),A=(e,t,n)=>j(e,t,n).ew,j=(e,t,n)=>{let r=.001,i=b.latLng(e),a=b.latLng({lat:i.lat,lng:i.lng+r}),o=b.latLng({lat:i.lat+r,lng:i.lng}),s=E(i,t,n),c=C(n).distance(i,a),l=C(n).distance(i,o);return{ew:c?Math.abs(E(a,t,n).x-s.x)/c:1,ns:l?Math.abs(E(o,t,n).y-s.y)/l:1}},te=e=>e>0?Math.min(12,Math.max(0,3-Math.floor(Math.log10(e)))):6,ne=(e,t)=>{let n=10**t;return Math.round(e*n)/n},M=(e,t,n,r=24,i)=>{let{ew:a,ns:o}=j(e,n,i),{x:s,y:c}=E(e,n,i),l=t*a,u=t*o,d=te(Math.min(l,u));return Array.from({length:Math.max(3,r)},(e,t)=>{let n=2*Math.PI*t/Math.max(3,r);return{x:ne(s+l*Math.cos(n),d),y:ne(c+u*Math.sin(n),d)}})},{Map:N,store:P}=f,F={crs:`crs`,center:`center`,bounds:`bounds`,zoom:`zoom`,minZoom:`minZoom`,maxZoom:`maxZoom`,units:`measurementSystem`,bboxOrder:`switchBboxOrder`},re=e=>{if(!e)return;let t=N.getCRS?.()?.code,n=typeof e==`object`?e.code:e;t&&n&&t!==n&&console.warn(`perun-atlas: this deployment declares ${n}, but the map is on ${t}. The engine could not resolve the declared value — as a plain code it must be EPSG:3857, EPSG:3395 or EPSG:4326, and any other projection needs a proj4 definition. Basemap tiles will be requested outside the grid they are published on.`)},ie=e=>{if(!e)return;P.addState(`dbCRSCode`,{dbCRS:e});let t=S(e);if(t){P.addState(`dbCRS`,t);return}let n=N.getCRS?.()?.code;e!==n?.split(`:`)[1]&&console.warn(`perun-atlas: this deployment stores geometry in EPSG:${e}, which spatial cannot convert from — it handles 3857, 3395 and 4326. Geometry will be read as though it were already in ${n}, and will be drawn in the wrong place.`)},ae=(e={})=>{let t={};Object.entries(F).forEach(([n,r])=>{e[n]!==void 0&&(t[r]=e[n])});let n=d.configure(t);return re(e.crs),ie(e.dataSrid),n},I=(e,t,n)=>{let r=TypeError(`perun-atlas: cannot read "${e}" as ${n} (got ${JSON.stringify(t)})`);throw r.expected=n,r},L=e=>{if(typeof e!=`string`)return e;let t=e.trim();if(!t.startsWith(`{`)&&!t.startsWith(`[`))return e;try{return JSON.parse(t)}catch{return e}},oe=(e,t)=>{let n=L(t);if(n&&typeof n==`object`&&`lat`in n&&`lng`in n)return{lat:Number(n.lat),lng:Number(n.lng)};if(typeof n==`string`&&n.includes(`,`)){let[e,t]=n.split(`,`).map(Number);if(Number.isFinite(e)&&Number.isFinite(t))return{lat:e,lng:t}}return I(e,t,`a { lat, lng } pair`)},se={string:(e,t)=>String(t),int:(e,t)=>{let n=Number(t);return Number.isInteger(n)?n:I(e,t,`an integer`)},bool:(e,t)=>{if(typeof t==`boolean`)return t;let n=String(t).trim().toLowerCase();return[`true`,`1`,`yes`].includes(n)?!0:![`false`,`0`,`no`].includes(n)&&I(e,t,`a boolean`)},enum:(e,t,n)=>n.values.includes(t)?t:I(e,t,`one of ${n.values.join(`, `)}`),latlng:oe,bounds:(e,t)=>{let n=L(t);return Array.isArray(n)&&n.length===2?[oe(e,n[0]),oe(e,n[1])]:I(e,t,`a [southwest, northeast] pair`)},srid:(e,t)=>{let n=String(t).trim().replace(/^EPSG:/i,``);return/^\d{4,6}$/.test(n)?n:I(e,t,`an EPSG code such as 4326`)},crs:(e,t)=>{let n=L(t);return typeof n==`string`&&n.startsWith(`EPSG:`)||n&&typeof n==`object`&&n.code?n:I(e,t,`an EPSG code or { code, def } object`)}},ce=(e,t,n)=>{let r=se[n.type];if(!r)throw TypeError(`perun-atlas: no coercion for type "${n.type}" on "${e}"`);return r(e,t,n)},le=async()=>{let e=Object.entries(s).filter(([,e])=>e.param),n=await Promise.all(e.map(([e,n])=>t.axios.get(`${window.server}/WsConf/params/get/sys/${n.param}`).then(t=>({key:e,value:t?.data?.VALUE})).catch(()=>({key:e,failed:!0}))));return{values:Object.fromEntries(n.filter(({value:e})=>e!==void 0&&e!==``).map(({key:e,value:t})=>[e,t])),unreachable:n.filter(({failed:e})=>e).map(({key:e})=>e)}},ue=()=>Object.fromEntries(Object.entries(s).filter(([,e])=>`default`in e).map(([e,t])=>[e,t.default])),de=async(e={})=>{let t=await le(),n={...ue(),...t.values,...e},r={},i=[];Object.entries(s).forEach(([e,t])=>{let a=n[e];if(a!==void 0)try{r[e]=ce(e,a,t)}catch(t){i.push({...fe(e),got:a,expected:t.expected,message:t.message})}});let a=c.filter(e=>r[e]===void 0&&!i.some(t=>t.key===e)),o=a.filter(e=>t.unreachable.includes(e)).map(fe),l=a.filter(e=>!t.unreachable.includes(e)).map(fe);if(i.length||l.length||o.length)throw new me({invalid:i,missing:l,unreachable:o});return r},fe=e=>({key:e,param:s[e].param,doc:s[e].doc}),pe=e=>e.map(({key:e,param:t})=>`${e} (parameter ${t})`).join(`, `),me=class extends Error{constructor(e){let t=[...e.invalid.map(e=>e.message),e.missing.length&&`missing required setting(s): ${pe(e.missing)}`,e.unreachable.length&&`no answer for required setting(s): ${pe(e.unreachable)}`].filter(Boolean);super(`perun-atlas: configuration could not be resolved.
  - `+t.join(`
  - `)),this.name=`ConfigError`,this.problems=e}},{factory:he}=f,{getServerOrigin:ge}=t.utils,_e=`GEO_LAYER_TYPE`,ve={BASEMAP:`1`,OVERLAY:`2`},ye=(e,t=_e)=>({layerType:e?.[`${t}.LAYER_TYPE`],protocol:(e?.[`${t}.PROTOCOL`]??``).toLowerCase(),version:e?.[`${t}.VERSION`]||`1.1.1`,format:e?.[`${t}.FORMAT`]||`image/png`,url:e?.[`${t}.URL`],group:e?.[`${t}.LAYER_GROUP`]||`Other`,title:e?.[`${t}.TITLE`],label:e?.[`${t}.LABEL_CODE`]||e?.[`${t}.TITLE`]}),be=[{match:/openstreetmap\.org/i,name:`OpenStreetMap`,maxNativeZoom:19,attribution:`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`},{match:/opentopomap\.org/i,name:`OpenTopoMap`,maxNativeZoom:17,attribution:`&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)`},{match:/cartocdn\.com/i,name:`CARTO`,maxNativeZoom:20,attribution:`&copy; <a href="https://carto.com/attributions">CARTO</a>`},{match:/arcgisonline\.com/i,name:`Esri`,attribution:`Tiles &copy; <a href="https://www.esri.com">Esri</a>`}],xe=e=>be.find(t=>t.match.test(e??``))??{},Se=(e,{maxZoom:t}={})=>{let n=e.url||ge(),r=xe(n),i={...t!=null&&{maxZoom:t},...r.maxNativeZoom!=null&&{maxNativeZoom:r.maxNativeZoom}},a=r.attribution?{attribution:r.attribution}:{};if(e.protocol===`wms`)return he.tileLayer.extendedWMS(n,{layers:e.title,format:e.format,version:e.version,transparent:!0,uppercase:!0,...i,...a,...e.layerType===ve.OVERLAY&&{tiled:!0,isOverlay:!0}});if(e.protocol===`tile`){let e=/google|mt\{s\}/i.test(n);return he.tileLayer(n,{...i,...a,...e&&{subdomains:[`mt0`,`mt1`,`mt2`,`mt3`]}})}return e.protocol===`grid`?e.url?.includes(`google`)?he.gridLayer.googleMutant({maxZoom:24,type:e.url.split(`_`)[1]}):(console.warn(`perun-atlas: grid layer "${e.title}" has no recognised provider in its URL`),null):(console.warn(`perun-atlas: unsupported layer protocol "${e.protocol}" for "${e.title}"`),null)},Ce=async(e,n={})=>{let r={},i={},a=(await t.axios.get(`${window.server}/ReactElements/getTableData/${e}/${_e}/0`).catch(e=>(console.error(`perun-atlas: layer catalogue unavailable`,e),null)))?.data;return Array.isArray(a)?(a.forEach(e=>{let t=ye(e),a=Se(t,n);if(!a)return;let o=t.layerType===ve.OVERLAY?i:r;o[t.group]=o[t.group]||{},o[t.group][t.label]=a}),{basemap:r,overlays:i,catalogue:De(r)?`ok`:`empty`}):{basemap:r,overlays:i,catalogue:`unreachable`}},we=/^(none|off|false)$/i,Te=[`EPSG:3857`,`EPSG:900913`],Ee=(e,{crs:t,maxZoom:n}={})=>!e||we.test(e.trim())?{layer:null,reason:`off`}:Te.includes(t)?{layer:Se({protocol:`tile`,url:e},{maxZoom:n}),name:xe(e).name??`Default basemap`}:{layer:null,reason:`crs`},De=e=>{let t=Object.values(e??{})[0];return t?Object.values(t)[0]:null},Oe=(e,t)=>{if(!t)return null;let n=Object.values(e??{}).find(e=>Object.prototype.hasOwnProperty.call(e,t));return n?n[t]:null},ke=(e,t)=>{for(let n of Object.values(e??{})){let e=Object.entries(n).find(([,e])=>t?.hasLayer?.(e));if(e)return e[0]}return null},Ae=(e,t)=>{let n=e;for(let e=0;e<t.length;e+=1){if(n==null)return n;let r=t.length-e===1?t[e]:t.slice(e).join(`.`);if(Object.prototype.hasOwnProperty.call(Object(n),r))return n[r];n=n[t[e]]}return n},R=(e,t)=>Ae(e,String(t).split(`.`)),z=e=>{let t=String(e).split(`.`);return e=>Ae(e,t)},B=(e,t)=>e.replace(/\{([^}]+)\}/g,(e,n)=>{let r=R(t,n);return r==null?e:String(r)}),je={mapNotSetUp:`This map isn't set up yet`,mapNotSetUpHint:`Some settings the map needs are missing or can't be read, so it can't be drawn. Ask your administrator to check the map's system parameters.`,mapUnreachable:`Couldn't reach the server`,mapUnreachableHint:`The map's settings didn't load, so it can't be drawn yet. This is usually brief. Try again in a moment.`,mapEngineOld:`This map needs a newer map engine`,mapEngineOldHint:`The map engine on this server is older than this map needs. Ask your administrator to update it.`,mapFailed:`The map couldn't be drawn`,mapFailedHint:`Something went wrong while drawing it. Trying again may help.`,noService:`No map for this button yet`,noServiceHint:`This button doesn't have a map service set up. Your administrator can add one to the button's configuration.`,adminDetails:`Details for administrators`,copyDetails:`Copy details`,detailsCopied:`Copied`,retry:`Try again`,settingNotSet:`Not set`,settingUnreadable:`Can't read {value}`,settingNoAnswer:`No answer`,basemapDefault:`Showing {name}, the default basemap. Your administrator can add others.`,basemapDefaultNote:`No basemaps are set up for this system yet. Your administrator can add others.`,basemapDefaultGroup:`Default`,basemapUnreachable:`Couldn't load this system's basemaps. Showing {name} for now.`,basemapNone:`No basemap is set up for this map. Your administrator can add one.`,basemapNoneUnreachable:`Couldn't load this system's basemaps.`,basemapRetry:`Retry`,details:`Details`,dismiss:`Dismiss`},V=(e,t={},n={})=>B(t[e]??je[e],n),Me=e=>{let t=e?.problems;if(t){let e=[...t.missing.map(e=>({param:e.param,status:`missing`,doc:e.doc})),...t.invalid.map(e=>({param:e.param,status:`invalid`,value:JSON.stringify(e.got),doc:e.doc??(e.expected&&`Expected ${e.expected}.`)})),...t.unreachable.map(e=>({param:e.param,status:`unreachable`,doc:e.doc}))];return{kind:!t.missing.length&&!t.invalid.length?`unreachable`:`settings`,rows:e,retry:!0}}return e?.engine?{kind:`engine`,rows:[],retry:!1}:{kind:`failed`,rows:[],retry:!0}},Ne={settings:{icon:`map-off`,title:`mapNotSetUp`,hint:`mapNotSetUpHint`},unreachable:{icon:`cloud-off`,title:`mapUnreachable`,hint:`mapUnreachableHint`},engine:{icon:`map-off`,title:`mapEngineOld`,hint:`mapEngineOldHint`},failed:{icon:`map-off`,title:`mapFailed`,hint:`mapFailedHint`}},Pe=(e,t)=>e.status===`invalid`?V(`settingUnreadable`,t,{value:e.value}):e.status===`unreachable`?V(`settingNoAnswer`,t):V(`settingNotSet`,t),Fe=(e,t,n)=>{if(e===`ok`||!t)return null;let r=e===`unreachable`;return t.layer?{kind:`fallback`,unreachable:r,name:t.name,details:null}:{kind:`none`,unreachable:r,name:null,details:t.reason===`crs`?`The default basemap is only used on Web Mercator maps (EPSG:3857). This map draws in ${n??`another projection`}, where its tiles would land in the wrong place. Add a basemap in this projection to GEO_LAYER_TYPE.`:`The default basemap is turned off by SPATIAL_FALLBACK_BASEMAP. Add a basemap to GEO_LAYER_TYPE, or set the parameter to a tile URL.`}},Ie=`perun-atlas.basemap-notice`,Le=e=>{if(!e||e.unreachable)return!1;try{return window.localStorage.getItem(Ie)===e.kind}catch{return!1}},Re=e=>{if(e&&!e.unreachable)try{window.localStorage.setItem(Ie,e.kind)}catch{}},ze=(e,t,n)=>n>t?(Math.min(Math.max(e,t),n)-t)/(n-t):0,Be=e=>e<=10?1:e<=20?2:5,Ve=(e,t)=>{if(!Number.isFinite(e)||!Number.isFinite(t)||!(t>e))return[];let n=Be(t-e+1),r=[];for(let i=Math.ceil(e);i<=t;i+=1){let a=(i-e)%n===0;r.push({zoom:i,offset:ze(i,e,t),labelled:i===e||i===t||a&&t-i>=n})}return r},He=(e,t,n)=>!Number.isFinite(t)||!Number.isFinite(n)||!(n>t)?[]:(e??[]).filter(e=>Number.isFinite(e?.from)).map(e=>({mark:e,to:e.to??e.from})).filter(({mark:e,to:r})=>r>=t&&e.from<=n).map(({mark:e,to:r})=>{let i=ze(e.from,t,n),a=ze(Math.max(r,e.from),t,n);return{...e,from:Math.min(Math.max(e.from,t),n),to:Math.min(Math.max(r,t),n),offset:i,span:a-i}}),Ue=.0254/96,H=(e,t)=>!(e>0)||!(t>0)?null:e/t/Ue,We=e=>{if(!(e>0)||!Number.isFinite(e))return null;let t=10**(Math.floor(Math.log10(e))-1);return Math.round(e/t)*t},Ge=e=>{let t=We(e);return t===null?null:`1:${String(Math.max(Math.round(t),1)).replace(/\B(?=(\d{3})+(?!\d))/g,`\xA0`)}`},Ke=[24,24],{createContext:qe,useContext:Je}=t.React,Ye=qe(null),U=()=>Je(Ye)??f.Map,Xe=e=>{let t=e?.getLatLngs?.()??[];return Array.isArray(t[0])?t[0]:t},Ze=(e,t,n,r)=>{let i=Xe(t);if(e===`radius`){let e=t?.getRadius?.();return Number.isFinite(e)?`${r.asDistance(e)} · ${r.asArea(r.circleArea(e))}`:null}if(e===`angle`){let e=r.anglesAlong(i).filter(Number.isFinite);return e.length?e.map(r.asAngle).join(`, `):i.length===2?r.asBearing(r.bearing(i[0],i[1])):null}let a=e===`area`?r.area(i):r.distance(i);if(!Number.isFinite(a)||a===0)return null;n[e]+=a;let o=e===`area`?r.asArea:r.asDistance;return`${o(a)}   (Σ ${o(n[e])})`},Qe=(e,t)=>e!==void 0&&`geolocation`in e&&t?.isSecureContext!==!1,$e=e=>e===`unavailable`?`explain`:e===`found`||e===`outside`||e===`error`?`clear`:`locate`,et=(e,t,n)=>e?.[t]?t:n,{factory:tt}=f,{useEffect:nt,useLayoutEffect:rt,useState:it}=t.React,at=null,ot=()=>(at||(at=tt.Control.extend({onAdd(){return this.options.container}})),at),st=(e,t=!0)=>{let n=U(),[r]=it(()=>tt.DomUtil.create(`div`,`leaflet-control`));return rt(()=>{if(!t)return;let i=new(ot())({position:e,container:r}).addTo(n);return()=>{i.remove()}},[n,e,t,r]),r},ct=({position:e,shown:n=!0,children:r})=>t.ReactDOM.createPortal(r,st(e,n)),lt=({what:e})=>(nt(()=>{console.warn(`perun-atlas: the engine on this environment has no ${e}; skipping it.`)},[e]),null),ut=e=>{e&&(tt.DomEvent.disableClickPropagation(e),tt.DomEvent.disableScrollPropagation(e))},dt={plus:[`M12 5l0 14`,`M5 12l14 0`],minus:[`M5 12l14 0`],maximize:[`M4 8v-2a2 2 0 0 1 2 -2h2`,`M4 16v2a2 2 0 0 0 2 2h2`,`M16 4h2a2 2 0 0 1 2 2v2`,`M16 20h2a2 2 0 0 0 2 -2v-2`],minimize:[`M15 19v-2a2 2 0 0 1 2 -2h2`,`M15 5v2a2 2 0 0 0 2 2h2`,`M5 15h2a2 2 0 0 1 2 2v2`,`M5 9h2a2 2 0 0 0 2 -2v-2`],"zoom-scan":[`M4 8v-2a2 2 0 0 1 2 -2h2`,`M4 16v2a2 2 0 0 0 2 2h2`,`M16 4h2a2 2 0 0 1 2 2v2`,`M16 20h2a2 2 0 0 0 2 -2v-2`,`M8 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0`,`M16 16l-2.5 -2.5`],map:[`M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3v-13`,`M9 4v13`,`M15 7v13`],"map-off":[`M8.32 4.34l.68 -.34l6 3l6 -3v13m-2.67 1.335l-3.33 1.665l-6 -3l-6 3v-13l2.665 -1.333`,`M9 4v1m0 4v8`,`M15 7v4m0 4v5`,`M3 3l18 18`],"cloud-off":[`M9.58 5.548c.24 -.11 .492 -.207 .752 -.286c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 .957 -.383 1.824 -1.003 2.454m-2.997 1.033h-11.343c-2.572 -.004 -4.657 -2.011 -4.657 -4.487c0 -2.475 2.085 -4.482 4.657 -4.482c.13 -.582 .37 -1.128 .7 -1.62`,`M3 3l18 18`],"info-circle":[`M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0`,`M12 9h.01`,`M11 12h1v4h1`],"alert-triangle":[`M12 9v4`,`M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0`,`M12 16h.01`],x:[`M18 6l-12 12`,`M6 6l12 12`],copy:[`M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666`,`M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1`],check:[`M5 12l5 5l10 -10`],refresh:[`M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4`,`M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4`],"chevron-down":[`M6 9l6 6l6 -6`],"chevron-up":[`M6 15l6 -6l6 6`]},ft=1.75,pt=(e,t={})=>{let n=dt[e];if(!n)return``;let{className:r=`atlas-icon atlas-icon--${e}`,size:i=18,stroke:a=ft}=t;return`<svg xmlns="http://www.w3.org/2000/svg" class="${r}" width="${i}" height="${i}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${a}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">`+n.map(e=>`<path d="${e}"/>`).join(``)+`</svg>`},W=({name:e,size:n=18})=>t.React.createElement(`svg`,{className:`atlas-icon atlas-icon--${e}`,width:n,height:n,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:ft,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,focusable:`false`},dt[e].map(e=>t.React.createElement(`path`,{key:e,d:e})));W.propTypes={name:t.PropTypes.oneOf(Object.keys(dt)).isRequired,size:t.PropTypes.number};function G(e){let t=document.createElement(`style`);t.textContent=e,document.head.insertBefore(t,document.head.firstChild)}G(`/* Margins, padding and fonts are set on each class, or the deployment's bare \`p\`, \`button\` and
   \`code\` rules reach in (see README.md). */

.atlas-unavailable {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 18rem;
  padding: 16px;
  overflow: auto;
  /* A host's modal can set \`word-break: break-all\`, which these would inherit. */
  word-break: normal;
  background-color: var(--ap-map-bg, #dfe6e8);
  background-image:
    linear-gradient(rgba(74, 92, 102, 0.09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 92, 102, 0.09) 1px, transparent 1px);
  background-size: 32px 32px;
  font-family: var(--ap-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
}

.atlas-unavailable__card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30rem;
  max-width: 100%;
  margin: auto;
  padding: 20px 24px 18px;
  text-align: center;
  background: var(--ap-surface, #fff);
  border: 1px solid var(--ap-line, #e4e5ea);
  border-radius: var(--ap-r-lg, 12px);
  box-shadow: var(--ap-shadow-card, 0 8px 24px rgba(16, 18, 28, 0.1));
  color: var(--ap-ink, #14161a);
}

.atlas-unavailable__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--ap-accent-tint, #eef1f2);
  color: var(--ap-accent, #4a5c66);
}

.atlas-unavailable__title {
  margin-top: 12px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}

.atlas-unavailable__hint {
  max-width: 25rem;
  margin: 6px 0 0;
  padding: 0;
  text-indent: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ap-ink-2, #4b5563);
}

.atlas-unavailable__toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  margin-top: 8px;
  padding: 6px 10px;
  border: 0;
  border-radius: var(--ap-r-sm, 6px);
  background: transparent;
  font: 500 12.5px/1.2 var(--ap-font, system-ui, sans-serif);
  color: var(--ap-accent, #4a5c66);
  cursor: pointer;
}

.atlas-unavailable__toggle:hover {
  background: var(--ap-accent-tint, #eef1f2);
}

.atlas-unavailable__details {
  align-self: stretch;
  margin-top: 6px;
  padding: 2px 14px;
  text-align: left;
  background: var(--ap-surface-2, #fafafb);
  border: 1px solid var(--ap-line, #ebecf0);
  border-radius: var(--ap-r-md, 9px);
}

.atlas-unavailable__row {
  display: grid;
  grid-template-columns: minmax(8rem, auto) minmax(0, 1fr);
  align-items: center;
  column-gap: 12px;
  row-gap: 2px;
  padding: 8px 0;
  border-bottom: 1px solid var(--ap-line, #ebecf0);
}

.atlas-unavailable__row:last-child {
  border-bottom: 0;
}

.atlas-unavailable__param {
  padding: 0;
  background: none;
  font: 500 12px/1.4 var(--ap-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  color: var(--ap-ink, #14161a);
}

.atlas-unavailable__status {
  justify-self: start;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 500;
  background: #eceef1;
  color: var(--ap-ink-2, #4b5563);
}

.atlas-unavailable__status--invalid {
  background: #fdf1dc;
  color: #7a4306;
}

.atlas-unavailable__doc {
  grid-column: 2;
  font-size: 12px;
  line-height: 1.45;
  color: var(--ap-ink-3, #6b7280);
}

.atlas-unavailable__note {
  margin: 0;
  padding: 10px 0;
  text-indent: 0;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-line;
  overflow-wrap: anywhere;
  color: var(--ap-ink-2, #4b5563);
}

.atlas-unavailable__row + .atlas-unavailable__note {
  border-top: 1px solid var(--ap-line, #ebecf0);
}

.atlas-unavailable__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
}

.atlas-unavailable__btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 9px 14px;
  border: 1px solid var(--ap-border, #dcdde3);
  border-radius: var(--ap-r-md, 9px);
  background: var(--ap-surface, #fff);
  font: 500 12.5px/1.2 var(--ap-font, system-ui, sans-serif);
  color: var(--ap-ink, #14161a);
  cursor: pointer;
}

.atlas-unavailable__btn:hover {
  border-color: var(--ap-border-strong, #bdbfc9);
}

.atlas-unavailable__btn--primary {
  border-color: transparent;
  background: var(--ap-accent, #4a5c66);
  color: #fff;
}

.atlas-unavailable__btn--primary:hover {
  border-color: transparent;
  background: var(--ap-accent-hover, #3b4a52);
}

/*
 * spatial centres this corner with \`left: 50%\`, which also caps a shrink-wrapped
 * corner at half the map. The note needs more than that to stay on one line.
 */
.control-bottomcenter:has(.atlas-basemap-notice) {
  width: max-content;
  max-width: calc(100% - 140px);
}

.control-bottomcenter:has(.atlas-basemap-notice) > .leaflet-control {
  margin-left: auto;
  margin-right: auto;
}

.atlas-basemap-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-family: var(--ap-font, system-ui, sans-serif);
  word-break: normal;
}

.atlas-basemap-notice__pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 6px 6px 14px;
  background: var(--ap-surface, #fff);
  border: 1px solid var(--ap-line, #e4e5ea);
  border-radius: 18px;
  box-shadow: var(--ap-shadow-chip, 0 1px 3px rgba(16, 18, 28, 0.16)), 0 8px 24px rgba(16, 18, 28, 0.1);
  font-size: 12.5px;
  line-height: 1.4;
  color: var(--ap-ink, #14161a);
}

.atlas-basemap-notice__pill > .atlas-icon {
  flex: 0 0 auto;
  color: var(--ap-accent, #4a5c66);
}

.atlas-basemap-notice--warning .atlas-basemap-notice__pill > .atlas-icon {
  color: #b45309;
}

.atlas-basemap-notice__text {
  flex: 1 1 auto;
  min-width: 0;
}

.atlas-basemap-notice__action {
  flex: 0 0 auto;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--ap-border, #dcdde3);
  border-radius: 999px;
  background: var(--ap-surface, #fff);
  font: 500 12px/1 var(--ap-font, system-ui, sans-serif);
  color: var(--ap-ink, #14161a);
  cursor: pointer;
}

.atlas-basemap-notice__action:hover {
  border-color: var(--ap-border-strong, #bdbfc9);
}

.atlas-basemap-notice__action:disabled {
  opacity: 0.6;
  cursor: progress;
}

.atlas-basemap-notice__dismiss {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ap-ink-2, #4b5563);
  cursor: pointer;
}

.atlas-basemap-notice__dismiss:hover {
  background: var(--ap-accent-tint, #eef1f2);
}

.atlas-basemap-notice__details {
  box-sizing: border-box;
  max-width: 28rem;
  margin: 0;
  padding: 12px 14px;
  text-indent: 0;
  background: var(--ap-surface, #fff);
  border: 1px solid var(--ap-line, #e4e5ea);
  border-radius: var(--ap-r-lg, 12px);
  box-shadow: var(--ap-shadow-card, 0 8px 24px rgba(16, 18, 28, 0.1));
  font-size: 12px;
  line-height: 1.5;
  color: var(--ap-ink-2, #4b5563);
}

.atlas-switcher-note {
  max-width: 14rem;
  margin: 8px 0 0;
  padding: 8px 0 0;
  text-indent: 0;
  word-break: normal;
  border-top: 1px solid #ddd;
  font-size: 12px;
  line-height: 1.45;
  color: var(--ap-ink-2, #4b5563);
}
`);var{useState:mt}=t.React,ht=({notice:e,labels:n,onRetry:r,reloading:i})=>{let a=U(),[o,s]=mt(()=>Le(e)),[c,l]=mt(!1);if(o)return null;let u=e.kind===`fallback`?V(e.unreachable?`basemapUnreachable`:`basemapDefault`,n,{name:e.name}):V(e.unreachable?`basemapNoneUnreachable`:`basemapNone`,n);return t.React.createElement(ct,{position:et(a._controlCorners,`bottomcenter`,`bottomleft`)},t.React.createElement(`div`,{className:`atlas-basemap-notice${e.unreachable?` atlas-basemap-notice--warning`:``}`,role:`status`,ref:ut},c&&t.React.createElement(`p`,{className:`atlas-basemap-notice__details`},e.details),t.React.createElement(`div`,{className:`atlas-basemap-notice__pill`},t.React.createElement(W,{name:e.unreachable?`alert-triangle`:`info-circle`,size:16}),t.React.createElement(`span`,{className:`atlas-basemap-notice__text`},u),e.details&&t.React.createElement(`button`,{type:`button`,className:`atlas-basemap-notice__action`,"aria-expanded":c,onClick:()=>l(!c)},V(`details`,n)),r&&t.React.createElement(`button`,{type:`button`,className:`atlas-basemap-notice__action`,disabled:i,onClick:r},V(`basemapRetry`,n)),t.React.createElement(`button`,{type:`button`,className:`atlas-basemap-notice__dismiss`,"aria-label":V(`dismiss`,n),title:V(`dismiss`,n),onClick:()=>{Re(e),s(!0)}},t.React.createElement(W,{name:`x`,size:14})))))};ht.propTypes={notice:t.PropTypes.object.isRequired,labels:t.PropTypes.object,onRetry:t.PropTypes.func,reloading:t.PropTypes.bool};var gt=(e,t)=>{e&&t&&Object.entries(t).forEach(([t,n])=>{t.startsWith(`--`)?e.style.setProperty(t,n):e.style[t]=n})},_t=e=>e instanceof Node?e:document.createTextNode(String(e)),vt=(e,t,n)=>{let r=n.startsWith(`text/csv`)?`﻿`:``,i=URL.createObjectURL(new Blob([r,t],{type:n})),a=document.createElement(`a`);a.href=i,a.download=e,a.style.display=`none`,document.body.appendChild(a),a.click(),a.remove(),setTimeout(()=>URL.revokeObjectURL(i),0)},yt=async(e,t=document.body)=>{if(window.isSecureContext&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{}let n=document.createElement(`textarea`);n.value=e,n.setAttribute(`readonly`,``),n.setAttribute(`aria-hidden`,`true`),Object.assign(n.style,{position:`fixed`,top:`0`,left:`0`,opacity:`0`}),t.appendChild(n),n.select();let r=!1;try{r=document.execCommand(`copy`)}catch{r=!1}return n.remove(),r},{useEffect:bt,useRef:xt,useState:St}=t.React,Ct=({icon:e,title:n,hint:r,rows:i=[],details:a,copy:o,onRetry:s,labels:c,className:l})=>{let[u,d]=St(!1),[f,p]=St(!1),m=xt(null);bt(()=>()=>clearTimeout(m.current),[]);let h=async e=>{await yt(o,e.currentTarget)&&(p(!0),clearTimeout(m.current),m.current=setTimeout(()=>p(!1),2e3))},g=i.length>0||!!a;return t.React.createElement(`div`,{className:[`atlas-unavailable`,l].filter(Boolean).join(` `),role:`alert`},t.React.createElement(`div`,{className:`atlas-unavailable__card`},t.React.createElement(`span`,{className:`atlas-unavailable__icon`},t.React.createElement(W,{name:e,size:22})),t.React.createElement(`div`,{className:`atlas-unavailable__title`},n),t.React.createElement(`p`,{className:`atlas-unavailable__hint`},r),g&&t.React.createElement(`button`,{type:`button`,className:`atlas-unavailable__toggle`,"aria-expanded":u,onClick:()=>d(!u)},V(`adminDetails`,c),t.React.createElement(W,{name:u?`chevron-up`:`chevron-down`,size:14})),u&&t.React.createElement(`div`,{className:`atlas-unavailable__details`},i.map(e=>t.React.createElement(`div`,{className:`atlas-unavailable__row`,key:e.param},t.React.createElement(`code`,{className:`atlas-unavailable__param`},e.param),t.React.createElement(`span`,{className:`atlas-unavailable__status atlas-unavailable__status--${e.status}`},Pe(e,c)),e.doc&&t.React.createElement(`span`,{className:`atlas-unavailable__doc`},e.doc))),a&&t.React.createElement(`p`,{className:`atlas-unavailable__note`},a)),(o||s)&&t.React.createElement(`div`,{className:`atlas-unavailable__actions`},o&&t.React.createElement(`button`,{type:`button`,className:`atlas-unavailable__btn`,onClick:h},t.React.createElement(W,{name:f?`check`:`copy`,size:16}),V(f?`detailsCopied`:`copyDetails`,c)),s&&t.React.createElement(`button`,{type:`button`,className:`atlas-unavailable__btn atlas-unavailable__btn--primary`,onClick:s},t.React.createElement(W,{name:`refresh`,size:16}),V(`retry`,c)))))};Ct.propTypes={icon:t.PropTypes.string.isRequired,title:t.PropTypes.string.isRequired,hint:t.PropTypes.string,rows:t.PropTypes.array,details:t.PropTypes.string,copy:t.PropTypes.string,onRetry:t.PropTypes.func,labels:t.PropTypes.object,className:t.PropTypes.string};var{factory:wt}=f,{useLayoutEffect:Tt}=t.React,Et=({credit:e})=>{let t=U();return Tt(()=>{let n=wt.control.attribution({prefix:!1}).addTo(t);return e&&n.addAttribution(e),()=>{n.remove()}},[t,e]),null};Et.propTypes={credit:t.PropTypes.string};var K=(e,n)=>t.redux.store.getState().intl?.messages?.[`perun.spatial.${e}`]||n;G(`/* spatial bundles its own copy of these rules until its 6.0 and appends it after this sheet, so
   that copy wins a tie. */
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

/* Tabular figures, so the string does not shift sideways as the pointer moves. */
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

/* Above the control, which usually sits at the map's bottom edge. */
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
`);var{setting:Dt}=d,{util:Ot}=f,{readout:kt}=m,{useEffect:At,useMemo:jt,useRef:Mt,useState:Nt}=t.React,Pt={latitude:[`latitude`,`Lat`],longitude:[`longitude`,`Lng`],abscissa_x:[`abscissa_x`,`X`],ordinate_y:[`ordinate_y`,`Y`]},Ft=e=>{let t=e.getCRS();return{code:t?.code,label:t?.desc||t?.code,project:t=>e.transform(t),unproject:t=>e.untransform(t)}},It=e=>{try{return e.getCenter()}catch{return Dt(`center`)}},Lt=({position:e=`bottomcenter`,precision:n,systems:r})=>{let i=U();return typeof kt?.resolve==`function`?t.React.createElement(ct,{position:et(i._controlCorners,e,`bottomleft`)},t.React.createElement(Rt,{precision:n,systems:r})):t.React.createElement(lt,{what:`coordinate readout`})};Lt.propTypes={position:t.PropTypes.string,precision:t.PropTypes.number,systems:t.PropTypes.array};var Rt=({precision:e=5,systems:n})=>{let r=U(),[i,a]=Nt(()=>It(r)),[o,s]=Nt(null),[c,l]=Nt(null),[u,d]=Nt(!1),[f,p]=Nt(!1),[m,h]=Nt(()=>r.getCRS()?.code);At(()=>{let e=()=>h(r.getCRS()?.code);return r.on(`viewreset`,e),()=>r.off(`viewreset`,e)},[r]);let g=jt(()=>kt.resolve(n??Dt(`coordinateSystems`),Ft(r),e),[n,e,m,r]),_=g.find(e=>e.key===o)??g[0],v=jt(()=>Ot.throttle(e=>a(e.latlng),100),[]);At(()=>{if(!c)return r.on(`mousemove`,v),()=>r.off(`mousemove`,v)},[c,v,r]);let y=Mt(null);At(()=>()=>clearTimeout(y.current),[]);let b=_?c??_.toText(i):[``,``],x=(e,t)=>{d(!1),l(b.map((n,r)=>r===e?t:n))},S=()=>{let e=_?.toLatLng(b);!e||!kt.inside(e,Dt(`bounds`))?d(!0):(d(!1),l(null),r.setView(e,r.getZoom()))},C=e=>{e.key===`Enter`&&(e.preventDefault(),S()),e.key===`Escape`&&(l(null),d(!1),e.target.blur())};return _?t.React.createElement(`div`,{id:`coordinates-control`,className:`coordinates-control`,onBlur:e=>{e.currentTarget.contains(e.relatedTarget)||(l(null),d(!1))}},g.length>1&&t.React.createElement(`select`,{className:`coordinates-control__system`,value:_.key,onChange:e=>{s(e.target.value),l(null)},"aria-label":K(`coordinate_system`,`Coordinate system`)},g.map(e=>t.React.createElement(`option`,{key:e.key,value:e.key},e.label))),t.React.createElement(`div`,{className:`coordinates-control__pair`},b.map((e,n)=>{let[r,i]=Pt[_.axes[n]]??[``,``];return t.React.createElement(`label`,{className:`coordinates-control__field`,key:_.axes[n]},t.React.createElement(`span`,{className:`coordinates-control__axis`},K(r,i)),t.React.createElement(`input`,{type:`text`,className:`coordinates-control__value`,value:e,spellCheck:`false`,autoComplete:`off`,"aria-invalid":u||void 0,onChange:e=>x(n,e.target.value),onKeyDown:C,onFocus:e=>{l(b),e.target.select()}}))})),t.React.createElement(`button`,{type:`button`,className:`coordinates-control__copy`,onClick:()=>{let e=navigator.clipboard?.writeText?.(b.join(`, `));e&&e.then(()=>{p(!0),clearTimeout(y.current),y.current=setTimeout(()=>p(!1),1500)}).catch(()=>{})},title:K(`copy`,`Copy`),"aria-label":K(`copy`,`Copy`)},f?`✓`:`⧉`),u&&t.React.createElement(`div`,{className:`coordinates-control__rejected`,role:`status`},K(`outside_bounds`,`Outside this map`))):null};Rt.propTypes={precision:t.PropTypes.number,systems:t.PropTypes.array};var{factory:zt}=f,{useLayoutEffect:Bt}=t.React,Vt=({position:e=`topleft`})=>{let t=U();return Bt(()=>{if(!zt.control.fullscreen)return;let n=zt.control.fullscreen({position:e,content:pt(`maximize`)+pt(`minimize`)}).addTo(t);return()=>{n._toggleState&&t.off(`enterFullscreen exitFullscreen`,n._toggleState,n),n.remove()}},[t,e]),null};Vt.propTypes={position:t.PropTypes.string};var{layerControl:Ht}=p,{useLayoutEffect:Ut}=t.React,Wt=({basemap:e,overlays:t,note:n})=>{let r=U();return Ut(()=>{let i=Ht(e,t,{collapsed:!0}).addTo(r);if(n){let e=document.createElement(`p`);e.className=`atlas-switcher-note`,e.textContent=n,i.getContainer().querySelector(`.leaflet-control-layers-list`)?.appendChild(e)}return()=>{r.off(`click`,i.collapse,i),i.remove()}},[r,e,t,n]),null};Wt.propTypes={basemap:t.PropTypes.object,overlays:t.PropTypes.object,note:t.PropTypes.string},G(`/* No margin: Leaflet's stylesheet is not shipped, so this joins the zoom and fullscreen column
   flush, as one toolbar. spatial bundles its own copy of these rules until its 6.0 and appends it
   after this sheet, so that copy wins a tie. */
.locate-control {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
}

/* Size, ground and hover come from \`.leaflet-bar button\` in toolbar.css. */
.locate-control__button:focus-visible {
    outline: 2px solid #3399ff;
    outline-offset: -2px;
}

/* \`:hover\` too, since \`.leaflet-bar button:hover\` outranks a lone state class. */
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

/* The icon comes from perun-core's lazy Tabler chunk and may never arrive; this shows only when it
   is the button's sole child. */
.locate-control__fallback {
    display: none;
    font-size: 15px;
    line-height: 1;
}

.locate-control__fallback:only-child {
    display: block;
}

/* Beside the button, since this control sits in a top corner and below would cover the map. */
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
`);var{setting:Gt}=d,{factory:Kt}=f,{readout:qt}=m,{useCallback:Jt,useEffect:Yt,useRef:Xt,useState:Zt}=t.React,{Icon:Qt}=t.elements,$t=()=>Qe(typeof navigator>`u`?void 0:navigator,typeof window>`u`?void 0:window),en=({position:e=`topleft`,maxZoom:n})=>typeof qt?.inside==`function`?t.React.createElement(ct,{position:e},t.React.createElement(tn,{maxZoom:n})):t.React.createElement(lt,{what:`locate control`});en.propTypes={position:t.PropTypes.string,maxZoom:t.PropTypes.number};var tn=({maxZoom:e=16})=>{let n=U(),[r,i]=Zt($t()?`idle`:`unavailable`),[a,o]=Zt(null),s=Xt(null);Yt(()=>{let e=Kt.layerGroup().addTo(n);return s.current=e,()=>{n.stopLocate(),e.clearLayers(),n.removeLayer(e),s.current=null}},[n]);let c=Jt(()=>{s.current?.clearLayers(),o(null),i($t()?`idle`:`unavailable`)},[]);Yt(()=>{let t=t=>{let r=s.current;r&&(r.clearLayers(),Kt.circleMarker(t.latlng,{radius:5,weight:2,color:`#1a73e8`,fillColor:`#1a73e8`,fillOpacity:1}).addTo(r),Number.isFinite(t.accuracy)&&t.accuracy>0&&Kt.circle(t.latlng,{radius:t.accuracy,weight:1,color:`#1a73e8`,fillColor:`#1a73e8`,fillOpacity:.12}).addTo(r),qt.inside(t.latlng,Gt(`bounds`))?(n.setView(t.latlng,Math.min(e,n.getMaxZoom())),i(`found`),o(null)):(i(`outside`),o(K(`outside_bounds`,`You are outside this map`))))},r=e=>{i(`error`),o(K(`geolocation_failed`,`Could not find your position`)+(e?.message?` — ${e.message}`:``))};return n.on(`locationfound`,t),n.on(`locationerror`,r),()=>{n.off(`locationfound`,t),n.off(`locationerror`,r)}},[n,e]);let l=()=>{let e=$e(r);e===`explain`?o(K(`geolocation_insecure`,`Your position is only available over https`)):e===`clear`?c():(i(`locating`),o(null),n.locate({setView:!1,enableHighAccuracy:!0,timeout:1e4}))},u=r===`unavailable`||r===`error`?`IconCurrentLocationOff`:`IconCurrentLocation`;return t.React.createElement(`div`,{className:`locate-control`},t.React.createElement(`div`,{className:`leaflet-bar`},t.React.createElement(`button`,{type:`button`,className:`locate-control__button${r===`locating`?` is-busy`:``}${r===`found`?` is-found`:``}`,onClick:l,title:K(`geolocation`,`Show my position`),"aria-label":K(`geolocation`,`Show my position`),"aria-busy":r===`locating`||void 0},t.React.createElement(Qt,{name:u,size:18,stroke:1.75,"aria-hidden":`true`}),t.React.createElement(`span`,{className:`locate-control__fallback`,"aria-hidden":`true`},`◎`))),a&&t.React.createElement(`div`,{className:`locate-control__message`,role:`status`},a))};tn.propTypes={maxZoom:t.PropTypes.number},G(`/* No margin: Leaflet's stylesheet is not shipped, so this joins the zoom and fullscreen column
   flush, as one toolbar. spatial bundles its own copy of these rules until its 6.0 and appends it
   after this sheet, so that copy wins a tie. */
.measure-control {
    display: inline-flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
    font-size: 12px;
    line-height: 1.35;
    color: #212529;
}

/* Size, ground and hover come from \`.leaflet-bar button\` in toolbar.css; this only lays the tools
   out in a row. */
.measure-control__tools {
    display: inline-flex;
    align-items: stretch;
}

.measure-control__toggle:focus-visible,
.measure-control__tool:focus-visible {
    outline: 2px solid #3399ff;
    outline-offset: -2px;
}

/* A border rather than a fill, so the stroked icon keeps its contrast. Also on \`:hover\`, which
   \`.leaflet-bar button:hover\` would otherwise override. */
.measure-control__tool.is-active,
.measure-control__tool.is-active:hover {
    background-color: #fff3cd;
    box-shadow: inset 0 0 0 2px #ffc400;
    color: #212529;
}

/* The icon comes from perun-core's lazy Tabler chunk and may never arrive; this mark shows only
   when it is the button's sole child. */
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

/* Tabular figures, so the readings line up as a column. */
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
`);var{MEASURE_AREA:nn,MEASURE_RADIUS:rn,MEAUSURE_LENGTH:an}=d,{factory:on}=f,{measure:sn}=m,{useCallback:cn,useEffect:ln,useMemo:un,useRef:dn,useState:fn}=t.React,{Icon:pn}=t.elements,mn={measure:`M`,length:`L`,area:`A`,radius:`R`,angle:`∠`,erase:`⌫`},hn=({icon:e,mark:n})=>t.React.createElement(t.React.Fragment,null,t.React.createElement(pn,{name:e,size:18,stroke:1.75,"aria-hidden":`true`}),t.React.createElement(`span`,{className:`measure-control__fallback`,"aria-hidden":`true`},n));hn.propTypes={icon:t.PropTypes.string.isRequired,mark:t.PropTypes.string};var q={length:{shape:`line`,options:an,icon:`IconRuler2`,fallback:`Length`},area:{shape:`polygon`,options:nn,icon:`IconPolygon`,fallback:`Area`},radius:{shape:`circle`,options:rn,icon:`IconCircleDot`,fallback:`Radius`},angle:{shape:`line`,options:an,icon:`IconAngle`,fallback:`Angle`}},gn=({position:e=`topleft`,tools:n,expanded:r})=>typeof sn?.anglesAlong==`function`&&m.draw?t.React.createElement(ct,{position:e},t.React.createElement(_n,{tools:n,expanded:r})):t.React.createElement(lt,{what:`measurement control`});gn.propTypes={position:t.PropTypes.string,tools:t.PropTypes.array,expanded:t.PropTypes.bool};var _n=({tools:e=[`length`,`area`,`radius`,`angle`],expanded:n=!1})=>{let r=U(),i=un(()=>r.draw??m.draw,[r]),[a,o]=fn(n),[s,c]=fn(null),[l,u]=fn([]),d=un(()=>e.filter(e=>q[e]),[e]),f=dn(null);ln(()=>{let e=on.layerGroup().addTo(r);return f.current=e,()=>{e.clearLayers(),r.removeLayer(e),f.current=null}},[r]);let p=dn({length:0,area:0}),h=s?q[s]:null,g=cn(()=>{Object.values(q).forEach(({shape:e})=>i[e]?.disable(`force`)),c(null)},[i]);ln(()=>{if(!h)return;let e=e=>{let t=e?.layer;if(!t)return;f.current?.addLayer(t);let n=Ze(s,t,p.current,sn);n&&u(e=>[{tool:s,reading:n,at:Date.now()},...e].slice(0,3)),i[q[s].shape]?.isEnabled?.()||c(null)};return r.on(`new_shape`,e),()=>r.off(`new_shape`,e)},[h,s,r,i]),ln(()=>g,[g]);let _=e=>{s===e?g():(g(),c(e),i[q[e].shape]?.enable(q[e].options))},v=()=>{g(),f.current?.clearLayers(),p.current={length:0,area:0},u([])};return d.length?a?t.React.createElement(`div`,{className:`measure-control`},t.React.createElement(`div`,{className:`measure-control__tools leaflet-bar`,role:`group`,"aria-label":K(`measure`,`Measure`)},d.map(e=>t.React.createElement(`button`,{key:e,type:`button`,className:`measure-control__tool${s===e?` is-active`:``}`,onClick:()=>_(e),title:K(e,q[e].fallback),"aria-label":K(e,q[e].fallback),"aria-pressed":s===e},t.React.createElement(hn,{icon:q[e].icon,mark:mn[e]}))),t.React.createElement(`span`,{className:`measure-control__divider`,"aria-hidden":`true`}),t.React.createElement(`button`,{type:`button`,className:`measure-control__tool`,onClick:v,title:K(`erase`,`Clear`),"aria-label":K(`erase`,`Clear`)},t.React.createElement(hn,{icon:`IconEraser`,mark:mn.erase})),t.React.createElement(`button`,{type:`button`,className:`measure-control__tool measure-control__close`,onClick:()=>{v(),o(!1)},title:K(`cancel`,`Close`),"aria-label":K(`cancel`,`Close`),"aria-expanded":`true`},`×`)),l.length>0&&t.React.createElement(`dl`,{className:`measure-control__readout`,"aria-live":`polite`},l.map(({tool:e,reading:n,at:r})=>t.React.createElement(`div`,{className:`measure-control__line`,key:r},t.React.createElement(`dt`,null,K(e,q[e].fallback)),t.React.createElement(`dd`,null,n))))):t.React.createElement(`div`,{className:`measure-control measure-control--closed`},t.React.createElement(`div`,{className:`leaflet-bar`},t.React.createElement(`button`,{type:`button`,className:`measure-control__toggle`,onClick:()=>o(!0),title:K(`measure`,`Measure`),"aria-label":K(`measure`,`Measure`),"aria-expanded":`false`},t.React.createElement(hn,{icon:`IconRulerMeasure`,mark:mn.measure})))):null};_n.propTypes={tools:t.PropTypes.array,expanded:t.PropTypes.bool};var{factory:vn}=f,{useLayoutEffect:yn}=t.React,bn=140,xn=({position:e=`bottomleft`,units:t,ratio:n=!0})=>{let r=U();return yn(()=>{let i=t!==`imperial`,a=vn.control.scale({position:e,metric:i,imperial:!i,maxWidth:bn}).addTo(r);if(!n)return()=>{a.remove()};let o=vn.DomUtil.create(`div`,`atlas-scale-ratio`,a.getContainer()),s=()=>{let e=r.getSize(),t=Math.round(e.y/2),n=Math.min(e.x,bn),i=r.distance(r.containerPointToLatLng(vn.point(0,t)),r.containerPointToLatLng(vn.point(n,t)));o.textContent=Ge(H(i,n))??``};return r.on(`move zoomend`,s),s(),()=>{r.off(`move zoomend`,s),a.remove()}},[r,e,t,n]),null};xn.propTypes={position:t.PropTypes.string,units:t.PropTypes.string,ratio:t.PropTypes.bool},G(`/* Every rung, mark and the handle is a percentage of \`--atlas-zoom-length\`, so a deployment
   retunes the rail with that one variable. */

.atlas-zoom {
  --atlas-zoom-length: 168px;
  --atlas-zoom-axis: 22px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  /* spatial does not ship Leaflet's control margin, so every corner control carries its own. */
  margin: 10px;
  padding: 3px;
  /* Opaque, since every part of it is read against a scale over tiles. */
  background: var(--ap-surface, #ffffff);
  border: 1px solid var(--ap-rule, rgba(0, 0, 0, 0.2));
  border-radius: var(--ap-radius, 3px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
  color: var(--ap-ink, #212529);
}

/* 26px to match spatial's toolbar buttons. Set in full, since a deployment's bare \`button\` rules
   win whatever a class does not claim (see README.md). */
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

/* spatial's \`.control-bottomright button:not(.disabled)\` makes every button there absolute, which
   piles the steps up under the slider; one class more specific undoes it. */
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

/* Set apart from the \`+\`, so it is not taken for a third step; a shadow, so it costs no height. */
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

.atlas-zoom__track {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--atlas-zoom-axis) - 2px);
  width: 4px;
  border-radius: 2px;
  background: var(--ap-rule, #d8dde3);
}

/* \`min-height\`, so a mark with no end still shows as a line. */
.atlas-zoom__mark {
  position: absolute;
  left: calc(var(--atlas-zoom-axis) - 4px);
  width: 8px;
  min-height: 2px;
  border-radius: 2px;
  background: var(--ap-muted, #6c757d);
}

/* Hatched, since the map still works up there and only stops gaining detail. Lifted above a
   screen's own bands, which are drawn after it and would bury it. */
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

/* Positioned off the rung, so the type can change size without moving the level it names;
   tabular figures keep the column from stepping sideways at ten. */
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

/* Rotated rather than a vertical spelling (see ZoomRail.jsx), at the rail's length so their travel
   matches. The track is transparent because the rail draws its own. */
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

/* Clipped rather than hidden, which would take it out of the accessibility tree. */
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

/* The viewport rather than the map's height, which CSS cannot ask here; it catches a small screen. */
@media (max-height: 640px) {
  .atlas-zoom {
    --atlas-zoom-length: 104px;
  }
}
`);var{useEffect:Sn,useMemo:Cn,useState:wn}=t.React,Tn={in:`Zoom in`,out:`Zoom out`,level:`Zoom level`,upscaled:`Above here the basemap is enlarged, not sharper`,fit:`Zoom to the data`},En=0,Dn=e=>`${(e*100).toFixed(4)}%`,On=({position:e=`bottomright`,marks:n=[],labels:r,onFit:i})=>{let a={...Tn,...r},o=U(),[s]=wn(()=>(En+=1,`atlas-zoom-marks-${En}`)),[c,l]=wn(()=>({min:o.getMinZoom(),max:o.getMaxZoom()})),[u,d]=wn(()=>o.getZoom());Sn(()=>{let e=()=>d(o.getZoom()),t=()=>{l({min:o.getMinZoom(),max:o.getMaxZoom()}),e()};return o.on(`zoomend`,e),o.on(`zoomlevelschange`,t),t(),()=>{o.off(`zoomend`,e),o.off(`zoomlevelschange`,t)}},[o]);let{min:f,max:p}=c,m=Cn(()=>Ve(f,p),[f,p]),h=Cn(()=>He(n,f,p),[n,f,p]),g=Math.round(u),_=h.filter(e=>e.label).map(e=>e.label).join(`. `),v=t.React.createElement(`div`,{className:`atlas-zoom`},i&&t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step atlas-zoom__fit`,onClick:i,title:a.fit,"aria-label":a.fit},t.React.createElement(W,{name:`zoom-scan`})),t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step`,onClick:()=>o.zoomIn(),disabled:g>=p,title:a.in,"aria-label":a.in},t.React.createElement(W,{name:`plus`})),m.length>1&&t.React.createElement(`div`,{className:`atlas-zoom__rail`},t.React.createElement(`div`,{className:`atlas-zoom__track`}),h.map(e=>t.React.createElement(`span`,{key:`${e.kind??`mark`}-${e.from}-${e.to}`,className:`atlas-zoom__mark atlas-zoom__mark--${e.kind??`plain`}`,style:{bottom:Dn(e.offset),height:Dn(e.span)},title:e.label})),m.map(e=>t.React.createElement(`span`,{key:e.zoom,className:[`atlas-zoom__rung`,e.labelled?`atlas-zoom__rung--numbered`:``,e.zoom===g?`atlas-zoom__rung--here`:``].filter(Boolean).join(` `),style:{bottom:Dn(e.offset)}},e.labelled?t.React.createElement(`i`,{className:`atlas-zoom__number`},e.zoom):null)),t.React.createElement(`input`,{type:`range`,className:`atlas-zoom__slider`,min:f,max:p,step:1,value:Math.min(Math.max(g,f),p),onChange:e=>o.setZoom(Number(e.target.value)),"aria-label":a.level,"aria-describedby":_?s:void 0}),_?t.React.createElement(`p`,{className:`atlas-zoom__described`,id:s},_):null),t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step`,onClick:()=>o.zoomOut(),disabled:g<=f,title:a.out,"aria-label":a.out},t.React.createElement(W,{name:`minus`})),t.React.createElement(`output`,{className:`atlas-zoom__level`,title:a.level},g));return t.React.createElement(ct,{position:e},t.React.createElement(`div`,{className:`atlas-zoom__host`,ref:ut},v))};On.propTypes={position:t.PropTypes.string,marks:t.PropTypes.array,labels:t.PropTypes.object,onFit:t.PropTypes.func};var{factory:kn}=f,{useEffect:An,useLayoutEffect:jn,useRef:Mn}=t.React,Nn=({position:e=`bottomright`,fit:t=!0,extent:n=null,labels:r})=>{let i=U(),a=r?.fit??Tn.fit,o=Mn(n);o.current=n;let s=Mn(null);return jn(()=>{let n=kn.control.zoom({position:e,zoomInText:pt(`plus`),zoomOutText:pt(`minus`)}).addTo(i);if(t){let e=n.getContainer(),t=kn.DomUtil.create(`a`,`atlas-fit`);t.href=`#`,t.title=a,t.setAttribute(`role`,`button`),t.setAttribute(`aria-label`,a),t.innerHTML=pt(`zoom-scan`),t.style.display=o.current?``:`none`,kn.DomEvent.disableClickPropagation(t),kn.DomEvent.on(t,`click`,kn.DomEvent.stop),kn.DomEvent.on(t,`click`,()=>{o.current&&i.fitBounds(o.current,{padding:Ke})}),e.insertBefore(t,e.firstChild),s.current=t}return()=>{n.remove(),s.current=null}},[i,e,t,a]),An(()=>{s.current&&(s.current.style.display=n?``:`none`)},[n]),null};Nn.propTypes={position:t.PropTypes.string,fit:t.PropTypes.bool,extent:t.PropTypes.array,labels:t.PropTypes.object},G(`/* spatial's corners take Leaflet's \`pointer-events: none\` but not the \`auto\` that gives the
   controls their clicks back. Can go once spatial's control.css carries it. */
.leaflet-control {
  pointer-events: auto;
}

/* Leaflet floats controls, but spatial does not ship that sheet, so a control stretches to its
   corner and a narrow one grows to match its neighbour. Also in spatial's control.css now. */
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

/* Inside the scale control's container, so it shares its placement. Styled to match the bar, whose
   rules do not reach a sibling; tabular figures so its width holds still as the map moves. */
.atlas-scale-ratio {
  padding: 1px 5px 0;
  font: 11px/1.3 system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
  color: #333;
  background: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  text-indent: 0;
}

.atlas-scale-ratio:empty {
  display: none;
}

/* Both classes, to outrank spatial's \`.leaflet-bar a\` and \`.leaflet-control-zoom-in\`. A grid,
   because an icon has no baseline to centre on. */
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

/* The fullscreen plugin only toggles \`leaflet-fullscreen-on\`, so both glyphs are in the button. */
.leaflet-bar a.leaflet-control-zoom-fullscreen .atlas-icon--minimize,
.leaflet-bar a.leaflet-control-zoom-fullscreen.leaflet-fullscreen-on .atlas-icon--maximize {
  display: none;
}

.leaflet-bar a.leaflet-control-zoom-fullscreen.leaflet-fullscreen-on .atlas-icon--minimize {
  display: block;
}
`);var{useEffect:Pn,useMemo:Fn,useRef:In,useState:Ln}=t.React,Rn=async(e,t,n,r)=>{let{basemap:i,overlays:a,catalogue:o}=await Ce(e,{maxZoom:n.maxZoom});if(o===`ok`)return{basemap:i,overlays:a,notice:null};let s=t.getCRS?.()?.code,c=Ee(n.fallbackBasemap,{crs:s,maxZoom:n.maxZoom});return{basemap:c.layer?{...i,[V(`basemapDefaultGroup`,r)]:{[c.name]:c.layer}}:i,overlays:a,notice:Fe(o,c,s)}},zn=(e,t)=>Object.values(e??{}).forEach(e=>Object.values(e).forEach(t)),Bn=({session:e,overrides:n,layerSwitcher:r=!1,zoomControl:i=!0,zoomPosition:a=`bottomright`,zoomMarks:o,zoomLabels:s,fit:c=!0,extent:l=null,view:u=null,coordinates:d=!0,coordinatesPosition:p=`bottomcenter`,measure:m=!0,measurePosition:h=`topleft`,measureTools:g,fullscreen:_=!0,fullscreenPosition:v=`topleft`,locate:y=!0,locatePosition:b=`topleft`,scale:x=!0,scalePosition:S=`bottomleft`,scaleRatio:C=!0,noticeLabels:w,className:T=`atlas-map`,style:ee,onReady:E,onError:D,children:O})=>{let k=In(null),A=In(null),[j,te]=Ln(null),[ne,M]=Ln(null),N=ne!==null,[P,F]=Ln(null),[re,ie]=Ln(null),[I,L]=Ln(null),[oe,se]=Ln(!1),[ce,le]=Ln(0);Pn(()=>{let t=!1;if(typeof f.createMap!=`function`){let e=Error(`perun-atlas: this map needs spatial 4.2.1 or later, which builds a map per screen with createMap. The spatial on this page has no createMap, so no map is shown.`);e.engine=!0,F(e),D?.(e)}else return(async()=>{try{let r=await de(n);if(t)return;ae(r);let i=document.createElement(`div`);i.style.height=`100%`,i.style.width=`100%`,k.current?.appendChild(i);let a=f.createMap(i,{center:u?.center??r.center,zoom:u?.zoom??r.zoom,minZoom:r.minZoom,maxZoom:r.maxZoom});A.current=a,te({map:a,config:r});let{basemap:o,overlays:s,notice:c}=await Rn(e,a,r,w);if(t)return;let l=Oe(o,u?.basemap)??De(o);l&&l.addTo(a);let d=e=>ie(e?.options?.maxNativeZoom??null);d(l),a.on(`baselayerchange`,e=>d(e.layer)),a.invalidateSize(),E?.({map:a,config:r,basemap:o,overlays:s}),L(c),M({basemap:o,overlays:s})}catch(e){if(t)return;console.error(e),F(e),D?.(e)}})(),()=>{t=!0;let e=A.current;if(A.current=null,e){let t=e.getContainer();e.remove(),e.off(),t.parentNode?.removeChild(t)}}},[ce]);let ue=()=>{F(null),te(null),M(null),ie(null),L(null),le(e=>e+1)},fe=async()=>{let{map:t,config:n}=j;se(!0);let r=await Rn(e,t,n,w);if(A.current!==t||(se(!1),r.notice?.unreachable))return;zn(ne.basemap,e=>t.removeLayer(e));let i=De(r.basemap);i&&i.addTo(t),ie(i?.options?.maxNativeZoom??null),L(r.notice),M({basemap:r.basemap,overlays:r.overlays})};Pn(()=>{let e=k.current;if(!e||typeof ResizeObserver>`u`)return;let t=null,n=new ResizeObserver(e=>{let n=e[0]?.contentRect;n&&n.width!==0&&n.height!==0&&(t!==null&&cancelAnimationFrame(t),t=requestAnimationFrame(()=>{t=null,A.current?.invalidateSize()}))});return n.observe(e),()=>{t!==null&&cancelAnimationFrame(t),n.disconnect()}},[N]);let pe=Fn(()=>[...re===null?[]:[{from:re,to:1/0,kind:`upscaled`,label:s?.upscaled??Tn.upscaled}],...o??[]],[re,o,s]);if(P){let e=Me(P),n=Ne[e.kind];return t.React.createElement(`div`,{className:`${T} atlas-map-error`,style:{height:`100%`,...ee}},t.React.createElement(Ct,{icon:n.icon,title:V(n.title,w),hint:V(n.hint,w),rows:e.rows,details:e.rows.length?null:P.message,copy:[P.message,window.server&&`Server: ${window.server}`].filter(Boolean).join(`

`),onRetry:e.retry?ue:void 0,labels:w}))}let me=j?.config;return t.React.createElement(Ye.Provider,{value:j?.map??null},t.React.createElement(`div`,{ref:k,className:T,style:{height:`100%`,...ee}}),j&&t.React.createElement(t.React.Fragment,null,_&&t.React.createElement(Vt,{position:v}),y&&t.React.createElement(en,{position:b}),t.React.createElement(Et,{credit:me.attribution}),i&&i!==`rail`&&t.React.createElement(Nn,{position:a,fit:c,extent:l,labels:s}),x&&t.React.createElement(xn,{position:S,units:me.units,ratio:C}),d&&t.React.createElement(Lt,{position:p}),m&&t.React.createElement(gn,{position:h,tools:g})),N&&r&&t.React.createElement(Wt,{basemap:ne.basemap,overlays:ne.overlays,note:I?.kind===`fallback`&&!I.unreachable?V(`basemapDefaultNote`,w):void 0}),N&&I&&t.React.createElement(ht,{key:`${I.kind}-${I.unreachable}`,notice:I,labels:w,reloading:oe,onRetry:I.unreachable?fe:void 0}),N&&i===`rail`&&t.React.createElement(On,{position:a,marks:pe,labels:s,onFit:c&&l?()=>j.map.fitBounds(l,{padding:Ke}):void 0}),N&&O)},{geobuf:Vn,Pbf:Hn}=p,Un=(e,t,n)=>{window.PERUN_ATLAS_LAST=n,console.groupCollapsed(`perun-atlas: ${n.features.length} feature(s), ${t} bytes — ${e}`),console.log(`collection`,n),console.log(`also at window.PERUN_ATLAS_LAST`),console.groupEnd()},Wn=async(e,n={})=>{let r=`${window.server}${B(e,n)}`,i=await(0,t.axios)({method:`get`,url:r,responseType:`arraybuffer`}),a=i?.data?.byteLength??0;if(!i?.data||a===0){let e={type:`FeatureCollection`,features:[]};return Un(r,a,e),e}let o=Vn.decode(new Hn(new Uint8Array(i.data)));if(!o||!o.type){console.warn(`perun-atlas: response from ${r} decoded to no GeoJSON type; treating as empty`),console.warn(`perun-atlas: response body was`,new TextDecoder().decode(i.data).slice(0,500));let e={type:`FeatureCollection`,features:[]};return Un(r,a,e),e}let s=o.type===`FeatureCollection`?o:{type:`FeatureCollection`,features:[o]};return Un(r,a,s),s},Gn=(e,t,{featureKey:n,rowKey:r,as:i=`status`})=>{let a=z(r),o=z(n),s=new Map((t??[]).map(e=>[String(a(e)),e]));return{...e,features:(e?.features??[]).map(e=>{let t=s.get(String(o(e?.properties)));return t?{...e,properties:{...e.properties,[i]:t}}:e})}},Kn=[`DESCRIPTOR`,`pkid`,`parent_id`,`type`,`status`],qn={weight:1,opacity:1,color:`#4A5C66`,fillOpacity:.55,fillColor:`#B8C6CC`},Jn=(e={},t={})=>({...qn,...e.style,...t}),Yn=(e,t)=>e||t?{...e,...t}:void 0,Xn=(e,t)=>{let n=e?.variants;if(!n?.by)return e;let r=n.cases?.[t?.properties?.[n.by]];return r?{...e,...r,style:Yn(e.style,r.style),marker:Yn(e.marker,r.marker),label:Yn(e.label,r.label),popup:Yn(e.popup,r.popup),arrow:Yn(e.arrow,r.arrow)}:e},Zn=(e,t)=>{let n=e?.label?.scale;if(!n)return!1;let{min:r=0,max:i=24}=n;return t>=r&&t<=i},Qn=(e,t)=>{let n=e?.label?.field;if(!n)return null;let r=t?.properties?.[n];return r==null?null:String(r)},$n=(e,t)=>{let n=e=>{let n=e?t?.properties?.[e]:void 0;return n==null||n===``?null:String(n)};return n(e?.label?.field)??n(e?.popup?.title)??n(e?.details?.title)},er=(e,t,n)=>{let r=e?.popup;if(!r)return null;let i=e=>{let n=t?.properties?.[e];return n==null||n===``?null:String(n)},a=r.title?i(r.title):null,o=(r.fields??[]).map(({label:e,field:t})=>({label:e&&n?.(e)||e||t,value:i(t)})).filter(e=>e.value!==null);return a===null&&o.length===0?null:{title:a,rows:o}},tr=(e,t,n)=>{let r=e?.details;if(!r)return null;let i=t?.properties??{},a=new Set([...Kn,...r.exclude??[]]),o=e=>e==null||e===``?null:String(e),s=r.title?o(i[r.title]):null,c=Object.entries(i).filter(([e,t])=>!a.has(e)&&e!==r.title&&(typeof t!=`object`||!t)).map(([e,t])=>({field:e,label:n?.(e.toLowerCase())||e,value:o(t)})).filter(e=>e.value!==null);return s===null&&c.length===0?null:{title:s,rows:c,spec:r}},nr=`::`,rr=(e=[],t=[])=>e.length>=2||e.some(e=>t.includes(e.key)),ir=(e,t)=>`${e??``}${nr}${t??``}`,ar=`${nr}fallback`,or=`${nr}file`,sr=(e,t,n)=>{let r=t?.variants?.by,i=r?n?.properties?.[r]:void 0,a=i!==void 0&&t?.variants?.cases?.[i]?i:void 0;return{name:e,value:a,key:ir(e,a)}},cr=({descriptors:e,nameOf:t})=>{let n=new WeakMap,r=r=>{if(n.has(r))return n.get(r);let i=Xn(e[t(r)],r);return n.set(r,i),i},i=n=>{let r=t(n);return sr(r,e[r],n)},a=new Map;return{entryFor:r,kindOf:i,note:e=>{let{name:t,value:n,key:o}=i(e);return a.has(o)||a.set(o,{name:t,value:n,descriptor:r(e),geometry:e?.geometry?.type}),o},drawn:()=>[...a.values()]}},lr=(e=``)=>/Point$/.test(e)?`point`:/LineString$/.test(e)?`line`:`area`,ur=({name:e,value:t,descriptor:n},r)=>{let i=n?.legend;if(i){let e=r?.(i);if(e)return e}let a=t??e;return a==null||a===``?``:r?.(String(a).toLowerCase())||String(a)},dr=(e,t)=>{let n=lr(e.geometry),r=e.descriptor??{};return{key:ir(e.name,e.value),label:ur(e,t),kind:n,path:Jn(r),marker:n===`point`?r.marker??{}:null,arrow:n===`line`?r.arrow??null:null}},fr=(e=[],t)=>e.map(e=>dr(e,t)).filter(e=>e.label!==``),pr=({palette:e={},values:t=[],fallback:n,usedFallback:r=!1,unknownLabel:i=`unknown`}={},a)=>{let o=e=>({...qn,color:e,fillColor:e,fillOpacity:.7}),s=t.filter(t=>Object.prototype.hasOwnProperty.call(Object(e),t)&&e[t]).map(t=>({key:String(t),label:a?.(String(t).toLowerCase())||String(t),kind:`area`,path:o(e[t]),marker:null,arrow:null}));return!r||!n?s:[...s,{key:ar,label:a?.(i)||`Not classified`,kind:`area`,path:o(n),marker:null,arrow:null}]},mr={__unknown:`#B8C6CC`},hr=(e,t)=>Object.prototype.hasOwnProperty.call(Object(e),t)&&!!e[t],gr=({field:e,palette:t=mr,fallback:n=mr.__unknown})=>{let r=new Set,i=z(e),a=e=>i(e?.properties);return i=>{let o=a(i);return o==null?n:hr(t,o)?t[o]:(r.has(o)||(r.add(o),console.warn(`perun-atlas: no palette entry for ${e}="${o}"`)),n)}},_r=(e=[],{field:t,palette:n=mr}={})=>{let r=z(t),i=e=>r(e?.properties),a=new Set,o=[],s=!1;return e.forEach(e=>{let t=i(e);t==null?s=!0:(hr(n,t)||(s=!0),!a.has(t)&&(a.add(t),o.push(t)))}),{values:o,usedFallback:s}},vr=({field:e,palette:t=mr}={})=>{let n=z(e);return e=>{let r=n(e?.properties);return r!=null&&hr(t,r)?String(r):ar}},{useEffect:yr,useRef:br}=t.React,xr=e=>{let t=br(e);t.current=e;let n=br(null);return yr(()=>{n.current?.(e)},[JSON.stringify(e)]),{hiddenRef:t,filterRef:n}},Sr=(e,t=[])=>{let n=new Set(t),r=[],i=[];return e.forEach(e=>{let t=n.has(e.key);t!==!!e.hidden&&(e.hidden=t,(t?r:i).push(e))}),{leaving:r,returning:i}},Cr=(e,t)=>{let n=e.filter(({hidden:e})=>!e);n.forEach(({layer:e})=>e.bringToFront?.()),n.forEach(({layer:e})=>t?.get(e)?.bringToFront?.())},wr=(e,t=[],n)=>{let r=e?.features;if(!Array.isArray(r)||!t.length)return e;let i=new Set(t),a=r.filter(e=>!i.has(n(e)));return a.length===r.length?e:{...e,features:a}},Tr=e=>{let t=e.filter(e=>!e.hidden),n=1/0,r=1/0,i=-1/0,a=-1/0,o=({lat:e,lng:t})=>{n=Math.min(n,e),r=Math.min(r,t),i=Math.max(i,e),a=Math.max(a,t)};return(t.length?t:e).forEach(({layer:e})=>{if(typeof e.getBounds==`function`){let t=e.getBounds();t?.isValid?.()&&(o(t.getSouthWest()),o(t.getNorthEast()))}else typeof e.getLatLng==`function`&&o(e.getLatLng())}),n===1/0?null:[[n,r],[i,a]]},Er=({title:e,rows:t},n={})=>{let r=document.createElement(`div`);if(r.className=[`atlas-popup`,n.className].filter(Boolean).join(` `),gt(r,n.style),e){let t=document.createElement(`p`);t.className=`atlas-popup-title`,t.textContent=e,gt(t,n.titleStyle),r.appendChild(t)}if(t.length){let e=document.createElement(`dl`);e.className=`atlas-popup-fields`,t.forEach(({label:t,value:r})=>{let i=document.createElement(`dt`);i.textContent=t,gt(i,n.labelStyle);let a=document.createElement(`dd`);a.textContent=r,gt(a,n.valueStyle),e.append(i,a)}),r.appendChild(e)}return r},Dr=(e,t,{popup:n,labelResolver:r}={})=>{if(n){let t=n(e);return t==null?null:_t(t)}let i=er(t,e,r);return i?Er(i,t?.popup):null},Or={className:`atlas-popup-shell`,maxWidth:280},{factory:kr}=f,{useEffect:Ar,useRef:jr}=t.React,Mr=[],Nr=({servicePath:e,context:t,reload:n,srid:r,statusRows:i,join:a,field:o,palette:s,fallback:c,descriptor:l,hidden:u=Mr,onFeatureClick:d,onLegend:f,onShown:p,onLoadStart:m,onLoad:h,onError:g,tooltip:_,popup:v,labelResolver:y})=>{let b=U(),x=jr(null),S=jr(0),{hiddenRef:C,filterRef:w}=xr(u);return Ar(()=>{let n=!1,u=gr({field:o,palette:s,fallback:c}),T=vr({field:o,palette:s}),E=async()=>{let c=++S.current;O={zoom:b.getZoom(),bounds:b.getBounds()};try{m?.();let g=await Wn(e,{...t||{},map:{...t?.map||{},bbox:ee(r,b)}});if(n||c!==S.current)return;let E=a&&i?Gn(g,i,a):g;x.current&&b.removeLayer(x.current);let D=[],O=kr.geoJSON(E,{crs:b.getCRS(),style:e=>Jn(l,{fillColor:u(e)}),onEachFeature:(e,t)=>{D.push({layer:t,feature:e,key:T(e),hidden:!1});let n=_?.(e);n&&t.bindTooltip(_t(n),{sticky:!0});let r=Dr(e,l,{popup:v,labelResolver:y});r&&t.bindPopup(r,Or),d&&t.on(`click`,()=>d(e,tr(l,e,y)))}}),k=e=>{let{leaving:t,returning:n}=Sr(D,e);return t.forEach(({layer:e})=>O.removeLayer(e)),n.forEach(({layer:e})=>O.addLayer(e)),n.length&&Cr(D),t.length>0||n.length>0};k(C.current),x.current=O.addTo(b);let A=e=>p?.(wr(E,e,T));w.current=e=>{k(e)&&A(e)},f?.(_r(E?.features,{field:o,palette:s})),A(C.current),h?.(E)}catch(e){console.error(`perun-atlas: choropleth failed to render`,e),!n&&c===S.current&&g?.(e)}},D=null,O=null,k=()=>!!O&&b.getZoom()===O.zoom&&O.bounds.contains(b.getBounds()),A=()=>{clearTimeout(D),D=setTimeout(()=>{k()||E()},250)};return E(),b.on(`moveend`,A),()=>{n=!0,w.current=null,clearTimeout(D),b.off(`moveend`,A),x.current&&(b.removeLayer(x.current),x.current=null)}},[b,e,o,r,n,i,JSON.stringify(t??{})]),null};G(`.atlas-panel__draw {
  /* Its own row, so the save button sits at the end of the shape's controls. */
  flex-basis: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.atlas-panel__drawhint {
  flex-basis: 100%;
  margin: 0;
  font: var(--ap-label-font, 500 11px/1.4 system-ui, sans-serif);
  color: var(--ap-muted, #6b6f7a);
}

/* The border is on the box, so the number and its unit read as one measurement; \`:focus-within\`
   draws the ring the input no longer does. */
.atlas-panel__drawfield {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  /* Set in full: the registries' bare \`label\` rule comes later, and its inherited \`text-indent\`
     pulled the unit fifteen pixels over the number. */
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

/* Drawn on the box, since the input no longer has a border (see \`box\` in DrawBar). */
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
  text-align: end;
}

.atlas-panel__drawbox input:focus,
.atlas-panel__drawbox input:focus-visible {
  outline: none;
}

/* No steppers: a deployment's sheet cannot reach them, and at a step of 100 they lose the reader's
   value. Arrow keys still step. */
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

/* Grows from a floor, which rather than a width decides when the row wraps. */
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

/* \`0 1 auto\`, since a form that grows takes the whole line; \`min-width: 0\` so it still shrinks when
   the row wraps. Laying the fields along the row is in \`form.css\`. */
.atlas-panel__drawform {
  flex: 0 1 auto;
  min-width: 0;
}

.atlas-panel__drawform .rjsf {
  margin: 0;
}

/* \`display: contents\` drops RJSF's grouppath wrappers, blocks that put each group on its own line.
   Fine only because the titles are hidden (see \`form.css\`) and every field keeps its label. */
.atlas-panel__drawform .rjsf fieldset .form-group.field-object,
.atlas-panel__drawform .rjsf fieldset fieldset {
  display: contents;
}

/* The registries' bare \`label\` rule makes a label 16px over a 37px control. These rules name the
   draw row alone, since the deployment already styles the date filter. */
.atlas-panel__drawform .rjsf label {
  display: block;
  margin: 0 0 2px;
  padding: 0;
  text-indent: 0;
  font: var(--ap-label-font, 500 11px/1.4 system-ui, sans-serif);
  color: var(--ap-muted, #6b6f7a);
}

/* The same border, radius, ground and font as \`.atlas-panel__drawbox\`, from the same tokens. */
.atlas-panel__drawform .rjsf input,
.atlas-panel__drawform .rjsf select,
.atlas-panel__drawform .rjsf textarea {
  height: auto;
  /* As wide as what it holds, not a page column. */
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

/* The app's form sheet underlines \`.form-control\` in green with \`!important\`, which only
   \`!important\` reaches. Draw row only; the date filter is the deployment's. */
.atlas-panel__drawform .rjsf input,
.atlas-panel__drawform .rjsf select,
.atlas-panel__drawform .rjsf textarea {
  border-bottom: 1px solid var(--ap-rule, #d8dde3) !important;
}

/* A text area sized for a record form fills most of the row before anything is typed. */
.atlas-panel__drawform .rjsf textarea {
  min-height: 2.6em;
  resize: vertical;
}

/* Some deployments lay a form group out as a table box, which shrink-wraps to its longest error
   message. Draw row only. */
.atlas-panel__drawform .rjsf .form-group {
  display: block;
}

.atlas-panel__drawform .rjsf .error-detail {
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
  font: var(--ap-label-font, 500 11px/1.4 system-ui, sans-serif);
}

/* Tabular figures, so the count does not shift sideways while a radius is being typed. */
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

/* Square for the edge, round for the centre, so the two are told apart at a glance. */
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
`);var{factory:Pr}=f,{useEffect:Fr,useRef:Ir}=t.React,Lr=(e,...t)=>t.forEach(t=>{t.current&&(e.removeLayer(t.current),t.current=null)}),Rr={color:`#b3261e`,weight:2,opacity:.95,fillColor:`#b3261e`,fillOpacity:.12},zr={...Rr,dashArray:`5 4`,fillOpacity:.06},Br=({value:e,drawing:t=!1,onChange:n,onDrawn:r,style:i,editable:a=!0})=>{let o=U(),s=Ir(null),c=Ir(null),l=Ir(null),u=Ir(n);u.current=n;let d=Ir(r);return d.current=r,Fr(()=>{let e=(o.draw??m?.draw)?.circle;if(!t||!e){!t&&e?.isEnabled?.()&&e.disable(),t&&!e&&console.warn(`perun-atlas: the engine on this environment has no circle draw tool; skipping it.`);return}let n=({shape:e,layer:t})=>{if(e!==`circle`||!t)return;let n=t.getLatLng(),r=t.getRadius();o.removeLayer(t);let i={lat:n.lat,lng:n.lng,radius:r};u.current?.(i),d.current?.(i)};return o.on(`new_shape`,n),e.enable({templineStyle:zr,hintlineStyle:{...zr,fillOpacity:0},pathOptions:{...Rr,...i},cursorMarker:!0,tooltips:!1}),()=>{o.off(`new_shape`,n),e.isEnabled?.()&&e.disable()}},[o,t]),Fr(()=>{if(!e||!(e.radius>0)){Lr(o,s,c,l);return}let t=Pr.latLng({lat:e.lat,lng:e.lng});if(s.current?(s.current.setLatLng(t),s.current.setRadius(e.radius)):s.current=Pr.circle(t,{...Rr,...i,radius:e.radius,showMeasurements:!0,interactive:!1}).addTo(o),!a){Lr(o,c,l);return}let n=Pr.latLng({lat:t.lat,lng:s.current.getBounds().getEast()});c.current?c.current.setLatLng(t):(c.current=Pr.marker(t,{icon:Pr.divIcon({className:`atlas-draw-handle atlas-draw-handle--centre`,html:``}),draggable:!0,zIndexOffset:1e3}).addTo(o),c.current.on(`drag`,e=>{let t=e.target.getLatLng();u.current?.({lat:t.lat,lng:t.lng,radius:s.current?.getRadius()})})),l.current?l.current.setLatLng(n):(l.current=Pr.marker(n,{icon:Pr.divIcon({className:`atlas-draw-handle atlas-draw-handle--edge`,html:``}),draggable:!0,zIndexOffset:1e3}).addTo(o),l.current.on(`drag`,e=>{let n=e.target.getLatLng(),r=c.current?.getLatLng()??t;u.current?.({lat:r.lat,lng:r.lng,radius:o.distance(r,n)})}))},[o,e?.lat,e?.lng,e?.radius,a]),Fr(()=>()=>Lr(o,s,c,l),[o]),null};G(`/* Imported by \`DateRange\` and \`DrawBar\`, so either one alone still lays its fields along a row. */

.atlas-date-range .rjsf {
  margin-bottom: 8px;
}

/* The fieldset is the flex container: RJSF wraps every field in one, so flexing \`.rjsf\` changes
   nothing. A descendant selector, since a grouppath nests a fieldset of its own. */
.atlas-date-range .rjsf fieldset,
.atlas-panel__drawform .rjsf fieldset {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 6px 12px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

/* RJSF renders titles as legends, which a fieldset takes out of flow onto a line of their own. */
.atlas-date-range .rjsf legend,
.atlas-panel__drawform .rjsf legend {
  display: none;
}

/* RJSF's per-field bottom margin makes a ragged baseline in a row; the gap does the spacing. */
.atlas-date-range .rjsf .form-group,
.atlas-panel__drawform .rjsf .form-group {
  margin-bottom: 0;
}
`);var{useMemo:Vr}=t.React,Hr=({from:e,to:n,onChange:r,labels:i={},disabled:a=!1,className:o=`atlas-date-range`})=>{let s=Vr(()=>({type:`object`,properties:{from:{type:`string`,format:`date`,title:i.from??`From`},to:{type:`string`,format:`date`,title:i.to??`To`}}}),[i.from,i.to]),c=Vr(()=>({"ui:order":[`from`,`to`],"ui:submitButtonOptions":{norender:!0},from:{"ui:disabled":a},to:{"ui:disabled":a}}),[a]);return t.React.createElement(`div`,{className:o},t.React.createElement(t.Form,{idPrefix:`atlas-range`,schema:s,uiSchema:c,formData:{from:e,to:n},validator:t.validator,customValidate:(e,t)=>(e?.from&&e?.to&&e.from>e.to&&t.to.addError(i.invalidRange??`The end date is before the start date.`),t),liveValidate:!0,showErrorList:!1,noHtml5Validate:!0,onChange:({formData:e})=>r?.(e)},t.React.createElement(t.React.Fragment,null)))},{Icon:Ur}=t.elements,{useState:Wr}=t.React,Gr=({drawing:e,busy:n,onStart:r,onCancel:i,labels:a={}})=>t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn ${e?`atlas-panel__btn--primary`:`atlas-panel__btn--ghost`}`,"aria-pressed":e,onClick:e?i:r,disabled:n},t.React.createElement(Ur,{name:`IconCircleDashed`,size:16,stroke:1.75,"aria-hidden":`true`}),a.draw??`Draw an area`),Kr=e=>`atlas-panel__drawbox${e?` atlas-panel__drawbox--off`:``}`,qr=0,Jr=()=>`atlas-draw-${qr+=1}`,Yr=({shape:e,drawing:n,busy:r,onCancel:i,onRadius:a,onSave:o,note:s,form:c,caught:l,savable:u=!0,limits:d={},labels:f={}})=>{let{min:p=50,max:m=5e5,step:h=50}=d,g=!!e,[_]=Wr(Jr),v=`${_}-form`,y=!!c?.schema,b=r||!g||s?.required&&!String(s.value??``).trim()||!(!c||c.schema),x=()=>{!b&&u&&o?.()};return t.React.createElement(`div`,{className:`atlas-panel__draw`,role:`group`,"aria-label":f.draw??`Draw`},n&&!g&&t.React.createElement(`p`,{className:`atlas-panel__drawhint`},f.drawing??`Click a centre, then an edge`),g&&t.React.createElement(`label`,{className:`atlas-panel__drawfield`},t.React.createElement(`span`,null,f.radius??`Radius`),t.React.createElement(`span`,{className:Kr(r)},t.React.createElement(`input`,{type:`number`,inputMode:`numeric`,value:Math.round(e.radius),min:p,max:m,step:h,disabled:r,onChange:e=>{let t=Number(e.target.value);Number.isFinite(t)&&t>0&&a(t)}}),t.React.createElement(`span`,{className:`atlas-panel__drawunit`},f.metres??`m`))),g&&c&&!c.schema&&t.React.createElement(`p`,{className:`atlas-panel__drawhint`},c.loading?f.formLoading??`Loading the fields…`:f.formFailed??`These fields did not load, so there is nothing to save into.`),g&&c?.schema&&t.React.createElement(`div`,{className:`atlas-panel__drawform`},t.React.createElement(t.Form,{id:v,idPrefix:_,schema:c.schema,uiSchema:{"ui:submitButtonOptions":{norender:!0},...c.uiSchema},formData:c.data,validator:t.validator,disabled:r,liveValidate:!1,showErrorList:!1,onChange:({formData:e})=>c.onChange?.(e),onSubmit:x},t.React.createElement(t.React.Fragment,null))),g&&s&&t.React.createElement(`label`,{className:`atlas-panel__drawfield atlas-panel__drawfield--wide`},t.React.createElement(`span`,null,f.note??`Note`),t.React.createElement(`span`,{className:Kr(r)},t.React.createElement(`input`,{type:`text`,value:s.value??``,disabled:r,placeholder:f.notePlaceholder??``,onChange:e=>s.onChange(e.target.value)}))),g&&l&&t.React.createElement(`p`,{className:`atlas-panel__drawcount`,"aria-live":`polite`},t.React.createElement(`b`,null,l.count),t.React.createElement(`span`,null,f.caught??`inside`),t.React.createElement(`span`,{className:`atlas-panel__drawtotal`},`/ ${l.total}`)),g&&t.React.createElement(`div`,{className:`atlas-panel__drawactions`},u&&t.React.createElement(`button`,{type:y?`submit`:`button`,form:y?v:void 0,className:`atlas-panel__btn atlas-panel__btn--primary`,onClick:y?void 0:x,disabled:b},t.React.createElement(Ur,{name:`IconDeviceFloppy`,size:16,stroke:1.75,"aria-hidden":`true`}),f.save??`Save`),t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:i,disabled:r},f.discard??`Discard`)))},Xr=e=>e?.properties?.DESCRIPTOR??e?.properties?.descriptor??null,Zr=e=>({id:e?.id??e?.properties?.OBJECT_ID??null,parentId:e?.properties?.parent_id??e?.properties?.PARENT_ID??null}),Qr=(e,t,n=`id`)=>{if(t==null)return!1;let r=Zr(e),i=n===`parent`?r.parentId:r.id;return i!=null&&String(i)===String(t)},$r=({lat:e,lng:t})=>`${e.toFixed(6)},${t.toFixed(6)}`,ei=(e,t,n)=>{let r=e.original.map(e=>{let r=t[$r(e)];if(!r)return e;let i=n(r);return i&&i!==r?i.getLatLng():e}),i=r.map($r).join(` `);return i===e.key?null:{next:r,key:i}},ti=e=>e<.5?4*e*e*e:1-(-2*e+2)**3/2,ni=(e,t,n)=>t.map((t,r)=>{let i=e[r];return i?{lat:i.lat+(t.lat-i.lat)*n,lng:i.lng+(t.lng-i.lng)*n}:t}),ri=e=>Array.isArray(e?.[0])?e.map(ri).reverse():[...e??[]].reverse(),ii=({factory:e,group:t,into:n,arrowOf:r})=>{let i=new WeakMap;return t.eachLayer(t=>{let a=r(t.feature);if(!a||typeof t.getLatLngs!=`function`)return;let o=a.reverse?ri(t.getLatLngs()):t;i.set(t,e.polylineDecorator(o,{patterns:[{offset:a.offset??`12%`,repeat:a.repeat??160,symbol:e.Symbol.arrowHead({pixelSize:a.pixelSize??12,polygon:!1,pathOptions:{stroke:!0,weight:2,color:t.options.color,opacity:1}})}]}).addTo(n))}),i},ai=({map:e,surface:t,lines:n,markerAt:r,decoratorOf:i,glide:a})=>{let o=e=>t.getVisibleParent?.(e),s=(e,t)=>{e.layer.setLatLngs(t);let n=i?.get(e.layer);n&&n.setPaths(e.reverse?ri(t):e.layer)},c=typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,l=null,u=[],d=()=>{l!==null&&cancelAnimationFrame(l),l=null,u=[]},f=e=>{d(),u=e;let t=e.map(({line:e})=>e.layer.getLatLngs()),n=performance.now(),r=i=>{let o=Math.min(1,(i-n)/a),c=ti(o);e.forEach((e,n)=>s(e.line,ni(t[n],e.next,c))),o<1?l=requestAnimationFrame(r):(l=null,u=[],e.forEach(e=>s(e.line,e.next)))};l=requestAnimationFrame(r)},p=()=>{let e=[];if(n.forEach(t=>{let n=ei(t,r,o);n&&(t.key=n.key,e.push({line:t,next:n.next}))}),!e.length)return;let t=new Set(e.map(({line:e})=>e)),i=[...u.filter(({line:e})=>!t.has(e)),...e];!a||c||i.length>150?(d(),i.forEach(e=>s(e.line,e.next))):f(i)};p(),t.on(`animationend`,p),e.on(`moveend`,p);let m=()=>{d(),t.off(`animationend`,p),e.off(`moveend`,p)};return m.reroute=p,m},oi=(e,t,n,r)=>{let i=/Point$/.test(t.geometry?.type??``),a=(n.marker?.size??24)/2;return e.bindTooltip(_t(r),{permanent:!0,direction:n.label?.direction??(i?`top`:`center`),offset:n.label?.offset??(i?[0,-a]:[0,0]),className:[`atlas-label`,n.label?.className].filter(Boolean).join(` `),opacity:1}),n.label?.style&&e.on(`tooltipopen`,e=>gt(e.tooltip.getElement(),n.label.style)),!!n.label?.scale},si=(e,t)=>{e.forEach(({layer:e,descriptor:n})=>{if(e._atlasHidden)return;let r=Zn(n,t);r!==e.isTooltipOpen()&&(r?e.openTooltip():e.closeTooltip())})},ci=280,li={chunkedLoading:!0,showCoverageOnHover:!1,spiderfyDistanceMultiplier:2},ui=[{upTo:9,name:`sm`,size:32},{upTo:99,name:`md`,size:38},{upTo:1/0,name:`lg`,size:46}],di=e=>{if(!e)return null;if(e===!0)return{from:0,options:{...li},badge:{},glide:ci};if(typeof e==`number`)return{from:e,options:{...li},badge:{},glide:ci};let{from:t=0,className:n,style:r,glide:i=ci,...a}=e;return{from:t,options:{...li,...a},badge:{className:n,style:r},glide:i===!0?ci:i}},fi=(e,t={})=>{let n=ui.find(({upTo:t})=>e<=t)??ui[ui.length-1],r=document.createElement(`span`);return r.className=`atlas-cluster__count`,r.textContent=String(e),gt(r,t.style),{element:r,size:n.size,className:[`atlas-cluster`,`atlas-cluster--${n.name}`,t.className].filter(Boolean).join(` `)}},pi=({map:e,factory:t,group:n,cluster:r,points:i})=>{let a=t.featureGroup().addTo(e),o=di(r),s=typeof t.markerClusterGroup==`function`;o!==null&&!s&&console.warn(`perun-atlas: clustering was configured, but the map engine on this deployment does not carry it`);let c=o!==null&&s&&i>=o.from,l=c?t.markerClusterGroup({...o.options,iconCreateFunction:e=>{let{element:n,size:r,className:i}=fi(e.getChildCount(),o.badge);return t.divIcon({html:n,className:i,iconSize:[r,r]})}}):n;if(l.addTo(e),c){let e=[];n.eachLayer(t=>{t._atlasPinned?e.push(t):l.addLayer(t)}),e.forEach(e=>a.addLayer(e))}let u=c?t.featureGroup().addTo(e):l,d=e=>c&&e._atlasPinned?a:l;return{surface:l,arrows:u,clustering:c,settings:o,layers:u===l?[l,a]:[l,u,a],move:(e,t,n)=>{let r=[];e.forEach(({layer:e})=>{e._atlasHidden=!t;let i=d(e);c&&i===l?r.push(e):t?i.addLayer(e):i.removeLayer(e);let a=n?.get(e);a&&t?u.addLayer(a):a&&u.removeLayer(a)}),r.length&&(t?l.addLayers(r):l.removeLayers(r))}}};G(`/* A divIcon with no CSS has no size or background, so these ship rather than being left to the
   deployment. Single-class selectors, so anything loaded later wins. */

.atlas-marker {
  box-sizing: border-box;
  border-radius: 50%;
  background: #4a5c66;
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
}

/* The span is the chip, since Leaflet gives the outer element only its class and size. The
   marker's own colour; \`--sm\`, \`--md\` and \`--lg\` are for a deployment that wants a scale. */
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

  /* spatial outlines tooltip text in black, which turns to a smear inside a pill. */
  text-shadow: none;
}

.leaflet-tooltip.atlas-label::before {
  display: none;
}

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
  /* The label column sets the first track, so it should not wrap. */
  white-space: nowrap;
}

.atlas-popup-fields dd {
  margin: 0;
  font-weight: 600;
  /* Identifiers and codes have no spaces to break at, and a popup is narrow. */
  overflow-wrap: anywhere;
}
`);var{factory:mi}=f,{useEffect:hi,useRef:gi}=t.React,_i=[],vi=({servicePath:e,context:t,reload:n,descriptors:r={},descriptorFor:i,cluster:a,fit:o=!0,tooltip:s,popup:c,labelResolver:l,pinned:u,hidden:d=_i,onFeatureClick:f,onLegend:p,onShown:m,onExtent:h,onLoadStart:g,onLoad:_,onError:v})=>{let y=U(),b=gi([]),x=gi([]),{hiddenRef:S,filterRef:C}=xr(d);return hi(()=>{let n=!1,d=cr({descriptors:r,nameOf:e=>i?.(e)??Xr(e)}),{entryFor:w}=d,T=()=>si(x.current,y.getZoom()),ee=()=>{x.current=[],b.current.forEach(e=>y.removeLayer(e)),b.current=[]},E=Object.create(null),D=[],O=[],k=e=>!!u?.(e),A=[];return(async()=>{try{g?.();let r=await Wn(e,t);if(n)return;ee();let i=0,u=mi.geoJSON(r,{crs:y.getCRS(),pointToLayer:(e,t)=>{i+=1;let{marker:n={}}=w(e)??{},r=n.size??24,a=mi.marker(t,{icon:mi.divIcon({className:n.className??`atlas-marker`,iconSize:[r,r]})});return n.style&&a.on(`add`,()=>gt(a.getElement(),n.style)),E[$r(t)]=a,a._atlasPinned=k(e),a},style:e=>Jn(w(e)),onEachFeature:(e,t)=>{let n=w(e)??{};A.push({layer:t,feature:e,key:d.note(e),hidden:!1});let r=s?s(e):Qn(n,e);if(r&&oi(t,e,n,r)&&x.current.push({layer:t,descriptor:n}),typeof t.getLatLngs==`function`){let e=t.getLatLngs();Array.isArray(e)&&e.length>=2&&!Array.isArray(e[0])&&D.push({layer:t,original:e.map(({lat:e,lng:t})=>mi.latLng(e,t)),reverse:!!n.arrow?.reverse,key:null})}let i=n.details&&!c?null:Dr(e,n,{popup:c,labelResolver:l});i&&t.bindPopup(i,Or),f&&t.on(`click`,()=>f(e,tr(n,e,l)))}}),v=pi({map:y,factory:mi,group:u,cluster:a,points:i}),{surface:j,clustering:te,settings:ne}=v;b.current=v.layers;let M=ii({factory:mi,group:u,into:v.arrows,arrowOf:e=>w(e)?.arrow}),N=e=>{let{leaving:t,returning:n}=Sr(A,e);return v.move(t,!1,M),v.move(n,!0,M),n.length&&Cr(A,M),t.length>0||n.length>0},P=e=>{m?.(wr(r,e,e=>d.kindOf(e).key)),h?.(Tr(A))};N(S.current);let F=null;te&&D.length&&(F=ai({map:y,surface:j,lines:D,markerAt:E,decoratorOf:M,glide:ne.glide}),O.push(F)),p?.(d.drawn()),T(),y.on(`zoomend`,T),te&&y.on(`moveend`,T);let re=Tr(A);o&&re&&y.fitBounds(re,{padding:Ke}),C.current=e=>{N(e)&&(F?.reroute(),T(),P(e))},P(S.current),_?.(r)}catch(e){if(n)return;console.error(`perun-atlas: feature set failed to render`,e),v?.(e)}})(),()=>{n=!0,C.current=null,O.forEach(e=>e()),y.off(`zoomend`,T),y.off(`moveend`,T),ee()}},[y,e,JSON.stringify(t??{}),n]),null},yi=`#e8590c`,bi={className:`atlas-overlay`,color:yi,weight:2.5,opacity:1,dashArray:`6 5`,fillColor:yi,fillOpacity:.08},xi={className:`atlas-overlay atlas-overlay--point`,radius:5,color:yi,weight:2.5,opacity:1,fillColor:`#ffffff`,fillOpacity:.85},Si=e=>({key:or,label:e,kind:`line`,path:bi,marker:null,arrow:null}),Ci=e=>e==null||e===``||typeof e==`object`?null:String(e),wi=(e,t,n)=>{let r=e?.properties??{},i=Ci(r.name),a=Object.entries(r).filter(([e])=>i===null||e!==`name`).map(([e,t])=>({field:e,label:n?.(e.toLowerCase())||e,value:Ci(t)})).filter(e=>e.value!==null);return{title:i??t,rows:a,spec:{className:`atlas-panel__details--file`}}};G(`/* \`--ap-overlay\` reaches the map because the map sits inside the panel, fullscreen included. */

/* Leaflet's colour attribute loses to any CSS, so this decides the colour and the key's swatch shares
   the class. Fill only where there is one, or a line would be filled in solid. */
.atlas-overlay {
  stroke: var(--ap-overlay, #e8590c);
}

.atlas-overlay:not([fill="none"]) {
  fill: var(--ap-overlay, #e8590c);
}

.atlas-overlay.atlas-overlay--point {
  fill: #ffffff;
}

/* Opened by the button beside it, so it is never shown. */
.atlas-panel__fileinput {
  display: none;
}

/* The actions group does not shrink, so the chip has its own width and the name ellipsises. */
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

/* Set in full, since a deployment's sheet may style every \`button\` (see README.md). */
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
`);var{factory:Ti}=f,{useEffect:Ei,useRef:Di}=t.React,Oi=`atlasFilePoints`,ki=620,Ai=e=>(e.getPane(Oi)||(e.createPane(Oi).style.zIndex=String(ki)),Oi),ji=({file:e,srid:t,hidden:n=!1,labelResolver:r,onFeatureClick:i,onDrawn:a,onError:o})=>{let s=U(),c=Di(null),l=Di(n);l.current=n;let u=Di({});u.current={labelResolver:r,onFeatureClick:i,onDrawn:a,onError:o};let d=Di(null);return Ei(()=>{if(!e)return;let n;try{n=Ti.geoJSON(k(e.collection,t,s),{crs:s.getCRS(),pointToLayer:(e,t)=>Ti.circleMarker(t,{...xi,pane:Ai(s)}),style:e=>/Point$/.test(e?.geometry?.type??``)?xi:bi,onEachFeature:(t,n)=>{n.on(`click`,()=>{let{labelResolver:n,onFeatureClick:r}=u.current;r?.(t,{...wi(t,e.name,n),file:e})})}})}catch(e){console.error(`perun-atlas: a file could not be drawn`,e),u.current.onError?.(e);return}if(c.current=n,l.current||n.addTo(s),d.current!==e){d.current=e;let t=n.getBounds();t.isValid()&&s.fitBounds(t,{padding:Ke})}return u.current.onDrawn?.(),()=>{s.removeLayer(n),c.current=null}},[s,e,t]),Ei(()=>{let e=c.current;e&&(n?s.removeLayer(e):s.hasLayer(e)||e.addTo(s))},[s,n]),null};G(`/* Structure only; colours, type and radii are the deployment's. An opaque ground, since a swatch
   read against tiles is not a swatch. */

.atlas-legend {
  /* spatial does not ship Leaflet's control margin, so every corner control carries its own. */
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

/* Every property set here, since a deployment's bare \`button\` rules win whatever a class does not
   claim (see README.md). */
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

/* A \`filter\` rather than \`opacity\`: a point's swatch carries its marker's inline CSS, whose
   \`opacity\` would win. */
.atlas-legend__item[aria-pressed='false'] .atlas-legend__swatch,
.atlas-legend__item[aria-pressed='false'] .atlas-legend__point {
  filter: opacity(0.3);
}

.atlas-legend__item[aria-pressed='false'] .atlas-legend__label {
  color: #6c757d;
  text-decoration: line-through;
}

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

/* spatial's \`.control-bottomright button:not(.disabled)\` makes every button there absolute, padded
   and round; one class more specific undoes it. */
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

@media (max-width: 30rem) {
  .atlas-legend {
    max-width: calc(100vw - 4rem);
  }
}
`);var{useEffect:Mi,useRef:Ni,useState:Pi}=t.React,Fi=({marker:e})=>{let n=Ni(null);return Mi(()=>{let t=n.current;t&&(gt(t,e?.style),t.style.width=`12px`,t.style.height=`12px`)},[e]),t.React.createElement(`span`,{ref:n,className:[`atlas-legend__point`,e?.className].filter(Boolean).join(` `),"aria-hidden":`true`})};Fi.propTypes={marker:t.PropTypes.object};var Ii=({path:e,arrow:n})=>{let r=e?.color??`#4A5C66`,i=Array.isArray(e?.dashArray)?e.dashArray.join(` `):e?.dashArray,a=n?.reverse?`3,6 9,3 9,9`:`21,6 15,3 15,9`;return t.React.createElement(`svg`,{className:`atlas-legend__swatch`,width:`24`,height:`12`,viewBox:`0 0 24 12`,"aria-hidden":`true`},t.React.createElement(`line`,{className:e?.className,x1:`2`,y1:`6`,x2:`22`,y2:`6`,stroke:r,strokeWidth:Math.min(e?.weight??1,4),strokeDasharray:i||void 0,strokeOpacity:e?.opacity??1,strokeLinecap:`round`}),n&&t.React.createElement(`polygon`,{points:a,fill:r,fillOpacity:e?.opacity??1}))};Ii.propTypes={path:t.PropTypes.object,arrow:t.PropTypes.object};var Li=({path:e})=>t.React.createElement(`svg`,{className:`atlas-legend__swatch`,width:`24`,height:`12`,viewBox:`0 0 24 12`,"aria-hidden":`true`},t.React.createElement(`rect`,{x:`4`,y:`1`,width:`16`,height:`10`,fill:e?.fillColor??`#B8C6CC`,fillOpacity:e?.fillOpacity??.55,stroke:e?.color??`#4A5C66`,strokeWidth:Math.min(e?.weight??1,2),strokeOpacity:e?.opacity??1}));Li.propTypes={path:t.PropTypes.object};var Ri=({entry:e})=>e.kind===`point`?t.React.createElement(Fi,{marker:e.marker}):e.kind===`line`?t.React.createElement(Ii,{path:e.path,arrow:e.arrow}):t.React.createElement(Li,{path:e.path});Ri.propTypes={entry:t.PropTypes.object.isRequired};var zi=({entries:e=[],title:n,open:r=!0,hidden:i=[],onToggle:a,onShowAll:o,showAllLabel:s,className:c=``})=>{let[l,u]=Pi(r);if(!rr(e,i))return null;let d=n??`Legend`,f=e.some(e=>i.includes(e.key));return t.React.createElement(`div`,{className:`atlas-legend ${c}`.trim()},t.React.createElement(`button`,{type:`button`,className:`atlas-legend__toggle`,onClick:()=>u(!l),"aria-expanded":l},t.React.createElement(`span`,{className:`atlas-legend__title`},d),t.React.createElement(`span`,{className:`atlas-legend__chevron`,"aria-hidden":`true`},l?`−`:`+`)),l&&t.React.createElement(`ul`,{className:`atlas-legend__list`},e.map(e=>{let n=t.React.createElement(t.React.Fragment,null,t.React.createElement(Ri,{entry:e}),t.React.createElement(`span`,{className:`atlas-legend__label`},e.label));return t.React.createElement(`li`,{className:`atlas-legend__row`,key:e.key},a?t.React.createElement(`button`,{type:`button`,className:`atlas-legend__item`,"aria-pressed":!i.includes(e.key),onClick:()=>a(e.key)},n):n)})),l&&o&&f&&t.React.createElement(`button`,{type:`button`,className:`atlas-legend__reset`,onClick:o},s??`Show all`))};zi.propTypes={entries:t.PropTypes.array,title:t.PropTypes.string,open:t.PropTypes.bool,hidden:t.PropTypes.array,onToggle:t.PropTypes.func,onShowAll:t.PropTypes.func,showAllLabel:t.PropTypes.string,className:t.PropTypes.string};var Bi=({entries:e=[],title:n,open:r,hidden:i=[],onToggle:a,onShowAll:o,showAllLabel:s,position:c=`bottomleft`})=>{let l=rr(e,i);return t.React.createElement(ct,{position:c,shown:l},t.React.createElement(`div`,{className:`atlas-legend__host`,ref:ut},t.React.createElement(zi,{entries:e,title:n,open:r,hidden:i,onToggle:a,onShowAll:o,showAllLabel:s})))};Bi.propTypes={entries:t.PropTypes.array,title:t.PropTypes.string,open:t.PropTypes.bool,hidden:t.PropTypes.array,onToggle:t.PropTypes.func,onShowAll:t.PropTypes.func,showAllLabel:t.PropTypes.string,position:t.PropTypes.string};var Vi=({className:e=`atlas-panel__close`,label:n,title:r,onClick:i})=>t.React.createElement(`button`,{type:`button`,className:e,"aria-label":n,title:r,onClick:i},`×`),Hi=({timeScoped:e,longest:n,preset:r,applyPreset:i,onClose:a,labels:o={}})=>t.React.createElement(`div`,{className:`atlas-panel__empty`},t.React.createElement(`div`,{className:`atlas-panel__emptycard`},t.React.createElement(`div`,{className:`atlas-panel__emptytitle`},o.empty??(e?`Nothing in this range`:`Nothing to show`)),o.emptyHint&&t.React.createElement(`div`,{className:`atlas-panel__emptybody`},o.emptyHint),e&&n&&r!==n.months&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--primary`,onClick:()=>i(n.months)},[o.widen??`Try`,n.label].filter(Boolean).join(` `)),t.React.createElement(Vi,{label:o.close??`Close`,title:o.close??`Close`,onClick:a}))),{Icon:Ui}=t.elements,Wi=[{offer:`geojson`,icon:`IconJson`,label:`exportGeoJSON`,fallback:`GeoJSON`,save:`saveGeoJSON`},{offer:`csv`,icon:`IconFileTypeCsv`,label:`exportCsv`,fallback:`CSV`,save:`saveCSV`},{offer:`kml`,icon:`IconWorld`,label:`exportKml`,fallback:`KML`,save:`saveKML`},{offer:`shp`,icon:`IconFileTypeZip`,label:`exportShp`,fallback:`Shapefile`,save:`saveShapefile`}],Gi=({exporter:e,labels:n={}})=>t.React.createElement(t.React.Fragment,null,Wi.filter(({offer:t})=>e.offer[t]!==!1).map(({offer:r,icon:i,label:a,fallback:o,save:s})=>t.React.createElement(`button`,{key:r,type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:e[s]},t.React.createElement(Ui,{name:i,size:16,stroke:1.75,"aria-hidden":`true`}),n[a]??o))),Ki=e=>`${Number((e/1048576).toFixed(1))} MB`,qi=e=>new Intl.NumberFormat().format(e),Ji=(e,t={})=>B(e===1?t.fileFeature??`{count} feature`:t.fileFeatures??`{count} features`,{count:qi(e)}),Yi=(e,t={})=>B(t.fileOpening??`Opening {name}…`,{name:e}),Xi=(e,t={})=>B(t.fileAssumedDegrees??`{name} has no .prj, so its coordinates were read as longitude and latitude (WGS 84).`,{name:e}),Zi={unreadable:[`fileUnreadable`,`{name} could not be read as GeoJSON, KML, GPX or a shapefile.`],empty:[`fileEmpty`,`{name} has nothing in it to draw.`],notDegrees:[`fileNotDegrees`,`{name} is not in longitude and latitude, so it cannot be placed on the map.`],tooLarge:[`fileTooLarge`,`{name} is {size}. Files up to {limit} can be opened.`],tooManyPoints:[`fileTooManyPoints`,`{name} has {count} points. Files with up to {limit} points can be opened.`],tooLargeUnzipped:[`fileTooLargeUnzipped`,`{name} is over {limit} once unzipped, and {limit} is the most that can be opened.`],noShapefile:[`fileNoShapefile`,`{name} holds no shapefile.`],shapefilePart:[`fileShapefilePart`,`{name} is one part of a shapefile and holds no shapes. Open the .zip holding all its parts, or its .shp.`],noPrj:[`fileNoPrj`,`{name} has no .prj, and its coordinates are not longitude and latitude, so nothing says where it belongs. Open it zipped with its .prj.`],unknownProjection:[`fileUnknownProjection`,`The projection in {name}'s .prj could not be read. Save it in WGS 84 (EPSG:4326) and open it again.`],noDatumShift:[`fileNoDatumShift`,`{name} is in {crs}, and its .prj does not say how to shift that to WGS 84, so it would land in the wrong place. Save it in WGS 84 (EPSG:4326) and open it again.`],readerUnavailable:[`fileReaderUnavailable`,`The shapefile reader could not be loaded, so {name} was not opened. Try again.`]},Qi=(e,t,n={})=>{let[r,i]=Zi[e?.refused]??Zi.unreadable,a={name:t};return e?.refused===`tooLarge`&&(a.size=Ki(e.size),a.limit=Ki(e.limit)),e?.refused===`tooLargeUnzipped`&&(a.limit=Ki(e.limit)),e?.refused===`tooManyPoints`&&(a.count=qi(e.count),a.limit=qi(e.limit)),e?.refused===`noDatumShift`&&(a.crs=e.crs||`a projection`),B(n[r]??i,a)},{Icon:$i}=t.elements,ea=({fileOverlay:e,labels:n={}})=>{let{offered:r,file:i,inputRef:a,choose:o,onPicked:s,close:c}=e;return t.React.createElement(t.React.Fragment,null,r&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:o},t.React.createElement($i,{name:`IconFolderOpen`,size:16,stroke:1.75,"aria-hidden":`true`}),n.openFile??`Open file`),r&&t.React.createElement(`input`,{ref:a,type:`file`,className:`atlas-panel__fileinput`,accept:`.geojson,.json,.kml,.gpx,.zip,.shp`,tabIndex:-1,"aria-hidden":`true`,onChange:s}),i&&t.React.createElement(`div`,{className:`atlas-panel__file`},t.React.createElement(Ii,{path:bi}),t.React.createElement(`span`,{className:`atlas-panel__filename`,title:i.name},i.name),t.React.createElement(`span`,{className:`atlas-panel__filecount`},Ji(i.count,n)),t.React.createElement(Vi,{className:`atlas-panel__fileclose`,label:n.closeFile??`Close file`,title:n.closeFile??`Close file`,onClick:c})))},ta=({fileOverlay:e,labels:n={}})=>{let{note:r,refusal:i,dismiss:a,dismissNote:o}=e;return t.React.createElement(t.React.Fragment,null,r&&t.React.createElement(`p`,{className:`atlas-panel__filenote`,role:`status`},t.React.createElement(`span`,null,r),t.React.createElement(Vi,{className:`atlas-panel__fileclose`,label:n.close??`Close`,onClick:o})),i&&t.React.createElement(`p`,{className:`atlas-panel__filerefused`,role:`alert`},t.React.createElement(`span`,null,i),t.React.createElement(Vi,{className:`atlas-panel__fileclose`,label:n.close??`Close`,onClick:a})))},{Icon:na}=t.elements,ra=({viewLink:e,labels:n={}})=>t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:t=>e.copy(t.currentTarget)},t.React.createElement(na,{name:e.copied?`IconCheck`:`IconLink`,size:16,stroke:1.75,"aria-hidden":`true`}),e.copied?n.linkCopied??`Link copied`:n.copyLink??`Copy link`),ia=({saving:e,opening:n,labels:r={}})=>t.React.createElement(`div`,{className:`atlas-panel__loading`,role:`status`,"aria-live":`polite`},t.React.createElement(`div`,{className:`atlas-panel__loadingcard`},t.React.createElement(`div`,{className:`atlas-panel__spinner`,"aria-hidden":`true`}),t.React.createElement(`span`,null,e?r.saving??`Saving…`:n?Yi(n,r):r.loading??`Loading…`))),aa=({timeScoped:e,range:n,initial:r,applyPreset:i,onClose:a,labels:o={}})=>t.React.createElement(`div`,{className:`atlas-panel__footer`},e&&t.React.createElement(`div`,{className:`atlas-panel__summary`},`${n.from} → ${n.to}`),t.React.createElement(`div`,{className:`atlas-panel__actions`},e&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:()=>i(r)},o.reset??`Reset range`),a&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--dark`,onClick:a},o.close??`Close`))),oa=({record:e,onClose:n,labels:r={}})=>t.React.createElement(`aside`,{className:[`atlas-panel__details`,e.spec?.className].filter(Boolean).join(` `),style:e.spec?.style,"aria-label":r.details??`Details`},t.React.createElement(`div`,{className:`atlas-panel__detailshead`},t.React.createElement(`div`,{className:`atlas-panel__detailstitle`,style:e.spec?.titleStyle},e.title??r.details??`Details`),t.React.createElement(Vi,{label:r.close??`Close`,onClick:n})),t.React.createElement(`dl`,{className:`atlas-panel__detailsbody`},e.rows.map(({field:n,label:r,value:i})=>t.React.createElement(`div`,{key:n,className:`atlas-panel__detailsrow`},t.React.createElement(`dt`,{style:e.spec?.labelStyle},r),t.React.createElement(`dd`,{style:e.spec?.valueStyle},i))))),sa=({range:e,onRangeChange:n,presets:r=[],preset:i,applyPreset:a,labels:o={}})=>t.React.createElement(t.React.Fragment,null,t.React.createElement(Hr,{from:e.from,to:e.to,onChange:n,labels:{from:o.from,to:o.to,invalidRange:o.invalidRange}}),r.length>0&&t.React.createElement(`div`,{className:`atlas-panel__segmented`},r.map(({months:e,label:n})=>t.React.createElement(`button`,{key:e,type:`button`,"aria-pressed":i===e,onClick:()=>a(e)},n)))),ca=async(e,n={})=>{if(!e)return[];let r=`${window.server}${B(e,n)}`,i=(await t.axios.get(r).catch(e=>(console.error(`perun-atlas: rows unavailable from ${r}`,e),null)))?.data;return i&&!Array.isArray(i)&&console.warn(`perun-atlas: ${r} answered with no array of rows; treating as empty`),Array.isArray(i)?i:[]},{useEffect:la,useMemo:ua,useState:da}=t.React,fa=({choropleth:e,bindings:t,bindingKey:n})=>{let r=!!e,[i,a]=da(null),o=r?e.status:null;return la(()=>{if(!o)return;let e=!1;return ca(o,t).then(t=>{e||a(t)}),()=>{e=!0}},[o,n]),{coloured:r,statusPath:o,rows:i,tooltip:ua(()=>{let t=e?.tooltip;if(!t)return;let n=z(t);return e=>n(e?.properties)??null},[e])}},pa=e=>e.toISOString().slice(0,10),ma=()=>pa(new Date),ha=e=>{let t=new Date;return t.setMonth(t.getMonth()-e),pa(t)},ga=e=>({from:ha(e),to:ma()}),_a=(e,t)=>e?.from===t?.from&&e?.to===t?.to,{useState:va}=t.React,ya=({presets:e=[],defaultMonths:t,servicePath:n,opening:r,onMoved:i})=>{let a=t??e[e.length-1]?.months??12,[o,s]=va(r?null:a),[c,l]=va(()=>r??ga(a)),u=/\{(from|to)\}/.test(n??``),d=(e,t)=>{s(t),!_a(e,c)&&(l(e),i?.())};return{timeScoped:u,preset:o,range:c,applyPreset:e=>d(ga(e),e),onRangeChange:e=>d(e,null),longest:e[e.length-1],initial:a}},ba=async(e,n,r,i)=>{if(!e)return null;let a=`${window.server}${B(e,n)}`,o=await t.axios.get(a).catch(e=>(console.error(`perun-atlas: no ${r} from ${a}`,e),null));if(!o)return null;let s=o.data;return i(s)?s:(console.error(`perun-atlas: ${a} answered with no ${r}`,s),null)},xa=e=>!!e&&typeof e==`object`&&!Array.isArray(e),Sa=(e,t={})=>ba(e,t,`form schema`,e=>xa(e)&&!!e.properties),Ca=(e,t={})=>ba(e,t,`form layout`,xa),wa=(e,t)=>{if(!e?.properties||!t?.length)return e??null;let n=e.properties,r={},i=new Set;t.forEach(e=>{if(Object.prototype.hasOwnProperty.call(n,e)){r[e]=n[e],i.add(e);return}let t=e.lastIndexOf(`.`),a=t===-1?``:e.slice(0,t),o=t===-1?``:e.slice(t+1),s=a?n[a]:null,c=s?.properties?.[o];if(!c){console.warn(`perun-atlas: the form schema has no "${e}", so it is not on the form`);return}if(i.has(a))return;let l=r[a]??{...s,properties:{}};l.properties={...l.properties,[o]:c},r[a]=l}),Object.keys(r).forEach(e=>{if(i.has(e))return;let t=r[e],a=(n[e].required??[]).filter(e=>e in t.properties);a.length?t.required=a:delete t.required});let a={...e,properties:r};delete a.title;let o=(e.required??[]).filter(e=>e in r);if(o.length?a.required=o:delete a.required,a.dependencies){let e=Object.entries(a.dependencies).filter(([e])=>e in r);e.length?a.dependencies=Object.fromEntries(e):delete a.dependencies}return a},Ta=(e,t)=>{if(!t?.properties)return e??{};let n={...e??{}};return Object.entries(t.properties).forEach(([e,t])=>{t?.properties&&(n[e]=Ta(n[e],t))}),n},Ea={boolean:[`checkbox`,`radio`,`select`,`hidden`],string:[`text`,`password`,`email`,`hostname`,`ipv4`,`ipv6`,`uri`,`data-url`,`radio`,`select`,`textarea`,`hidden`,`date`,`datetime`,`date-time`,`alt-date`,`alt-datetime`,`time`,`color`,`file`],number:[`text`,`select`,`updown`,`range`,`radio`,`hidden`],integer:[`text`,`select`,`updown`,`range`,`radio`,`hidden`],array:[`select`,`checkboxes`,`files`,`hidden`]},Da=new Set([`AltDateTimeWidget`,`AltDateWidget`,`CheckboxWidget`,`CheckboxesWidget`,`ColorWidget`,`DateTimeWidget`,`DateWidget`,`EmailWidget`,`FileWidget`,`HiddenWidget`,`PasswordWidget`,`RadioWidget`,`RangeWidget`,`SelectWidget`,`TextWidget`,`TextareaWidget`,`TimeWidget`,`URLWidget`,`UpDownWidget`]),Oa=new Set(Object.values(Ea).flat()),ka=(e,t)=>Da.has(e)||(t?(Ea[t]??[]).includes(e):Oa.has(e)),Aa=(e,t)=>{if(!xa(e))return e??null;let n=[],r=(e,t)=>{let i={};return Object.entries(e).forEach(([e,a])=>{if(e===`ui:widget`&&typeof a==`string`&&!ka(a,t?.type)){n.push(a);return}let o=e===`items`?t?.items:t?.properties?.[e];i[e]=xa(a)&&!e.startsWith(`ui:`)?r(a,o):a}),i},i=r(e,t);return n.length&&console.warn(`perun-atlas: this form cannot draw ${[...new Set(n)].map(e=>`"${e}"`).join(`, `)} -- those are the widgets a record form registers, and the draw row is not one. The fields keep the widget their schema implies.`),n.length?i:e},ja=e=>encodeURIComponent(JSON.stringify(e)),Ma=e=>e.replace(/ /g,`%20`),Na=(e,t,n)=>e==null?``:t===`form`||!t&&/form-urlencoded/.test(n??``)?ja(e):JSON.stringify(e),Pa=(e,t)=>{let n=typeof e==`string`?Fa(e):e,r=String(n?.type??``).toUpperCase();return r===`ERROR`||r===`EXCEPTION`?{ok:!1,message:[n?.title,n?.message].filter(Boolean).join(` — `)}:t&&typeof e==`string`&&new RegExp(t,`i`).test(e)?{ok:!1,message:e.trim().slice(0,300)}:{ok:!0,message:null}},Fa=e=>{try{return JSON.parse(e)}catch{return null}},Ia=/^\{([^{}]+)\}$/,La=`...`,Ra=(e,t)=>{if(typeof e==`string`){let n=e.match(Ia);return n?R(t,n[1])??e:B(e,t)}if(Array.isArray(e))return e.map(e=>Ra(e,t));if(e&&typeof e==`object`){let n={};return Object.entries(e).forEach(([e,r])=>{let i=Ra(r,t);e===La&&i&&typeof i==`object`&&!Array.isArray(i)?Object.assign(n,i):n[e]=i}),n}return e},za=async(e,n={},r={})=>{let{body:i,contentType:a=`application/x-www-form-urlencoded`,encoding:o,failure:s}=r,c=`${window.server}${Ma(B(e,n))}`;try{let e=await(0,t.axios)({method:`post`,url:c,headers:{"Content-Type":a},data:Na(i,o,a)}),n=Pa(e?.data,s);return n.ok||(console.error(`perun-atlas: ${c} refused the save`,e?.data),console.error(`perun-atlas: the payload was`,i)),{...n,data:e?.data}}catch(e){return console.error(`perun-atlas: save to ${c} failed`,e),{ok:!1,message:e?.message??String(e),data:null}}},Ba=(e,{draw:t,dataSrid:n,bindings:r,note:i,selected:a,form:o,map:s})=>{let c={lat:e.lat,lng:e.lng},{x:l,y:u}=E(c,n,s),d=e.radius*A(c,n,s),f=Math.round(d),p=M(c,e.radius,n,t.points,s),m=p.map(e=>B(t.ring?.point??`{x} {y}`,e)).join(t.ring?.join??`, `),h={type:`Polygon`,coordinates:[[...p,p[0]].map(e=>[e.x,e.y])]},g=[t.save.onSave,JSON.stringify(t.save.body??null)].some(e=>String(e).includes(`{draw.radius}`));return{context:{...r,note:i,draw:{lat:e.lat,lng:e.lng,metres:Math.round(e.radius),x:l,y:u,radius:f,ring:m,geojson:h,...a?{selected:a}:{}},...t.form?{form:o}:{}},units:d,tooSmall:g&&!(f>=1)}},{useEffect:Va,useMemo:Ha,useState:Ua}=t.React,Wa=(e,t)=>e?B(e,t??{}):null,Ga=e=>({path:typeof e==`string`?e:null,inline:e&&typeof e==`object`?e:null}),Ka=({form:e,bindings:t})=>{let{path:n,inline:r}=Ga(e?.schema),i=Ga(e?.uiSchema),a=Wa(n,t),o=Wa(i.path,t),[s,c]=Ua(null),[l,u]=Ua(null),[d,f]=Ua(!!(n||i.path)),[p,m]=Ua(!1);Va(()=>{if(!n&&!i.path){c(null),u(null),f(!1);let t=!!e&&!r;t&&console.error("perun-atlas: draw.form needs `schema` -- either the schema itself, or the path to a service that answers with one. Got",e?.schema),m(t);return}let a=!1;return f(!0),m(!1),Promise.all([n?Sa(n,t):Promise.resolve(null),i.path?Ca(i.path,t):Promise.resolve(null)]).then(([e,t])=>{a||(c(e),u(t),m(!!n&&!e),f(!1))}),()=>{a=!0}},[n,a,i.path,o,!!e,!!r]);let h=Ha(()=>wa(n?s:r,e?.pick),[s,r,n,e?.pick?.join(`\0`)??null]);return{schema:h,uiSchema:Ha(()=>Aa(i.path?l:i.inline,h)??void 0,[l,i.inline,i.path,h]),loading:d,failed:p}},{Map:qa,factory:Ja}=f,Ya=(e,t,n,r)=>{let i=g(e?.geometry);if(i.length===0)return null;let a=Ja.latLng(t),o=r??qa,s=1/0,c=0;return i.forEach(e=>{let t=o.distance(a,Ja.latLng(D(e,n,r)));t<s&&(s=t),t>c&&(c=t)}),{nearest:s,furthest:c}},Xa=(e,t,n={})=>{let{srid:r,mode:i=`touches`,map:a}=n,o=e?.features??[],s={inside:[],outside:o,has:()=>!1,metres:()=>null,total:o.length};if(!t||!(t.radius>0))return s;let c={lat:t.lat,lng:t.lng};if(!Number.isFinite(c.lat)||!Number.isFinite(c.lng))return s;let l=new WeakMap,u=new WeakSet,d=[],f=[];return o.forEach(e=>{let n=Ya(e,c,r,a);n?(l.set(e,n.nearest),(i===`contains`?n.furthest<=t.radius:n.nearest<=t.radius)?(u.add(e),d.push(e)):f.push(e)):f.push(e)}),d.sort((e,t)=>l.get(e)-l.get(t)),{inside:d,outside:f,has:e=>e?u.has(e):!1,metres:e=>e&&l.has(e)?l.get(e):null,total:o.length}},Za=(e,t={})=>{let{id:n=`{pkid}`,join:r=`,`}=t;return(e??[]).map(e=>B(n,e?.properties??{})).filter(e=>e&&e!==n).join(r)},{useMemo:Qa}=t.React,$a={id:`{pkid}`,join:`,`},eo=({set:e,shape:t,dataSrid:n,select:r,map:i})=>{let a=r===!0?$a:r?{...$a,...r}:null,{mode:o,id:s,join:c}=a??{},l=!!a&&a.export!==!1;return Qa(()=>{if(!a)return{selecting:!1,feedsExport:!1,count:0,total:0,inside:[],radius:null,has:()=>!1,metres:()=>null,context:null};let r=Xa(e,t,{srid:n,mode:o,map:i});return{selecting:!0,feedsExport:l,count:r.inside.length,total:r.total,inside:r.inside,radius:t?.radius??null,has:r.has,metres:r.metres,context:{count:r.inside.length,total:r.total,ids:Za(r.inside,{id:s,join:c}),geojson:{type:`FeatureCollection`,features:r.inside}}}},[e,t,n,i,o,s,c,l,!!a])},{useMemo:to,useState:no}=t.React,{alertUserResponse:ro}=t.elements,io=(e,t)=>e?.type?void 0:t?`success`:`error`,ao=({draw:e,dataSrid:n,set:r,bindings:i,labels:a={},map:o})=>{let s=!!(e?.save?.onSave||e?.select),[c,l]=no(!1),[u,d]=no(null),[f,p]=no(``),[m,h]=no(!1),[g,_]=no(0),[v,y]=no(()=>e?.form?.data??{}),b=Ka({form:e?.form,bindings:i}),x=to(()=>b.schema?t.validator.validateFormData(Ta(v,b.schema),b.schema)?.errors??[]:[],[v,b.schema]),S=eo({set:r,shape:u,dataSrid:n,select:e?.select,map:o}),C=()=>{l(!1),d(null),p(``),y(e?.form?.data??{})};return{drawable:s,drawing:c,shape:u,selection:S,note:f,form:e?.form?{schema:b.schema,uiSchema:b.uiSchema,data:v,errors:x,onChange:y,loading:b.loading,failed:b.failed}:void 0,saving:m,reload:g,setShape:d,setNote:p,startDrawing:()=>l(!0),finishDrawing:()=>l(!1),clearDrawing:C,saveShape:async()=>{if(!u||m)return;if(e.form&&!b.schema){console.error(`perun-atlas: nothing sent -- this row configures a form and its fields are not loaded.`);return}if(x.length){ro({type:`error`,response:a.saveIncomplete??`Some of these fields are mandatory and are empty. Nothing was sent.`}),console.error(`perun-atlas: nothing sent -- the form is not answerable as it stands:`,x.map(e=>`${e.property??``} ${e.message??``}`.trim()).join(`; `));return}let{context:t,units:r,tooSmall:s}=Ba(u,{draw:e,dataSrid:n,bindings:i,note:f,selected:S.context,form:v,map:o});if(s){ro({type:`error`,response:a.saveTooSmall??`This deployment stores geometry in EPSG:${n??`?`}, where ${Math.round(u.radius)} m is less than one unit. Nothing was sent.`}),console.error(`perun-atlas: a radius of ${Math.round(u.radius)} m is ${r} units in EPSG:${n}, which rounds to zero. A projection measured in degrees cannot carry an integer radius: send {draw.metres} for the size and {draw.ring} for the shape instead.`),console.error(`perun-atlas: the configured path is`,e.save.onSave);return}h(!0);let c=await za(e.save.onSave,t,{body:e.save.body===void 0?void 0:Ra(e.save.body,t),contentType:e.save.contentType,encoding:e.save.encoding,failure:e.save.failure});h(!1),c.ok&&(C(),_(e=>e+1)),ro({response:c.data||c.message,type:io(c.data,c.ok)})}}},oo=e=>JSON.stringify(e??{type:`FeatureCollection`,features:[]},null,2),so=(e,t=[])=>{let n=new Set([...Kn,...t]),r=new Set;return e.forEach(e=>{Object.entries(e?.properties??{}).forEach(([e,t])=>{n.has(e)||typeof t==`object`&&t||r.add(e)})}),[...r]},co=(e,{fields:t,exclude:n,labelResolver:r}={})=>t?.length?t.map(({field:e,label:t,short:n})=>({field:e,header:t&&r?.(t)||t||e,short:n})):so(e,n).map(e=>({field:e,header:r?.(e.toLowerCase())||e})),lo=e=>e.map(([e,t])=>`${e} ${t}`).join(`, `),uo=e=>e.map(e=>`(${lo(e)})`).join(`, `),fo={Point:([e,t])=>`POINT (${e} ${t})`,MultiPoint:e=>`MULTIPOINT (${lo(e)})`,LineString:e=>`LINESTRING (${lo(e)})`,MultiLineString:e=>`MULTILINESTRING (${uo(e)})`,Polygon:e=>`POLYGON (${uo(e)})`,MultiPolygon:e=>`MULTIPOLYGON (${e.map(e=>`(${uo(e)})`).join(`, `)})`},po=e=>{let t=fo[e?.type];return t&&e.coordinates?.length?t(e.coordinates):``},mo=e=>{if(e==null)return``;let t=String(e),n=!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t)&&/^[=+\-@\t\r]/.test(t)?`'${t}`:t;return/[",\r\n]/.test(n)?`"${n.replace(/"/g,`""`)}"`:n},ho=(e,{fields:t,exclude:n,labelResolver:r}={})=>{let i=e?.features??[],a=co(i,{fields:t,exclude:n,labelResolver:r}),o=e=>e?.geometry?.type??``,s=i.some(e=>/Point$/.test(o(e))),c=i.some(e=>o(e)&&!/Point$/.test(o(e))),l=[...a.map(e=>e.header),...s?[`latitude`,`longitude`]:[],...c?[`geometry`]:[]],u=i.map(e=>{let t=a.map(t=>mo(R(e?.properties,t.field)));if(s){let[n,r]=/^Point$/.test(o(e))?e.geometry.coordinates??[]:[];t.push(mo(r),mo(n))}return c&&t.push(mo(po(e?.geometry))),t});return[l.map(mo),...u].map(e=>e.join(`,`)).join(`\r
`)},go={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&apos;`},_o=e=>String(e).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g,``).replace(/[&<>"']/g,e=>go[e]),vo=e=>`<coordinates>${e.map(e=>e.join(`,`)).join(` `)}</coordinates>`,yo=e=>`<LinearRing>${vo(e)}</LinearRing>`,bo={Point:e=>`<Point>${vo([e])}</Point>`,LineString:e=>`<LineString><tessellate>1</tessellate>${vo(e)}</LineString>`,Polygon:([e,...t])=>`<Polygon><tessellate>1</tessellate><outerBoundaryIs>${yo(e)}</outerBoundaryIs>`+t.map(e=>`<innerBoundaryIs>${yo(e)}</innerBoundaryIs>`).join(``)+`</Polygon>`,MultiPoint:e=>`<MultiGeometry>${e.map(bo.Point).join(``)}</MultiGeometry>`,MultiLineString:e=>`<MultiGeometry>${e.map(bo.LineString).join(``)}</MultiGeometry>`,MultiPolygon:e=>`<MultiGeometry>${e.map(bo.Polygon).join(``)}</MultiGeometry>`},xo=e=>{let t=bo[e?.type];return t&&e.coordinates?.length?t(e.coordinates):``},So=(e,t,n)=>{let r=n?.(e),i=xo(e?.geometry),a=t.map(({field:t,header:n})=>{let r=R(e?.properties,t),i=r==null?``:_o(r);return`        <Data name="${_o(t)}"><displayName>${_o(n)}</displayName><value>${i}</value></Data>`});return[`    <Placemark>`,...r==null||r===``?[]:[`      <name>${_o(r)}</name>`],...a.length?[`      <ExtendedData>`,...a,`      </ExtendedData>`]:[],...i?[`      ${i}`]:[],`    </Placemark>`].join(`
`)},Co=(e,{fields:t,exclude:n,labelResolver:r,nameOf:i}={})=>{let a=e?.features??[],o=co(a,{fields:t,exclude:n,labelResolver:r});return[`<?xml version="1.0" encoding="UTF-8"?>`,`<kml xmlns="http://www.opengis.net/kml/2.2">`,`  <Document>`,...a.map(e=>So(e,o,i)),`  </Document>`,`</kml>`,``].join(`
`)},wo=`GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]`,To=1,Eo=3,Do=5,Oo=8,ko=[{name:`points`,types:[`Point`,`MultiPoint`]},{name:`lines`,types:[`LineString`,`MultiLineString`],shape:Eo},{name:`polygons`,types:[`Polygon`,`MultiPolygon`],shape:Do}],Ao=e=>Array.isArray(e)&&Number.isFinite(e[0])&&Number.isFinite(e[1]),jo=e=>Array.isArray(e)?e.filter(Ao):[],Mo=e=>{let[t,n]=[e[0],e[e.length-1]];return t[0]===n[0]&&t[1]===n[1]?e:[...e,t]},No=e=>{let t=0;for(let n=1;n<e.length;n+=1)t+=(e[n][0]-e[n-1][0])*(e[n][1]+e[n-1][1]);return t>0},Po=e=>{let[t,...n]=(Array.isArray(e)?e:[]).map(jo);return t?.length?[t,...n.filter(e=>e.length)].map(Mo).map((e,t)=>No(e)===(t===0)?e:[...e].reverse()):[]},Fo=e=>Array.isArray(e)?e.map(jo).filter(e=>e.length):[],Io={Point:e=>Ao(e)?[[e]]:[],MultiPoint:e=>{let t=jo(e);return t.length?[t]:[]},LineString:e=>Fo([e]),MultiLineString:Fo,Polygon:Po,MultiPolygon:e=>Array.isArray(e)?e.flatMap(Po):[]},Lo=e=>Io[e?.type]?.(e.coordinates)??[],Ro=e=>e.reduce(([e,t,n,r],[i,a])=>[Math.min(e,i),Math.min(t,a),Math.max(n,i),Math.max(r,a)],[1/0,1/0,-1/0,-1/0]),zo=(e,t,n)=>n.forEach((n,r)=>e.setFloat64(t+8*r,n,!0)),Bo=(e,t)=>{let n=t.reduce((e,t)=>e+t.length,0);return e===To?20:e===Oo?40+16*n:44+4*t.length+16*n},Vo=(e,t,n,r)=>{if(e.setInt32(t,n,!0),n===To){let[[[n,i]]]=r;e.setFloat64(t+4,n,!0),e.setFloat64(t+12,i,!0);return}let i=r.flat();zo(e,t+4,Ro(i));let a=t+36;if(n!==Oo&&(e.setInt32(a,r.length,!0),a+=4),e.setInt32(a,i.length,!0),a+=4,n!==Oo){let t=0;r.forEach(n=>{e.setInt32(a,t,!0),a+=4,t+=n.length})}i.forEach(([t,n])=>{e.setFloat64(a,t,!0),e.setFloat64(a+8,n,!0),a+=16})},Ho=(e,t,n)=>{e.setInt32(0,9994),e.setInt32(24,e.byteLength/2),e.setInt32(28,1e3,!0),e.setInt32(32,t,!0),zo(e,36,n)},Uo=(e,t)=>{let n=t.map(t=>Bo(e,t)),r=new DataView(new ArrayBuffer(n.reduce((e,t)=>e+8+t,100))),i=new DataView(new ArrayBuffer(100+8*t.length)),a=Ro(t.flatMap(e=>e.flat()));Ho(r,e,a),Ho(i,e,a);let o=100;return t.forEach((t,a)=>{i.setInt32(100+8*a,o/2),i.setInt32(104+8*a,n[a]/2),r.setInt32(o,a+1),r.setInt32(o+4,n[a]/2),Vo(r,o+8,e,t),o+=8+n[a]}),{shp:new Uint8Array(r.buffer),shx:new Uint8Array(i.buffer)}},Wo=10,Go=e=>{let t=new Set;return e.map(e=>{let n=String(e.short||e.field).replace(/[^A-Za-z0-9_]/g,`_`),r=(/[A-Za-z0-9]/.test(n)?n:`FIELD`).slice(0,Wo),i=r;for(let e=1;t.has(i.toUpperCase());e+=1){let t=`_${e}`;i=r.slice(0,Wo-t.length)+t}return t.add(i.toUpperCase()),{...e,short:i}})},Ko=new TextEncoder,qo=32,Jo=254,Yo=19,Xo=15,Zo=e=>{let t=Ko.encode(String(e));if(t.length<=Jo)return t;let n=Jo;for(;n>0&&(t[n]&192)==128;)--n;return t.subarray(0,n)},Qo=(e,t=0)=>e.reduce((e,t)=>Math.max(e,t),t),$o=e=>{for(let t=0;t<Xo;t+=1)if(Number(e.toFixed(t))===e)return t;return Xo},es=e=>{let t=Qo(e.filter(e=>e!==null).map($o)),n=e.map(e=>e===null?null:e.toFixed(t));if(n.some(e=>e?.includes(`e`)))return null;let r=Qo(n.map(e=>e?.length??0));return r<=Yo?{type:`N`,width:r,decimals:t,cells:n.map(e=>e&&Ko.encode(e))}:null},ts=e=>{let t=e.filter(e=>e!=null),n=e.map(e=>e===void 0?null:e);if(t.length&&t.every(e=>typeof e==`number`&&Number.isFinite(e))){let e=es(n);if(e)return e}if(t.length&&t.every(e=>typeof e==`boolean`))return{type:`L`,width:1,decimals:0,cells:n.map(e=>Ko.encode(e===null?`?`:e?`T`:`F`))};let r=n.map(e=>e===null?null:Zo(e));return{type:`C`,width:Qo(r.map(e=>e?.length??0),1),decimals:0,cells:r}},ns=(e,t,n)=>{let r=e.length?e.map(e=>({name:e.short,...ts(t.map(t=>R(t?.properties,e.field)))})):[{name:`FID`,...ts(t.map((e,t)=>t))}],i=32+32*r.length+1,a=r.reduce((e,t)=>e+t.width,1),o=new Uint8Array(i+a*t.length+1),s=new DataView(o.buffer);s.setUint8(0,3),s.setUint8(1,n.getFullYear()-1900),s.setUint8(2,n.getMonth()+1),s.setUint8(3,n.getDate()),s.setUint32(4,t.length,!0),s.setUint16(8,i,!0),s.setUint16(10,a,!0),r.forEach(({name:e,type:t,width:n,decimals:r},i)=>{let a=32+32*i;o.set(Ko.encode(e),a),s.setUint8(a+11,t.charCodeAt(0)),s.setUint8(a+16,n),s.setUint8(a+17,r)}),s.setUint8(i-1,13),o.fill(qo,i,o.length-1);let c=i;return t.forEach((e,t)=>{c+=1,r.forEach(({type:e,width:n,cells:r})=>{let i=r[t];i&&o.set(i,e===`N`?c+n-i.length:c),c+=n})}),s.setUint8(o.length-1,26),o},rs=e=>`﻿`+[[`short`,`column`,`header`],...e.map(({short:e,field:t,header:n})=>[e,t,n])].map(e=>e.map(mo).join(`,`)).join(`\r
`),is=(e,t,n)=>{let r=new Set(co(t,{exclude:n}).map(({field:e})=>e));return e.filter(({field:e})=>r.has(e))},as=(e,{stem:t=`features`,fields:n,exclude:r,labelResolver:i,today:a=new Date}={})=>{let o=e?.features??[],s=Go(co(o,{fields:n,exclude:r,labelResolver:i})),c=[];return ko.forEach(({name:e,types:i,shape:l})=>{let u=o.filter(e=>i.includes(e?.geometry?.type)).map(e=>({feature:e,parts:Lo(e.geometry)})).filter(({parts:e})=>e.length);if(!u.length)return;let d=l??(u.every(({feature:e})=>e.geometry.type===`Point`)?To:Oo),f=n?.length?s:is(s,u.map(({feature:e})=>e),r),{shp:p,shx:m}=Uo(d,u.map(({parts:e})=>e)),h=`${t}-${e}`;c.push({name:`${h}.shp`,bytes:p},{name:`${h}.shx`,bytes:m},{name:`${h}.dbf`,bytes:ns(f,u.map(({feature:e})=>e),a)},{name:`${h}.prj`,bytes:Ko.encode(wo)},{name:`${h}.cpg`,bytes:Ko.encode(`UTF-8`)})}),c.push({name:`${t}-fields.csv`,bytes:Ko.encode(rs(s))}),c},os=(()=>{let e=new Uint32Array(256);for(let t=0;t<256;t+=1){let n=t;for(let e=0;e<8;e+=1)n=n&1?3988292384^n>>>1:n>>>1;e[t]=n>>>0}return e})(),ss=e=>{let t=4294967295;for(let n=0;n<e.length;n+=1)t=os[(t^e[n])&255]^t>>>8;return(t^4294967295)>>>0},cs=async e=>{if(typeof CompressionStream>`u`)return null;let t;try{t=new CompressionStream(`deflate-raw`)}catch{return null}return new Uint8Array(await new Response(new Blob([e]).stream().pipeThrough(t)).arrayBuffer())},ls=e=>e.getHours()<<11|e.getMinutes()<<5|e.getSeconds()>>1,us=e=>Math.max(e.getFullYear()-1980,0)<<9|e.getMonth()+1<<5|e.getDate(),ds=2048,fs=0,ps=8,ms=async(e,{now:t=new Date,compress:n=!0}={})=>{let r=new TextEncoder,i=ls(t),a=us(t),o=[];for(let{name:t,bytes:i}of e){let e=n?await cs(i):null,a=e&&e.length<i.length?e:i;o.push({name:r.encode(t),method:a===i?fs:ps,crc:ss(i),size:i.length,packed:a})}let s=o.reduce((e,t)=>e+30+t.name.length+t.packed.length+46+t.name.length,22),c=new Uint8Array(s),l=new DataView(c.buffer),u=0,d=e=>{l.setUint16(u,e,!0),u+=2},f=e=>{l.setUint32(u,e,!0),u+=4},p=e=>{c.set(e,u),u+=e.length},m=e=>{d(20),d(ds),d(e.method),d(i),d(a),f(e.crc),f(e.packed.length),f(e.size),d(e.name.length),d(0)};o.forEach(e=>{e.offset=u,f(67324752),m(e),p(e.name),p(e.packed)});let h=u;o.forEach(e=>{f(33639248),d(20),m(e),d(0),d(0),d(0),f(0),f(e.offset),p(e.name)});let g=u-h;return f(101010256),d(0),d(0),d(o.length),d(o.length),f(g),f(h),d(0),c},hs=({set:e,selection:t,exportable:n,labelResolver:r,timeScoped:i,range:a,srid:o,map:s,drawnWith:c})=>{let l=n===!1?null:n&&n!==!0?n:{},u=!!(t?.selecting&&t.feedsExport&&t.count>0),d=u?{type:`FeatureCollection`,features:t.inside}:e,f=l&&d&&(d.features?.length??0)>0,p=[l?.filename??`features`,u?`within-${Math.round(t.radius??0)||`shape`}`:null,i?`${a.from}_${a.to}`:ma()].filter(Boolean).join(`-`),m=()=>O(d,o,s),h=e=>{let t=l?.name?R(e?.properties,l.name):null;return t==null||t===``?$n(c?.(e),e):String(t)},g={fields:l?.fields,exclude:l?.exclude,labelResolver:r};return{offer:l,canExport:f,saveGeoJSON:()=>vt(`${p}.geojson`,oo(m()),`application/geo+json`),saveCSV:()=>vt(`${p}.csv`,ho(m(),g),`text/csv;charset=utf-8`),saveKML:()=>vt(`${p}.kml`,Co(m(),{...g,nameOf:h}),`application/vnd.google-earth.kml+xml`),saveShapefile:async()=>vt(`${p}.zip`,await ms(as(m(),{...g,stem:p})),`application/zip`)}};function J(e,t){return Array.from(e.getElementsByTagName(t))}function gs(e){return e[0]===`#`?e:`#${e}`}function _s(e,t,n){return Array.from(e.getElementsByTagNameNS(n,t))}function Y(e){return e?.normalize(),e?.textContent||``}function X(e,t,n){let r=e.getElementsByTagName(t),i=r.length?r[0]:null;return i&&n&&n(i),i}function Z(e,t,n){let r={};if(!e)return r;let i=e.getElementsByTagName(t),a=i.length?i[0]:null;return a&&n?n(a,r):r}function vs(e,t,n){let r=Y(X(e,t));return r&&n&&n(r)||{}}function ys(e,t,n){let r=Number.parseFloat(Y(X(e,t)));if(!Number.isNaN(r))return r&&n&&n(r)||{}}function Q(e,t,n){let r=Number.parseFloat(Y(X(e,t)));if(!Number.isNaN(r))return n&&n(r),r}function bs(e,t){let n={};for(let r of t)vs(e,r,e=>{n[r]=e});return n}function xs(e){return e?.nodeType===1}function Ss(e){let t=[];if(e===null)return t;for(let n of Array.from(e.childNodes)){if(!xs(n))continue;let e=Cs(n.nodeName);if(e===`gpxtpx:TrackPointExtension`)t=t.concat(Ss(n));else{let r=Y(n);t.push([e,ws(r)])}}return t}function Cs(e){return[`heart`,`gpxtpx:hr`,`hr`].includes(e)?`heart`:e}function ws(e){let t=Number.parseFloat(e);return Number.isNaN(t)?e:t}function Ts(e){let t=[Number.parseFloat(e.getAttribute(`lon`)||``),Number.parseFloat(e.getAttribute(`lat`)||``)];if(Number.isNaN(t[0])||Number.isNaN(t[1]))return null;Q(e,`ele`,e=>{t.push(e)});let n=X(e,`time`);return{coordinates:t,time:n?Y(n):null,extendedValues:Ss(X(e,`extensions`))}}function Es(e){return Z(e,`line`,e=>Object.assign({},vs(e,`color`,e=>({stroke:`#${e}`})),ys(e,`opacity`,e=>({"stroke-opacity":e})),ys(e,`width`,e=>({"stroke-width":e*96/25.4}))))}function Ds(e,t){let n=bs(t,[`name`,`cmt`,`desc`,`type`,`time`,`keywords`]);for(let[r,i]of e)for(let e of Array.from(t.getElementsByTagNameNS(i,`*`)))n[e.tagName.replace(`:`,`_`)]=Y(e)?.trim();let r=J(t,`link`);return r.length&&(n.links=r.map(e=>Object.assign({href:e.getAttribute(`href`)},bs(e,[`text`,`type`])))),n}function Os(e,t){let n=J(e,t),r=[],i=[],a={};for(let e=0;e<n.length;e++){let t=Ts(n[e]);if(t){r.push(t.coordinates),t.time&&i.push(t.time);for(let[r,i]of t.extendedValues){let t=r===`heart`?r:`${r.replace(`gpxtpx:`,``)}s`;a[t]||(a[t]=Array(n.length).fill(null)),a[t][e]=i}}}if(!(r.length<2))return{line:r,times:i,extendedValues:a}}function ks(e,t){let n=Os(t,`rtept`);if(n)return{type:`Feature`,properties:Object.assign({_gpxType:`rte`},Ds(e,t),Es(X(t,`extensions`))),geometry:{type:`LineString`,coordinates:n.line}}}function As(e,t){let n=J(t,`trkseg`),r=[],i=[],a=[];for(let e of n){let t=Os(e,`trkpt`);t&&(a.push(t),t.times?.length&&i.push(t.times))}if(a.length===0)return null;let o=a.length>1,s=Object.assign({_gpxType:`trk`},Ds(e,t),Es(X(t,`extensions`)),i.length?{coordinateProperties:{times:o?i:i[0]}}:{});for(let e=0;e<a.length;e++){let t=a[e];r.push(t.line),s.coordinateProperties||(s.coordinateProperties={});let n=s.coordinateProperties;for(let[r,i]of Object.entries(t.extendedValues))o?(n[r]||(n[r]=a.map(e=>Array(e.line.length).fill(null))),n[r][e]=i):n[r]=i}return{type:`Feature`,properties:s,geometry:o?{type:`MultiLineString`,coordinates:r}:{type:`LineString`,coordinates:r[0]}}}function js(e,t){let n=Object.assign(Ds(e,t),bs(t,[`sym`])),r=Ts(t);return r?{type:`Feature`,properties:n,geometry:{type:`Point`,coordinates:r.coordinates}}:null}function*Ms(e){let t=e,n=`http://www.garmin.com/xmlschemas/GpxExtensions/v3`,r=[[`gpxx`,n]],i=t.getElementsByTagName(`gpx`)[0]?.attributes;if(i)for(let e of Array.from(i))e.name?.startsWith(`xmlns:`)&&e.value!==n&&r.push([e.name,e.value]);for(let e of J(t,`trk`)){let t=As(r,e);t&&(yield t)}for(let e of J(t,`rte`)){let t=ks(r,e);t&&(yield t)}for(let e of J(t,`wpt`)){let t=js(r,e);t&&(yield t)}}function Ns(e){return{type:`FeatureCollection`,features:Array.from(Ms(e))}}function Ps(e,t){let n={},r=t===`stroke`||t===`fill`?t:`${t}-color`;return e[0]===`#`&&(e=e.substring(1)),e.length===6||e.length===3?n[r]=`#${e}`:e.length===8&&(n[`${t}-opacity`]=Number.parseInt(e.substring(0,2),16)/255,n[r]=`#${e.substring(6,8)}${e.substring(4,6)}${e.substring(2,4)}`),n}function Fs(e,t,n){let r={};return Q(e,t,e=>{r[n]=e}),r}function Is(e,t){return Z(e,`color`,e=>Ps(Y(e),t))}function Ls(e){return Z(e,`Icon`,(e,t)=>(vs(e,`href`,e=>{t.icon=e}),t))}function Rs(e){return Z(e,`IconStyle`,e=>Object.assign(Is(e,`icon`),Fs(e,`scale`,`icon-scale`),Fs(e,`heading`,`icon-heading`),Z(e,`hotSpot`,e=>{let t=Number.parseFloat(e.getAttribute(`x`)||``),n=Number.parseFloat(e.getAttribute(`y`)||``),r=e.getAttribute(`xunits`)||``,i=e.getAttribute(`yunits`)||``;return!Number.isNaN(t)&&!Number.isNaN(n)?{"icon-offset":[t,n],"icon-offset-units":[r,i]}:{}}),Ls(e)))}function zs(e){return Z(e,`LabelStyle`,e=>Object.assign(Is(e,`label`),Fs(e,`scale`,`label-scale`)))}function Bs(e){return Z(e,`LineStyle`,e=>Object.assign(Is(e,`stroke`),Fs(e,`width`,`stroke-width`)))}function Vs(e){return Z(e,`PolyStyle`,(e,t)=>Object.assign(t,Z(e,`color`,e=>Ps(Y(e),`fill`)),vs(e,`fill`,e=>{if(e===`0`)return{"fill-opacity":0}}),vs(e,`outline`,e=>{if(e===`0`)return{"stroke-opacity":0}})))}function Hs(e){return Object.assign({},Vs(e),Bs(e),zs(e),Rs(e))}var Us=/\s*/g,Ws=/^\s*|\s*$/g,Gs=/\s+/;function Ks(e){return e.replace(Us,``).split(`,`).map(Number.parseFloat).filter(e=>!Number.isNaN(e)).slice(0,3)}function qs(e){return e.replace(Ws,``).split(Gs).map(Ks).filter(e=>e.length>=2)}function Js(e){let t=J(e,`coord`);t.length===0&&(t=_s(e,`coord`,`*`));let n=t.map(e=>Y(e).split(` `).map(Number.parseFloat));return n.length===0?null:{geometry:n.length>2?{type:`LineString`,coordinates:n}:{type:`Point`,coordinates:n[0]},times:J(e,`when`).map(e=>Y(e))}}function Ys(e){if(e.length===0)return e;let t=e[0],n=e[e.length-1],r=!0;for(let e=0;e<Math.max(t.length,n.length);e++)if(t[e]!==n[e]){r=!1;break}return r?e:e.concat([e[0]])}function Xs(e){return Y(X(e,`coordinates`))}function Zs(e){let t=[],n=[];for(let r=0;r<e.childNodes.length;r++){let i=e.childNodes.item(r);if(xs(i))switch(i.tagName){case`MultiGeometry`:case`MultiTrack`:case`gx:MultiTrack`:{let e=Zs(i);t=t.concat(e.geometries),n=n.concat(e.coordTimes);break}case`Point`:{let e=Ks(Xs(i));e.length>=2&&t.push({type:`Point`,coordinates:e});break}case`LinearRing`:case`LineString`:{let e=qs(Xs(i));e.length>=2&&t.push({type:`LineString`,coordinates:e});break}case`Polygon`:{let e=[];for(let t of J(i,`LinearRing`)){let n=Ys(qs(Xs(t)));n.length>=4&&e.push(n)}e.length&&t.push({type:`Polygon`,coordinates:e});break}case`Track`:case`gx:Track`:{let e=Js(i);if(!e)break;let{times:r,geometry:a}=e;t.push(a),r.length&&n.push(r);break}}}return{geometries:t,coordTimes:n}}var Qs=e=>Number(e),$s={string:e=>e,int:Qs,uint:Qs,short:Qs,ushort:Qs,float:Qs,double:Qs,bool:e=>!!e};function ec(e,t){return Z(e,`ExtendedData`,(e,n)=>{for(let t of J(e,`Data`))n[t.getAttribute(`name`)||``]=Y(X(t,`value`));for(let r of J(e,`SimpleData`)){let e=r.getAttribute(`name`)||``;n[e]=(t[e]||$s.string)(Y(r))}return n})}function tc(e){let t=X(e,`description`);for(let e of Array.from(t?.childNodes||[]))if(e.nodeType===4)return{description:{"@type":`html`,value:Y(e)}};return{}}function nc(e){return Z(e,`TimeSpan`,e=>({timespan:{begin:Y(X(e,`begin`)),end:Y(X(e,`end`))}}))}function rc(e){return Z(e,`TimeStamp`,e=>({timestamp:Y(X(e,`when`))}))}function ic(e,t){return vs(e,`styleUrl`,e=>(e=gs(e),t[e]?Object.assign({styleUrl:e},t[e]):{styleUrl:e}))}var $;(function(e){e.ABSOLUTE=`absolute`,e.RELATIVE_TO_GROUND=`relativeToGround`,e.CLAMP_TO_GROUND=`clampToGround`,e.CLAMP_TO_SEAFLOOR=`clampToSeaFloor`,e.RELATIVE_TO_SEAFLOOR=`relativeToSeaFloor`})($||($={}));function ac(e){switch(e?.textContent){case $.ABSOLUTE:return $.ABSOLUTE;case $.CLAMP_TO_GROUND:return $.CLAMP_TO_GROUND;case $.CLAMP_TO_SEAFLOOR:return $.CLAMP_TO_SEAFLOOR;case $.RELATIVE_TO_GROUND:return $.RELATIVE_TO_GROUND;case $.RELATIVE_TO_SEAFLOOR:return $.RELATIVE_TO_SEAFLOOR}return null}function oc(e){return X(e,`gx:LatLonQuad`)?{geometry:{type:`Polygon`,coordinates:[Ys(qs(Xs(e)))]}}:lc(e)}var sc=Math.PI/180;function cc(e,t,n){let r=[(e[0]+e[2])/2,(e[1]+e[3])/2];return[t[0].map(e=>{let t=e[1]-r[1],i=e[0]-r[0],a=Math.sqrt(t**2+i**2),o=Math.atan2(t,i)+n*sc;return[r[0]+Math.cos(o)*a,r[1]+Math.sin(o)*a]})]}function lc(e){let t=X(e,`LatLonBox`);if(t){let e=Q(t,`north`),n=Q(t,`west`),r=Q(t,`east`),i=Q(t,`south`),a=Q(t,`rotation`);if(typeof e==`number`&&typeof i==`number`&&typeof n==`number`&&typeof r==`number`){let t=[n,i,r,e],o=[[[n,e],[r,e],[r,i],[n,i],[n,e]]];return typeof a==`number`&&(o=cc(t,o,a)),{bbox:t,geometry:{type:`Polygon`,coordinates:o}}}}return null}function uc(e,t,n,r){let i=oc(e),a=i?.geometry||null;if(!a&&r.skipNullGeometry)return null;let o={type:`Feature`,geometry:a,properties:Object.assign({"@geometry-type":`groundoverlay`},bs(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`description`]),tc(e),ic(e,t),Hs(e),Ls(e),ec(e,n),nc(e),rc(e))};i?.bbox&&(o.bbox=i.bbox),o.properties?.visibility!==void 0&&(o.properties.visibility=o.properties.visibility!==`0`);let s=e.getAttribute(`id`);return s!==null&&s!==``&&(o.id=s),o}function dc(e){let t=X(e,`Region`);return t?{coordinateBox:pc(t),lod:fc(e)}:null}function fc(e){let t=X(e,`Lod`);return t?[Q(t,`minLodPixels`)??-1,Q(t,`maxLodPixels`)??-1,Q(t,`minFadeExtent`)??null,Q(t,`maxFadeExtent`)??null]:null}function pc(e){let t=X(e,`LatLonAltBox`);if(t){let e=Q(t,`north`),n=Q(t,`west`),r=Q(t,`east`),i=Q(t,`south`);if(ac(X(t,`altitudeMode`)||X(t,`gx:altitudeMode`))&&console.debug(`Encountered an unsupported feature of KML for togeojson: please contact developers for support of altitude mode.`),typeof e==`number`&&typeof i==`number`&&typeof n==`number`&&typeof r==`number`)return{bbox:[n,i,r,e],geometry:{type:`Polygon`,coordinates:[[[n,e],[r,e],[r,i],[n,i],[n,e]]]}}}return null}function mc(e){let t=X(e,`Link`);return t?bs(t,[`href`,`refreshMode`,`refreshInterval`,`viewRefreshMode`,`viewRefreshTime`,`viewBoundScale`,`viewFormat`,`httpQuery`]):{}}function hc(e,t,n,r){let i=dc(e),a=i?.coordinateBox?.geometry||null;if(!a&&r.skipNullGeometry)return null;let o={type:`Feature`,geometry:a,properties:Object.assign({"@geometry-type":`networklink`},bs(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`styleUrl`,`refreshVisibility`,`flyToView`,`description`]),tc(e),ic(e,t),Hs(e),Ls(e),ec(e,n),nc(e),rc(e),mc(e),i?.lod?{lod:i.lod}:{})};i?.coordinateBox?.bbox&&(o.bbox=i.coordinateBox.bbox),o.properties?.visibility!==void 0&&(o.properties.visibility=o.properties.visibility!==`0`);let s=e.getAttribute(`id`);return s!==null&&s!==``&&(o.id=s),o}function gc(e){return e.length===0?null:e.length===1?e[0]:{type:`GeometryCollection`,geometries:e}}function _c(e,t,n,r){let{coordTimes:i,geometries:a}=Zs(e),o=gc(a);if(!o&&r.skipNullGeometry)return null;let s={type:`Feature`,geometry:o,properties:Object.assign(bs(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`description`]),tc(e),ic(e,t),Hs(e),ec(e,n),nc(e),rc(e),i.length?{coordinateProperties:{times:i.length===1?i[0]:i}}:{})};s.properties?.visibility!==void 0&&(s.properties.visibility=s.properties.visibility!==`0`);let c=e.getAttribute(`id`);return c!==null&&c!==``&&(s.id=c),s}function vc(e){let t=e.getAttribute(`id`),n=e.parentNode;return!t&&xs(n)&&n.localName===`CascadingStyle`&&(t=n.getAttribute(`kml:id`)||n.getAttribute(`id`)),gs(t||``)}function yc(e){let t={};for(let n of J(e,`Style`))t[vc(n)]=Hs(n);for(let n of J(e,`StyleMap`)){let e=gs(n.getAttribute(`id`)||``);vs(n,`styleUrl`,n=>{n=gs(n),t[n]&&(t[e]=t[n])})}return t}function bc(e){let t={};for(let n of J(e,`SimpleField`))t[n.getAttribute(`name`)||``]=$s[n.getAttribute(`type`)||``]||$s.string;return t}function*xc(e,t={skipNullGeometry:!1}){let n=e,r=yc(n),i=bc(n);for(let e of J(n,`Placemark`)){let n=_c(e,r,i,t);n&&(yield n)}for(let e of J(n,`GroundOverlay`)){let n=uc(e,r,i,t);n&&(yield n)}for(let e of J(n,`NetworkLink`)){let n=hc(e,r,i,t);n&&(yield n)}}function Sc(e,t={skipNullGeometry:!1}){return{type:`FeatureCollection`,features:Array.from(xc(e,t))}}var Cc={bytes:20971520,positions:2e5},wc=(e,t=Cc)=>e>t.bytes?{refused:`tooLarge`,size:e,limit:t.bytes}:null,Tc=e=>new DOMParser().parseFromString(e,`application/xml`),Ec=e=>!e?.documentElement||e.getElementsByTagName(`parsererror`).length>0,Dc=e=>({type:`Feature`,...e.id!==void 0&&{id:e.id},properties:e.properties&&typeof e.properties==`object`?e.properties:{},geometry:e.geometry??null}),Oc=new Set([`Point`,`MultiPoint`,`LineString`,`MultiLineString`,`Polygon`,`MultiPolygon`,`GeometryCollection`]),kc=e=>{let t;try{t=JSON.parse(e)}catch{return null}return t?.type===`FeatureCollection`&&Array.isArray(t.features)?{type:`FeatureCollection`,features:t.features.filter(e=>e?.type===`Feature`).map(Dc)}:t?.type===`Feature`?{type:`FeatureCollection`,features:[Dc(t)]}:Oc.has(t?.type)?{type:`FeatureCollection`,features:[Dc({geometry:t})]}:null},Ac=[`Style`,`StyleMap`,`styleUrl`],jc=e=>(Ac.forEach(t=>{Array.from(e.getElementsByTagName(t)).forEach(e=>e.parentNode?.removeChild(e))}),e),Mc=e=>{let t=e.properties?.description;return t&&typeof t==`object`&&`value`in t?{...e,properties:{...e.properties,description:String(t.value??``)}}:e},Nc=e=>({type:`FeatureCollection`,features:Sc(jc(e),{skipNullGeometry:!0}).features.map(Mc).map(Dc)}),Pc=e=>({type:`FeatureCollection`,features:Ns(e).features.map(Dc)}),Fc=(e,t)=>{let n;try{n=t(e)}catch{return null}if(Ec(n))return null;let r=n.documentElement.localName??n.documentElement.nodeName;return r===`kml`?{format:`kml`,collection:Nc(n)}:r===`gpx`?{format:`gpx`,collection:Pc(n)}:null},Ic=e=>{let[t,n]=e;return!Number.isFinite(t)||!Number.isFinite(n)?`unreadable`:Math.abs(t)>180||Math.abs(n)>90?`notDegrees`:null},Lc=(e,t=``)=>{let n=new Uint8Array(e,0,Math.min(4,e.byteLength));return n[0]===80&&n[1]===75&&(n[2]===3&&n[3]===4||n[2]===5&&n[3]===6)?`zip`:n[0]===0&&n[1]===0&&n[2]===39&&n[3]===10?`shp`:/\.(dbf|shx|prj|cpg)$/i.test(t)?`part`:`text`},Rc=({format:e,collection:t},n)=>{let r=t.features.map(e=>({feature:e,positions:g(e.geometry)})).filter(({positions:e})=>e.length>0);if(r.length===0)return{refused:`empty`};let i=r.reduce((e,t)=>e+t.positions.length,0);if(i>n.positions)return{refused:`tooManyPoints`,count:i,limit:n.positions};for(let e of r)for(let t of e.positions){let e=Ic(t);if(e)return{refused:e}}return{format:e,collection:{type:`FeatureCollection`,features:r.map(({feature:e})=>e)},positions:i}},zc=(e,{parse:t=Tc,limits:n=Cc}={})=>{let r=String(e??``).replace(/^﻿/,``).trimStart(),i=null;try{if(r.startsWith(`{`)){let e=kc(r);i=e&&{format:`geojson`,collection:e}}else r.startsWith(`<`)&&(i=Fc(r,t))}catch(e){console.warn(`perun-atlas: a file could not be read`,e),i=null}return i?Rc(i,n):{refused:`unreadable`}},Bc=e=>{let t=new Set(e.flatMap(({collection:e})=>e.features.flatMap(e=>Object.keys(e?.properties??{})))),n=`layer`;for(let e=2;t.has(n);e+=1)n=`layer_${e}`;return n},Vc=(e,{limits:t=Cc}={})=>{if(e.refused)return e;let n=e.layers.length>1?Bc(e.layers):null,r=e.layers.flatMap(({name:e,collection:t})=>t.features.map(t=>{let r=Dc(t);return n?{...r,properties:{[n]:e,...r.properties}}:r})),i=e.layers.some(e=>e.assumed),a=Rc({format:`shapefile`,collection:{type:`FeatureCollection`,features:r}},t);return a.refused===`notDegrees`&&i?{refused:`noPrj`}:a.refused?a:{...a,assumed:i}},Hc={shp:`shp.perun-atlas.js?v=d5c16b00062c`},Uc=typeof document>`u`?null:document.currentScript?.src||null,Wc=()=>Uc??(typeof document>`u`?null:Array.from(document.scripts).find(e=>/\/perun-atlas\.js(\?|$)/.test(e.src))?.src??null),Gc=(e,t,n=Hc)=>t&&n[e]?new URL(n[e],t).href:null,Kc=new Map,qc=(e,{base:t=Wc(),files:n=Hc,load:r=e=>import(e)}={})=>{if(!Kc.has(e)){let i=Gc(e,t,n),a=i?r(i):Promise.reject(Error(`perun-atlas: cannot tell where the ${e} module is. It is loaded from beside perun-atlas.js, and that script could not be found.`));a.catch(()=>Kc.delete(e)),Kc.set(e,a)}return Kc.get(e)},{useRef:Jc,useState:Yc}=t.React,Xc=()=>new Promise(e=>{requestAnimationFrame(()=>setTimeout(e,0))}),Zc=async e=>{let t=await e.arrayBuffer(),n=Lc(t,e.name);if(n===`text`)return zc(new TextDecoder().decode(t));if(n===`part`)return{refused:`shapefilePart`};let r;try{r=await qc(`shp`)}catch(e){return console.warn(`perun-atlas: the shapefile reader could not be loaded`,e),{refused:`readerUnavailable`}}return Vc(await r.readShapefile(t,{kind:n,limit:Cc.bytes}))},Qc=({overlay:e,labels:t,onChange:n})=>{let r=e!==!1,[i,a]=Yc(null),[o,s]=Yc(null),[c,l]=Yc(null),[u,d]=Yc(null),f=Jc(null),p=Jc(0),m=()=>f.current?.click(),h=async e=>{let r=++p.current,i=wc(e.size);if(!i){if(d(e.name),await Xc(),r!==p.current)return;try{i=await Zc(e)}catch(e){console.warn(`perun-atlas: a file could not be read`,e),i={refused:`unreadable`}}}r===p.current&&(i.refused?(d(null),s(Qi(i,e.name,t))):(s(null),l(i.assumed?Xi(e.name,t):null),a({name:e.name,collection:i.collection,count:i.collection.features.length}),n?.()))},g=e=>{let t=e.target.files?.[0];e.target.value=``,t&&h(t)},_=()=>{p.current+=1,d(null),l(null),a(null),n?.()};return{offered:r,file:i,refusal:o,note:c,opening:u,inputRef:f,choose:m,onPicked:g,close:_,drawn:()=>d(null),failed:()=>{i&&(s(Qi({refused:`unreadable`},i.name,t)),_())},dismiss:()=>s(null),dismissNote:()=>l(null)}},{useState:$c}=t.React,el=({coloured:e})=>{let[t,n]=$c(null),[r,i]=$c(!0),a=e?{values:[],usedFallback:!1}:[],[o,s]=$c(a),[c,l]=$c(null),u=t===null?null:c??t,[d,f]=$c(null);return{set:t,visible:u,loading:r,drawn:o,extent:d,setDrawn:s,setShown:l,setExtent:f,onFetchStart:()=>{i(!0),s(a)},onFetched:e=>{n(e??{features:[]}),i(!1)},onFetchFailed:()=>{n({features:[]}),l(null),f(null),i(!1)},forget:()=>n(null)}},{useEffect:tl,useState:nl}=t.React,rl=({subject:e,drawing:t})=>{let[n,r]=nl(null),i=t=>Qr(t,e?.id,e?.match);return tl(()=>{if(!n)return;let e=e=>{e.key===`Escape`&&r(null)};return document.addEventListener(`keydown`,e),()=>document.removeEventListener(`keydown`,e)},[n]),{record:n,openRecord:(e,n)=>{t||n&&r(n)},closeRecord:()=>r(null),isSubject:i,descriptorFor:t=>e?.descriptor&&i(t)?e.descriptor:null,isPinnedFeature:e=>i(e)}},il=[`map`,`at`,`base`,`from`,`to`],al=/^\d{4}-\d{2}-\d{2}$/,ol=e=>{let t=Math.max(e.indexOf(`#`),0),n=e.indexOf(`?`,t);return n===-1?{head:e,query:``}:{head:e.slice(0,n),query:e.slice(n+1)}},sl=e=>al.test(e??``)&&new Date(`${e}T00:00:00Z`).toISOString().slice(0,10)===e,cl=(e,t)=>String(Number(e.toFixed(t))),ll=e=>((e+180)%360+360)%360-180,ul=(e,t)=>{if(t==null||t===``)return null;let n=new URLSearchParams(ol(e).query);if(n.get(`map`)!==String(t))return null;let r={},i=(n.get(`at`)??``).split(`,`);if(i.length===3&&i.every(e=>e.trim()!==``)){let[e,t,n]=i.map(Number);Math.abs(e)<=90&&Math.abs(t)<=180&&n>=0&&n<=30&&(r.center=[e,t],r.zoom=n)}let a=n.get(`base`);a&&(r.basemap=a);let o=n.get(`from`),s=n.get(`to`);return sl(o)&&sl(s)&&o<=s&&(r.from=o,r.to=s),r},dl=(e,t,{center:n,zoom:r,basemap:i,from:a,to:o}={})=>{let{head:s,query:c}=ol(e),l=new URLSearchParams(c);return il.forEach(e=>l.delete(e)),l.set(`map`,String(t)),n&&Number.isFinite(r)&&l.set(`at`,[cl(n[0],6),cl(ll(n[1]),6),cl(r,2)].join(`,`)),i&&l.set(`base`,i),a&&o&&(l.set(`from`,a),l.set(`to`,o)),`${s}?${l.toString().replace(/%2C/gi,`,`)}`},fl=new Set,pl=(e,t)=>{if(fl.has(e))return null;let n=ul(e,t);return n&&fl.add(e),n},{useEffect:ml,useRef:hl,useState:gl}=t.React,_l=2e3,vl=({linkId:e,link:t,timeScoped:n,range:r,labels:i={}})=>{let a=e!=null&&e!==``&&t!==!1,o=hl(null),[s,c]=gl(!1);return ml(()=>{if(!s)return;let e=setTimeout(()=>c(!1),_l);return()=>clearTimeout(e)},[s]),{offered:a,copied:s,attach:({map:e,basemap:t})=>{o.current={map:e,basemap:t}},copy:async t=>{let{map:a,basemap:s}=o.current??{};if(!a)return;let l=a.getCenter(),u=dl(window.location.href,e,{center:[l.lat,l.lng],zoom:a.getZoom(),basemap:ke(s,a),...n&&{from:r.from,to:r.to}});await yt(u,t?.parentNode??void 0)?c(!0):window.prompt(i.copyLinkPrompt??`Copy this link:`,u)}}};G(`/* Structure only; the look is the deployment's \`atlas-panel.css\`, which wins because the build puts
   this at the top of \`<head>\` (\`stylesAtTopOfHead\` in vite.config.mjs). Scoped under \`.atlas-panel\`,
   since the Leaflet container is spatial's single instance and a bare rule would follow it. */

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
  /* \`min-width: 0\` so a long title ellipsises rather than widening the flex item. */
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

/* One row, so a record opens next to what it describes. \`min-height: 0\`, or the flex item will not
   shrink and pushes the footer off the bottom. */
.atlas-panel__body {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
}

/* A floor, not a height: many containers, a bootstrap modal body among them, give the panel no
   height of their own. A token, so a menu row can set \`"--ap-map-height"\` in \`tokens\`. */
.atlas-panel__mapwrap {
  position: relative;
  flex: 1 1 auto;
  min-height: var(--ap-map-height, 55vh);
  /* The map gives way when the pane opens, which a flex item will not do without this. */
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

/* A fixed column, so a short record and a long one resize the map alike. Only the list scrolls. */
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
  /* \`min-height: 0\`, or a long record pushes past the pane and is clipped instead of scrolling. */
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.atlas-panel__detailsrow {
  min-width: 0;
}

.atlas-panel__detailsrow dt,
.atlas-panel__detailsrow dd {
  margin: 0;
  /* Identifiers and addresses have no spaces to break at. */
  overflow-wrap: anywhere;
}

/* Under the map on a narrow screen, at most half the height so the map stays in view. */
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
  /* Above Leaflet's panes and controls. */
  z-index: 1001;
  pointer-events: none;
}

.atlas-panel__emptycard {
  position: relative;
  pointer-events: auto;
  max-width: 22rem;
  padding: 16px 20px;
  text-align: center;
  background: #fff;
}

/* Two classes, so the size wins over a deployment's single-class \`.atlas-panel__close\`. */
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

.atlas-panel__emptycard .atlas-panel__emptytitle {
  padding-inline: 32px;
}

/* Ships with the component, or the switch toggles a class nothing reads. CSS can hide an open label
   but not open one, so the zoom band still decides what shows. */
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

/* \`margin-inline-start: auto\` rather than a spacer, so the group can still wrap onto its own line. */
.atlas-panel__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-inline-start: auto;
}

/* Two classes deep, so this holds whatever the deployment does to \`.atlas-panel__btn\`. */
.atlas-panel__actions .atlas-panel__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* Not perun-core's \`Loading\`, whose \`.fade-wrapper\` blacks out the whole viewport at z-index 9999.
   \`pointer-events: none\` keeps the map usable while a request is out. */
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

@media (prefers-reduced-motion: reduce) {
  .atlas-panel__spinner { animation-duration: 2.4s; }
}
`);var{useEffect:yl,useMemo:bl,useState:xl}=t.React,Sl=({session:e,servicePath:n,context:r,descriptors:i,labelResolver:a,cluster:o,subject:s,presets:c=[],defaultMonths:l,labels:u={},map:d,exportable:f,overlay:p,legend:m=!0,notice:h=!0,tokens:g,title:_,choropleth:v,draw:y,view:b,linkId:x,link:S,className:C=``,onClose:w})=>{let[T,ee]=xl(!0),[E,D]=xl(!!b?.center),O=()=>{E&&D(!1)},[k,A]=xl(null),[j,te]=xl(void 0),[ne,M]=xl(!1),{timeScoped:N,preset:P,range:F,initial:re,longest:ie,applyPreset:ae,onRangeChange:I}=ya({presets:c,defaultMonths:l,servicePath:n,opening:b?.from&&b?.to?{from:b.from,to:b.to}:void 0,onMoved:()=>{Se(),Ve()}}),L=bl(()=>({...r||{},...N&&{from:F.from,to:F.to},...k&&{srid:k}}),[r,N,F.from,F.to,k]),oe=JSON.stringify(L),{coloured:se,statusPath:ce,rows:le,tooltip:ue}=fa({choropleth:v,bindings:L,bindingKey:oe}),{set:de,visible:fe,loading:pe,drawn:me,extent:he,setDrawn:ge,setShown:_e,setExtent:ve,onFetchStart:ye,onFetched:be,onFetchFailed:xe,forget:Se}=el({coloured:se}),[Ce,we]=xl([]),Te=e=>we(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e]),Ee=()=>we([]),[De,Oe]=xl(null),{drawable:ke,drawing:Ae,shape:R,selection:z,note:B,form:je,saving:V,reload:Me,setShape:Ne,setNote:Pe,startDrawing:Fe,finishDrawing:Ie,clearDrawing:Le,saveShape:Re}=ao({draw:y,dataSrid:k,set:fe,bindings:L,labels:u,map:j}),{record:ze,openRecord:Be,closeRecord:Ve,descriptorFor:He,isPinnedFeature:Ue}=rl({subject:s,drawing:Ae}),H=Qc({overlay:p,labels:u,onChange:()=>we(e=>e.filter(e=>e!==or))}),{file:We}=H;yl(()=>{ze?.file&&ze.file!==We&&Ve()},[We]);let Ge=hs({set:fe,selection:z,exportable:f,labelResolver:a,timeScoped:N,range:F,srid:k,map:j,drawnWith:e=>se?i?.[v.descriptor]:Xn(i?.[He(e)??Xr(e)],e)}),Ke=vl({linkId:x,link:S,timeScoped:N,range:F,labels:u}),qe=!pe&&de!==null&&(de.features?.length??0)===0&&h!==!1&&!Ae&&!R&&!We&&De!==oe;return t.React.createElement(`div`,{className:`atlas-panel ${C}${T?``:` atlas-panel--nolabels`}`.trim(),style:g},t.React.createElement(`header`,{className:`atlas-panel__header`},t.React.createElement(`div`,{className:`atlas-panel__title`},_),w&&t.React.createElement(Vi,{label:u.close??`Close`,onClick:w})),t.React.createElement(`div`,{className:`atlas-panel__toolbar`},N&&t.React.createElement(sa,{range:F,onRangeChange:I,presets:c,preset:P,applyPreset:ae,labels:u}),!se&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__switch`,"aria-pressed":T,onClick:()=>ee(!T)},t.React.createElement(`span`,{className:`atlas-panel__track`},t.React.createElement(`span`,{className:`atlas-panel__knob`})),u.labels??`Labels`),(ke||Ge.canExport||H.offered||Ke.offered)&&t.React.createElement(`div`,{className:`atlas-panel__actions`},ke&&t.React.createElement(Gr,{drawing:Ae,busy:V,labels:u,onStart:Fe,onCancel:Le}),Ge.canExport&&t.React.createElement(Gi,{exporter:Ge,labels:u}),t.React.createElement(ea,{fileOverlay:H,labels:u}),Ke.offered&&t.React.createElement(ra,{viewLink:Ke,labels:u})),t.React.createElement(ta,{fileOverlay:H,labels:u}),ke&&(Ae||R)&&t.React.createElement(Yr,{shape:R,drawing:Ae,busy:V,limits:y.radius,caught:z.selecting?{count:z.count,total:z.total}:void 0,savable:!!y.save?.onSave,note:y.note?{value:B,onChange:Pe,required:y.note.required}:void 0,form:je,labels:u,onCancel:Le,onRadius:e=>Ne(t=>t&&{...t,radius:e}),onSave:Re})),t.React.createElement(`div`,{className:`atlas-panel__body`},t.React.createElement(`div`,{className:`atlas-panel__mapwrap`},t.React.createElement(`div`,{className:`atlas-panel__map`},t.React.createElement(Bn,{session:e,layerSwitcher:!0,...d,extent:he,view:b,noticeLabels:u,onReady:e=>{M(!1),te(e.map),A(e.config?.dataSrid??null),Ke.attach(e)},onError:()=>M(!0)},se?(le!==null||!ce)&&t.React.createElement(Nr,{servicePath:n,context:L,srid:k,reload:Me,statusRows:le,join:v.join,field:v.field,palette:v.palette,fallback:v.fallback,descriptor:i?.[v.descriptor],labelResolver:a,tooltip:ue,hidden:Ce,onFeatureClick:Be,onLegend:ge,onShown:_e,onLoadStart:ye,onLoad:be,onError:xe}):t.React.createElement(vi,{servicePath:n,context:L,reload:Me,descriptors:i,descriptorFor:He,labelResolver:a,cluster:o,pinned:Ue,hidden:Ce,fit:!E,onFeatureClick:Be,onLegend:ge,onShown:_e,onExtent:ve,onLoadStart:ye,onLoad:e=>{O(),be(e)},onError:e=>{O(),xe(e)}}),We&&t.React.createElement(ji,{file:We,srid:k,hidden:Ce.includes(`::file`),labelResolver:a,onFeatureClick:Be,onDrawn:H.drawn,onError:H.failed}),ke&&t.React.createElement(Br,{value:R,drawing:Ae,style:y.style,onChange:Ne,onDrawn:Ie}),m!==!1&&t.React.createElement(Bi,{entries:[...se?pr({palette:v.palette,fallback:v.fallback??mr.__unknown,unknownLabel:v.unknownLabel,...me},a):fr(me,a),...We?[Si(We.name)]:[]],title:u.legend,hidden:Ce,onToggle:Te,onShowAll:Ee,showAllLabel:u.showAll,position:typeof m==`string`?m:void 0}))),!ne&&(pe||V||H.opening)&&t.React.createElement(ia,{saving:V,opening:H.opening,labels:u}),qe&&t.React.createElement(Hi,{timeScoped:N,longest:ie,preset:P,applyPreset:ae,labels:u,onClose:()=>Oe(oe)})),ze&&t.React.createElement(oa,{record:ze,labels:u,onClose:Ve})),(N||w)&&t.React.createElement(aa,{timeScoped:N,range:F,initial:re,applyPreset:ae,labels:u,onClose:w}))};G(`/* Leaflet adds \`leaflet-div-icon\` only when no className is given; reset in case that changes. The
   pin's fill follows \`color\`, so a consumer restyles it with one declaration. */
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
`);var{factory:Cl}=f,{useEffect:wl,useRef:Tl}=t.React,El=`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 26 36">
  <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 23 13 23s13-13.25 13-23C26 5.82 20.18 0 13 0z"
        fill="currentColor" stroke="#ffffff" stroke-width="1.75"/>
  <circle cx="13" cy="13" r="4" fill="#ffffff"/>
</svg>`,Dl=({value:e,onChange:t,draggable:n=!0,className:r=`atlas-pin`,html:i=El,size:a=[20,28],anchor:o=[10,28]})=>{let s=U(),c=Tl(null),l=Tl(t);return l.current=t,wl(()=>{let e=e=>l.current?.({lat:e.latlng.lat,lng:e.latlng.lng});return s.on(`click`,e),()=>{s.off(`click`,e),c.current&&(s.removeLayer(c.current),c.current=null)}},[s]),wl(()=>{if(!e){c.current&&(s.removeLayer(c.current),c.current=null);return}if(c.current){c.current.setLatLng(e);return}let t=Cl.marker(e,{icon:Cl.divIcon({className:r,html:i,iconSize:a,iconAnchor:o}),draggable:n}).addTo(s);t.on(`drag`,e=>l.current?.({...e.target.getLatLng()})),c.current=t},[s,e?.lat,e?.lng]),null},{labelsManager:Ol}=t.utils,{useMemo:kl,useState:Al}=t.React,jl=(0,t.connect)((e,t)=>({session:t.session??e?.security?.svSession}))(e=>{let n=(0,t.useIntl)(),{objConfig:r,objectId:i,session:a,labelDomain:o=`main`,title:s,className:c,linkId:l,onClose:u}=e,[d]=Al(()=>pl(window.location.href,l)),f=e=>{if(!e)return;let t=Ol(e,n,o);return!t||t===`perun.${o}.${e}`?void 0:t},p=kl(()=>({session:a,objectId:i,...r?.context||{}}),[a,i,r]),m=kl(()=>(r?.presets||[]).map(({months:e,label:t})=>({months:e,label:f(t)??`${e}`})),[r,n,o]),h=kl(()=>Object.fromEntries(Object.entries(r?.labels||{}).map(([e,t])=>[e,f(t)])),[r,n,o]),g=r?.service;if(!g){let e=`The button${l?` ${l}`:``} has no "service" in its objectConfiguration.`;return t.React.createElement(Ct,{className:`atlas-panel-unavailable`,icon:`map`,title:V(`noService`,h),hint:f(`map_service_missing`)??V(`noServiceHint`,h),details:e,copy:e,labels:h})}return t.React.createElement(Sl,{session:a,servicePath:g,context:p,descriptors:r?.descriptors||{},labelResolver:f,cluster:r?.cluster,subject:r?.subject?{...r.subject,id:i}:void 0,title:s??f(r?.title),presets:m,defaultMonths:r?.defaultMonths,map:r?.map,choropleth:r?.choropleth,draw:r?.draw,exportable:r?.export,overlay:r?.overlay,legend:r?.legend,notice:r?.notice,tokens:r?.tokens,labels:h,view:d??void 0,linkId:l,link:r?.link,className:c,onClose:u})}),Ml=a,Nl=o;e.AtlasMap=Bn,e.Choropleth=Nr,e.CirclePicker=Br,e.ConfiguredMap=jl,e.DateRange=Hr,e.DrawBar=Yr,e.DrawTool=Gr,e.FeaturePanel=Sl,e.FeatureSet=vi,e.Legend=zi,e.LegendControl=Bi,e.PointPicker=Dl,e.ZoomRail=On,Object.defineProperty(e,"config",{enumerable:!0,get:function(){return l}}),e.name=Ml,e.version=Nl});