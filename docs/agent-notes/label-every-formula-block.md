# Label every formula block

*A formula block under a panel must say what it is and where it is used; the professor read an unlabelled L_opt block on the COMs algorithm slide as \"an interpretation from another viewpoint\" and asked for easy, intuitive explanations to be displayed*

On the Ch 5 slide "COMs as an algorithm" (2026-10-13) the bottom block — the trust-region objective $L_{\text{opt}}$ with its second-order expansion and a "trust region" paragraph — sat under the two pseudocode columns with nothing saying it *defines the `L_opt` in Algorithm 2*. The professor asked whether it was "a different-viewpoint interpretation" and said easy, intuitive explanations should be shown and explained.

**Why:** the professor lectures from the slide; a block whose role is not stated cannot be narrated, however correct it is.

**How to apply:** every display formula that follows a panel gets (1) a label or annotation tying it to the panel (`← L_opt: f̂ with a brake, next slide` inside the pseudocode), (2) underbraces in plain words ("what the surrogate says here" / "what it promises one trial step up"), and (3) a sketch or widget showing the mechanism before any second-order expansion. The fix here was a new slide "The brake — what Algorithm 2 climbs" with the `lookahead-brake` widget (flat point → steep point → the curve the search climbs). Related: [examples-as-pictures](examples-as-pictures.md), [one-figure-format-per-story](one-figure-format-per-story.md).
