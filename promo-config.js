/* ════════════════════════════════════════════════════════════
   CHP HOME — PROMOTION CONFIG (static/fallback source)

   IMPORTANT (2026-08-23 audit): this file is NO LONGER the single
   source of truth for the whole site. Only these pages read it:
     - src/pages/booking.astro (loaded via <script src="/promo-config.js">)
     - src/components/BookingWizard.vue (checkout-step banner —
       prefers window.activePromotion; falls back to the API below
       only if this is absent/inactive)

   All other pages (src/pages/index.astro, src/templates/
   BoilerServiceTemplate.astro — 8 region pages, and
   src/pages/areas/boiler-service/index.astro — the hub page) do NOT
   read this file at all. They fetch the live promotion straight from
   the backend: GET {apiBaseUrl}/customer/promotions/active

   To keep the whole site showing the SAME promotion, the values below
   must be kept in sync by hand with whatever promotion record is
   active in the backend. There is no automatic sync between the two.
   See 09_Integrations/ audit notes in the CHP_Home project for the
   full write-up of this split (flagged 2026-08-23, not yet resolved).

   active: true  → promo shown on booking.astro / BookingWizard.vue
   active: false → promo hidden there (default off state)

   Discount is applied by the customer entering `code` on the Stripe
   Checkout page (allow_promotion_codes: true) — NOT calculated here.

   To change or end a promotion: edit the values below only, AND
   update/confirm the matching backend promotion record so the rest
   of the site (homepage, region pages, hub page) stays consistent.
════════════════════════════════════════════════════════════ */
window.activePromotion = {
  active: false,                                   // ← set false to turn off on booking.astro / BookingWizard.vue
  code:   'SUMMER10',                              // ← must match the active backend promotion record's code
  label:  'Offer ends 31 Aug',                     // short label — booking page banner headline
  text:   'Save £10 with code SUMMER10',           // short line — booking page banner
  detail: 'Enter code SUMMER10 at checkout to save £10 on your boiler service.'
};
