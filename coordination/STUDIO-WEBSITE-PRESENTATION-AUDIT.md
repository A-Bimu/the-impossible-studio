# Studio presentation inventory — 2026-11-01

## Scope and truth standard
The Studio homepage and journal publish more than four interactive/page-based projects. The earlier four-only audit was incomplete. This inventory includes every project linked from the **public homepage or daily journal**, plus Zawadi (an accessible direct Studio route not currently promoted on the homepage). It distinguishes websites/app flows from media-centric pages.

**Presentation acceptance for genuine interactive/page-based web work:** source-grounded idea, art direction, actual design decisions, 3 genuinely distinct desktop views, 5 genuinely distinct responsive mobile views, realistic browser-scaled device frames, real source links, working original demo where one exists, interaction/motion description, tests, and deployment confirmation. Do not fabricate functionality, screens, outcomes or original approved art.

## Project-by-project status
| Published experience | Public route | Category | Presentation |
|---|---|---|---|
| CHERRY RIOT | `daily/cherry-riot/` and `daily/cherry-riot/case-study/` | Brand + ecommerce concept | 3 real desktop, 5 mobile screens; live shop demo and actual scroll-jam homepage; previously delivered |
| Hotel Nocturne | `daily/2026-10-31-night-shift/` and `case-study/` | Hotel booking demonstration | 3 desktop, 5 mobile views; real sample reservation flow; previously delivered |
| ZEBRA | `work/zebra/` | Fashion e-commerce demo | 3 desktop, 5 mobile source views; original storefront preserved; previously delivered |
| ONE | `work/one/` | Business management prototype | 3 desktop, 5 mobile source views; original demo preserved; previously delivered |
| ROOTS 2027 | `calendars/roots-2027/` | Interactive calendar website | Case-study text, 3 authentic month desktop previews, 5 different month mobile previews, 12-month original browser + A4 print set |
| Atlas of Africa 2027 | `calendars/atlas-africa-2027/` | Interactive calendar website | Same source-grounded format, its own 8 authentic month states |
| The Editorial Edition 2027 | `calendars/heritage-africa-2027/` | Interactive calendar website | Same source-grounded format, its own 8 authentic month states |
| Poster Studies | `work/poster-studies/` | Editorial web collection | 8 distinct poster pages as 3 laptop / 5 phone views; original approved posters remain untouched |
| Childfree, Unapologetically | `work/childfree/` | Interactive catalogue | 3 desktop project sections + 5 genuine mobile pin-card sections; mood filters and notes dialog preserved |
| Zawadi | `work/zawadi/` (direct URL, **not homepage-linked**) | Fintech product visual case study | 3 desktop case-study sections + 5 mobile case-study flow sections; coded design concept only, not a working banking service |

## Artwork pages that should not have invented five-screen applications
- `work/deep-ink/` is an approved illustrated design-board and two original motion studies, not five coded product routes. It requires an art/motion presentation, not a fabricated interactive app.
- `work/vinyl-lounge/` presents one approved conceptual illustration with a separate animated explanatory diagram; not an ecommerce app.
- `work/lemon-sun/` presents a single original plate and the companion `editorial.html` page; these should remain separate without inventing a 5-route website.
- Calendar print decks `calendars/*/print/` are print outputs of the same three calendar websites, not extra apps.
- `pitch-decks/` contains six editable slide-deck products; use slide spreads and presentation mockups, not dummy phone checkout flows.
- `drafts/2026-10-28-terra-spa/` and `drafts/2026-10-28-small-wins-bureau/` are **drafts**, not published homepage projects. Do not silently label them published or expose them as finished public studies.

## QA and limitations
The device frames are CSS-built browser-like laptop/phone mockups embedding the actual pages in responsive iframes. They are **not actual device photographs** or automatically captured screenshot files. CI checks links, page structure, unique view destinations and JS syntax; real desktop/mobile **browser-rendered visual inspection** and interactive testing remain a separate release QA task. Production is only confirmed when the public Vercel domain resolves to the merge commit.
