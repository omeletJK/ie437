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

Widgets carry no navigation buttons: the same `→` that opens a bullet walks a diagram through its
steps, `↓` then `↑` puts a widget back to its starting state, and a simulator **starts itself** when
you reach its slide. Parameters are dragged on a slider rather than clicked up one notch at a time.
Each Act closes with a one-question check; answering it marks the answer and opens the reason, and
the PDF prints every quiz as an answer key.

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
`main` that touches `md/`, `deck/`, `assets/`, student assignment sources or the build scripts, and deploys `html/` to GitHub
Pages. Enable it once under **Settings → Pages → Source: GitHub Actions**. Nothing generated needs
to be committed — the workflow rebuilds it from `md/`.

## Giving it to students

Publish the whole `html/` folder — anywhere that serves static files. It contains the launcher, the
fourteen decks, the PDFs and student assignment downloads, and nothing outside it is needed. On the launcher each chapter has a
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

## Assignment materials

The landing page lists assignments under **Assignments**, with a complete ZIP and individual Markdown downloads. Assignment 1 is maintained in [teaching/assignment-01-movie-programming](teaching/assignment-01-movie-programming/README.md).

To add or update an assignment:

1. Edit the documents in `teaching/<id>/student/`.
2. Add its entry to [md/_ASSIGNMENTS.md](md/_ASSIGNMENTS.md), listing the public filenames and labels in display order. Set a quoted `due` value with a timezone when confirmed; otherwise the page shows “To be announced.”
3. Run `npm run site` and `npm run test:assignments`. The publisher copies only the listed student documents to `html/assignments/<id>/` and rebuilds their ZIP from the current sources.
4. Push to `main` to build, verify and deploy through GitHub Pages. Deploy the entire `html/` directory when using another static host.

Instructor notes remain local and are excluded from Git. Neither the teaching directory nor a previously prepared ZIP is copied into the public output. Missing files, invalid paths and symlinks fail the build; removing a catalog entry also removes its old downloads on the next build. Generated ZIPs have stable filenames so shared download links continue to work after an update.

`npm run test:assignments` checks archive contents and freshness, the public file boundary, desktop/mobile layout, keyboard navigation, and real HTTP downloads under a repository subpath. To repeat the browser checks against Pages after deploying, run `IE437_SITE_URL=https://omeletjk.github.io/ie437/ node tests/assignment-browser.mjs`.

## Public worked examples

Release 1.5 provides two English worked examples and one app per case. Case A now follows Import planning data → Objective & constraints → Run optimization → Review results, using a dark sidebar, light workspace and fixed action bar like Case B. The original anonymized 44-slide Response and 59-slide Audience proposal files, including their byte-identical compatibility copies, are unchanged from 1.4.

Case A's aggregate Response app parses complete planning JSON or a five-column timetable CSV, validates it, reviews/configures its rules and runs ILS from the actual uploaded reference without a hidden presolve. Opening/closing, cleaning, coverage, per-site film caps, response scale, search budget and seed are used. Results expose reference/best/gain, site/film totals, timetables and exports. The old film exchange is a collapsed optional Results experiment. The current development sample gives 4,969 → 5,247, +278, 1,742 evaluations, 2,600 iterations, PASS and 89 best screenings; do not reuse 1.4's 5,302 result. Coefficients are explicit assumptions, not fitted purchase-record effects; no individual consumers, learned response model or BO are implemented.

Public `response/CinemaPlanning.json` and `response/Screenings.csv` add two planning assets, bringing the allowlist to 29 files. The supported 2 MiB schema has six films A–F, six sites A–F, three screens/site and 18–600 complete rows, subject to operating, room, cleaning, coverage and supply constraints. CSV requires showing_id,site_id,screen_id,film_id,start_time and uses the active package or explicit classroom definitions. Rich planning inputs are separately assumed/requested, not inferred from the six teaching purchase fields. The pure importer passed 25 independent checks and the exact app passed 39/39 Node checks. Real JSON/CSV uploads and scale/seed/budget/invalid-input effects were observed; the earlier configuration/error cases retain their metadata-only boundary. Fresh exact-final JSON and five-column CSV downloads were audited, including 90 input/89 best rows, settings/factors and the 5,246.789 → 5,247 total. The downloaded 89-row five-column CSV passed the Node importer and actual final-browser reimport at baseline 5,247. The final exact app passed default Run–Pause–Finish at 5,247 / 1,742 evaluations / 2,600 iterations / 89 rows / PASS; responsive Import/Results at 390 pixels kept body width 390 and dialog width 356, then restored desktop.

Case B's movie-first M0 app remains byte-identical to the archived 1.4 build, preserving its earlier synthetic workflow observations. Its profile/choice/seat evaluator differs from Case A's screening-level expected-attendance formula; different fixtures, horizons and units prevent ranking the strategies by scores. No real customer effect or global optimum is established.

The hub and reading views retain course portal CSS and three embedded font families. Persistent All worked examples links return to the package index. The 29-file catalog includes both per-case guides and planning samples; notices retain 11 libraries. The complete 1.4 snapshot, older apps, authoring material, grading notes and actual student work remain outside publication.

The catalog in `md/_WORKED_EXAMPLES.md` stages only reviewed files under `teaching/assignment-01-model-answer/student/` and publishes to `html/worked-examples/assignment-01-model-answer/`. Release 1.5 29-file assembly, approved staging/site build, worked-example and assignment tests passed on the staged assembly. Fresh course-prefix CUA reproduced 4,969 → 5,247 / 1,742 evaluations / 2,600 iterations / 89 rows / PASS; app, Response guide and original proposal returned to the hub. Course portal → Assignment 1 → Open worked examples → hub passed, and the refreshed hub showed the new Import copy. Public verification records identify the executed checks. Past release passes do not verify this new workflow. Direct offline execution remains unverified; the preserved Case B workflow is not freshly repeated. No commit, push or public deployment is asserted, and unrelated lecture changes are preserved.
