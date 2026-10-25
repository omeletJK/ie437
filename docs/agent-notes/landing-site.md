# IE437 distribution site

*IE437 distribution site — the four landing-page decisions and what is left before it is live*

Decided 2026-08-31 for the public distribution site in this repo (see
[html-lecture-notes-plan](html-lecture-notes-plan.md)):

1. **English throughout** — matches the decks and the sibling `ie437-platform` landing.
2. **The `ie437-platform` identity, not its code** — pale paper `#F4F3EE`, teal `#0F6E56`,
   Space Grotesk display. Composition borrowed from `app/page.tsx`; React/Next deliberately
   not brought over, since the slides repo is a zero-dependency static generator.
3. **GitHub Pages, fully public** — built in CI, not committed.
4. **One page, no tabs** — hero → the course → notices → materials.

Structurally: the landing page generator is **`site.mjs`, a separate entry point** from
`build.mjs`, so posting a notice (`md/_ANNOUNCEMENTS.md` → `node site.mjs`) never means
rebuilding fourteen decks. The hero's map reuses `deck/widgets/course-cube.js` by slicing the
`IE437` helper block out of `deck.js` at build time — that slice is guarded by a throwing
assertion, so **restructuring `deck.js`'s widget-registry section will break `site.mjs` loudly**.

**Why:** the professor edits markdown and pushes; nothing about the site may require touching
generated HTML or a database.

**Deployed 2026-08-31.** Repo **https://github.com/omeletJK/ie437** (public, gh account
`omeletJK`), site **https://omeletjk.github.io/ie437/**, Pages served from the
`.github/workflows/pages.yml` Actions build — never from committed output.

`build.mjs` now chains **html -> pdf -> launcher** in one command, and only rewrites a file
whose bytes actually changed; that is what makes the PDF skip work and what ended fourteen
phantom diffs per build. A no-op build is under a second. `site.mjs` names any chapter whose
PDF is older than its deck.

Ignored from the repo but kept by the professor: `lecture_slides/` (54 MB), `pptx/` (62 MB);
generated and ignored: `html/`, `node_modules/`. **Watch the .gitignore trailing-comment
trap** — a comment on a pattern line becomes part of the pattern and silently ignores
nothing; it bit this repo twice.
