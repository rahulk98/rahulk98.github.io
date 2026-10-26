# Repository Guidelines

## Project Structure & Module Organization
This repository is a static portfolio site on GitHub Pages with no build step.

- Root pages: `index.html`, `project.html`, `privacy.html`, `404.html`
- Styling: `assets/css/minimal.css` (site design), `assets/css/post.css` (write-ups under `writing/`)
- Client logic: `assets/js/main.js` (JSON loader, theme toggle, RAG chat), `assets/js/minimal.js` (home page tabs), `assets/js/subpage.js`, `assets/js/post.js`, `assets/js/analytics.js`
- Content data: `assets/data/*.json` (primary editable content source, see `assets/data/README.md`)
- Write-ups: `writing/<slug>/` (canonical, site design) and the academic-template copies at `<slug>/`
- Media: `assets/img/` and `assets/resume/`
- Utility script: `generate_thumbnails.py` (project thumbnail generation)

When updating copy or section data, prefer editing JSON in `assets/data/` over hardcoding in HTML.

`cot-hint-probes/`, `grpo-abstention-dial/` and `kv-compression-safety-probes/` were linked in job applications. Never delete, rename or move these URLs; they must keep returning the page.

## Build, Test, and Development Commands
- `python -m http.server 8000`
  Runs a local static server at `http://localhost:8000`.
- `python generate_thumbnails.py`
  Regenerates project thumbnail images in `assets/img/projects/` (requires Pillow).

There is no CI build/test pipeline.

## Coding Style & Naming Conventions
- Use 4-space indentation in HTML, CSS, JS, and JSON to match existing files.
- Vanilla ES functions with clear verb-based names (for example, `setupThemeToggle`, `buildMinimalWriting`).
- Keep CSS tokens in `:root` and prefer existing custom properties (for example, `--m-fg`, `--m-muted`, `--m-rule`).
- Use kebab-case for file names and slugs.
- Bump the `?v=` stamp on a CSS or JS link when that file changes.

## Testing Guidelines
No automated test framework is configured. Validate changes manually before pushing:

1. Run the site locally and check `/` (all four tabs and the Work filter), `/project.html?slug=<slug>`, `/privacy.html`, `/404.html` and any write-up you touched.
2. Check mobile (390px) and desktop (1280px) widths for overflow.
3. Check the theme toggle.
4. Confirm the browser console has no errors besides the expected localhost CORS errors (Cloudflare beacon, `rag.rahulkrishnan.me/health`).

## Commit & Pull Request Guidelines
Recent history uses short, imperative commit messages (for example, `Link Writing tab entries to the native write-up pages`).

- Keep commits focused and use present-tense, imperative subject lines.
- In PRs, include a concise summary of user-facing changes, before/after screenshots for UI changes, and manual test notes.
