# QA: the visual pass, and running it without Playwright's own browser

*The build cannot see an overflowing slide; what to check per slide, and how to get a browser when Playwright has not downloaded one.*

`npm install` installs the Playwright package but not its browsers, so `node pdf.mjs` and any
slide-walking QA script fail with "Executable doesn't exist" on a fresh machine. Two ways out: run
`npx playwright install chromium` once (about 150 MB), or keep the package and launch an installed
Google Chrome with `chromium.launch({ channel: 'chrome' })`. CI installs Chromium itself, so PDFs
are always exported on deploy; local PDFs are optional while iterating (`--no-pdf`).

The QA script used on the authoring machine (`_qa.mjs`, an ignored scratch file) walked every
slide of a built deck, took screenshots, and reported slides whose content ran past the footer plus
any JS errors. That check alone misses a real failure: a slide whose `.fill` is too tall shows up
as **overlapping blocks**, because flex children shrink rather than overflow, and "clearance to the
footer" then looks fine. The Ch 5 RoMA backup slide failed exactly this way on 2026-10-13 while QA
reported "overflowing: none".

**Why:** a deck is only finished when every slide has been seen; the build fails loudly on schema
errors but is blind to layout.

**How to apply:** build with `node build.mjs chNN --no-pdf`, then for each slide check (1) footer
clearance, (2) `fill.scrollHeight > fill.clientHeight`, and (3) overlap between consecutive sibling
blocks, and screenshot the slides you changed. Keep the script outside the repository or as
`_*.mjs` at the root, which is ignored. Related:
[html-lecture-notes-plan](html-lecture-notes-plan.md).
