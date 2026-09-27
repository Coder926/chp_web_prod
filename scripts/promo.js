/* ══════════════════════════════════════════════════════════════════════
   CHP Home — promo logic (ticker bar + slide-in banner + hero badge)
   Depends on: window.activePromotion global from /promo-config.js

   Exposes:
     window.setTickerH()  — recalculates --bar-h from ticker bar height
     window.applyPromo(p) — applies a promo object { active, label, text, detail }
   ══════════════════════════════════════════════════════════════════════ */

function setTickerH() {
  var t = document.getElementById('ticker-bar');
  if (!t) return;
  var h = t.getBoundingClientRect().height;
  document.documentElement.style.setProperty('--bar-h', h + 'px');
}
setTickerH();
window.addEventListener('resize', setTickerH, { passive: true });

window.applyPromo = function(promoData) {
  if (!promoData || !promoData.active) return;

  /* ── Ticker bar ─────────────────────────────────────────────────── */
  var bar = document.getElementById('ticker-bar');
  var inner = document.getElementById('ticker-inner');
  if (bar) {
    bar.removeAttribute('hidden');
    bar.classList.add('ticker-promo');
  }
  if (inner) {
    var items = [
      { text: promoData.label, hi: true },
      { text: promoData.text }
    ];
    function buildUnit(times, hh) {
      var html = '';
      for (var i = 0; i < times; i++) {
        items.forEach(function(item) {
          var a = hh ? ' aria-hidden="true"' : '';
          html += '<span class="ticker-item' + (item.hi ? ' ticker-hi' : '') + '"' + a + '>' + item.text + '</span>' +
                  '<span class="ticker-sep"' + a + '></span>';
        });
      }
      return html;
    }
    var repeat = 3, guard = 8;
    do {
      inner.innerHTML = buildUnit(repeat, false) + buildUnit(repeat, true);
      repeat++;
    } while (inner.scrollWidth / 2 < window.innerWidth * 1.2 && guard-- > 0);
    inner.style.animationDuration = (Math.max(inner.scrollWidth / 2 / 22, 10)).toFixed(1) + 's';
  }
  setTickerH();

  /* ── Slide-in banner ────────────────────────────────────────────── */
  (function showSlide() {
    var SLIDE_KEY = 'chp_promo_slide_v1';
    if (sessionStorage.getItem(SLIDE_KEY) === 'dismissed') return;
    var slide = document.getElementById('promo-slide');
    var lbl = document.getElementById('ps-label');
    var dtl = document.getElementById('ps-detail');
    var close = document.getElementById('ps-close');
    if (!slide) return;
    if (lbl) lbl.textContent = promoData.label + ' — ' + promoData.text;
    if (dtl) dtl.textContent = promoData.detail || '';
    slide.removeAttribute('hidden');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      slide.classList.add('ps-visible');
    } else {
      setTimeout(function() { slide.classList.add('ps-visible'); }, 3000);
    }
    if (close) {
      close.addEventListener('click', function() {
        slide.classList.remove('ps-visible');
        setTimeout(function() { slide.setAttribute('hidden', ''); }, 450);
        sessionStorage.setItem(SLIDE_KEY, 'dismissed');
      });
    }
  })();

  /* ── Hero badge ─────────────────────────────────────────────────── */
  var heroPromo = document.getElementById('hero-promo');
  var heroPromoText = document.getElementById('hero-promo-text');
  if (heroPromo && heroPromoText) {
    heroPromoText.textContent = promoData.label + ' — ' + promoData.text;
    heroPromo.removeAttribute('hidden');
  }
};

/* Auto-apply static promo config if available */
if (window.activePromotion) {
  window.applyPromo(window.activePromotion);
}
