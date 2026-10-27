const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const { JSDOM } = require('jsdom');
const projects = JSON.parse(fs.readFileSync('assets/data/projects.json'));
const parse = file => new JSDOM(fs.readFileSync(file, 'utf8')).window.document;
test('homepage serves biography, employment and crawlable project links without JavaScript', () => {
    const doc = parse('index.html');
    assert.match(doc.querySelector('#minimal-root').textContent, /SAP/);
    assert.ok(doc.querySelector('a[href="/projects/rag-resume-api/"]'));
    assert.equal(doc.querySelectorAll('.m-page').length, 1);
    for (const text of JSON.parse(fs.readFileSync('assets/data/minimal.json')).about) {
        assert.ok(doc.body.textContent.includes(text));
    }
});
test('every project has initial title, exact source copy, metadata and valid JSON-LD', () => {
    for (const project of projects) {
        const doc = parse('projects/' + project.slug + '/index.html');
        assert.equal(doc.querySelector('h1').textContent, project.title);
        assert.equal(doc.querySelector('#project-summary').textContent, project.summary);
        for (const text of project.detail || []) assert.ok(doc.querySelector('#project-body').textContent.includes(text));
        assert.equal(doc.querySelector('link[rel="canonical"]').href, 'https://rahulkrishnan.me/projects/' + project.slug + '/');
        assert.equal(doc.querySelector('meta[name="description"]').content, project.summary);
        assert.equal(JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent).name, project.title);
        assert.equal(doc.querySelectorAll('h1').length, 1);
    }
    JSON.parse(parse('index.html').querySelector('script[type="application/ld+json"]').textContent);
});
test('sitemap is valid XML with unique existing canonical targets and no speculative dates', () => {
    const xml = new JSDOM(fs.readFileSync('sitemap.xml', 'utf8'), { contentType: 'text/xml' }).window.document;
    const urls = [...xml.querySelectorAll('loc')].map(el => el.textContent);
    assert.equal(urls.length, new Set(urls).size);
    assert.equal(xml.querySelectorAll('lastmod').length, 0);
    for (const url of urls) {
        const pathname = new URL(url).pathname;
        const doc = parse('.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
        assert.equal(doc.querySelector('link[rel="canonical"]').href, url);
    }
});
test('all internal generated anchors and resources exist', () => {
    for (const file of ['index.html', ...projects.map(p => 'projects/' + p.slug + '/index.html')]) {
        const doc = parse(file);
        for (const element of doc.querySelectorAll('[href], [src]')) {
            const raw = element.getAttribute('href') || element.getAttribute('src');
            const url = new URL(raw, 'https://rahulkrishnan.me/' + file);
            if (url.origin !== 'https://rahulkrishnan.me') continue;
            const target = '.' + decodeURIComponent(url.pathname) + (url.pathname.endsWith('/') ? 'index.html' : '');
            assert.ok(fs.existsSync(target), file + ': missing ' + raw);
        }
    }
});
test('rebuild is byte-for-byte deterministic', () => {
    const files = ['index.html', 'sitemap.xml', ...projects.map(p => 'projects/' + p.slug + '/index.html')];
    const before = files.map(file => fs.readFileSync(file));
    execFileSync(process.execPath, ['scripts/build.cjs']);
    files.forEach((file, i) => assert.deepEqual(fs.readFileSync(file), before[i], file));
});
