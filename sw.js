// Key App helper: shows alerts sent from the Supabase push-send / notify-office functions.
// The alert itself carries no text, so we ask the database "what was my latest alert?" and show that;
// if that fails we show the old generic wording. It does not cache anything, so it can never serve an old copy of the app.
var SB = 'https://eyerpokgadrgxticqzez.supabase.co';
var KEY = 'sb_publishable_FsyUdlUOTgA51pkAy5pNiA_AsHqq6Ed';
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
function wording(){
  return self.registration.pushManager.getSubscription().then(function(sub){
    if(!sub) return null;
    var ctl = new AbortController(); setTimeout(function(){ ctl.abort(); }, 6000);
    return fetch(SB + '/rest/v1/rpc/push_peek', {
      method: 'POST', signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY },
      body: JSON.stringify({ p_endpoint: sub.endpoint })
    }).then(function(r){ return r.ok ? r.json() : null; })
      .then(function(rows){ return rows && rows[0] && rows[0].title ? rows[0] : null; });
  }).catch(function(){ return null; });
}
self.addEventListener('push', function(e){
  e.waitUntil(wording().then(function(m){
    return self.registration.showNotification(m ? m.title : 'Key App', {
      body: m ? m.body : 'You have something new in Key App - open it to see what needs doing.',
      icon: 'icon-180.png', tag: m ? 'ke-' + m.title : 'ke-po', renotify: true
    });
  }));
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window', includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){ if('focus' in list[i]) return list[i].focus(); }
    return self.clients.openWindow('./#kepo');
  }));
});
