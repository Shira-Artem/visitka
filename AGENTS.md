# Visitka project context

## Approved design baselines

Before redesign or frontend implementation work, read:

- `qa/approved-mockups/README.md`

Two approved local mockups are the visual source of truth:

1. Desktop — **«Продукт в телефоне»**
   - Interactive approved mockup: `qa/approved-mockups/01-desktop-landing-approved.html`
   - Reference screenshot: `qa/approved-mockups/01-desktop-landing-approved.png`

2. Mobile — **«Маршрут заказа»**
   - Preserved working source: `qa/approved-mockups/02-mobile-order-route-working/`
   - Main UI source: `qa/approved-mockups/02-mobile-order-route-working/src/Prototype.tsx`
   - Main styles: `qa/approved-mockups/02-mobile-order-route-working/src/prototype.css`
   - Reference screenshot: `qa/approved-mockups/02-mobile-order-route-approved.png`

Treat everything inside `qa/approved-mockups/` as immutable reference material unless the user explicitly asks to update the approved baseline. Implement production changes in the main project files, then compare them against these references.

Desktop and mobile share the brand, content, and product screens, but they have separate compositions. Do not implement desktop as a stretched mobile page or mobile as a reduced desktop page.
