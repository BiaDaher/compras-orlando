const CACHE='compras-orlando-v132';
const IMGC='orl-img-v1';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>precacheImgs()).then(()=>self.skipWaiting()))});
function precacheImgs(){return fetch('./img/list.json',{cache:'no-store'}).then(r=>r.json()).then(L=>caches.open(IMGC).then(c=>Promise.all(L.map(f=>c.match(f).then(m=>m||c.add(f).catch(()=>{})))))).catch(()=>{})}
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==IMGC).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const u=new URL(r.url); if(u.origin!==location.origin)return;
  // página: sempre busca a versão nova na rede (sem cache do navegador); sem internet, usa a cópia salva
  if(r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html')){
    e.respondWith(fetch(r.url,{cache:'no-store'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp))}return res}).catch(()=>caches.match('./index.html')));
    return;
  }
  if(u.pathname.includes('/img/')&&!u.pathname.endsWith('list.json')){e.respondWith(caches.open(IMGC).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}))));return}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res})));
});
