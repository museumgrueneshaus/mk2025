// Unregister all ServiceWorkers for development
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      console.log('Unregistering ServiceWorker:', registration);
      registration.unregister();
    }
  });
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      console.log('Deleting cache:', name);
      caches.delete(name);
    }
  });
}

console.log('ServiceWorker cleanup completed');