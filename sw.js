const CACHE_NAME = 'sanj-healthcare-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/utils/Storage.js',
  '/js/utils/Formatters.js',
  '/js/utils/Validators.js',
  '/js/utils/Charts.js',
  '/js/models/Product.js',
  '/js/models/Distributor.js',
  '/js/models/Inventory.js',
  '/js/models/Invoice.js',
  '/js/models/Expense.js',
  '/js/models/Loan.js',
  '/js/controllers/ProductController.js',
  '/js/controllers/DistributorController.js',
  '/js/controllers/InventoryController.js',
  '/js/controllers/InvoiceController.js',
  '/js/controllers/ExpenseController.js',
  '/js/controllers/LoanController.js',
  '/js/controllers/DashboardController.js',
  '/js/services/ApiService.js',
  '/js/services/NotificationService.js',
  '/js/data/sample-data.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});