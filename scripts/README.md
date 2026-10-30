# Studio project-page link audit

This dependency-free regression check supports rebuild issue #6. It checks static project navigation and media references without editing approved artwork, the homepage, or production settings.

Run from the repository root with Node.js 18 or newer:

```sh
node --test scripts/audit-project-links.test.mjs
node scripts/audit-project-links.mjs
```

The audit scans HTML and CSS under `work/`, `projects/`, `collections/`, `pitch-decks/`, `calendars/`, `daily/` and `case-studies/`, plus the root `index.html` and shared `studio.css` when present. Root-page inspection is read-only: the homepage itself is never edited. It resolves quoted HTML `href`, `src`, `poster` and standard comma-separated `srcset` references; inline `<style>` blocks, `style` attributes and CSS `url(...)` and quoted `@import` references; relative directory links; URL-encoded names; and query strings. CSS asset paths are resolved against the stylesheet, not the HTML document. Missing local files are reported with their referring page or stylesheet, and the command exits nonzero.

External URLs, inline data URLs, and fragment-only links are ignored. To avoid false positives, a `srcset` containing a data URI is skipped entirely. This is a **static source audit**, not a full HTML/CSS parser: it does not check JavaScript-generated URLs, other shared stylesheets outside the scoped directories, HTML fragment targets, or asset visual correctness. Browser QA is still required for crop placement, keyboard interaction, responsive layout, motion and print output.

The original default-branch source inventory (28 October 2026) covered 14 HTML pages. The first full-checkout GitHub Actions audit succeeded on 28 October 2026 for commit `87f21663ee1755bb2e8b49e76166342f5b4e0ab7` before the scope was expanded. The extended scan must pass its own full-checkout CI run before review; fixture tests alone cannot establish the status of all project assets.
