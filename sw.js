// Key App helper: shows alerts sent from Supabase (holiday requests, breakdowns / faults, urgent orders, jobs...).
// The push itself carries no text, so on each push this asks the database "what was that alert?" and shows the real words.
// It does not cache anything, so it can never serve an old copy of the app.
var SBURL='https://eyerpokgadrgxticqzez.supabase.co', SBKEY='sb_publishable_FsyUdlUOTgA51pkAy5pNiA_AsHqq6Ed';
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
function fetchMsgs(){
  return self.registration.pushManager.getSubscription().then(function(sub){
    if(!sub) return [];
    var ctl = (typeof AbortController!=='undefined') ? new AbortController() : null;
    if(ctl) setTimeout(function(){ ctl.abort(); }, 8000);
    return fetch(SBURL+'/rest/v1/rpc/push_take', {method:'POST', signal: ctl && ctl.signal,
      headers:{apikey:SBKEY, Authorization:'Bearer '+SBKEY, 'Content-Type':'application/json'},
      body: JSON.stringify({p_endpoint: sub.endpoint})}).then(function(r){ return r.ok ? r.json() : []; });
  }).catch(function(){ return []; });
}
self.addEventListener('push', function(e){
  e.waitUntil(fetchMsgs().then(function(msgs){
    if(!Array.isArray(msgs) || !msgs.length) msgs = [{title:'Key App', body:'You have something new in Key App - open it to see what needs doing.'}];
    return Promise.all(msgs.slice(-5).map(function(m, i){
      return self.registration.showNotification(m.title || 'Key App', {
        body: m.body || '', icon: 'icon-180.png', tag: 'ke-' + Date.now() + '-' + i, renotify: true
      });
    }));
  }));
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var t = (e.notification.title||'').toLowerCase();
  var hash = /holiday/.test(t) ? '#home' : /fault|visit/.test(t) ? '#service' : '#kepo';
  e.waitUntil(self.clients.matchAll({type:'window', includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){ if('focus' in list[i]) return list[i].focus(); }
    return self.clients.openWindow('./' + hash);
  }));
});
