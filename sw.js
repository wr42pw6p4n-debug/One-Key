// Key App helper: shows the urgent-order alert sent from the Supabase push-send function.
// It does not cache anything, so it can never serve an old copy of the app.
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('push', function(e){
  e.waitUntil(self.registration.showNotification('Key App', {
    body: 'You have something new in Key App - open it to see what needs doing.',
    icon: 'icon-180.png', tag: 'ke-po', renotify: true
  }));
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window', includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){ if('focus' in list[i]) return list[i].focus(); }
    return self.clients.openWindow('./#kepo');
  }));
});
