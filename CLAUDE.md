# CLAUDE.md — IE437 lecture-notes repository

Read this first on any machine. It is the hand-over from the computer where these decks were
authored (August–October 2026) and the standing rules for working here. The professor writes to
you in Korean; everything in the repository and on the site is English.

## What this is

Interactive HTML lecture decks for **IE437 · Data-Driven Decision Making and Control** (KAIST,
autumn 2026): fourteen chapters generated from `md/`, a landing page with notices and a syllabus,
and the student packages for Assignment 1 and the midterm project. Everything students see is
built by CI from this repository and served at **https://omeletjk.github.io/ie437/**.

Repository: **https://github.com/omeletJK/ie437** — public. Students can read every file here.

```
md/chNN_*.md              one chapter each — THE source of truth; edit here, never in html/
md/_SITE.md _SYLLABUS.md  landing page copy and the practical facts (grading weights must sum to 100)
md/_ANNOUNCEMENTS.md      the notices — the file edited most often
md/_ASSIGNMENTS.md        the catalogue of student packages (ordinary assignments and `kind: midterm`)
md/_SCHEMA.md             the markdown schema and the widget contract
md/_AGENT_BRIEF.md        brief for an agent building a chapter; md/_CHAIN.md is the handoff chain
teaching/<id>/student/    the files a package publishes (English); teaching/<id>/instructor/ is gitignored
deck/                     the shared engine: deck.js, deck.css, site.css, widgets/, katex/, fonts/
assets/chNN/              figures and clips a chapter embeds
build.mjs                 md -> html -> pdf -> launcher;  site.mjs: landing page alone
tests/                    assignments, worked-examples (run in CI), and authoring audits
docs/agent-notes/         the authoring decisions and the professor's slide feedback — read before touching a deck
```

## Read next, in this order

1. `README.md` — how the build works, posting a notice, assignment materials, publishing.
2. `docs/agent-notes/README.md` — the index of decisions. The seven *feedback* notes say how the
   professor wants slides to teach; they override your own taste.
3. `md/_SCHEMA.md`, then `md/_AGENT_BRIEF.md` and `md/_CHAIN.md` when you work on a chapter.

## Standing rules

- **Commit and push only when the professor asks.** A push to `main` that touches sources
  redeploys the public site.
- **No student data, ever.** Names, grades, submissions and grading notes never enter this
  repository, not even in a commit message. `teaching/*/instructor/` is gitignored on purpose;
  hidden grading points stay out of `student/` files. The professor keeps all grading material
  outside the repository.
- `md/` is the single source of truth. `html/` is generated and ignored; a hand edit there is lost
  on the next build.
- Shared engine files (`deck/deck.js`, `deck/deck.css`, `build.mjs`, `site.mjs`, `pdf.mjs`) change
  rarely and deliberately. `site.mjs` slices the `IE437` helper block out of `deck.js` behind a
  throwing assertion, so restructuring the widget-registry section of `deck.js` breaks the landing
  page build loudly — that is intended.
- Slides: English, British spelling, prose over bullet fragments, no exclamation marks. A slide is
  a picture plus one key sentence; algebra goes to an appendix slide and numbers to the presenter
  note. Label every formula block with what it is and where it is used. Related slides share one
  figure format. Cite a paper only when it carries a step of the argument. All of this is spelled
  out with its history in `docs/agent-notes/`.
- `.gitignore` trap: a trailing comment on a pattern line becomes part of the pattern and silently
  ignores nothing. Comments go on their own line.
- Scratch scripts and screenshots stay outside the repository (or as `_*.mjs` at the root, which
  is ignored). Never commit them.

## Git identity — set this on every fresh clone

```bash
git config user.email 214766328+omeletJK@users.noreply.github.com
```

GitHub's "block command-line pushes that expose my email" is on for this account and stays on. A
push whose newest commit carries the private address is rejected with GH007. The noreply address is
the intended companion of that setting, set **repo-locally**; do not change the global config and do
not "fix" it back. If a push fails with GH007, check `git log -1 --format=%ae`, rewrite only the
unpushed commits' author, and push again. See `docs/agent-notes/git-identity.md`.

## Daily workflow

