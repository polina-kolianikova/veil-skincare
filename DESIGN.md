# Current visual implementation, October 2026

The product scene now uses generated photographic assets and DOM transforms driven by native scroll. This supersedes geometry and material details in the historical design notes below. Typography is defined in typography.css; generated product media is styled in product-art.css and positioned by product-story.js. Source generation prompts and full QA evidence are kept in the parent delivery workspace.

## Earlier direction

# VEIL, second edition

The bottle is the protagonist. A quieter peach and porcelain palette, editorial Instrument Serif, a sage botanical photograph and a much larger texture chapter establish a tactile skincare world.

## Scene construction

The lathed coated-resin body has fine side ribs, a separate metallic collar, sculpted pump, base ring and a curved printed label. Coated resin replaces the earlier transmissive shell. There are zero transmission materials and therefore no transmission buffer. Broad studio reflections supply a bright edge and readable material. The label uses unlit print so its ink stays legible.

Thirty ingredient pearls share one InstancedMesh. They travel around the same bottle and a helical line marks their path. The pump rises with composition, then closes again. Native scroll controls the poses and chapter indicator. The texture chapter moves to a close crop rather than repeating the hero scale. Reverse scroll is deterministic. Reduced motion keeps the object assembled, fixes its angle and disables the pearl movement.

## Real imagery

The botanical pause uses a locally stored, visually inspected photograph by Jonas Von Werne. It is licensed for website use under the Unsplash License. Its source and dimensions are listed in assets/LICENSES.md. Mobile uses an independent photograph crop above the text.

## Performance

Rendering is demand-driven in render-control.js. There is no idle animation loop. Scroll, pointer, variant changes and resize queue one frame. Offscreen and hidden states cancel pending RAF. Visibility restoration only requests a fresh frame.

Antialiasing is enabled. The initial DPR cap is 1.4 with budgets of 2.2 million physical pixels on desktop and 0.95 million on mobile. Quality reduction excludes the first ten frames and requires 15 of 20 consecutive active submission frames above 28 ms. A pause over 250 ms resets the sample. This is a CPU submission heuristic, not GPU FPS.

Root dataset diagnostics: renderFrames, drawCalls, triangles, renderDpr and renderMode. Idle and offscreen counters must remain unchanged until a meaningful invalidation.

## Working path

Calm, Dew and Restore stay synchronised with the ritual builder. Morning, evening, skin feel and product update the actual exported note. There are no invented purchases or medical efficacy results. The CSS fallback preserves the page if WebGL is unavailable.

The integrating agent checks desktop, mobile, transition midpoints, reverse motion, reduced motion, WebGL fallback, controls and export against the exact release. Source inspection alone does not constitute a visual pass.
