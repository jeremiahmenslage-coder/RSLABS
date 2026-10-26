# Phase 0 design-system sample

This is an **implemented CSS sample**, not a production-wide theme. Review actual `src/style.css`. The historical screenshot `evidence/optimized.png` belongs to the complete Phase 0.0 checkpoint; see `docs/history/CHECKPOINTS.md` for its location. It is not Phase 1 interaction evidence.

| Token/element | Implemented Phase 0 design |
|---|---|
| Canvas stone background | `#1b2227` with 23px low-contrast dot grid |
| Rail surfaces | `#191e23` / `#171b20` |
| Primary gold | `#e8be6d` for primary CTA; warm muted border on nodes |
| Hard link | `#e07a74`, solid + visible `HARD` label + arrow |
| Soft link | `#d8b169`, dashed + visible `SOFT` label + arrow |
| Preferred order | `#79aad9`, solid + visible `ORDER` label + arrow |
| Goal cards | HTML flexbox, 236×108 detailed / 176×62 compact |
| Icons | Six original geometric SVG category/object pictograms, not game assets; crisp at compact size |
| Ports | 27×31px visible targets; separate 19px transparent SVG edge hit paths |
| Group | Semitransparent dashed outline; explicit collapsed summary not confused with a milestone |
| Inspector | Right sidebar, native input/select controls with explicit labels |
| Focus | CSS `:focus-visible` gold high-contrast outline on buttons, fields, selected cards |

Known quality gaps: initial manual positioning can obscure some edge labels; after Optimize at 1440×850 all six labels are visible, but fitted cards are small (~65% view zoom). Future design must address label occlusion, keyboard handle alternatives, layout readability at varying zoom levels, and phone touch control. None of these screenshots demonstrates functionality by itself; browser test cases do.
