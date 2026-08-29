# Design QA — desktop order journey

## Comparison target

- Source visual truth: `C:\Users\Shira\AppData\Local\Temp\codex-clipboard-dc027467-272e-48b4-8e0d-ecd60022aa8f.png`
- Rendered implementation: `http://127.0.0.1:4173/index.html#desktop-journey`
- Browser-rendered evidence: `C:\Users\Shira\Documents\Visitka\qa\desktop-journey-browser-full.png`
- Focused implementation capture: `C:\Users\Shira\Documents\Visitka\qa\desktop-journey-current.png`
- State: desktop landing page, default/light state, no hover or focus state applied.

## Viewport and normalization

- Source image: 1754 × 897 px; supplied reference crop of the complete journey section.
- Primary implementation CSS viewport: 1440 × 900 CSS px.
- Browser screenshot: 2178 × 10120 px full-page artifact from the Codex in-app browser; browser-reported `devicePixelRatio` was 0.65 and the screenshot backend applied its own capture scaling.
- Comparison method: the source reference and browser-rendered full-page screenshot were opened together in the same comparison input. The implementation journey section was judged as a content region rather than by raw screenshot pixel density, because the source is a section crop while the implementation evidence is a full-page capture.
- Responsive verification also covered 1280 × 800 and 1920 × 1080 CSS px.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: the implementation preserves the reference's strong two-line display hierarchy, compact uppercase eyebrow, readable supporting copy, and restrained UI labels. The existing brand display font and Onest body system are intentionally retained rather than copied pixel-for-pixel.
- Spacing and layout rhythm: the two-column heading, system band, equal four-card grid, process connector, and bottom summary form the same visual hierarchy as the reference. Card widths and heights are equal at all three checked desktop widths; no horizontal overflow was detected.
- Colors and visual tokens: the white/warm-neutral surfaces, orange action accents, and green director/result state follow both the source direction and the existing site palette. Borders and shadows remain soft and avoid heavy elevation.
- Image quality and asset fidelity: the implementation uses the project's real product-screen components and existing food imagery. Role and benefit icons are library SVGs with a consistent visual system; no emoji, placeholder art, or handcrafted SVG substitute is used.
- Copy and content: the required role sequence remains `01 Гость → 02 Кассир → 03 Кухня → 04 Директор`; labels and descriptions remain coherent with the existing product screens.
- Icons and states: nine journey icons render successfully. Role accents, phone screens, connector nodes, and result state are visually aligned; browser console reported no errors or warnings.
- Accessibility and responsiveness: the section has no clipped labels at 1280, 1440, or 1920 px, no horizontal page overflow, and the existing reduced-motion behavior remains intact.

## Comparison history

1. Initial responsive pass found a P2 issue at 1280 × 800: the four role descriptions were forced onto one line and could truncate.
2. Fix applied in `assets/css/desktop-landing.css`: role descriptions now use a two-line clamp with a stable 23 px text block.
3. Post-fix evidence at 1280 × 800: every caption reports `clientHeight = scrollHeight = 23`, all four cards are equal at 281 × 520 px, nine SVG icons render, and horizontal overflow is false.
4. Post-fix evidence at 1440 × 900: all four cards are equal at 321 × 520 px and captions fit.
5. Post-fix evidence at 1920 × 1080: all four cards are equal at 385 × 548 px, the large-desktop media query is active, and captions fit.

## Full-view comparison evidence

- The implementation visibly reproduces the reference's primary composition: bold headline on the left, concise explanation and benefit chips on the right, one unifying system band, four role cards, a continuous journey line, and a final summary band.
- The implementation is deliberately not a pixel clone: it keeps the live product UI, current brand typography, and the site's existing warm palette while matching the reference's clarity, air, and premium SaaS character.

## Focused region comparison evidence

- The role-card region was inspected at readable scale: number badges, role labels, captions, SVG icons, phone frames, process nodes, and the green director state are all present and consistently aligned.
- The top system band and bottom summary band were inspected separately in the rendered capture; border strength, radius, shadow softness, icon treatment, and text hierarchy remain visually connected to the cards.

## Implementation checklist

- [x] Preserve the four required roles and their order.
- [x] Strengthen the section heading and explanatory hierarchy.
- [x] Present four equal premium cards with real product screens.
- [x] Add a clear process connector and summary bands.
- [x] Use consistent SVG icons and restrained accent colors.
- [x] Verify 1280, 1440, and 1920 desktop widths.
- [x] Verify production build and browser console.

## Follow-up polish

- P3: if the section is later optimized for a specific marketing display, phone scale can be tuned by 3–5% for that exact viewport without changing the current structure.

final result: passed
