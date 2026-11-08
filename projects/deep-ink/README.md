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

## Loader-path spot check (8 November 2026)

The playback script `videos/player.js` constructs chunk URLs as `<data-src>/part-NN.txt` (for example, `videos/concept-01-full-bleed.mp4.b64/part-01.txt`), **not** `<data-src>.part01`. A GitHub contents request returned blob `11bbedb249d9cac576e169fdea2da5cdb12ef3e8` for Concept 01 part 01, confirming that one actual loader-path chunk exists. A separate request for `videos/concept-02-full-bleed.mp4.b64/part-08.txt` returned HTTP 404. This is a potential missing terminal chunk for Concept 02, but the entire archive has **not** been enumerated and the request alone does not prove the deployed page fails. Confirm the expected part count, exact case-sensitive path and branch before remediation; do not generate substitute video bytes. No browser playback or MP4 integrity check was performed.

[Studio index](../../)

## Terminal-part verification against `main` (8 November 2026)

A follow-up GitHub contents check on **`main`** confirms that `videos/concept-01-full-bleed.mp4.b64/part-13.txt` and `videos/concept-02-full-bleed.mp4.b64/part-08.txt` both return **404**. By contrast, `videos/concept-02-full-bleed.mp4.b64/part-07.txt` exists (blob `4488d1840d788570e364734a125bf065afc4c2a2`). `videos/player.js` explicitly requests every part from `1` through the `data-parts` count using `part-NN.txt`, and `videos/concept-02.html` specifies `data-parts="8"`. Therefore, **with the current declared counts and paths, the browser loader cannot successfully reassemble either video from `main`**: any missing required part causes `Promise.all` to reject before a playable blob is created. This is a source-level failure diagnosis, **not** a completed live-browser test. The other 19 paths have not all been enumerated.

**Remediation gate:** Retrieve the exact approved original archive parts or independently establish the correct part count and filenames from the original media manifest. Never fabricate, truncate, or substitute video content, and do not merely lower `data-parts` to silence the error. After restoring verified source bytes, enumerate every requested chunk, check decoded MP4 integrity and duration, and perform actual browser playback/download checks for both embedded and standalone players. Until then, treat the `APPROVALS.md` claim that both videos are viewable as **unverified and contradicted by the current source-path checks**; keep artwork issues open and do not merge or deploy this documentation PR as a media fix.
