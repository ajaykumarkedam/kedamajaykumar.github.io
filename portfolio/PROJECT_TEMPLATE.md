# Portfolio project zip — template

Paste everything below the line into the chat where a project was done. That chat then builds one zip for the project that drops straight into the portfolio.

---

**Task:** Package the project we worked on in this chat as a portfolio entry. Produce **one zip file** that follows the spec below exactly. Use only facts, numbers, figures and code from this project. Do not invent results, dates, team members or links; if something is unknown, leave the field out (or use a clearly marked `[placeholder]`) and list what is missing at the end of your reply.

## 1. Zip layout

The zip contains **one top-level folder**, named with the project's *slug*: lowercase words joined by hyphens, e.g. `pulsar-150-stability`. The zip file has the same name: `pulsar-150-stability.zip`.

```
<slug>/
├── project.json        required — metadata (schema below)
├── writeup.md          required — the full write-up in Markdown
├── images/
│   ├── cover.png       required — 16:9, about 1600×900, under 1 MB
│   └── …               figures used in writeup.md or the gallery
├── demo/               optional — interactive page
│   └── index.html
└── report.pdf          optional — full report, slides, etc. (link it from "links")
```

Every path inside the project is **relative to the `<slug>/` folder** (e.g. `images/cover.png`). Never use absolute paths or `../`.

## 2. `project.json`

```json
{
  "title": "Short project title (max ~70 characters)",
  "summary": "One or two sentences for the project card: what was done and the headline result.",
  "category": "Thermal & Fluids / FEA",
  "date": "2026-10",
  "context": "Course project / Internship at X / Personal project",
  "role": "What I did, e.g. Sole author, or Modelling & simulation lead",
  "duration": "6 weeks",
  "team": "Individual, or Team of 3",
  "status": "Completed",
  "featured": false,
  "tags": ["ANSYS Mechanical", "Python", "Transient FEA"],
  "cover": "images/cover.png",
  "coverAlt": "One sentence describing the cover image",
  "highlights": [
    { "value": "3.2 %", "label": "error against analytical fin theory" },
    { "value": "16 pins", "label": "copper array modelled in 3D" },
    { "value": "≈ 40 s", "label": "time to steady state" }
  ],
  "links": [
    { "label": "Full report (PDF)", "url": "report.pdf" },
    { "label": "Code on GitHub", "url": "https://github.com/…" }
  ],
  "demo": {
    "file": "demo/index.html",
    "title": "Name of the interactive demo",
    "description": "One sentence telling the visitor what to drag or click.",
    "height": 600
  },
  "gallery": [
    { "src": "images/mesh.png", "caption": "Short caption" }
  ],
  "writeup": "writeup.md"
}
```

Field rules:

| Field | Required | Rule |
|---|---|---|
| `title`, `summary`, `category`, `date`, `tags`, `cover` | yes | `summary` is at most 2 sentences. `date` is `YYYY-MM`. |
| `category` | yes | Exactly one of: `Thermal & Fluids / FEA`, `Vehicle Dynamics`, `Controls & Estimation`. If none fits, propose a new short category name and say so. |
| `tags` | yes | 3–7 tools and methods actually used (software, languages, techniques). |
| `highlights` | recommended | 2–4 key results. `value` is short (a number with units, or a few words); `label` explains it. The first one appears on the card. Real numbers only. |
| `context`, `role`, `duration`, `team`, `status` | optional | Leave a field out if it's unknown. |
| `links` | optional | The first link is shown as the main button. Local files must exist in the zip. |
| `demo` | optional | Leave it out if there is no interactive part. `height` is in pixels (400–900). |
| `gallery` | optional | Extra images not already shown in the write-up. |
| `featured` | optional | `true` adds a "Featured" badge. Default `false`. |

## 3. `writeup.md`

Write for a recruiter or engineer skimming in 2–3 minutes: clear, specific, quantitative. Do **not** repeat the title as a `#` heading; start at `##`. Use these sections, in this order, and skip any that don't apply:

1. `## Overview`: 2–4 sentences on the problem, why it matters, and the headline result.
2. `## Problem`: the specification, geometry, operating conditions and assumptions, as a bulleted list.
3. `## Approach`: method, governing equations, model or controller design, tools.
4. `## Setup`: mesh, boundary conditions, parameters, solver settings or hardware (tables work well).
5. `## Results`: figures with captions, a results table, and what the numbers mean.
6. `## Validation`: comparison with theory, literature, experiments or a mesh study.
7. `## What I learned`: 2–4 bullets on skills and insights.
8. `## References`: a numbered list.

Supported Markdown:
- `##` / `###` headings, paragraphs, **bold**, *italic*, `inline code`, [links](https://…)
- Bulleted (`-`) and numbered (`1.`) lists; nest by indenting 2 spaces
- Tables with a `|---|` separator row
- Fenced code blocks with a language (```` ```python ````). Keep snippets short and relevant.
- `> quote` blocks for one key insight
- Math: `$inline$` and `$$ display $$` in LaTeX (rendered with KaTeX)
- An image on its own line becomes a captioned figure: `![alt text](images/plot.png "Caption shown under the figure")`
- Raw HTML is **not** rendered. Don't use it.

## 4. Images

- Use PNG for plots and diagrams, JPG for photos and renders, or SVG. Keep each file under 1 MB, and plot width about 1200–1600 px.
- `cover.png` is 16:9. It's the first thing people see: use the most striking real result (a contour plot, an animation frame or a render). Use no text other than what's already in the figure.
- Plots need labelled axes with units, readable fonts, and a white or transparent background.
- Name files in lowercase-with-hyphens (`temperature-contour.png`).

## 5. `demo/index.html` (only if the project has an interactive part)

- One **self-contained** HTML file: CSS and JS inline, and no frameworks or CDNs unless unavoidable. Any data files go in `demo/` and are loaded with relative paths.
- It runs inside an iframe about 1000 px wide and `height` px tall, and must also work on a phone (narrow widths).
- Support light and dark mode with `@media (prefers-color-scheme: dark)`.
- No `alert()`, pop-ups or `localStorage` dependencies. It must start working immediately, with no setup.
- If this chat already has an interactive artifact for the project, adapt that page.

## 6. Before you hand over the zip

- [ ] The zip has exactly one folder, named `<slug>`, and the zip is `<slug>.zip`
- [ ] `project.json` is valid JSON and every file it references exists
- [ ] Every image in `writeup.md` exists and the paths are relative
- [ ] All numbers match this project's actual results
- [ ] No file is over 25 MB, and there are no `.DS_Store`, `__MACOSX` or temporary files

Finally, reply with: the slug, a one-line summary, and a list of anything missing or left as a placeholder.
