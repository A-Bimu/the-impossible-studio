# A Little Room for Error

**Status:** Draft for visual review, 2 November 2026. Not approved, not linked from the Studio homepage, and not deployed to production.

## Idea and medium

An interactive typographic broadside about making space for imperfection. Traditional two-colour print registration can drift; this digital experiment treats that slight offset as the subject rather than hiding it. The poster is constructed with real HTML text and CSS ink layers, not a screenshot, an AI illustration, or a claim of physical screen-printing.

**Audience:** design enthusiasts, printmakers, editorial designers and visitors to The Impossible Studio.

## Art direction

- **Visual focus:** one oversized three-line phrase, deliberately irregular line offsets, a simple registration stamp, and restrained production notation.
- **Materials:** fluorescent-yellow digital paper, cobalt-blue primary ink, and vermilion secondary ink. No external images, font CDNs, stock photography, or paid services.
- **Interaction:** two accessible range inputs control misregistration (0–24px) and second-ink opacity (0–100%). Reset restores the original impression. Print opens the browser's print dialog with an A4 portrait stylesheet. Without JavaScript, the original poster stays visible, inactive controls are hidden, and a fallback note explains browser printing.
- **Why this medium:** the visitor can experience how the same type composition changes when two impressions stop aligning. Motion is unnecessary.
- **Originality:** all typography and layout are code-authored for this draft. It does not replace or modify any approved Studio artwork.

## Review and testing

Open `index.html` locally. Review at 1440px, 820px, 390px and 320px; verify slider keyboard control, focus visibility, reset, print preview, and ink colours with print background graphics enabled. Run:

```sh
node --test tests/room-for-error.test.mjs
```

The draft PR also runs Chromium checks at 1440px, 820px, 390px and 320px, including keyboard slider control, reset, print invocation, text clipping and horizontal overflow. A no-JavaScript pass verifies the static poster and fallback message. The browser workflow archives responsive screenshots and a genuine A4 PDF proof for review. To run it locally, install Playwright 1.56.1 and Chromium under `.studio-qa-tools`, serve the repository on port 8765, then run `node scripts/room-for-error-browser-qa.mjs`.

The Node unit test checks structure and control behaviour in a simulated DOM; Chromium adds browser rendering and a generated PDF proof. Automated checks still **do not** establish physical print colour fidelity, screen-reader quality, physical-device usability, or visual approval. These remain required before public publication.

## Publication gate

Keep this work under `drafts/` until the user has reviewed and explicitly approved the specific design. Do not change the homepage, the daily public journal, or approved art to promote it prematurely.
