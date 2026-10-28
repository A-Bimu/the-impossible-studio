# TERRA Spa | Daily UI/UX study (draft)

**Status:** Draft for owner review. **Date:** 28 October 2026. **Queue:** Day 1, product UI/UX, spa management dashboard / calendar / booking.

## Concept
A quiet, editorial operations workspace for a boutique spa. The interface makes the next appointment and the shape of the day easy to understand without turning a calm service business into a cluttered analytics dashboard.

## What is actually implemented
- Responsive desktop, tablet and mobile layout with a weekly date picker and previous/next/today controls.
- Appointment diary, guest/service search, booking details, completion and cancellation.
- New appointment form with service duration, 09:00–17:00 demo hours, and overlap rejection.
- Selected-day counts, **scheduled value** (not revenue), completed bookings, and available one-hour slots.
- Service mix chart that updates as bookings change.
- Browser-only demo persistence; reset button restores fictional sample data. On reload, malformed records, duplicate booking IDs and overlapping active appointments invalidate the saved demo schedule, which safely resets to sample data.
- Native modal dialogs, keyboard-operable controls, visible focus styles, status messaging and reduced-motion support. The weekly date picker uses one Tab stop, arrow keys to move by day or week, and Home/End to jump within a week; focus follows the selected date even when crossing weeks.

## Design decisions
Warm paper, dark plum, muted rose and Georgia editorial headings distinguish TERRA from generic medical/booking software. No external images, paid fonts, stock imagery, third-party scripts, or AI-generated art. Copy and UI label the product **fictional**. All data stays in the browser; no backend, payment, staff or customer accounts exist.

## Run and test
Open index.html in a modern browser, or serve the folder with any local static HTTP server. Use Node.js 22+ for the deterministic logic tests:

    node --test drafts/2026-10-28-terra-spa/app.test.mjs

The test suite covers week boundaries, calendar keyboard-date calculations, sample integrity, time overlaps, cancellation, closing hours, daily metrics and saved-schedule consistency (including duplicate IDs and conflicting appointments). Manual keyboard and screen-reader verification is still required.

## Review and publication gates
1. Review visual direction, layout, and the value of the concept in the Studio's Day 1 queue.
2. Perform actual desktop/mobile browser and keyboard/screen-reader checks; inspect dialog behavior and narrow-width overflow.
3. Confirm no overlap with other Studio rebuild work before adding any gallery link.
4. **Do not merge, add to the homepage, or deploy to production without approval.** This is a self-contained draft, not a real spa product.

Related to the daily creative queue. Rebuild issues #3–#6 remain separate and are not claimed as complete.
