if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return o[e]||(s=new Promise((async s=>{if("document"in self){const o=document.createElement("script");o.src=e,document.head.appendChild(o),o.onload=s}else importScripts(e),s()}))),s.then((()=>{if(!o[e])throw new Error(`Module ${e} didn’t register its module`);return o[e]}))},s=(s,o)=>{Promise.all(s.map(e)).then((e=>o(1===e.length?e[0]:e)))},o={require:Promise.resolve(s)};self.define=(s,a,r)=>{o[s]||(o[s]=Promise.resolve().then((()=>{let o={};const i={uri:location.origin+s.slice(1)};return Promise.all(a.map((s=>{switch(s){case"exports":return o;case"module":return i;default:return e(s)}}))).then((e=>{const s=r(...e);return o.default||(o.default=s),o}))})))}}define("./service-worker.js",["./workbox-8e002339"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/drumsets/505.json",revision:"f19fe697e88aff10b10055f6252b3f8c"},{url:"assets/drumsets/505/bd.wav",revision:"29fdd05e8b31011c691d113ec2ca78c9"},{url:"assets/drumsets/505/hhc.wav",revision:"e45a786d1820f17e68735efb52075264"},{url:"assets/drumsets/505/hho.wav",revision:"38701e1d243a3e4f4f8a0789e09ff4b5"},{url:"assets/drumsets/505/sn.wav",revision:"cd266ac862e3cf4bd35817202b402c00"},{url:"assets/drumsets/hydro.json",revision:"78ba61e8c4cd0b977e2042ea7cb15998"},{url:"assets/drumsets/hydro/bd.wav",revision:"01fd2addb822825cee48faee2d1a3981"},{url:"assets/drumsets/hydro/hhc.wav",revision:"92e649bd66d27ebc69d38b08d0b9a871"},{url:"assets/drumsets/hydro/hho.wav",revision:"9d346b891619cd7fb8925902d1ff6e8b"},{url:"assets/drumsets/hydro/sn.wav",revision:"9354c56493f8e0772d59679d8a44b167"},{url:"assets/drumsets/index.json",revision:"8342bd27fcf78da33ffeefbb5480275a"},{url:"assets/fonts/Comfortaa-Regular.woff2",revision:"e6a4e6abd8490bbfa32ac08233585197"},{url:"assets/icons/logo120.png",revision:"33a0eb5da6ab862cbe4148514a3dfc14"},{url:"assets/icons/logo128.png",revision:"270a12b9e70ac6648be3e5a0b1302f01"},{url:"assets/icons/logo144.png",revision:"068d3390e899b6c22705d3ac454f726b"},{url:"assets/icons/logo152.png",revision:"b08870b37f5c8f12a6d1be83c5cd21e0"},{url:"assets/icons/logo16.png",revision:"6fa6fa102ab590b1216e7b6668307923"},{url:"assets/icons/logo180.png",revision:"83a84ea483d0ca99e67e8738b46633b1"},{url:"assets/icons/logo192.png",revision:"add7a1e3135073606a3259abefba68bd"},{url:"assets/icons/logo24.png",revision:"d94cfce5e88eea021392fe229ddadf55"},{url:"assets/icons/logo256.png",revision:"5695fa8aa1af0ebd0e9abf6f33f69c38"},{url:"assets/icons/logo32.png",revision:"208bb88ee1cd808968d174ce3d806393"},{url:"assets/icons/logo384.png",revision:"e47fdee42d5516ee91dab7118305ad26"},{url:"assets/icons/logo48.png",revision:"1648e5dd4b169d9ce7722a19b46787e4"},{url:"assets/icons/logo512.png",revision:"0a3a57ad9a702b5b04797b3cc1c19a71"},{url:"assets/icons/logo64.png",revision:"087d0ae6213dd54247a6dfc9745eeec9"},{url:"assets/icons/logo72.png",revision:"e75933f0d7a3eb6eb4fd00fc4145d42a"},{url:"assets/icons/logo96.png",revision:"5e93cfbc1e0c0b68da47a757f1db5067"},{url:"assets/images/winicon.ico",revision:"d8c2bece4b1ff8365edea83f96922d7c"},{url:"assets/images/winicon.xcf",revision:"26bf9a055d6b4733598246d07d6b6ec1"},{url:"assets/loops/debug.txt",revision:"d19b1d3715b48c989c2625c398d513d4"},{url:"assets/loops/straight44.txt",revision:"53582fa8f29ab4e0b2a4127bb21ca6fa"},{url:"assets/loops/template.txt",revision:"a83f10419db2a855380c8b5c538f717e"},{url:"bundle.8c34b665292fde1bf79e.js",revision:null},{url:"bundle.8c34b665292fde1bf79e.js.LICENSE.txt",revision:"f6098579ebb0a4c2b436ae968ead1180"},{url:"index.html",revision:"6e1deac4b2937ffcc588f00e87225b36"},{url:"logo16.png",revision:"6fa6fa102ab590b1216e7b6668307923"},{url:"manifest.17628d32.webmanifest",revision:"d55baabd20b902a487adea73b7ce29d2"}],{})}));
