# Hermes task — KILIMO SIGNAL / AGRI AI

**Worker:** Hermes Agent, project `impossible-studio`, board `studio-rebuild`  
**Scope:** `A-Bimu/the-impossible-studio` ONLY  
**Trigger:** Explicitly dispatch through the local Windows Hermes Kanban; **a GitHub commit or issue does NOT trigger Hermes automatically**.  
**Starting point:** `creative-direction/KILIMO-SIGNAL-AGRI-AI-RESEARCH.md`  
**Preview asset:** Canva uploads, `MAHbTSttGHE` (not imported into GitHub; use only if accessible and suitably licensed for public display).

## Non-negotiable staged workflow

### P1 / Research before artwork
1. Read `AGENTS.md`, `creative-direction/CREATIVE_ART_DIRECTION.md`, current Studio project routes, CI, and the cited research file.
2. Perform fresh web research yourself using at least **6 credible sources** including KALRO, KMD, FAO/TAAT, DigiFarm and competitors; verify publication dates, claims and URLs. Document business model, target farmers, existing products, market gaps, bandwidth/offline and local-language constraints.
3. Reject fabricated metrics or undocumented claims. Clearly differentiate the speculative concept from existing products and brands.
4. Save `creative-direction/KILIMO-SIGNAL-HERMES-RESEARCH.md`, with linked evidence and a one-paragraph real product thesis. This must be its own commit before design begins.

### P2 / Design exploration
5. Research actual **award-level** agriculture and data-dashboard design, original documentary farm photography and image licensing. Avoid generic AI-trope dashboards.
6. Make **three genuinely different visual directions**, each with **a desktop hero and phone-screen mockup**, typographic hierarchy, colour values and image rationale.
7. Constraint: absolutely **no cream, nude, beige or sand backgrounds**; do not use green as the UI palette (real vegetation in photography is fine). Working direction uses ink #10131F, cobalt #2456FF, sun yellow #FFD640, coral #FC5C4E, lavender #B9A7FF and clean white. Variants must still honour constraints.
8. Publish three comparison images in the repo under `assets/kilimo-signal/concepts/` and a decision log. If the first concept is selected as a working default by the task, label it PROVISIONAL and remain open to user feedback; don't silently replace approved Studio artwork.

### P3 / Original functional site
9. Build `projects/kilimo-signal/` (public landing + farm demo) and `work/kilimo-signal/` (proper Studio case study).
10. A practical responsive demo must show crop/field selector, photo/symptom-check *workflow* (without pretending a model diagnoses), ward/county context, field tasks, local sample risk notes and a harvest notebook. Buttons must operate on safe sample local state and have empty/error states.
11. Full visuals: real licensed farm images or clearly marked original generations, strong crop close-ups, genuine people, no copied proprietary assets. Responsive views, professional motion, accessibility.
12. Do **not** claim live AI models, forecasts, satellite data, price information, pesticide treatment, farmer counts or bank integrations unless actually verified. Mark all placeholders as demonstration.
13. Respect portfolio conventions: **3 meaningful desktop screenshots + 5 different mobile screenshots** and actual interactive demo. Include proper credits and concise research-to-design narrative.

### P4 / QA and publish
14. Isolate changes on a `hermes/agri-ai-...` branch or worktree, do not overwrite `main`.
15. Run tests, actual browser screenshots at 1440px / 390px / 320px, keyboard navigation, image checks and `prefers-reduced-motion`; never hide errors in CI.
16. Create a GitHub PR with research, image provenance, screenshots and real demo checks. Obtain user's review before merging **unless the user has explicitly accepted a particular visual direction**; do not claim the site is live until Vercel deployment is verified.
17. Add the approved concept to Studio homepage, case study navigation and journal without making other unapproved changes. MOVA stays hidden.
18. Post PR link, live URL, research summary and screenshot/image links to the GitHub issue. The GitHub/Studio results can then be shared back in this chat; **Hermes cannot directly create a message in this chat through an unconfigured local gateway.**

### Hermes acceptance gates
- Research comes **first**, in a separate commit.
- All reference images and commercial asset rights documented.
- No copycat competitor branding or made-up agronomic promises.
- Clear colour system and accessible typography, no cream/nude/green surfaces.
- Five working sample screens and 3 desktop + 5 mobile captures.
- Both image and functional website outputs, not just an explanatory writeup.
- CI green, production deployment verified when approved.
