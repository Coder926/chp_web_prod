/* ══════════════════════════════════════════════════════════════════════
   CHP Home — shared interactions
   FAQ tabs/accordion/cap, fade-in, eyebrow typewriter, gallery pause/play.
   Hamburger menu + nav scroll state live inline in NavBar.astro.
   ══════════════════════════════════════════════════════════════════════ */

/* ── FAQ accordion ───────────────────────────────────────────────────── */
document.querySelectorAll('.faq-q').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var item = btn.closest('.faq-item');
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function(el) {
      el.classList.remove('open');
      el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ── FAQ tabs + cap ──────────────────────────────────────────────────── */
(function() {
  var faqExpanded = false;
  var FAQ_CAP = 8;

  function applyFaqCap() {
    var activeTab = document.querySelector('.faq-tab.active');
    var cat = activeTab ? activeTab.getAttribute('data-tab') : 'all';
    var visible = Array.prototype.slice.call(document.querySelectorAll('.faq-item.show'));
    if (cat === 'all') {
      visible.sort(function(a, b) {
        var pa = parseInt(a.getAttribute('data-priority'), 10); if (isNaN(pa)) pa = 999;
        var pb = parseInt(b.getAttribute('data-priority'), 10); if (isNaN(pb)) pb = 999;
        return pa - pb;
      });
    }
    var hidden = 0;
    visible.forEach(function(item, i) {
      if (!faqExpanded && i >= FAQ_CAP) {
        item.classList.add('faq-capped');
        hidden++;
      } else {
        item.classList.remove('faq-capped');
      }
    });
    var wrap = document.getElementById('faq-more-wrap');
    var btn = document.getElementById('faq-more-btn');
    if (wrap) wrap.style.display = (!faqExpanded && hidden > 0) ? 'block' : 'none';
    if (btn) btn.textContent = 'Show ' + hidden + ' more →';
  }
  applyFaqCap();

  var faqMoreBtn = document.getElementById('faq-more-btn');
  if (faqMoreBtn) {
    faqMoreBtn.addEventListener('click', function() {
      faqExpanded = true;
      faqMoreBtn.setAttribute('aria-expanded', 'true');
      document.querySelectorAll('.faq-item.faq-capped').forEach(function(item) {
        item.classList.remove('faq-capped');
      });
      document.getElementById('faq-more-wrap').style.display = 'none';
    });
  }

  document.querySelectorAll('.faq-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.faq-tab').forEach(function(t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var cat = tab.getAttribute('data-tab');
      faqExpanded = false;
      var el = document.getElementById('faq-more-btn');
      if (el) el.setAttribute('aria-expanded', 'false');
      document.querySelectorAll('.faq-item').forEach(function(item) {
        item.classList.remove('open');
        var b = item.querySelector('.faq-q');
        if (b) b.setAttribute('aria-expanded', 'false');
        if (cat === 'all' || item.getAttribute('data-cat') === cat) {
          item.classList.add('show');
        } else {
          item.classList.remove('show');
          item.classList.remove('faq-capped');
        }
      });
      applyFaqCap();
    });
  });
})();

/* ── Eyebrow typewriter ──────────────────────────────────────────────── */
(function() {
  var eyebrows = document.querySelectorAll('.eyebrow');
  function typeEl(el) {
    if (el._typed) return;
    el._typed = true;
    var full = el.textContent.trim();
    el.textContent = '';
    el.classList.add('eyebrow-typed');
    var i = 0;
    var t = setInterval(function() {
      el.textContent = full.slice(0, ++i);
      if (i >= full.length) clearInterval(t);
    }, 55);
  }
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) typeEl(e.target); });
  }, { threshold: 0.5 });
  eyebrows.forEach(function(el) { io.observe(el); });
})();

/* ── Fade-in on scroll ───────────────────────────────────────────────── */
if ('IntersectionObserver' in window) {
  document.querySelectorAll('.fi').forEach(function(el) {
    new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.1 }).observe(el);
  });
}

/* ── Gallery pause/play ──────────────────────────────────────────────── */
(function() {
  var btn = document.getElementById('wg-pause-btn');
  if (!btn) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { btn.style.display = 'none'; return; }
  var paused = false;
  var pauseIcon = '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="1.5" y="1" width="3" height="10" rx="1"/><rect x="7.5" y="1" width="3" height="10" rx="1"/></svg>';
  var playIcon = '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><polygon points="2,1 11,6 2,11"/></svg>';
  btn.addEventListener('click', function() {
    paused = !paused;
    document.querySelectorAll('.wg-track').forEach(function(t) {
      t.style.animationPlayState = paused ? 'paused' : 'running';
    });
    btn.setAttribute('aria-pressed', paused);
    btn.setAttribute('aria-label', paused ? 'Play gallery animation' : 'Pause gallery animation');
    btn.innerHTML = (paused ? playIcon + ' Play' : pauseIcon + ' Pause');
  });
})();
