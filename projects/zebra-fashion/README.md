# ZEBRA · Not Made to Blend In

**Status:** approved interactive fashion storefront, archived as its original standalone HTML.

The site includes products, filtering, sizes and colours, wishlist, bag, and simulated checkout. It uses sample products and makes no real charges.

## View

Use [Open storefront](./) on GitHub Pages or serve the repository locally with `python -m http.server 8000`. This project's entrypoint reassembles the exact approved self-contained HTML from sixteen text chunks in `parts/`. Splitting was needed for reliable upload, not a visual redesign.

The loader fetches the chunks in order, shows progress, retries a dropped chunk once and reports the failing file instead of a blank page. It needs HTTP (`file://` is blocked by browser fetch rules).

## Direct screens

The storefront routes on the URL hash, so any screen can be linked from the studio project page:

| Screen | URL |
| --- | --- |
| Home | `./#home` |
| Collection | `./#shop` |
| A single product | `./#product/crossline-overshirt` |
| Lookbook | `./#lookbook` |
| Our story | `./#story` |
| Wishlist | `./#wishlist` |
| Bag and checkout | `./#checkout` |

**Approved copy:** Not made to blend in.
