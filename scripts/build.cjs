// Offline, deterministic generation using the site's existing DOM renderers.
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
process.chdir(path.resolve(__dirname, '..'));
const read = file => fs.readFileSync(file, 'utf8');
const write = (file, text) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text.replace(/[ \t]+$/gm, ''));
};
const config = JSON.parse(read('assets/data/config.json'));
const data = Object.fromEntries(Object.entries(config.dataFiles).map(([key, file]) => [key, JSON.parse(read(file))]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const stamp = '20261027-static';
async function build() {
    const home = new JSDOM(read('scripts/templates/index.html'), { url: 'https://rahulkrishnan.me/', runScripts: 'outside-only' });
    Object.entries(data).forEach(([key, value]) => { home.window[key + 'Data'] = value; });
    // Pin the generated footer year, rather than letting wall-clock time alter builds.
    home.window.Date.prototype.getFullYear = () => 2026;
    home.window.eval(read('assets/js/minimal.js'));
    home.window.renderMinimal();
    const doc = home.window.document;
    // All panels remain available to non-JS visitors; JS retains the existing tabs.
    const fallback = doc.createElement('noscript');
    fallback.innerHTML = '<style>.m-panel[hidden] { display: block !important; } .m-tabs, .m-filter, #theme-toggle, .m-ask { display: none !important; }</style>';
    doc.head.appendChild(fallback);
    const embedded = doc.createElement('script');
    embedded.id = 'portfolio-data';
    embedded.type = 'application/json';
    embedded.textContent = json(data);
    doc.body.insertBefore(embedded, doc.querySelector('script[src*="minimal.js"]'));
    doc.querySelectorAll('script[src*="minimal.js"], script[src*="main.js"]').forEach(script => {
        script.setAttribute('src', script.getAttribute('src').replace(/\?v=.*/, '?v=' + stamp));
    });
    // jsdom serializes noscript text as escaped markup; emit its HTML literally.
    write('index.html', home.serialize().replace(fallback.outerHTML, '<noscript>' + fallback.textContent + '</noscript>') + '\n');
    home.window.close();

    for (const project of data.projects) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) throw new Error('Invalid slug: ' + project.slug);
        const page = new JSDOM(read('project.html'), { url: 'https://rahulkrishnan.me/project.html?slug=' + project.slug, runScripts: 'outside-only' });
        page.window.fetch = async () => ({ json: async () => data.projects });
        const document = page.window.document;
        const canonicalScript = [...document.scripts].find(script => script.textContent.includes('Canonical URL'));
        page.window.eval(canonicalScript.textContent);
        const renderer = [...document.scripts].find(script => script.textContent.includes("const esc ="));
        page.window.eval(renderer.textContent);
        await new Promise(resolve => setImmediate(resolve));
        renderer.remove();
        [...document.scripts].filter(script => script.textContent.includes('Canonical URL')).forEach(script => script.remove());
        document.title = project.title + ' - Rahul Krishnan';
        const canonical = document.querySelector('link[rel="canonical"]');
        canonical.rel = 'canonical';
        canonical.href = 'https://rahulkrishnan.me/projects/' + project.slug + '/';
        document.head.appendChild(canonical);
        const description = document.createElement('meta');
        description.name = 'description';
        description.content = project.summary || project.outcome || project.title;
        document.head.appendChild(description);
        const schema = document.createElement('script');
        schema.type = 'application/ld+json';
        schema.textContent = json({ '@context': 'https://schema.org', '@type': 'CreativeWork', name: project.title, description: description.content, url: canonical.href, author: { '@type': 'Person', name: data.personal.name, url: 'https://rahulkrishnan.me/' } });
        document.head.appendChild(schema);
        document.querySelectorAll('[href], [src]').forEach(el => {
            for (const attr of ['href', 'src']) {
                const value = el.getAttribute(attr);
                if (value && !/^(?:[a-z]+:|\/|#)/i.test(value)) el.setAttribute(attr, '/' + value);
            }
        });
        write('projects/' + project.slug + '/index.html', page.serialize() + '\n');
        page.window.close();
    }
    const writing = fs.readdirSync('writing').filter(slug => fs.existsSync('writing/' + slug + '/index.html')).sort();
    const urls = ['/', ...data.projects.map(project => '/projects/' + project.slug + '/'), ...writing.map(slug => '/writing/' + slug + '/'), '/privacy.html'];
    write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(url => '    <url><loc>https://rahulkrishnan.me' + url + '</loc></url>').join('\n') + '\n</urlset>\n');
    console.log('Generated homepage, ' + data.projects.length + ' project pages and ' + urls.length + ' sitemap entries.');
}
build().catch(error => { console.error(error); process.exitCode = 1; });
