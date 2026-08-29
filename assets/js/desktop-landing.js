/* Desktop / «Продукт в телефоне» — small, scroll-independent interactions. */

function initDesktopLanding() {
  const root = document.querySelector('.desktop-site');
  if (!root || root.dataset.ready === 'true') return;
  root.dataset.ready = 'true';

  const orderRoute = root.querySelector('[data-dl-order-route]');
  if (orderRoute) {
    const orderSteps = [...orderRoute.querySelectorAll('.dl-phone-step')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isInView = false;
    let cycleTimer = 0;
    let runToken = 0;
    const transientClasses = [
      'is-order-arrival',
      'is-order-start',
      'is-order-flow-source',
      'is-order-flow-cart',
      'is-order-flow-active',
      'is-order-flow-status',
      'is-order-flow-number',
      'is-order-flow-timer',
      'is-order-flow-revenue',
      'is-order-flow-chart',
    ];

    const clearFlow = () => {
      window.clearTimeout(cycleTimer);
      cycleTimer = 0;
      orderRoute.classList.remove('is-order-flowing');
      transientClasses.forEach((className) => {
        orderRoute.querySelectorAll(`.${className}`).forEach((element) => element.classList.remove(className));
      });
    };

    const pulseStep = (step, delay, token, stateClass, detailClasses = []) => {
      window.setTimeout(() => {
        if (!isInView || token !== runToken) return;
        step.classList.add(stateClass);
        detailClasses.forEach(({ selector, className }) => {
          step.querySelector(selector)?.classList.add(className);
        });
        window.setTimeout(() => {
          if (token !== runToken) return;
          step.classList.remove(stateClass);
          detailClasses.forEach(({ selector, className }) => {
            step.querySelector(selector)?.classList.remove(className);
          });
        }, 520);
      }, delay);
    };

    const runFlow = () => {
      if (!isInView || reducedMotion.matches || orderSteps.length !== 4) return;
      const token = ++runToken;
      clearFlow();
      const start = typeof window.requestAnimationFrame === 'function'
        ? (callback) => window.requestAnimationFrame(callback)
        : (callback) => window.setTimeout(callback, 0);
      start(() => {
        if (!isInView || token !== runToken || reducedMotion.matches) return;
        orderRoute.classList.add('is-order-flowing');
        pulseStep(orderSteps[0], 240, token, 'is-order-start', [
          { selector: '.yj-food-card:first-child', className: 'is-order-flow-source' },
          { selector: '.yj-cart-bar', className: 'is-order-flow-cart' },
        ]);
        pulseStep(orderSteps[1], 1600, token, 'is-order-arrival', [
          { selector: '.yj-order-card--new', className: 'is-order-flow-active' },
          { selector: '.yj-order-card--new .yj-status', className: 'is-order-flow-status' },
          { selector: '.yj-order-card--new .yj-order-head > strong', className: 'is-order-flow-number' },
        ]);
        pulseStep(orderSteps[2], 3100, token, 'is-order-arrival', [
          { selector: '.yj-order-card--new', className: 'is-order-flow-active' },
          { selector: '.yj-order-card--new .yj-status', className: 'is-order-flow-status' },
          { selector: '.yj-progress-strip--cook', className: 'is-order-flow-timer' },
        ]);
        pulseStep(orderSteps[3], 4450, token, 'is-order-arrival', [
          { selector: '.yj-revenue-card', className: 'is-order-flow-revenue' },
          { selector: '.yj-revenue-chart', className: 'is-order-flow-chart' },
        ]);
        cycleTimer = window.setTimeout(() => {
          if (isInView) runFlow();
        }, 13_800);
      });
    };

    const stopFlow = () => {
      runToken += 1;
      clearFlow();
    };

    const observer = new IntersectionObserver(([entry]) => {
      const nextInView = entry.isIntersecting && entry.intersectionRatio >= .28;
      if (nextInView === isInView) return;
      isInView = nextInView;
      if (isInView) runFlow();
      else stopFlow();
    }, { threshold: [.28] });
    observer.observe(orderRoute);

    const onMotionPreferenceChange = () => {
      if (reducedMotion.matches) stopFlow();
      else if (isInView) runFlow();
    };
    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', onMotionPreferenceChange);
    } else {
      reducedMotion.addListener(onMotionPreferenceChange);
    }
  }

  // Director command-center motion: one order becomes a KPI update.
  // Kept deliberately small and dependency-free; all movement uses transforms
  // and the whole sequence pauses as soon as the section leaves the viewport.
  const directorSection = root.querySelector('#desktop-director');
  const directorVisual = directorSection?.querySelector('.dl-director-visual');
  if (directorSection && directorVisual) {
    const directorCopy = directorSection.querySelector('.dl-director-copy');
    const directorPoints = [...(directorCopy?.querySelectorAll('.dl-director-point') || [])];
    const directorRevenue = directorVisual.querySelector('.yj-revenue-card');
    const directorRevenueValue = directorRevenue?.querySelector('strong');
    const directorChart = directorRevenue?.querySelector('.yj-revenue-chart__line');
    const directorPhoneUpdate = directorVisual.querySelector('.yj-director-update');
    const directorPulse = directorVisual.querySelector('.dl-director-pulse');
    const secondaryCards = [
      directorVisual.querySelector('.dl-director-float--products'),
      directorVisual.querySelector('.dl-director-float--staff'),
      directorVisual.querySelector('.dl-director-float--points'),
    ].filter(Boolean);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(pointer: fine)');
    const baseRevenue = directorRevenueValue?.textContent || '19 000 ₽';
    const updatedRevenue = '19 580 ₽';
    const packet = document.createElement('span');
    packet.className = 'dl-director-packet';
    packet.textContent = '№120';
    packet.setAttribute('aria-hidden', 'true');
    directorVisual.append(packet);

    if (!reducedMotion.matches) {
      directorCopy?.classList.add('is-director-copy-motion-ready');
    }

    let isInView = false;
    let flowToken = 0;
    let cycleTimer = 0;
    let frame = 0;
    let packetFrame = 0;
    let timers = [];

    const clearTimers = () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers = [];
      window.clearTimeout(cycleTimer);
      cycleTimer = 0;
    };

    const setFocus = (card) => {
      secondaryCards.forEach((item) => item.classList.toggle('is-director-focus', item === card));
    };

    const resetPacket = () => {
      packet.classList.remove('is-visible', 'is-moving', 'is-arrived');
      packet.style.removeProperty('left');
      packet.style.removeProperty('top');
      packet.style.removeProperty('--dl-director-packet-x');
      packet.style.removeProperty('--dl-director-packet-y');
    };

    const clearDirectorState = () => {
      clearTimers();
      resetPacket();
      setFocus(null);
      directorVisual.classList.remove('is-director-flowing');
      directorRevenue?.classList.remove('is-director-updating');
      directorChart?.classList.remove('is-director-chart-update');
      directorPhoneUpdate?.classList.remove('is-director-updating');
      directorPulse?.classList.remove('is-director-success');
      if (directorRevenueValue) directorRevenueValue.textContent = baseRevenue;
    };

    const schedule = (callback, delay, token) => {
      const timer = window.setTimeout(() => {
        if (token === flowToken && isInView) callback();
      }, delay);
      timers.push(timer);
    };

    const movePacket = (token) => {
      if (!directorRevenue || !isInView || token !== flowToken) return;
      const visualBounds = directorVisual.getBoundingClientRect();
      const sourceBounds = (directorVisual.querySelector('.dl-director-float--products') || directorPulse)?.getBoundingClientRect();
      const targetBounds = directorRevenue.getBoundingClientRect();
      if (!sourceBounds || !targetBounds || !visualBounds.width) return;

      const packetWidth = 48;
      const packetHeight = 24;
      const startX = sourceBounds.right - visualBounds.left - packetWidth * .58;
      const startY = sourceBounds.top - visualBounds.top + sourceBounds.height * .52 - packetHeight / 2;
      const targetX = targetBounds.left - visualBounds.left + targetBounds.width * .5 - packetWidth / 2;
      const targetY = targetBounds.top - visualBounds.top + targetBounds.height * .48 - packetHeight / 2;

      packet.style.left = `${startX}px`;
      packet.style.top = `${startY}px`;
      packet.style.setProperty('--dl-director-packet-x', `${targetX - startX}px`);
      packet.style.setProperty('--dl-director-packet-y', `${targetY - startY}px`);
      packet.classList.add('is-visible');

      packetFrame = window.requestAnimationFrame(() => {
        if (token !== flowToken || !isInView) return;
        packet.classList.add('is-moving');
      });
    };

    const runFlow = () => {
      if (!isInView || reducedMotion.matches) return;
      const token = ++flowToken;
      clearDirectorState();
      directorVisual.classList.add('is-director-flowing');

      // A tiny entrance spread establishes depth without moving the phone.
      secondaryCards.forEach((card, index) => {
        card.style.setProperty('--dl-director-depth-x', `${index === 1 ? 2 : -2}px`);
        card.style.setProperty('--dl-director-depth-y', `${index === 0 ? -3 : index === 2 ? 3 : 1}px`);
      });
      window.requestAnimationFrame(() => {
        if (token !== flowToken || !isInView) return;
        secondaryCards.forEach((card) => {
          card.style.setProperty('--dl-director-depth-x', '0px');
          card.style.setProperty('--dl-director-depth-y', '0px');
        });
      });

      schedule(() => setFocus(secondaryCards[0]), 360, token);
      schedule(() => movePacket(token), 720, token);
      schedule(() => {
        packet.classList.add('is-arrived');
        setFocus(secondaryCards[1]);
        if (directorRevenueValue) directorRevenueValue.textContent = updatedRevenue;
        directorRevenue?.classList.add('is-director-updating');
        directorPhoneUpdate?.classList.add('is-director-updating');
        directorChart?.classList.add('is-director-chart-update');
      }, 1660, token);
      schedule(() => setFocus(secondaryCards[2]), 2030, token);
      schedule(() => {
        setFocus(null);
        directorPulse?.classList.add('is-director-success');
      }, 2410, token);
      schedule(() => {
        directorRevenue?.classList.remove('is-director-updating');
        directorPhoneUpdate?.classList.remove('is-director-updating');
        directorChart?.classList.remove('is-director-chart-update');
        directorPulse?.classList.remove('is-director-success');
        resetPacket();
      }, 3000, token);
      cycleTimer = window.setTimeout(() => {
        if (isInView && token === flowToken) runFlow();
      }, 11_500);
    };

    const stopFlow = () => {
      flowToken += 1;
      if (packetFrame) window.cancelAnimationFrame(packetFrame);
      clearDirectorState();
    };

    const directorObserver = new IntersectionObserver(([entry]) => {
      const nextInView = entry.isIntersecting && entry.intersectionRatio >= .34;
      if (nextInView === isInView) return;
      isInView = nextInView;
      if (isInView) {
        directorCopy?.classList.add('is-director-copy-revealed');
        runFlow();
      } else {
        directorCopy?.classList.remove('is-director-copy-revealed');
        stopFlow();
      }
    }, { threshold: [.34] });
    directorObserver.observe(directorSection);

    if (finePointer.matches && !reducedMotion.matches) {
      const depth = [
        { card: secondaryCards[0], amount: 1.2 },
        { card: secondaryCards[1], amount: -1.8 },
        { card: secondaryCards[2], amount: .9 },
      ];
      const resetDepth = () => {
        depth.forEach(({ card }) => {
          card.style.setProperty('--dl-director-parallax-x', '0px');
          card.style.setProperty('--dl-director-parallax-y', '0px');
        });
      };
      directorVisual.addEventListener('pointermove', (event) => {
        if (frame) window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(() => {
          const bounds = directorVisual.getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
          const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
          depth.forEach(({ card, amount }) => {
            card.style.setProperty('--dl-director-parallax-x', `${x * amount}px`);
            card.style.setProperty('--dl-director-parallax-y', `${y * amount * .72}px`);
          });
        });
      });
      directorVisual.addEventListener('pointerleave', resetDepth);

      const linkedPanels = [
        secondaryCards[0],
        secondaryCards[1],
        directorPulse,
        secondaryCards[2],
      ];
      directorPoints.forEach((point, index) => {
        const panel = linkedPanels[index];
        if (!panel) return;
        point.addEventListener('mouseenter', () => panel.classList.add('is-director-hover-linked'));
        point.addEventListener('mouseleave', () => panel.classList.remove('is-director-hover-linked'));
      });
    }

    const onMotionPreferenceChange = () => {
      if (reducedMotion.matches) {
        directorCopy?.classList.remove('is-director-copy-motion-ready', 'is-director-copy-revealed');
        stopFlow();
      } else {
        directorCopy?.classList.add('is-director-copy-motion-ready');
        if (isInView) {
          directorCopy?.classList.add('is-director-copy-revealed');
          runFlow();
        }
      }
    };
    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', onMotionPreferenceChange);
    } else {
      reducedMotion.addListener(onMotionPreferenceChange);
    }
  }

  // The new desktop order is pickup → table → delivery, while the legacy
  // illustration source stores the reusable delivery demos as pickup → route
  // → table. Swap only the inner demo payloads so the visible labels and the
  // proven animated assets stay semantically aligned without a scroll scene.
  const liveWayCards = [...root.querySelectorAll('.dl-way')];
  if (liveWayCards.length === 3) {
    const tableDemo = liveWayCards[1].querySelector('.dl-way-demo');
    const deliveryDemo = liveWayCards[2].querySelector('.dl-way-demo');
    if (tableDemo && deliveryDemo) {
      const tableMarkup = tableDemo.innerHTML;
      tableDemo.innerHTML = deliveryDemo.innerHTML;
      deliveryDemo.innerHTML = tableMarkup;
    }
  }

  const waysSection = root.querySelector('[data-dl-ways]');
  if (waysSection) {
    const reducedWaysMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let waysObserver;

    const revealWays = () => {
      waysSection.classList.add('is-ways-visible');
      waysObserver?.disconnect();
      waysObserver = undefined;
    };

    const observeWays = () => {
      if (reducedWaysMotion.matches) {
        revealWays();
        return;
      }
      if (!('IntersectionObserver' in window)) {
        revealWays();
        return;
      }
      waysObserver?.disconnect();
      waysObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) revealWays();
      }, { threshold: .2 });
      waysObserver.observe(waysSection);
    };

    observeWays();
    const onWaysMotionChange = () => observeWays();
    if (typeof reducedWaysMotion.addEventListener === 'function') {
      reducedWaysMotion.addEventListener('change', onWaysMotionChange);
    } else {
      reducedWaysMotion.addListener(onWaysMotionChange);
    }
  }

  root.querySelectorAll('dl-product-screen').forEach((screen) => {
    const directorTabs = [...screen.querySelectorAll('[data-product-director-tab]')];
    const directorPanels = [...screen.querySelectorAll('[data-product-director-panel]')];

    function setDirectorPanel(nextTab) {
      const panelName = nextTab.dataset.productDirectorTab;
        directorTabs.forEach((item) => {
          const active = item === nextTab;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-selected', active ? 'true' : 'false');
          item.tabIndex = active ? 0 : -1;
        });
        directorPanels.forEach((panel) => {
          panel.classList.toggle('is-active', panel.dataset.productDirectorPanel === panelName);
        });
    }

    directorTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => setDirectorPanel(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const next = directorTabs[(index + direction + directorTabs.length) % directorTabs.length];
        setDirectorPanel(next);
        next.focus();
      });
    });
  if (directorTabs[0]) setDirectorPanel(directorTabs[0]);

  const menuAdders = [...screen.querySelectorAll('[data-product-menu-add]')];
  const menuCategories = [...screen.querySelectorAll('[data-product-menu-category]')];
  const menuItems = [...screen.querySelectorAll('[data-product-menu-item]')];
  const menuLabel = screen.querySelector('[data-product-menu-label]');
  const menuTotal = screen.querySelector('[data-product-menu-total]');

  if (menuAdders.length && menuCategories.length && menuItems.length && menuLabel && menuTotal) {
    let itemCount = 1;
    let total = 500;

    const updateCart = () => {
      menuLabel.textContent = `Корзина · ${itemCount} ${itemCount === 1 ? 'позиция' : 'позиций'}`;
      menuTotal.textContent = `${total} ₽`;
    };

    menuAdders.forEach((adder) => {
      adder.addEventListener('click', () => {
        itemCount += 1;
        total += Number(adder.dataset.menuPrice || 0);
        adder.classList.add('is-added');
        const quantity = adder.querySelector('.yj-food-qty');
        if (quantity) quantity.textContent = String(Number(quantity.textContent || 0) + 1);
        updateCart();
      });
    });

    menuCategories.forEach((category) => {
      category.addEventListener('click', () => {
        const selected = category.dataset.productMenuCategory;
        menuCategories.forEach((item) => item.classList.toggle('is-active', item === category));
        menuItems.forEach((item) => {
          item.hidden = selected !== 'all' && item.dataset.productMenuItem !== selected;
        });
      });
    });

    updateCart();
  }

  const action = screen.querySelector('[data-product-action]');
    action?.addEventListener('click', () => {
      const role = action.dataset.productAction;
      const status = screen.querySelector('[data-product-status]');
      const progress = screen.querySelector('[data-product-progress]');
      const success = screen.querySelector('[data-product-success]');

      if (role === 'guest') {
        action.textContent = 'Оплачено · заказ №120';
        success?.classList.add('is-visible');
      }
      if (role === 'cash') {
        if (status) status.textContent = 'В работе';
        if (progress) progress.hidden = false;
        action.textContent = 'Заказ принят';
        screen.querySelector('.yj-staff-alert')?.classList.add('is-clear');
      }
      if (role === 'kitchen') {
        if (status) status.textContent = 'Готов';
        success?.classList.add('is-visible');
        action.textContent = 'Передано кассиру';
      }

      action.disabled = true;
    });
  });

  const platformButtons = [...root.querySelectorAll('[data-dl-platform]')];
  const platformNames = [...root.querySelectorAll('[data-dl-platform-name]')];
  platformButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const platform = button.dataset.dlPlatform;
      root.dataset.platform = platform;
      platformButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      platformNames.forEach((item) => {
        item.textContent = platform === 'max' ? 'MAX' : 'Telegram';
      });
    });
  });

  const heroStage = root.querySelector('[data-dl-hero] .dl-phone-field');
  const finePointer = window.matchMedia('(pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (heroStage && finePointer.matches && !reducedMotion.matches) {
    let heroFrame = 0;

    const resetHeroDepth = () => {
      heroStage.style.setProperty('--dl-hero-phone-x', '0px');
      heroStage.style.setProperty('--dl-hero-phone-y', '0px');
      heroStage.style.setProperty('--dl-hero-panel-x', '0px');
      heroStage.style.setProperty('--dl-hero-panel-y', '0px');
      heroStage.style.setProperty('--dl-hero-live-x', '0px');
      heroStage.style.setProperty('--dl-hero-live-y', '0px');
    };

    heroStage.addEventListener('pointermove', (event) => {
      if (heroFrame) window.cancelAnimationFrame(heroFrame);
      heroFrame = window.requestAnimationFrame(() => {
        const bounds = heroStage.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
        const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
        heroStage.style.setProperty('--dl-hero-phone-x', `${x * 8}px`);
        heroStage.style.setProperty('--dl-hero-phone-y', `${y * 6}px`);
        heroStage.style.setProperty('--dl-hero-panel-x', `${x * -6}px`);
        heroStage.style.setProperty('--dl-hero-panel-y', `${y * -4}px`);
        heroStage.style.setProperty('--dl-hero-live-x', `${x * 3}px`);
        heroStage.style.setProperty('--dl-hero-live-y', `${y * 2}px`);
      });
    });

    heroStage.addEventListener('pointerleave', resetHeroDepth);
  }

  // Final CTA: a compact, viewport-bound presentation sequence. It uses CSS
  // transforms/opacity only and keeps the quiet state truly quiet between runs.
  const finalCta = root.querySelector('[data-dl-final-cta]');
  if (finalCta) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const ctaNotes = [...finalCta.querySelectorAll('.dl-cta-note')];
    const ctaLaunchCard = finalCta.querySelector('[data-dl-launch-card]');
    const ctaLaunchPad = ctaLaunchCard?.querySelector('.dl-cta-launch-pad');
    const ctaFlightRocket = finalCta.querySelector('[data-dl-flight-rocket]');
    const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    let ctaInView = false;
    let ctaRun = 0;
    let ctaTimer = 0;
    let ctaTimers = [];
    let ctaRocketTimer = 0;
    let ctaRocketResetTimer = 0;
    let ctaRocketAnimation = null;

    const clearCtaTimers = () => {
      ctaTimers.forEach((timer) => window.clearTimeout(timer));
      ctaTimers = [];
      window.clearTimeout(ctaTimer);
      ctaTimer = 0;
    };

    const resetCta = () => {
      clearCtaTimers();
      finalCta.classList.remove('is-cta-revealed', 'is-cta-form-active', 'is-cta-orbit-active');
      ctaNotes.forEach((note) => note.classList.remove('is-cta-note-active'));
    };

    const scheduleCta = (callback, delay, run) => {
      const timer = window.setTimeout(() => {
        if (ctaInView && run === ctaRun) callback();
      }, delay);
      ctaTimers.push(timer);
    };

    const cubicPoint = ([p0, p1, p2, p3], t) => {
      const inverse = 1 - t;
      const inverse2 = inverse * inverse;
      const t2 = t * t;
      return {
        x: inverse2 * inverse * p0.x + 3 * inverse2 * t * p1.x + 3 * inverse * t2 * p2.x + t2 * t * p3.x,
        y: inverse2 * inverse * p0.y + 3 * inverse2 * t * p1.y + 3 * inverse * t2 * p2.y + t2 * t * p3.y,
      };
    };

    const buildCtaRocketTrajectory = () => {
      const form = finalCta.querySelector('.dl-lead-form');
      if (!ctaLaunchPad || !form) return null;

      const sectionBounds = finalCta.getBoundingClientRect();
      const padBounds = ctaLaunchPad.getBoundingClientRect();
      const formBounds = form.getBoundingClientRect();
      const start = {
        x: padBounds.left + padBounds.width / 2 - sectionBounds.left,
        y: padBounds.top + padBounds.height / 2 - sectionBounds.top,
      };
      const formLeft = formBounds.left - sectionBounds.left;
      const formTop = formBounds.top - sectionBounds.top;
      const formWidth = formBounds.width;
      const formHeight = formBounds.height;
      const formBottom = formTop + formHeight;
      const point = (x, y) => ({ x, y });

      // Responsive S-curve traced from the user's red trajectory: launch pad →
      // lower-left form approach → right-hand loop → center return → top exit.
      const p1 = point(formLeft + formWidth * .12, formBottom + formHeight * .08);
      const p2 = point(formLeft + formWidth * .46, formBottom - formHeight * .16);
      const p3 = point(formLeft + formWidth * .66, formBottom - formHeight * .22);
      const p4 = point(formLeft + formWidth * .47, formTop + formHeight * .59);
      const p5 = point(formLeft + formWidth * .43, formTop + formHeight * .27);
      const p6 = point(formLeft + formWidth * .50, formTop + formHeight * .17);
      const p7 = point(formLeft + formWidth * .45, formTop - formHeight * .06);
      const exit = point(formLeft + formWidth * .34, formTop - formHeight * .22);
      const segments = [
        [start, point(start.x + 20, start.y - 54), point(formLeft + formWidth * .06, formBottom + formHeight * .16), p1],
        [p1, point(formLeft + formWidth * .18, formBottom - formHeight * .01), point(formLeft + formWidth * .37, formBottom - formHeight * .13), p2],
        [p2, point(formLeft + formWidth * .59, formBottom - formHeight * .23), point(formLeft + formWidth * .78, formBottom - formHeight * .08), p3],
        [p3, point(formLeft + formWidth * .72, formBottom - formHeight * .31), point(formLeft + formWidth * .42, formTop + formHeight * .67), p4],
        [p4, point(formLeft + formWidth * .40, formTop + formHeight * .51), point(formLeft + formWidth * .39, formTop + formHeight * .35), p5],
        [p5, point(formLeft + formWidth * .46, formTop + formHeight * .19), point(formLeft + formWidth * .54, formTop + formHeight * .31), p6],
        [p6, point(formLeft + formWidth * .50, formTop + formHeight * .09), point(formLeft + formWidth * .50, formTop - formHeight * .01), p7],
        [p7, point(formLeft + formWidth * .42, formTop - formHeight * .14), point(formLeft + formWidth * .37, formTop - formHeight * .18), exit],
      ];

      const rawPoints = [];
      segments.forEach((segment, segmentIndex) => {
        for (let step = segmentIndex === 0 ? 0 : 1; step <= 28; step += 1) {
          rawPoints.push(cubicPoint(segment, step / 28));
        }
      });

      const distances = [0];
      for (let index = 1; index < rawPoints.length; index += 1) {
        distances.push(distances[index - 1] + Math.hypot(
          rawPoints[index].x - rawPoints[index - 1].x,
          rawPoints[index].y - rawPoints[index - 1].y,
        ));
      }
      const totalDistance = distances[distances.length - 1];
      if (!totalDistance) return null;

      const points = [];
      let distanceCursor = 1;
      const frameCount = 112;
      for (let frame = 0; frame < frameCount; frame += 1) {
        const targetDistance = totalDistance * frame / (frameCount - 1);
        while (distanceCursor < distances.length - 1 && distances[distanceCursor] < targetDistance) {
          distanceCursor += 1;
        }
        const previousDistance = distances[distanceCursor - 1];
        const nextDistance = distances[distanceCursor];
        const range = nextDistance - previousDistance || 1;
        const ratio = (targetDistance - previousDistance) / range;
        const previousPoint = rawPoints[distanceCursor - 1];
        const nextPoint = rawPoints[distanceCursor];
        points.push({
          x: previousPoint.x + (nextPoint.x - previousPoint.x) * ratio,
          y: previousPoint.y + (nextPoint.y - previousPoint.y) * ratio,
        });
      }
      return { start, points };
    };

    const stopCtaRocket = () => {
      window.clearTimeout(ctaRocketTimer);
      window.clearTimeout(ctaRocketResetTimer);
      ctaRocketTimer = 0;
      ctaRocketResetTimer = 0;
      ctaRocketAnimation?.cancel();
      ctaRocketAnimation = null;
      ctaLaunchCard?.classList.remove('is-cta-launching');
      if (ctaFlightRocket) ctaFlightRocket.style.opacity = '0';
    };

    const playCtaRocket = () => {
      if (!ctaInView || reducedMotion.matches || document.visibilityState !== 'visible' || !ctaFlightRocket || typeof ctaFlightRocket.animate !== 'function') return false;
      if (ctaRocketAnimation?.playState === 'running') return false;
      const trajectory = buildCtaRocketTrajectory();
      if (!trajectory) return false;

      const { start, points } = trajectory;
      ctaFlightRocket.style.left = `${start.x}px`;
      ctaFlightRocket.style.top = `${start.y}px`;
      ctaLaunchCard?.classList.remove('is-cta-launching');
      window.requestAnimationFrame(() => ctaLaunchCard?.classList.add('is-cta-launching'));
      window.clearTimeout(ctaRocketResetTimer);
      ctaRocketResetTimer = window.setTimeout(() => ctaLaunchCard?.classList.remove('is-cta-launching'), 1080);

      let previousRotation = null;
      const keyframes = points.map((currentPoint, index) => {
        const progress = index / (points.length - 1);
        const before = points[Math.max(0, index - 2)];
        const after = points[Math.min(points.length - 1, index + 2)];
        const tangent = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
        let rotation = tangent + 45;
        if (previousRotation !== null) {
          while (rotation - previousRotation > 180) rotation -= 360;
          while (previousRotation - rotation > 180) rotation += 360;
        }
        previousRotation = rotation;
        const introScale = .9 + Math.min(1, progress / .06) * .1;
        const exitScale = progress > .86 ? 1 - ((progress - .86) / .14) * .14 : 1;
        const opacity = Math.min(1, progress / .035, (1 - progress) / .075);
        return {
          offset: progress,
          opacity: Math.max(0, opacity),
          transform: `translate3d(-50%, -50%, 0) translate3d(${currentPoint.x - start.x}px, ${currentPoint.y - start.y}px, 0) rotate(${rotation}deg) scale(${Math.min(introScale, exitScale)})`,
        };
      });

      const animation = ctaFlightRocket.animate(keyframes, {
        duration: 4300,
        easing: 'cubic-bezier(.45, 0, .25, 1)',
        fill: 'both',
      });
      ctaRocketAnimation = animation;
      animation.onfinish = () => {
        if (ctaRocketAnimation !== animation) return;
        ctaRocketAnimation = null;
        ctaFlightRocket.style.opacity = '0';
        animation.cancel();
      };
      return true;
    };

    const scheduleCtaRocket = (delay = 20_000) => {
      window.clearTimeout(ctaRocketTimer);
      const tick = () => {
        if (ctaInView && !reducedMotion.matches && document.visibilityState === 'visible') playCtaRocket();
        ctaRocketTimer = window.setTimeout(tick, 20_000);
      };
      ctaRocketTimer = window.setTimeout(tick, delay);
    };

    const runCta = () => {
      if (!ctaInView || reducedMotion.matches) return;
      const run = ++ctaRun;
      resetCta();
      finalCta.classList.add('is-cta-revealed');
      scheduleCta(() => finalCta.classList.add('is-cta-form-active'), 700, run);
      scheduleCta(() => finalCta.classList.add('is-cta-orbit-active'), 1030, run);
      ctaNotes.forEach((note, index) => {
        scheduleCta(() => {
          ctaNotes.forEach((item) => item.classList.remove('is-cta-note-active'));
          note.classList.add('is-cta-note-active');
        }, 1290 + index * 460, run);
      });
      scheduleCta(() => ctaNotes.forEach((note) => note.classList.remove('is-cta-note-active')), 2860, run);
      ctaTimer = window.setTimeout(() => {
        if (ctaInView && run === ctaRun) runCta();
      }, 11_500);
    };

    if (!reducedMotion.matches) finalCta.classList.add('is-cta-motion-ready');

    const ctaObserver = new IntersectionObserver(([entry]) => {
      const nextInView = entry.isIntersecting && entry.intersectionRatio >= .3;
      if (nextInView === ctaInView) return;
      ctaInView = nextInView;
      if (ctaInView) {
        runCta();
        scheduleCtaRocket(3220);
      }
      else {
        ctaRun += 1;
        stopCtaRocket();
        resetCta();
      }
    }, { threshold: [.3] });
    ctaObserver.observe(finalCta);

    const onCtaMotionPreference = () => {
      ctaRun += 1;
      stopCtaRocket();
      resetCta();
      if (reducedMotion.matches) finalCta.classList.remove('is-cta-motion-ready');
      else {
        finalCta.classList.add('is-cta-motion-ready');
        if (ctaInView) {
          runCta();
          scheduleCtaRocket(900);
        }
      }
    };
    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', onCtaMotionPreference);
    } else {
      reducedMotion.addListener(onCtaMotionPreference);
    }

    ctaLaunchCard?.addEventListener('pointerenter', () => {
      if (fineHover.matches) playCtaRocket();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') stopCtaRocket();
      else if (ctaInView && !reducedMotion.matches) scheduleCtaRocket(900);
    });
  }

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDesktopLanding, { once: true });
} else {
  initDesktopLanding();
}
