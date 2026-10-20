# VEIL art direction

## The idea

A generous amount of empty space, and one object worth looking at. The bottle tells the story of a simple skincare routine. Its volume, pump construction, soft ceramic cap, paper label and translucent body provide the visual hierarchy. Peach, porcelain and warm brown support the object without decorative noise.

Instrument Serif gives the voice an intimate editorial quality. DM Sans keeps ingredients, controls and labels precise. Both fonts are stored locally under the SIL Open Font License.

## Story map

| Native scroll chapter | Object and cause | Reader action |
| --- | --- | --- |
| 01 | A complete bottle at a slight angle, oversized soft wordmark behind it | Explore the composition |
| 02 | The pump lifts and ingredient drops leave the body as the bottle crosses to the left | Read what the ingredients are |
| 03 | The object returns to a more substantial scale. Variant colour changes body and inner material | Choose Calm, Dew or Restore |
| 04 | The bottle settles and leaves room for the ritual invitation | Build and save a daily routine |

The object is a lathed vessel with a separate physical inner material, multi-part pump, collar, translucent stem, curved label and base ring. The paper and glass have different roughness. The environment is an original generated studio map with broad reflection panels. There are no borrowed models or product photographs.

## Motion architecture

The browser owns scrolling. The story's native position maps to a single 0 to 3 coordinate. The same coordinate drives the product poses and progress indicator. Each property interpolates between explicit keyframes with smoothstep. Animation time only adds a small optional idle displacement. It does not advance the story. Reverse scrolling restores the same poses.

Mobile gets a lower, smaller object and a text composition above it. Reduced motion fixes object position and angle, closes the pump, disables ingredient movement and pointer parallax, and places all desktop chapter copy on the left.

## Working product path

Product choice in the scene and ritual builder stays synchronised. A saved summary includes the actual current selections. No simulated purchase or successful submission appears. Ingredient descriptions remain general; the page makes no fabricated efficacy claims.

## Budget and verification

Pixel ratio is capped at 1.6. There is one renderer, no post-processing and no shadow-map passes. The renderer skips work when the story is outside the viewport or the document is hidden. Hardware performance claims require measurement on the intended device.

Review the initial desktop frame, each intermediate transition, reverse scroll, 390 px mobile composition, native radio and range keyboard access, selected product synchronisation, saved file contents, reduced motion and disabled WebGL. Code parsing verifies syntax only.
