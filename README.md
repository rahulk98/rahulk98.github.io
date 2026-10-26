# Personal Portfolio

Static portfolio website deployed to GitHub Pages at [rahulkrishnan.me](https://rahulkrishnan.me). The site showcases research in machine learning efficiency (KV cache compression, LLM evaluation, numerical optimization) and enterprise backend software engineering.

## Architecture

The site is vanilla HTML, CSS and JavaScript with no build step and no frameworks.

- Client-side rendering: the home page content lives as JSON in `assets/data/`. `assets/js/main.js` fetches every file listed in `config.json` into `window.<name>Data`, and `assets/js/minimal.js` renders the four tabs (About, Recent, Work, Writing) from it.
- Write-ups: each research write-up is a static HTML page. The canonical version is at `writing/<slug>/` (site design, `post.css` and `post.js`). An older academic-template version (Bulma, its own `static/` folder) stays at `<slug>/`. `cot-hint-probes/`, `grpo-abstention-dial/` and `kv-compression-safety-probes/` were used in applications and must keep working.
- Theme persistence: dark and light modes use CSS custom properties. The preference is stored in `localStorage` and applied before first paint.
- Embedded RAG assistant: the Ask box queries a FastAPI retrieval service self-hosted at rag.rahulkrishnan.me. It probes `/health` and shows an offline note when the service is unreachable.

## Repository Structure

```
.
├── index.html              # Home page shell; tabs are rendered by minimal.js
├── project.html            # Project detail view, reads the slug from the URL
├── privacy.html            # Privacy policy
├── 404.html                # Error page
├── writing/<slug>/         # Write-ups in the site design (canonical)
├── <slug>/                 # Academic-template write-ups (cot-hint-probes, grpo-abstention-dial,
│                           #   kv-compression-safety-probes, jolt-thesis)
├── assets/
│   ├── css/
│   │   ├── minimal.css     # Site design
│   │   └── post.css        # Write-up pages under writing/
│   ├── js/
│   │   ├── main.js         # JSON loader, theme toggle, RAG chat
│   │   ├── minimal.js      # Tabs, Work filter and Writing list
│   │   ├── subpage.js      # Theme toggle for subpages
│   │   ├── post.js         # Section rail on write-up pages
│   │   └── analytics.js    # Loads Umami after page load
│   ├── data/               # Site content as JSON (see assets/data/README.md)
│   └── img/                # Profile photos, favicons and thumbnails
├── robots.txt
├── sitemap.xml
└── README.md
```

## Local Development

Data files are loaded with `fetch()`, so serve the site over HTTP:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`. The Ask box always shows offline locally, because the RAG service only allows the production origin.

## Content Management

- Home page copy: `assets/data/*.json`, described in `assets/data/README.md`.
- A project with a write-up needs `links["project page"]` (the `<slug>/` path) and a `writing` object (`title`, `outcome`) in `projects.json`; the Writing tab lists it and links to `writing/<slug>/`.

Validate all data files before committing:

```bash
python3 -c "import json, glob; [json.load(open(f)) for f in glob.glob('assets/data/*.json')]; print('All JSON files valid')"
```

## Deployment

The website is hosted on GitHub Pages. Any push to the `main` branch deploys it.
