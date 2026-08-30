# IE437 — interactive HTML lecture notes

Interactive, browser-based lecture decks for **IE437 · Data-Driven Decision Making and Control**,
generated from per-chapter markdown and exportable to PDF.

```
IE437_Course_Narrative_Spine.md   the course-wide storyline (the top-level reference)
tex/                              the LaTeX/beamer sources — equations and act structure
lecture_slides/                   the original PDF decks

md/          ← EDIT HERE.  One markdown file per chapter = the single source of truth
  _SCHEMA.md     the authoring schema (front matter, directives, widgets)
  _TEMPLATE.md   skeleton for a new chapter
deck/        the shared engine, reused by every chapter
  deck.css       1280x720 stage, light/dark grounds, print rules
  deck.js        navigation, click-reveals, widget registry, print hooks
  katex/         vendored KaTeX (math is rendered at build time)
  widgets/       interactive simulators, one file per widget
build.mjs    md  -> html
pdf.mjs      html -> pdf   (headless Chromium, 1280x720 pages)
html/        generated — THE FOLDER YOU PUBLISH
  index.html     the chapter launcher, with a PDF download button per chapter
  chNN_*.html    one self-contained deck per chapter
  pdf/           one PDF per chapter, linked from the launcher
```

## Use

```bash
npm install --workspaces=false     # once
node build.mjs ch08                # rebuild one chapter (ch00, ch01, ch08 exist)
node build.mjs --all               # rebuild everything, and html/index.html
node build.mjs --all --linked      # dev build: reference deck/ instead of inlining
node pdf.mjs  --all                # export the PDFs into html/pdf/
open html/index.html               # pick a chapter, or download its PDF
```

In the deck: `→`/space next reveal, `←` back, `↑ ↓` skip a slide, `M` index, `P` save as PDF,
`F` fullscreen, `?` key help.

## Giving it to students

Publish the whole `html/` folder — anywhere that serves static files. It contains the launcher, the
fourteen decks and the PDFs, and nothing outside it is needed. On the launcher each chapter has a
**PDF** button that saves that chapter's slides; served over http the file arrives named
`IE437-08-Value-Based-Reinforcement-Learning.pdf`, and opened straight off a disk it keeps its raw
filename instead, because browsers ignore a download name on `file://` URLs.

## One file per chapter

Each `html/chNN_*.html` is a complete, independent deck: the stylesheet, the engine, its
widgets, KaTeX and the display faces are all inlined. Copy one file anywhere — a USB stick,
an LMS upload, an email attachment — and it opens and runs with **no network and no sibling
folder**. `html/index.html` is a launcher listing every chapter.

Run `node vendor-fonts.mjs` once if `deck/fonts/` is ever missing; it fetches the latin
subsets of Inter, IBM Plex Mono and Source Serif 4 so nothing has to be downloaded at
presentation time.

## Editing a lecture

Change `md/chNN_*.md` only, then rebuild. Design changes belong in `deck/`; anything written
into `html/` by hand is lost on the next build. See [md/_SCHEMA.md](md/_SCHEMA.md).
