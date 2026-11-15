# Portfolio project zip — template

Paste everything below the line into the chat where a project was done. That chat builds one zip for the project, ready to upload into the portfolio's `projects/` folder.

---

**Task:** Package the project we worked on in this chat as a portfolio entry. Produce **one zip file** that follows the spec below exactly. Use only facts, numbers, figures and code from this project. Do not invent results, dates, team members or links; if something is unknown, leave the field out and list what is missing at the end of your reply.

## 1. Folder name (slug)

The zip contains **one top-level folder**, named with the project's *slug*: lowercase words joined by hyphens. The zip file has the same name, e.g. `motorcycle-stability.zip`.

These projects are already on the site. If this chat is about one of them, **use exactly this slug** so the new version replaces the old one:

| Project | Slug |
|---|---|
| High Heat Flux Two-Phase Thermosyphon (M.Tech thesis) | `ev-thermosyphon-thesis` |
| Blended Braking Controller for a Sport EV | `blended-braking-controller` |
| Motorcycle Stability Analysis (lumped parameter) | `motorcycle-stability` |
| Water Droplet Erosion and Fatigue in LP Steam Turbine Blades | `turbine-blade-erosion-fatigue` |
| Transient Heat Transfer of Fins and Multilayer Systems | `transient-fins-multilayer-fea` |
| Closed-Loop Rankine Cycle in Simscape | `rankine-cycle-simscape` |
| Solar Fan with Study Lamp and Mobile Charger | `solar-fan-study-lamp` |

For a new project, make a new slug (e.g. `pin-fin-array-study`).

## 2. Zip layout

```
<slug>/
├── project.json        required: metadata (schema below)
├── writeup.md          required: the full write-up in Markdown
├── images/
│   ├── cover.png       recommended: 16:10 or 16:9, about 1600 px wide, under 1 MB
│   └── …               figures used in writeup.md or the gallery
├── demo/               optional: interactive page
│   └── index.html
└── report.pdf          optional: full report or slides (link it from "links")
```

Every path inside the project is **relative to the `<slug>/` folder** (e.g. `images/cover.png`). Never use absolute paths or `../`.

## 3. `project.json`

```json
{
  "title": "Short project title (max ~70 characters)",
  "summary": "One or two sentences for the project card: what was done and the headline result.",
  "category": "Thermal & Fluids / FEA",
  "date": "2025-11",
  "period": "Oct 2025 – Nov 2025",
  "context": "Course project, IISc Bengaluru",
  "role": "Sole author",
  "team": "Individual",
  "status": "Completed",
  "featured": false,
  "tags": ["MATLAB", "Eigenvalue analysis", "Lagrangian mechanics"],
  "cover": "images/cover.png",
  "coverAlt": "One sentence describing the cover image",
  "highlights": [
    { "value": "4 DOF", "label": "Lagrangian model with tyre relaxation" },
    { "value": "3.2 %", "label": "error against analytical fin theory" }
  ],
  "links": [
    { "label": "Full report (PDF)", "url": "report.pdf" },
    { "label": "Code on GitHub", "url": "https://github.com/…" }
  ],
  "demo": {
    "file": "demo/index.html",
    "title": "Name of the interactive model",
    "description": "One sentence telling the visitor what to drag or click.",
    "height": 600
  },
  "gallery": [
    { "src": "images/mesh.png", "caption": "Short caption" }
  ],
  "writeup": "writeup.md"
}
```

| Field | Required | Rule |
|---|---|---|
| `title`, `summary`, `category`, `date`, `tags` | yes | `summary` is at most 2 sentences. `date` is `YYYY-MM` (the end date; it sorts and shows the year). |
| `category` | yes | Exactly one of: `Thermal & Fluids / FEA`, `Vehicle Dynamics`, `Controls & Estimation`, `Design & Fabrication`. |
| `tags` | yes | 3–6 tools and methods actually used. The first 3 show in the projects table. |
| `period` | optional | Human-readable dates, e.g. `Mar 2024 – Apr 2024` or `Jan 2026 – present`. |
| `cover` | recommended | Without it, the site shows a simple line drawing. |
| `highlights` | optional | 2–4 key results, real numbers only. `value` is short (number with units); `label` explains it. |
| `context`, `role`, `team`, `status` | optional | Leave out anything unknown. `status` is `Completed` or `In progress`. |
| `links` | optional | The first link is the main button. Local files must exist in the zip. |
| `demo` | optional | Leave it out if there is no interactive part. |
| `gallery` | optional | Extra images not already shown in the write-up. |
| `featured` | optional | `true` puts the project in the "Featured projects" cards on the home page (keep it to 4 projects in total). |

## 4. `writeup.md`

Write for a recruiter or engineer skimming in 2–3 minutes: clear, specific and quantitative. Do **not** repeat the title as a `#` heading; start at `##`. Use these sections, in this order, and skip any that don't apply:

1. `## Overview`: 2–4 sentences on the problem, why it matters and the headline result.
2. `## Problem`: specification, geometry, operating conditions and assumptions, as a bulleted list.
3. `## Approach`: method, governing equations, model or controller design, tools.
4. `## Setup`: mesh, boundary conditions, parameters, solver settings or hardware (tables work well).
5. `## Results`: figures with captions, a results table, and what the numbers mean.
6. `## Validation`: comparison with theory, literature, experiments or a mesh study.
7. `## What I learned`: 2–4 bullets.
8. `## References`: a numbered list.

Supported Markdown:
- `##` / `###` headings, paragraphs, **bold**, *italic*, `inline code`, [links](https://…)
- Bulleted (`-`) and numbered (`1.`) lists; nest by indenting 2 spaces
- Tables with a `|---|` separator row
- Fenced code blocks with a language (```` ```python ````). Keep them short.
- `> quote` blocks for one key insight
- Math: `$inline$` and `$$ display $$` in LaTeX
- An image on its own line becomes a captioned figure: `![alt text](images/plot.png "Caption shown under the figure")`
- Raw HTML is **not** rendered. Don't use it.

## 5. Images

- Use PNG for plots and diagrams, JPG for photos and renders. Keep each file under 1 MB, about 1200–1600 px wide.
- Plots need a white background, labelled axes with units, and readable fonts.
- The cover is the most telling real result: a contour plot, a model screenshot, a photo of the hardware.
- Name files in lowercase-with-hyphens (`temperature-contour.png`).

## 6. `demo/index.html` (only if the project has an interactive part)

- One **self-contained** HTML file with inline CSS and JS, and no external libraries unless unavoidable.
- Light background only: no dark mode. No decorative animation. The only motion is what the visitor controls (sliders, play buttons).
- It runs inside a frame about 1000 px wide and `height` px tall, and must also work at phone width.
- No `alert()` and no pop-ups. It must work immediately, with no setup.
- If this chat already has an interactive artifact for the project, adapt it.

## 7. Before you hand over the zip

- [ ] One folder named `<slug>`, and the zip is named `<slug>.zip`
- [ ] `project.json` is valid JSON and every file it references exists
- [ ] Every image in `writeup.md` exists and the paths are relative
- [ ] All numbers match this project's actual results
- [ ] No file is over 25 MB, and there are no `.DS_Store`, `__MACOSX` or temporary files

Finally, reply with: the slug, a one-line summary, and anything missing or left out.
