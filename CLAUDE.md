# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static portfolio website for Rahul Krishnan, deployed on GitHub Pages at `rahulkrishnan.me`. Vanilla HTML, CSS, and JavaScript, no build step or frameworks.

## Development

```bash
# Local server
python -m http.server 8000
# Then visit http://localhost:8000
```

No build step, linting, or test suite exists. Changes are deployed by pushing to `main` (GitHub Pages).

## Architecture

**Home page**: `index.html` is a shell. `assets/js/main.js` runs `initializeApp()`: `loadAllData()` fetches every file listed in `assets/data/config.json` (no-cache) into `window.<name>Data`, then `renderMinimal()` (in `assets/js/minimal.js`) builds the tabs About, Recent, Work (All/Research/Projects filter) and Writing, then the theme toggle and RAG chat are set up. To change content, edit the JSON in `assets/data/` (see `assets/data/README.md`), not the HTML.

**Pages**:
- `index.html` - home page (tabs)
- `project.html` - project detail page (reads the slug from the URL, renders from projects.json)
- `privacy.html`, `404.html`
- `writing/<slug>/index.html` - write-ups in the site design (`minimal.css` + `post.css`, `post.js` section rail). These are the canonical versions; the Writing tab links here.
- `<slug>/index.html` - older academic-template copies of the same write-ups (Bulma, own `static/` folder). Their canonical tag points to `writing/<slug>/` and they are not in the sitemap.

**Permanent URLs**: `/cot-hint-probes/`, `/grpo-abstention-dial/` and `/kv-compression-safety-probes/` were linked in job applications. Never delete, rename, or redirect them; they must keep returning the page. Check all three return 200 after any push that touches those folders.

**Write-up updates**: a write-up exists twice (academic copy and `writing/` copy). When the source post changes, update both, copy text verbatim, and keep figures in `<slug>/static/images/` (the `writing/` page references them from there).

**Theming**: CSS custom properties in `assets/css/minimal.css`; dark mode via the `dark` class on `<html>`, persisted to localStorage and applied before first paint.

## Key Conventions

- 4-space indentation. Bump the `?v=` stamp on a CSS or JS link when the file changes.
- A project with a write-up has `links["project page"]` and a `writing` object (`title`, `outcome`) in `projects.json`.
- Umami website ID: `cd8992ec-09ff-4125-9feb-fcd610bd4e2f` (self-hosted on personal-box, dashboard tailnet-only)
- Every page loads Umami only through `<script async src="/assets/js/analytics.js">`, which injects the tracker after `load`. Never add the Umami tag directly or with `defer`: a hanging analytics host would then hold back `DOMContentLoaded`, and with it all home page rendering, until the connection times out.
- The RAG backend (`rag.rahulkrishnan.me`, also on personal-box) may be offline: `initializeRag()` probes `/health` and disables the chat with an offline note rather than failing. Its CORS only allows `https://rahulkrishnan.me`, so the chat always shows offline on a local server.
