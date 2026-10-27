# Static HTML generation

The public site still deploys as plain static files. `assets/data/*.json` remains the authority for portfolio copy. Do not edit generated `index.html`, `projects/*/index.html` or `sitemap.xml` directly.

## Regenerate and verify

Use Node matching `package.json` (tested with Node 26.7.0) and Python 3:

```sh
npm ci
npm run build
npm test
npx playwright install chromium
npm run test:browser
python -m http.server 8000
```

Commit generated HTML alongside source changes. GitHub Pages does not need to execute Node. Development-only dependencies, templates, tests and notes are excluded in `_config.yml`. The older AGENTS.md description of no build/test step predates this generation workflow.

- `scripts/templates/index.html` is the editable home shell. The generator loads configured JSON into jsdom and invokes the existing `assets/js/minimal.js` renderer, without external network requests.
- The generated home embeds that same JSON safely (`<` escaped inside JSON) for the existing interactive renderer. Initialization does not depend on successful JSON fetches. It replaces rather than appends to the prerendered root, preserving existing tabs, filters, theme and chat hooks without duplicate content.
- No-JavaScript visitors see all four content panels, using a small `noscript` style override. Interactive-only controls are hidden in that mode. This is the same content, not crawler-specific markup.
- `project.html` remains the legacy `?slug=` / `?id=` entry point and the shared project template/renderer. The generator executes its renderer against local source JSON and emits `/projects/<slug>/` pages containing title, summary, result, details, tags and resource links in the HTTP HTML. Asset paths are root-relative. Static pages use the existing subpage theme code, with no data fetch required.
- Project titles without an existing academic project-page destination now link to static pages. Existing academic destinations and all writing URLs are untouched. Legacy query URLs keep working with JavaScript and indicate the static canonical URL. Static hosts cannot produce a distinct no-JS response per query parameter; use the new path URLs for initial HTML.
- The sitemap includes the home, all 12 project pages, all four current writing pages, and privacy. It intentionally omits `lastmod` rather than confusing project dates or generation time with verified page modification dates. Existing academic copies remain available but their canonical writing destinations are listed instead.
- The generated footer year is explicitly pinned to 2026 in the build (not wall-clock dependent); the existing browser renderer retains its dynamic year. Update the pin deliberately in a future yearly refresh. No content dates are invented.
- If removing/renaming a project slug, explicitly remove its obsolete generated directory too, after considering incoming links. The build does not delete existing URLs automatically.

## Checks

`npm test` checks all source biography paragraphs, project source text and metadata, JSON-LD parsing, unique/valid XML sitemap entries and exact canonical targets, every generated local anchor/resource target, and byte-identical regeneration.

`npm run test:browser` starts and stops a loopback HTTP server on port 8765, uses Chromium without JavaScript to check visible home employment/work and every project response, then uses 390px and 1280px viewports to exercise all tabs and Work filters, theme, direct hash loading, chat's offline UI, all static project pages, and legacy slug/id URLs. It checks overflow on all four home tabs and all generated project pages, duplicate roots/theme controls, JavaScript exceptions on changed pages, and HTTP availability of privacy/404 and the four academic URLs.

A one-off baseline comparison also verified screenshots of all four interactive home tabs at 390px and 1280px against commit `444a390`, with external resources blocked consistently for both versions. Initial runs were pixel-identical; repeated runs allow fewer than 100 differing pixels per screenshot for small browser antialiasing variation at rounded borders/text edges.

External requests are deliberately blocked in the browser suite, so analytics/fonts are not validated and no live RAG answers are requested. The untouched JoLT academic teaser requires CDN React; its expected `React is not defined` exception under blocked-network testing is explicitly tolerated only after changed-page checks. Existing stylesheet/font behavior otherwise remains unchanged. Public deployment, CDN/WAF access, Search Console/Bing inspection and actual search inclusion remain separate owner-side checks; local tests cannot establish them.

## Evidence and policy

- [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics): Google can render JS; initial HTML and ordinary links improve robustness for other clients too.
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a): ensure important content reliably renders and is discoverable.
- [Google AI features](https://developers.google.com/search/docs/appearance/ai-features): no special AI schema or extra AI file is required. Existing Person data is retained; generated project CreativeWork markup describes only visible source content.
- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots): search and training crawler permissions are independent. `robots.txt` is unchanged; no new training opt-in, `llms.txt`, webmaster submission or ranking/citation guarantee is part of this work.
