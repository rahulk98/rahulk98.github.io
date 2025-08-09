import json
import pathlib
import sys
import datetime

try:
    import yaml
except ImportError:
    print("Install pyyaml to run this script: pip install pyyaml")
    sys.exit(1)

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "data"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def split_front_matter(text: str):
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            return parts[1].strip(), parts[2].strip()
    return "", text.strip()


def parse_date(val):
    if not val:
        return None
    try:
        return datetime.date.fromisoformat(str(val)[:10])
    except (ValueError, TypeError):
        return None


def process_projects():
    items = []
    for md_path in sorted((ROOT / "projects").glob("*.md")):
        fm_text, _ = split_front_matter(md_path.read_text(encoding="utf-8"))
        meta = yaml.safe_load(fm_text) if fm_text else {}
        if not meta:
            continue

        date = parse_date(meta.get("date"))
        stack = meta.get("stack", [])
        if isinstance(stack, str):
            stack = [s.strip() for s in stack.split(",") if s.strip()]

        items.append(
            {
                "title": meta.get("title", md_path.stem),
                "date": str(date) if date else "",
                "year": str(date.year) if date else "",
                "slug": meta.get("slug", md_path.stem),
                "stack": stack,
                "links": meta.get("links", {}),
                "summary": meta.get("summary", ""),
            }
        )
    items.sort(key=lambda x: (x["date"] == "", x["date"]), reverse=True)
    return items


def process_experience():
    items = []
    for md_path in sorted((ROOT / "experience").glob("*.md")):
        fm_text, _ = split_front_matter(md_path.read_text(encoding="utf-8"))
        meta = yaml.safe_load(fm_text) if fm_text else {}
        if not meta:
            continue

        items.append(
            {
                "title": meta.get("title"),
                "company": meta.get("company"),
                "location": meta.get("location"),
                "dates": meta.get("dates"),
                "order": meta.get("order", 999),
                "points": meta.get("points", []),
            }
        )
    items.sort(key=lambda x: x["order"])
    return items


def main():
    # Process Projects
    project_items = process_projects()
    proj_out = OUT_DIR / "projects.json"
    proj_out.write_text(
        json.dumps(project_items, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Wrote {proj_out.relative_to(ROOT)} ({len(project_items)} items)")

    # Process Experience
    exp_items = process_experience()
    exp_out = OUT_DIR / "experience.json"
    exp_out.write_text(
        json.dumps(exp_items, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Wrote {exp_out.relative_to(ROOT)} ({len(exp_items)} items)")


if __name__ == "__main__":
    main()
