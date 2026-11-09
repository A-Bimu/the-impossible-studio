# Deep Ink · Octopus scroll concepts

**Approval:** Two original porcelain-blue octopus designs and two full-bleed scrolling studies. Never substitute later simplified 3D variants.

## Where to view the current presentation

- [Studio Deep Ink case study](../../work/deep-ink/) displays the design boards and embeds two motion-study players.
- [Artwork gallery](./) provides the project presentation.
- [Concept 01 motion page](videos/) and [Concept 02 motion page](videos/concept-02.html) provide standalone playback interfaces.

The case-study HTML references `assets/deep-ink-original.webp` and `assets/deep-ink-cover.webp` for visual presentation. Its players reference the archive bases `videos/concept-01-full-bleed.mp4.b64` (13 parts) and `videos/concept-02-full-bleed.mp4.b64` (8 parts), relative to this project directory. These are **references in source**, not proof that all bytes were fetched or that playback passed a browser test.

## Repository-path spot check (8 November 2026)

On this branch, GitHub returned **404** for the four legacy standalone paths `artwork/concept-01-wonders-beneath-the-surface.png`, `artwork/concept-02-ideas-have-a-way-of-escaping.png`, `videos/concept-01-full-bleed.mp4` and `videos/concept-02-full-bleed.mp4`. This **does not prove the approved media are absent**: the current presentation uses WebP display assets and browser-reconstructed, multipart video archives instead of those standalone filenames. GitHub successfully returned the HTML for `work/deep-ink/index.html` and `projects/deep-ink/videos/index.html`. Binary image fetches could not be decoded by the text-only connector; their existence, provenance and visual fidelity remain unverified by this check. No browser playback or full archive-part enumeration was performed.

## Archive status and verification still needed

`APPROVALS.md` records the original PNGs and MP4s as uploaded and viewable, but the earlier text in this README said they had not been uploaded. The Studio case study describes reconstructing the original MP4s from base64 parts in the browser. The archive should therefore be assessed in its **current storage format**, rather than assuming four standalone binary files must exist.

Before closing artwork-import issues #1 or #2, verify:

1. The actual approved source-artwork files or lossless reconstruction inputs exist at their recorded GitHub paths, with provenance to the approved originals.
2. All 13 Concept 01 and 8 Concept 02 video parts are present and successfully reconstruct into playable MP4 files.
3. Both standalone video pages and both embedded players work over HTTP in a real browser, including playback, duration, download and narrow-screen layout.
4. The registry, issues and this README agree on verified facts. Keep any unresolved source-format or provenance gaps open.

**This README update is documentation reconciliation only.** It does not certify asset integrity, complete the browser acceptance tests, or authorize replacing approved artwork.

## Complete archive directory audit (9 November 2026)

**Correction to the earlier missing-terminal-part diagnosis:** The loader in `videos/player.js` is **zero-indexed**, using `for (var i = 0; i < count; i += 1)`. Thus a `data-parts="13"` player requests `part-00.txt` through `part-12.txt`, **not** `part-01.txt` through `part-13.txt`; the eight-part player requests `part-00.txt` through `part-07.txt`, **not** `part-08.txt`. The earlier 404s for `part-13.txt` and `part-08.txt` were checks for files **outside the expected range** and do not indicate missing video data. The prior claim that either loader necessarily fails is withdrawn.

The GitHub Contents API directory listings on `main` show **all 21 expected files**, with no gaps:

- Concept 01: 13 files, `part-00.txt`–`part-12.txt`; first 12 files are 860,000 text bytes each, final `part-12.txt` is 765,452 bytes.
- Concept 02: 8 files, `part-00.txt`–`part-07.txt`; first 7 files are 860,000 text bytes each, final `part-07.txt` is 328,024 bytes.
- The standalone HTML pages declare `data-parts="13"` and `data-parts="8"` respectively, matching these listings and the zero-indexed loader.

**Verification scope:** Directory presence, naming, sizes and markup/loader count consistency are confirmed. This does **not** verify all chunk bytes, base64 decoding, resulting MP4 metadata, provenance to the approved originals, actual HTTP serving, or real-browser playback and download. Those acceptance tests remain outstanding. Do not replace, truncate or regenerate the approved originals. Do not close artwork issues #1/#2 solely on the strength of this audit.

[Studio index](../../)
