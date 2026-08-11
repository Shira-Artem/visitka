/* Mobile product choreography.
   The Story -> Ways handoff is preserved. On phones the Ways section becomes
   one reversible, transforming service vessel with three named GSAP acts. */
const ORANGE = '#ff5a1f';
const EMBER = '#f0a022';
const GREEN = '#5bbf17';

function lerp(a, b, p) { return Math.round(a + (b - a) * p); }
function handoffColor(p) {
  return lerp(70, 255, p) + ',' + lerp(183, 90, p) + ',' + lerp(150, 31, p);
}

function createHandoffLayer(stage) {
  const layer = document.createElement('div');
  layer.className = 'journey-handoff-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<svg viewBox="0 0 1000 1000" preserveAspectRatio="none">' +
    '<defs><linearGradient id="journeyHandoffGradient" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#46b796"/><stop offset="1" stop-color="#ff5a1f"/></linearGradient></defs>' +
    '<path class="journey-handoff-glow" d="M500 1050 C430 860 570 700 500 520 S460 210 510 -40" />' +
    '<path class="journey-handoff-path" pathLength="1" d="M500 1050 C430 860 570 700 500 520 S460 210 510 -40" />' +
    '<circle class="journey-handoff-pulse" cx="500" cy="1000" r="8" />' +
    '</svg>';
  stage.appendChild(layer);
  return layer;
}

function createConfirmSignal(icon) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  const circle = document.createElementNS(ns, 'circle');
  svg.setAttribute('class', 'ways__confirm-signal');
  svg.setAttribute('viewBox', '0 0 64 64');
  svg.setAttribute('aria-hidden', 'true');
  circle.setAttribute('cx', '32');
  circle.setAttribute('cy', '32');
  circle.setAttribute('r', '25');
  circle.setAttribute('pathLength', '1');
  svg.appendChild(circle);
  icon.appendChild(svg);
  return { svg: svg, circle: circle };
}

function createServiceVessel(grid, cards) {
  const shadow = document.createElement('span');
  const orbitA = document.createElement('span');
  const orbitB = document.createElement('span');
  const viewport = document.createElement('div');
  const shell = document.createElement('div');
  const wipe = document.createElement('span');

  shadow.className = 'ways__capsule-shadow';
  orbitA.className = 'ways__capsule-orbit ways__capsule-orbit--a';
  orbitB.className = 'ways__capsule-orbit ways__capsule-orbit--b';
  viewport.className = 'ways__capsule-viewport';
  shell.className = 'ways__capsule-shell';
  wipe.className = 'ways__capsule-wipe';
  [shadow, orbitA, orbitB, viewport, shell, wipe].forEach(function (node) {
    node.setAttribute('aria-hidden', 'true');
  });
  shell.innerHTML = '<span class="ways__capsule-live"><i></i>mini app / live</span>';

  grid.appendChild(shadow);
  grid.appendChild(orbitA);
  grid.appendChild(orbitB);
  grid.appendChild(viewport);
  viewport.appendChild(shell);
  cards.forEach(function (card) { viewport.appendChild(card); });
  viewport.appendChild(wipe);

  return {
    shadow: shadow,
    orbits: [orbitA, orbitB],
    viewport: viewport,
    shell: shell,
    wipe: wipe,
    remove: function () {
      cards.forEach(function (card) { grid.appendChild(card); });
      shadow.remove();
      orbitA.remove();
      orbitB.remove();
      viewport.remove();
    }
  };
}

