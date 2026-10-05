// Service worker: funciona offline + recebe notificações push (Firebase Cloud Messaging)
const VERSION = "agenda-v4";
const CORE = ["./", "./index.html", "./firebase-config.js", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];

importScripts("./firebase-config.js");
try {
  importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");
  if (self.FIREBASE_CONFIG && !/COLE/.test(self.FIREBASE_CONFIG.apiKey)) {
    firebase.initializeApp(self.FIREBASE_CONFIG);
    firebase.messaging(); // exibe automaticamente as notificações recebidas com o app fechado
  }
} catch (e) { /* sem internet na instalação: o push volta a funcionar na próxima abertura */ }

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Rede primeiro (sempre a versão mais nova); sem internet, usa o que está guardado
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
