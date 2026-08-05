/* ============================================================
   main.js — интерактив лендинга ЮртаНеЖди
   Без внешних зависимостей. Vanilla JS + IntersectionObserver.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Шапка при скролле + мобильная фикс-кнопка ---- */
  var header = document.getElementById('header');
  var mobileCta = document.getElementById('mobileCta');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    mobileCta.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Бургер-меню ---- */
  var burger = document.getElementById('burger');
  var mmenu = document.getElementById('mmenu');
  burger.addEventListener('click', function () {
    mmenu.classList.toggle('open');
    document.body.style.overflow = mmenu.classList.contains('open') ? 'hidden' : '';
  });
  mmenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      mmenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ---- Reveal секций при появлении в зоне видимости ---- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Hero phone motion: slow float + desktop cursor parallax ---- */
  var heroPhone = document.getElementById('heroPhone');
  if (heroPhone && !reduce) {
    var hero = document.getElementById('story');
    var desktop = window.matchMedia('(min-width:981px)');
    var target = { x: 0, y: 0, rx: 0, ry: 0 };
    var current = { x: 0, y: 0, rx: 0, ry: 0 };
    var motionStart = performance.now();

    function resetHeroPhone() {
      target.x = 0; target.y = 0; target.rx = 0; target.ry = 0;
    }

    function onHeroPointer(e) {
      if (!desktop.matches || !hero) {
        resetHeroPhone();
        return;
      }
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      target.x = x * 12;
      target.y = y * -7;
      target.rx = y * -2.2;
      target.ry = x * 3;
    }

    function renderHeroPhone(now) {
      var t = (now - motionStart) / 1000;
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      current.rx += (target.rx - current.rx) * 0.08;
      current.ry += (target.ry - current.ry) * 0.08;

      // Base tilt stays fixed (no idle sine jitter on rotation) so the phone's
      // text renders crisp at rest — sub-pixel rotation every frame is what
      // made it look permanently smudged. Only the deliberate float (Y) and
      // deliberate pointer parallax move continuously.
      var floatY = Math.sin(t * 1.05) * 6;
      var rotateX = 1 + current.rx;
      var rotateY = -2.4 + current.ry;

      heroPhone.style.transform =
        'translate3d(' + current.x.toFixed(2) + 'px,' + (floatY + current.y).toFixed(2) + 'px,0) ' +
        'rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg)';

      requestAnimationFrame(renderHeroPhone);
    }

    if (hero) {
      hero.addEventListener('pointermove', onHeroPointer, { passive: true });
      hero.addEventListener('pointerleave', resetHeroPhone);
    }
    if (desktop.addEventListener) {
      desktop.addEventListener('change', resetHeroPhone);
    } else {
      desktop.addListener(resetHeroPhone);
    }
    requestAnimationFrame(renderHeroPhone);

    // Тактильный "pop" при ручном клике по роли — на отдельном CSS-свойстве `scale`,
    // не на `transform` (которым каждый кадр владеет rAF выше), поэтому анимации не
    // конфликтуют: браузер компонует scale и transform независимо.
    window.addEventListener('yj:manual-role', function () {
      heroPhone.classList.remove('is-pulse');
      void heroPhone.offsetWidth;
      heroPhone.classList.add('is-pulse');
    });
  }

  /* ============================================================
     Story scroll controller — единственный телефон (#heroDemo),
     sticky от Hero до акта «Директор». Веса актов ниже — единственный
     источник правды для длины сценария (см. plan2.md, ~495svh итого).
     ============================================================ */
  var storyTrack = document.getElementById('storyTrack');
  var storyStage = document.getElementById('storyStage');

  if (storyTrack && storyStage && window.YJ_HERO_DEMO) {
    var STORY_ACTS = [
      { id: 'hero',     vh: 70,  states: ['idle'] },
      { id: 'how',      vh: 130, states: ['venue', 'menu', 'checkout', 'success'] },
      { id: 'checkout', vh: 65,  states: ['checkout'] },
      { id: 'cash',     vh: 65,  states: ['new', 'accepted'] },
      { id: 'kitchen',  vh: 90,  states: ['new', 'cooking', 'ready'] },
      { id: 'director', vh: 75,  states: ['default'] }
    ];
    var ACT_ROLE = { hero: 'guest', how: 'guest', checkout: 'guest', cash: 'cash', kitchen: 'cook', director: 'director' };
    var MOBILE_ACT_STATE = { hero: 'venue', how: 'success', checkout: 'checkout', cash: 'accepted', kitchen: 'ready', director: 'default' };
    var HOW_COPY = {
      venue: { kicker: 'Шаг 1 / 4', headline: 'Открыл Telegram / MAX' },
      menu: { kicker: 'Шаг 2 / 4', headline: 'Выбрал блюда' },
      checkout: { kicker: 'Шаг 3 / 4', headline: 'Оплатил' },
      success: { kicker: 'Шаг 4 / 4', headline: 'Забрал заказ' }
    };
    var KITCHEN_CHIP = { new: 'Новый заказ', cooking: 'Готовится', ready: 'Готово' };

    var totalVh = STORY_ACTS.reduce(function (sum, act) { return sum + act.vh; }, 0);
    var bounds = (function () {
      var acc = 0;
      return STORY_ACTS.map(function (act) {
        var start = acc / totalVh;
        acc += act.vh;
        return { start: start, end: acc / totalVh };
      });
    })();

    var actPanels = [].slice.call(document.querySelectorAll('.story__act-panel'));
    var dotEls = [].slice.call(document.querySelectorAll('.story__dots span'));
    var dotsEl = document.getElementById('storyDots');
    var auraSpans = [].slice.call(document.querySelectorAll('.story__aura span'));
    var howKicker = document.getElementById('storyHowKicker');
    var howHeadline = document.getElementById('storyHowHeadline');
    var kitchenChip = document.getElementById('storyKitchenChip');

    // Аура за телефоном красится под активную роль (гость/касса/кухня/директор) —
    // единственная точка входа, вызывается и из скролл-режима, и из mobile IO.
    function applyAura(role) {
      auraSpans.forEach(function (s) {
        s.classList.toggle('is-active', s.getAttribute('data-aura-role') === role);
      });
    }

    // Hysteresis: требует реально «перейти» границу с запасом (margin), а не
    // коснуться её — иначе медленный скролл туда-сюда рядом с границей дребезжит.
    function pickIndex(rawFloat, lastIndex, count, margin) {
      var rounded = Math.max(0, Math.min(count - 1, Math.round(rawFloat)));
      if (rounded === lastIndex) return lastIndex;
      var forward = rounded > lastIndex;
      var threshold = lastIndex + (forward ? (1 - margin) : -(1 - margin));
      var crossed = forward ? rawFloat >= threshold : rawFloat <= threshold;
      return crossed ? rounded : lastIndex;
    }

    function applyPanel(actIndex) {
      var actId = STORY_ACTS[actIndex].id;
      actPanels.forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-act') === actId);
      });
      dotEls.forEach(function (d, i) {
        d.classList.toggle('is-active', i === actIndex);
      });
      if (dotsEl) {
        dotsEl.style.setProperty('--rail-progress', STORY_ACTS.length > 1 ? actIndex / (STORY_ACTS.length - 1) : 0);
      }
      applyAura(ACT_ROLE[actId]);
    }

    // Единственная точка, которая двигает телефон: applyState() в hero-demo.js
    // сама отменяет предыдущие таймеры/rAF и синхронно приводит DOM к состоянию —
    // прыжковый скролл никогда не оставляет телефон на полпути.
    function drive(actIndex, subIndex) {
      var act = STORY_ACTS[actIndex];
      var sub = act.states[subIndex];
      applyPanel(actIndex);

      if (act.id === 'how' && howKicker && howHeadline) {
        var copy = HOW_COPY[sub] || HOW_COPY.venue;
        howKicker.textContent = copy.kicker;
        howHeadline.textContent = copy.headline;
      }
      if (act.id === 'kitchen' && kitchenChip) {
        kitchenChip.textContent = KITCHEN_CHIP[sub] || KITCHEN_CHIP.new;
      }

      window.YJ_HERO_DEMO.applyState(ACT_ROLE[act.id], act.id === 'hero' ? 'venue' : sub);
    }

    var desktopMQ = window.matchMedia('(min-width:981px)');
    var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    var teardown = null;

    function setupDesktop() {
      storyTrack.style.height = totalVh + 'svh';

      var lastActIndex = 0;
      var lastSub = STORY_ACTS.map(function () { return 0; });
      var manualOverride = false;
      var overrideActIndex = -1;
      var ticking = false;

      function onManualRole(e) {
        manualOverride = true;
        overrideActIndex = lastActIndex;
        if (e && e.detail) applyAura(e.detail.role);
      }

      function computeProgress() {
        var r = storyTrack.getBoundingClientRect();
        var scrollable = r.height - window.innerHeight;
        if (scrollable <= 0) return 0;
        return Math.max(0, Math.min(1, -r.top / scrollable));
      }

      function tick() {
        ticking = false;
        var progress = computeProgress();

        var rawAct = STORY_ACTS.length - 1;
        for (var i = 0; i < bounds.length; i++) {
          if (progress < bounds[i].end || i === bounds.length - 1) {
            var span = bounds[i].end - bounds[i].start;
            rawAct = i + (span > 0 ? (progress - bounds[i].start) / span : 0);
            break;
          }
        }

        var actIndex = pickIndex(rawAct, lastActIndex, STORY_ACTS.length, 0.12);

        if (manualOverride) {
          if (actIndex !== overrideActIndex) {
            manualOverride = false;
          } else {
            return; // пользователь исследует кабинет вручную — скролл не вмешивается
          }
        }

        var act = STORY_ACTS[actIndex];
        var actSpan = bounds[actIndex].end - bounds[actIndex].start;
        var localP = actSpan > 0 ? Math.max(0, Math.min(1, (progress - bounds[actIndex].start) / actSpan)) : 0;
        var subIndex = 0;
        if (act.states.length > 1) {
          subIndex = pickIndex(localP * (act.states.length - 1), lastSub[actIndex], act.states.length, 0.12);
        }

        if (actIndex !== lastActIndex || subIndex !== lastSub[actIndex]) {
          lastActIndex = actIndex;
          lastSub[actIndex] = subIndex;
          drive(actIndex, subIndex);
        }
      }

      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(tick);
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('yj:manual-role', onManualRole);
      drive(0, 0);

      return function cleanup() {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('yj:manual-role', onManualRole);
        storyTrack.style.removeProperty('height');
      };
    }

    function setupMobile() {
      storyTrack.style.removeProperty('height');
      var io = null;
      var revealIo = null;

      if ('IntersectionObserver' in window) {
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var actId = entry.target.getAttribute('data-act');
            actPanels.forEach(function (p) { p.classList.toggle('is-active', p === entry.target); });
            applyAura(ACT_ROLE[actId]);
            window.YJ_HERO_DEMO.applyState(ACT_ROLE[actId], MOBILE_ACT_STATE[actId]);
          });
        }, { threshold: 0.5 });

        actPanels.forEach(function (p) { io.observe(p); });

        // Отдельный, более ранний триггер только для fade-in карточки — не завязан
        // на состояние телефона, поэтому карта успевает проявиться до смены роли.
        revealIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              revealIo.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15 });
        actPanels.forEach(function (p) {
          if (p.getAttribute('data-act') !== 'hero') revealIo.observe(p);
        });
      } else {
        actPanels.forEach(function (p) { p.classList.add('in-view'); });
      }

      actPanels.forEach(function (p, i) { p.classList.toggle('is-active', i === 0); });
      applyAura('guest');
      window.YJ_HERO_DEMO.applyState('guest', 'venue');

      return function cleanup() {
        if (io) io.disconnect();
        if (revealIo) revealIo.disconnect();
      };
    }

    function setup() {
      if (teardown) teardown();
      teardown = (!desktopMQ.matches || reduceMQ.matches) ? setupMobile() : setupDesktop();
    }

    setup();

    if (desktopMQ.addEventListener) {
      desktopMQ.addEventListener('change', setup);
      reduceMQ.addEventListener('change', setup);
    } else {
      desktopMQ.addListener(setup);
      reduceMQ.addListener(setup);
    }
  }
})();
