// Theme toggle for pages outside the home page. The theme class itself is
// applied by an inline script in <head> before first paint.
(function () {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const root = document.documentElement;
    btn.addEventListener('click', () => {
        const next = root.classList.contains('light') ? 'dark' : 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(next);
        btn.setAttribute('aria-label', `Switch to ${next === 'light' ? 'dark' : 'light'} theme`);
        try { localStorage.setItem('theme', next); } catch (e) {}
    });
})();
