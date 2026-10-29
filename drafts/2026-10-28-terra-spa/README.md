# TERRA Spa | Daily UI/UX study (draft)

**Status:** Draft for owner review. **Date:** 28 October 2026. **Queue:** Day 1, product UI/UX, spa management dashboard / calendar / booking.

## Concept
A quiet, editorial operations workspace for a boutique spa. The interface makes the next appointment and the shape of the day easy to understand without turning a calm service business into a cluttered analytics dashboard.

## What is actually implemented
- Responsive desktop, tablet and mobile layout with a weekly date picker and previous/next/today controls.
- Appointment diary, guest/service search, booking details, completion and cancellation. Only booked appointments can be completed or cancelled; both outcomes are final and read-only in this fictional demo.
- New appointment form with service duration, 09:00–17:00 demo hours, overlap rejection, and live available-start-time choices. Unavailable times are disabled and the form explains when a day is fully booked.
- Selected-day counts, **scheduled value** (not revenue), completed bookings, and available one-hour slots.
- Service mix chart that updates as bookings change.
- Browser-only demo persistence; reset button restores fictional sample data. On reload, malformed records, duplicate booking IDs and overlapping active appointments invalidate the saved demo schedule, which safely resets to sample data.
- Native modal dialogs, keyboard-operable controls, visible focus styles, status messaging and reduced-motion support. The weekly date picker uses one Tab stop, arrow keys to move by day or week, and Home/End to jump within a week; focus follows the selected date even when crossing weeks.

## Design decisions
Warm paper, dark plum, muted rose and Georgia editorial headings distinguish TERRA from generic medical/booking software. No external images, paid fonts, stock imagery, third-party scripts in the delivered interface, or AI-generated art. Copy and UI label the product **fictional**. All data stays in the browser; no backend, payment, staff or customer accounts exist.

## Run and test
Open index.html in a modern browser, or serve the folder with any local static HTTP server. Use Node.js 22+ for deterministic logic tests:

    node --test drafts/2026-10-28-terra-spa/app.test.mjs

A separate **test-only** Chromium smoke check now exercises actual keyboard date navigation, available booking times, local persistence, completion focus, reset, dialog Escape handling, and mobile document overflow. It serves only the two draft files over a temporary local HTTP server and does not contact a backend or publish anything. To run it locally from the repository root:

    npm install --no-save --no-package-lock playwright@1.56.0
    npx playwright install chromium
    node --test drafts/2026-10-28-terra-spa/browser.test.mjs

The GitHub Actions draft workflow runs both the existing logic suite and the Chromium smoke test on pull requests. The browser test dependency is installed only in the CI/testing environment; it is not loaded by the delivered interface. Passing automated tests does **not** replace visual inspection on real desktop/mobile devices or screen-reader review.

## Review and publication gates
1. Review visual direction, layout, and the value of the concept in the Studio's Day 1 queue.
2. Review actual desktop/mobile presentation and assistive-technology behavior, including dialog behavior and narrow-width overflow.
3. Confirm no overlap with other Studio rebuild work before adding any gallery link.
4. **Do not merge, add to the homepage, or deploy to production without approval.** This is a self-contained draft, not a real spa product.

Related to the daily creative queue. Rebuild issues #3–#6 remain separate and are not claimed as complete.
