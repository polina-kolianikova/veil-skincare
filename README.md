# VEIL

Independent skincare brand concept by Polina Koljanikova. A complete static website with a procedural Three.js product scene and a working personal ritual builder.

## Run

Serve this directory with any static HTTP server. Open `index.html` through HTTP. ES modules cannot reliably load by opening the file directly.

There is no build step, package installation, runtime CDN, API key or remote font request. The directory can be published as the root of a dedicated GitHub Pages repository. `.nojekyll` is included.

## Interactions

Native scrolling drives four reversible chapters: the finished product, an open composition, texture and variants, and the daily ritual. The sculpted bottle, pump, paper label, ingredient drops and studio environment are generated locally.

Calm, Dew and Restore update the 3D bottle and ritual selection. The builder accepts morning or evening, skin feel and product. Its three steps and notes change immediately. The save button downloads a readable text summary. It does not submit a form or create an account.

## Access and resilience

The site includes semantic headings, native inputs, visible focus, keyboard-accessible controls, skip navigation, live result announcements, local fonts and an independent mobile composition. Reduced motion removes the rotating product, pointer parallax, ingredient movement, scene relocation and smooth anchor scrolling. WebGL failure or context loss reveals a CSS product illustration while the rest of the site remains usable.

## Boundaries

VEIL is a fictional portfolio concept. There is no real product inventory, payment, delivery or medical recommendation. All visuals are original procedural geometry or CSS. Font and Three.js licenses are recorded in `assets/LICENSES.md`.

## Checks

Syntax and local asset checks are recorded by the integrating project. Browser composition, scroll reversal, mobile viewport and download behavior must be checked against the exact published revision. Source inspection is not a claim of physical-device testing.
