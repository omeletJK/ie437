# One sentence, one line

*Text on a slide never breaks a sentence by accident: each sentence sits on its own line, and a sentence that does not fit is shortened*

On Ch 8 (2026-11-11) the professor sent two screenshots. The map's caption ran two sentences together and the wrap left the single word "many." on a second line; a keypoint held two sentences on one source line and the second one started mid-line and broke after "predict". The instruction: avoid a sentence that breaks at an arbitrary place when the line wraps; write one sentence per line; find every such case and fix it.

**Why:** the professor lectures from the slide and points at lines. A line that ends one sentence and begins the next has no single thing to point at, and a word stranded on its own line reads as a mistake. One sentence per line also makes the count of ideas on a slide visible at a glance. It is the general form of [one idea per line](one-idea-per-line.md).

**How to apply:**

- Since this change `build.mjs` renders every source line of a `::: lede`, a `::: small`, and the caption of a `::: widget`, `::: figure` or `::: video` as its own line (`mdLines`), exactly as `::: keypoint` always did. Write one sentence per source line. A block that contains `$$` is left as one run.
- Where the engine does not break for you, break explicitly: a trailing backslash (CommonMark hard break) in a body paragraph, a `::: col` or a closing slide; `<br>` in a `::: quiz` question, a table cell, a `::: paper` cell or a standout title. The slide menu strips the `<br>` from a title.
- A sentence longer than one line is rewritten until it fits, or split into two sentences. Rough capacities at 1280 px: widget caption 185 characters, `small` 155, keypoint 125, quiz question 108, figure caption 86, a `::: paper` cell 45 per line (a cell may run to three lines, but its last line must not be one or two words). Maths counts for less than its source length.
- Two short clauses that belong together may share a line when joined by a semicolon or a colon; two sentences may not. A bold run-in label ("**Bias:** none.") is a label, and its explanation goes on the next line.
- An algorithm step holds one action. A step that ends "…; take one gradient step on …" becomes two numbered steps.
- Extra lines cost height (about 25 px in a caption, 35 px in a keypoint). Run the visual pass afterwards; when a slide overflows, cut words from the caption or move a cue to the presenter note, do not shrink the picture.
- Checking: walk the built deck in a browser, read each text block's words with their line positions (`Range.getClientRects`), and flag a block where a sentence starts on a line it does not open, or a sentence whose last line holds one or two words. Ch 8 had 41 such blocks; all were fixed on 2026-11-11. The other chapters have not been reviewed for this.
