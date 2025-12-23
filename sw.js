const CACHE_NAME = 'sistematiza-salinas-v1';

// Lista de arquivos essenciais para o funcionamento offline
// Removido style.css para evitar erro de instalação (404)
const ASSETS = [
  './',
  './index.html',
  './app.js',
  'https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js'
];

// Instalação: O momento de "arquivar" os documentos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Sistematiza: Arquivando documentos essenciais no cache...');
      return cache.addAll(ASSETS);
    })
  );
});

// Ativação: Limpeza de arquivos antigos, garantindo a versão mais recente
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Sistematiza: Removendo arquivo de cache antigo...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Interceptação: Busca no cache primeiro, se não encontrar, vai para a rede
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
