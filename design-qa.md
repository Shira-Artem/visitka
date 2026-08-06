# Mobile Story — final design QA

## Comparison target

- Source visual truth: `C:\Users\Shira\AppData\Local\Temp\codex-clipboard-a3fc99b7-8c18-4074-b486-cfb63ab05748.png` — selection scene supplied with this request.
- Implementation: `http://127.0.0.1:4173/index.html`, captured in the in-app browser.
- Primary comparison state: `01 / ВЫБОР` / `ВЫБРАЛ БЛЮДО`.
- Full-view comparison: `qa/mobile-story-final-selection-comparison.png` (source at left, implementation at right).
- Focused implementation captures: `qa/mobile-story-final-choice-352x624.jpg` and `qa/mobile-story-final-payment-390x844.jpg`.

## Evidence and normalization

- Source raster: 515 × 856 px, 72 dpi. Its mobile card is embedded in a taller editor capture.
- Implementation CSS viewports: 352 × 624 and 390 × 844. Browser raster captures are 337 × 597 px because the browser capture excludes the scrollbar gutter; the comparison sheet normalizes both sides to 352 × 624 px.
- The source card is taller than the required 352 × 624 viewport. The implementation intentionally uses the smaller, uniform phone scale required to keep the complete device, a 16 px indicator gap, and the safe area visible at 352 × 624.
- Focused comparison was required for the heading/caption slot, device bounds and indicator. The supplied source is a visual direction for the selection composition; payment was checked against the explicit requested copy and constraints.

## Findings

No actionable P0, P1 or P2 findings remain.

- Fonts and typography: display headings compute to `Unbounded, Manrope, sans-serif`; scene labels and notes compute to `Manrope`. Titles use explicit two-line breaks, remain inside the 24 px side margins, and do not truncate.
- Spacing and layout rhythm: the device has fixed coordinates for all six Story states within each viewport. At 352 × 624 it is `x=90.4, y=249, w=156, h=338`; at 390 × 844 it is `x=74.6, y=264, w=226, h=489.7`. The indicator follows the device with a consistent 16 px gap.
- Colors and visual tokens: the two background layers crossfade between milk-peach, amber, cream-orange, soft lime and blue-violet states. The route remains behind the device and is driven by scroll progress.
- Image quality and asset fidelity: the original one-device phone, its internal screens and restaurant imagery are reused. No raster duplicate or replacement phone was introduced.
- Copy and content: all requested scene labels, two-line headings and notes are present; the previously overlong payment heading is absent.

## Automated layout checks

| Viewport | Checked state | Result |
| --- | --- | --- |
| 352 × 624 | Hero and selection | One visible panel; headline gap 16.35 px / 97.25 px; no horizontal overflow |
| 360 × 800 | Payment | One visible panel; headline gap 111 px; indicator gap 16 px; no horizontal overflow |
| 390 × 844 | Hero and payment | One visible panel; Hero headline gap 17.45 px; payment screenshot captured; no horizontal overflow |
| 430 × 932 | Payment | One visible panel; headline gap 111.82 px; indicator gap 16 px; no horizontal overflow |
| 768 × 1024 | Payment | One visible panel; headline gap 111.6 px; indicator gap 16 px; no horizontal overflow |
| 1440 × 900 | Desktop Story | Desktop grid/sticky Story restored, with no mobile Story attribute and no horizontal overflow |

For every checked state, `headline.left >= 24`, `headline.right <= viewport - 20`, and the phone coordinates stayed identical between scenes at the same viewport. Computed visibility confirmed one settled `.story__act-panel` at a time.

## Comparison history

1. The first final visual check exposed the scene indicator inside the phone silhouette.
2. The indicator was anchored to the existing phone column, 16 px below the fixed phone bounds; the compact 352 × 624 view now shows the complete device and indicator without overlap.
3. A follow-up 390 × 844 Hero check found only a 7 px title-to-phone gap. The fixed phone coordinate was raised to 264 px on taller mobile screens; the post-fix gap is 17.45 px.
4. The current captures and responsive checks above are the post-fix evidence.

## Implementation checklist

- [x] One caption slot and one `activeSceneIndex`-driven Story state.
- [x] Stable phone position and scale per viewport.
- [x] No clipped scene headings or horizontal overflow in checked viewports.
- [x] Indicator and route stay outside the phone/content conflict areas.
- [x] `assets/js/hero-demo.js`, the Ways section and desktop Story remain unchanged.
- [x] Browser console checked after the final render.

## Follow-up polish

- [P3] The supplied reference is a taller embedded prototype capture, so its phone can appear larger than the constrained 352 × 624 implementation. The current smaller scale is intentional to satisfy the full-device and safe-area requirements.

final result: passed