function setupHandoff(gsap, ScrollTrigger, storyTrack, storyStage) {
  const layer = createHandoffLayer(storyStage);
  const path = layer.querySelector('.journey-handoff-path');
  const glow = layer.querySelector('.journey-handoff-glow');
  const pulse = layer.querySelector('.journey-handoff-pulse');
  const state = { value: 0 };
  storyStage.setAttribute('data-journey-handoff', 'true');

  gsap.set([path, glow], { drawSVG: '0% 0%' });
  gsap.set(layer, { autoAlpha: 1 });

  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'mobile-product-handoff',
      trigger: storyTrack,
      start: function () {
        const rect = storyTrack.getBoundingClientRect();
        return window.scrollY + rect.top + Math.max(0, storyTrack.offsetHeight - storyStage.offsetHeight) * .82;
      },
      end: function () {
        const rect = storyTrack.getBoundingClientRect();
        return window.scrollY + rect.top + Math.max(1, storyTrack.offsetHeight - storyStage.offsetHeight) * .995;
      },
      scrub: .42,
      invalidateOnRefresh: true,
      refreshPriority: 2
    }
  });

  timeline.to(state, {
    value: 1,
    duration: 1,
    onUpdate: function () {
      storyStage.style.setProperty('--journey-handoff', state.value.toFixed(3));
      storyStage.style.setProperty('--journey-handoff-color', handoffColor(state.value));
    }
  }, 0)
    .to([path, glow], { drawSVG: '0% 100%', duration: .82 }, 0)
    .to(pulse, { attr: { cy: -16 }, duration: .82 }, 0)
    .to(layer, { autoAlpha: 0, duration: .12 }, .88);

  return function cleanupHandoff() {
    if (timeline.scrollTrigger) timeline.scrollTrigger.kill();
    timeline.kill();
    storyStage.removeAttribute('data-journey-handoff');
    storyStage.style.removeProperty('--journey-handoff');
    storyStage.style.removeProperty('--journey-handoff-color');
    layer.remove();
  };
}

