# Design QA — ЮртаНеЖди mobile landing

## Evidence

- Source visual truth: `C:\Users\Shira\Documents\Visitka\qa\mobile-full-prototype\reference-variant-2.png`
- Browser-rendered implementation: `C:\Users\Shira\Documents\Visitka\qa\mobile-full-prototype\implementation-browser-passed.png`
- Normalized implementation viewport: `C:\Users\Shira\Documents\Visitka\qa\mobile-full-prototype\implementation-iphone-screen-passed.png`
- Side-by-side comparison: `C:\Users\Shira\Documents\Visitka\qa\mobile-full-prototype\design-qa-comparison-passed.png`
- Source pixels: 853 × 1844, normalized to 393 × 852 for comparison.
- Implementation browser capture: 2808 × 1669; app-owned phone screen measured 393 × 852 CSS px at scale 1 and was normalized to 393 × 852.
- State: iPhone, Telegram selected, hero at top, sheets closed, keyboard closed.

## Full-view comparison evidence

The normalized side-by-side comparison confirms the selected composition: compact brand header, eyebrow, two-line condensed hero, single orange CTA, messenger selector, live order status, and overlapping four-role phone stack. The implementation intentionally includes template-owned iPhone status and safe-area chrome above the website content.

The complete 6191 px page was inspected in the browser through the hero, proof strip, interactive role journey, director dashboard, menu availability state, fulfillment carousel, messenger section, final CTA, and footer. Section joins, vertical rhythm, image crops, and bottom safe-area spacing are intact.

## Focused region comparison evidence

- Hero typography and CTA: the implementation preserves the same hierarchy and conversion path. The orange second headline line is an intentional alignment with the approved desktop system.
- Product imagery: the guest, cashier, kitchen, and director screens use real dish imagery and faithful order data instead of placeholders.
- Brand mark: the final implementation uses the flame cropped from the selected source and post-processed with transparency.
- Phone stack: the stack is pulled upward after the first QA pass so the first viewport shows meaningful menu and role detail rather than only device tops.

## Findings

- No actionable P0/P1/P2 mismatches remain.
- [P3] The source mock uses a slightly wider display face than the locally available Impact/Arial fallback. This does not change wrapping or hierarchy.
- [P3] The generated source shows all four phones slightly farther into the first viewport; the implementation crops them more aggressively because the protected runtime includes a real status bar and safe area.

## Comparison history

### Pass 1 — blocked

- [P2] The first viewport showed too little of the four-role phone stack.
- [P2] The header used a generic lightning mark instead of the source flame.

Fixes:

- Reduced header and hero top spacing, moved the order-status pill and all phone cards upward, and shortened the fade region.
- Cropped the approved flame mark from the source and removed its background for a transparent asset.

Post-fix evidence:

- `design-qa-comparison-passed.png` shows the phone story beginning inside the first viewport with menu content, role labels, and order status visible.
- The header now uses the source flame with no visible background rectangle.

## Primary interactions tested

- Hamburger navigation opens a phone-scoped sheet; selecting a role closes it and updates the role stage.
- Guest, Cashier, Kitchen, and Director tabs update the central product screen.
- Telegram/MAX toggles update the messenger label across product screens.
- Menu availability switch changes the guest-facing item to the stop-list state.
- Primary and final CTAs open the demo sheet with Telegram and MAX actions.
- iPhone and Pixel 10 device presets render without horizontal overflow.
- Browser console errors and warnings: none.

## Follow-up polish

- A production font license could replace the current display fallback if an exact brand typeface is chosen later.

final result: passed
