# Kilimo Signal / Agri AI — Grounded research, 19 November 2026

> A speculative Kenya-oriented field intelligence product for The Impossible Studio. **Working title**: Kilimo Signal. The product is not a service claiming to be live, the name has not been trademark cleared, and nothing below should be interpreted as regulated farm advice.

## 1. What this business category actually does

Agricultural AI may help farmers and field officers interpret crop photos, track observations, make sense of weather risks, identify pest and disease *suspicions*, plan farm work, monitor costs, and compare harvest/market information. Models require training, data provenance, connectivity, uncertainty communication, and review by agricultural specialists.

### Verified product and official-service research

| Source | What already exists | Design implication |
| --- | --- | --- |
| PlantVillage Nuru (TAAT / FAO) | Mobile and offline image-led screening for crop damage and pests | Make field photo capture prominent, but never claim an untrained visual simulation diagnoses a crop |
| Apollo Agriculture (FAO and GSMA) | Digital agricultural advice, financing, inputs and insurance for smallholders | Do not position financing or advisory support as a novel invention |
| Safaricom DigiFarm | Mobile access to agricultural services and information | Design for simple mobile workflows and limited connectivity |
| FarmRise (TAAT) | Localized crop advice, weather and crop management support | Context matters: crop, field, stage and region before advice |
| KALRO Kenya Digital Agriculture Platform | Ward-scale agro-weather, agriculture advice and commodity market data | Link to credible sources and distinguish sample values from verified data |
| Kenya Meteorological Department | Agrometeorology forecasts/bulletins and farming advisories | No invented current weather or rainfall amounts |
| FAO Kenya | Climate-service advisories and farmer-focused delivery | Advice should support, not replace, extension officers |

Sources (read these before implementation):
- https://taat.africa/com/technologies/nuru-in-field-pest-and-disease-diagnosis
- https://www.fao.org/in-action/remote-sensing-for-water-productivity/applications-and-uses/applications-catalogue/product-detail/PlantVillage-Nuru_1331767/en
- https://agritechobservatory.review.fao.org/en/apollo-agriculture
- https://www.gsma.com/solutions-and-impact/connectivity-for-good/mobile-for-development/programme/agritech/ai-driven-smallholder-farmer-lending-in-africa-insights-from-apollo-agriculture/
- https://play.google.com/store/apps/details?id=com.safaricom.digifarm.farmer_app
- https://e-catalogs.taat-africa.org/com/technologies/farmrise-digital-platform-for-advisory-and-crop-management
- https://keep.kalro.org/
- https://meteo.go.ke/Services/agrometeorology/
- https://www.fao.org/kenya/news/newsdetails/fao-strengthens-agrometeorological-advisory-services-to-support-climate-smart-agriculture-in-kenya/en

### Nearby competitive design references (not to clone)

- https://kilimoiq.com/
- https://www.agromind-ai.co.ke/
- https://shambaiq.com/
- https://usemaathai.com/
- https://farmpoaai.com/

The market already includes weather, crop photo screening, price tracking and agronomist chat. A credible portfolio concept should instead **integrate the daily decision**: “What should I check in my field this week, what evidence does that decision depend on, and when should I ask for help?”

## 2. Proposed user and proposition

**Primary:** Kenyan smallholder farmer growing maize, tomatoes or beans; smartphone data budget matters; needs concrete timely advice.  
**Secondary:** cooperative extension worker managing several farmers or plots.  
**Proposition:** Turn scattered observations into a short, understandable **field action plan**. Keep the system transparent, practical and mobile-first.

### First-scope journeys

1. **My field:** register/choose a fictional plot, crop type and county; see current example observations and next tasks.
2. **Crop check:** select crop and symptom or add an illustrative photo; get a *checklist of what to verify*, with uncertainty and escalation to an agronomist, not a fake AI diagnosis.
3. **Field calendar:** create/complete upcoming work, keep local state, show meaningful priority.
4. **Conditions:** show explicitly labelled *illustrative* risk factors. Connect credible KMD/KALRO data only after a verified integration exists.
5. **Harvest notebook:** record input costs and observed harvest quantity; show simple transparent arithmetic (not invented market prices, revenue or forecasts).

## 3. Visual direction — do not fall back to generic AgriTech templates

**Working identity:** KILIMO SIGNAL. Distinctive, technical, optimistic and grounded in actual farmland photography. It is a concept identity only; check name and domain clearance before product use.

Palette:
- Night ink `#10131F` — primary background
- Cobalt `#2456FF` — strong information panels and accents
- Sun yellow `#FFD640` — primary calls to action
- Coral red `#FC5C4E` — attention, risk and illustrations
- Electric lavender `#B9A7FF` — secondary accent
- Pure white `#FFFFFF` — typography and bright surfaces

**No cream, beige, sand, skin-tone nude UI or green UI palette.** Real plants may naturally be green in photographs. Avoid random gradients, generic 3×3 feature tiles, glowing orb backgrounds, stock-model robots, countless emojis and empty metrics.

Image guidance:
- Lead with an *authentic-looking documentary portrait* in a maize field, not sterile drones or fake holograms.
- Show crop macro photography, field landscape and hands examining leaves.
- Use **licensed photographs** (Unsplash / CC with attribution) or clearly labelled generated illustrations. Do not copy copyrighted competitor media.
- The generated concept image in the connected chat is saved to Canva under **“Kilimo Signal — Agri AI researched website and mobile concept”** (asset ID `MAHbTSttGHE`). It is **a visual starting point, not approved production artwork**. It has not been uploaded to GitHub.

Typography: a strong condensed headline font, a practical legible UI font; deliberate scale and meaningful spacing.
Motion: page reveal and very restrained hover/scroll transitions; support reduced motion.
Device presentation: at least 3 meaningful desktop screens and 5 genuinely different phone screens, all sourced from the real demo.

## 4. Business and implementation integrity

- No current weather, prices, satellite readings, yield forecasts or disease diagnosis unless backed by a verified external service.
- Label sample content SAMPLE / ILLUSTRATIVE. Do not invent source partnerships, farmer testimonials, user counts, claims of accuracy, conversion rates, funding or APIs.
- No automatic pesticide recommendation. Add a guidance note to consult extension service and follow locally registered product guidance (PCPB).
- No user photos uploaded to an external AI service by default. Safe browser-only demo.
- Honor `AGENTS.md` and `creative-direction/CREATIVE_ART_DIRECTION.md`. Only work in `A-Bimu/the-impossible-studio`.
- No change to ALIA, KidyCode, Eureka or other products; do not disturb held MOVA listing.

## 5. What the audience should be able to inspect

- Website / visual hero and meaningful sections.
- A genuinely working interactive product demonstration, no decorative dead buttons.
- Full case study explaining research, audience, decisions, original identity, colour selection, images with rights, motion and limitations.
- Responsive laptop/phone views, automated tests and verified deploy.
- PR + CI + release links shared on the task issue and with the user.

This is a starting research pack. Hermes must **independently re-check sources** and document corrections before changing any production design.
