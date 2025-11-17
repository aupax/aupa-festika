// Service Worker untuk notifikasi background
const CACHE_NAME = 'alarm-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        self.registration.showNotification(event.data.title, {
            body: event.data.body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'alarm',
            requireInteraction: true,
            vibrate: [1000, 500, 1000],
            actions: [
                {
                    action: 'stop',
                    title: 'Stop Alarm'
                }
            ]
        });
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'stop') {
        // Kirim message ke client untuk stop alarm
        event.waitUntil(
            self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        type: 'STOP_ALARM'
                    });
                });
            })
        );
    } else {
        // Focus ke app ketika notifikasi diklik
        event.waitUntil(
            self.clients.matchAll().then((clients) => {
                if (clients.length) {
                    clients[0].focus();
                } else {
                    self.clients.openWindow('/');
                }
            })
        );
    }
});
