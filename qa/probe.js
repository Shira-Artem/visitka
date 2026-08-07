/* ============================================================
   qa/probe.js — сверка «до/после» для рефакторингов.

   Снимает геометрию (getBoundingClientRect) и ~78 вычисленных свойств
   каждого элемента страницы в 17 точках прокрутки, плюс CSS-переменные
   сцен, классы панелей и подставляемые тексты. Сравнивает два снимка
   и показывает, что именно разошлось.

   Как пользоваться (страница открыта в браузере):

     1) на ИСХОДНОМ коде, сразу после перезагрузки страницы:
          await YJ_PROBE.store('before-390x844')
     2) внести правки, ПЕРЕЗАГРУЗИТЬ страницу, затем:
          await YJ_PROBE.compare('before-390x844')
        → { total: 0 } означает «ничего не поехало».

   Скрипт подключается вручную, в index.html его нет:
     var s=document.createElement('script'); s.src='/qa/probe.js';
     document.head.appendChild(s);

   Два правила, без которых замер врёт:
     - ПЕРЕЗАГРУЖАТЬ страницу перед каждым снимком. Классы .in-view /
       .is-active навешиваются один раз и не снимаются, поэтому уже
       пролистанная страница не сравнима со свежей.
     - Снимать «до» и «после» на одной ширине окна.

   Поле noisy в отчёте — расхождения в каналах, которые тикают от
   времени, а не от скролла (см. NOISY_NODE ниже). Они появляются даже
   при сравнении кода с самим собой и отличиями не считаются.
   ============================================================ */
