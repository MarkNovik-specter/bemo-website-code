/* ============================================================
   BEMO NEXT — Interaktionen & Animationen
   Prinzip: Ohne JS ist die Seite vollständig sichtbar.
   Initialzustände werden NUR per JS gesetzt (gsap.set).
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var EASE = 'power3.out';

  if (hasGsap && !prefersReduced) {
    document.documentElement.classList.add('js-anim');
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Navigation: Scroll-Zustand + Hero-Erkennung ---------- */
  var nav = document.querySelector('.nav_wrap');
  if (nav) {
    var firstSection = document.querySelector('main section, body section:not(.nav_wrap)');
    var darkHero = document.querySelector('.home_hero, .u-theme-dark');
    var heroAtTop = false;
    if (darkHero) {
      var r = darkHero.getBoundingClientRect();
      heroAtTop = r.top <= 80; // Hero beginnt direkt oben
    }
    if (document.querySelector('.home_hero')) heroAtTop = true;
    var onScroll = function () {
      var sc = window.scrollY > 40;
      nav.classList.toggle('is-scrolled', sc);
      nav.classList.toggle('is-light-text', heroAtTop && !sc && !document.body.classList.contains('menu-open'));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var burger = document.querySelector('.nav_burger');
    if (burger) {
      burger.addEventListener('click', function () {
        document.body.classList.toggle('menu-open');
        onScroll();
      });
      document.querySelectorAll('.nav_menu_link').forEach(function (l) {
        l.addEventListener('click', function () { document.body.classList.remove('menu-open'); });
      });
    }
  }

  /* ---------- Hero-Entrance (Home) ---------- */
  if (hasGsap && !prefersReduced) {
    var heroImg = document.querySelector('.home_hero_img');
    var heroBits = document.querySelectorAll('.home_hero .u-eyebrow, .home_hero_title, .home_hero_sub, .home_hero_actions');
    if (heroImg) {
      var tl = gsap.timeline({ defaults: { ease: EASE } });
      gsap.set(heroBits, { autoAlpha: 0, y: 28 });
      tl.fromTo(heroImg, { scale: 1.14 }, { scale: 1.06, duration: 2.2, ease: 'power2.out' }, 0)
        .to(heroBits, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 }, 0.35);
      // Sanftes Weiteratmen des Bildes beim Scrollen
      if (window.ScrollTrigger) {
        gsap.to(heroImg, {
          yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: '.home_hero', start: 'top top', end: 'bottom top', scrub: true }
        });
      }
    }

    /* ---------- Scroll-Reveals ---------- */
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      gsap.set(el, { autoAlpha: 0, y: 26 });
      gsap.to(el, {
        autoAlpha: 1, y: 0, duration: 0.85, ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
      var kids = group.children;
      gsap.set(kids, { autoAlpha: 0, y: 24 });
      gsap.to(kids, {
        autoAlpha: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.09,
        scrollTrigger: { trigger: group, start: 'top 85%', once: true }
      });
    });
    document.querySelectorAll('.u-hairline').forEach(function (line) {
      gsap.set(line, { scaleX: 0 });
      gsap.to(line, {
        scaleX: 1, duration: 1.1, ease: EASE,
        scrollTrigger: { trigger: line, start: 'top 90%', once: true }
      });
    });
    /* Bild-Reveal mit Maske */
    document.querySelectorAll('[data-reveal-img]').forEach(function (wrap) {
      var img = wrap.querySelector('img');
      gsap.set(wrap, { clipPath: 'inset(8% 6% 8% 6% round 16px)', autoAlpha: 0 });
      if (img) gsap.set(img, { scale: 1.15 });
      var tl2 = gsap.timeline({
        scrollTrigger: { trigger: wrap, start: 'top 82%', once: true }
      });
      tl2.to(wrap, { clipPath: 'inset(0% 0% 0% 0% round 16px)', autoAlpha: 1, duration: 1.15, ease: EASE }, 0);
      if (img) tl2.to(img, { scale: 1, duration: 1.4, ease: EASE }, 0);
    });
  }

  /* ---------- Galerie (Detailseite): Zähler + Drag ---------- */
  document.querySelectorAll('[data-gallery]').forEach(function (gal) {
    var track = gal.querySelector('.det_gallery_track');
    var count = gal.querySelector('.det_gallery_count');
    if (!track) return;
    var items = track.querySelectorAll('.det_gallery_item');
    var total = items.length;
    var fmt = function (n) { return (n < 10 ? '0' : '') + n; };
    if (count && total) {
      count.textContent = '01 — ' + fmt(total);
      track.addEventListener('scroll', function () {
        var mid = track.scrollLeft + track.clientWidth / 2;
        var idx = 0, acc = 0;
        for (var i = 0; i < items.length; i++) {
          acc = items[i].offsetLeft + items[i].offsetWidth / 2;
          if (Math.abs(acc - mid) < items[i].offsetWidth * 0.6) { idx = i; break; }
        }
        count.textContent = fmt(idx + 1) + ' — ' + fmt(total);
      }, { passive: true });
    }
    /* Drag-to-scroll (Desktop) */
    var isDown = false, startX = 0, startLeft = 0;
    track.addEventListener('pointerdown', function (e) {
      isDown = true; startX = e.clientX; startLeft = track.scrollLeft;
      track.style.cursor = 'grabbing'; track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      track.scrollLeft = startLeft - (e.clientX - startX);
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      track.addEventListener(ev, function () { isDown = false; track.style.cursor = 'grab'; });
    });
  });

  /* ---------- Einwertungs-Tool: Schritte ---------- */
  document.querySelectorAll('[data-einwertung]').forEach(function (tool) {
    var steps = tool.querySelectorAll('.ein_step');
    if (!steps.length) return;
    var bar = tool.querySelector('.ein_progress_bar');
    var current = 0;
    var show = function (i) {
      current = Math.max(0, Math.min(i, steps.length - 1));
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === current); });
      if (bar) bar.style.width = ((current + 1) / steps.length * 100) + '%';
      var label = tool.querySelector('.ein_step_label');
      if (label) label.textContent = 'Schritt ' + (current + 1) + ' von ' + steps.length;
    };
    tool.querySelectorAll('[data-next]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        /* Pflichtfelder des aktiven Schritts prüfen */
        var invalid = false;
        steps[current].querySelectorAll('input[required], select[required]').forEach(function (f) {
          if (!f.checkValidity()) { f.reportValidity(); invalid = true; }
        });
        if (!invalid) show(current + 1);
      });
    });
    tool.querySelectorAll('[data-prev]').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.preventDefault(); show(current - 1); });
    });
    show(0);
  });

  /* ---------- Sanfter Anker-Scroll zum Anfrage-Formular ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    a.addEventListener('click', function (e) {
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ---------- Aktiven Nav-Link markieren ---------- */
  document.querySelectorAll('.nav_link, .nav_menu_link').forEach(function (a) {
    if (a.getAttribute('href') === location.pathname) a.classList.add('w--current');
  });

  /* ---------- Footer-Jahr ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
