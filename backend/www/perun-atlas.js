(function(e,t){typeof exports==`object`&&typeof module<`u`?t(exports,require("perun-core"),require("spatial")):typeof define==`function`&&define.amd?define([`exports`,`perun-core`,`spatial`],t):(e=typeof globalThis<`u`?globalThis:e||self,t(e[`perun-atlas`]={},e[`perun-core`],e.spatial))})(this,function(e,t,n){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});var r=Object.defineProperty,i=(e,t)=>{let n={};for(var i in e)r(n,i,{get:e[i],enumerable:!0});return t||r(n,Symbol.toStringTag,{value:`Module`}),n},a=`perun-atlas`,o=`1.0.1-rc.1`,s={crs:{type:`crs`,param:`SPATIAL_CRS`,required:!0,doc:`EPSG code, or { code, def } for a proj4 definition.`},center:{type:`latlng`,param:`SPATIAL_CENTER`,required:!0,doc:`Initial map centre as { lat, lng }.`},bounds:{type:`bounds`,param:`SPATIAL_BOUNDS`,doc:`Spatial limits as [ {lat,lng} southwest, {lat,lng} northeast ].`},zoom:{type:`int`,param:`SPATIAL_ZOOM`,default:8},minZoom:{type:`int`,param:`SPATIAL_MIN_ZOOM`,default:0},maxZoom:{type:`int`,param:`SPATIAL_MAX_ZOOM`,default:18},bboxOrder:{type:`bool`,param:`SPATIAL_SWITCH_BBOX_ORDER`,default:!1,doc:`Reverse WMS bounding box axis order.`},units:{type:`enum`,param:`SPATIAL_MEASUREMENT_SYSTEM`,values:[`metric`,`imperial`],default:`metric`},attribution:{type:`string`,param:`SPATIAL_ATTRIBUTION`,default:``},dataSrid:{type:`srid`,param:`sys.gis.default_srid`,default:`4326`,doc:`EPSG code the database stores geometry in, without the prefix.`}},c=Object.keys(s).filter(e=>s[e].required),l=i({REQUIRED:()=>c,SCHEMA:()=>s}),u=Object.getPrototypeOf(n.spatial),d=u.config,f=u.core,p=u.data,m=u.tools,h=e=>Array.isArray(e)&&typeof e[0]==`number`,g=e=>{if(!e)return[];if(e.type===`GeometryCollection`)return(e.geometries??[]).flatMap(g);let t=e=>Array.isArray(e)?h(e)?[e]:e.flatMap(t):[];return t(e.coordinates)},_=(e,t)=>{if(!e)return e;if(e.type===`GeometryCollection`)return{...e,geometries:(e.geometries??[]).map(e=>_(e,t))};let n=e=>Array.isArray(e)?h(e)?t(e):e.map(n):e;return{...e,coordinates:n(e.coordinates)}},v=(e,t)=>Array.isArray(e?.features)?{...e,features:e.features.map(e=>e?.geometry?{...e,geometry:_(e.geometry,t)}:e)}:e,{Map:y,factory:b}=f,x={3857:()=>b.CRS.EPSG3857,3395:()=>b.CRS.EPSG3395,4326:()=>b.CRS.EPSG4326},S=e=>x[String(e)]?.()??null,C=e=>e??y,w=new Set,T=e=>e==null?null:S(e)||(w.has(String(e))||(w.add(String(e)),console.warn(`perun-atlas: cannot express a coordinate in EPSG:${e} — the engine builds 3857, 3395 and 4326. Using the map's own projection instead, which is correct only if this deployment stores geometry in it.`)),null),ee=(e,t)=>{let n=T(e);if(!n)return C(t).getBBox();let r=C(t).getBounds(),i=n.projection.project(r.getSouthWest()),a=n.projection.project(r.getNorthEast());return`${i.x},${i.y},${a.x},${a.y}`},E=(e,t,n)=>{let{x:r,y:i}=(T(t)??C(n).getCRS()).projection.project(b.latLng(e));return{x:r,y:i}},D=(e,t,n)=>{let[r,i]=Array.isArray(e)?e:[e?.x,e?.y],{lat:a,lng:o}=(T(t)??C(n).getCRS()).projection.unproject(b.point(r,i));return{lat:a,lng:o}},O=(e,t,n)=>v(e,e=>{let{lat:r,lng:i}=D(e,t,n);return[i,r,...e.slice(2)]}),k=(e,t,n)=>v(e,e=>{let{x:r,y:i}=E({lat:e[1],lng:e[0]},t,n);return[r,i,...e.slice(2)]}),A=(e,t,n)=>j(e,t,n).ew,j=(e,t,n)=>{let r=.001,i=b.latLng(e),a=b.latLng({lat:i.lat,lng:i.lng+r}),o=b.latLng({lat:i.lat+r,lng:i.lng}),s=E(i,t,n),c=C(n).distance(i,a),l=C(n).distance(i,o);return{ew:c?Math.abs(E(a,t,n).x-s.x)/c:1,ns:l?Math.abs(E(o,t,n).y-s.y)/l:1}},te=e=>e>0?Math.min(12,Math.max(0,3-Math.floor(Math.log10(e)))):6,ne=(e,t)=>{let n=10**t;return Math.round(e*n)/n},M=(e,t,n,r=24,i)=>{let{ew:a,ns:o}=j(e,n,i),{x:s,y:c}=E(e,n,i),l=t*a,u=t*o,d=te(Math.min(l,u));return Array.from({length:Math.max(3,r)},(e,t)=>{let n=2*Math.PI*t/Math.max(3,r);return{x:ne(s+l*Math.cos(n),d),y:ne(c+u*Math.sin(n),d)}})},{Map:N,store:P}=f,F={crs:`crs`,center:`center`,bounds:`bounds`,zoom:`zoom`,minZoom:`minZoom`,maxZoom:`maxZoom`,units:`measurementSystem`,bboxOrder:`switchBboxOrder`},re=e=>{if(!e)return;let t=N.getCRS?.()?.code,n=typeof e==`object`?e.code:e;t&&n&&t!==n&&console.warn(`perun-atlas: this deployment declares ${n}, but the map is on ${t}. The engine could not resolve the declared value — as a plain code it must be EPSG:3857, EPSG:3395 or EPSG:4326, and any other projection needs a proj4 definition. Basemap tiles will be requested outside the grid they are published on.`)},ie=e=>{if(!e)return;P.addState(`dbCRSCode`,{dbCRS:e});let t=S(e);if(t){P.addState(`dbCRS`,t);return}let n=N.getCRS?.()?.code;e!==n?.split(`:`)[1]&&console.warn(`perun-atlas: this deployment stores geometry in EPSG:${e}, which spatial cannot convert from — it handles 3857, 3395 and 4326. Geometry will be read as though it were already in ${n}, and will be drawn in the wrong place.`)},ae=(e={})=>{let t={};Object.entries(F).forEach(([n,r])=>{e[n]!==void 0&&(t[r]=e[n])});let n=d.configure(t);return re(e.crs),ie(e.dataSrid),n},I=(e,t,n)=>{let r=TypeError(`perun-atlas: cannot read "${e}" as ${n} (got ${JSON.stringify(t)})`);throw r.expected=n,r},L=e=>{if(typeof e!=`string`)return e;let t=e.trim();if(!t.startsWith(`{`)&&!t.startsWith(`[`))return e;try{return JSON.parse(t)}catch{return e}},oe=(e,t)=>{let n=L(t);if(n&&typeof n==`object`&&`lat`in n&&`lng`in n)return{lat:Number(n.lat),lng:Number(n.lng)};if(typeof n==`string`&&n.includes(`,`)){let[e,t]=n.split(`,`).map(Number);if(Number.isFinite(e)&&Number.isFinite(t))return{lat:e,lng:t}}return I(e,t,`a { lat, lng } pair`)},se={string:(e,t)=>String(t),int:(e,t)=>{let n=Number(t);return Number.isInteger(n)?n:I(e,t,`an integer`)},bool:(e,t)=>{if(typeof t==`boolean`)return t;let n=String(t).trim().toLowerCase();return[`true`,`1`,`yes`].includes(n)?!0:![`false`,`0`,`no`].includes(n)&&I(e,t,`a boolean`)},enum:(e,t,n)=>n.values.includes(t)?t:I(e,t,`one of ${n.values.join(`, `)}`),latlng:oe,bounds:(e,t)=>{let n=L(t);return Array.isArray(n)&&n.length===2?[oe(e,n[0]),oe(e,n[1])]:I(e,t,`a [southwest, northeast] pair`)},srid:(e,t)=>{let n=String(t).trim().replace(/^EPSG:/i,``);return/^\d{4,6}$/.test(n)?n:I(e,t,`an EPSG code such as 4326`)},crs:(e,t)=>{let n=L(t);return typeof n==`string`&&n.startsWith(`EPSG:`)||n&&typeof n==`object`&&n.code?n:I(e,t,`an EPSG code or { code, def } object`)}},ce=(e,t,n)=>{let r=se[n.type];if(!r)throw TypeError(`perun-atlas: no coercion for type "${n.type}" on "${e}"`);return r(e,t,n)},le=async()=>{let e=Object.entries(s).filter(([,e])=>e.param),n=await Promise.all(e.map(([e,n])=>t.axios.get(`${window.server}/WsConf/params/get/sys/${n.param}`).then(t=>({key:e,value:t?.data?.VALUE})).catch(()=>({key:e,failed:!0}))));return{values:Object.fromEntries(n.filter(({value:e})=>e!==void 0&&e!==``).map(({key:e,value:t})=>[e,t])),unreachable:n.filter(({failed:e})=>e).map(({key:e})=>e)}},ue=()=>Object.fromEntries(Object.entries(s).filter(([,e])=>`default`in e).map(([e,t])=>[e,t.default])),de=async(e={})=>{let t=await le(),n={...ue(),...t.values,...e},r={},i=[];Object.entries(s).forEach(([e,t])=>{let a=n[e];if(a!==void 0)try{r[e]=ce(e,a,t)}catch(t){i.push({...fe(e),got:a,expected:t.expected,message:t.message})}});let a=c.filter(e=>r[e]===void 0&&!i.some(t=>t.key===e)),o=a.filter(e=>t.unreachable.includes(e)).map(fe),l=a.filter(e=>!t.unreachable.includes(e)).map(fe);if(i.length||l.length||o.length)throw new me({invalid:i,missing:l,unreachable:o});return r},fe=e=>({key:e,param:s[e].param,doc:s[e].doc}),pe=e=>e.map(({key:e,param:t})=>`${e} (parameter ${t})`).join(`, `),me=class extends Error{constructor(e){let t=[...e.invalid.map(e=>e.message),e.missing.length&&`missing required setting(s): ${pe(e.missing)}`,e.unreachable.length&&`no answer for required setting(s): ${pe(e.unreachable)}`].filter(Boolean);super(`perun-atlas: configuration could not be resolved.
  - `+t.join(`
  - `)),this.name=`ConfigError`,this.problems=e}},{factory:he}=f,{getServerOrigin:ge}=t.utils,_e=`GEO_LAYER_TYPE`,ve={BASEMAP:`1`,OVERLAY:`2`},ye=(e,t=_e)=>({layerType:e?.[`${t}.LAYER_TYPE`],protocol:(e?.[`${t}.PROTOCOL`]??``).toLowerCase(),version:e?.[`${t}.VERSION`]||`1.1.1`,format:e?.[`${t}.FORMAT`]||`image/png`,url:e?.[`${t}.URL`],group:e?.[`${t}.LAYER_GROUP`]||`Other`,title:e?.[`${t}.TITLE`],label:e?.[`${t}.LABEL_CODE`]||e?.[`${t}.TITLE`]}),be=[{match:/openstreetmap\.org/i,maxNativeZoom:19,attribution:`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`},{match:/opentopomap\.org/i,maxNativeZoom:17,attribution:`&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)`},{match:/cartocdn\.com/i,maxNativeZoom:20,attribution:`&copy; <a href="https://carto.com/attributions">CARTO</a>`},{match:/arcgisonline\.com/i,attribution:`Tiles &copy; <a href="https://www.esri.com">Esri</a>`}],xe=e=>be.find(t=>t.match.test(e??``))??{},Se=(e,{maxZoom:t}={})=>{let n=e.url||ge(),r=xe(n),i={...t!=null&&{maxZoom:t},...r.maxNativeZoom!=null&&{maxNativeZoom:r.maxNativeZoom}},a=r.attribution?{attribution:r.attribution}:{};if(e.protocol===`wms`)return he.tileLayer.extendedWMS(n,{layers:e.title,format:e.format,version:e.version,transparent:!0,uppercase:!0,...i,...a,...e.layerType===ve.OVERLAY&&{tiled:!0,isOverlay:!0}});if(e.protocol===`tile`){let e=/google|mt\{s\}/i.test(n);return he.tileLayer(n,{...i,...a,...e&&{subdomains:[`mt0`,`mt1`,`mt2`,`mt3`]}})}return e.protocol===`grid`?e.url?.includes(`google`)?he.gridLayer.googleMutant({maxZoom:24,type:e.url.split(`_`)[1]}):(console.warn(`perun-atlas: grid layer "${e.title}" has no recognised provider in its URL`),null):(console.warn(`perun-atlas: unsupported layer protocol "${e.protocol}" for "${e.title}"`),null)},Ce=async(e,n={})=>{let r={},i={},a=(await t.axios.get(`${window.server}/ReactElements/getTableData/${e}/${_e}/0`).catch(e=>(console.error(`perun-atlas: layer catalogue unavailable`,e),null)))?.data;return Array.isArray(a)&&a.forEach(e=>{let t=ye(e),a=Se(t,n);if(!a)return;let o=t.layerType===ve.OVERLAY?i:r;o[t.group]=o[t.group]||{},o[t.group][t.label]=a}),{basemap:r,overlays:i}},we=e=>{let t=Object.values(e??{})[0];return t?Object.values(t)[0]:null},Te=(e,t)=>{if(!t)return null;let n=Object.values(e??{}).find(e=>Object.prototype.hasOwnProperty.call(e,t));return n?n[t]:null},Ee=(e,t)=>{for(let n of Object.values(e??{})){let e=Object.entries(n).find(([,e])=>t?.hasLayer?.(e));if(e)return e[0]}return null},De=(e,t)=>{let n=e;for(let e=0;e<t.length;e+=1){if(n==null)return n;let r=t.length-e===1?t[e]:t.slice(e).join(`.`);if(Object.prototype.hasOwnProperty.call(Object(n),r))return n[r];n=n[t[e]]}return n},Oe=(e,t)=>De(e,String(t).split(`.`)),R=e=>{let t=String(e).split(`.`);return e=>De(e,t)},z=(e,t)=>e.replace(/\{([^}]+)\}/g,(e,n)=>{let r=Oe(t,n);return r==null?e:String(r)}),ke={mapNotSetUp:`This map isn't set up yet`,mapNotSetUpHint:`Some settings the map needs are missing or can't be read, so it can't be drawn. Ask your administrator to check the map's system parameters.`,mapUnreachable:`Couldn't reach the server`,mapUnreachableHint:`The map's settings didn't load, so it can't be drawn yet. This is usually brief. Try again in a moment.`,mapEngineOld:`This map needs a newer map engine`,mapEngineOldHint:`The map engine on this server is older than this map needs. Ask your administrator to update it.`,mapFailed:`The map couldn't be drawn`,mapFailedHint:`Something went wrong while drawing it. Trying again may help.`,noService:`No map for this button yet`,noServiceHint:`This button doesn't have a map service set up. Your administrator can add one to the button's configuration.`,adminDetails:`Details for administrators`,copyDetails:`Copy details`,detailsCopied:`Copied`,retry:`Try again`,settingNotSet:`Not set`,settingUnreadable:`Can't read {value}`,settingNoAnswer:`No answer`},B=(e,t={},n={})=>z(t[e]??ke[e],n),Ae=e=>{let t=e?.problems;if(t){let e=[...t.missing.map(e=>({param:e.param,status:`missing`,doc:e.doc})),...t.invalid.map(e=>({param:e.param,status:`invalid`,value:JSON.stringify(e.got),doc:e.doc??(e.expected&&`Expected ${e.expected}.`)})),...t.unreachable.map(e=>({param:e.param,status:`unreachable`,doc:e.doc}))];return{kind:!t.missing.length&&!t.invalid.length?`unreachable`:`settings`,rows:e,retry:!0}}return e?.engine?{kind:`engine`,rows:[],retry:!1}:{kind:`failed`,rows:[],retry:!0}},je={settings:{icon:`map-off`,title:`mapNotSetUp`,hint:`mapNotSetUpHint`},unreachable:{icon:`cloud-off`,title:`mapUnreachable`,hint:`mapUnreachableHint`},engine:{icon:`map-off`,title:`mapEngineOld`,hint:`mapEngineOldHint`},failed:{icon:`map-off`,title:`mapFailed`,hint:`mapFailedHint`}},Me=(e,t)=>e.status===`invalid`?B(`settingUnreadable`,t,{value:e.value}):e.status===`unreachable`?B(`settingNoAnswer`,t):B(`settingNotSet`,t),Ne=(e,t,n)=>n>t?(Math.min(Math.max(e,t),n)-t)/(n-t):0,Pe=e=>e<=10?1:e<=20?2:5,Fe=(e,t)=>{if(!Number.isFinite(e)||!Number.isFinite(t)||!(t>e))return[];let n=Pe(t-e+1),r=[];for(let i=Math.ceil(e);i<=t;i+=1){let a=(i-e)%n===0;r.push({zoom:i,offset:Ne(i,e,t),labelled:i===e||i===t||a&&t-i>=n})}return r},Ie=(e,t,n)=>!Number.isFinite(t)||!Number.isFinite(n)||!(n>t)?[]:(e??[]).filter(e=>Number.isFinite(e?.from)).map(e=>({mark:e,to:e.to??e.from})).filter(({mark:e,to:r})=>r>=t&&e.from<=n).map(({mark:e,to:r})=>{let i=Ne(e.from,t,n),a=Ne(Math.max(r,e.from),t,n);return{...e,from:Math.min(Math.max(e.from,t),n),to:Math.min(Math.max(r,t),n),offset:i,span:a-i}}),Le=.0254/96,Re=(e,t)=>!(e>0)||!(t>0)?null:e/t/Le,ze=e=>{if(!(e>0)||!Number.isFinite(e))return null;let t=10**(Math.floor(Math.log10(e))-1);return Math.round(e/t)*t},Be=e=>{let t=ze(e);return t===null?null:`1:${String(Math.max(Math.round(t),1)).replace(/\B(?=(\d{3})+(?!\d))/g,`\xA0`)}`},Ve=[24,24],{createContext:He,useContext:Ue}=t.React,We=He(null),V=()=>Ue(We)??f.Map,H=(e,t)=>{e&&t&&Object.entries(t).forEach(([t,n])=>{t.startsWith(`--`)?e.style.setProperty(t,n):e.style[t]=n})},Ge=e=>e instanceof Node?e:document.createTextNode(String(e)),U=(e,t,n)=>{let r=n.startsWith(`text/csv`)?`﻿`:``,i=URL.createObjectURL(new Blob([r,t],{type:n})),a=document.createElement(`a`);a.href=i,a.download=e,a.style.display=`none`,document.body.appendChild(a),a.click(),a.remove(),setTimeout(()=>URL.revokeObjectURL(i),0)},Ke=async(e,t=document.body)=>{if(window.isSecureContext&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{}let n=document.createElement(`textarea`);n.value=e,n.setAttribute(`readonly`,``),n.setAttribute(`aria-hidden`,`true`),Object.assign(n.style,{position:`fixed`,top:`0`,left:`0`,opacity:`0`}),t.appendChild(n),n.select();let r=!1;try{r=document.execCommand(`copy`)}catch{r=!1}return n.remove(),r},qe={plus:[`M12 5l0 14`,`M5 12l14 0`],minus:[`M5 12l14 0`],maximize:[`M4 8v-2a2 2 0 0 1 2 -2h2`,`M4 16v2a2 2 0 0 0 2 2h2`,`M16 4h2a2 2 0 0 1 2 2v2`,`M16 20h2a2 2 0 0 0 2 -2v-2`],minimize:[`M15 19v-2a2 2 0 0 1 2 -2h2`,`M15 5v2a2 2 0 0 0 2 2h2`,`M5 15h2a2 2 0 0 1 2 2v2`,`M5 9h2a2 2 0 0 0 2 -2v-2`],"zoom-scan":[`M4 8v-2a2 2 0 0 1 2 -2h2`,`M4 16v2a2 2 0 0 0 2 2h2`,`M16 4h2a2 2 0 0 1 2 2v2`,`M16 20h2a2 2 0 0 0 2 -2v-2`,`M8 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0`,`M16 16l-2.5 -2.5`],map:[`M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3v-13`,`M9 4v13`,`M15 7v13`],"map-off":[`M8.32 4.34l.68 -.34l6 3l6 -3v13m-2.67 1.335l-3.33 1.665l-6 -3l-6 3v-13l2.665 -1.333`,`M9 4v1m0 4v8`,`M15 7v4m0 4v5`,`M3 3l18 18`],"cloud-off":[`M9.58 5.548c.24 -.11 .492 -.207 .752 -.286c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 .957 -.383 1.824 -1.003 2.454m-2.997 1.033h-11.343c-2.572 -.004 -4.657 -2.011 -4.657 -4.487c0 -2.475 2.085 -4.482 4.657 -4.482c.13 -.582 .37 -1.128 .7 -1.62`,`M3 3l18 18`],copy:[`M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666`,`M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1`],check:[`M5 12l5 5l10 -10`],refresh:[`M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4`,`M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4`],"chevron-down":[`M6 9l6 6l6 -6`],"chevron-up":[`M6 15l6 -6l6 6`]},Je=1.75,Ye=(e,t={})=>{let n=qe[e];if(!n)return``;let{className:r=`atlas-icon atlas-icon--${e}`,size:i=18,stroke:a=Je}=t;return`<svg xmlns="http://www.w3.org/2000/svg" class="${r}" width="${i}" height="${i}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${a}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">`+n.map(e=>`<path d="${e}"/>`).join(``)+`</svg>`},W=({name:e,size:n=18})=>t.React.createElement(`svg`,{className:`atlas-icon atlas-icon--${e}`,width:n,height:n,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:Je,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,focusable:`false`},qe[e].map(e=>t.React.createElement(`path`,{key:e,d:e})));W.propTypes={name:t.PropTypes.oneOf(Object.keys(qe)).isRequired,size:t.PropTypes.number};function G(e){let t=document.createElement(`style`);t.textContent=e,document.head.insertBefore(t,document.head.firstChild)}G(`/*
 * The card in place of a map that cannot be drawn.
 *
 * Every colour comes from the panel's tokens, falling back to the values the
 * deployment sets, so a map outside a panel still reads. Margins, padding and
 * fonts are said on each class because the deployment's bare \`p\`, \`button\` and
 * \`code\` rules would otherwise reach in (see README.md).
 */

.atlas-unavailable {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 18rem;
  padding: 16px;
  overflow: auto;
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
`);var{useEffect:Xe,useRef:Ze,useState:Qe}=t.React,$e=({icon:e,title:n,hint:r,rows:i=[],details:a,copy:o,onRetry:s,labels:c,className:l})=>{let[u,d]=Qe(!1),[f,p]=Qe(!1),m=Ze(null);Xe(()=>()=>clearTimeout(m.current),[]);let h=async e=>{await Ke(o,e.currentTarget)&&(p(!0),clearTimeout(m.current),m.current=setTimeout(()=>p(!1),2e3))},g=i.length>0||!!a;return t.React.createElement(`div`,{className:[`atlas-unavailable`,l].filter(Boolean).join(` `),role:`alert`},t.React.createElement(`div`,{className:`atlas-unavailable__card`},t.React.createElement(`span`,{className:`atlas-unavailable__icon`},t.React.createElement(W,{name:e,size:22})),t.React.createElement(`div`,{className:`atlas-unavailable__title`},n),t.React.createElement(`p`,{className:`atlas-unavailable__hint`},r),g&&t.React.createElement(`button`,{type:`button`,className:`atlas-unavailable__toggle`,"aria-expanded":u,onClick:()=>d(!u)},B(`adminDetails`,c),t.React.createElement(W,{name:u?`chevron-up`:`chevron-down`,size:14})),u&&t.React.createElement(`div`,{className:`atlas-unavailable__details`},i.map(e=>t.React.createElement(`div`,{className:`atlas-unavailable__row`,key:e.param},t.React.createElement(`code`,{className:`atlas-unavailable__param`},e.param),t.React.createElement(`span`,{className:`atlas-unavailable__status atlas-unavailable__status--${e.status}`},Me(e,c)),e.doc&&t.React.createElement(`span`,{className:`atlas-unavailable__doc`},e.doc))),a&&t.React.createElement(`p`,{className:`atlas-unavailable__note`},a)),(o||s)&&t.React.createElement(`div`,{className:`atlas-unavailable__actions`},o&&t.React.createElement(`button`,{type:`button`,className:`atlas-unavailable__btn`,onClick:h},t.React.createElement(W,{name:f?`check`:`copy`,size:16}),B(f?`detailsCopied`:`copyDetails`,c)),s&&t.React.createElement(`button`,{type:`button`,className:`atlas-unavailable__btn atlas-unavailable__btn--primary`,onClick:s},t.React.createElement(W,{name:`refresh`,size:16}),B(`retry`,c)))))};$e.propTypes={icon:t.PropTypes.string.isRequired,title:t.PropTypes.string.isRequired,hint:t.PropTypes.string,rows:t.PropTypes.array,details:t.PropTypes.string,copy:t.PropTypes.string,onRetry:t.PropTypes.func,labels:t.PropTypes.object,className:t.PropTypes.string};var{factory:et}=f,{useLayoutEffect:tt}=t.React,nt=({credit:e})=>{let t=V();return tt(()=>{let n=et.control.attribution({prefix:!1}).addTo(t);return e&&n.addAttribution(e),()=>{n.remove()}},[t,e]),null};nt.propTypes={credit:t.PropTypes.string};var rt=e=>{let t=e?.getLatLngs?.()??[];return Array.isArray(t[0])?t[0]:t},it=(e,t,n,r)=>{let i=rt(t);if(e===`radius`){let e=t?.getRadius?.();return Number.isFinite(e)?`${r.asDistance(e)} · ${r.asArea(r.circleArea(e))}`:null}if(e===`angle`){let e=r.anglesAlong(i).filter(Number.isFinite);return e.length?e.map(r.asAngle).join(`, `):i.length===2?r.asBearing(r.bearing(i[0],i[1])):null}let a=e===`area`?r.area(i):r.distance(i);if(!Number.isFinite(a)||a===0)return null;n[e]+=a;let o=e===`area`?r.asArea:r.asDistance;return`${o(a)}   (Σ ${o(n[e])})`},at=(e,t)=>e!==void 0&&`geolocation`in e&&t?.isSecureContext!==!1,ot=e=>e===`unavailable`?`explain`:e===`found`||e===`outside`||e===`error`?`clear`:`locate`,st=(e,t,n)=>e?.[t]?t:n,{factory:ct}=f,{useEffect:lt,useLayoutEffect:ut,useState:dt}=t.React,ft=null,pt=()=>(ft||(ft=ct.Control.extend({onAdd(){return this.options.container}})),ft),mt=(e,t=!0)=>{let n=V(),[r]=dt(()=>ct.DomUtil.create(`div`,`leaflet-control`));return ut(()=>{if(!t)return;let i=new(pt())({position:e,container:r}).addTo(n);return()=>{i.remove()}},[n,e,t,r]),r},ht=({position:e,shown:n=!0,children:r})=>t.ReactDOM.createPortal(r,mt(e,n)),gt=({what:e})=>(lt(()=>{console.warn(`perun-atlas: the engine on this environment has no ${e}; skipping it.`)},[e]),null),_t=e=>{e&&(ct.DomEvent.disableClickPropagation(e),ct.DomEvent.disableScrollPropagation(e))},K=(e,n)=>t.redux.store.getState().intl?.messages?.[`perun.spatial.${e}`]||n;G(`/* ------------------- */
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
`);var{setting:vt}=d,{util:yt}=f,{readout:bt}=m,{useEffect:xt,useMemo:St,useRef:Ct,useState:wt}=t.React,Tt={latitude:[`latitude`,`Lat`],longitude:[`longitude`,`Lng`],abscissa_x:[`abscissa_x`,`X`],ordinate_y:[`ordinate_y`,`Y`]},Et=e=>{let t=e.getCRS();return{code:t?.code,label:t?.desc||t?.code,project:t=>e.transform(t),unproject:t=>e.untransform(t)}},Dt=e=>{try{return e.getCenter()}catch{return vt(`center`)}},Ot=({position:e=`bottomcenter`,precision:n,systems:r})=>{let i=V();return typeof bt?.resolve==`function`?t.React.createElement(ht,{position:st(i._controlCorners,e,`bottomleft`)},t.React.createElement(kt,{precision:n,systems:r})):t.React.createElement(gt,{what:`coordinate readout`})};Ot.propTypes={position:t.PropTypes.string,precision:t.PropTypes.number,systems:t.PropTypes.array};var kt=({precision:e=5,systems:n})=>{let r=V(),[i,a]=wt(()=>Dt(r)),[o,s]=wt(null),[c,l]=wt(null),[u,d]=wt(!1),[f,p]=wt(!1),[m,h]=wt(()=>r.getCRS()?.code);xt(()=>{let e=()=>h(r.getCRS()?.code);return r.on(`viewreset`,e),()=>r.off(`viewreset`,e)},[r]);let g=St(()=>bt.resolve(n??vt(`coordinateSystems`),Et(r),e),[n,e,m,r]),_=g.find(e=>e.key===o)??g[0],v=St(()=>yt.throttle(e=>a(e.latlng),100),[]);xt(()=>{if(!c)return r.on(`mousemove`,v),()=>r.off(`mousemove`,v)},[c,v,r]);let y=Ct(null);xt(()=>()=>clearTimeout(y.current),[]);let b=_?c??_.toText(i):[``,``],x=(e,t)=>{d(!1),l(b.map((n,r)=>r===e?t:n))},S=()=>{let e=_?.toLatLng(b);!e||!bt.inside(e,vt(`bounds`))?d(!0):(d(!1),l(null),r.setView(e,r.getZoom()))},C=e=>{e.key===`Enter`&&(e.preventDefault(),S()),e.key===`Escape`&&(l(null),d(!1),e.target.blur())};return _?t.React.createElement(`div`,{id:`coordinates-control`,className:`coordinates-control`,onBlur:e=>{e.currentTarget.contains(e.relatedTarget)||(l(null),d(!1))}},g.length>1&&t.React.createElement(`select`,{className:`coordinates-control__system`,value:_.key,onChange:e=>{s(e.target.value),l(null)},"aria-label":K(`coordinate_system`,`Coordinate system`)},g.map(e=>t.React.createElement(`option`,{key:e.key,value:e.key},e.label))),t.React.createElement(`div`,{className:`coordinates-control__pair`},b.map((e,n)=>{let[r,i]=Tt[_.axes[n]]??[``,``];return t.React.createElement(`label`,{className:`coordinates-control__field`,key:_.axes[n]},t.React.createElement(`span`,{className:`coordinates-control__axis`},K(r,i)),t.React.createElement(`input`,{type:`text`,className:`coordinates-control__value`,value:e,spellCheck:`false`,autoComplete:`off`,"aria-invalid":u||void 0,onChange:e=>x(n,e.target.value),onKeyDown:C,onFocus:e=>{l(b),e.target.select()}}))})),t.React.createElement(`button`,{type:`button`,className:`coordinates-control__copy`,onClick:()=>{let e=navigator.clipboard?.writeText?.(b.join(`, `));e&&e.then(()=>{p(!0),clearTimeout(y.current),y.current=setTimeout(()=>p(!1),1500)}).catch(()=>{})},title:K(`copy`,`Copy`),"aria-label":K(`copy`,`Copy`)},f?`✓`:`⧉`),u&&t.React.createElement(`div`,{className:`coordinates-control__rejected`,role:`status`},K(`outside_bounds`,`Outside this map`))):null};kt.propTypes={precision:t.PropTypes.number,systems:t.PropTypes.array};var{factory:At}=f,{useLayoutEffect:jt}=t.React,Mt=({position:e=`topleft`})=>{let t=V();return jt(()=>{if(!At.control.fullscreen)return;let n=At.control.fullscreen({position:e,content:Ye(`maximize`)+Ye(`minimize`)}).addTo(t);return()=>{n._toggleState&&t.off(`enterFullscreen exitFullscreen`,n._toggleState,n),n.remove()}},[t,e]),null};Mt.propTypes={position:t.PropTypes.string};var{layerControl:Nt}=p,{useLayoutEffect:Pt}=t.React,Ft=({basemap:e,overlays:t})=>{let n=V();return Pt(()=>{let r=Nt(e,t,{collapsed:!0}).addTo(n);return()=>{n.off(`click`,r.collapse,r),r.remove()}},[n,e,t]),null};Ft.propTypes={basemap:t.PropTypes.object,overlays:t.PropTypes.object},G(`/* -------------- */
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
`);var{setting:It}=d,{factory:Lt}=f,{readout:Rt}=m,{useCallback:zt,useEffect:Bt,useRef:Vt,useState:Ht}=t.React,{Icon:Ut}=t.elements,Wt=()=>at(typeof navigator>`u`?void 0:navigator,typeof window>`u`?void 0:window),Gt=({position:e=`topleft`,maxZoom:n})=>typeof Rt?.inside==`function`?t.React.createElement(ht,{position:e},t.React.createElement(Kt,{maxZoom:n})):t.React.createElement(gt,{what:`locate control`});Gt.propTypes={position:t.PropTypes.string,maxZoom:t.PropTypes.number};var Kt=({maxZoom:e=16})=>{let n=V(),[r,i]=Ht(Wt()?`idle`:`unavailable`),[a,o]=Ht(null),s=Vt(null);Bt(()=>{let e=Lt.layerGroup().addTo(n);return s.current=e,()=>{n.stopLocate(),e.clearLayers(),n.removeLayer(e),s.current=null}},[n]);let c=zt(()=>{s.current?.clearLayers(),o(null),i(Wt()?`idle`:`unavailable`)},[]);Bt(()=>{let t=t=>{let r=s.current;r&&(r.clearLayers(),Lt.circleMarker(t.latlng,{radius:5,weight:2,color:`#1a73e8`,fillColor:`#1a73e8`,fillOpacity:1}).addTo(r),Number.isFinite(t.accuracy)&&t.accuracy>0&&Lt.circle(t.latlng,{radius:t.accuracy,weight:1,color:`#1a73e8`,fillColor:`#1a73e8`,fillOpacity:.12}).addTo(r),Rt.inside(t.latlng,It(`bounds`))?(n.setView(t.latlng,Math.min(e,n.getMaxZoom())),i(`found`),o(null)):(i(`outside`),o(K(`outside_bounds`,`You are outside this map`))))},r=e=>{i(`error`),o(K(`geolocation_failed`,`Could not find your position`)+(e?.message?` — ${e.message}`:``))};return n.on(`locationfound`,t),n.on(`locationerror`,r),()=>{n.off(`locationfound`,t),n.off(`locationerror`,r)}},[n,e]);let l=()=>{let e=ot(r);e===`explain`?o(K(`geolocation_insecure`,`Your position is only available over https`)):e===`clear`?c():(i(`locating`),o(null),n.locate({setView:!1,enableHighAccuracy:!0,timeout:1e4}))},u=r===`unavailable`||r===`error`?`IconCurrentLocationOff`:`IconCurrentLocation`;return t.React.createElement(`div`,{className:`locate-control`},t.React.createElement(`div`,{className:`leaflet-bar`},t.React.createElement(`button`,{type:`button`,className:`locate-control__button${r===`locating`?` is-busy`:``}${r===`found`?` is-found`:``}`,onClick:l,title:K(`geolocation`,`Show my position`),"aria-label":K(`geolocation`,`Show my position`),"aria-busy":r===`locating`||void 0},t.React.createElement(Ut,{name:u,size:18,stroke:1.75,"aria-hidden":`true`}),t.React.createElement(`span`,{className:`locate-control__fallback`,"aria-hidden":`true`},`◎`))),a&&t.React.createElement(`div`,{className:`locate-control__message`,role:`status`},a))};Kt.propTypes={maxZoom:t.PropTypes.number},G(`/* --------------- */
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
`);var{MEASURE_AREA:qt,MEASURE_RADIUS:Jt,MEAUSURE_LENGTH:Yt}=d,{factory:Xt}=f,{measure:Zt}=m,{useCallback:Qt,useEffect:$t,useMemo:en,useRef:tn,useState:nn}=t.React,{Icon:rn}=t.elements,an={measure:`M`,length:`L`,area:`A`,radius:`R`,angle:`∠`,erase:`⌫`},on=({icon:e,mark:n})=>t.React.createElement(t.React.Fragment,null,t.React.createElement(rn,{name:e,size:18,stroke:1.75,"aria-hidden":`true`}),t.React.createElement(`span`,{className:`measure-control__fallback`,"aria-hidden":`true`},n));on.propTypes={icon:t.PropTypes.string.isRequired,mark:t.PropTypes.string};var q={length:{shape:`line`,options:Yt,icon:`IconRuler2`,fallback:`Length`},area:{shape:`polygon`,options:qt,icon:`IconPolygon`,fallback:`Area`},radius:{shape:`circle`,options:Jt,icon:`IconCircleDot`,fallback:`Radius`},angle:{shape:`line`,options:Yt,icon:`IconAngle`,fallback:`Angle`}},sn=({position:e=`topleft`,tools:n,expanded:r})=>typeof Zt?.anglesAlong==`function`&&m.draw?t.React.createElement(ht,{position:e},t.React.createElement(cn,{tools:n,expanded:r})):t.React.createElement(gt,{what:`measurement control`});sn.propTypes={position:t.PropTypes.string,tools:t.PropTypes.array,expanded:t.PropTypes.bool};var cn=({tools:e=[`length`,`area`,`radius`,`angle`],expanded:n=!1})=>{let r=V(),i=en(()=>r.draw??m.draw,[r]),[a,o]=nn(n),[s,c]=nn(null),[l,u]=nn([]),d=en(()=>e.filter(e=>q[e]),[e]),f=tn(null);$t(()=>{let e=Xt.layerGroup().addTo(r);return f.current=e,()=>{e.clearLayers(),r.removeLayer(e),f.current=null}},[r]);let p=tn({length:0,area:0}),h=s?q[s]:null,g=Qt(()=>{Object.values(q).forEach(({shape:e})=>i[e]?.disable(`force`)),c(null)},[i]);$t(()=>{if(!h)return;let e=e=>{let t=e?.layer;if(!t)return;f.current?.addLayer(t);let n=it(s,t,p.current,Zt);n&&u(e=>[{tool:s,reading:n,at:Date.now()},...e].slice(0,3)),i[q[s].shape]?.isEnabled?.()||c(null)};return r.on(`new_shape`,e),()=>r.off(`new_shape`,e)},[h,s,r,i]),$t(()=>g,[g]);let _=e=>{s===e?g():(g(),c(e),i[q[e].shape]?.enable(q[e].options))},v=()=>{g(),f.current?.clearLayers(),p.current={length:0,area:0},u([])};return d.length?a?t.React.createElement(`div`,{className:`measure-control`},t.React.createElement(`div`,{className:`measure-control__tools leaflet-bar`,role:`group`,"aria-label":K(`measure`,`Measure`)},d.map(e=>t.React.createElement(`button`,{key:e,type:`button`,className:`measure-control__tool${s===e?` is-active`:``}`,onClick:()=>_(e),title:K(e,q[e].fallback),"aria-label":K(e,q[e].fallback),"aria-pressed":s===e},t.React.createElement(on,{icon:q[e].icon,mark:an[e]}))),t.React.createElement(`span`,{className:`measure-control__divider`,"aria-hidden":`true`}),t.React.createElement(`button`,{type:`button`,className:`measure-control__tool`,onClick:v,title:K(`erase`,`Clear`),"aria-label":K(`erase`,`Clear`)},t.React.createElement(on,{icon:`IconEraser`,mark:an.erase})),t.React.createElement(`button`,{type:`button`,className:`measure-control__tool measure-control__close`,onClick:()=>{v(),o(!1)},title:K(`cancel`,`Close`),"aria-label":K(`cancel`,`Close`),"aria-expanded":`true`},`×`)),l.length>0&&t.React.createElement(`dl`,{className:`measure-control__readout`,"aria-live":`polite`},l.map(({tool:e,reading:n,at:r})=>t.React.createElement(`div`,{className:`measure-control__line`,key:r},t.React.createElement(`dt`,null,K(e,q[e].fallback)),t.React.createElement(`dd`,null,n))))):t.React.createElement(`div`,{className:`measure-control measure-control--closed`},t.React.createElement(`div`,{className:`leaflet-bar`},t.React.createElement(`button`,{type:`button`,className:`measure-control__toggle`,onClick:()=>o(!0),title:K(`measure`,`Measure`),"aria-label":K(`measure`,`Measure`),"aria-expanded":`false`},t.React.createElement(on,{icon:`IconRulerMeasure`,mark:an.measure})))):null};cn.propTypes={tools:t.PropTypes.array,expanded:t.PropTypes.bool};var{factory:ln}=f,{useLayoutEffect:un}=t.React,dn=140,fn=({position:e=`bottomleft`,units:t,ratio:n=!0})=>{let r=V();return un(()=>{let i=t!==`imperial`,a=ln.control.scale({position:e,metric:i,imperial:!i,maxWidth:dn}).addTo(r);if(!n)return()=>{a.remove()};let o=ln.DomUtil.create(`div`,`atlas-scale-ratio`,a.getContainer()),s=()=>{let e=r.getSize(),t=Math.round(e.y/2),n=Math.min(e.x,dn),i=r.distance(r.containerPointToLatLng(ln.point(0,t)),r.containerPointToLatLng(ln.point(n,t)));o.textContent=Be(Re(i,n))??``};return r.on(`move zoomend`,s),s(),()=>{r.off(`move zoomend`,s),a.remove()}},[r,e,t,n]),null};fn.propTypes={position:t.PropTypes.string,units:t.PropTypes.string,ratio:t.PropTypes.bool},G(`/*
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
`);var{useEffect:pn,useMemo:mn,useState:hn}=t.React,gn={in:`Zoom in`,out:`Zoom out`,level:`Zoom level`,upscaled:`Above here the basemap is enlarged, not sharper`,fit:`Zoom to the data`},_n=0,vn=e=>`${(e*100).toFixed(4)}%`,yn=({position:e=`bottomright`,marks:n=[],labels:r,onFit:i})=>{let a={...gn,...r},o=V(),[s]=hn(()=>(_n+=1,`atlas-zoom-marks-${_n}`)),[c,l]=hn(()=>({min:o.getMinZoom(),max:o.getMaxZoom()})),[u,d]=hn(()=>o.getZoom());pn(()=>{let e=()=>d(o.getZoom()),t=()=>{l({min:o.getMinZoom(),max:o.getMaxZoom()}),e()};return o.on(`zoomend`,e),o.on(`zoomlevelschange`,t),t(),()=>{o.off(`zoomend`,e),o.off(`zoomlevelschange`,t)}},[o]);let{min:f,max:p}=c,m=mn(()=>Fe(f,p),[f,p]),h=mn(()=>Ie(n,f,p),[n,f,p]),g=Math.round(u),_=h.filter(e=>e.label).map(e=>e.label).join(`. `),v=t.React.createElement(`div`,{className:`atlas-zoom`},i&&t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step atlas-zoom__fit`,onClick:i,title:a.fit,"aria-label":a.fit},t.React.createElement(W,{name:`zoom-scan`})),t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step`,onClick:()=>o.zoomIn(),disabled:g>=p,title:a.in,"aria-label":a.in},t.React.createElement(W,{name:`plus`})),m.length>1&&t.React.createElement(`div`,{className:`atlas-zoom__rail`},t.React.createElement(`div`,{className:`atlas-zoom__track`}),h.map(e=>t.React.createElement(`span`,{key:`${e.kind??`mark`}-${e.from}-${e.to}`,className:`atlas-zoom__mark atlas-zoom__mark--${e.kind??`plain`}`,style:{bottom:vn(e.offset),height:vn(e.span)},title:e.label})),m.map(e=>t.React.createElement(`span`,{key:e.zoom,className:[`atlas-zoom__rung`,e.labelled?`atlas-zoom__rung--numbered`:``,e.zoom===g?`atlas-zoom__rung--here`:``].filter(Boolean).join(` `),style:{bottom:vn(e.offset)}},e.labelled?t.React.createElement(`i`,{className:`atlas-zoom__number`},e.zoom):null)),t.React.createElement(`input`,{type:`range`,className:`atlas-zoom__slider`,min:f,max:p,step:1,value:Math.min(Math.max(g,f),p),onChange:e=>o.setZoom(Number(e.target.value)),"aria-label":a.level,"aria-describedby":_?s:void 0}),_?t.React.createElement(`p`,{className:`atlas-zoom__described`,id:s},_):null),t.React.createElement(`button`,{type:`button`,className:`atlas-zoom__step`,onClick:()=>o.zoomOut(),disabled:g<=f,title:a.out,"aria-label":a.out},t.React.createElement(W,{name:`minus`})),t.React.createElement(`output`,{className:`atlas-zoom__level`,title:a.level},g));return t.React.createElement(ht,{position:e},t.React.createElement(`div`,{className:`atlas-zoom__host`,ref:_t},v))};yn.propTypes={position:t.PropTypes.string,marks:t.PropTypes.array,labels:t.PropTypes.object,onFit:t.PropTypes.func};var{factory:bn}=f,{useEffect:xn,useLayoutEffect:Sn,useRef:Cn}=t.React,wn=({position:e=`bottomright`,fit:t=!0,extent:n=null,labels:r})=>{let i=V(),a=r?.fit??gn.fit,o=Cn(n);o.current=n;let s=Cn(null);return Sn(()=>{let n=bn.control.zoom({position:e,zoomInText:Ye(`plus`),zoomOutText:Ye(`minus`)}).addTo(i);if(t){let e=n.getContainer(),t=bn.DomUtil.create(`a`,`atlas-fit`);t.href=`#`,t.title=a,t.setAttribute(`role`,`button`),t.setAttribute(`aria-label`,a),t.innerHTML=Ye(`zoom-scan`),t.style.display=o.current?``:`none`,bn.DomEvent.disableClickPropagation(t),bn.DomEvent.on(t,`click`,bn.DomEvent.stop),bn.DomEvent.on(t,`click`,()=>{o.current&&i.fitBounds(o.current,{padding:Ve})}),e.insertBefore(t,e.firstChild),s.current=t}return()=>{n.remove(),s.current=null}},[i,e,t,a]),xn(()=>{s.current&&(s.current.style.display=n?``:`none`)},[n]),null};wn.propTypes={position:t.PropTypes.string,fit:t.PropTypes.bool,extent:t.PropTypes.array,labels:t.PropTypes.object},G(`/*
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
`);var{useEffect:Tn,useMemo:En,useRef:Dn,useState:On}=t.React,kn=({session:e,overrides:n,layerSwitcher:r=!1,zoomControl:i=!0,zoomPosition:a=`bottomright`,zoomMarks:o,zoomLabels:s,fit:c=!0,extent:l=null,view:u=null,coordinates:d=!0,coordinatesPosition:p=`bottomcenter`,measure:m=!0,measurePosition:h=`topleft`,measureTools:g,fullscreen:_=!0,fullscreenPosition:v=`topleft`,locate:y=!0,locatePosition:b=`topleft`,scale:x=!0,scalePosition:S=`bottomleft`,scaleRatio:C=!0,noticeLabels:w,className:T=`atlas-map`,style:ee,onReady:E,onError:D,children:O})=>{let k=Dn(null),A=Dn(null),[j,te]=On(null),[ne,M]=On(null),N=ne!==null,[P,F]=On(null),[re,ie]=On(null),[I,L]=On(0);Tn(()=>{let t=!1;if(typeof f.createMap!=`function`){let e=Error(`perun-atlas: this map needs spatial 4.2.1 or later, which builds a map per screen with createMap. The spatial on this page has no createMap, so no map is shown.`);e.engine=!0,F(e),D?.(e)}else return(async()=>{try{let r=await de(n);if(t)return;ae(r);let i=document.createElement(`div`);i.style.height=`100%`,i.style.width=`100%`,k.current?.appendChild(i);let a=f.createMap(i,{center:u?.center??r.center,zoom:u?.zoom??r.zoom,minZoom:r.minZoom,maxZoom:r.maxZoom});A.current=a,te({map:a,config:r});let{basemap:o,overlays:s}=await Ce(e,{maxZoom:r.maxZoom});if(t)return;let c=Te(o,u?.basemap)??we(o);c&&c.addTo(a);let l=e=>ie(e?.options?.maxNativeZoom??null);l(c),a.on(`baselayerchange`,e=>l(e.layer)),a.invalidateSize(),E?.({map:a,config:r,basemap:o,overlays:s}),M({basemap:o,overlays:s})}catch(e){if(t)return;console.error(e),F(e),D?.(e)}})(),()=>{t=!0;let e=A.current;if(A.current=null,e){let t=e.getContainer();e.remove(),e.off(),t.parentNode?.removeChild(t)}}},[I]);let oe=()=>{F(null),te(null),M(null),ie(null),L(e=>e+1)};Tn(()=>{let e=k.current;if(!e||typeof ResizeObserver>`u`)return;let t=null,n=new ResizeObserver(e=>{let n=e[0]?.contentRect;n&&n.width!==0&&n.height!==0&&(t!==null&&cancelAnimationFrame(t),t=requestAnimationFrame(()=>{t=null,A.current?.invalidateSize()}))});return n.observe(e),()=>{t!==null&&cancelAnimationFrame(t),n.disconnect()}},[N]);let se=En(()=>[...re===null?[]:[{from:re,to:1/0,kind:`upscaled`,label:s?.upscaled??gn.upscaled}],...o??[]],[re,o,s]);if(P){let e=Ae(P),n=je[e.kind];return t.React.createElement(`div`,{className:`${T} atlas-map-error`,style:{height:`100%`,...ee}},t.React.createElement($e,{icon:n.icon,title:B(n.title,w),hint:B(n.hint,w),rows:e.rows,details:e.rows.length?null:P.message,copy:[P.message,window.server&&`Server: ${window.server}`].filter(Boolean).join(`

`),onRetry:e.retry?oe:void 0,labels:w}))}let ce=j?.config;return t.React.createElement(We.Provider,{value:j?.map??null},t.React.createElement(`div`,{ref:k,className:T,style:{height:`100%`,...ee}}),j&&t.React.createElement(t.React.Fragment,null,_&&t.React.createElement(Mt,{position:v}),y&&t.React.createElement(Gt,{position:b}),t.React.createElement(nt,{credit:ce.attribution}),i&&i!==`rail`&&t.React.createElement(wn,{position:a,fit:c,extent:l,labels:s}),x&&t.React.createElement(fn,{position:S,units:ce.units,ratio:C}),d&&t.React.createElement(Ot,{position:p}),m&&t.React.createElement(sn,{position:h,tools:g})),N&&r&&t.React.createElement(Ft,{basemap:ne.basemap,overlays:ne.overlays}),N&&i===`rail`&&t.React.createElement(yn,{position:a,marks:se,labels:s,onFit:c&&l?()=>j.map.fitBounds(l,{padding:Ve}):void 0}),N&&O)},{geobuf:An,Pbf:jn}=p,Mn=(e,t,n)=>{window.PERUN_ATLAS_LAST=n,console.groupCollapsed(`perun-atlas: ${n.features.length} feature(s), ${t} bytes — ${e}`),console.log(`collection`,n),console.log(`also at window.PERUN_ATLAS_LAST`),console.groupEnd()},Nn=async(e,n={})=>{let r=`${window.server}${z(e,n)}`,i=await(0,t.axios)({method:`get`,url:r,responseType:`arraybuffer`}),a=i?.data?.byteLength??0;if(!i?.data||a===0){let e={type:`FeatureCollection`,features:[]};return Mn(r,a,e),e}let o=An.decode(new jn(new Uint8Array(i.data)));if(!o||!o.type){console.warn(`perun-atlas: response from ${r} decoded to no GeoJSON type; treating as empty`),console.warn(`perun-atlas: response body was`,new TextDecoder().decode(i.data).slice(0,500));let e={type:`FeatureCollection`,features:[]};return Mn(r,a,e),e}let s=o.type===`FeatureCollection`?o:{type:`FeatureCollection`,features:[o]};return Mn(r,a,s),s},Pn=(e,t,{featureKey:n,rowKey:r,as:i=`status`})=>{let a=R(r),o=R(n),s=new Map((t??[]).map(e=>[String(a(e)),e]));return{...e,features:(e?.features??[]).map(e=>{let t=s.get(String(o(e?.properties)));return t?{...e,properties:{...e.properties,[i]:t}}:e})}},Fn=[`DESCRIPTOR`,`pkid`,`parent_id`,`type`,`status`],In={weight:1,opacity:1,color:`#4A5C66`,fillOpacity:.55,fillColor:`#B8C6CC`},Ln=(e={},t={})=>({...In,...e.style,...t}),Rn=(e,t)=>e||t?{...e,...t}:void 0,zn=(e,t)=>{let n=e?.variants;if(!n?.by)return e;let r=n.cases?.[t?.properties?.[n.by]];return r?{...e,...r,style:Rn(e.style,r.style),marker:Rn(e.marker,r.marker),label:Rn(e.label,r.label),popup:Rn(e.popup,r.popup),arrow:Rn(e.arrow,r.arrow)}:e},Bn=(e,t)=>{let n=e?.label?.scale;if(!n)return!1;let{min:r=0,max:i=24}=n;return t>=r&&t<=i},Vn=(e,t)=>{let n=e?.label?.field;if(!n)return null;let r=t?.properties?.[n];return r==null?null:String(r)},Hn=(e,t)=>{let n=e=>{let n=e?t?.properties?.[e]:void 0;return n==null||n===``?null:String(n)};return n(e?.label?.field)??n(e?.popup?.title)??n(e?.details?.title)},Un=(e,t,n)=>{let r=e?.popup;if(!r)return null;let i=e=>{let n=t?.properties?.[e];return n==null||n===``?null:String(n)},a=r.title?i(r.title):null,o=(r.fields??[]).map(({label:e,field:t})=>({label:e&&n?.(e)||e||t,value:i(t)})).filter(e=>e.value!==null);return a===null&&o.length===0?null:{title:a,rows:o}},Wn=(e,t,n)=>{let r=e?.details;if(!r)return null;let i=t?.properties??{},a=new Set([...Fn,...r.exclude??[]]),o=e=>e==null||e===``?null:String(e),s=r.title?o(i[r.title]):null,c=Object.entries(i).filter(([e,t])=>!a.has(e)&&e!==r.title&&(typeof t!=`object`||!t)).map(([e,t])=>({field:e,label:n?.(e.toLowerCase())||e,value:o(t)})).filter(e=>e.value!==null);return s===null&&c.length===0?null:{title:s,rows:c,spec:r}},Gn=`::`,Kn=(e=[],t=[])=>e.length>=2||e.some(e=>t.includes(e.key)),qn=(e,t)=>`${e??``}${Gn}${t??``}`,Jn=`${Gn}fallback`,Yn=`${Gn}file`,Xn=(e,t,n)=>{let r=t?.variants?.by,i=r?n?.properties?.[r]:void 0,a=i!==void 0&&t?.variants?.cases?.[i]?i:void 0;return{name:e,value:a,key:qn(e,a)}},Zn=({descriptors:e,nameOf:t})=>{let n=new WeakMap,r=r=>{if(n.has(r))return n.get(r);let i=zn(e[t(r)],r);return n.set(r,i),i},i=n=>{let r=t(n);return Xn(r,e[r],n)},a=new Map;return{entryFor:r,kindOf:i,note:e=>{let{name:t,value:n,key:o}=i(e);return a.has(o)||a.set(o,{name:t,value:n,descriptor:r(e),geometry:e?.geometry?.type}),o},drawn:()=>[...a.values()]}},Qn=(e=``)=>/Point$/.test(e)?`point`:/LineString$/.test(e)?`line`:`area`,$n=({name:e,value:t,descriptor:n},r)=>{let i=n?.legend;if(i){let e=r?.(i);if(e)return e}let a=t??e;return a==null||a===``?``:r?.(String(a).toLowerCase())||String(a)},er=(e,t)=>{let n=Qn(e.geometry),r=e.descriptor??{};return{key:qn(e.name,e.value),label:$n(e,t),kind:n,path:Ln(r),marker:n===`point`?r.marker??{}:null,arrow:n===`line`?r.arrow??null:null}},tr=(e=[],t)=>e.map(e=>er(e,t)).filter(e=>e.label!==``),nr=({palette:e={},values:t=[],fallback:n,usedFallback:r=!1,unknownLabel:i=`unknown`}={},a)=>{let o=e=>({...In,color:e,fillColor:e,fillOpacity:.7}),s=t.filter(t=>Object.prototype.hasOwnProperty.call(Object(e),t)&&e[t]).map(t=>({key:String(t),label:a?.(String(t).toLowerCase())||String(t),kind:`area`,path:o(e[t]),marker:null,arrow:null}));return!r||!n?s:[...s,{key:Jn,label:a?.(i)||`Not classified`,kind:`area`,path:o(n),marker:null,arrow:null}]},rr={__unknown:`#B8C6CC`},ir=(e,t)=>Object.prototype.hasOwnProperty.call(Object(e),t)&&!!e[t],ar=({field:e,palette:t=rr,fallback:n=rr.__unknown})=>{let r=new Set,i=R(e),a=e=>i(e?.properties);return i=>{let o=a(i);return o==null?n:ir(t,o)?t[o]:(r.has(o)||(r.add(o),console.warn(`perun-atlas: no palette entry for ${e}="${o}"`)),n)}},or=(e=[],{field:t,palette:n=rr}={})=>{let r=R(t),i=e=>r(e?.properties),a=new Set,o=[],s=!1;return e.forEach(e=>{let t=i(e);t==null?s=!0:(ir(n,t)||(s=!0),!a.has(t)&&(a.add(t),o.push(t)))}),{values:o,usedFallback:s}},sr=({field:e,palette:t=rr}={})=>{let n=R(e);return e=>{let r=n(e?.properties);return r!=null&&ir(t,r)?String(r):Jn}},{useEffect:cr,useRef:lr}=t.React,ur=e=>{let t=lr(e);t.current=e;let n=lr(null);return cr(()=>{n.current?.(e)},[JSON.stringify(e)]),{hiddenRef:t,filterRef:n}},dr=(e,t=[])=>{let n=new Set(t),r=[],i=[];return e.forEach(e=>{let t=n.has(e.key);t!==!!e.hidden&&(e.hidden=t,(t?r:i).push(e))}),{leaving:r,returning:i}},fr=(e,t)=>{let n=e.filter(({hidden:e})=>!e);n.forEach(({layer:e})=>e.bringToFront?.()),n.forEach(({layer:e})=>t?.get(e)?.bringToFront?.())},pr=(e,t=[],n)=>{let r=e?.features;if(!Array.isArray(r)||!t.length)return e;let i=new Set(t),a=r.filter(e=>!i.has(n(e)));return a.length===r.length?e:{...e,features:a}},mr=e=>{let t=e.filter(e=>!e.hidden),n=1/0,r=1/0,i=-1/0,a=-1/0,o=({lat:e,lng:t})=>{n=Math.min(n,e),r=Math.min(r,t),i=Math.max(i,e),a=Math.max(a,t)};return(t.length?t:e).forEach(({layer:e})=>{if(typeof e.getBounds==`function`){let t=e.getBounds();t?.isValid?.()&&(o(t.getSouthWest()),o(t.getNorthEast()))}else typeof e.getLatLng==`function`&&o(e.getLatLng())}),n===1/0?null:[[n,r],[i,a]]},hr=({title:e,rows:t},n={})=>{let r=document.createElement(`div`);if(r.className=[`atlas-popup`,n.className].filter(Boolean).join(` `),H(r,n.style),e){let t=document.createElement(`p`);t.className=`atlas-popup-title`,t.textContent=e,H(t,n.titleStyle),r.appendChild(t)}if(t.length){let e=document.createElement(`dl`);e.className=`atlas-popup-fields`,t.forEach(({label:t,value:r})=>{let i=document.createElement(`dt`);i.textContent=t,H(i,n.labelStyle);let a=document.createElement(`dd`);a.textContent=r,H(a,n.valueStyle),e.append(i,a)}),r.appendChild(e)}return r},gr=(e,t,{popup:n,labelResolver:r}={})=>{if(n){let t=n(e);return t==null?null:Ge(t)}let i=Un(t,e,r);return i?hr(i,t?.popup):null},_r={className:`atlas-popup-shell`,maxWidth:280},{factory:vr}=f,{useEffect:yr,useRef:br}=t.React,xr=[],Sr=({servicePath:e,context:t,reload:n,srid:r,statusRows:i,join:a,field:o,palette:s,fallback:c,descriptor:l,hidden:u=xr,onFeatureClick:d,onLegend:f,onShown:p,onLoadStart:m,onLoad:h,onError:g,tooltip:_,popup:v,labelResolver:y})=>{let b=V(),x=br(null),S=br(0),{hiddenRef:C,filterRef:w}=ur(u);return yr(()=>{let n=!1,u=ar({field:o,palette:s,fallback:c}),T=sr({field:o,palette:s}),E=async()=>{let c=++S.current;O={zoom:b.getZoom(),bounds:b.getBounds()};try{m?.();let g=await Nn(e,{...t||{},map:{...t?.map||{},bbox:ee(r,b)}});if(n||c!==S.current)return;let E=a&&i?Pn(g,i,a):g;x.current&&b.removeLayer(x.current);let D=[],O=vr.geoJSON(E,{crs:b.getCRS(),style:e=>Ln(l,{fillColor:u(e)}),onEachFeature:(e,t)=>{D.push({layer:t,feature:e,key:T(e),hidden:!1});let n=_?.(e);n&&t.bindTooltip(Ge(n),{sticky:!0});let r=gr(e,l,{popup:v,labelResolver:y});r&&t.bindPopup(r,_r),d&&t.on(`click`,()=>d(e,Wn(l,e,y)))}}),k=e=>{let{leaving:t,returning:n}=dr(D,e);return t.forEach(({layer:e})=>O.removeLayer(e)),n.forEach(({layer:e})=>O.addLayer(e)),n.length&&fr(D),t.length>0||n.length>0};k(C.current),x.current=O.addTo(b);let A=e=>p?.(pr(E,e,T));w.current=e=>{k(e)&&A(e)},f?.(or(E?.features,{field:o,palette:s})),A(C.current),h?.(E)}catch(e){console.error(`perun-atlas: choropleth failed to render`,e),!n&&c===S.current&&g?.(e)}},D=null,O=null,k=()=>!!O&&b.getZoom()===O.zoom&&O.bounds.contains(b.getBounds()),A=()=>{clearTimeout(D),D=setTimeout(()=>{k()||E()},250)};return E(),b.on(`moveend`,A),()=>{n=!0,w.current=null,clearTimeout(D),b.off(`moveend`,A),x.current&&(b.removeLayer(x.current),x.current=null)}},[b,e,o,r,n,i,JSON.stringify(t??{})]),null};G(`/*
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
`);var{factory:Cr}=f,{useEffect:wr,useRef:Tr}=t.React,Er=(e,...t)=>t.forEach(t=>{t.current&&(e.removeLayer(t.current),t.current=null)}),Dr={color:`#b3261e`,weight:2,opacity:.95,fillColor:`#b3261e`,fillOpacity:.12},Or={...Dr,dashArray:`5 4`,fillOpacity:.06},kr=({value:e,drawing:t=!1,onChange:n,onDrawn:r,style:i,editable:a=!0})=>{let o=V(),s=Tr(null),c=Tr(null),l=Tr(null),u=Tr(n);u.current=n;let d=Tr(r);return d.current=r,wr(()=>{let e=(o.draw??m?.draw)?.circle;if(!t||!e){!t&&e?.isEnabled?.()&&e.disable(),t&&!e&&console.warn(`perun-atlas: the engine on this environment has no circle draw tool; skipping it.`);return}let n=({shape:e,layer:t})=>{if(e!==`circle`||!t)return;let n=t.getLatLng(),r=t.getRadius();o.removeLayer(t);let i={lat:n.lat,lng:n.lng,radius:r};u.current?.(i),d.current?.(i)};return o.on(`new_shape`,n),e.enable({templineStyle:Or,hintlineStyle:{...Or,fillOpacity:0},pathOptions:{...Dr,...i},cursorMarker:!0,tooltips:!1}),()=>{o.off(`new_shape`,n),e.isEnabled?.()&&e.disable()}},[o,t]),wr(()=>{if(!e||!(e.radius>0)){Er(o,s,c,l);return}let t=Cr.latLng({lat:e.lat,lng:e.lng});if(s.current?(s.current.setLatLng(t),s.current.setRadius(e.radius)):s.current=Cr.circle(t,{...Dr,...i,radius:e.radius,showMeasurements:!0,interactive:!1}).addTo(o),!a){Er(o,c,l);return}let n=Cr.latLng({lat:t.lat,lng:s.current.getBounds().getEast()});c.current?c.current.setLatLng(t):(c.current=Cr.marker(t,{icon:Cr.divIcon({className:`atlas-draw-handle atlas-draw-handle--centre`,html:``}),draggable:!0,zIndexOffset:1e3}).addTo(o),c.current.on(`drag`,e=>{let t=e.target.getLatLng();u.current?.({lat:t.lat,lng:t.lng,radius:s.current?.getRadius()})})),l.current?l.current.setLatLng(n):(l.current=Cr.marker(n,{icon:Cr.divIcon({className:`atlas-draw-handle atlas-draw-handle--edge`,html:``}),draggable:!0,zIndexOffset:1e3}).addTo(o),l.current.on(`drag`,e=>{let n=e.target.getLatLng(),r=c.current?.getLatLng()??t;u.current?.({lat:r.lat,lng:r.lng,radius:o.distance(r,n)})}))},[o,e?.lat,e?.lng,e?.radius,a]),wr(()=>()=>Er(o,s,c,l),[o]),null};G(`/*
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
`);var{useMemo:Ar}=t.React,jr=({from:e,to:n,onChange:r,labels:i={},disabled:a=!1,className:o=`atlas-date-range`})=>{let s=Ar(()=>({type:`object`,properties:{from:{type:`string`,format:`date`,title:i.from??`From`},to:{type:`string`,format:`date`,title:i.to??`To`}}}),[i.from,i.to]),c=Ar(()=>({"ui:order":[`from`,`to`],"ui:submitButtonOptions":{norender:!0},from:{"ui:disabled":a},to:{"ui:disabled":a}}),[a]);return t.React.createElement(`div`,{className:o},t.React.createElement(t.Form,{idPrefix:`atlas-range`,schema:s,uiSchema:c,formData:{from:e,to:n},validator:t.validator,customValidate:(e,t)=>(e?.from&&e?.to&&e.from>e.to&&t.to.addError(i.invalidRange??`The end date is before the start date.`),t),liveValidate:!0,showErrorList:!1,noHtml5Validate:!0,onChange:({formData:e})=>r?.(e)},t.React.createElement(t.React.Fragment,null)))},{Icon:Mr}=t.elements,{useState:Nr}=t.React,Pr=({drawing:e,busy:n,onStart:r,onCancel:i,labels:a={}})=>t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn ${e?`atlas-panel__btn--primary`:`atlas-panel__btn--ghost`}`,"aria-pressed":e,onClick:e?i:r,disabled:n},t.React.createElement(Mr,{name:`IconCircleDashed`,size:16,stroke:1.75,"aria-hidden":`true`}),a.draw??`Draw an area`),Fr=e=>`atlas-panel__drawbox${e?` atlas-panel__drawbox--off`:``}`,Ir=0,Lr=()=>`atlas-draw-${Ir+=1}`,Rr=({shape:e,drawing:n,busy:r,onCancel:i,onRadius:a,onSave:o,note:s,form:c,caught:l,savable:u=!0,limits:d={},labels:f={}})=>{let{min:p=50,max:m=5e5,step:h=50}=d,g=!!e,[_]=Nr(Lr),v=`${_}-form`,y=!!c?.schema,b=r||!g||s?.required&&!String(s.value??``).trim()||!(!c||c.schema),x=()=>{!b&&u&&o?.()};return t.React.createElement(`div`,{className:`atlas-panel__draw`,role:`group`,"aria-label":f.draw??`Draw`},n&&!g&&t.React.createElement(`p`,{className:`atlas-panel__drawhint`},f.drawing??`Click a centre, then an edge`),g&&t.React.createElement(`label`,{className:`atlas-panel__drawfield`},t.React.createElement(`span`,null,f.radius??`Radius`),t.React.createElement(`span`,{className:Fr(r)},t.React.createElement(`input`,{type:`number`,inputMode:`numeric`,value:Math.round(e.radius),min:p,max:m,step:h,disabled:r,onChange:e=>{let t=Number(e.target.value);Number.isFinite(t)&&t>0&&a(t)}}),t.React.createElement(`span`,{className:`atlas-panel__drawunit`},f.metres??`m`))),g&&c&&!c.schema&&t.React.createElement(`p`,{className:`atlas-panel__drawhint`},c.loading?f.formLoading??`Loading the fields…`:f.formFailed??`These fields did not load, so there is nothing to save into.`),g&&c?.schema&&t.React.createElement(`div`,{className:`atlas-panel__drawform`},t.React.createElement(t.Form,{id:v,idPrefix:_,schema:c.schema,uiSchema:{"ui:submitButtonOptions":{norender:!0},...c.uiSchema},formData:c.data,validator:t.validator,disabled:r,liveValidate:!1,showErrorList:!1,onChange:({formData:e})=>c.onChange?.(e),onSubmit:x},t.React.createElement(t.React.Fragment,null))),g&&s&&t.React.createElement(`label`,{className:`atlas-panel__drawfield atlas-panel__drawfield--wide`},t.React.createElement(`span`,null,f.note??`Note`),t.React.createElement(`span`,{className:Fr(r)},t.React.createElement(`input`,{type:`text`,value:s.value??``,disabled:r,placeholder:f.notePlaceholder??``,onChange:e=>s.onChange(e.target.value)}))),g&&l&&t.React.createElement(`p`,{className:`atlas-panel__drawcount`,"aria-live":`polite`},t.React.createElement(`b`,null,l.count),t.React.createElement(`span`,null,f.caught??`inside`),t.React.createElement(`span`,{className:`atlas-panel__drawtotal`},`/ ${l.total}`)),g&&t.React.createElement(`div`,{className:`atlas-panel__drawactions`},u&&t.React.createElement(`button`,{type:y?`submit`:`button`,form:y?v:void 0,className:`atlas-panel__btn atlas-panel__btn--primary`,onClick:y?void 0:x,disabled:b},t.React.createElement(Mr,{name:`IconDeviceFloppy`,size:16,stroke:1.75,"aria-hidden":`true`}),f.save??`Save`),t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:i,disabled:r},f.discard??`Discard`)))},zr=e=>e?.properties?.DESCRIPTOR??e?.properties?.descriptor??null,Br=e=>({id:e?.id??e?.properties?.OBJECT_ID??null,parentId:e?.properties?.parent_id??e?.properties?.PARENT_ID??null}),Vr=(e,t,n=`id`)=>{if(t==null)return!1;let r=Br(e),i=n===`parent`?r.parentId:r.id;return i!=null&&String(i)===String(t)},Hr=({lat:e,lng:t})=>`${e.toFixed(6)},${t.toFixed(6)}`,Ur=(e,t,n)=>{let r=e.original.map(e=>{let r=t[Hr(e)];if(!r)return e;let i=n(r);return i&&i!==r?i.getLatLng():e}),i=r.map(Hr).join(` `);return i===e.key?null:{next:r,key:i}},Wr=e=>e<.5?4*e*e*e:1-(-2*e+2)**3/2,Gr=(e,t,n)=>t.map((t,r)=>{let i=e[r];return i?{lat:i.lat+(t.lat-i.lat)*n,lng:i.lng+(t.lng-i.lng)*n}:t}),Kr=e=>Array.isArray(e?.[0])?e.map(Kr).reverse():[...e??[]].reverse(),qr=({factory:e,group:t,into:n,arrowOf:r})=>{let i=new WeakMap;return t.eachLayer(t=>{let a=r(t.feature);if(!a||typeof t.getLatLngs!=`function`)return;let o=a.reverse?Kr(t.getLatLngs()):t;i.set(t,e.polylineDecorator(o,{patterns:[{offset:a.offset??`12%`,repeat:a.repeat??160,symbol:e.Symbol.arrowHead({pixelSize:a.pixelSize??12,polygon:!1,pathOptions:{stroke:!0,weight:2,color:t.options.color,opacity:1}})}]}).addTo(n))}),i},Jr=({map:e,surface:t,lines:n,markerAt:r,decoratorOf:i,glide:a})=>{let o=e=>t.getVisibleParent?.(e),s=(e,t)=>{e.layer.setLatLngs(t);let n=i?.get(e.layer);n&&n.setPaths(e.reverse?Kr(t):e.layer)},c=typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,l=null,u=[],d=()=>{l!==null&&cancelAnimationFrame(l),l=null,u=[]},f=e=>{d(),u=e;let t=e.map(({line:e})=>e.layer.getLatLngs()),n=performance.now(),r=i=>{let o=Math.min(1,(i-n)/a),c=Wr(o);e.forEach((e,n)=>s(e.line,Gr(t[n],e.next,c))),o<1?l=requestAnimationFrame(r):(l=null,u=[],e.forEach(e=>s(e.line,e.next)))};l=requestAnimationFrame(r)},p=()=>{let e=[];if(n.forEach(t=>{let n=Ur(t,r,o);n&&(t.key=n.key,e.push({line:t,next:n.next}))}),!e.length)return;let t=new Set(e.map(({line:e})=>e)),i=[...u.filter(({line:e})=>!t.has(e)),...e];!a||c||i.length>150?(d(),i.forEach(e=>s(e.line,e.next))):f(i)};p(),t.on(`animationend`,p),e.on(`moveend`,p);let m=()=>{d(),t.off(`animationend`,p),e.off(`moveend`,p)};return m.reroute=p,m},Yr=(e,t,n,r)=>{let i=/Point$/.test(t.geometry?.type??``),a=(n.marker?.size??24)/2;return e.bindTooltip(Ge(r),{permanent:!0,direction:n.label?.direction??(i?`top`:`center`),offset:n.label?.offset??(i?[0,-a]:[0,0]),className:[`atlas-label`,n.label?.className].filter(Boolean).join(` `),opacity:1}),n.label?.style&&e.on(`tooltipopen`,e=>H(e.tooltip.getElement(),n.label.style)),!!n.label?.scale},Xr=(e,t)=>{e.forEach(({layer:e,descriptor:n})=>{if(e._atlasHidden)return;let r=Bn(n,t);r!==e.isTooltipOpen()&&(r?e.openTooltip():e.closeTooltip())})},Zr=280,Qr={chunkedLoading:!0,showCoverageOnHover:!1,spiderfyDistanceMultiplier:2},$r=[{upTo:9,name:`sm`,size:32},{upTo:99,name:`md`,size:38},{upTo:1/0,name:`lg`,size:46}],ei=e=>{if(!e)return null;if(e===!0)return{from:0,options:{...Qr},badge:{},glide:Zr};if(typeof e==`number`)return{from:e,options:{...Qr},badge:{},glide:Zr};let{from:t=0,className:n,style:r,glide:i=Zr,...a}=e;return{from:t,options:{...Qr,...a},badge:{className:n,style:r},glide:i===!0?Zr:i}},ti=(e,t={})=>{let n=$r.find(({upTo:t})=>e<=t)??$r[$r.length-1],r=document.createElement(`span`);return r.className=`atlas-cluster__count`,r.textContent=String(e),H(r,t.style),{element:r,size:n.size,className:[`atlas-cluster`,`atlas-cluster--${n.name}`,t.className].filter(Boolean).join(` `)}},ni=({map:e,factory:t,group:n,cluster:r,points:i})=>{let a=t.featureGroup().addTo(e),o=ei(r),s=typeof t.markerClusterGroup==`function`;o!==null&&!s&&console.warn(`perun-atlas: clustering was configured, but the map engine on this deployment does not carry it`);let c=o!==null&&s&&i>=o.from,l=c?t.markerClusterGroup({...o.options,iconCreateFunction:e=>{let{element:n,size:r,className:i}=ti(e.getChildCount(),o.badge);return t.divIcon({html:n,className:i,iconSize:[r,r]})}}):n;if(l.addTo(e),c){let e=[];n.eachLayer(t=>{t._atlasPinned?e.push(t):l.addLayer(t)}),e.forEach(e=>a.addLayer(e))}let u=c?t.featureGroup().addTo(e):l,d=e=>c&&e._atlasPinned?a:l;return{surface:l,arrows:u,clustering:c,settings:o,layers:u===l?[l,a]:[l,u,a],move:(e,t,n)=>{let r=[];e.forEach(({layer:e})=>{e._atlasHidden=!t;let i=d(e);c&&i===l?r.push(e):t?i.addLayer(e):i.removeLayer(e);let a=n?.get(e);a&&t?u.addLayer(a):a&&u.removeLayer(a)}),r.length&&(t?l.addLayers(r):l.removeLayers(r))}}};G(`/*
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
`);var{factory:ri}=f,{useEffect:ii,useRef:ai}=t.React,oi=[],si=({servicePath:e,context:t,reload:n,descriptors:r={},descriptorFor:i,cluster:a,fit:o=!0,tooltip:s,popup:c,labelResolver:l,pinned:u,hidden:d=oi,onFeatureClick:f,onLegend:p,onShown:m,onExtent:h,onLoadStart:g,onLoad:_,onError:v})=>{let y=V(),b=ai([]),x=ai([]),{hiddenRef:S,filterRef:C}=ur(d);return ii(()=>{let n=!1,d=Zn({descriptors:r,nameOf:e=>i?.(e)??zr(e)}),{entryFor:w}=d,T=()=>Xr(x.current,y.getZoom()),ee=()=>{x.current=[],b.current.forEach(e=>y.removeLayer(e)),b.current=[]},E=Object.create(null),D=[],O=[],k=e=>!!u?.(e),A=[];return(async()=>{try{g?.();let r=await Nn(e,t);if(n)return;ee();let i=0,u=ri.geoJSON(r,{crs:y.getCRS(),pointToLayer:(e,t)=>{i+=1;let{marker:n={}}=w(e)??{},r=n.size??24,a=ri.marker(t,{icon:ri.divIcon({className:n.className??`atlas-marker`,iconSize:[r,r]})});return n.style&&a.on(`add`,()=>H(a.getElement(),n.style)),E[Hr(t)]=a,a._atlasPinned=k(e),a},style:e=>Ln(w(e)),onEachFeature:(e,t)=>{let n=w(e)??{};A.push({layer:t,feature:e,key:d.note(e),hidden:!1});let r=s?s(e):Vn(n,e);if(r&&Yr(t,e,n,r)&&x.current.push({layer:t,descriptor:n}),typeof t.getLatLngs==`function`){let e=t.getLatLngs();Array.isArray(e)&&e.length>=2&&!Array.isArray(e[0])&&D.push({layer:t,original:e.map(({lat:e,lng:t})=>ri.latLng(e,t)),reverse:!!n.arrow?.reverse,key:null})}let i=n.details&&!c?null:gr(e,n,{popup:c,labelResolver:l});i&&t.bindPopup(i,_r),f&&t.on(`click`,()=>f(e,Wn(n,e,l)))}}),v=ni({map:y,factory:ri,group:u,cluster:a,points:i}),{surface:j,clustering:te,settings:ne}=v;b.current=v.layers;let M=qr({factory:ri,group:u,into:v.arrows,arrowOf:e=>w(e)?.arrow}),N=e=>{let{leaving:t,returning:n}=dr(A,e);return v.move(t,!1,M),v.move(n,!0,M),n.length&&fr(A,M),t.length>0||n.length>0},P=e=>{m?.(pr(r,e,e=>d.kindOf(e).key)),h?.(mr(A))};N(S.current);let F=null;te&&D.length&&(F=Jr({map:y,surface:j,lines:D,markerAt:E,decoratorOf:M,glide:ne.glide}),O.push(F)),p?.(d.drawn()),T(),y.on(`zoomend`,T),te&&y.on(`moveend`,T);let re=mr(A);o&&re&&y.fitBounds(re,{padding:Ve}),C.current=e=>{N(e)&&(F?.reroute(),T(),P(e))},P(S.current),_?.(r)}catch(e){if(n)return;console.error(`perun-atlas: feature set failed to render`,e),v?.(e)}})(),()=>{n=!0,C.current=null,O.forEach(e=>e()),y.off(`zoomend`,T),y.off(`moveend`,T),ee()}},[y,e,JSON.stringify(t??{}),n]),null},ci=`#e8590c`,li={className:`atlas-overlay`,color:ci,weight:2.5,opacity:1,dashArray:`6 5`,fillColor:ci,fillOpacity:.08},ui={className:`atlas-overlay atlas-overlay--point`,radius:5,color:ci,weight:2.5,opacity:1,fillColor:`#ffffff`,fillOpacity:.85},di=e=>({key:Yn,label:e,kind:`line`,path:li,marker:null,arrow:null}),fi=e=>e==null||e===``||typeof e==`object`?null:String(e),pi=(e,t,n)=>{let r=e?.properties??{},i=fi(r.name),a=Object.entries(r).filter(([e])=>i===null||e!==`name`).map(([e,t])=>({field:e,label:n?.(e.toLowerCase())||e,value:fi(t)})).filter(e=>e.value!==null);return{title:i??t,rows:a,spec:{className:`atlas-panel__details--file`}}};G(`/*
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
`);var{factory:mi}=f,{useEffect:hi,useRef:gi}=t.React,_i=`atlasFilePoints`,vi=620,yi=e=>(e.getPane(_i)||(e.createPane(_i).style.zIndex=String(vi)),_i),bi=({file:e,srid:t,hidden:n=!1,labelResolver:r,onFeatureClick:i,onDrawn:a,onError:o})=>{let s=V(),c=gi(null),l=gi(n);l.current=n;let u=gi({});u.current={labelResolver:r,onFeatureClick:i,onDrawn:a,onError:o};let d=gi(null);return hi(()=>{if(!e)return;let n;try{n=mi.geoJSON(k(e.collection,t,s),{crs:s.getCRS(),pointToLayer:(e,t)=>mi.circleMarker(t,{...ui,pane:yi(s)}),style:e=>/Point$/.test(e?.geometry?.type??``)?ui:li,onEachFeature:(t,n)=>{n.on(`click`,()=>{let{labelResolver:n,onFeatureClick:r}=u.current;r?.(t,{...pi(t,e.name,n),file:e})})}})}catch(e){console.error(`perun-atlas: a file could not be drawn`,e),u.current.onError?.(e);return}if(c.current=n,l.current||n.addTo(s),d.current!==e){d.current=e;let t=n.getBounds();t.isValid()&&s.fitBounds(t,{padding:Ve})}return u.current.onDrawn?.(),()=>{s.removeLayer(n),c.current=null}},[s,e,t]),hi(()=>{let e=c.current;e&&(n?s.removeLayer(e):s.hasLayer(e)||e.addTo(s))},[s,n]),null};G(`/*
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
`);var{useEffect:xi,useRef:Si,useState:Ci}=t.React,wi=({marker:e})=>{let n=Si(null);return xi(()=>{let t=n.current;t&&(H(t,e?.style),t.style.width=`12px`,t.style.height=`12px`)},[e]),t.React.createElement(`span`,{ref:n,className:[`atlas-legend__point`,e?.className].filter(Boolean).join(` `),"aria-hidden":`true`})};wi.propTypes={marker:t.PropTypes.object};var Ti=({path:e,arrow:n})=>{let r=e?.color??`#4A5C66`,i=Array.isArray(e?.dashArray)?e.dashArray.join(` `):e?.dashArray,a=n?.reverse?`3,6 9,3 9,9`:`21,6 15,3 15,9`;return t.React.createElement(`svg`,{className:`atlas-legend__swatch`,width:`24`,height:`12`,viewBox:`0 0 24 12`,"aria-hidden":`true`},t.React.createElement(`line`,{className:e?.className,x1:`2`,y1:`6`,x2:`22`,y2:`6`,stroke:r,strokeWidth:Math.min(e?.weight??1,4),strokeDasharray:i||void 0,strokeOpacity:e?.opacity??1,strokeLinecap:`round`}),n&&t.React.createElement(`polygon`,{points:a,fill:r,fillOpacity:e?.opacity??1}))};Ti.propTypes={path:t.PropTypes.object,arrow:t.PropTypes.object};var Ei=({path:e})=>t.React.createElement(`svg`,{className:`atlas-legend__swatch`,width:`24`,height:`12`,viewBox:`0 0 24 12`,"aria-hidden":`true`},t.React.createElement(`rect`,{x:`4`,y:`1`,width:`16`,height:`10`,fill:e?.fillColor??`#B8C6CC`,fillOpacity:e?.fillOpacity??.55,stroke:e?.color??`#4A5C66`,strokeWidth:Math.min(e?.weight??1,2),strokeOpacity:e?.opacity??1}));Ei.propTypes={path:t.PropTypes.object};var Di=({entry:e})=>e.kind===`point`?t.React.createElement(wi,{marker:e.marker}):e.kind===`line`?t.React.createElement(Ti,{path:e.path,arrow:e.arrow}):t.React.createElement(Ei,{path:e.path});Di.propTypes={entry:t.PropTypes.object.isRequired};var Oi=({entries:e=[],title:n,open:r=!0,hidden:i=[],onToggle:a,onShowAll:o,showAllLabel:s,className:c=``})=>{let[l,u]=Ci(r);if(!Kn(e,i))return null;let d=n??`Legend`,f=e.some(e=>i.includes(e.key));return t.React.createElement(`div`,{className:`atlas-legend ${c}`.trim()},t.React.createElement(`button`,{type:`button`,className:`atlas-legend__toggle`,onClick:()=>u(!l),"aria-expanded":l},t.React.createElement(`span`,{className:`atlas-legend__title`},d),t.React.createElement(`span`,{className:`atlas-legend__chevron`,"aria-hidden":`true`},l?`−`:`+`)),l&&t.React.createElement(`ul`,{className:`atlas-legend__list`},e.map(e=>{let n=t.React.createElement(t.React.Fragment,null,t.React.createElement(Di,{entry:e}),t.React.createElement(`span`,{className:`atlas-legend__label`},e.label));return t.React.createElement(`li`,{className:`atlas-legend__row`,key:e.key},a?t.React.createElement(`button`,{type:`button`,className:`atlas-legend__item`,"aria-pressed":!i.includes(e.key),onClick:()=>a(e.key)},n):n)})),l&&o&&f&&t.React.createElement(`button`,{type:`button`,className:`atlas-legend__reset`,onClick:o},s??`Show all`))};Oi.propTypes={entries:t.PropTypes.array,title:t.PropTypes.string,open:t.PropTypes.bool,hidden:t.PropTypes.array,onToggle:t.PropTypes.func,onShowAll:t.PropTypes.func,showAllLabel:t.PropTypes.string,className:t.PropTypes.string};var ki=({entries:e=[],title:n,open:r,hidden:i=[],onToggle:a,onShowAll:o,showAllLabel:s,position:c=`bottomleft`})=>{let l=Kn(e,i);return t.React.createElement(ht,{position:c,shown:l},t.React.createElement(`div`,{className:`atlas-legend__host`,ref:_t},t.React.createElement(Oi,{entries:e,title:n,open:r,hidden:i,onToggle:a,onShowAll:o,showAllLabel:s})))};ki.propTypes={entries:t.PropTypes.array,title:t.PropTypes.string,open:t.PropTypes.bool,hidden:t.PropTypes.array,onToggle:t.PropTypes.func,onShowAll:t.PropTypes.func,showAllLabel:t.PropTypes.string,position:t.PropTypes.string};var Ai=({className:e=`atlas-panel__close`,label:n,title:r,onClick:i})=>t.React.createElement(`button`,{type:`button`,className:e,"aria-label":n,title:r,onClick:i},`×`),ji=({timeScoped:e,longest:n,preset:r,applyPreset:i,onClose:a,labels:o={}})=>t.React.createElement(`div`,{className:`atlas-panel__empty`},t.React.createElement(`div`,{className:`atlas-panel__emptycard`},t.React.createElement(`div`,{className:`atlas-panel__emptytitle`},o.empty??(e?`Nothing in this range`:`Nothing to show`)),o.emptyHint&&t.React.createElement(`div`,{className:`atlas-panel__emptybody`},o.emptyHint),e&&n&&r!==n.months&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--primary`,onClick:()=>i(n.months)},[o.widen??`Try`,n.label].filter(Boolean).join(` `)),t.React.createElement(Ai,{label:o.close??`Close`,title:o.close??`Close`,onClick:a}))),{Icon:Mi}=t.elements,Ni=[{offer:`geojson`,icon:`IconJson`,label:`exportGeoJSON`,fallback:`GeoJSON`,save:`saveGeoJSON`},{offer:`csv`,icon:`IconFileTypeCsv`,label:`exportCsv`,fallback:`CSV`,save:`saveCSV`},{offer:`kml`,icon:`IconWorld`,label:`exportKml`,fallback:`KML`,save:`saveKML`},{offer:`shp`,icon:`IconFileTypeZip`,label:`exportShp`,fallback:`Shapefile`,save:`saveShapefile`}],Pi=({exporter:e,labels:n={}})=>t.React.createElement(t.React.Fragment,null,Ni.filter(({offer:t})=>e.offer[t]!==!1).map(({offer:r,icon:i,label:a,fallback:o,save:s})=>t.React.createElement(`button`,{key:r,type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:e[s]},t.React.createElement(Mi,{name:i,size:16,stroke:1.75,"aria-hidden":`true`}),n[a]??o))),Fi=e=>`${Number((e/1048576).toFixed(1))} MB`,Ii=e=>new Intl.NumberFormat().format(e),Li=(e,t={})=>z(e===1?t.fileFeature??`{count} feature`:t.fileFeatures??`{count} features`,{count:Ii(e)}),Ri=(e,t={})=>z(t.fileOpening??`Opening {name}…`,{name:e}),zi=(e,t={})=>z(t.fileAssumedDegrees??`{name} has no .prj, so its coordinates were read as longitude and latitude (WGS 84).`,{name:e}),Bi={unreadable:[`fileUnreadable`,`{name} could not be read as GeoJSON, KML, GPX or a shapefile.`],empty:[`fileEmpty`,`{name} has nothing in it to draw.`],notDegrees:[`fileNotDegrees`,`{name} is not in longitude and latitude, so it cannot be placed on the map.`],tooLarge:[`fileTooLarge`,`{name} is {size}. Files up to {limit} can be opened.`],tooManyPoints:[`fileTooManyPoints`,`{name} has {count} points. Files with up to {limit} points can be opened.`],tooLargeUnzipped:[`fileTooLargeUnzipped`,`{name} is over {limit} once unzipped, and {limit} is the most that can be opened.`],noShapefile:[`fileNoShapefile`,`{name} holds no shapefile.`],shapefilePart:[`fileShapefilePart`,`{name} is one part of a shapefile and holds no shapes. Open the .zip holding all its parts, or its .shp.`],noPrj:[`fileNoPrj`,`{name} has no .prj, and its coordinates are not longitude and latitude, so nothing says where it belongs. Open it zipped with its .prj.`],unknownProjection:[`fileUnknownProjection`,`The projection in {name}'s .prj could not be read. Save it in WGS 84 (EPSG:4326) and open it again.`],noDatumShift:[`fileNoDatumShift`,`{name} is in {crs}, and its .prj does not say how to shift that to WGS 84, so it would land in the wrong place. Save it in WGS 84 (EPSG:4326) and open it again.`],readerUnavailable:[`fileReaderUnavailable`,`The shapefile reader could not be loaded, so {name} was not opened. Try again.`]},Vi=(e,t,n={})=>{let[r,i]=Bi[e?.refused]??Bi.unreadable,a={name:t};return e?.refused===`tooLarge`&&(a.size=Fi(e.size),a.limit=Fi(e.limit)),e?.refused===`tooLargeUnzipped`&&(a.limit=Fi(e.limit)),e?.refused===`tooManyPoints`&&(a.count=Ii(e.count),a.limit=Ii(e.limit)),e?.refused===`noDatumShift`&&(a.crs=e.crs||`a projection`),z(n[r]??i,a)},{Icon:Hi}=t.elements,Ui=({fileOverlay:e,labels:n={}})=>{let{offered:r,file:i,inputRef:a,choose:o,onPicked:s,close:c}=e;return t.React.createElement(t.React.Fragment,null,r&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:o},t.React.createElement(Hi,{name:`IconFolderOpen`,size:16,stroke:1.75,"aria-hidden":`true`}),n.openFile??`Open file`),r&&t.React.createElement(`input`,{ref:a,type:`file`,className:`atlas-panel__fileinput`,accept:`.geojson,.json,.kml,.gpx,.zip,.shp`,tabIndex:-1,"aria-hidden":`true`,onChange:s}),i&&t.React.createElement(`div`,{className:`atlas-panel__file`},t.React.createElement(Ti,{path:li}),t.React.createElement(`span`,{className:`atlas-panel__filename`,title:i.name},i.name),t.React.createElement(`span`,{className:`atlas-panel__filecount`},Li(i.count,n)),t.React.createElement(Ai,{className:`atlas-panel__fileclose`,label:n.closeFile??`Close file`,title:n.closeFile??`Close file`,onClick:c})))},Wi=({fileOverlay:e,labels:n={}})=>{let{note:r,refusal:i,dismiss:a,dismissNote:o}=e;return t.React.createElement(t.React.Fragment,null,r&&t.React.createElement(`p`,{className:`atlas-panel__filenote`,role:`status`},t.React.createElement(`span`,null,r),t.React.createElement(Ai,{className:`atlas-panel__fileclose`,label:n.close??`Close`,onClick:o})),i&&t.React.createElement(`p`,{className:`atlas-panel__filerefused`,role:`alert`},t.React.createElement(`span`,null,i),t.React.createElement(Ai,{className:`atlas-panel__fileclose`,label:n.close??`Close`,onClick:a})))},{Icon:Gi}=t.elements,Ki=({viewLink:e,labels:n={}})=>t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:t=>e.copy(t.currentTarget)},t.React.createElement(Gi,{name:e.copied?`IconCheck`:`IconLink`,size:16,stroke:1.75,"aria-hidden":`true`}),e.copied?n.linkCopied??`Link copied`:n.copyLink??`Copy link`),qi=({saving:e,opening:n,labels:r={}})=>t.React.createElement(`div`,{className:`atlas-panel__loading`,role:`status`,"aria-live":`polite`},t.React.createElement(`div`,{className:`atlas-panel__loadingcard`},t.React.createElement(`div`,{className:`atlas-panel__spinner`,"aria-hidden":`true`}),t.React.createElement(`span`,null,e?r.saving??`Saving…`:n?Ri(n,r):r.loading??`Loading…`))),Ji=({timeScoped:e,range:n,initial:r,applyPreset:i,onClose:a,labels:o={}})=>t.React.createElement(`div`,{className:`atlas-panel__footer`},e&&t.React.createElement(`div`,{className:`atlas-panel__summary`},`${n.from} → ${n.to}`),t.React.createElement(`div`,{className:`atlas-panel__actions`},e&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--ghost`,onClick:()=>i(r)},o.reset??`Reset range`),a&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__btn atlas-panel__btn--dark`,onClick:a},o.close??`Close`))),Yi=({record:e,onClose:n,labels:r={}})=>t.React.createElement(`aside`,{className:[`atlas-panel__details`,e.spec?.className].filter(Boolean).join(` `),style:e.spec?.style,"aria-label":r.details??`Details`},t.React.createElement(`div`,{className:`atlas-panel__detailshead`},t.React.createElement(`div`,{className:`atlas-panel__detailstitle`,style:e.spec?.titleStyle},e.title??r.details??`Details`),t.React.createElement(Ai,{label:r.close??`Close`,onClick:n})),t.React.createElement(`dl`,{className:`atlas-panel__detailsbody`},e.rows.map(({field:n,label:r,value:i})=>t.React.createElement(`div`,{key:n,className:`atlas-panel__detailsrow`},t.React.createElement(`dt`,{style:e.spec?.labelStyle},r),t.React.createElement(`dd`,{style:e.spec?.valueStyle},i))))),Xi=({range:e,onRangeChange:n,presets:r=[],preset:i,applyPreset:a,labels:o={}})=>t.React.createElement(t.React.Fragment,null,t.React.createElement(jr,{from:e.from,to:e.to,onChange:n,labels:{from:o.from,to:o.to,invalidRange:o.invalidRange}}),r.length>0&&t.React.createElement(`div`,{className:`atlas-panel__segmented`},r.map(({months:e,label:n})=>t.React.createElement(`button`,{key:e,type:`button`,"aria-pressed":i===e,onClick:()=>a(e)},n)))),Zi=async(e,n={})=>{if(!e)return[];let r=`${window.server}${z(e,n)}`,i=(await t.axios.get(r).catch(e=>(console.error(`perun-atlas: rows unavailable from ${r}`,e),null)))?.data;return i&&!Array.isArray(i)&&console.warn(`perun-atlas: ${r} answered with no array of rows; treating as empty`),Array.isArray(i)?i:[]},{useEffect:Qi,useMemo:$i,useState:ea}=t.React,ta=({choropleth:e,bindings:t,bindingKey:n})=>{let r=!!e,[i,a]=ea(null),o=r?e.status:null;return Qi(()=>{if(!o)return;let e=!1;return Zi(o,t).then(t=>{e||a(t)}),()=>{e=!0}},[o,n]),{coloured:r,statusPath:o,rows:i,tooltip:$i(()=>{let t=e?.tooltip;if(!t)return;let n=R(t);return e=>n(e?.properties)??null},[e])}},na=e=>e.toISOString().slice(0,10),ra=()=>na(new Date),ia=e=>{let t=new Date;return t.setMonth(t.getMonth()-e),na(t)},aa=e=>({from:ia(e),to:ra()}),oa=(e,t)=>e?.from===t?.from&&e?.to===t?.to,{useState:sa}=t.React,ca=({presets:e=[],defaultMonths:t,servicePath:n,opening:r,onMoved:i})=>{let a=t??e[e.length-1]?.months??12,[o,s]=sa(r?null:a),[c,l]=sa(()=>r??aa(a)),u=/\{(from|to)\}/.test(n??``),d=(e,t)=>{s(t),!oa(e,c)&&(l(e),i?.())};return{timeScoped:u,preset:o,range:c,applyPreset:e=>d(aa(e),e),onRangeChange:e=>d(e,null),longest:e[e.length-1],initial:a}},la=async(e,n,r,i)=>{if(!e)return null;let a=`${window.server}${z(e,n)}`,o=await t.axios.get(a).catch(e=>(console.error(`perun-atlas: no ${r} from ${a}`,e),null));if(!o)return null;let s=o.data;return i(s)?s:(console.error(`perun-atlas: ${a} answered with no ${r}`,s),null)},ua=e=>!!e&&typeof e==`object`&&!Array.isArray(e),da=(e,t={})=>la(e,t,`form schema`,e=>ua(e)&&!!e.properties),fa=(e,t={})=>la(e,t,`form layout`,ua),pa=(e,t)=>{if(!e?.properties||!t?.length)return e??null;let n=e.properties,r={},i=new Set;t.forEach(e=>{if(Object.prototype.hasOwnProperty.call(n,e)){r[e]=n[e],i.add(e);return}let t=e.lastIndexOf(`.`),a=t===-1?``:e.slice(0,t),o=t===-1?``:e.slice(t+1),s=a?n[a]:null,c=s?.properties?.[o];if(!c){console.warn(`perun-atlas: the form schema has no "${e}", so it is not on the form`);return}if(i.has(a))return;let l=r[a]??{...s,properties:{}};l.properties={...l.properties,[o]:c},r[a]=l}),Object.keys(r).forEach(e=>{if(i.has(e))return;let t=r[e],a=(n[e].required??[]).filter(e=>e in t.properties);a.length?t.required=a:delete t.required});let a={...e,properties:r};delete a.title;let o=(e.required??[]).filter(e=>e in r);if(o.length?a.required=o:delete a.required,a.dependencies){let e=Object.entries(a.dependencies).filter(([e])=>e in r);e.length?a.dependencies=Object.fromEntries(e):delete a.dependencies}return a},ma=(e,t)=>{if(!t?.properties)return e??{};let n={...e??{}};return Object.entries(t.properties).forEach(([e,t])=>{t?.properties&&(n[e]=ma(n[e],t))}),n},ha={boolean:[`checkbox`,`radio`,`select`,`hidden`],string:[`text`,`password`,`email`,`hostname`,`ipv4`,`ipv6`,`uri`,`data-url`,`radio`,`select`,`textarea`,`hidden`,`date`,`datetime`,`date-time`,`alt-date`,`alt-datetime`,`time`,`color`,`file`],number:[`text`,`select`,`updown`,`range`,`radio`,`hidden`],integer:[`text`,`select`,`updown`,`range`,`radio`,`hidden`],array:[`select`,`checkboxes`,`files`,`hidden`]},ga=new Set([`AltDateTimeWidget`,`AltDateWidget`,`CheckboxWidget`,`CheckboxesWidget`,`ColorWidget`,`DateTimeWidget`,`DateWidget`,`EmailWidget`,`FileWidget`,`HiddenWidget`,`PasswordWidget`,`RadioWidget`,`RangeWidget`,`SelectWidget`,`TextWidget`,`TextareaWidget`,`TimeWidget`,`URLWidget`,`UpDownWidget`]),_a=new Set(Object.values(ha).flat()),va=(e,t)=>ga.has(e)||(t?(ha[t]??[]).includes(e):_a.has(e)),ya=(e,t)=>{if(!ua(e))return e??null;let n=[],r=(e,t)=>{let i={};return Object.entries(e).forEach(([e,a])=>{if(e===`ui:widget`&&typeof a==`string`&&!va(a,t?.type)){n.push(a);return}let o=e===`items`?t?.items:t?.properties?.[e];i[e]=ua(a)&&!e.startsWith(`ui:`)?r(a,o):a}),i},i=r(e,t);return n.length&&console.warn(`perun-atlas: this form cannot draw ${[...new Set(n)].map(e=>`"${e}"`).join(`, `)} -- those are the widgets a record form registers, and the draw row is not one. The fields keep the widget their schema implies.`),n.length?i:e},ba=e=>encodeURIComponent(JSON.stringify(e)),xa=e=>e.replace(/ /g,`%20`),Sa=(e,t,n)=>e==null?``:t===`form`||!t&&/form-urlencoded/.test(n??``)?ba(e):JSON.stringify(e),Ca=(e,t)=>{let n=typeof e==`string`?wa(e):e,r=String(n?.type??``).toUpperCase();return r===`ERROR`||r===`EXCEPTION`?{ok:!1,message:[n?.title,n?.message].filter(Boolean).join(` — `)}:t&&typeof e==`string`&&new RegExp(t,`i`).test(e)?{ok:!1,message:e.trim().slice(0,300)}:{ok:!0,message:null}},wa=e=>{try{return JSON.parse(e)}catch{return null}},Ta=/^\{([^{}]+)\}$/,Ea=`...`,Da=(e,t)=>{if(typeof e==`string`){let n=e.match(Ta);return n?Oe(t,n[1])??e:z(e,t)}if(Array.isArray(e))return e.map(e=>Da(e,t));if(e&&typeof e==`object`){let n={};return Object.entries(e).forEach(([e,r])=>{let i=Da(r,t);e===Ea&&i&&typeof i==`object`&&!Array.isArray(i)?Object.assign(n,i):n[e]=i}),n}return e},Oa=async(e,n={},r={})=>{let{body:i,contentType:a=`application/x-www-form-urlencoded`,encoding:o,failure:s}=r,c=`${window.server}${xa(z(e,n))}`;try{let e=await(0,t.axios)({method:`post`,url:c,headers:{"Content-Type":a},data:Sa(i,o,a)}),n=Ca(e?.data,s);return n.ok||(console.error(`perun-atlas: ${c} refused the save`,e?.data),console.error(`perun-atlas: the payload was`,i)),{...n,data:e?.data}}catch(e){return console.error(`perun-atlas: save to ${c} failed`,e),{ok:!1,message:e?.message??String(e),data:null}}},ka=(e,{draw:t,dataSrid:n,bindings:r,note:i,selected:a,form:o,map:s})=>{let c={lat:e.lat,lng:e.lng},{x:l,y:u}=E(c,n,s),d=e.radius*A(c,n,s),f=Math.round(d),p=M(c,e.radius,n,t.points,s),m=p.map(e=>z(t.ring?.point??`{x} {y}`,e)).join(t.ring?.join??`, `),h={type:`Polygon`,coordinates:[[...p,p[0]].map(e=>[e.x,e.y])]},g=[t.save.onSave,JSON.stringify(t.save.body??null)].some(e=>String(e).includes(`{draw.radius}`));return{context:{...r,note:i,draw:{lat:e.lat,lng:e.lng,metres:Math.round(e.radius),x:l,y:u,radius:f,ring:m,geojson:h,...a?{selected:a}:{}},...t.form?{form:o}:{}},units:d,tooSmall:g&&!(f>=1)}},{useEffect:Aa,useMemo:ja,useState:Ma}=t.React,Na=(e,t)=>e?z(e,t??{}):null,Pa=e=>({path:typeof e==`string`?e:null,inline:e&&typeof e==`object`?e:null}),Fa=({form:e,bindings:t})=>{let{path:n,inline:r}=Pa(e?.schema),i=Pa(e?.uiSchema),a=Na(n,t),o=Na(i.path,t),[s,c]=Ma(null),[l,u]=Ma(null),[d,f]=Ma(!!(n||i.path)),[p,m]=Ma(!1);Aa(()=>{if(!n&&!i.path){c(null),u(null),f(!1);let t=!!e&&!r;t&&console.error("perun-atlas: draw.form needs `schema` -- either the schema itself, or the path to a service that answers with one. Got",e?.schema),m(t);return}let a=!1;return f(!0),m(!1),Promise.all([n?da(n,t):Promise.resolve(null),i.path?fa(i.path,t):Promise.resolve(null)]).then(([e,t])=>{a||(c(e),u(t),m(!!n&&!e),f(!1))}),()=>{a=!0}},[n,a,i.path,o,!!e,!!r]);let h=ja(()=>pa(n?s:r,e?.pick),[s,r,n,e?.pick?.join(`\0`)??null]);return{schema:h,uiSchema:ja(()=>ya(i.path?l:i.inline,h)??void 0,[l,i.inline,i.path,h]),loading:d,failed:p}},{Map:Ia,factory:La}=f,Ra=(e,t,n,r)=>{let i=g(e?.geometry);if(i.length===0)return null;let a=La.latLng(t),o=r??Ia,s=1/0,c=0;return i.forEach(e=>{let t=o.distance(a,La.latLng(D(e,n,r)));t<s&&(s=t),t>c&&(c=t)}),{nearest:s,furthest:c}},za=(e,t,n={})=>{let{srid:r,mode:i=`touches`,map:a}=n,o=e?.features??[],s={inside:[],outside:o,has:()=>!1,metres:()=>null,total:o.length};if(!t||!(t.radius>0))return s;let c={lat:t.lat,lng:t.lng};if(!Number.isFinite(c.lat)||!Number.isFinite(c.lng))return s;let l=new WeakMap,u=new WeakSet,d=[],f=[];return o.forEach(e=>{let n=Ra(e,c,r,a);n?(l.set(e,n.nearest),(i===`contains`?n.furthest<=t.radius:n.nearest<=t.radius)?(u.add(e),d.push(e)):f.push(e)):f.push(e)}),d.sort((e,t)=>l.get(e)-l.get(t)),{inside:d,outside:f,has:e=>e?u.has(e):!1,metres:e=>e&&l.has(e)?l.get(e):null,total:o.length}},Ba=(e,t={})=>{let{id:n=`{pkid}`,join:r=`,`}=t;return(e??[]).map(e=>z(n,e?.properties??{})).filter(e=>e&&e!==n).join(r)},{useMemo:Va}=t.React,Ha={id:`{pkid}`,join:`,`},Ua=({set:e,shape:t,dataSrid:n,select:r,map:i})=>{let a=r===!0?Ha:r?{...Ha,...r}:null,{mode:o,id:s,join:c}=a??{},l=!!a&&a.export!==!1;return Va(()=>{if(!a)return{selecting:!1,feedsExport:!1,count:0,total:0,inside:[],radius:null,has:()=>!1,metres:()=>null,context:null};let r=za(e,t,{srid:n,mode:o,map:i});return{selecting:!0,feedsExport:l,count:r.inside.length,total:r.total,inside:r.inside,radius:t?.radius??null,has:r.has,metres:r.metres,context:{count:r.inside.length,total:r.total,ids:Ba(r.inside,{id:s,join:c}),geojson:{type:`FeatureCollection`,features:r.inside}}}},[e,t,n,i,o,s,c,l,!!a])},{useMemo:Wa,useState:Ga}=t.React,{alertUserResponse:Ka}=t.elements,qa=(e,t)=>e?.type?void 0:t?`success`:`error`,Ja=({draw:e,dataSrid:n,set:r,bindings:i,labels:a={},map:o})=>{let s=!!(e?.save?.onSave||e?.select),[c,l]=Ga(!1),[u,d]=Ga(null),[f,p]=Ga(``),[m,h]=Ga(!1),[g,_]=Ga(0),[v,y]=Ga(()=>e?.form?.data??{}),b=Fa({form:e?.form,bindings:i}),x=Wa(()=>b.schema?t.validator.validateFormData(ma(v,b.schema),b.schema)?.errors??[]:[],[v,b.schema]),S=Ua({set:r,shape:u,dataSrid:n,select:e?.select,map:o}),C=()=>{l(!1),d(null),p(``),y(e?.form?.data??{})};return{drawable:s,drawing:c,shape:u,selection:S,note:f,form:e?.form?{schema:b.schema,uiSchema:b.uiSchema,data:v,errors:x,onChange:y,loading:b.loading,failed:b.failed}:void 0,saving:m,reload:g,setShape:d,setNote:p,startDrawing:()=>l(!0),finishDrawing:()=>l(!1),clearDrawing:C,saveShape:async()=>{if(!u||m)return;if(e.form&&!b.schema){console.error(`perun-atlas: nothing sent -- this row configures a form and its fields are not loaded.`);return}if(x.length){Ka({type:`error`,response:a.saveIncomplete??`Some of these fields are mandatory and are empty. Nothing was sent.`}),console.error(`perun-atlas: nothing sent -- the form is not answerable as it stands:`,x.map(e=>`${e.property??``} ${e.message??``}`.trim()).join(`; `));return}let{context:t,units:r,tooSmall:s}=ka(u,{draw:e,dataSrid:n,bindings:i,note:f,selected:S.context,form:v,map:o});if(s){Ka({type:`error`,response:a.saveTooSmall??`This deployment stores geometry in EPSG:${n??`?`}, where ${Math.round(u.radius)} m is less than one unit. Nothing was sent.`}),console.error(`perun-atlas: a radius of ${Math.round(u.radius)} m is ${r} units in EPSG:${n}, which rounds to zero. A projection measured in degrees cannot carry an integer radius: send {draw.metres} for the size and {draw.ring} for the shape instead.`),console.error(`perun-atlas: the configured path is`,e.save.onSave);return}h(!0);let c=await Oa(e.save.onSave,t,{body:e.save.body===void 0?void 0:Da(e.save.body,t),contentType:e.save.contentType,encoding:e.save.encoding,failure:e.save.failure});h(!1),c.ok&&(C(),_(e=>e+1)),Ka({response:c.data||c.message,type:qa(c.data,c.ok)})}}},Ya=e=>JSON.stringify(e??{type:`FeatureCollection`,features:[]},null,2),Xa=(e,t=[])=>{let n=new Set([...Fn,...t]),r=new Set;return e.forEach(e=>{Object.entries(e?.properties??{}).forEach(([e,t])=>{n.has(e)||typeof t==`object`&&t||r.add(e)})}),[...r]},Za=(e,{fields:t,exclude:n,labelResolver:r}={})=>t?.length?t.map(({field:e,label:t,short:n})=>({field:e,header:t&&r?.(t)||t||e,short:n})):Xa(e,n).map(e=>({field:e,header:r?.(e.toLowerCase())||e})),Qa=e=>e.map(([e,t])=>`${e} ${t}`).join(`, `),$a=e=>e.map(e=>`(${Qa(e)})`).join(`, `),eo={Point:([e,t])=>`POINT (${e} ${t})`,MultiPoint:e=>`MULTIPOINT (${Qa(e)})`,LineString:e=>`LINESTRING (${Qa(e)})`,MultiLineString:e=>`MULTILINESTRING (${$a(e)})`,Polygon:e=>`POLYGON (${$a(e)})`,MultiPolygon:e=>`MULTIPOLYGON (${e.map(e=>`(${$a(e)})`).join(`, `)})`},to=e=>{let t=eo[e?.type];return t&&e.coordinates?.length?t(e.coordinates):``},no=e=>{if(e==null)return``;let t=String(e),n=!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t)&&/^[=+\-@\t\r]/.test(t)?`'${t}`:t;return/[",\r\n]/.test(n)?`"${n.replace(/"/g,`""`)}"`:n},ro=(e,{fields:t,exclude:n,labelResolver:r}={})=>{let i=e?.features??[],a=Za(i,{fields:t,exclude:n,labelResolver:r}),o=e=>e?.geometry?.type??``,s=i.some(e=>/Point$/.test(o(e))),c=i.some(e=>o(e)&&!/Point$/.test(o(e))),l=[...a.map(e=>e.header),...s?[`latitude`,`longitude`]:[],...c?[`geometry`]:[]],u=i.map(e=>{let t=a.map(t=>no(Oe(e?.properties,t.field)));if(s){let[n,r]=/^Point$/.test(o(e))?e.geometry.coordinates??[]:[];t.push(no(r),no(n))}return c&&t.push(no(to(e?.geometry))),t});return[l.map(no),...u].map(e=>e.join(`,`)).join(`\r
`)},io={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&apos;`},ao=e=>String(e).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g,``).replace(/[&<>"']/g,e=>io[e]),oo=e=>`<coordinates>${e.map(e=>e.join(`,`)).join(` `)}</coordinates>`,so=e=>`<LinearRing>${oo(e)}</LinearRing>`,co={Point:e=>`<Point>${oo([e])}</Point>`,LineString:e=>`<LineString><tessellate>1</tessellate>${oo(e)}</LineString>`,Polygon:([e,...t])=>`<Polygon><tessellate>1</tessellate><outerBoundaryIs>${so(e)}</outerBoundaryIs>`+t.map(e=>`<innerBoundaryIs>${so(e)}</innerBoundaryIs>`).join(``)+`</Polygon>`,MultiPoint:e=>`<MultiGeometry>${e.map(co.Point).join(``)}</MultiGeometry>`,MultiLineString:e=>`<MultiGeometry>${e.map(co.LineString).join(``)}</MultiGeometry>`,MultiPolygon:e=>`<MultiGeometry>${e.map(co.Polygon).join(``)}</MultiGeometry>`},lo=e=>{let t=co[e?.type];return t&&e.coordinates?.length?t(e.coordinates):``},uo=(e,t,n)=>{let r=n?.(e),i=lo(e?.geometry),a=t.map(({field:t,header:n})=>{let r=Oe(e?.properties,t),i=r==null?``:ao(r);return`        <Data name="${ao(t)}"><displayName>${ao(n)}</displayName><value>${i}</value></Data>`});return[`    <Placemark>`,...r==null||r===``?[]:[`      <name>${ao(r)}</name>`],...a.length?[`      <ExtendedData>`,...a,`      </ExtendedData>`]:[],...i?[`      ${i}`]:[],`    </Placemark>`].join(`
`)},fo=(e,{fields:t,exclude:n,labelResolver:r,nameOf:i}={})=>{let a=e?.features??[],o=Za(a,{fields:t,exclude:n,labelResolver:r});return[`<?xml version="1.0" encoding="UTF-8"?>`,`<kml xmlns="http://www.opengis.net/kml/2.2">`,`  <Document>`,...a.map(e=>uo(e,o,i)),`  </Document>`,`</kml>`,``].join(`
`)},po=`GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]`,mo=1,ho=3,go=5,_o=8,vo=[{name:`points`,types:[`Point`,`MultiPoint`]},{name:`lines`,types:[`LineString`,`MultiLineString`],shape:ho},{name:`polygons`,types:[`Polygon`,`MultiPolygon`],shape:go}],yo=e=>Array.isArray(e)&&Number.isFinite(e[0])&&Number.isFinite(e[1]),bo=e=>Array.isArray(e)?e.filter(yo):[],xo=e=>{let[t,n]=[e[0],e[e.length-1]];return t[0]===n[0]&&t[1]===n[1]?e:[...e,t]},So=e=>{let t=0;for(let n=1;n<e.length;n+=1)t+=(e[n][0]-e[n-1][0])*(e[n][1]+e[n-1][1]);return t>0},Co=e=>{let[t,...n]=(Array.isArray(e)?e:[]).map(bo);return t?.length?[t,...n.filter(e=>e.length)].map(xo).map((e,t)=>So(e)===(t===0)?e:[...e].reverse()):[]},wo=e=>Array.isArray(e)?e.map(bo).filter(e=>e.length):[],To={Point:e=>yo(e)?[[e]]:[],MultiPoint:e=>{let t=bo(e);return t.length?[t]:[]},LineString:e=>wo([e]),MultiLineString:wo,Polygon:Co,MultiPolygon:e=>Array.isArray(e)?e.flatMap(Co):[]},Eo=e=>To[e?.type]?.(e.coordinates)??[],Do=e=>e.reduce(([e,t,n,r],[i,a])=>[Math.min(e,i),Math.min(t,a),Math.max(n,i),Math.max(r,a)],[1/0,1/0,-1/0,-1/0]),Oo=(e,t,n)=>n.forEach((n,r)=>e.setFloat64(t+8*r,n,!0)),ko=(e,t)=>{let n=t.reduce((e,t)=>e+t.length,0);return e===mo?20:e===_o?40+16*n:44+4*t.length+16*n},Ao=(e,t,n,r)=>{if(e.setInt32(t,n,!0),n===mo){let[[[n,i]]]=r;e.setFloat64(t+4,n,!0),e.setFloat64(t+12,i,!0);return}let i=r.flat();Oo(e,t+4,Do(i));let a=t+36;if(n!==_o&&(e.setInt32(a,r.length,!0),a+=4),e.setInt32(a,i.length,!0),a+=4,n!==_o){let t=0;r.forEach(n=>{e.setInt32(a,t,!0),a+=4,t+=n.length})}i.forEach(([t,n])=>{e.setFloat64(a,t,!0),e.setFloat64(a+8,n,!0),a+=16})},jo=(e,t,n)=>{e.setInt32(0,9994),e.setInt32(24,e.byteLength/2),e.setInt32(28,1e3,!0),e.setInt32(32,t,!0),Oo(e,36,n)},Mo=(e,t)=>{let n=t.map(t=>ko(e,t)),r=new DataView(new ArrayBuffer(n.reduce((e,t)=>e+8+t,100))),i=new DataView(new ArrayBuffer(100+8*t.length)),a=Do(t.flatMap(e=>e.flat()));jo(r,e,a),jo(i,e,a);let o=100;return t.forEach((t,a)=>{i.setInt32(100+8*a,o/2),i.setInt32(104+8*a,n[a]/2),r.setInt32(o,a+1),r.setInt32(o+4,n[a]/2),Ao(r,o+8,e,t),o+=8+n[a]}),{shp:new Uint8Array(r.buffer),shx:new Uint8Array(i.buffer)}},No=10,Po=e=>{let t=new Set;return e.map(e=>{let n=String(e.short||e.field).replace(/[^A-Za-z0-9_]/g,`_`),r=(/[A-Za-z0-9]/.test(n)?n:`FIELD`).slice(0,No),i=r;for(let e=1;t.has(i.toUpperCase());e+=1){let t=`_${e}`;i=r.slice(0,No-t.length)+t}return t.add(i.toUpperCase()),{...e,short:i}})},Fo=new TextEncoder,Io=32,Lo=254,Ro=19,zo=15,Bo=e=>{let t=Fo.encode(String(e));if(t.length<=Lo)return t;let n=Lo;for(;n>0&&(t[n]&192)==128;)--n;return t.subarray(0,n)},Vo=(e,t=0)=>e.reduce((e,t)=>Math.max(e,t),t),Ho=e=>{for(let t=0;t<zo;t+=1)if(Number(e.toFixed(t))===e)return t;return zo},Uo=e=>{let t=Vo(e.filter(e=>e!==null).map(Ho)),n=e.map(e=>e===null?null:e.toFixed(t));if(n.some(e=>e?.includes(`e`)))return null;let r=Vo(n.map(e=>e?.length??0));return r<=Ro?{type:`N`,width:r,decimals:t,cells:n.map(e=>e&&Fo.encode(e))}:null},Wo=e=>{let t=e.filter(e=>e!=null),n=e.map(e=>e===void 0?null:e);if(t.length&&t.every(e=>typeof e==`number`&&Number.isFinite(e))){let e=Uo(n);if(e)return e}if(t.length&&t.every(e=>typeof e==`boolean`))return{type:`L`,width:1,decimals:0,cells:n.map(e=>Fo.encode(e===null?`?`:e?`T`:`F`))};let r=n.map(e=>e===null?null:Bo(e));return{type:`C`,width:Vo(r.map(e=>e?.length??0),1),decimals:0,cells:r}},Go=(e,t,n)=>{let r=e.length?e.map(e=>({name:e.short,...Wo(t.map(t=>Oe(t?.properties,e.field)))})):[{name:`FID`,...Wo(t.map((e,t)=>t))}],i=32+32*r.length+1,a=r.reduce((e,t)=>e+t.width,1),o=new Uint8Array(i+a*t.length+1),s=new DataView(o.buffer);s.setUint8(0,3),s.setUint8(1,n.getFullYear()-1900),s.setUint8(2,n.getMonth()+1),s.setUint8(3,n.getDate()),s.setUint32(4,t.length,!0),s.setUint16(8,i,!0),s.setUint16(10,a,!0),r.forEach(({name:e,type:t,width:n,decimals:r},i)=>{let a=32+32*i;o.set(Fo.encode(e),a),s.setUint8(a+11,t.charCodeAt(0)),s.setUint8(a+16,n),s.setUint8(a+17,r)}),s.setUint8(i-1,13),o.fill(Io,i,o.length-1);let c=i;return t.forEach((e,t)=>{c+=1,r.forEach(({type:e,width:n,cells:r})=>{let i=r[t];i&&o.set(i,e===`N`?c+n-i.length:c),c+=n})}),s.setUint8(o.length-1,26),o},Ko=e=>`﻿`+[[`short`,`column`,`header`],...e.map(({short:e,field:t,header:n})=>[e,t,n])].map(e=>e.map(no).join(`,`)).join(`\r
`),qo=(e,t,n)=>{let r=new Set(Za(t,{exclude:n}).map(({field:e})=>e));return e.filter(({field:e})=>r.has(e))},Jo=(e,{stem:t=`features`,fields:n,exclude:r,labelResolver:i,today:a=new Date}={})=>{let o=e?.features??[],s=Po(Za(o,{fields:n,exclude:r,labelResolver:i})),c=[];return vo.forEach(({name:e,types:i,shape:l})=>{let u=o.filter(e=>i.includes(e?.geometry?.type)).map(e=>({feature:e,parts:Eo(e.geometry)})).filter(({parts:e})=>e.length);if(!u.length)return;let d=l??(u.every(({feature:e})=>e.geometry.type===`Point`)?mo:_o),f=n?.length?s:qo(s,u.map(({feature:e})=>e),r),{shp:p,shx:m}=Mo(d,u.map(({parts:e})=>e)),h=`${t}-${e}`;c.push({name:`${h}.shp`,bytes:p},{name:`${h}.shx`,bytes:m},{name:`${h}.dbf`,bytes:Go(f,u.map(({feature:e})=>e),a)},{name:`${h}.prj`,bytes:Fo.encode(po)},{name:`${h}.cpg`,bytes:Fo.encode(`UTF-8`)})}),c.push({name:`${t}-fields.csv`,bytes:Fo.encode(Ko(s))}),c},Yo=(()=>{let e=new Uint32Array(256);for(let t=0;t<256;t+=1){let n=t;for(let e=0;e<8;e+=1)n=n&1?3988292384^n>>>1:n>>>1;e[t]=n>>>0}return e})(),Xo=e=>{let t=4294967295;for(let n=0;n<e.length;n+=1)t=Yo[(t^e[n])&255]^t>>>8;return(t^4294967295)>>>0},Zo=async e=>{if(typeof CompressionStream>`u`)return null;let t;try{t=new CompressionStream(`deflate-raw`)}catch{return null}return new Uint8Array(await new Response(new Blob([e]).stream().pipeThrough(t)).arrayBuffer())},Qo=e=>e.getHours()<<11|e.getMinutes()<<5|e.getSeconds()>>1,$o=e=>Math.max(e.getFullYear()-1980,0)<<9|e.getMonth()+1<<5|e.getDate(),es=2048,ts=0,ns=8,rs=async(e,{now:t=new Date,compress:n=!0}={})=>{let r=new TextEncoder,i=Qo(t),a=$o(t),o=[];for(let{name:t,bytes:i}of e){let e=n?await Zo(i):null,a=e&&e.length<i.length?e:i;o.push({name:r.encode(t),method:a===i?ts:ns,crc:Xo(i),size:i.length,packed:a})}let s=o.reduce((e,t)=>e+30+t.name.length+t.packed.length+46+t.name.length,22),c=new Uint8Array(s),l=new DataView(c.buffer),u=0,d=e=>{l.setUint16(u,e,!0),u+=2},f=e=>{l.setUint32(u,e,!0),u+=4},p=e=>{c.set(e,u),u+=e.length},m=e=>{d(20),d(es),d(e.method),d(i),d(a),f(e.crc),f(e.packed.length),f(e.size),d(e.name.length),d(0)};o.forEach(e=>{e.offset=u,f(67324752),m(e),p(e.name),p(e.packed)});let h=u;o.forEach(e=>{f(33639248),d(20),m(e),d(0),d(0),d(0),f(0),f(e.offset),p(e.name)});let g=u-h;return f(101010256),d(0),d(0),d(o.length),d(o.length),f(g),f(h),d(0),c},is=({set:e,selection:t,exportable:n,labelResolver:r,timeScoped:i,range:a,srid:o,map:s,drawnWith:c})=>{let l=n===!1?null:n&&n!==!0?n:{},u=!!(t?.selecting&&t.feedsExport&&t.count>0),d=u?{type:`FeatureCollection`,features:t.inside}:e,f=l&&d&&(d.features?.length??0)>0,p=[l?.filename??`features`,u?`within-${Math.round(t.radius??0)||`shape`}`:null,i?`${a.from}_${a.to}`:ra()].filter(Boolean).join(`-`),m=()=>O(d,o,s),h=e=>{let t=l?.name?Oe(e?.properties,l.name):null;return t==null||t===``?Hn(c?.(e),e):String(t)},g={fields:l?.fields,exclude:l?.exclude,labelResolver:r};return{offer:l,canExport:f,saveGeoJSON:()=>U(`${p}.geojson`,Ya(m()),`application/geo+json`),saveCSV:()=>U(`${p}.csv`,ro(m(),g),`text/csv;charset=utf-8`),saveKML:()=>U(`${p}.kml`,fo(m(),{...g,nameOf:h}),`application/vnd.google-earth.kml+xml`),saveShapefile:async()=>U(`${p}.zip`,await rs(Jo(m(),{...g,stem:p})),`application/zip`)}};function J(e,t){return Array.from(e.getElementsByTagName(t))}function as(e){return e[0]===`#`?e:`#${e}`}function os(e,t,n){return Array.from(e.getElementsByTagNameNS(n,t))}function Y(e){return e?.normalize(),e?.textContent||``}function X(e,t,n){let r=e.getElementsByTagName(t),i=r.length?r[0]:null;return i&&n&&n(i),i}function Z(e,t,n){let r={};if(!e)return r;let i=e.getElementsByTagName(t),a=i.length?i[0]:null;return a&&n?n(a,r):r}function ss(e,t,n){let r=Y(X(e,t));return r&&n&&n(r)||{}}function cs(e,t,n){let r=Number.parseFloat(Y(X(e,t)));if(!Number.isNaN(r))return r&&n&&n(r)||{}}function Q(e,t,n){let r=Number.parseFloat(Y(X(e,t)));if(!Number.isNaN(r))return n&&n(r),r}function ls(e,t){let n={};for(let r of t)ss(e,r,e=>{n[r]=e});return n}function us(e){return e?.nodeType===1}function ds(e){let t=[];if(e===null)return t;for(let n of Array.from(e.childNodes)){if(!us(n))continue;let e=fs(n.nodeName);if(e===`gpxtpx:TrackPointExtension`)t=t.concat(ds(n));else{let r=Y(n);t.push([e,ps(r)])}}return t}function fs(e){return[`heart`,`gpxtpx:hr`,`hr`].includes(e)?`heart`:e}function ps(e){let t=Number.parseFloat(e);return Number.isNaN(t)?e:t}function ms(e){let t=[Number.parseFloat(e.getAttribute(`lon`)||``),Number.parseFloat(e.getAttribute(`lat`)||``)];if(Number.isNaN(t[0])||Number.isNaN(t[1]))return null;Q(e,`ele`,e=>{t.push(e)});let n=X(e,`time`);return{coordinates:t,time:n?Y(n):null,extendedValues:ds(X(e,`extensions`))}}function hs(e){return Z(e,`line`,e=>Object.assign({},ss(e,`color`,e=>({stroke:`#${e}`})),cs(e,`opacity`,e=>({"stroke-opacity":e})),cs(e,`width`,e=>({"stroke-width":e*96/25.4}))))}function gs(e,t){let n=ls(t,[`name`,`cmt`,`desc`,`type`,`time`,`keywords`]);for(let[r,i]of e)for(let e of Array.from(t.getElementsByTagNameNS(i,`*`)))n[e.tagName.replace(`:`,`_`)]=Y(e)?.trim();let r=J(t,`link`);return r.length&&(n.links=r.map(e=>Object.assign({href:e.getAttribute(`href`)},ls(e,[`text`,`type`])))),n}function _s(e,t){let n=J(e,t),r=[],i=[],a={};for(let e=0;e<n.length;e++){let t=ms(n[e]);if(t){r.push(t.coordinates),t.time&&i.push(t.time);for(let[r,i]of t.extendedValues){let t=r===`heart`?r:`${r.replace(`gpxtpx:`,``)}s`;a[t]||(a[t]=Array(n.length).fill(null)),a[t][e]=i}}}if(!(r.length<2))return{line:r,times:i,extendedValues:a}}function vs(e,t){let n=_s(t,`rtept`);if(n)return{type:`Feature`,properties:Object.assign({_gpxType:`rte`},gs(e,t),hs(X(t,`extensions`))),geometry:{type:`LineString`,coordinates:n.line}}}function ys(e,t){let n=J(t,`trkseg`),r=[],i=[],a=[];for(let e of n){let t=_s(e,`trkpt`);t&&(a.push(t),t.times?.length&&i.push(t.times))}if(a.length===0)return null;let o=a.length>1,s=Object.assign({_gpxType:`trk`},gs(e,t),hs(X(t,`extensions`)),i.length?{coordinateProperties:{times:o?i:i[0]}}:{});for(let e=0;e<a.length;e++){let t=a[e];r.push(t.line),s.coordinateProperties||(s.coordinateProperties={});let n=s.coordinateProperties;for(let[r,i]of Object.entries(t.extendedValues))o?(n[r]||(n[r]=a.map(e=>Array(e.line.length).fill(null))),n[r][e]=i):n[r]=i}return{type:`Feature`,properties:s,geometry:o?{type:`MultiLineString`,coordinates:r}:{type:`LineString`,coordinates:r[0]}}}function bs(e,t){let n=Object.assign(gs(e,t),ls(t,[`sym`])),r=ms(t);return r?{type:`Feature`,properties:n,geometry:{type:`Point`,coordinates:r.coordinates}}:null}function*xs(e){let t=e,n=`http://www.garmin.com/xmlschemas/GpxExtensions/v3`,r=[[`gpxx`,n]],i=t.getElementsByTagName(`gpx`)[0]?.attributes;if(i)for(let e of Array.from(i))e.name?.startsWith(`xmlns:`)&&e.value!==n&&r.push([e.name,e.value]);for(let e of J(t,`trk`)){let t=ys(r,e);t&&(yield t)}for(let e of J(t,`rte`)){let t=vs(r,e);t&&(yield t)}for(let e of J(t,`wpt`)){let t=bs(r,e);t&&(yield t)}}function Ss(e){return{type:`FeatureCollection`,features:Array.from(xs(e))}}function Cs(e,t){let n={},r=t===`stroke`||t===`fill`?t:`${t}-color`;return e[0]===`#`&&(e=e.substring(1)),e.length===6||e.length===3?n[r]=`#${e}`:e.length===8&&(n[`${t}-opacity`]=Number.parseInt(e.substring(0,2),16)/255,n[r]=`#${e.substring(6,8)}${e.substring(4,6)}${e.substring(2,4)}`),n}function ws(e,t,n){let r={};return Q(e,t,e=>{r[n]=e}),r}function Ts(e,t){return Z(e,`color`,e=>Cs(Y(e),t))}function Es(e){return Z(e,`Icon`,(e,t)=>(ss(e,`href`,e=>{t.icon=e}),t))}function Ds(e){return Z(e,`IconStyle`,e=>Object.assign(Ts(e,`icon`),ws(e,`scale`,`icon-scale`),ws(e,`heading`,`icon-heading`),Z(e,`hotSpot`,e=>{let t=Number.parseFloat(e.getAttribute(`x`)||``),n=Number.parseFloat(e.getAttribute(`y`)||``),r=e.getAttribute(`xunits`)||``,i=e.getAttribute(`yunits`)||``;return!Number.isNaN(t)&&!Number.isNaN(n)?{"icon-offset":[t,n],"icon-offset-units":[r,i]}:{}}),Es(e)))}function Os(e){return Z(e,`LabelStyle`,e=>Object.assign(Ts(e,`label`),ws(e,`scale`,`label-scale`)))}function ks(e){return Z(e,`LineStyle`,e=>Object.assign(Ts(e,`stroke`),ws(e,`width`,`stroke-width`)))}function As(e){return Z(e,`PolyStyle`,(e,t)=>Object.assign(t,Z(e,`color`,e=>Cs(Y(e),`fill`)),ss(e,`fill`,e=>{if(e===`0`)return{"fill-opacity":0}}),ss(e,`outline`,e=>{if(e===`0`)return{"stroke-opacity":0}})))}function js(e){return Object.assign({},As(e),ks(e),Os(e),Ds(e))}var Ms=/\s*/g,Ns=/^\s*|\s*$/g,Ps=/\s+/;function Fs(e){return e.replace(Ms,``).split(`,`).map(Number.parseFloat).filter(e=>!Number.isNaN(e)).slice(0,3)}function Is(e){return e.replace(Ns,``).split(Ps).map(Fs).filter(e=>e.length>=2)}function Ls(e){let t=J(e,`coord`);t.length===0&&(t=os(e,`coord`,`*`));let n=t.map(e=>Y(e).split(` `).map(Number.parseFloat));return n.length===0?null:{geometry:n.length>2?{type:`LineString`,coordinates:n}:{type:`Point`,coordinates:n[0]},times:J(e,`when`).map(e=>Y(e))}}function Rs(e){if(e.length===0)return e;let t=e[0],n=e[e.length-1],r=!0;for(let e=0;e<Math.max(t.length,n.length);e++)if(t[e]!==n[e]){r=!1;break}return r?e:e.concat([e[0]])}function zs(e){return Y(X(e,`coordinates`))}function Bs(e){let t=[],n=[];for(let r=0;r<e.childNodes.length;r++){let i=e.childNodes.item(r);if(us(i))switch(i.tagName){case`MultiGeometry`:case`MultiTrack`:case`gx:MultiTrack`:{let e=Bs(i);t=t.concat(e.geometries),n=n.concat(e.coordTimes);break}case`Point`:{let e=Fs(zs(i));e.length>=2&&t.push({type:`Point`,coordinates:e});break}case`LinearRing`:case`LineString`:{let e=Is(zs(i));e.length>=2&&t.push({type:`LineString`,coordinates:e});break}case`Polygon`:{let e=[];for(let t of J(i,`LinearRing`)){let n=Rs(Is(zs(t)));n.length>=4&&e.push(n)}e.length&&t.push({type:`Polygon`,coordinates:e});break}case`Track`:case`gx:Track`:{let e=Ls(i);if(!e)break;let{times:r,geometry:a}=e;t.push(a),r.length&&n.push(r);break}}}return{geometries:t,coordTimes:n}}var Vs=e=>Number(e),Hs={string:e=>e,int:Vs,uint:Vs,short:Vs,ushort:Vs,float:Vs,double:Vs,bool:e=>!!e};function Us(e,t){return Z(e,`ExtendedData`,(e,n)=>{for(let t of J(e,`Data`))n[t.getAttribute(`name`)||``]=Y(X(t,`value`));for(let r of J(e,`SimpleData`)){let e=r.getAttribute(`name`)||``;n[e]=(t[e]||Hs.string)(Y(r))}return n})}function Ws(e){let t=X(e,`description`);for(let e of Array.from(t?.childNodes||[]))if(e.nodeType===4)return{description:{"@type":`html`,value:Y(e)}};return{}}function Gs(e){return Z(e,`TimeSpan`,e=>({timespan:{begin:Y(X(e,`begin`)),end:Y(X(e,`end`))}}))}function Ks(e){return Z(e,`TimeStamp`,e=>({timestamp:Y(X(e,`when`))}))}function qs(e,t){return ss(e,`styleUrl`,e=>(e=as(e),t[e]?Object.assign({styleUrl:e},t[e]):{styleUrl:e}))}var $;(function(e){e.ABSOLUTE=`absolute`,e.RELATIVE_TO_GROUND=`relativeToGround`,e.CLAMP_TO_GROUND=`clampToGround`,e.CLAMP_TO_SEAFLOOR=`clampToSeaFloor`,e.RELATIVE_TO_SEAFLOOR=`relativeToSeaFloor`})($||($={}));function Js(e){switch(e?.textContent){case $.ABSOLUTE:return $.ABSOLUTE;case $.CLAMP_TO_GROUND:return $.CLAMP_TO_GROUND;case $.CLAMP_TO_SEAFLOOR:return $.CLAMP_TO_SEAFLOOR;case $.RELATIVE_TO_GROUND:return $.RELATIVE_TO_GROUND;case $.RELATIVE_TO_SEAFLOOR:return $.RELATIVE_TO_SEAFLOOR}return null}function Ys(e){return X(e,`gx:LatLonQuad`)?{geometry:{type:`Polygon`,coordinates:[Rs(Is(zs(e)))]}}:Qs(e)}var Xs=Math.PI/180;function Zs(e,t,n){let r=[(e[0]+e[2])/2,(e[1]+e[3])/2];return[t[0].map(e=>{let t=e[1]-r[1],i=e[0]-r[0],a=Math.sqrt(t**2+i**2),o=Math.atan2(t,i)+n*Xs;return[r[0]+Math.cos(o)*a,r[1]+Math.sin(o)*a]})]}function Qs(e){let t=X(e,`LatLonBox`);if(t){let e=Q(t,`north`),n=Q(t,`west`),r=Q(t,`east`),i=Q(t,`south`),a=Q(t,`rotation`);if(typeof e==`number`&&typeof i==`number`&&typeof n==`number`&&typeof r==`number`){let t=[n,i,r,e],o=[[[n,e],[r,e],[r,i],[n,i],[n,e]]];return typeof a==`number`&&(o=Zs(t,o,a)),{bbox:t,geometry:{type:`Polygon`,coordinates:o}}}}return null}function $s(e,t,n,r){let i=Ys(e),a=i?.geometry||null;if(!a&&r.skipNullGeometry)return null;let o={type:`Feature`,geometry:a,properties:Object.assign({"@geometry-type":`groundoverlay`},ls(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`description`]),Ws(e),qs(e,t),js(e),Es(e),Us(e,n),Gs(e),Ks(e))};i?.bbox&&(o.bbox=i.bbox),o.properties?.visibility!==void 0&&(o.properties.visibility=o.properties.visibility!==`0`);let s=e.getAttribute(`id`);return s!==null&&s!==``&&(o.id=s),o}function ec(e){let t=X(e,`Region`);return t?{coordinateBox:nc(t),lod:tc(e)}:null}function tc(e){let t=X(e,`Lod`);return t?[Q(t,`minLodPixels`)??-1,Q(t,`maxLodPixels`)??-1,Q(t,`minFadeExtent`)??null,Q(t,`maxFadeExtent`)??null]:null}function nc(e){let t=X(e,`LatLonAltBox`);if(t){let e=Q(t,`north`),n=Q(t,`west`),r=Q(t,`east`),i=Q(t,`south`);if(Js(X(t,`altitudeMode`)||X(t,`gx:altitudeMode`))&&console.debug(`Encountered an unsupported feature of KML for togeojson: please contact developers for support of altitude mode.`),typeof e==`number`&&typeof i==`number`&&typeof n==`number`&&typeof r==`number`)return{bbox:[n,i,r,e],geometry:{type:`Polygon`,coordinates:[[[n,e],[r,e],[r,i],[n,i],[n,e]]]}}}return null}function rc(e){let t=X(e,`Link`);return t?ls(t,[`href`,`refreshMode`,`refreshInterval`,`viewRefreshMode`,`viewRefreshTime`,`viewBoundScale`,`viewFormat`,`httpQuery`]):{}}function ic(e,t,n,r){let i=ec(e),a=i?.coordinateBox?.geometry||null;if(!a&&r.skipNullGeometry)return null;let o={type:`Feature`,geometry:a,properties:Object.assign({"@geometry-type":`networklink`},ls(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`styleUrl`,`refreshVisibility`,`flyToView`,`description`]),Ws(e),qs(e,t),js(e),Es(e),Us(e,n),Gs(e),Ks(e),rc(e),i?.lod?{lod:i.lod}:{})};i?.coordinateBox?.bbox&&(o.bbox=i.coordinateBox.bbox),o.properties?.visibility!==void 0&&(o.properties.visibility=o.properties.visibility!==`0`);let s=e.getAttribute(`id`);return s!==null&&s!==``&&(o.id=s),o}function ac(e){return e.length===0?null:e.length===1?e[0]:{type:`GeometryCollection`,geometries:e}}function oc(e,t,n,r){let{coordTimes:i,geometries:a}=Bs(e),o=ac(a);if(!o&&r.skipNullGeometry)return null;let s={type:`Feature`,geometry:o,properties:Object.assign(ls(e,[`name`,`address`,`visibility`,`open`,`phoneNumber`,`description`]),Ws(e),qs(e,t),js(e),Us(e,n),Gs(e),Ks(e),i.length?{coordinateProperties:{times:i.length===1?i[0]:i}}:{})};s.properties?.visibility!==void 0&&(s.properties.visibility=s.properties.visibility!==`0`);let c=e.getAttribute(`id`);return c!==null&&c!==``&&(s.id=c),s}function sc(e){let t=e.getAttribute(`id`),n=e.parentNode;return!t&&us(n)&&n.localName===`CascadingStyle`&&(t=n.getAttribute(`kml:id`)||n.getAttribute(`id`)),as(t||``)}function cc(e){let t={};for(let n of J(e,`Style`))t[sc(n)]=js(n);for(let n of J(e,`StyleMap`)){let e=as(n.getAttribute(`id`)||``);ss(n,`styleUrl`,n=>{n=as(n),t[n]&&(t[e]=t[n])})}return t}function lc(e){let t={};for(let n of J(e,`SimpleField`))t[n.getAttribute(`name`)||``]=Hs[n.getAttribute(`type`)||``]||Hs.string;return t}function*uc(e,t={skipNullGeometry:!1}){let n=e,r=cc(n),i=lc(n);for(let e of J(n,`Placemark`)){let n=oc(e,r,i,t);n&&(yield n)}for(let e of J(n,`GroundOverlay`)){let n=$s(e,r,i,t);n&&(yield n)}for(let e of J(n,`NetworkLink`)){let n=ic(e,r,i,t);n&&(yield n)}}function dc(e,t={skipNullGeometry:!1}){return{type:`FeatureCollection`,features:Array.from(uc(e,t))}}var fc={bytes:20971520,positions:2e5},pc=(e,t=fc)=>e>t.bytes?{refused:`tooLarge`,size:e,limit:t.bytes}:null,mc=e=>new DOMParser().parseFromString(e,`application/xml`),hc=e=>!e?.documentElement||e.getElementsByTagName(`parsererror`).length>0,gc=e=>({type:`Feature`,...e.id!==void 0&&{id:e.id},properties:e.properties&&typeof e.properties==`object`?e.properties:{},geometry:e.geometry??null}),_c=new Set([`Point`,`MultiPoint`,`LineString`,`MultiLineString`,`Polygon`,`MultiPolygon`,`GeometryCollection`]),vc=e=>{let t;try{t=JSON.parse(e)}catch{return null}return t?.type===`FeatureCollection`&&Array.isArray(t.features)?{type:`FeatureCollection`,features:t.features.filter(e=>e?.type===`Feature`).map(gc)}:t?.type===`Feature`?{type:`FeatureCollection`,features:[gc(t)]}:_c.has(t?.type)?{type:`FeatureCollection`,features:[gc({geometry:t})]}:null},yc=[`Style`,`StyleMap`,`styleUrl`],bc=e=>(yc.forEach(t=>{Array.from(e.getElementsByTagName(t)).forEach(e=>e.parentNode?.removeChild(e))}),e),xc=e=>{let t=e.properties?.description;return t&&typeof t==`object`&&`value`in t?{...e,properties:{...e.properties,description:String(t.value??``)}}:e},Sc=e=>({type:`FeatureCollection`,features:dc(bc(e),{skipNullGeometry:!0}).features.map(xc).map(gc)}),Cc=e=>({type:`FeatureCollection`,features:Ss(e).features.map(gc)}),wc=(e,t)=>{let n;try{n=t(e)}catch{return null}if(hc(n))return null;let r=n.documentElement.localName??n.documentElement.nodeName;return r===`kml`?{format:`kml`,collection:Sc(n)}:r===`gpx`?{format:`gpx`,collection:Cc(n)}:null},Tc=e=>{let[t,n]=e;return!Number.isFinite(t)||!Number.isFinite(n)?`unreadable`:Math.abs(t)>180||Math.abs(n)>90?`notDegrees`:null},Ec=(e,t=``)=>{let n=new Uint8Array(e,0,Math.min(4,e.byteLength));return n[0]===80&&n[1]===75&&(n[2]===3&&n[3]===4||n[2]===5&&n[3]===6)?`zip`:n[0]===0&&n[1]===0&&n[2]===39&&n[3]===10?`shp`:/\.(dbf|shx|prj|cpg)$/i.test(t)?`part`:`text`},Dc=({format:e,collection:t},n)=>{let r=t.features.map(e=>({feature:e,positions:g(e.geometry)})).filter(({positions:e})=>e.length>0);if(r.length===0)return{refused:`empty`};let i=r.reduce((e,t)=>e+t.positions.length,0);if(i>n.positions)return{refused:`tooManyPoints`,count:i,limit:n.positions};for(let e of r)for(let t of e.positions){let e=Tc(t);if(e)return{refused:e}}return{format:e,collection:{type:`FeatureCollection`,features:r.map(({feature:e})=>e)},positions:i}},Oc=(e,{parse:t=mc,limits:n=fc}={})=>{let r=String(e??``).replace(/^﻿/,``).trimStart(),i=null;try{if(r.startsWith(`{`)){let e=vc(r);i=e&&{format:`geojson`,collection:e}}else r.startsWith(`<`)&&(i=wc(r,t))}catch(e){console.warn(`perun-atlas: a file could not be read`,e),i=null}return i?Dc(i,n):{refused:`unreadable`}},kc=e=>{let t=new Set(e.flatMap(({collection:e})=>e.features.flatMap(e=>Object.keys(e?.properties??{})))),n=`layer`;for(let e=2;t.has(n);e+=1)n=`layer_${e}`;return n},Ac=(e,{limits:t=fc}={})=>{if(e.refused)return e;let n=e.layers.length>1?kc(e.layers):null,r=e.layers.flatMap(({name:e,collection:t})=>t.features.map(t=>{let r=gc(t);return n?{...r,properties:{[n]:e,...r.properties}}:r})),i=e.layers.some(e=>e.assumed),a=Dc({format:`shapefile`,collection:{type:`FeatureCollection`,features:r}},t);return a.refused===`notDegrees`&&i?{refused:`noPrj`}:a.refused?a:{...a,assumed:i}},jc={shp:`shp.perun-atlas.js?v=d5c16b00062c`},Mc=typeof document>`u`?null:document.currentScript?.src||null,Nc=()=>Mc??(typeof document>`u`?null:Array.from(document.scripts).find(e=>/\/perun-atlas\.js(\?|$)/.test(e.src))?.src??null),Pc=(e,t,n=jc)=>t&&n[e]?new URL(n[e],t).href:null,Fc=new Map,Ic=(e,{base:t=Nc(),files:n=jc,load:r=e=>import(e)}={})=>{if(!Fc.has(e)){let i=Pc(e,t,n),a=i?r(i):Promise.reject(Error(`perun-atlas: cannot tell where the ${e} module is. It is loaded from beside perun-atlas.js, and that script could not be found.`));a.catch(()=>Fc.delete(e)),Fc.set(e,a)}return Fc.get(e)},{useRef:Lc,useState:Rc}=t.React,zc=()=>new Promise(e=>{requestAnimationFrame(()=>setTimeout(e,0))}),Bc=async e=>{let t=await e.arrayBuffer(),n=Ec(t,e.name);if(n===`text`)return Oc(new TextDecoder().decode(t));if(n===`part`)return{refused:`shapefilePart`};let r;try{r=await Ic(`shp`)}catch(e){return console.warn(`perun-atlas: the shapefile reader could not be loaded`,e),{refused:`readerUnavailable`}}return Ac(await r.readShapefile(t,{kind:n,limit:fc.bytes}))},Vc=({overlay:e,labels:t,onChange:n})=>{let r=e!==!1,[i,a]=Rc(null),[o,s]=Rc(null),[c,l]=Rc(null),[u,d]=Rc(null),f=Lc(null),p=Lc(0),m=()=>f.current?.click(),h=async e=>{let r=++p.current,i=pc(e.size);if(!i){if(d(e.name),await zc(),r!==p.current)return;try{i=await Bc(e)}catch(e){console.warn(`perun-atlas: a file could not be read`,e),i={refused:`unreadable`}}}r===p.current&&(i.refused?(d(null),s(Vi(i,e.name,t))):(s(null),l(i.assumed?zi(e.name,t):null),a({name:e.name,collection:i.collection,count:i.collection.features.length}),n?.()))},g=e=>{let t=e.target.files?.[0];e.target.value=``,t&&h(t)},_=()=>{p.current+=1,d(null),l(null),a(null),n?.()};return{offered:r,file:i,refusal:o,note:c,opening:u,inputRef:f,choose:m,onPicked:g,close:_,drawn:()=>d(null),failed:()=>{i&&(s(Vi({refused:`unreadable`},i.name,t)),_())},dismiss:()=>s(null),dismissNote:()=>l(null)}},{useState:Hc}=t.React,Uc=({coloured:e})=>{let[t,n]=Hc(null),[r,i]=Hc(!0),a=e?{values:[],usedFallback:!1}:[],[o,s]=Hc(a),[c,l]=Hc(null),u=t===null?null:c??t,[d,f]=Hc(null);return{set:t,visible:u,loading:r,drawn:o,extent:d,setDrawn:s,setShown:l,setExtent:f,onFetchStart:()=>{i(!0),s(a)},onFetched:e=>{n(e??{features:[]}),i(!1)},onFetchFailed:()=>{n({features:[]}),l(null),f(null),i(!1)},forget:()=>n(null)}},{useEffect:Wc,useState:Gc}=t.React,Kc=({subject:e,drawing:t})=>{let[n,r]=Gc(null),i=t=>Vr(t,e?.id,e?.match);return Wc(()=>{if(!n)return;let e=e=>{e.key===`Escape`&&r(null)};return document.addEventListener(`keydown`,e),()=>document.removeEventListener(`keydown`,e)},[n]),{record:n,openRecord:(e,n)=>{t||n&&r(n)},closeRecord:()=>r(null),isSubject:i,descriptorFor:t=>e?.descriptor&&i(t)?e.descriptor:null,isPinnedFeature:e=>i(e)}},qc=[`map`,`at`,`base`,`from`,`to`],Jc=/^\d{4}-\d{2}-\d{2}$/,Yc=e=>{let t=Math.max(e.indexOf(`#`),0),n=e.indexOf(`?`,t);return n===-1?{head:e,query:``}:{head:e.slice(0,n),query:e.slice(n+1)}},Xc=e=>Jc.test(e??``)&&new Date(`${e}T00:00:00Z`).toISOString().slice(0,10)===e,Zc=(e,t)=>String(Number(e.toFixed(t))),Qc=e=>((e+180)%360+360)%360-180,$c=(e,t)=>{if(t==null||t===``)return null;let n=new URLSearchParams(Yc(e).query);if(n.get(`map`)!==String(t))return null;let r={},i=(n.get(`at`)??``).split(`,`);if(i.length===3&&i.every(e=>e.trim()!==``)){let[e,t,n]=i.map(Number);Math.abs(e)<=90&&Math.abs(t)<=180&&n>=0&&n<=30&&(r.center=[e,t],r.zoom=n)}let a=n.get(`base`);a&&(r.basemap=a);let o=n.get(`from`),s=n.get(`to`);return Xc(o)&&Xc(s)&&o<=s&&(r.from=o,r.to=s),r},el=(e,t,{center:n,zoom:r,basemap:i,from:a,to:o}={})=>{let{head:s,query:c}=Yc(e),l=new URLSearchParams(c);return qc.forEach(e=>l.delete(e)),l.set(`map`,String(t)),n&&Number.isFinite(r)&&l.set(`at`,[Zc(n[0],6),Zc(Qc(n[1]),6),Zc(r,2)].join(`,`)),i&&l.set(`base`,i),a&&o&&(l.set(`from`,a),l.set(`to`,o)),`${s}?${l.toString().replace(/%2C/gi,`,`)}`},tl=new Set,nl=(e,t)=>{if(tl.has(e))return null;let n=$c(e,t);return n&&tl.add(e),n},{useEffect:rl,useRef:il,useState:al}=t.React,ol=2e3,sl=({linkId:e,link:t,timeScoped:n,range:r,labels:i={}})=>{let a=e!=null&&e!==``&&t!==!1,o=il(null),[s,c]=al(!1);return rl(()=>{if(!s)return;let e=setTimeout(()=>c(!1),ol);return()=>clearTimeout(e)},[s]),{offered:a,copied:s,attach:({map:e,basemap:t})=>{o.current={map:e,basemap:t}},copy:async t=>{let{map:a,basemap:s}=o.current??{};if(!a)return;let l=a.getCenter(),u=el(window.location.href,e,{center:[l.lat,l.lng],zoom:a.getZoom(),basemap:Ee(s,a),...n&&{from:r.from,to:r.to}});await Ke(u,t?.parentNode??void 0)?c(!0):window.prompt(i.copyLinkPrompt??`Copy this link:`,u)}}};G(`/*
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
`);var{useEffect:cl,useMemo:ll,useState:ul}=t.React,dl=({session:e,servicePath:n,context:r,descriptors:i,labelResolver:a,cluster:o,subject:s,presets:c=[],defaultMonths:l,labels:u={},map:d,exportable:f,overlay:p,legend:m=!0,notice:h=!0,tokens:g,title:_,choropleth:v,draw:y,view:b,linkId:x,link:S,className:C=``,onClose:w})=>{let[T,ee]=ul(!0),[E,D]=ul(!!b?.center),O=()=>{E&&D(!1)},[k,A]=ul(null),[j,te]=ul(void 0),[ne,M]=ul(!1),{timeScoped:N,preset:P,range:F,initial:re,longest:ie,applyPreset:ae,onRangeChange:I}=ca({presets:c,defaultMonths:l,servicePath:n,opening:b?.from&&b?.to?{from:b.from,to:b.to}:void 0,onMoved:()=>{Se(),He()}}),L=ll(()=>({...r||{},...N&&{from:F.from,to:F.to},...k&&{srid:k}}),[r,N,F.from,F.to,k]),oe=JSON.stringify(L),{coloured:se,statusPath:ce,rows:le,tooltip:ue}=ta({choropleth:v,bindings:L,bindingKey:oe}),{set:de,visible:fe,loading:pe,drawn:me,extent:he,setDrawn:ge,setShown:_e,setExtent:ve,onFetchStart:ye,onFetched:be,onFetchFailed:xe,forget:Se}=Uc({coloured:se}),[Ce,we]=ul([]),Te=e=>we(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e]),Ee=()=>we([]),[De,Oe]=ul(null),{drawable:R,drawing:z,shape:ke,selection:B,note:Ae,form:je,saving:Me,reload:Ne,setShape:Pe,setNote:Fe,startDrawing:Ie,finishDrawing:Le,clearDrawing:Re,saveShape:ze}=Ja({draw:y,dataSrid:k,set:fe,bindings:L,labels:u,map:j}),{record:Be,openRecord:Ve,closeRecord:He,descriptorFor:Ue,isPinnedFeature:We}=Kc({subject:s,drawing:z}),V=Vc({overlay:p,labels:u,onChange:()=>we(e=>e.filter(e=>e!==Yn))}),{file:H}=V;cl(()=>{Be?.file&&Be.file!==H&&He()},[H]);let Ge=is({set:fe,selection:B,exportable:f,labelResolver:a,timeScoped:N,range:F,srid:k,map:j,drawnWith:e=>se?i?.[v.descriptor]:zn(i?.[Ue(e)??zr(e)],e)}),U=sl({linkId:x,link:S,timeScoped:N,range:F,labels:u}),Ke=!pe&&de!==null&&(de.features?.length??0)===0&&h!==!1&&!z&&!ke&&!H&&De!==oe;return t.React.createElement(`div`,{className:`atlas-panel ${C}${T?``:` atlas-panel--nolabels`}`.trim(),style:g},t.React.createElement(`header`,{className:`atlas-panel__header`},t.React.createElement(`div`,{className:`atlas-panel__title`},_),w&&t.React.createElement(Ai,{label:u.close??`Close`,onClick:w})),t.React.createElement(`div`,{className:`atlas-panel__toolbar`},N&&t.React.createElement(Xi,{range:F,onRangeChange:I,presets:c,preset:P,applyPreset:ae,labels:u}),!se&&t.React.createElement(`button`,{type:`button`,className:`atlas-panel__switch`,"aria-pressed":T,onClick:()=>ee(!T)},t.React.createElement(`span`,{className:`atlas-panel__track`},t.React.createElement(`span`,{className:`atlas-panel__knob`})),u.labels??`Labels`),(R||Ge.canExport||V.offered||U.offered)&&t.React.createElement(`div`,{className:`atlas-panel__actions`},R&&t.React.createElement(Pr,{drawing:z,busy:Me,labels:u,onStart:Ie,onCancel:Re}),Ge.canExport&&t.React.createElement(Pi,{exporter:Ge,labels:u}),t.React.createElement(Ui,{fileOverlay:V,labels:u}),U.offered&&t.React.createElement(Ki,{viewLink:U,labels:u})),t.React.createElement(Wi,{fileOverlay:V,labels:u}),R&&(z||ke)&&t.React.createElement(Rr,{shape:ke,drawing:z,busy:Me,limits:y.radius,caught:B.selecting?{count:B.count,total:B.total}:void 0,savable:!!y.save?.onSave,note:y.note?{value:Ae,onChange:Fe,required:y.note.required}:void 0,form:je,labels:u,onCancel:Re,onRadius:e=>Pe(t=>t&&{...t,radius:e}),onSave:ze})),t.React.createElement(`div`,{className:`atlas-panel__body`},t.React.createElement(`div`,{className:`atlas-panel__mapwrap`},t.React.createElement(`div`,{className:`atlas-panel__map`},t.React.createElement(kn,{session:e,layerSwitcher:!0,...d,extent:he,view:b,noticeLabels:u,onReady:e=>{M(!1),te(e.map),A(e.config?.dataSrid??null),U.attach(e)},onError:()=>M(!0)},se?(le!==null||!ce)&&t.React.createElement(Sr,{servicePath:n,context:L,srid:k,reload:Ne,statusRows:le,join:v.join,field:v.field,palette:v.palette,fallback:v.fallback,descriptor:i?.[v.descriptor],labelResolver:a,tooltip:ue,hidden:Ce,onFeatureClick:Ve,onLegend:ge,onShown:_e,onLoadStart:ye,onLoad:be,onError:xe}):t.React.createElement(si,{servicePath:n,context:L,reload:Ne,descriptors:i,descriptorFor:Ue,labelResolver:a,cluster:o,pinned:We,hidden:Ce,fit:!E,onFeatureClick:Ve,onLegend:ge,onShown:_e,onExtent:ve,onLoadStart:ye,onLoad:e=>{O(),be(e)},onError:e=>{O(),xe(e)}}),H&&t.React.createElement(bi,{file:H,srid:k,hidden:Ce.includes(`::file`),labelResolver:a,onFeatureClick:Ve,onDrawn:V.drawn,onError:V.failed}),R&&t.React.createElement(kr,{value:ke,drawing:z,style:y.style,onChange:Pe,onDrawn:Le}),m!==!1&&t.React.createElement(ki,{entries:[...se?nr({palette:v.palette,fallback:v.fallback??rr.__unknown,unknownLabel:v.unknownLabel,...me},a):tr(me,a),...H?[di(H.name)]:[]],title:u.legend,hidden:Ce,onToggle:Te,onShowAll:Ee,showAllLabel:u.showAll,position:typeof m==`string`?m:void 0}))),!ne&&(pe||Me||V.opening)&&t.React.createElement(qi,{saving:Me,opening:V.opening,labels:u}),Ke&&t.React.createElement(ji,{timeScoped:N,longest:ie,preset:P,applyPreset:ae,labels:u,onClose:()=>Oe(oe)})),Be&&t.React.createElement(Yi,{record:Be,labels:u,onClose:He})),(N||w)&&t.React.createElement(Ji,{timeScoped:N,range:F,initial:re,applyPreset:ae,labels:u,onClose:w}))};G(`/*
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
`);var{factory:fl}=f,{useEffect:pl,useRef:ml}=t.React,hl=`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 26 36">
  <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 23 13 23s13-13.25 13-23C26 5.82 20.18 0 13 0z"
        fill="currentColor" stroke="#ffffff" stroke-width="1.75"/>
  <circle cx="13" cy="13" r="4" fill="#ffffff"/>
</svg>`,gl=({value:e,onChange:t,draggable:n=!0,className:r=`atlas-pin`,html:i=hl,size:a=[20,28],anchor:o=[10,28]})=>{let s=V(),c=ml(null),l=ml(t);return l.current=t,pl(()=>{let e=e=>l.current?.({lat:e.latlng.lat,lng:e.latlng.lng});return s.on(`click`,e),()=>{s.off(`click`,e),c.current&&(s.removeLayer(c.current),c.current=null)}},[s]),pl(()=>{if(!e){c.current&&(s.removeLayer(c.current),c.current=null);return}if(c.current){c.current.setLatLng(e);return}let t=fl.marker(e,{icon:fl.divIcon({className:r,html:i,iconSize:a,iconAnchor:o}),draggable:n}).addTo(s);t.on(`drag`,e=>l.current?.({...e.target.getLatLng()})),c.current=t},[s,e?.lat,e?.lng]),null},{labelsManager:_l}=t.utils,{useMemo:vl,useState:yl}=t.React,bl=(0,t.connect)((e,t)=>({session:t.session??e?.security?.svSession}))(e=>{let n=(0,t.useIntl)(),{objConfig:r,objectId:i,session:a,labelDomain:o=`main`,title:s,className:c,linkId:l,onClose:u}=e,[d]=yl(()=>nl(window.location.href,l)),f=e=>{if(!e)return;let t=_l(e,n,o);return!t||t===`perun.${o}.${e}`?void 0:t},p=vl(()=>({session:a,objectId:i,...r?.context||{}}),[a,i,r]),m=vl(()=>(r?.presets||[]).map(({months:e,label:t})=>({months:e,label:f(t)??`${e}`})),[r,n,o]),h=vl(()=>Object.fromEntries(Object.entries(r?.labels||{}).map(([e,t])=>[e,f(t)])),[r,n,o]),g=r?.service;if(!g){let e=`The button${l?` ${l}`:``} has no "service" in its objectConfiguration.`;return t.React.createElement($e,{className:`atlas-panel-unavailable`,icon:`map`,title:B(`noService`,h),hint:f(`map_service_missing`)??B(`noServiceHint`,h),details:e,copy:e,labels:h})}return t.React.createElement(dl,{session:a,servicePath:g,context:p,descriptors:r?.descriptors||{},labelResolver:f,cluster:r?.cluster,subject:r?.subject?{...r.subject,id:i}:void 0,title:s??f(r?.title),presets:m,defaultMonths:r?.defaultMonths,map:r?.map,choropleth:r?.choropleth,draw:r?.draw,exportable:r?.export,overlay:r?.overlay,legend:r?.legend,notice:r?.notice,tokens:r?.tokens,labels:h,view:d??void 0,linkId:l,link:r?.link,className:c,onClose:u})}),xl=a,Sl=o;e.AtlasMap=kn,e.Choropleth=Sr,e.CirclePicker=kr,e.ConfiguredMap=bl,e.DateRange=jr,e.DrawBar=Rr,e.DrawTool=Pr,e.FeaturePanel=dl,e.FeatureSet=si,e.Legend=Oi,e.LegendControl=ki,e.PointPicker=gl,e.ZoomRail=yn,Object.defineProperty(e,"config",{enumerable:!0,get:function(){return l}}),e.name=xl,e.version=Sl});