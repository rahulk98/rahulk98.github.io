# Personal Portfolio

Static portfolio website deployed to GitHub Pages at [rahulkrishnan.me](https://rahulkrishnan.me). The site showcases research in machine learning efficiency (KV cache compression, LLM evaluation, numerical optimization) and enterprise backend software engineering.

## Architecture

The site uses a data-driven static architecture built with vanilla HTML5, CSS3, and ES6 JavaScript. It intentionally avoids third-party UI frameworks and static site generators to keep page weight minimal and dependencies at zero.

- Client-Side Hydration: Site content is decoupled from presentation and stored as normalized JSON files in `assets/data/`. During initialization, `assets/js/main.js` or `assets/js/minimal.js` fetches these schemas via asynchronous HTTP requests and injects rendered nodes into the DOM.
- Dual Layout Engine: The site supports two interfaces switchable via `config.json` or URL query parameters:
  - `minimal` (default): A tabbed, publication-focused interface designed for quick scanning across research preprints, technical projects, and recent updates.
  - `classic`: A single-page layout featuring a hero section, filterable project grid, and linear section flow.
- Theme Persistence: Dark and light modes are controlled through CSS custom properties defined on `:root` and `.dark`. The user preference is stored in `localStorage` and applied before initial paint to prevent theme flashing.
- Embedded RAG Assistant: A client-side query interface connects to an external FastAPI retrieval service self-hosted with Docker on a VPS at rag.rahulkrishnan.me. The backend indexes resume and research documents, supporting natural-language Q&A through hybrid BM25 and vector retrieval.

## Repository Structure

```
.
├── index.html              # Core entry point supporting classic and minimal layouts
├── project.html            # Dynamic project detail view reading URL slugs
├── privacy.html            # Privacy policy
├── 404.html                # Error page
├── assets/
│   ├── css/
│   │   ├── styles.css      # Core styles and classic layout rules
│   │   └── minimal.css     # Styling for the tabbed minimal interface
│   ├── js/
│   │   ├── main.js         # Application bootstrap, JSON fetcher, classic DOM rendering
│   │   ├── minimal.js      # Minimal tabbed interface and view controller
│   │   └── rag.js          # Client interface for the RAG endpoint
│   ├── data/
│   │   ├── config.json     # Master file registry and active design setting
│   │   ├── personal.json   # Bio, contact details, and classic hero copy
│   │   ├── minimal.json    # Copy, news items, and tabs for minimal design
│   │   ├── projects.json   # Project catalog with outcomes, stacks, and writeups
│   │   ├── experience.json # Professional experience at SAP and research appointments
│   │   ├── publications.json # Academic preprints and peer-reviewed papers
│   │   ├── education.json  # Degrees, academic records, and coursework
│   │   ├── skills.json     # Categorized technical competencies
│   │   └── site.json       # Metadata, canonical URLs, and Open Graph tags
│   └── img/                # Profile photos and project thumbnail assets
├── robots.txt              # Search engine directives
├── sitemap.xml             # Canonical sitemap
└── README.md
```

## Local Development

Because data files are loaded at runtime through `fetch()`, the site must be served over an HTTP connection rather than the `file://` scheme.

Run a local server from this directory:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .
```

Open `http://localhost:8000` in a browser.

To preview alternate layouts without editing `config.json`, pass the `design` parameter:
- `http://localhost:8000/?design=minimal`
- `http://localhost:8000/?design=classic`

## Content Management

All site copy and metadata are maintained in `assets/data/`:

- Research and Projects: Edit `publications.json` and `projects.json`. Each entry includes structured technical fields (`slug`, `stack`, `outcome`, `summary`, `detail`).
- Bio and Profile: Edit `personal.json` for the classic view and `minimal.json` for the minimal view.
- Experience and Education: Edit `experience.json`, `education.json`, or `certifications.json`.
- Active Layout: Toggle `"design": "minimal"` or `"design": "classic"` in `config.json`.

Validate all data files before committing:

```bash
python3 -c "import json, glob; [json.load(open(f)) for f in glob.glob('assets/data/*.json')]; print('All JSON files valid')"
```

## Deployment

The website is hosted on GitHub Pages. Any push to the `main` branch triggers automatic static deployment.
