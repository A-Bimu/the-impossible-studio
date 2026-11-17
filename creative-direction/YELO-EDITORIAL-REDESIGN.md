# YELO: Editorial streetwear rebuild

**Studio status:** independent concept, not a commissioned product or a Co-operative Bank/YEA app.  
**Date:** 17 November 2026  
**Scope:** YELO website, three secondary pages, five working sample banking screens, original virtual card, Studio gallery covers and case study.

## Research

### Existing product context

Co-operative Bank's official **Young Ennovators Account (YEA)** serves people aged 18–35, including students, employees and entrepreneurs. Official product pages describe KES/USD opening, virtual cards, goal-based savings, transfers, bill payments, loans, investment access (MMF starting at KSh 100), and a KSh 500 account-opening minimum. These are **already YEA capabilities**, not YELO inventions.

Primary sources:
- https://www.co-opbank.co.ke/youth-account-young-ennovators-account/
- https://yea.co-opbank.co.ke/how-to-join/
- https://yea.co-opbank.co.ke/about/

YELO explores clearer daily-money hierarchy, transaction feedback, purposeful spending insight layouts, better visual appeal and safer progressive disclosure. Transactions, card freezing and goal funding run on synthetic browser-local state, not financial infrastructure.

### Common generic AI-made UI patterns

Recurring, but not diagnostic on their own:
- Multicolour purple gradients, floating glow orbs, maximal hero slogans
- Universally rounded boxes and repeated 3-column feature cards
- Small emoji-like icons and decorative stickers with no functional role
- Generic copy such as "unlock your potential", rather than a concrete scenario
- Identical page structures and soft-shadows on unrelated pages
- Headline collisions or untested small screens
- Stock or synthetic photography disconnected from the represented community

References:
- https://www.newyorker.com/the-ai-design-aesthetic-thats-taking-over-the-internet
- https://adamwrightdesign.com/newsletter/five-ai-patterns-to-look-for/
- https://styles.gallery/blog/why-ai-built-sites-look-the-same
- https://cdn.httparchive.org/v1/static/almanac/ebooks/web_almanac_2025_en.pdf

### Streetwear design references

- **Stüssy:** product-photo priority and quiet, edited website chrome, not visual effects everywhere: https://stussy.com/
- **Patta:** photographed people and editorial storytelling as identity, not a stock-image backdrop: https://patta.co/pages/lookbooks
- **Patta / The Other Side magazine:** offset layouts, confident headline scale, clear narrative hierarchy: https://patta.co/blogs/news/gup-72-x-the-other-side-magazine
- **Editorial streetwear principle:** a real photograph plus simple decisive type does more work than ornamental graphics.

This is reference research, **not** a request to copy either brand's logos, layouts or campaign artwork.

## Art direction decisions

| Previous pattern | New implementation |
| --- | --- |
| Purple glowing/gradient marketing hero | Paper ground, charcoal typography, one vermillion action colour, large editorial composition |
| Purple dashboard chrome | Neutral paper app surfaces with dark balances, yellow action state and original purple card only |
| Eight equally weighted shortcut cards | Four basic financial actions, transaction rows, one main goal and tab navigation |
| Marketing copy without specifics | Payday, rent, first gig and laptop-fund scenarios |
| Graffiti/crown everywhere | Original directional vector strokes on the debit card and subtle app card accents |
| One long scrolling page | Separate Campaign, Money, Card, Culture pages and interactive five-journey app |
| Decorative art blocking controls | Card behind the phone (pointer-events:none); status toasts non-blocking |
| Tight mobile headline clipping | Recalibrated display cap-height/line-height following screenshot QA |
| Unclear photography provenance | Three verified Dwayne joe photographs of Nairobi streetwear subjects under the Unsplash License |

## Photography ledger

- **Nairobi streetwear portrait, fluffy hat:** Dwayne joe — https://unsplash.com/photos/young-woman-in-stylish-streetwear-and-fluffy-hat-r31LZewlz20  
  Source image: https://images.unsplash.com/photo-1778301981932-3a047a01eacd
- **Nairobi mural portrait:** Dwayne joe — https://unsplash.com/photos/a-woman-standing-in-front-of-a-wall-covered-in-graffiti-dxw6QHAi2PQ  
  Source image: https://images.unsplash.com/photo-1739512383686-8220a257b3f8
- **Two men in Nairobi streetwear:** Dwayne joe — https://unsplash.com/photos/two-men-pose-in-stylish-streetwear-XBqzXZZiaO4  
  Source image: https://images.unsplash.com/photo-1744297428826-0a575d7033f6

Photography shows editorial subjects, not YELO users, account holders or endorsers. Do not claim all subjects are photographed *for* YELO.

## Functional design

The demo uses fake, browser-local KES money. Input checks enforce whole positive amounts and prevent overspending or goal overfunding. There is no actual banking, card network, payment gateway, loan adjudication, investment platform or backend transaction.

- Home: balance, four shortcuts, account activity and laptop fund.
- Move: fictional sends, bill payments, M-Pesa-labelled sample action and activity log.
- Goals: transfers simulated balance into the laptop goal and updates percentage.
- Cards: fictional purple card can be frozen or unfrozen.
- Insights: illustrated category breakdown plus real in-demo transactions.

## Quality assurance

GitHub Actions:
- tests/studio-yelo.test.mjs: responsive sources, safety logic, site pages, authentic photo references, case study and MOVA display hold.
- scripts/yelo-browser-qa.mjs: Chromium 1440px, 390px and 320px working flows; 390px Money/Card/Culture navigation and screenshot output; case-study five-journey explorer.
- Screenshots reviewed for text collisions and pointer obstructions, then CSS corrected.

The project remains visible in Studio's public gallery and presentation hub. MOVA remains temporarily withheld until its separate design review.
