# Engineering portfolio

A plain HTML/CSS/JavaScript portfolio for GitHub Pages: no build step and no dependencies. Every project lives in its own folder under `projects/`, and the site lists the projects named in `projects.json`.

```
portfolio/
├── index.html            home page (about, projects, skills, experience, contact)
├── project.html          one page per project:  project.html?id=<folder-name>
├── site.json             ← YOUR DETAILS: name, bio, contacts, skills, experience, education, categories
├── projects.json         ← LIST OF PROJECTS, in the order they appear on the site
├── projects/
│   └── sample-project/   example entry: delete it once real projects are in
├── assets/
│   ├── css/style.css     look & feel (colours are variables at the top)
│   ├── js/               site code (no need to touch it)
│   ├── img/              favicon, profile photo
│   └── resume/resume.pdf ← replace with your résumé
├── tools/add_project.py  checks and installs a project zip
├── PROJECT_TEMPLATE.md   paste into a chat to get a project zip
└── .nojekyll             tells GitHub Pages to serve files as they are
```

## 1. First-time setup

1. **Your details:** open `site.json` and replace every `[placeholder]`. Remove any experience or education entry you don't need. An empty list hides that section.
2. **Photo:** put a square photo at `assets/img/profile.jpg` and set `"photo": "assets/img/profile.jpg"`.
3. **Résumé:** replace `assets/resume/resume.pdf` with your own file, keeping the same name.
4. **Preview locally** (browsers block the JSON files if you just double-click `index.html`):
   ```bash
   cd portfolio
   python3 -m http.server 8000
   # open http://localhost:8000
   ```

## 2. Publish on GitHub Pages

1. Create a repository. Name it `<your-username>.github.io` and the site will be at `https://<your-username>.github.io/`. With any other name it'll be at `https://<your-username>.github.io/<repo>/`. Both work, because every path in the site is relative.
2. Upload the **contents** of this folder (not the folder itself) to the repository root, either through the web UI (*Add file → Upload files*) or with git:
   ```bash
   git init && git add . && git commit -m "Portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo>.git
   git push -u origin main
   ```
3. In the repository, go to **Settings → Pages → Build and deployment**, choose *Deploy from a branch*, then `main` / `(root)`, and save. The site goes live in a minute or two.

## 3. Adding a project

**Get the zip:** open the chat where you did the project, paste the contents of `PROJECT_TEMPLATE.md`, and download the zip it produces (e.g. `pulsar-150-stability.zip`).

**Option A: with the script** (it checks the zip, unzips it and updates `projects.json` for you):
```bash
python3 tools/add_project.py ~/Downloads/pulsar-150-stability.zip
```

**Option B: by hand.**
1. Unzip it so that you have `projects/pulsar-150-stability/project.json`.
2. Add the folder name to `projects.json`:
   ```json
   [
     "pulsar-150-stability",
     "sample-project"
   ]
   ```
That's it: one line. Commit and push, or upload the new folder plus `projects.json` on GitHub.

Other useful commands:
```bash
python3 tools/add_project.py some.zip --check   # check only, change nothing
python3 tools/add_project.py --check-all        # check every listed project
```

### Changing things later
| To… | Edit |
|---|---|
| Reorder projects | the order of names in `projects.json` |
| Hide a project without deleting it | add `"hidden": true` to its `project.json` |
| Fix a project's text or numbers | `projects/<name>/project.json` or `writeup.md` |
| Add a filter category | `"categories"` in `site.json` |
| Change colours or fonts | the variables at the top of `assets/css/style.css` |
| Link straight to a category | `index.html?cat=Vehicle%20Dynamics#projects` |

## 4. Troubleshooting

- **The page says "Something didn't load".** The red box names the file that failed. Usually it's a typo in a folder name in `projects.json`, or invalid JSON (a missing comma or quote). Run `python3 tools/add_project.py --check-all`.
- **Equations show as raw `$…$`.** The KaTeX library loads from a CDN, so check your internet connection. Everything else works without it.
- **Changes don't appear on GitHub Pages.** Wait a minute, then hard-refresh (Ctrl/Cmd + Shift + R).
