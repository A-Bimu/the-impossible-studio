# SPLICE | Editable record sleeve lab

**Date:** 1 November 2026  
**Status:** Draft, awaiting the owner's visual and interaction review. Not approved, merged, or linked from the Studio homepage/daily journal.  
**Medium:** Original typographic record-sleeve study with real editable SVG export, built in HTML, CSS, and JavaScript.

## Idea and audience

What does a song look like before anyone hears it? SPLICE is a fictional independent-record design workbench for musicians and visual designers. It translates musical tension into three deliberately different, print-inspired compositions: **Collision** (overlapping circles), **Fold** (cut-paper geometry), and **Frequency** (rhythmic bars). It is not a music-streaming service.

## What is implemented

- Editable release title (36 characters) and artist name (28 characters).
- Three distinct original vector compositions and three colourways.
- A full-size sleeve preview and a separate mobile presentation mockup that both update with the same choices.
- A genuine downloadable **900 × 900 SVG** with editable shapes and live text, not a screenshot or raster-only export.
- Long release titles and artist names are constrained to the sleeve's typography area in both the live preview and downloaded SVG; ordinary short names retain their original lettering. This is a digital vector study, **not** a printer-certified bleed/CMYK package.
- Reset action, keyboard-operable controls, visible focus, pressed-state semantics, status messages, and a responsive narrow-screen layout.
- No external images, fonts, third-party libraries, accounts, storage, network calls, or paid services. No green palette. Input is XML-escaped before it enters SVG.

## Validation

Run from the repository root with Node.js 22 or later:

    node --test tests/splice-sleeve.test.mjs

The isolated pull-request workflow runs these checks. Automated source tests cover three compositions, safe text escaping, export wiring, and responsive markup. A second Chromium job exercises actual editing, SVG download contents, extreme-width text bounds, reset focus, and document overflow at 320px, 375px, and 768px. It captures desktop and mobile screenshots as the short-lived `splice-desktop-mobile-review` GitHub Actions artifact (seven-day retention). Run that browser check locally with `npm install --no-save --no-package-lock playwright@1.56.0`, `npx playwright install chromium`, then `node --test drafts/2026-11-01-splice/browser.test.mjs`. **Passing checks and screenshots do not establish visual approval or replace real-device, keyboard, or screen-reader testing.**

## Approval gate

1. Review the actual desktop editor, sleeve compositions, and mobile mockup.
2. Test the export in a browser and open the SVG in a vector editor.
3. Test keyboard and screen-reader behaviour, especially editor changes and the status region.
4. Only with explicit approval should this draft be added to the public daily journal or gallery. Do not merge or deploy it beforehand.

Existing homepage, approved artwork, and other projects are untouched.