function setupWaysShowcase(gsap, ScrollTrigger, waysStage) {
  const waysTrack = document.getElementById('waysTrack');
  const grid = waysStage.querySelector('.ways__grid');
  const head = waysStage.querySelector('.ways__head');
  const eyebrow = waysStage.querySelector('#waysEyebrow');
  const headline = waysStage.querySelector('#waysHeadline');
  const accent = headline && headline.querySelector('.grad-text');
  const lead = waysStage.querySelector('#waysLead');
  const cue = waysStage.querySelector('.ways__route-cue');
  const cuePath = waysStage.querySelector('[data-ways-cue-path]');
  const cueDot = waysStage.querySelector('[data-ways-cue-dot]');
  const progress = waysStage.querySelector('#waysProgress');
  const steps = gsap.utils.toArray('[data-way-step]', waysStage);
  const cards = gsap.utils.toArray('[data-way-card]', waysStage);
  if (!waysTrack || !grid || !head || !accent || !cuePath || !cueDot || !progress || cards.length !== 3) return function () {};

  const vessel = createServiceVessel(grid, cards);
  const blobs = gsap.utils.toArray('.ways__blob', waysStage);
  const icons = cards.map(function (card) { return card.querySelector('.way-card__icon'); });
  const tags = cards.map(function (card) { return card.querySelector('.way-card__tag'); });
  const benefitRows = cards.map(function (card) { return gsap.utils.toArray('.way-card__benefits li', card); });
  const demos = cards.map(function (card) { return card.querySelector('.way-card__demo'); });
  const iconStrokes = cards.map(function (card) {
    return gsap.utils.toArray('.way-icon path, .way-icon circle, .way-icon rect', card);
  });

  const pickupMeta = cards[0].querySelector('.wd-pickup__meta');
  const pickupRows = gsap.utils.toArray('.wd-pickup__ticket span', cards[0]);
  const pickupStamp = cards[0].querySelector('.wd-pickup__stamp');
  const pickupCheck = gsap.utils.toArray('.wd-pickup__stamp circle, .wd-pickup__stamp path', cards[0]);

  const deliveryLegend = cards[1].querySelector('.wd-route__legend');
  const deliveryPath = cards[1].querySelector('.wd-route__path--mobile path');
  const deliveryCourier = cards[1].querySelector('.wd-route__courier');
  const deliveryEta = cards[1].querySelector('.wd-route__eta');
  const deliveryPins = gsap.utils.toArray('.wd-route__pin', cards[1]);
  const deliveryCheckpoints = gsap.utils.toArray('.wd-route__checkpoint', cards[1]);

  const tableOrder = cards[2].querySelector('.wd-table__order');
  const tablePath = cards[2].querySelector('.wd-table__path path');
  const tableSignal = cards[2].querySelector('.wd-table__signal');
  const tableQr = cards[2].querySelector('.wd-table__qr');
  const tableScan = cards[2].querySelector('.wd-table__scan');
  const tablePin = cards[2].querySelector('.wd-table__pin');
  const tablePlate = cards[2].querySelector('.wd-table__plate');
  const tablePlateStrokes = gsap.utils.toArray('.wd-table__plate circle', cards[2]);
  const confirmSignal = createConfirmSignal(icons[2]);

  const openedInsideWays = window.location.hash === '#ways' || waysStage.getBoundingClientRect().top <= 2;
  let active = true;
  let timeline = null;

  waysStage.setAttribute('data-ways-showcase', 'true');
  waysStage.setAttribute('data-way-act', 'pickup');
  document.body.classList.remove('ways-mobile-pinned');
  cards.forEach(function (card) {
    card.classList.remove('in-view', 'is-active', 'is-receded', 'is-flow-active');
    const demo = card.querySelector('[data-way-demo]');
    if (demo) demo.classList.remove('is-playing');
  });
  steps.forEach(function (step) { step.classList.remove('is-active'); });

  const context = gsap.context(function () {
    gsap.set([eyebrow, headline, lead], { autoAlpha: 1, y: 6 });
    gsap.set([cue, progress], { autoAlpha: 0, y: 6 });
    gsap.set(accent, { clipPath: openedInsideWays ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' });
    gsap.set(cuePath, { drawSVG: '0% 0%' });
    gsap.set(cueDot, {
      autoAlpha: 0,
      motionPath: { path: cuePath, align: cuePath, alignOrigin: [.5, .5], start: 0, end: 0 }
    });
    gsap.set(steps, { color: '#8e8177', backgroundColor: '#fffaf4', borderColor: 'rgba(94,76,63,.13)', scale: .92 });

    gsap.set(vessel.viewport, {
      y: 30, scale: .94, rotationX: -7, rotationZ: -.8,
      transformOrigin: '50% 76%', transformPerspective: 1200
    });
    gsap.set(vessel.shadow, { autoAlpha: 0, scaleX: .66, y: -5 });
    gsap.set(vessel.orbits[0], { autoAlpha: 0, scale: .82, rotation: -24 });
    gsap.set(vessel.orbits[1], { autoAlpha: 0, scale: .86, rotation: 18 });
    gsap.set(vessel.wipe, { autoAlpha: 0, y: -86, skewY: -2 });

    gsap.set(cards, { autoAlpha: 1 });
    gsap.set(cards[0], { clipPath: 'inset(0% 0% 0% 0%)', zIndex: 2 });
    gsap.set(cards[1], { clipPath: 'inset(0% 0% 100% 0%)', zIndex: 3 });
    gsap.set(cards[2], { clipPath: 'inset(0% 0% 100% 0%)', zIndex: 4 });
    gsap.set(icons, { autoAlpha: 1, scale: .94, rotation: -3 });
    gsap.set(tags, { autoAlpha: 0, y: 8, scale: .97 });
    gsap.set(benefitRows.flat(), { autoAlpha: 0, y: 6, scale: .96 });
    gsap.set(demos, { autoAlpha: 1 });
    gsap.set(iconStrokes.flat(), { drawSVG: '0% 0%' });
    gsap.set(pickupMeta, { autoAlpha: 0, y: 4 });
    gsap.set(pickupRows, { autoAlpha: 0, x: -8 });
    gsap.set(pickupStamp, { autoAlpha: 0, scale: .94, rotation: -8 });
    gsap.set(pickupCheck, { drawSVG: '0% 0%' });

    gsap.set(deliveryLegend, { autoAlpha: 0, y: 4 });
    gsap.set(deliveryPins, { autoAlpha: .28, scale: .92 });
    gsap.set(deliveryCheckpoints, { autoAlpha: 0, scale: .8 });
    gsap.set(deliveryEta, { autoAlpha: 0, y: 6, xPercent: -50 });
    gsap.set(deliveryPath, { drawSVG: '0% 0%' });
    gsap.set(deliveryCourier, { autoAlpha: 0 });

    gsap.set(tableOrder, { autoAlpha: 0, y: 4 });
    gsap.set(tableQr, { autoAlpha: 0, scale: .94 });
    gsap.set(tableScan, { autoAlpha: 0, y: 0 });
    gsap.set(tablePath, { autoAlpha: .75, drawSVG: '0% 0%' });
    gsap.set(tableSignal, { autoAlpha: 0 });
    gsap.set(tablePin, { autoAlpha: .28, scale: .92 });
    gsap.set(tablePlate, { autoAlpha: 0, y: 6, scale: .97 });
    gsap.set(tablePlateStrokes, { drawSVG: '0% 0%' });
    gsap.set(confirmSignal.svg, { autoAlpha: 0, scale: .94 });
    gsap.set(confirmSignal.circle, { drawSVG: '0% 0%' });

    timeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: {
        id: 'mobile-ways-showcase',
        trigger: waysStage,
        start: 'top top',
        end: function () {
          return '+=' + Math.round(gsap.utils.clamp(3100, 4100, window.innerHeight * 4.65));
        },
        pin: true,
        pinSpacing: true,
        scrub: .48,
        invalidateOnRefresh: true,
        refreshPriority: 3,
        onToggle: function (self) {
          document.body.classList.toggle('ways-mobile-pinned', self.isActive);
        },
        onUpdate: function (self) {
          document.body.classList.toggle('ways-mobile-pinned', self.isActive);
        }
      }
    });

    timeline.addLabel('pickup', 0)
      .to(eyebrow, { autoAlpha: 1, y: 0, duration: .15 }, 'pickup')
      .to(headline, { autoAlpha: 1, y: 0, duration: .2 }, 'pickup+=.03')
      .to(accent, { clipPath: 'inset(0 0% 0 0)', duration: .24, ease: 'power3.inOut' }, 'pickup+=.08')
      .to(lead, { autoAlpha: 1, y: 0, duration: .2 }, 'pickup+=.13')
      .to(cue, { autoAlpha: 1, y: 0, duration: .16 }, 'pickup+=.16')
      .to(cuePath, { drawSVG: '0% 100%', duration: .34, ease: 'power2.inOut' }, 'pickup+=.16')
      .to(progress, { autoAlpha: 1, y: 0, duration: .16 }, 'pickup+=.2')
      .to(cueDot, { autoAlpha: 1, scale: 1, duration: .1 }, 'pickup+=.24')
      .to(steps[0], { color: '#fff', backgroundColor: ORANGE, borderColor: ORANGE, scale: 1, duration: .17 }, 'pickup+=.24')
      .to(vessel.shadow, { autoAlpha: .86, scaleX: .94, y: 0, duration: .34 }, 'pickup+=.2')
      .to(vessel.viewport, { y: 0, scale: 1, rotationX: 0, rotationZ: 0, duration: .42, ease: 'back.out(1.14)' }, 'pickup+=.2')
      .to(vessel.orbits, { autoAlpha: .58, scale: 1, rotation: 0, duration: .42, stagger: .05 }, 'pickup+=.25')
      .to(icons[0], { scale: 1, rotation: 0, duration: .25, ease: 'back.out(1.35)' }, 'pickup+=.32')
      .to(iconStrokes[0], { drawSVG: '0% 100%', duration: .26, stagger: .022 }, 'pickup+=.34')
      .to(benefitRows[0], { autoAlpha: 1, y: 0, scale: 1, duration: .18, stagger: .05 }, 'pickup+=.43')
      .to(pickupMeta, { autoAlpha: 1, y: 0, duration: .17 }, 'pickup+=.55')
      .to(pickupRows, { autoAlpha: 1, x: 0, duration: .2, stagger: .08 }, 'pickup+=.57')
      .to(pickupStamp, { autoAlpha: 1, scale: 1, rotation: -5, duration: .26, ease: 'back.out(1.22)' }, 'pickup+=.74')
      .to(pickupCheck, { drawSVG: '0% 100%', duration: .24, stagger: .05 }, 'pickup+=.76')
      .to(tags[0], { autoAlpha: 1, y: 0, scale: 1, duration: .18 }, 'pickup+=.92')
      .to(cueDot, { scale: 1.42, duration: .1, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 'pickup+=.92')

      .addLabel('delivery', 1.52)
      .set(vessel.wipe, { y: -86, autoAlpha: 0 }, 'delivery')
      .to(vessel.viewport, { scale: .965, rotationY: 3.5, rotationZ: -.8, duration: .2, ease: 'power2.in' }, 'delivery')
      .to(vessel.shadow, { scaleX: .76, autoAlpha: .6, duration: .2 }, 'delivery')
      .to(vessel.wipe, { autoAlpha: 1, duration: .05 }, 'delivery+=.02')
      .to(vessel.wipe, { y: function () { return vessel.viewport.clientHeight + 48; }, duration: .5, ease: 'power2.inOut' }, 'delivery+=.02')
      .to(cards[0], { clipPath: 'inset(100% 0% 0% 0%)', duration: .5, ease: 'power2.inOut' }, 'delivery+=.02')
      .to(cards[1], { clipPath: 'inset(0% 0% 0% 0%)', duration: .5, ease: 'power2.inOut' }, 'delivery+=.02')
      .set(waysStage, { attr: { 'data-way-act': 'delivery' }, '--vessel-c': EMBER, '--vessel-glow': 'rgba(240,160,34,.25)' }, 'delivery+=.27')
      .to(vessel.viewport, { scale: 1, rotationY: 0, rotationZ: 0, borderRadius: '92px 44px 102px 48px / 64px 42px 78px 52px', duration: .34, ease: 'power3.out' }, 'delivery+=.2')
      .to(vessel.shadow, { scaleX: 1, autoAlpha: .82, duration: .34 }, 'delivery+=.2')
      .to(vessel.wipe, { autoAlpha: 0, duration: .08 }, 'delivery+=.44')
      .to(vessel.orbits[0], { x: -20, y: 32, rotation: 32, scale: .9, autoAlpha: .38, duration: .48, ease: 'power3.inOut' }, 'delivery')
      .to(vessel.orbits[1], { x: 38, y: -18, rotation: -28, scale: 1.1, autoAlpha: .58, duration: .48, ease: 'power3.inOut' }, 'delivery')
      .to(cueDot, {
        borderColor: EMBER, duration: .5, ease: 'power2.inOut',
        motionPath: { path: cuePath, align: cuePath, alignOrigin: [.5, .5], start: 0, end: .5 }
      }, 'delivery+=.02')
      .to(steps[0], { color: ORANGE, backgroundColor: '#fff1e8', borderColor: 'rgba(255,90,31,.25)', scale: .92, duration: .18 }, 'delivery+=.08')
      .to(steps[1], { color: '#fff', backgroundColor: EMBER, borderColor: EMBER, scale: 1, duration: .18 }, 'delivery+=.18')
      .to(icons[1], { scale: 1, rotation: 0, duration: .23, ease: 'back.out(1.3)' }, 'delivery+=.23')
      .to(iconStrokes[1], { drawSVG: '0% 100%', duration: .25, stagger: .018 }, 'delivery+=.24')
      .to(benefitRows[1], { autoAlpha: 1, y: 0, scale: 1, duration: .18, stagger: .05 }, 'delivery+=.3')
      .to(deliveryLegend, { autoAlpha: 1, y: 0, duration: .16 }, 'delivery+=.4')
      .to(deliveryPins, { autoAlpha: 1, scale: 1, duration: .2, stagger: .07, ease: 'back.out(1.25)' }, 'delivery+=.34')
      .to(deliveryCheckpoints, { autoAlpha: 1, scale: 1, duration: .17, stagger: .07 }, 'delivery+=.39')
      .to(deliveryPath, { drawSVG: '0% 100%', duration: .46, ease: 'power2.inOut' }, 'delivery+=.38')
      .to(deliveryCourier, { autoAlpha: 1, duration: .06 }, 'delivery+=.5')
      .to(deliveryCourier, {
        duration: .62, ease: 'power2.inOut',
        motionPath: { path: deliveryPath, align: deliveryPath, alignOrigin: [.5, .5], autoRotate: true, start: 0, end: .95 }
      }, 'delivery+=.5')
      .to(deliveryEta, { autoAlpha: 1, y: 0, duration: .2 }, 'delivery+=.69')
      .to(tags[1], { autoAlpha: 1, y: 0, scale: 1, duration: .18 }, 'delivery+=.87')

      .addLabel('table', 3.16)
      .set(vessel.wipe, { y: -86, autoAlpha: 0 }, 'table')
      .to(vessel.viewport, { scale: .965, rotationY: -3.5, rotationZ: .8, duration: .2, ease: 'power2.in' }, 'table')
      .to(vessel.shadow, { scaleX: .76, autoAlpha: .58, duration: .2 }, 'table')
      .to(vessel.wipe, { autoAlpha: 1, duration: .05 }, 'table+=.02')
      .to(vessel.wipe, { y: function () { return vessel.viewport.clientHeight + 48; }, duration: .5, ease: 'power2.inOut' }, 'table+=.02')
      .to(cards[1], { clipPath: 'inset(100% 0% 0% 0%)', duration: .5, ease: 'power2.inOut' }, 'table+=.02')
      .to(cards[2], { clipPath: 'inset(0% 0% 0% 0%)', duration: .5, ease: 'power2.inOut' }, 'table+=.02')
      .set(waysStage, { attr: { 'data-way-act': 'table' }, '--vessel-c': GREEN, '--vessel-glow': 'rgba(91,191,23,.23)' }, 'table+=.27')
      .to(vessel.viewport, { scale: 1, rotationY: 0, rotationZ: 0, borderRadius: '54px 112px 116px 72px / 46px 86px 100px 62px', duration: .34, ease: 'power3.out' }, 'table+=.2')
      .to(vessel.shadow, { scaleX: .94, autoAlpha: .78, duration: .34 }, 'table+=.2')
      .to(vessel.wipe, { autoAlpha: 0, duration: .08 }, 'table+=.44')
      .to(vessel.orbits[0], { x: -68, y: 84, rotation: 68, scale: 1.12, autoAlpha: .52, duration: .48, ease: 'power3.inOut' }, 'table')
      .to(vessel.orbits[1], { x: 96, y: -48, rotation: -62, scale: .84, autoAlpha: .3, duration: .48, ease: 'power3.inOut' }, 'table')
      .to(blobs[0], { autoAlpha: .08, scale: .8, duration: .44 }, 'table')
      .to(blobs[2], { autoAlpha: .52, scale: 1.08, duration: .48 }, 'table')
      .to(cueDot, {
        borderColor: GREEN, duration: .5, ease: 'power2.inOut',
        motionPath: { path: cuePath, align: cuePath, alignOrigin: [.5, .5], start: .5, end: 1 }
      }, 'table+=.02')
      .to(steps.slice(0, 2), { color: GREEN, backgroundColor: '#f1faeb', borderColor: 'rgba(91,191,23,.25)', scale: .92, duration: .18 }, 'table+=.08')
      .to(steps[2], { color: '#fff', backgroundColor: GREEN, borderColor: GREEN, scale: 1, duration: .18 }, 'table+=.18')
      .to(icons[2], { scale: 1, rotation: 0, duration: .23, ease: 'back.out(1.3)' }, 'table+=.23')
      .to(iconStrokes[2], { drawSVG: '0% 100%', duration: .25, stagger: .02 }, 'table+=.24')
      .to(benefitRows[2], { autoAlpha: 1, y: 0, scale: 1, duration: .18, stagger: .05 }, 'table+=.3')
      .to(tableOrder, { autoAlpha: 1, y: 0, duration: .16 }, 'table+=.4')
      .to(tableQr, { autoAlpha: 1, scale: 1, duration: .23, ease: 'back.out(1.25)' }, 'table+=.34')
      .to(tableScan, { autoAlpha: .9, y: 28, duration: .4, ease: 'power1.inOut' }, 'table+=.42')
      .to(tablePath, { drawSVG: '0% 100%', duration: .34 }, 'table+=.52')
      .to(tableSignal, { autoAlpha: 1, duration: .05 }, 'table+=.57')
      .to(tableSignal, {
        duration: .42, ease: 'power2.inOut',
        motionPath: { path: tablePath, align: tablePath, alignOrigin: [.5, .5], start: 0, end: 1 }
      }, 'table+=.57')
      .to(tablePin, { autoAlpha: 1, scale: 1, duration: .2, ease: 'back.out(1.25)' }, 'table+=.68')
      .to(tablePlate, { autoAlpha: 1, y: 0, scale: 1, duration: .21 }, 'table+=.76')
      .to(tablePlateStrokes, { drawSVG: '0% 100%', duration: .22, stagger: .04 }, 'table+=.77')
      .to(confirmSignal.svg, { autoAlpha: 1, scale: .96, duration: .08 }, 'table+=.78')
      .to(confirmSignal.circle, { drawSVG: '0% 100%', duration: .28 }, 'table+=.79')
      .to(confirmSignal.svg, { scale: 1.22, autoAlpha: 0, duration: .3, ease: 'sine.out' }, 'table+=1.02')
      .to(tags[2], { autoAlpha: 1, y: 0, scale: 1, duration: .18 }, 'table+=.91')
      .to({}, { duration: .4 });
  }, waysStage);

  const refresh = function () { if (active) ScrollTrigger.refresh(); };
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { requestAnimationFrame(refresh); });
  } else {
    window.addEventListener('load', refresh, { once: true });
  }
  requestAnimationFrame(refresh);

  return function cleanupWaysShowcase() {
    active = false;
    window.removeEventListener('load', refresh);
    if (timeline && timeline.scrollTrigger) timeline.scrollTrigger.kill();
    if (timeline) timeline.kill();
    context.revert();
    waysStage.removeAttribute('data-ways-showcase');
    waysStage.removeAttribute('data-way-act');
    waysStage.style.removeProperty('--vessel-c');
    waysStage.style.removeProperty('--vessel-glow');
    document.body.classList.remove('ways-mobile-pinned');
    cards.forEach(function (card) { card.style.removeProperty('will-change'); });
    confirmSignal.svg.remove();
    vessel.remove();
  };
}

