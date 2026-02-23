# Repository Guidelines

## Project Structure & Module Organization
This repository is a static portfolio site (GitHub Pages style) with no build step.

- Root pages: `index.html`, `project.html`, `privacy.html`, `404.html`
- Styling: `assets/css/styles.css`
- Client logic: `assets/js/main.js`
- Content data: `assets/data/*.json` (primary editable content source)
- Media: `assets/img/` and `assets/resume/`
- Utility script: `generate_thumbnails.py` (project thumbnail generation)

When updating copy or section data, prefer editing JSON in `assets/data/` over hardcoding in HTML.

## Build, Test, and Development Commands
- `python -m http.server 8000`
  Runs a local static server at `http://localhost:8000`.
- `npx serve .`
  Alternative local static server for Node users.
- `python generate_thumbnails.py`
  Regenerates project thumbnail images in `assets/img/projects/` (requires Pillow).

There is currently no CI build/test pipeline configured in `.github/workflows/`.

## Coding Style & Naming Conventions
- Use 4-space indentation in HTML, CSS, JS, and JSON to match existing files.
- Keep JavaScript in vanilla ES-style functions in `assets/js/main.js`; use clear verb-based names (for example, `setupThemeToggle`, `loadProjects`).
- Keep CSS tokens in `:root` and prefer existing custom properties (for example, `--accent`, `--bg-primary`) before adding new values.
- Use kebab-case for file names and slugs (for example, `sentiment-bert-thumb.jpg`).

## Testing Guidelines
No automated test framework is configured. Validate changes manually before opening a PR:

1. Run the site locally and verify key pages (`/`, `/project.html`, `/privacy.html`, `/404.html`).
2. Check responsive behavior at mobile and desktop widths.
3. Verify interactive features (theme toggle, navigation, project filtering, modal behavior).
4. Confirm JSON edits load correctly with no browser console errors.

## Commit & Pull Request Guidelines
Recent history uses short, imperative commit messages (for example, `Update mobile responsiveness`, `Add GitHub Actions workflow...`).

- Keep commits focused and use present-tense, imperative subject lines.
- In PRs, include:
  - A concise summary of user-facing changes
  - Linked issue/ticket (if applicable)
  - Before/after screenshots for UI changes
  - Manual test notes (what you checked locally)
