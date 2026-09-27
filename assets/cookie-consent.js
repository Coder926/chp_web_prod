/* ══════════════════════════════════════════════════════════════════════
   CHP Home — cookie consent (UK PECR / ICO), two-layer banner
   Single source of truth. Linked by every page that shows the banner;
   do not re-inline this logic in a page <script> block.

   LOAD ORDER — IMPORTANT
   Each page defines GA_MEASUREMENT_ID / gtag() / loadGoogleAnalytics()
   in its own inline <script>. This file is loaded with `defer`, so it
   always runs after every inline script has executed and after the DOM
   is parsed. The typeof guard in fireAnalytics() is a second, independent
   safety net: if a page ever drops the inline GA block, or the tag is
   copied without `defer`, consent still records correctly and the only
   consequence is that no analytics loads. Never call loadGoogleAnalytics()
   without that guard.

   STORAGE CONTRACT — unchanged from the single-layer banner
   Key    : chp_cookie_consent_v1
   Value  : "accepted|<epoch ms>" or "rejected|<epoch ms>"
   Expiry : 180 days, applied symmetrically to both choices.
   One optional category (analytics) means the binary value still fully
   describes the user's choice; no schema change is needed.
   ══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var KEY = 'chp_cookie_consent_v1';

  /* Consent expires after 6 months (180 days) — aligned with the ICO's stated
     general benchmark for re-requesting consent after a Reject (ICO "Guidance on
     the use of storage and access technologies", 29 Apr 2026, "How do we manage
     consent in practice?"), applied symmetrically to both accepted and rejected
     choices to avoid re-prompting one side more than the other (AK, 2026-08-12).
     Stored as "choice|timestamp"; a value with no timestamp is a pre-expiry
     legacy value and is re-asked. */
  var MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

  function rememberChoice(v) {
    try { localStorage.setItem(KEY, v + '|' + Date.now()); } catch (e) {}
  }

  function readChoice() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { return null; }
    if (!raw) return null;
    var parts = String(raw).split('|');
    var when = parseInt(parts[1], 10);
    /* Raw legacy values without a timestamp (e.g. an old single-button '1')
       fail this check and are treated as no-choice — the banner re-asks
       rather than silently auto-accepting. */
    if (when && (Date.now() - when) < MAX_AGE_MS) return parts[0];
    try { localStorage.removeItem(KEY); } catch (e) {}
    return null;
  }

  /* The only place analytics is ever started. Guarded, and also announced as
     an event so a page can hook its own post-consent work without this file
     needing to know about it. */
  function fireAnalytics() {
    if (typeof loadGoogleAnalytics === 'function') {
      loadGoogleAnalytics();
    }
    try {
      document.dispatchEvent(new CustomEvent('chp:consent-accepted'));
    } catch (e) {}
  }

  function init() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;

    var layer1  = document.getElementById('cb-layer-1');
    var layer2  = document.getElementById('cb-layer-2');
    var manage  = document.getElementById('cb-manage');
    var toggle  = document.getElementById('cb-analytics');
    var btnAccept  = document.getElementById('cb-accept');
    var btnReject  = document.getElementById('cb-reject');
    var btnConfirm = document.getElementById('cb-confirm');
    var btnAccept2 = document.getElementById('cb-accept-2');

    /* Show/hide by class only. The layers are display:flex, so toggling the
       `hidden` attribute alone would not hide them — see cookie-consent.css. */
    function showLayer(n) {
      if (!layer1 || !layer2) return;
      layer1.classList.toggle('cb-hidden', n !== 1);
      layer2.classList.toggle('cb-hidden', n !== 2);
      if (manage) manage.setAttribute('aria-expanded', n === 2 ? 'true' : 'false');
    }

    function dismiss() {
      banner.classList.remove('cb-visible');
      setTimeout(function () { banner.style.display = 'none'; }, 420);
    }

    function accept() {
      rememberChoice('accepted');
      if (toggle) toggle.checked = true;
      dismiss();
      fireAnalytics();
    }

    function reject() {
      rememberChoice('rejected');
      if (toggle) toggle.checked = false;
      dismiss();
    }

    /* Analytics off is exactly equivalent to Reject all — same stored value,
       same effect. Confirming with everything off must never be recorded as
       a partial acceptance. */
    function confirmChoices() {
      if (toggle && toggle.checked) { accept(); } else { reject(); }
    }

    /* An optional category is never pre-ticked. Reset defensively in case the
       browser restored the checkbox state across a reload. */
    if (toggle) toggle.checked = false;
    showLayer(1);

    var choice = readChoice();
    if (choice === 'accepted' || choice === 'rejected') {
      banner.style.display = 'none'; /* choice already made — skip entirely */
      if (choice === 'accepted') fireAnalytics();
      return;
    }

    /* Show after a short delay so page paint completes first */
    setTimeout(function () { banner.classList.add('cb-visible'); }, 600);

    if (btnAccept)  btnAccept.addEventListener('click', accept);
    if (btnReject)  btnReject.addEventListener('click', reject);
    if (btnAccept2) btnAccept2.addEventListener('click', accept);
    if (btnConfirm) btnConfirm.addEventListener('click', confirmChoices);

    if (manage) {
      manage.addEventListener('click', function () {
        showLayer(2);
        if (toggle) toggle.focus();
      });
    }
  }

  /* `defer` already guarantees a parsed DOM, but the readyState check keeps
     this file correct if it is ever included without defer. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
