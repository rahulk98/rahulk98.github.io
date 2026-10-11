// Umami Analytics (self-hosted on personal-box).
// Injected only after the page has fully loaded, so a slow or unreachable
// analytics host can never delay rendering or main.js initialization.
(function () {
    var UMAMI_SRC = 'https://analytics.rahulkrishnan.me/script.js';
    var UMAMI_WEBSITE_ID = 'cd8992ec-09ff-4125-9feb-fcd610bd4e2f';

    function loadUmami() {
        try {
            var s = document.createElement('script');
            s.async = true;
            s.src = UMAMI_SRC;
            s.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
            s.onerror = function () { /* analytics unavailable; ignore */ };
            document.head.appendChild(s);
        } catch (_) { /* never let analytics break the page */ }
    }

    if (document.readyState === 'complete') {
        loadUmami();
    } else {
        window.addEventListener('load', loadUmami);
    }
})();
