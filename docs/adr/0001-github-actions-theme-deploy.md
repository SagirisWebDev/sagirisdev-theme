# ADR 0001 — GitHub Actions deploy with snapshot-restore rollback

Date: 2026-05-25
Status: Accepted

## Context

The theme is built with Tailwind CSS v4 (`npm run style` -> `style.css`) and
webpack (`npm run build` -> `assets/js/dist/`). Until now, deploys to
sagirisdev.com were manual: rebuild locally, SFTP up. That meant prod
occasionally shipped with stale CSS/JS when someone forgot to rebuild before
copying, and there was no recovery path when a bad push broke the site.

A sibling repo (`nonprof01`) already uses GitHub Actions + `SamKirkland/web-deploy@v1`
to SFTP a theme to DreamHost on every push to `main`. That workflow has no
build step and no rollback — neither was needed for that simpler theme.

## Decision

Add a single `.github/workflows/deploy.yml` for sagirisdev-theme that:

1. **Builds in CI** (`npm ci`, `npm run build`, `npm run style`) instead of
   trusting committed build artifacts. `style.css` and `assets/js/dist/` are
   moved to `.gitignore`.
2. **Snapshots the live theme** before SFTP — SSHes in and `cp -a` the
   destination theme dir to `<dir>.bak`.
3. **SFTPs the new files** via the same `web-deploy@v1` action used by nonprof01.
4. **Smoke-tests the live site** with `curl https://sagirisdev.com/?cb=<run_id>`,
   asserting HTTP 200 and absence of WP's `There has been a critical error` /
   `Fatal error` strings. The cache-buster query string forces a fresh PHP
   render, so a fatal in the new code surfaces immediately.
5. **Rolls back on smoke-test failure** — SSHes in and swaps `<dir>.bak` back
   into place, then fails the workflow run (red status, GitHub email
   notification).
6. **Cleans up the snapshot on success**.

## Alternatives considered

**Re-deploy a previous commit from git on failure.** Rejected: requires
tracking a "last good SHA" out of band (workflow artifact, Deployment record,
or release tag), and a full rebuild + SFTP during which the site is broken
for 1-2 minutes. Snapshot-restore is seconds and atomic from the user's view.

**Versioned theme dirs + symlink swap.** Rejected: WordPress doesn't reliably
handle symlinked theme directories (plugins that use `__FILE__`-derived paths
break, caches get confused), and it would add first-time setup complexity.

**No rollback, just rely on git revert.** Rejected: leaves the site broken
until a human notices and pushes a revert.

**Trust committed build artifacts (skip CI build step).** Rejected: the whole
reason we want CI is to make "I forgot to rebuild" impossible.

**Add a manual `workflow_dispatch` rollback workflow.** Deferred. The current
auto-rollback only fires on detectable failures within the same run. If a
regression slips through the smoke test (e.g. a visual bug that still
returns 200), recovery is `git revert <bad-sha> && git push`. We can add a
manual rollback workflow later if that proves insufficient.

## Consequences

**Good:**
- One source of truth for builds (CI). Local `style.css`/dist drift no longer
  affects prod.
- Auto-recovery from PHP fatals and 5xx in deployed code.
- ~30-60s slower per deploy due to `npm ci` + builds. Acceptable for a theme
  that ships changes weekly, not hourly.

**Costs / risks:**
- Requires the DH user to have **SSH shell access** enabled (not SFTP-only),
  because `appleboy/ssh-action` runs `cp -a` / `mv` / `rm -rf` commands.
- The smoke test only catches HTTP-level failures and WP fatal strings. It
  does NOT catch: wrong content rendering, broken JS-only features, visual
  regressions, or 200 OK pages that contain a partial error message in a
  different language/wording.
- The snapshot doubles the theme's disk usage briefly during each deploy.
  For this theme (~few MB) that's negligible.
- A failed rollback (e.g. SSH connection drops mid-`mv`) could leave the
  theme dir in an inconsistent state. The workflow logs `::error::` and
  exits non-zero so this is visible, but manual SSH recovery would be needed.

## Required setup (one-time)

- Repo secret `SSH_KEY` on `SagirisWebDev/sagirisdev-theme` — private key
  paired with a public key in the DH user's `~/.ssh/authorized_keys`.
- Replace `REPLACE_ME_*` env values in `.github/workflows/deploy.yml` with
  the DH user, server hostname, and absolute theme path.
- Confirm the DH user has SSH shell access (DH panel -> Users -> Manage Users
  -> Shell, not SFTP-only).
- Run `git rm --cached style.css assets/js/dist/emblem.bundle.js` once so the
  newly-ignored files are dropped from tracking.
