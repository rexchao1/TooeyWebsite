/* Anonymous page analytics, sent to PostHog. No cookies, no storage, no PostHog library:
   each page view gets a random id that is forgotten when the page closes. Records the page,
   the referrer and ad tags (utm_*, fbclid, gclid) so ad results can be counted.
   Clicks on any element with data-track="<event name>" are sent as that event. */
(function () {
  var KEY = 'phc_AuMiscwdHWuTLpspX9jhVfPcXUgSG4SaoVSwzcd7aBFr';
  var URL_ = 'https://us.i.posthog.com/i/v0/e/';
  var script = document.currentScript;
  var app = (script && script.getAttribute('data-app')) || location.hostname;
  var id = 'anon-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  var params = new URLSearchParams(location.search);
  var tags = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'].forEach(function (k) {
    if (params.get(k)) tags[k] = params.get(k);
  });

  function send(event, extra) {
    var props = { app: app, $current_url: location.href, $pathname: location.pathname, $host: location.host,
                  $referrer: document.referrer || '$direct', $process_person_profile: false };
    for (var k in tags) props[k] = tags[k];
    for (var j in extra || {}) props[j] = extra[j];
    var body = JSON.stringify({ api_key: KEY, event: event, distinct_id: id, properties: props,
                                timestamp: new Date().toISOString() });
    try {
      if (!(navigator.sendBeacon && navigator.sendBeacon(URL_, body))) {
        fetch(URL_, { method: 'POST', body: body, keepalive: true, mode: 'no-cors' });
      }
    } catch (e) { /* analytics must never break the page */ }
  }

  send('$pageview');
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-track]');
    if (!el) return;
    send(el.getAttribute('data-track'), {
      placement: el.getAttribute('data-placement') || '',
      text: (el.textContent || '').trim().slice(0, 60),
      href: el.getAttribute('href') || ''
    });
  }, true);
})();
