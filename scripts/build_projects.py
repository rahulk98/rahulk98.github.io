import json
import pathlib
import re
import sys
import datetime

try:
    import yaml
except ImportError:
    print("Install pyyaml to run this script: pip install pyyaml")
    sys.exit(1)

ROOT = pathlib.Path(__file__).resolve().parents[1]
PROJECTS_DIR = ROOT / "projects"
OUT_DIR = ROOT / "assets" / "data"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def split_front_matter(text: str):
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            _, fm, body = parts[0], parts[1], parts[2]
            return fm.strip(), body.strip()
    return "", text.strip()


def first_paragraph(md: str):
    for block in re.split(r"\n\s*\n", md.strip(), maxsplit=1):
        if block.strip():
            return re.sub(r"\s+", " ", block.strip())
    return ""


def parse_date(val):
    if not val:
        return None
    try:
        return datetime.date.fromisoformat(str(val)[:10])
    except Exception:
        return None


def load_items():
    items = []
    for md_path in sorted(PROJECTS_DIR.glob("*.md")):
        if md_path.name == "project-summaries.md":
            continue
        text = md_path.read_text(encoding="utf-8")
        fm_text, body = split_front_matter(text)
        meta = yaml.safe_load(fm_text) if fm_text else {}
        meta = meta or {}
        date = parse_date(meta.get("date"))
        stack = meta.get("stack") or []
        if isinstance(stack, str):
            stack = [s.strip() for s in stack.split(",") if s.strip()]
        links = meta.get("links", {})
        summary = meta.get("summary") or first_paragraph(body)
        slug = meta.get("slug") or md_path.stem
        items.append(
            {
                "title": meta.get("title", md_path.stem),
                "date": str(date) if date else "",
                "year": str(date.year) if date else "",
                "slug": slug,
                "stack": stack,
                "links": links,
                "summary": summary,
            }
        )
    items.sort(key=lambda x: (x["date"] == "", x["date"]), reverse=True)
    return items


def main():
    items = load_items()
    out = OUT_DIR / "projects.json"
    out.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out.relative_to(ROOT)} ({len(items)} items)")


if __name__ == "__main__":
    main()
