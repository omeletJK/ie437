# IE437 git identity: noreply address

*This repo commits as the GitHub noreply address on purpose — the account blocks pushes that expose the private email; never switch it back*

Since 2026-09-09 this repo has a **repo-local** `user.email` of
`214766328+omeletJK@users.noreply.github.com`. The global git config still holds
the professor's private address, and that is deliberate.

**Why:** the professor keeps GitHub's "Block command line pushes that expose my email"
switched **on** for security across other projects and explicitly declined to turn it off.
A push whose newest commit carries the private address is rejected with GH007. The
noreply address is GitHub's intended companion to that setting, not a workaround.

**How to apply:** commit normally — the local config does the rest. Do not "fix" the
local `user.email` back to the private address, and do not touch the global config. If a
push ever fails with GH007 again, check `git log -1 --format=%ae`: some other session may
have committed with the private address; rewrite only the unpushed commits' author to the
noreply address (`git rebase origin/main --exec "git commit --amend --no-edit --author=..."`)
and push. Older published commits still carry the private address in the public history;
rewriting those is the professor's call and has not been asked for.

Deploy path, for reference: push to `main` → `.github/workflows/pages.yml` → about 1.5 min →
https://omeletjk.github.io/ie437/ . Verify with a curl for a string unique to the change,
allowing a few tries for CDN propagation. See [landing-site](landing-site.md).
