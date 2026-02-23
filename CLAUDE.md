# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static portfolio website for Rahul Krishnan, deployed on GitHub Pages at `rahul-krishnan.is-a.dev`. Built with vanilla HTML, CSS, and JavaScript — no build tools or frameworks.

## Development

```bash
# Local server
python -m http.server 8000
# Then visit http://localhost:8000
```

No build step, linting, or test suite exists. Changes are deployed by pushing to `main` (GitHub Pages).

## Architecture

**Data-driven rendering**: All content is stored as JSON in `assets/data/` and loaded at runtime by `assets/js/main.js`. The HTML files contain structural templates; `main.js` fetches JSON data via `loadAllData()` then populates DOM sections (projects, experience, skills, education, publications, navigation, footer).

Key data files and what they feed:
- `projects.json` — project cards on index page (category filtering, Problem/Role/Outcome structure)
- `experience.json`, `education.json`, `publications.json`, `skills.json` — respective sections
- `personal.json` — hero/about section, contact info
- `site.json` — site-wide metadata (title, description, OG tags)
- `navigation.json` — nav links; `footer.json` — footer content
- `privacy.json` — privacy policy content; `error.json` — 404 page content
- `config.json` — registry of all data file paths and section render order

Section render order (from config.json): hero → about → experience → projects → skills → education → publications → contact

**Pages**:
- `index.html` — main portfolio page (all sections)
- `project.html` — individual project detail page (reads project slug from URL, renders from projects.json)
- `privacy.html` — privacy policy
- `404.html` — custom error page

**Theming**: Dark/light mode via CSS custom properties in `assets/css/styles.css` (`:root` and `.dark` class). JS toggles the class and persists to localStorage.

**RAG chatbot**: `main.js` includes `initializeRag()` and `setupRagModal()` for an AI Q&A feature embedded in the site.

**Initialization flow**: `DOMContentLoaded` → `initializeApp()` → `loadAllData()` (fetches all JSON) → individual `load*()` functions populate DOM → UI setup functions (theme, modal, nav, filtering, scroll, intersection observer).

## Key Conventions

- Project data uses the schema: `title`, `category` (ml/nlp/deployment), `slug`, `stack[]`, `summary`, `problem`, `role`, `outcome`, `links{github, demo}`
- CSS uses custom properties (`--accent`, `--font-family-base`, `--section-padding-desktop`) — modify `:root` in styles.css for theming
- Responsive breakpoints: mobile <768px, tablet 768-1024px, desktop 1024px+
- Google Analytics tag ID: `G-2C109RKXQE`
