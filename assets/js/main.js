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
  var finalSection = document.getElementById('final');
  var finalInView = false;
  if (finalSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { finalInView = e.isIntersecting; });
      onScroll();
    }, { rootMargin: '0px 0px -10% 0px' }).observe(finalSection);
  }
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    // Скрываем плавающую кнопку в блоке #final — там уже есть свои Telegram/MAX-кнопки,
    // и фикс-кнопка иначе перекрывает их снизу.
    mobileCta.classList.toggle('show', y > 600 && !finalInView);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================================
     Hero autoplay — пока пользователь не тронул скролл/демо сам,
     телефон в hero-акте сам крутит гостевой сценарий по кругу
     (venue → menu → checkout → success → venue…), чтобы механика
     была видна сразу при заходе на сайт, без необходимости скроллить.
     Останавливается насовсем при первом реальном уходе скролла из
     hero-акта (см. drive()/setupMobile() ниже) или любом клике внутри
     демо/по переключателю ролей — дальше решает либо скролл, либо
     сам гость. Кнопки "Смотреть демо"/"Как это работает" (href="#story")
     перезапускают показ с начала. ---- */
  if (window.YJ_HERO_DEMO && !reduce) {
    var HERO_AUTOPLAY_SEQ = [['venue', 1600], ['menu', 1700], ['checkout', 1700], ['success', 2300]];
    var heroAutoplaySeqIndex = 0;
    var heroAutoplayTimer = null;
    var heroAutoplayActive = false;

    var heroAutoplayStep = function () {
      if (!heroAutoplayActive) return;
      var entry = HERO_AUTOPLAY_SEQ[heroAutoplaySeqIndex];
      window.YJ_HERO_DEMO.applyState('guest', entry[0]);
      heroAutoplaySeqIndex = (heroAutoplaySeqIndex + 1) % HERO_AUTOPLAY_SEQ.length;
      heroAutoplayTimer = window.setTimeout(heroAutoplayStep, entry[1]);
    };

    var startHeroAutoplay = function () {
      if (heroAutoplayActive) return;
      heroAutoplayActive = true;
      heroAutoplaySeqIndex = 0;
      heroAutoplayStep();
    };

    var stopHeroAutoplay = function () {
      heroAutoplayActive = false;
      if (heroAutoplayTimer) { window.clearTimeout(heroAutoplayTimer); heroAutoplayTimer = null; }
    };

    window.YJ_HERO_AUTOPLAY = { start: startHeroAutoplay, stop: stopHeroAutoplay };

    window.addEventListener('yj:manual-role', stopHeroAutoplay);
    var heroDemoEl = document.getElementById('heroDemo');
    if (heroDemoEl) heroDemoEl.addEventListener('pointerdown', stopHeroAutoplay, { once: true });

    // Клик может запустить smooth-scroll издалека — по пути скролл-контроллер
    // проходит через промежуточные акты и тут же остановит автоплей (см. drive()
    // ниже), поэтому перезапускаем и сразу, и повторно после того, как скролл
    // реально осядет на hero-акте.
    document.querySelectorAll('a[href="#story"]').forEach(function (link) {
      link.addEventListener('click', function () {
        startHeroAutoplay();
        if ('onscrollend' in window) {
          window.addEventListener('scrollend', startHeroAutoplay, { once: true });
        } else {
          window.setTimeout(startHeroAutoplay, 700);
        }
      });
    });

    startHeroAutoplay();
  }

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

  /* ============================================================
     Способы получения заказа (.way-card): собственный stagger-reveal
     с прорисовкой иконок + spotlight/3D-tilt по курсору. Отдельно от
     общего [data-reveal] выше — тут нужна своя хореография (--i
     задержки на CSS-стороне, --rx/--ry/--mx/--my на pointermove),
     смешивать с generic-observer нельзя: он бы сбросил transform
     раньше, чем доиграет entrance-анимация карточки.
     ============================================================ */
  var wayCards = [].slice.call(document.querySelectorAll('[data-way-card]'));
  if (wayCards.length) {
    if ('IntersectionObserver' in window) {
      var wayIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            wayIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3, rootMargin: '0px 0px -6% 0px' });
      wayCards.forEach(function (card) { wayIo.observe(card); });
    } else {
      wayCards.forEach(function (card) { card.classList.add('in-view'); });
    }

    var fineHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!reduce && fineHover.matches) {
      wayCards.forEach(function (card) {
        function onWayMove(e) {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width;
          var y = (e.clientY - r.top) / r.height;
          card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
          card.style.setProperty('--rx', ((0.5 - y) * 9).toFixed(2) + 'deg');
          card.style.setProperty('--ry', ((x - 0.5) * 11).toFixed(2) + 'deg');
        }
        card.addEventListener('pointermove', function (e) {
          card.classList.add('is-tracking');
          onWayMove(e);
        }, { passive: true });
        card.addEventListener('pointerleave', function () {
          card.classList.remove('is-tracking');
          card.style.removeProperty('--rx');
          card.style.removeProperty('--ry');
        });
      });
    }
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
      { id: 'cash',     vh: 230, states: ['sent', 'received', 'accepted'] },
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

    function clamp01(value) {
      return Math.max(0, Math.min(1, value));
    }

    function smoothRange(progress, start, end) {
      var value = clamp01((progress - start) / (end - start));
      return value * value * (3 - 2 * value);
    }

    function setCashTimeline(progress) {
      var p = clamp01(progress);
      var sent = smoothRange(p, 0.32, 0.40);
      var received = smoothRange(p, 0.40, 0.55);
      var accepted = smoothRange(p, 0.75, 0.90);
      var statusProgress = p < 0.40 ? 0.32 * sent : (p < 0.75 ? 0.32 + 0.36 * received : 0.68 + 0.32 * accepted);
      // The receipt does not exist before this chapter. It feeds down first,
      // then its content and cashier statuses are drawn from the same progress.
      storyStage.style.setProperty('--cash-progress', p.toFixed(3));
      storyStage.style.setProperty('--cash-intro', smoothRange(p, 0, 0.15).toFixed(3));
      storyStage.style.setProperty('--cash-paper', smoothRange(p, 0.05, 0.24).toFixed(3));
      storyStage.style.setProperty('--cash-head', smoothRange(p, 0.09, 0.18).toFixed(3));
      storyStage.style.setProperty('--cash-number', smoothRange(p, 0.13, 0.22).toFixed(3));
      storyStage.style.setProperty('--cash-received', received.toFixed(3));
      storyStage.style.setProperty('--cash-accept', smoothRange(p, 0.55, 0.75).toFixed(3));
      storyStage.style.setProperty('--cash-accepted', accepted.toFixed(3));
      storyStage.style.setProperty('--cash-line-1', smoothRange(p, 0.18, 0.27).toFixed(3));
      storyStage.style.setProperty('--cash-line-2', smoothRange(p, 0.23, 0.32).toFixed(3));
      storyStage.style.setProperty('--cash-line-3', smoothRange(p, 0.28, 0.36).toFixed(3));
      storyStage.style.setProperty('--cash-total', smoothRange(p, 0.32, 0.42).toFixed(3));
      storyStage.style.setProperty('--cash-sent', sent.toFixed(3));
      storyStage.style.setProperty('--cash-status-progress', statusProgress.toFixed(3));
    }

    function applyPanel(actIndex) {
      var actId = STORY_ACTS[actIndex].id;
      storyStage.setAttribute('data-story-act', actId);
      storyStage.setAttribute('data-order-phase', actId);
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
      if (act.id !== 'hero' && window.YJ_HERO_AUTOPLAY) window.YJ_HERO_AUTOPLAY.stop();
      var sub = act.states[subIndex];
      storyStage.setAttribute('data-cash-step', act.id === 'cash' ? sub : '');
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
        // Keep chapter boundaries exact so the cash-only receipt can never leak
        // into selection or checkout while the user reverses the scroll.
        if (rawAct >= 1 && rawAct < 4) {
          actIndex = Math.floor(rawAct);
        }

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
        if (act.id === 'cash') {
          subIndex = localP < 0.40 ? 0 : (localP < 0.75 ? 1 : 2);
        } else if (act.states.length > 1) {
          subIndex = pickIndex(localP * (act.states.length - 1), lastSub[actIndex], act.states.length, 0.12);
        }

        // The cashier chapter is continuous: CSS values are interpolated from
        // scroll progress even between the three unchanged phone states.
        setCashTimeline(act.id === 'cash' ? localP : 0);

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
      // Keep the neutral initial phase explicit without resetting the phone's
      // existing hero state; tick() will replace it immediately on deep links.
      applyPanel(0);
      tick();

      return function cleanup() {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('yj:manual-role', onManualRole);
        storyTrack.style.removeProperty('height');
      };
    }

    function setupMobile() {
      storyTrack.style.removeProperty('height');
      storyStage.style.removeProperty('--cash-progress');
      storyStage.style.removeProperty('--cash-intro');
      storyStage.style.removeProperty('--cash-paper');
      storyStage.style.removeProperty('--cash-head');
      storyStage.style.removeProperty('--cash-number');
      storyStage.style.removeProperty('--cash-received');
      storyStage.style.removeProperty('--cash-accept');
      storyStage.style.removeProperty('--cash-accepted');
      storyStage.style.removeProperty('--cash-line-1');
      storyStage.style.removeProperty('--cash-line-2');
      storyStage.style.removeProperty('--cash-line-3');
      storyStage.style.removeProperty('--cash-total');
      storyStage.style.removeProperty('--cash-sent');
      storyStage.style.removeProperty('--cash-status-progress');
      storyStage.removeAttribute('data-story-act');
      storyStage.removeAttribute('data-cash-step');
      storyStage.removeAttribute('data-order-phase');
      var io = null;
      var revealIo = null;

      if ('IntersectionObserver' in window) {
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var actId = entry.target.getAttribute('data-act');
            if (actId !== 'hero' && window.YJ_HERO_AUTOPLAY) window.YJ_HERO_AUTOPLAY.stop();
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
      storyStage.setAttribute('data-story-act', 'hero');
      storyStage.setAttribute('data-cash-step', '');
      storyStage.setAttribute('data-order-phase', 'hero');
      storyStage.style.setProperty('--cash-progress', 0);
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
