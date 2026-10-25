// Section rail for write-up pages: one bar per h2, labels on hover,
// the bar of the section being read is highlighted.
(function () {
    const headings = [...document.querySelectorAll('.p-body > h2')];
    if (headings.length < 2) return;

    const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const rail = document.createElement('nav');
    rail.className = 'p-rail';
    rail.setAttribute('aria-label', 'Sections');

    const links = headings.map(h => {
        if (!h.id) h.id = slug(h.textContent);
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.className = 'p-rail__item';
        const bar = document.createElement('span');
        bar.className = 'p-rail__bar';
        const label = document.createElement('span');
        label.className = 'p-rail__label';
        label.textContent = h.textContent;
        a.append(bar, label);
        rail.appendChild(a);
        return a;
    });
    document.body.appendChild(rail);

    // The active section is the last heading above the upper third of the window.
    function update() {
        const line = window.innerHeight / 3;
        let active = 0;
        headings.forEach((h, i) => {
            if (h.getBoundingClientRect().top <= line) active = i;
        });
        links.forEach((a, i) => a.classList.toggle('is-active', i === active));
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
})();
