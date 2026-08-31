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
  _SITE.md       the landing page: hero, course description, chapter grouping
  _SYLLABUS.md   the syllabus section: the people, the practical facts, the grading
  _ANNOUNCEMENTS.md   the notices on the landing page — the file you edit most
deck/        the shared engine, reused by every chapter
  deck.css       1280x720 stage, light/dark grounds, print rules
  site.css       the landing page's own stylesheet (paper + teal, not the deck's ink)
  decision-cube.js   the landing page's hero figure — the 3-axis cube, live
  deck.js        navigation, click-reveals, widget registry, print hooks
  katex/         vendored KaTeX (math is rendered at build time)
  widgets/       interactive simulators, one file per widget
build.mjs    md -> html -> pdf -> launcher.  One command does all of it:
             a rebuilt chapter re-exports its own PDF, so the download a
             student gets is never older than the deck they just read
site.mjs     md  -> html/index.html   (the landing page, on its own so a notice
                                       does not mean rebuilding fourteen decks)
pdf.mjs      html -> pdf   (headless Chromium, 1280x720; skips what is current)
html/        generated — THE FOLDER YOU PUBLISH
  index.html     the landing page: the course, the notices, every chapter
  chNN_*.html    one self-contained deck per chapter
  pdf/           one PDF per chapter, linked from the launcher
```

## Use

```bash
npm install --workspaces=false     # once
node build.mjs ch08                # rebuild one chapter (ch00, ch01, ch08 exist)
node build.mjs --all               # rebuild everything, and html/index.html
node build.mjs --all --linked      # dev build: reference deck/ instead of inlining
node build.mjs --all --no-pdf      # skip the PDF export while iterating on prose
node site.mjs                      # the landing page alone — after posting a notice
node pdf.mjs  --all                # PDFs only; --force re-exports current ones too
open html/index.html               # the landing page
```

In the deck: `→`/space next reveal, `←` back, `↑ ↓` skip a slide, `M` index, `P` save as PDF,
`F` fullscreen, `?` key help.

## The deck and its PDF are one deliverable

`node build.mjs` writes the decks, then re-exports the PDF of **every chapter whose HTML
actually changed**, then rewrites the launcher. Nothing else has to be remembered, and the
**PDF** button on the launcher can never hand a student yesterday's slides.

Two things make that cheap. A chapter whose output is byte-identical is not rewritten, so its
timestamp — and its PDF — stay put; and `pdf.mjs` re-exports only what is out of date. A build
with nothing to do takes under a second; one changed chapter costs about two more. If a PDF is
ever behind its deck, the launcher build says so by name.

```
$ node build.mjs --all
OK  ch08_value_based_rl.md  ->  html/ch08_value_based_rl.html   41 slides   widgets: …
PDF ch08_value_based_rl.html  ->  html/pdf/ch08_value_based_rl.pdf   41 pages, 1104 KB
    13 unchanged PDFs skipped
OK  index.html  ->  html/index.html   14 chapters, 596 slides, 1 notices, 14 current PDFs
```

## Posting a notice

Add an entry to [md/_ANNOUNCEMENTS.md](md/_ANNOUNCEMENTS.md) and push:

```markdown
## 2026-09-08 · No lecture on the 15th
Make-up session is Friday 18:00, same room. Slides for Chapter 3 are already up.
```

Newest first is automatic; anything from the last 14 days is badged **new**, and `{pin}` on the
line under the heading holds an entry at the top for good. Locally, `node site.mjs` redraws the
page in about a second — nothing else has to be rebuilt.

The course description and the hero copy live in [md/_SITE.md](md/_SITE.md). The practical facts —
who teaches it, when and where it meets, and how it is graded — live in
[md/_SYLLABUS.md](md/_SYLLABUS.md), which renders them as the page's **Syllabus** section; its
grading weights must sum to 100 or `site.mjs` refuses to build, because a syllabus that does not add
up is the one thing on the page nobody may read wrong. Delete the file and the section and its nav
entry simply disappear. The two-or-three-sentence description under each chapter is that chapter's
own `blurb:` field, so it stays beside the lecture it describes.

One trap when editing it: an unquoted `#` starts a YAML comment, so a room number has to be written
`"E2-1, #4212"` or it is silently truncated to `E2-1,`.

## Publishing

`.github/workflows/pages.yml` builds the decks, the PDFs and the landing page on every push to
`main` that touches `md/`, `deck/`, `assets/` or the build scripts, and deploys `html/` to GitHub
Pages. Enable it once under **Settings → Pages → Source: GitHub Actions**. Nothing generated needs
to be committed — the workflow rebuilds it from `md/`.

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
