# Studio website presentation audit — 2026-11-01
Scope: **published website/product experiences**, derived from actual homepage / daily journal links. Do not treat static artwork as complete web applications.

## Required deliverables for each eligible project
- True project story, goal, creative direction, branding and honest process (do not invent research, sketches, client results or production impact).
- **Three different desktop views** and **five different phone views** taken from the working site at genuine viewport sizes; use browser-sized iframes or actual captures, not generated interface screens.
- Polished laptop and phone device presentation; explicit labels and full-size links for every view.
- Working interactive demo; explicitly identify simulated purchases, bookings and business data.
- Motion showcase using authentic implemented effects when available.
- Final device QA, keyboard, accessibility, links, asset loading, navigation and deployment verification.

## Published website and app experiences — audit
| Priority | Project / published route | Existing real working source | Status before this rollout | Action |
|---|---|---|---|---|
| 1 | CHERRY RIOT `daily/cherry-riot/` | Jam-scroll branded site and separate `shop/` with actual home, product, cart, pairings, story screens; `case-study/` exists | Editorial case study and 3 laptop / **3 phone** dynamic iframes, no fifth/sixth mobile completeness | Add 2 mobile views (cart + story), verify five unique views, preserve original |
| 2 | HOTEL NOCTURNE `daily/2026-10-31-night-shift/` | Booking website with room list, check-in/out, guest choice and no-payment reservation dialog | No separate presentation or 3/5 device gallery | Build custom dark hospitality case study and real anchor-based responsive views |
| 3 | ZEBRA `work/zebra/` | Source: `projects/zebra-fashion/`, interactive storefront with hash routes home, shop, product, lookbook, story, checkout | Strong existing case-study and switchable single preview, but no simultaneous 3 laptop + 5 mobile showcase | Add true responsive route showcase + working demo and motion notes |
| 4 | ONE `work/one/` | Source: `collections/product-design/one-deep-navy.html` with live hash routes overview, sell, activity, inventory, customers, reports | Existing case-story and switchable demo; no simultaneous 3 + 5 showcase | Add true responsive screen gallery, preserve actual management UI, no fictional claims |

## Not website/app presentation work
- **Deep Ink**: original illustration and approved motion studies; needs an art/motion case-study format.
- **Vinyl Lounge**: conceptual illustration, not a website product.
- **Lemon Sun**: original illustration and editorial page, not a five-flow web app.
- **Poster Studies**: eight posters; print/editorial presentation instead.
- **Childfree, Unapologetically**: pin/catalogue concept; art/product presentation not fabricated checkout.
- **2027 Calendars**: real navigable print/editorial experiences; should use calendar-specific layouts and actual monthly spreads, not invented ecommerce screens.
- **Pitch Decks**: real editable slide products, requiring slide/device/presentation previews, not a fictitious five-screen app.
- `drafts/2026-10-28-terra-spa/` and `drafts/2026-10-28-small-wins-bureau/`: draft-only, not claimed as public homepage launches.
- `work/zawadi/`: separate accessible concept file but not linked from published homepage/daily journal; assess for future published inclusion, do not silently promote.

## Honest status and QA
Code-only and CI assertion checks **do not substitute for screenshots**. QA should verify visible browser layout at desktop and phone viewports as well as actual links, images and interactive states. Any absent live publication remains explicitly unverified until the public Vercel alias points to the correct revision.
