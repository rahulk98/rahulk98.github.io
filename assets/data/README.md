# Site content

The home page is rendered from these JSON files. `config.json` lists them; `assets/js/main.js` loads each one into `window.<name>Data` and `assets/js/minimal.js` renders the tabs. Edit content here, not in `index.html`.

| File | Used for |
|------|----------|
| `config.json` | Registry of the data files to load |
| `site.json` | Social links (Email, Google Scholar, GitHub) |
| `personal.json` | Name and profile details |
| `minimal.json` | About text, tab titles and taglines, Ask box label |
| `experience.json` | Recent tab, work experience |
| `education.json` | Recent tab, education |
| `publications.json` | Work tab, papers |
| `projects.json` | Work tab, projects; Writing tab for entries with a write-up |
| `navigation.json` | CV link (the menu item with `download`) |
| `footer.json` | Footer links |

## Projects

Each entry in `projects.json` has `title`, `slug`, `date`, `year`, `keywords`, `outcome`, `summary`, `tags` and `links`. An entry with `"Research"` in `keywords` shows under the Research filter of the Work tab, the rest under Projects. A project with a published paper is not listed separately.

An entry with a write-up also has:
- `links["project page"]`: the academic-template path, for example `"cot-hint-probes/"`.
- `writing`: `{"title": ..., "outcome": ...}`, the title and result line shown in the Writing tab, which links to `writing/<slug>/`.

Validate after editing:

```bash
python3 -c "import json, glob; [json.load(open(f)) for f in glob.glob('assets/data/*.json')]; print('All JSON files valid')"
```
