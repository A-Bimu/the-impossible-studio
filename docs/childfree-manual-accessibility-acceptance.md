# Childfree catalogue: manual accessibility acceptance record

**Scope:** Studio rebuild issue #6, draft PR #73. This is a **test protocol, not a passed acceptance report**. Record actual device/browser/assistive technology and observations before checking any item. Do not merge or deploy on the strength of automated CI alone.

## Test setup

- PR head SHA: ______
- Tester / date / timezone: ______
- Device / operating system: ______
- Browser and version: ______
- Screen reader and version (if used): ______
- Viewports: 320px, 390px, desktop (record exact width): ______
- Result for each scenario: PASS / FAIL / BLOCKED, with screenshot or recording and reproducible steps for failures.

## Keyboard-only matrix (repeat at each viewport)

1. Reload with JavaScript enabled. Tab from the page header to the mood controls; confirm focus is visible and matches reading order.
2. Activate **Bold**, then **All Nine** with keyboard only. Confirm 3 then 9 visible cards, accurate count, and exactly one selected mood announced or represented by `aria-pressed=true`.
3. Open the first pin detail with Enter or Space. Confirm the native dialog receives focus, its title and content are readable, and Tab/Shift+Tab cannot escape to background controls.
4. Page to the final pin and back. Confirm previous/next buttons disable at boundaries and focus does not remain stranded on a newly disabled button.
5. Close with Escape; confirm focus returns to the exact opening card's detail button. Repeat with the dialog close button.
6. Confirm no horizontal page overflow at 320px or 390px and no obscured controls at zoom 200% (record actual viewport after zoom).
7. Disable JavaScript and reload. Confirm all nine cards and descriptions remain available, while inert mood and detail controls are not offered.
8. With JavaScript enabled but native `showModal` unsupported (if a reproducible environment is available), confirm filters still work and disabled detail actions are not offered. Mark BLOCKED if this environment cannot be tested.

## Screen-reader acceptance

Run NVDA + a supported Windows browser **or** VoiceOver + Safari; record the exact pairing. Navigate by headings and buttons; confirm the collection heading, count, filter names and pressed states are announced. Open a pin and record whether the dialog role, title, current pin and paging status are announced intelligibly. Navigate within the dialog, change pin, close with Escape and with Close, and confirm the reader's virtual cursor/focus returns to the opener without exposing background content while the dialog is active.

## Evidence and release gate

Record each scenario's outcome, reproducible defects, browser screenshots or short recordings, and any assistive-technology-specific limitations in PR #73. CI success is separate evidence. Before changing draft status, also reconcile PRs #65/#69, verify the **exact approved** Childfree concept-sheet PNG (do not substitute generated artwork), and obtain explicit approval for merge/deployment. Preserve the Studio homepage and approved original media.
