#!/usr/bin/env python3
"""Check a project zip (or folder) against the portfolio template and, optionally, install it.

Usage (run from the portfolio folder):
    python3 tools/add_project.py my-project.zip            # check, unzip into projects/, add to projects.json
    python3 tools/add_project.py my-project.zip --check    # only check, change nothing
    python3 tools/add_project.py projects/my-project --check
    python3 tools/add_project.py --check-all               # check every project listed in projects.json

Needs only the Python standard library.
"""
import json
import re
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
REQUIRED = ["title", "summary", "category", "date", "tags"]
DRAWINGS = {"loop", "thermosyphon", "blade", "turbine", "cycle", "rankine", "fins", "eigen", "step", "circuit"}
MAX_FILE_MB = 25          # GitHub refuses files over 100 MB; keep pages fast
IMG_IN_MD = re.compile(r"!\[[^\]]*\]\(\s*([^)\s]+)")
LINK_IN_MD = re.compile(r"(?<!!)\[[^\]]+\]\(\s*([^)\s]+)")


def is_external(u):
    return bool(re.match(r"^(?:[a-z][a-z0-9+.-]*:|//|#)", u, re.I))


def check_folder(folder: Path, categories):
    errors, warnings = [], []
    slug = folder.name
    if not SLUG.match(slug):
        errors.append(f"folder name '{slug}' must be lowercase words joined by hyphens, e.g. 'pulsar-150-stability'")

    pj = folder / "project.json"
    if not pj.exists():
        return [f"missing {slug}/project.json"], warnings
    try:
        p = json.loads(pj.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return [f"project.json is not valid JSON: {e}"], warnings

    for key in REQUIRED:
        if not p.get(key):
            errors.append(f"project.json: '{key}' is required")
    if p.get("date") and not re.match(r"^\d{4}(-\d{2})?$", str(p["date"])):
        errors.append("project.json: 'date' must look like 2026-10 (or 2026)")
    if p.get("drawing") and p["drawing"] not in DRAWINGS:
        warnings.append(f"drawing '{p['drawing']}' is not one of {sorted(DRAWINGS)}; the area's default drawing will be used")
    if not p.get("cover"):
        warnings.append("no cover image; a line drawing for the project's area is shown instead")
    if p.get("tags") is not None and not isinstance(p.get("tags"), list):
        errors.append("project.json: 'tags' must be a list of strings")
    if categories and p.get("category") and p["category"] not in categories:
        warnings.append(f"category '{p['category']}' is not in site.json categories {categories}; "
                        "it will still show, as an extra filter chip")
    if len(p.get("summary", "")) > 260:
        warnings.append("summary is long; keep it to 1–2 sentences (it appears on the card)")
    if len(p.get("highlights", [])) > 4:
        warnings.append("more than 4 highlights; only the first shows on the card, 3–4 read best on the page")
    for h in p.get("highlights", []):
        if not isinstance(h, dict) or not h.get("value") or not h.get("label"):
            errors.append("each highlight needs 'value' and 'label'")

    def need(rel, what):
        if not rel or is_external(rel):
            return
        if rel.startswith("/"):
            warnings.append(f"{what} '{rel}' starts with '/'; use a path relative to the project folder")
            return
        f = (folder / rel).resolve()
        if folder.resolve() not in f.parents and f != folder.resolve():
            errors.append(f"{what} '{rel}' points outside the project folder")
        elif not f.exists():
            errors.append(f"{what} '{rel}' does not exist in the project folder")

    need(p.get("cover"), "cover")
    for g in p.get("gallery", []):
        need(g.get("src"), "gallery image")
    for l in p.get("links", []):
        if not l.get("label") or not l.get("url"):
            errors.append("each link needs 'label' and 'url'")
        need(l.get("url"), "link")
    demo = p.get("demo")
    if demo:
        need(demo.get("file"), "demo.file")
        df = folder / demo.get("file", "")
        if df.is_file():
            html = df.read_text(encoding="utf-8", errors="replace")
            ext = re.findall(r'<(?:script|link)[^>]+(?:src|href)=["\'](https?:[^"\']+)', html)
            if ext:
                warnings.append(f"demo loads {len(ext)} file(s) from the internet ({ext[0]}…); it will break offline or if that CDN changes")

    wu = p.get("writeup", "writeup.md")
    if wu:
        need(wu, "writeup")
        wf = folder / wu
        if wf.is_file():
            md = wf.read_text(encoding="utf-8", errors="replace")
            for u in IMG_IN_MD.findall(md):
                need(u, "image in write-up")
            for u in LINK_IN_MD.findall(md):
                need(u, "link in write-up")
            if re.search(r"^#\s", md, re.M):
                warnings.append("write-up uses a top-level '# ' heading; start sections at '## ' (the page already shows the title)")

    for f in folder.rglob("*"):
        if f.is_file():
            mb = f.stat().st_size / 1e6
            if mb > MAX_FILE_MB:
                errors.append(f"{f.relative_to(folder)} is {mb:.0f} MB (limit {MAX_FILE_MB} MB); compress it or link to it instead")
            elif mb > 5 and f.suffix.lower() in {".png", ".jpg", ".jpeg", ".gif", ".webp"}:
                warnings.append(f"{f.relative_to(folder)} is {mb:.1f} MB; images under 1 MB load much faster")
            if f.name in {".DS_Store", "Thumbs.db"} or "__MACOSX" in f.parts:
                warnings.append(f"junk file {f.relative_to(folder)} can be deleted")
    return errors, warnings


def site_categories():
    try:
        return json.loads((ROOT / "site.json").read_text(encoding="utf-8")).get("categories", [])
    except Exception:
        return []


def read_list():
    path = ROOT / "projects.json"
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else []


def report(name, errors, warnings):
    print(f"\n{name}")
    for e in errors:
        print(f"  ERROR    {e}")
    for w in warnings:
        print(f"  warning  {w}")
    if not errors and not warnings:
        print("  OK")
    elif not errors:
        print("  OK (with warnings)")


def main(argv):
    if not argv or argv[0] in {"-h", "--help"}:
        print(__doc__)
        return 0
    cats = site_categories()

    if argv[0] == "--check-all":
        bad = 0
        for slug in read_list():
            e, w = check_folder(ROOT / "projects" / slug, cats) if (ROOT / "projects" / slug).is_dir() \
                else ([f"listed in projects.json but projects/{slug}/ does not exist"], [])
            report(slug, e, w)
            bad += bool(e)
        return 1 if bad else 0

    src = Path(argv[0]).expanduser()
    check_only = "--check" in argv[1:]
    if not src.exists():
        print(f"not found: {src}")
        return 1

    tmp = None
    if src.is_file() and src.suffix.lower() == ".zip":
        tmp = Path(tempfile.mkdtemp())
        with zipfile.ZipFile(src) as z:
            for n in z.namelist():
                if n.startswith("/") or ".." in Path(n).parts:
                    print(f"refusing unsafe path in zip: {n}")
                    return 1
            z.extractall(tmp)
        tops = [d for d in tmp.iterdir() if d.name != "__MACOSX"]
        if len(tops) == 1 and tops[0].is_dir():
            folder = tops[0]
        elif (tmp / "project.json").exists():
            print("zip has no top folder; using the zip's name as the folder name")
            folder = tmp.parent / src.stem.lower()
            shutil.move(str(tmp), folder)
            tmp = folder
        else:
            print("zip must contain exactly one folder (named after the project) with project.json inside")
            return 1
    elif src.is_dir():
        folder = src
    else:
        print("give a .zip file or a project folder")
        return 1

    errors, warnings = check_folder(folder, cats)
    report(folder.name, errors, warnings)
    if errors:
        print("\nFix the errors above (or ask the chat that made the zip to fix them), then run this again.")
        return 1
    if check_only:
        return 0

    dest = ROOT / "projects" / folder.name
    if dest.resolve() != folder.resolve():
        if dest.exists():
            print(f"\nprojects/{folder.name} already exists — replacing it with the new version.")
            shutil.rmtree(dest)
        shutil.copytree(folder, dest, ignore=shutil.ignore_patterns("__MACOSX", ".DS_Store", "Thumbs.db"))
    ids = read_list()
    if folder.name not in ids:
        ids.insert(0, folder.name)   # newest first; reorder projects.json by hand any time
        (ROOT / "projects.json").write_text(json.dumps(ids, indent=2) + "\n", encoding="utf-8")
        print(f"added '{folder.name}' to the top of projects.json")
    print(f"installed → projects/{folder.name}/")
    if tmp:
        shutil.rmtree(tmp, ignore_errors=True)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