(function () {
  var PROPS = ['opacity','transform','display','visibility','position','zIndex','color','backgroundColor','backgroundImage','backgroundSize','backgroundPosition','borderRadius','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','boxShadow','filter','backdropFilter','fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','textTransform','textAlign','textShadow','overflow','flexDirection','justifyContent','alignItems','gap','gridTemplateColumns','gridTemplateRows','order','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft','width','height','top','left','right','bottom','mixBlendMode','clipPath','animationName','animationDuration','animationDelay','animationTimingFunction','animationIterationCount','transitionProperty','transitionDuration','transitionDelay','transitionTimingFunction','pointerEvents','isolation','willChange','perspective','transformOrigin','strokeDasharray','strokeDashoffset','stroke','fill','strokeWidth','flexGrow','flexShrink','flexBasis','maxWidth','minHeight','whiteSpace'];

  var VARS = ['--cash-progress','--cash-intro','--cash-paper','--cash-head','--cash-number','--cash-received','--cash-accept','--cash-accepted','--cash-line-1','--cash-line-2','--cash-line-3','--cash-total','--cash-sent','--cash-status-progress','--st-base','--st-key','--st-tint','--scene-p','--story-p','--story-exit','--mobile-phone-top','--mobile-phone-width','--rail-progress','--rail-span','--rail-dir','--story-track-h'];

  var FREEZE_ID = 'yj-freeze-style';

  /* Детерминизм снимка. Всё, что тикает от настенных часов, а не от
     скролла, должно быть выключено, иначе «до» и «после» отличаются
     просто потому, что сняты в разные секунды:
       - CSS transition/animation глушим целиком (animation:none — база,
         а не случайный кадр; play-state:paused замораживает произвольный);
       - SMIL в SVG (огненная линия, пульсы) отматываем на t=0 и ставим на паузу;
       - автоплей телефона останавливаем — иначе роль на экране случайна. */
  function freeze(on) {
    var el = document.getElementById(FREEZE_ID);
    if (!on) { if (el) el.remove(); return; }
    if (el) return;
    el = document.createElement('style');
    el.id = FREEZE_ID;
    el.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}';
    document.head.appendChild(el);
    if (window.YJ_HERO_AUTOPLAY) window.YJ_HERO_AUTOPLAY.stop();
    [].forEach.call(document.querySelectorAll('svg'), function (svg) {
      if (svg.pauseAnimations) { try { svg.setCurrentTime(0); svg.pauseAnimations(); } catch (e) {} }
    });
  }

  function hash(str) {
    var h = 5381, i = str.length;
    while (i) h = (h * 33) ^ str.charCodeAt(--i);
    return (h >>> 0).toString(36);
  }

  /* Классы сортируем: порядок в атрибуте зависит от того, какой
     IntersectionObserver сработал первым, а на рендер не влияет вообще.
     Без сортировки «in-view is-active» и «is-active in-view» выглядят как
     разные элементы и дают ложные расхождения. */
  function keyOf(el, seen) {
    var cls = el.getAttribute('class') || '';
    var list = cls.trim() ? cls.trim().split(/\s+/).sort() : [];
    var base = (el.id ? '#' + el.id : el.tagName.toLowerCase() + (list.length ? '.' + list.slice(0, 3).join('.') : ''));
    seen[base] = (seen[base] || 0) + 1;
    return base + '|' + seen[base];
  }

  function snapshot() {
    var nodes = {}, seen = {};
    /* Внутренности телефона (#heroDemo) исключены из попиксельного сравнения:
       это hero-demo.js, который мы не трогаем, и его DOM живёт по своим
       таймерам. Вместо геометрии сравниваем его ЛОГИЧЕСКОЕ состояние —
       какую роль и какой экран ему велели показать (см. phone ниже). */
    var demoRoot = document.getElementById('heroDemo');
    var all = document.querySelectorAll('body *');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.id === FREEZE_ID) continue;
      if (demoRoot && demoRoot !== el && demoRoot.contains(el)) continue;
      var b = el.getBoundingClientRect();
      var cs = getComputedStyle(el);
      var s = '';
      for (var p = 0; p < PROPS.length; p++) s += cs[PROPS[p]] + ';';
      nodes[keyOf(el, seen)] = [
        Math.round(b.x * 4) / 4, Math.round(b.y * 4) / 4,
        Math.round(b.width * 4) / 4, Math.round(b.height * 4) / 4,
        cs.opacity, cs.transform, cs.display, hash(s)
      ];
    }
    var vars = {};
    ['#storyStage', '#story', '#storyDots', '#waysStage', '#waysTrack', '#storyTrack', '#header', '#mobileCta'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      var cs = getComputedStyle(el), o = {};
      VARS.forEach(function (n) { var v = cs.getPropertyValue(n).trim(); if (v) o[n] = v; });
      o['@class'] = el.getAttribute('class') || '';
      o['@inline'] = el.getAttribute('style') || '';
      ['data-story-act', 'data-order-phase', 'data-cash-step', 'data-mobile-story', 'data-way-mood'].forEach(function (a) {
        if (el.hasAttribute(a)) o['@' + a] = el.getAttribute(a);
      });
      vars[sel] = o;
    });
    var text = {};
    ['#storyHowKicker', '#storyHowHeadline', '#storyKitchenChip', '#waysEyebrow', '#waysHeadline', '#waysLead'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) text[sel] = el.innerHTML;
    });
    // Логическое состояние телефона: роль + активные экраны/вкладки.
    var phone = [];
    if (demoRoot) {
      phone.push('role:' + (demoRoot.getAttribute('data-role') || ''));
      [].forEach.call(demoRoot.querySelectorAll('.is-active,[aria-selected="true"]'), function (el) {
        phone.push(el.tagName.toLowerCase() + '.' + (el.getAttribute('class') || ''));
      });
    }
    return {
      phone: phone.join(' | '),
      scrollY: Math.round(window.scrollY),
      docH: Math.round(document.documentElement.scrollHeight),
      docW: Math.round(document.documentElement.scrollWidth),
      clientW: Math.round(document.documentElement.clientWidth),
      count: Object.keys(nodes).length,
      nodes: nodes, vars: vars, text: text
    };
  }

  function raf() { return new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); }); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  window.YJ_PROBE = {
    freeze: freeze,
    snapshot: snapshot,
    positions: function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      return [0, .04, .08, .13, .18, .24, .3, .36, .42, .5, .58, .66, .74, .82, .9, .96, 1].map(function (f) { return Math.round(h * f); });
    },
    run: async function (positions) {
      freeze(true);
      var out = [];
      for (var i = 0; i < positions.length; i++) {
        window.scrollTo({ top: positions[i], behavior: 'instant' });
        await raf(); await wait(120); await raf();
        out.push(snapshot());
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      await raf();
      freeze(false);
      return out;
    },
    store: async function (tag) {
      var pos = window.YJ_PROBE.positions();
      var runs = await window.YJ_PROBE.run(pos);
      var payload = JSON.stringify({ positions: pos, runs: runs });
      localStorage.setItem('yj:' + tag, payload);
      return { tag: tag, bytes: payload.length, positions: pos, counts: runs.map(function (r) { return r.count; }), docH: runs[0].docH, overflow: runs.map(function (r) { return r.docW - r.clientW; }) };
    },
    /* Каналы, которые тикают от времени, а не от позиции скролла, и потому
       не воспроизводятся между двумя прогонами ДАЖЕ НА ОДНОМ И ТОМ ЖЕ КОДЕ
       (проверено: compare своего же снимка даёт по ним расхождения):
         - .story__pulse / .story__thread — «энергия» пульса считается от
           скорости прокрутки, а она у двух прогонов разная;
         - классы is-hit / is-cut — живут 780 и 620 мс по таймеру;
         - --rail-energy / --rail-dir — то же самое, производные скорости;
         - состояние телефона в hero-сцене — там крутится автоплей.
       Они выносятся в отдельный список noisy и не считаются отличиями.
       Всё остальное — геометрия, стили, --rail-progress, --story-p,
       --cash-*, --st-* , классы панелей — сравнивается строго. */
    NOISY_NODE: /story__pulse|story__thread/,
    NOISY_VAR: { '@inline': 1, '--rail-dir': 1 },

    compare: async function (tag) {
      var before = JSON.parse(localStorage.getItem('yj:' + tag) || 'null');
      if (!before) return { error: 'no baseline ' + tag };
      var runs = await window.YJ_PROBE.run(before.positions);
      let diffs = [];
      for (var i = 0; i < runs.length; i++) {
        var a = before.runs[i], b = runs[i], d = { at: before.positions[i], changed: [], noisy: [] };
        var noisyNode = window.YJ_PROBE.NOISY_NODE, noisyVar = window.YJ_PROBE.NOISY_VAR;
        var cleanClass = function (v) {
          return String(v).replace(/\bis-hit\b/g, '').replace(/\bis-cut\b/g, '').trim().split(/\s+/).filter(Boolean).sort().join(' ');
        };
        if (a.phone !== b.phone) d.noisy.push('phone :: ' + a.phone + ' -> ' + b.phone);
        if (a.docH !== b.docH) d.docH = [a.docH, b.docH];
        if (a.docW - a.clientW !== b.docW - b.clientW) d.overflow = [a.docW - a.clientW, b.docW - b.clientW];
        if (a.count !== b.count) d.count = [a.count, b.count];
        var keys = {};
        Object.keys(a.nodes).forEach(function (k) { keys[k] = 1; });
        Object.keys(b.nodes).forEach(function (k) { keys[k] = 1; });
        Object.keys(keys).forEach(function (k) {
          var bucket = noisyNode.test(k) ? d.noisy : d.changed;
          var x = a.nodes[k], y = b.nodes[k];
          if (!x) { bucket.push(k + ' :: ADDED'); return; }
          if (!y) { bucket.push(k + ' :: REMOVED'); return; }
          for (var j = 0; j < x.length; j++) {
            if (String(x[j]) !== String(y[j])) { bucket.push(k + ' :: [' + j + '] ' + x[j] + ' -> ' + y[j]); break; }
          }
        });
        ['vars', 'text'].forEach(function (grp) {
          Object.keys(a[grp]).forEach(function (sel) {
            var x = a[grp][sel], y = b[grp][sel];
            if (typeof x === 'string') { if (x !== y) d.changed.push(grp + ' ' + sel + ' :: ' + x + ' -> ' + y); return; }
            Object.keys(x).forEach(function (n) {
              var xv = x[n], yv = (y || {})[n];
              if (n === '@class') { xv = cleanClass(xv); yv = cleanClass(yv); }
              if (String(xv) === String(yv)) return;
              (noisyVar[n] ? d.noisy : d.changed).push(grp + ' ' + sel + ' ' + n + ' :: ' + xv + ' -> ' + yv);
            });
          });
        });
        diffs.push(d);
      }
      const noisyTotal = diffs.reduce(function (s, d) { return s + d.noisy.length; }, 0);
      diffs = diffs.filter(function (d) { return d.changed.length || d.docH || d.overflow || d.count; });
      return {
        tag: tag,
        positions: before.positions.length,
        diffPositions: diffs.length,
        total: diffs.reduce(function (s, d) { return s + d.changed.length; }, 0),
        noisy: noisyTotal,
        diffs: diffs.map(function (d) { return { at: d.at, docH: d.docH, overflow: d.overflow, count: d.count, n: d.changed.length, sample: d.changed.slice(0, 40) }; })
      };
    }
  };
  return 'YJ_PROBE ready';
})();
