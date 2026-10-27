const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const projects = require('../assets/data/projects.json');
const server = spawn('python', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], { stdio: 'ignore' });
const origin = 'http://127.0.0.1:8765';
async function main() {
    let ready = false;
    for (let i = 0; i < 50; i++) {
        try { await fetch(origin); ready = true; break; } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    assert.ok(ready, 'local HTTP server starts');
    const browser = await chromium.launch({ headless: true });
    try {
        const nojs = await browser.newContext({ javaScriptEnabled: false });
        const page = await nojs.newPage();
        await page.goto(origin);
        assert.match(await page.locator('body').innerText(), /SAP/);
        assert.ok(await page.locator('#work-list').isVisible());
        assert.ok(await page.locator('#experience').isVisible());
        for (const project of projects) {
            const response = await page.goto(origin + '/projects/' + project.slug + '/');
            assert.equal(response.status(), 200);
            assert.equal(await page.locator('h1').innerText(), project.title);
            assert.equal(await page.locator('#project-summary').innerText(), project.summary);
        }
        console.log('PASS: no-JS HTTP homepage and all 12 project pages; work/experience visible.');
        await nojs.close();
        for (const width of [390, 1280]) {
            const context = await browser.newContext({ viewport: { width, height: 900 } });
            // Isolate local behavior from unavailable analytics, fonts and RAG network services.
            await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            await page.goto(origin);
            await page.waitForSelector('#rag-form:not([hidden])');
            assert.equal(await page.locator('.m-page').count(), 1);
            assert.equal(await page.locator('#theme-toggle').count(), 1);
            for (const tab of ['recent', 'work', 'writing', 'about']) {
                await page.locator('.m-tab[data-tab="' + tab + '"]').click();
                await page.waitForFunction(id => !document.querySelector('[data-panel="' + id + '"]').hidden, tab);
                assert.equal(await page.locator('.m-panel:visible').count(), 1);
                assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), width + ': ' + tab + ' overflow');
            }
            const before = await page.locator('html').getAttribute('class');
            await page.locator('#theme-toggle').click();
            assert.notEqual(await page.locator('html').getAttribute('class'), before);
            await page.goto(origin + '/#projects');
            await page.waitForFunction(() => document.querySelector('.m-filter__btn[aria-pressed="true"]')?.textContent === 'Projects');
            assert.equal(await page.locator('#work-list > [data-kind="research"]:visible').count(), 0);
            await page.getByRole('button', { name: 'Research', exact: true }).click();
            await page.waitForFunction(() => document.querySelector('.m-filter__btn[aria-pressed="true"]')?.textContent === 'Research');
            assert.equal(await page.locator('#work-list > [data-kind="projects"]:visible').count(), 0);
            await page.getByRole('button', { name: 'All', exact: true }).click();
            await page.waitForFunction(() => document.querySelector('.m-filter__btn[aria-pressed="true"]')?.textContent === 'All');
            await page.goto(origin + '/#about');
            await page.waitForFunction(() => document.querySelector('#rag-input').disabled);
            assert.equal(await page.locator('#rag-input').getAttribute('placeholder'), 'Assistant offline');
            await page.getByText('The AI assistant is offline right now. The rest of the site works normally.', { exact: false }).first().waitFor();
            for (const project of projects) {
                await page.goto(origin + '/projects/' + project.slug + '/');
                assert.equal(await page.locator('h1').innerText(), project.title);
                assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), project.slug + ' overflow');
            }
            for (const query of ['slug=rag-resume-api', 'id=rag-resume-api']) {
                await page.goto(origin + '/project.html?' + query);
                await page.waitForFunction(() => document.querySelector('h1').textContent === 'RAG Resume API');
                assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://rahulkrishnan.me/projects/rag-resume-api/');
            }
            assert.deepEqual(errors, []);
            for (const url of ['/privacy.html', '/404.html', '/cot-hint-probes/', '/grpo-abstention-dial/', '/kv-compression-safety-probes/', '/jolt-thesis/']) {
                assert.equal((await page.goto(origin + url)).status(), 200);
            }
            assert.deepEqual(errors.filter(message => message !== 'React is not defined'), []);
            console.log('PASS: ' + width + 'px tabs, all filters, theme, chat offline, 12 static pages, legacy slug/id; no overflow or JS exceptions. Academic/privacy/404 HTTP 200 (existing JoLT teaser requires blocked external React).');
            await context.close();
        }
    } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.kill());
