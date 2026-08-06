# Mobile Hero QA

## Comparison target

- Source visual truth: the mobile Hero brief in `C:\Users\Shira\.codex\attachments\024823bc-0dfb-4242-9165-f8eb7f6205fd\pasted-text.txt`.
- Regression reference: `C:\Users\Shira\AppData\Local\Temp\codex-clipboard-19410c95-79bd-4ef6-abf6-18e1f585516b.png`. It records the pre-fix failure state, not the intended composition.
- Implementation evidence: `C:\Users\Shira\Documents\Visitka\qa\mobile-390x844.png`, `C:\Users\Shira\Documents\Visitka\qa\mobile-demo-scroll-390x844.png` and `C:\Users\Shira\Documents\Visitka\qa\desktop-1440x900.png`.

## Evidence and normalization

- Mobile viewport: 390 x 844 CSS px (browser viewport; client content width 375 px because of the browser scrollbar), density 1x.
- Desktop viewport: 1440 x 900 CSS px, density 1x.
- State: initial guest screen; a separate pass used the mobile demo link and the Director role button.
- The supplied image is a regression capture rather than a matching target frame, so this review compares the rendered result against the explicit layout, rhythm, copy and interaction requirements in the brief. No density conversion was needed.

## Findings

No actionable P0, P1 or P2 findings remain.

- Fonts and typography: the four-line Hero promise is visible at every checked mobile width, uses the requested compact 42–58 px clamp, 0.86 line height and tight tracking, and no longer crops individual lines.
- Spacing and layout rhythm: the Hero begins below the fixed header/safe-area allowance; CTA is 54 px tall; the upper phone is visible in the first viewport. At 390 x 844 the phone is 289 px wide and centered.
- Colors and visual tokens: existing palette, gradients, device treatment and demo screen content are unchanged.
- Image and asset fidelity: the existing phone and restaurant imagery are reused unchanged; no replacement or duplicate phone was introduced.
- Copy and affordances: mobile shows `Смотреть живое демо ↓`; desktop retains `Смотреть демо`. The mobile link opens the first guest screen; each subsequent scroll-screen advances the existing phone through menu, checkout, cashier, kitchen and director states.

## Focused interaction evidence

- At 390 x 844, the demo link lands with the phone at y=74–700 and caption/role switch at y=712–784, below the fixed header. On the next scroll-screen, the phone remains at y=74 while the `Шаг 2 / 4 · Выбрал блюда` card appears and the existing menu screen is active.
- Each role target is 42 px tall on mobile. The Director button changes both `#heroDemo` and `#heroPhoneDisplay` to the `director` role and exposes `aria-pressed=true`.
- When later mobile acts enter the viewport, Hero remains `.is-active`; its headline remains visible.
- No console errors were reported in the mobile or desktop capture.

## Responsive coverage

| Viewport | Result |
| --- | --- |
| 320 x 568 | Demo-stage fits: phone y=62–491, controls y=499–565; no horizontal overflow |
| 360 x 800 | Offer visible, no horizontal overflow, 42 px role targets |
| 375 x 667 | Offer visible, no horizontal overflow, 42 px role targets |
| 390 x 844 | Mobile Hero and demo-stage verified visually |
| 393 x 873 | Offer visible, no horizontal overflow, 42 px role targets |
| 412 x 915 | Offer visible, no horizontal overflow, 42 px role targets |
| 430 x 932 | Offer visible, no horizontal overflow, 42 px role targets |
| 768 px | Existing tablet flow intact, no horizontal overflow |
| 1440 x 900 | Existing sticky desktop story remains active and visually unchanged |

## Comparison history

1. Initial rendered pass exposed clipped Hero lines and the mobile observer could remove Hero's `.is-active` state.
2. The mobile line mask/entrance animation was replaced with a non-clipping sequence; the observer now retains Hero's active state, and the demo link targets the phone stage.
3. The phone stage was made sticky for the mobile story. Each scroll step now advances the existing `#heroPhone` state while a single contextual card appears below it.
4. Post-fix captures and interaction checks passed at all required viewports.

## Implementation checklist

- [x] Preserve one `#heroPhone` instance.
- [x] Keep Hero visible while mobile demo acts change.
- [x] Keep controls visible, finger-sized and non-overflowing.
- [x] Preserve desktop sticky-story behavior.
- [x] Check console errors and horizontal overflow.

## Follow-up polish

- [P3] None identified in the requested scope.

final result: passed
