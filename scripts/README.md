# Studio project-page link audit

This is a small, dependency-free regression check for rebuild issue #6. It protects existing case-study navigation and references to approved media without editing any artwork, homepage markup or production settings.

Run from the repository root with Node.js 18 or newer:

```sh
node --test scripts/audit-project-links.test.mjs
node scripts/audit-project-links.mjs
```

The audit scans HTML under `work/`, `calendars/`, `daily/` and `case-studies/`. It resolves local quoted `href`, `src` and `poster` attributes against the repository, including relative directory links and query strings. Missing targets are printed with their referring page, and the command exits nonzero.

It deliberately ignores external URLs, inline data URLs and fragment-only links. It does **not** validate dynamically constructed URLs, CSS `url(...)`, `srcset`, visual crop placement, keyboard interactions, responsive layout or print output. Those require separate browser and visual QA before any rebuild PR is merged.

The current default-branch source inventory was checked on 28 October 2026: 14 HTML pages in these folders and no missing local `href`/`src` targets. That remote source check is not a substitute for executing the committed audit against a checked-out repository.
