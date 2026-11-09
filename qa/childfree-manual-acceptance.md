# Childfree collection: manual acceptance protocol

Status: **not yet executed**. This is a reproducible review checklist for Studio rebuild issue #6, not a claim of accessibility certification or artwork approval.

## Before testing
- Open `work/childfree/index.html` on the proposed preview build, not production. Record preview URL, commit SHA, browser, OS, viewport and tester.
- Confirm the displayed nine images against the **exact approved originals**. The final concept-sheet PNG is still outstanding in `APPROVALS.md`; do not infer visual approval from existing WebP files.
- Use a real browser with JavaScript enabled. Repeat basic readability checks with JavaScript disabled. Do not substitute the Node DOM harness for browser testing.

## Keyboard-only, desktop
- [ ] Tab from the top of the page: every visible mood filter and pin detail trigger is reachable in a logical order; focus remains visible.
- [ ] Activate each of All, Whimsical, Chilled and Bold with Enter and Space. Check selected state, visible cards and announced live count (9, 3, 3, 3).
- [ ] Open the first and last visible pin with keyboard. Verify dialog label, readable content, initial focus, and no focus escape to the background.
- [ ] Navigate Previous/Next at boundaries; disabled controls cannot receive focus or activate. The position announcement remains correct after changing moods.
- [ ] Close with Escape and the Close control; focus returns to the triggering pin. Reopen a different pin after switching moods and verify focus returns to the **new** trigger.
- [ ] Click inside dialog content: it stays open. Click backdrop: it closes and focus returns to its trigger.

## Screen reader
- [ ] With NVDA + Firefox or VoiceOver + Safari, verify filter buttons announce names and pressed states.
- [ ] Verify the count update is announced without repeating unrelated content.
- [ ] Verify dialog name, modality, position status, Previous/Next names, disabled states, and focus restoration.
- [ ] Record exact screen-reader/browser versions and any unexpected announcement.

## Mobile and fallback
- [ ] At 320px, 375px and 768px widths: no horizontal page overflow, clipped labels, unreachable buttons or obscured dialog controls.
- [ ] At 200% browser zoom: content and dialog remain operable without two-dimensional scrolling except for images where necessary.
- [ ] Touch targets are usable; dialog content scrolls on short screens without scrolling the background unexpectedly.
- [ ] With JavaScript disabled or `HTMLDialogElement.showModal` unavailable, pin notes remain readable and inert detail buttons are not offered.

## Evidence and decision
Record each failed step with screenshot or short recording, viewport, browser, reproduction steps and proposed fix. Link findings to issue #6 and the relevant draft PR. **Do not mark the PR ready, merge, deploy, or mark artwork approved** until manual checks, original-asset comparison and review are complete.
