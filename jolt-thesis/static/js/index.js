// Carousel init (bulma-carousel)
document.addEventListener('DOMContentLoaded', function () {
    if (window.bulmaCarousel) {
        bulmaCarousel.attach('.carousel', {
            slidesToScroll: 1,
            slidesToShow: 2,
            navigation: true,
            pagination: true,
            loop: true
        });
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const code = document.getElementById('bibtex-code');
    const btn = document.querySelector('.copy-bibtex-btn');
    if (!code) return;
    navigator.clipboard.writeText(code.textContent).then(function () {
        if (!btn) return;
        btn.classList.add('copied');
        setTimeout(function () { btn.classList.remove('copied'); }, 1500);
    });
}

// Scroll to top button
window.addEventListener('scroll', function () {
    const btn = document.querySelector('.scroll-to-top');
    if (!btn) return;
    btn.classList.toggle('visible', window.scrollY > 400);
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
