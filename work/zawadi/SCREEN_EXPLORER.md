# Zawadi screen explorer (draft enhancement)

**Status:** In review, not approved for publication.  
**Scope:** `work/zawadi/` only. Related to Studio rebuild issue #6.

The existing Zawadi page is a **fictional fintech brand and 28-screen product design study**. It is not a banking service. This enhancement makes the existing mockups easier to inspect without recreating or changing any original screen design.

## What is functional

- Each of the 28 existing screen cards gets a **View screen** button when JavaScript is available.
- A native modal displays a larger, scrollable copy of that screen, its existing caption and its place in the sequence.
- Previous/Next buttons and left/right arrow keys navigate between screens, with safe first/last boundaries.
- A labeled **Jump to screen** selector lists all 28 original screen titles, so visitors can go directly to a particular design without 27 repeated clicks. The selector stays synchronized with buttons and arrow navigation and retains native keyboard behavior.
- Escape and the Close button dismiss the dialog, returning keyboard focus to the originating screen.
- **Open shareable screen link** opens the selected original design in a new tab using `?screen=1` through `?screen=28`. **Copy screen link** copies the currently displayed design's direct URL to the clipboard, announces success in a live status, and gives a usable fallback instruction when clipboard permission is unavailable. Feedback resets when a different screen is selected. Direct links open that screen in the viewer when JavaScript and native dialogs are available; closing returns focus to its corresponding gallery button. Invalid query values leave the ordinary gallery visible. Without JavaScript, the page still presents all 28 screens rather than a broken modal.
- The original gallery remains fully readable with JavaScript disabled or in browsers without `dialog.showModal()`.

The phone screens remain **visual prototypes**; tapping a simulated payment control does not transfer money, sign into a bank or create a real transaction. This enhancement is a presentation viewer, not an implemented banking app.

## Files

- `index.html`: adds references to the enhancement CSS and JavaScript, without modifying original screen/card markup.
- `viewer.css`: scoped styling for accessible buttons and the responsive modal.
- `viewer.js`: progressive enhancement and focus-safe keyboard navigation.
- `viewer.test.mjs`: Chromium checks at 320px, 375px and 1280px.
- `.github/workflows/zawadi-screen-explorer.yml`: PR-only automated checks and temporary screenshot evidence.

## Local verification

Run `node --check work/zawadi/viewer.js` for syntax validation. With Node 22 and Playwright 1.56.0 installed, run `node --test work/zawadi/viewer.test.mjs` after installing Chromium with `npx playwright install chromium`.

## Review gates

1. Check the exact 28 original screens and approved branding against the source page.
2. Review the 320px, 375px and desktop screenshots from the CI artifact.
3. Test real touch, keyboard and a screen reader on a physical device/browser.
4. Confirm that the concept's simulated financial controls remain clearly fictional.
5. Obtain explicit owner approval before merging or deploying.

No homepage, gallery index, approved artwork, production deployment or unrelated repository is changed by this draft.
