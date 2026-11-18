# YELO / Drop 002 — Actual graffiti and street-fashion reference research

**Research date:** 18 November 2026  
**Product:** YELO, an independent fictional youth-finance concept, not a Co-operative Bank/YEA product.  
**Non-negotiable palette constraint:** no green, cream, beige, sand, nude, or muted skin-tone design surfaces. Skin tones visible in authentic photography are not used as palette tokens.

## What the references actually demonstrate

### 1. Sprayground — graffiti lives ON the product

**Sources**
- https://www.sprayground.com/ 
- https://www.sprayground.com/blogs/sprayground/half-graff-lips-collection-a-bold-statement-in-streetwear-fashion
- https://www.sprayground.com/collections/half-graff-lips
- https://www.sprayground.com/products/next-stop-backpack

**Observation:** The bags themselves carry complex graphics and distinctive marks. The editorial imagery pairs these objects with people, city settings, graffiti walls, and dynamic poses. The product is immediately identifiable, not an ordinary backpack in front of a fake spray effect.

**Applied to YELO:** Original vector graffiti now covers the card front, with layered hand-style marks, violet base, cobalt, magenta, yellow, and orange. The card has faux plastic depth, a metallic chip, brushed reflective laminate, masked sample numbers, a real front/back flip, and perspective motion. Graffiti also appears as a branded accent in the banking app—not on its numeric form fields.

### 2. Palace Skateboards × Lotties — drawn marks are a distinct identity

**Source**
- https://palaceskateboards.com/lookbook/palace-lotties

**Observation:** Bold drawn lettering and small hand-rendered marks communicate individuality more effectively than generic sprayed stock textures.

**Applied:** A custom YELO vector, painted slashes, hand-style brush shapes, micro splatter, and contrast detail. This is new original artwork, not a copied Palace pattern.

### 3. Gusto / calligraffiti — a recognizable handstyle can become a brand

**Source**
- https://gusto.nyc/pages/about
- https://gustoizm.com/GustoNYC-Brand

**Observation:** An artist's distinctive lettering is translated to apparel and tangible objects, rather than applied indiscriminately as a background.

**Applied:** Concentrate expressive marks on the debit card and photo compositions. Keep financial screens clear.

### 4. Nairobi fashion and matatu graffiti — grounded local identity

**Sources**
- https://unsplash.com/photos/young-woman-posing-by-a-pink-graffiti-covered-van-5QCxugQUIB4
- https://unsplash.com/photos/woman-posing-by-a-pink-bus-with-graffiti-IDh97KSREFs
- https://unsplash.com/photos/young-woman-in-stylish-streetwear-and-fluffy-hat-r31LZewlz20
- https://uonjournals.uonbi.ac.ke/index.php/ahr/article/download/534/553

**Observation:** Nairobi fashion photography features actual matatus, street painting, pose and personal style. Published research identifies graffiti on public-transport vehicles as a Kenyan street-art category.

**Applied:** Use real, credited Dwayne joe photography with a vivid pink graffiti-covered matatu alongside the original YELO product. No implied endorsements or customer identity. Avoid photographs dominated by green or muted beige backgrounds.

### 5. Motion and accessibility

**Sources**
- https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
- https://movingparts.supply/components/depth-tilt/

**Observation:** A card that responds to the mouse is tactile without turning the whole website into moving decoration. Motion must have a non-motion alternative.

**Applied:** 3D perspective tilt and specular glare, physical front/back flip, explicit motion pause, reduced-motion detection, and a short introductory motion for the decorative hero card. Touch devices use the flip control rather than pointer tracking.

## Visual system — banned and approved

| Element | Drop 001 | Drop 002 |
| --- | --- | --- |
| Page foundation | Warm cream and paper | Ink-black #080710 and deep violet #1A083A |
| Brand accents | Muted orange editorial | Shock pink #FF279E, cobalt #156AFF, ultraviolet #7737FF, fire orange #FF561B, yellow #FFE019 |
| Card render | Flat CSS graphic | Realistic faux plastic with reflective laminate, raised edge, chip, magnetic stripe, 3D front/back |
| Card motion | None | Controlled tilt, glare, flip and pause with reduced-motion support |
| Photo direction | Editorial portrait and neutral backgrounds | Real vibrant pink graffiti matatu streetwear photographs |
| Banking interface | Light paper and dark numbers | Deep violet, clearly contrasted balances, vibrant focused action buttons |
| Studio presentation | Pale cover card | Saturated photo-led cover and fully dark case study |

**No copied brand marks or logos, no real card network and no real financial account.** The currency and transfers are fictional, stored locally in the browser.

## Testing standard

Before production merge, verify:
1. Every page (Campaign, Money, Card, Culture and Studio case study) renders without cream/beige/green design surfaces.
2. Real photo URLs display; original artwork is served at /assets/yelo-graffiti.svg.
3. Card flip is available with keyboard or tap; pointer tilt never blocks controls; reduced-motion setting disables nonessential movement.
4. Banking controls still transfer simulated funds, grow a goal, display activity and freeze a sample card.
5. Responsive screenshots at desktop and narrow phone sizes show no horizontal overflow or obstructed text.
6. MOVA remains hidden on public Studio listings.
