# Studio R4: release-review gates and evidence ledger

**Status:** draft QA handoff, 3 November 2026. **Tracking:** issue #6. **Scope:** existing Studio project pages only. This document does not approve a merge or publication.

## Why this exists

The presentation inventory in `coordination/STUDIO-WEBSITE-PRESENTATION-AUDIT.md` records thirteen source-grounded Studio presentations, while issue #6 still requires cross-project navigation, mobile, accessibility, loading and regression review. Automated checks and browser screenshots are useful evidence, but neither constitutes a completed human visual review. This ledger makes the remaining release decision explicit rather than treating green CI as design approval.

## Required review evidence

For each changed experience, record the exact commit SHA, preview URL or local test command, desktop and mobile screenshot references, browser/viewport, keyboard result, relevant screen-reader result, and reviewer decision. A checkbox is **not** proof until its evidence link is supplied. Never substitute a GitHub source URL for a working preview.

| Gate | What to verify | Acceptance evidence | Current result |
| --- | --- | --- | --- |
| Original artwork | Compare the changed page with the approved originals and `APPROVALS.md`; reject replacement artwork or invented assets | Before/after capture with original asset paths | Not reviewed |
| Homepage preservation | Verify `index.html` and the gallery presentation are unchanged by the proposed PR | PR changed-files list | Not reviewed |
| Navigation | Visit project entry, gallery, detail, demonstration, and return links; test anchors and browser Back | Route-by-route pass log | Not reviewed |
| Mobile composition | Test 320px, 390px, 820px and 1440px; check overflow, cropping, text hierarchy, touch targets and device-frame legibility | Four viewport captures per changed project | Not reviewed |
| Keyboard | Tab through controls; activate with Enter/Space; verify visible focus, escape/close and focus restoration | Keyboard journey notes | Not reviewed |
| Screen reader | Check control names, headings, image alternatives, status announcements and dialog semantics | Named browser/reader and results | Not reviewed |
| Media/loading | Check actual MP4 playback where relevant, missing-image fallbacks, loading errors and reduced-motion preferences | Browser console/network notes | Not reviewed |
| Demo truthfulness | Confirm fictional bookings, transactions and shipment data are clearly labelled; no real integrations implied | Screenshot of labels and tested journey | Not reviewed |
| Print/export | For posters/calendars, verify page size, margins, clipping, and legibility in actual print preview | PDF proof and print-preview notes | Not reviewed |
| Release | Confirm CI passes on the exact review head, then obtain explicit approval before merge or production change | Workflow URLs and approval record | Not approved |

## Project-specific sampling matrix

| Work | High-value review journey | Particular risk |
| --- | --- | --- |
| ZEBRA | Browse catalogue → product → cart/demo → return | Approved campaign identity and real storefront |
| ONE | Navigate Deep Navy dashboard views and responsive states | Nonfunctional screen facsimiles |
| Deep Ink | Open both original artwork presentations and play both MP4s | Accidental replacement with simplified 3D |
| Vinyl Lounge | Read original illustration and view restrained record animation | Motion obscuring approved composition |
| Lemon Sun | Open main artwork and separate editorial companion | Conflating two approved pieces |
| Poster Studies | Navigate all eight original posters; inspect print | Missing event text or altered originals |
| ROOTS / Atlas / Editorial 2027 | Switch months, verify 2027 date grid, print A4 | Date offsets and clipped print layouts |
| Childfree | Filter nine pins, open/close details, keyboard and no-JS browsing | Hidden controls, focus loss, missing original pins |
| Zawadi | Inspect responsive concept pages and navigation | Claiming a working banking integration |
| STOCKWISE | Create invoice → update inventory → reload/reset | Demo state persistence and misleading real-data claims |
| VELA HEALTH | Select slot → book → cancel with keyboard | Focus loss and misleading clinician imagery |
| MOVA | Create fictional shipment → dispatch → deliver | Fictional tracking presented as real |
| CHERRY RIOT / Hotel Nocturne | Browse original demos and complete simulated flows | Dead ends and visual regressions |

## Triage and sign-off

1. **Block release:** missing approved artwork, broken primary journey, inaccessible core action, security/privacy leak, or changed homepage without approval.
2. **Fix before approval:** mobile overflow, unreadable type, broken secondary navigation, lost focus, misleading demonstration labels, failed print export.
3. **Record for later:** minor polish that does not compromise the original concept or usability.
4. Open a focused issue/PR for each confirmed defect, attach a reproducible route and viewport, and avoid mixing unrelated redesigns into a QA patch.
5. Keep all PRs in draft until evidence and explicit review exist. Passing CI is necessary but insufficient; a successful Vercel status does not by itself prove a production deployment.

**Known boundaries:** This is a review plan, not a claim that manual browser, physical-device, screen-reader or print checks have happened. No artwork, project page or production route is modified by this document.
