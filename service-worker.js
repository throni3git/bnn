if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return a[e]||(s=new Promise(async s=>{if("document"in self){const a=document.createElement("script");a.src=e,document.head.appendChild(a),a.onload=s}else importScripts(e),s()})),s.then(()=>{if(!a[e])throw new Error(`Module ${e} didn’t register its module`);return a[e]})},s=(s,a)=>{Promise.all(s.map(e)).then(e=>a(1===e.length?e[0]:e))},a={require:Promise.resolve(s)};self.define=(s,i,r)=>{a[s]||(a[s]=Promise.resolve().then(()=>{let a={};const d={uri:location.origin+s.slice(1)};return Promise.all(i.map(s=>{switch(s){case"exports":return a;case"module":return d;default:return e(s)}})).then(e=>{const s=r(...e);return a.default||(a.default=s),a})}))}}define("./service-worker.js",["./workbox-468c4d03"],(function(e){"use strict";e.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/drumsets/505.json",revision:"f19fe697e88aff10b10055f6252b3f8c"},{url:"assets/drumsets/505/bd.wav",revision:"29fdd05e8b31011c691d113ec2ca78c9"},{url:"assets/drumsets/505/hhc.wav",revision:"e45a786d1820f17e68735efb52075264"},{url:"assets/drumsets/505/hho.wav",revision:"38701e1d243a3e4f4f8a0789e09ff4b5"},{url:"assets/drumsets/505/sn.wav",revision:"cd266ac862e3cf4bd35817202b402c00"},{url:"assets/drumsets/hydro.json",revision:"78ba61e8c4cd0b977e2042ea7cb15998"},{url:"assets/drumsets/hydro/bd.wav",revision:"01fd2addb822825cee48faee2d1a3981"},{url:"assets/drumsets/hydro/hhc.wav",revision:"92e649bd66d27ebc69d38b08d0b9a871"},{url:"assets/drumsets/hydro/hho.wav",revision:"9d346b891619cd7fb8925902d1ff6e8b"},{url:"assets/drumsets/hydro/sn.wav",revision:"9354c56493f8e0772d59679d8a44b167"},{url:"assets/drumsets/index.json",revision:"8342bd27fcf78da33ffeefbb5480275a"},{url:"assets/images/favicon.afdesign",revision:"d59c5cecc462f25c40ae015e9ce5e301"},{url:"assets/images/favicon128.png",revision:"9775eff38fe55cdcdef579938ff9fa0c"},{url:"assets/images/favicon16.png",revision:"b2190f8171979f4a7f6b77045dfb9492"},{url:"assets/images/favicon24.png",revision:"3caa401790e5822d45bd375e98039c39"},{url:"assets/images/favicon256.png",revision:"a8358bddc3877d65382a28abd49f1fca"},{url:"assets/images/favicon32.png",revision:"5404257fc31caeb042efb055efe74845"},{url:"assets/images/favicon48.png",revision:"08e87a106dae22c320b6952a5965a4dd"},{url:"assets/images/favicon64.png",revision:"890248a32ee11fbacc88f3915d877e1c"},{url:"assets/images/favicon96.png",revision:"40cf382243de2e4fa7d800558cc99b60"},{url:"assets/images/winicon.ico",revision:"d8c2bece4b1ff8365edea83f96922d7c"},{url:"assets/images/winicon.xcf",revision:"26bf9a055d6b4733598246d07d6b6ec1"},{url:"assets/loops/debug.txt",revision:"ebecb535a362e95dbd09816ea1e44bcf"},{url:"assets/loops/straight44.txt",revision:"a83f10419db2a855380c8b5c538f717e"},{url:"assets/loops/template.txt",revision:"a83f10419db2a855380c8b5c538f717e"},{url:"bundle.447993adf023d4d47257.js",revision:"59da1ceb102908cea52bd6c1e019e3a6"},{url:"favicon16.png",revision:"b2190f8171979f4a7f6b77045dfb9492"},{url:"index.html",revision:"a30cd66ad2c3ff6b47017b65707d8258"},{url:"manifest.9a08dcf5.webmanifest",revision:"acbad7a7105ba958afabfeb31b57f9ee"}],{})}));