```bash
npm install --workspaces=false       # once per machine (Node 20+; CI uses 20)
node build.mjs ch05 --no-pdf         # rebuild one chapter while iterating on prose
node build.mjs ch05                  # same, plus its PDF (needs a Chromium, see below)
node build.mjs --all                 # everything, including html/index.html
node site.mjs                        # landing page only — after a notice or a catalogue change
npm run test:assignments             # package allowlist, ZIPs, downloads (CI runs this too)
npm run test:worked-examples         # public worked-example hashes and links
```

Preview: `.claude/launch.json` defines `html`, a Python static server on port 8437 serving `html/`.

**Visual pass.** The build cannot see an overflowing slide. Before calling a chapter finished,
walk its slides in a headless browser and check two things per slide: nothing runs past the footer
and no two consecutive blocks overlap (`fill.scrollHeight > fill.clientHeight`, or overlapping
sibling rectangles). Playwright's own Chromium is not downloaded by `npm install`; either run
`npx playwright install chromium` once, or launch with `chromium.launch({ channel: 'chrome' })`
against an installed Google Chrome. See `docs/agent-notes/qa-visual-pass.md`.

## Publishing

- A push to `main` that touches `md/`, `deck/`, `assets/`, `teaching/**/student/**`, the build
  scripts or the tests runs `.github/workflows/pages.yml`: `npm ci`, Chromium, `node build.mjs
  --all`, both test suites, then deploy. About two to three minutes.
- A push that touches only `README.md`, `CLAUDE.md` or `docs/` does **not** redeploy. If a rebuild
  is wanted anyway: `gh workflow run pages.yml`.
- Verify with `gh run list --workflow pages.yml -L 1`, then fetch the site and look for a string
  unique to the change; the CDN can lag by a minute or two.
- Posting a notice: add a `## YYYY-MM-DD · Title` entry to `md/_ANNOUNCEMENTS.md`
  (`{pin}` on the next line holds it at the top), run `node site.mjs` to see it, commit, push.
- Changing a package: edit `teaching/<id>/student/*.md`, keep `md/_ASSIGNMENTS.md` in step
  (quoted `due` with timezone), run `npm run site && npm run test:assignments`, commit, push.
  Change a deadline in both the catalogue and the brief.

## Where the course stands (2026-10-25)

- All fourteen decks are built (Ch 0–12 plus the probability appendix). Ch 0 carries the source
  deck's figures and clips; Ch 4 ends on the three walls of BO with the lab's papers (2026-10-07);
  Ch 5–6 were rewritten as problem → research streams with representative papers (2026-10-13).
  Other chapters are still figure-free; re-authoring them from their source decks needs the original
  PDFs, which are not in the repository.
- Assignment 1 (Movie Programming, due 2026-10-09) is closed and graded. Nothing of the grading
  is here; do not look for it.
- The **midterm project** (30%, v2.2) was released 2026-10-19 and is **due Mon 2026-11-02 10:00
  KST**, one ZIP per student on KLMS. Package: `teaching/midterm-depot-network/student/`; it has its
  own Midterm section on the site and a pinned notice. Any answer to a student question that changes
  the brief is published as a new version under Notices. A mid-point checkpoint was discussed and
  not decided. See `docs/agent-notes/midterm-project.md`.

## Deliberately not in this repository

`teaching/*/instructor/` (grading guides, preparation notes, dry-runs, all grading), student
submissions, `lecture_slides/` (the original lecture PDFs, 54 MB), `pptx/` (62 MB), `html/`
(generated), `_*.mjs` scratch scripts. The professor keeps these separately. On a new machine
assume none of them is present until told otherwise; everything on the site builds from this
repository alone.

## Setting up on a new machine

```bash
git clone https://github.com/omeletJK/ie437.git ~/Teachings/ie437
cd ~/Teachings/ie437
git config user.email 214766328+omeletJK@users.noreply.github.com
npm install --workspaces=false
node build.mjs --all --no-pdf && node site.mjs      # html/ appears; open html/index.html
```

Then read this file, `docs/agent-notes/README.md` and `README.md`, check `git status` is clean and
`main` matches `origin/main`, and report where the course stands before taking instructions.
