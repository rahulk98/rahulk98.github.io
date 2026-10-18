// Scroll to top button
window.addEventListener('scroll', function () {
    const btn = document.querySelector('.scroll-to-top');
    if (!btn) return;
    btn.classList.toggle('visible', window.scrollY > 400);
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