export function initMobileProductJourney() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const DrawSVGPlugin = window.DrawSVGPlugin;
  const MotionPathPlugin = window.MotionPathPlugin;
  if (!gsap || !ScrollTrigger) return function () {};

  const storyTrack = document.getElementById('storyTrack');
  const storyStage = document.getElementById('storyStage');
  const waysStage = document.getElementById('waysStage');
  if (!storyTrack || !storyStage || !waysStage) return function () {};

  gsap.registerPlugin(ScrollTrigger);
  if (DrawSVGPlugin && MotionPathPlugin) gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

  const mm = gsap.matchMedia();
  mm.add({ mobile: '(max-width: 768px)', motion: '(prefers-reduced-motion: no-preference)' }, function (context) {
    if (!context.conditions.mobile || !context.conditions.motion || !DrawSVGPlugin) return function () {};
    return setupHandoff(gsap, ScrollTrigger, storyTrack, storyStage);
  });
  mm.add({ phone: '(max-width: 620px)', motion: '(prefers-reduced-motion: no-preference)' }, function (context) {
    if (!context.conditions.phone || !context.conditions.motion || !DrawSVGPlugin || !MotionPathPlugin) return function () {};
    return setupWaysShowcase(gsap, ScrollTrigger, waysStage);
  });

  return function cleanupMobileProductJourney() { mm.revert(); };
}
