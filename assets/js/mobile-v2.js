(() => {
  const root = document.querySelector('.mobile-v2');
  if (!root) return;

  let platform = root.dataset.platform || 'telegram';
  let menuOnline = false;

  const screenMarkup = (screen) => {
    return `<dl-product-screen class="mv2-app-screen hero-phone__display yj-demo" role-screen="${screen || 'menu'}"></dl-product-screen>`;
  };

  function renderScreens() {
    root.querySelectorAll('[data-mv2-screen]').forEach((slot) => {
      slot.innerHTML = screenMarkup(slot.dataset.mv2Screen);
    });
  }

  function setPlatform(next) {
    platform = next === 'max' ? 'max' : 'telegram';
    root.dataset.platform = platform;
    root.querySelectorAll('[data-mv2-platform]').forEach((button) => {
      const active = button.dataset.mv2Platform === platform;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    root.querySelectorAll('[data-mv2-platform-copy]').forEach((node) => {
      node.textContent = platform === 'telegram' ? 'Telegram' : 'MAX';
    });
  }

  function handleProductClick(target) {
    const product = target.closest('dl-product-screen');
    if (!product) return false;

    const category = target.closest('[data-product-menu-category]');
    if (category) {
      const selected = category.dataset.productMenuCategory;
      product.querySelectorAll('[data-product-menu-category]').forEach((item) => item.classList.toggle('is-active', item === category));
      product.querySelectorAll('[data-product-menu-item]').forEach((item) => {
        item.hidden = selected !== 'all' && item.dataset.productMenuItem !== selected;
      });
      return true;
    }

    const adder = target.closest('[data-product-menu-add]');
    if (adder) {
      const count = Number(product.dataset.cartCount || 1) + 1;
      const total = Number(product.dataset.cartTotal || 500) + Number(adder.dataset.menuPrice || 0);
      product.dataset.cartCount = String(count);
      product.dataset.cartTotal = String(total);
      adder.classList.add('is-added');
      let quantity = adder.querySelector('.yj-food-qty');
      if (!quantity) {
        quantity = document.createElement('span');
        quantity.className = 'yj-food-qty';
        adder.append(quantity);
      }
      quantity.textContent = String(Number(quantity.textContent || 0) + 1);
      const label = product.querySelector('[data-product-menu-label]');
      const sum = product.querySelector('[data-product-menu-total]');
      if (label) label.textContent = `Корзина · ${count} позиций`;
      if (sum) sum.textContent = `${total} ₽`;
      return true;
    }

    const directorTab = target.closest('[data-product-director-tab]');
    if (directorTab) {
      const panelName = directorTab.dataset.productDirectorTab;
      product.querySelectorAll('[data-product-director-tab]').forEach((tab) => {
        const active = tab === directorTab;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      product.querySelectorAll('[data-product-director-panel]').forEach((panel) => panel.classList.toggle('is-active', panel.dataset.productDirectorPanel === panelName));
      return true;
    }

    const action = target.closest('[data-product-action]');
    if (action && !action.disabled) {
      const role = action.dataset.productAction;
      const status = product.querySelector('[data-product-status]');
      const progress = product.querySelector('[data-product-progress]');
      const success = product.querySelector('[data-product-success]');
      if (role === 'guest') {
        action.textContent = 'Оплачено · заказ №120';
        success?.classList.add('is-visible');
      }
      if (role === 'cash') {
        if (status) status.textContent = 'В работе';
        if (progress) progress.hidden = false;
        action.textContent = 'Заказ принят';
      }
      if (role === 'kitchen') {
        if (status) status.textContent = 'Готов';
        success?.classList.add('is-visible');
        action.textContent = 'Передано кассиру';
      }
      action.disabled = true;
      return true;
    }

    return false;
  }

  root.addEventListener('click', (event) => {
    if (handleProductClick(event.target)) return;
    const platformButton = event.target.closest('[data-mv2-platform]');
    if (platformButton) setPlatform(platformButton.dataset.mv2Platform);
  });

  const availability = root.querySelector('[data-mv2-availability]');
  const menuSwitch = root.querySelector('[data-mv2-menu-switch]');
  const menuReduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let menuMotionFrame = 0;
  let menuMotionTimer = 0;

  function setMenuAvailability(nextOnline, animate = true) {
    menuOnline = Boolean(nextOnline);
    availability?.classList.toggle('is-online', menuOnline);
    availability?.classList.toggle('is-hidden', !menuOnline);
    menuSwitch?.setAttribute('aria-pressed', String(menuOnline));
    menuSwitch?.setAttribute('aria-label', menuOnline ? 'Скрыть шаурму из меню гостя' : 'Вернуть шаурму в меню гостя');

    const copy = {
      label: menuOnline ? 'Доступна гостю' : 'Скрыта из меню',
      status: menuOnline ? 'Позиция доступна' : 'Позиция выключена',
      detail: menuOnline ? 'Товар снова опубликован в меню' : 'Изменение опубликовано мгновенно',
      result: menuOnline ? 'Позиция доступна во всех точках' : 'Позиция скрыта во всех точках',
      resultDetail: menuOnline ? 'Гость снова видит товар' : 'Гость больше не видит товар',
    };

    const updates = [
      ['[data-mv2-availability-label]', copy.label],
      ['[data-mv2-availability-status]', copy.status],
      ['[data-mv2-availability-status-detail]', copy.detail],
      ['[data-mv2-availability-note]', copy.result],
      ['[data-mv2-availability-result-detail]', copy.resultDetail],
    ];
    updates.forEach(([selector, value]) => {
      const node = root.querySelector(selector);
      if (node) node.textContent = value;
    });

    cancelAnimationFrame(menuMotionFrame);
    clearTimeout(menuMotionTimer);
    availability?.classList.remove('is-changing');
    if (!animate || menuReduceMotion || !availability) return;
    menuMotionFrame = requestAnimationFrame(() => {
      availability.classList.add('is-changing');
      menuMotionTimer = setTimeout(() => availability.classList.remove('is-changing'), 820);
    });
  }

  menuSwitch?.addEventListener('click', () => setMenuAvailability(!menuOnline));
  setMenuAvailability(false, false);

  function setupWayScrollStory() {
    const story = root.querySelector('[data-mv2-way-story]');
    const card = story?.querySelector('[data-mv2-way-card]');
    const panels = [...(story?.querySelectorAll('[data-mv2-way-panel]') || [])];
    const steps = [...(story?.querySelectorAll('[data-mv2-way-trigger]') || [])];
    const ways = ['pickup', 'delivery', 'table'];
    if (!story || !card || panels.length !== ways.length || steps.length !== ways.length) return;

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeIndex = 0;
    let lastScrollY = window.scrollY;
    let scrollDirection = 1;
    let motionFrame = 0;
    let motionTimer = 0;
    let settleTimer = 0;
    let reconcileFrame = 0;
    let transitionBusy = false;

    const settlePassedStep = () => {
      clearTimeout(settleTimer);
      const nextIndex = scrollDirection >= 0 ? activeIndex + 1 : activeIndex - 1;
      if (nextIndex < 0 || nextIndex >= ways.length) return;
      settleTimer = setTimeout(() => {
        const nextStep = steps[nextIndex];
        const rect = nextStep?.getBoundingClientRect();
        const hasPassedTrigger = scrollDirection >= 0
          ? rect && rect.top <= window.innerHeight * .54
          : rect && rect.bottom >= window.innerHeight * .46;
        if (!hasPassedTrigger) return;
        activeIndex = nextIndex;
        activateWay(activeIndex, !reduceMotion);
      }, reduceMotion ? 0 : 80);
    };

    const activateWay = (index, animate) => {
      const nextWay = ways[index];
      const nextPanel = panels.find((panel) => panel.dataset.mv2WayPanel === nextWay);
      if (!nextPanel) return;
      const previousPanel = panels.find((panel) => panel.classList.contains('is-active') && !panel.hidden);

      card.dataset.way = nextWay;
      story.dataset.way = nextWay;
      card.style.setProperty('--mv2-way-local-progress', '1');
      steps.forEach((step, stepIndex) => {
        const active = stepIndex === index;
        step.classList.toggle('is-active', active);
        if (active) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
      });
      cancelAnimationFrame(motionFrame);
      clearTimeout(motionTimer);
      panels.forEach((panel) => panel.classList.remove('is-entering', 'is-leaving'));

      const canMorph = animate && !reduceMotion && previousPanel && previousPanel !== nextPanel;
      if (canMorph) {
        transitionBusy = true;
        panels.forEach((panel) => {
          if (panel !== previousPanel && panel !== nextPanel) {
            panel.hidden = true;
            panel.classList.remove('is-active');
          }
        });
        previousPanel.hidden = false;
        previousPanel.classList.remove('is-active');
        previousPanel.classList.add('is-leaving');
        nextPanel.hidden = false;
        nextPanel.classList.add('is-active');
        motionFrame = requestAnimationFrame(() => {
          nextPanel.classList.add('is-entering');
          motionTimer = setTimeout(() => {
            previousPanel.hidden = true;
            previousPanel.classList.remove('is-leaving');
            nextPanel.classList.remove('is-entering');
            transitionBusy = false;
            settlePassedStep();
          }, 540);
        });
      } else {
        panels.forEach((panel) => {
          const active = panel === nextPanel;
          panel.hidden = !active;
          panel.classList.toggle('is-active', active);
        });
        transitionBusy = false;
        if (animate) settlePassedStep();
      }
    };

    const reconcileSteps = () => {
      reconcileFrame = 0;
      if (transitionBusy) return;
      const storyRect = story.getBoundingClientRect();
      if (storyRect.bottom <= 0 || storyRect.top >= window.innerHeight) return;
      const nextIndex = scrollDirection >= 0 ? activeIndex + 1 : activeIndex - 1;
      const nextStep = steps[nextIndex];
      if (!nextStep) return;
      const rect = nextStep.getBoundingClientRect();
      const inTriggerZone = scrollDirection >= 0
        ? rect.top <= window.innerHeight * .54 && rect.bottom > 0
        : rect.bottom >= window.innerHeight * .46 && rect.top < window.innerHeight;
      if (!inTriggerZone) return;
      activeIndex = nextIndex;
      activateWay(activeIndex, !reduceMotion);
    };

    const scheduleReconcile = () => {
      if (!reconcileFrame) reconcileFrame = requestAnimationFrame(reconcileSteps);
    };

    const stepObserver = new IntersectionObserver((entries) => {
      if (transitionBusy) return;
      const entering = entries.filter((entry) => entry.isIntersecting)
        .map((entry) => steps.indexOf(entry.target))
        .filter((index) => index !== -1);
      if (!entering.length) return;
      const nextIndex = scrollDirection >= 0
        ? Math.min(Math.max(...entering), activeIndex + 1)
        : Math.max(Math.min(...entering), activeIndex - 1);
      if (nextIndex === activeIndex) return;
      activeIndex = nextIndex;
      activateWay(activeIndex, true);
    }, { rootMargin: '0px 0px -46% 0px', threshold: .04 });

    const trackDirection = () => {
      const nextY = window.scrollY;
      scrollDirection = nextY >= lastScrollY ? 1 : -1;
      lastScrollY = nextY;
      scheduleReconcile();
    };

    addEventListener('scroll', trackDirection, { passive: true });
    steps.forEach((step) => stepObserver.observe(step));
    activateWay(activeIndex, false);
    scheduleReconcile();
  }

  const sheet = root.querySelector('[data-mv2-sheet]');
  const sheetTitle = root.querySelector('[data-mv2-sheet-title]');
  const sheetDescription = root.querySelector('[data-mv2-sheet-description]');
  const sheetContent = root.querySelector('[data-mv2-sheet-content]');
  let lastFocused = null;

  function closeSheet() {
    if (!sheet) return;
    sheet.hidden = true;
    document.body.style.overflow = '';
    lastFocused?.focus?.();
  }

  function openSheet(type, trigger) {
    if (!sheet || !sheetContent) return;
    lastFocused = trigger || document.activeElement;
    if (type === 'menu') {
      sheetTitle.textContent = 'Навигация';
      sheetDescription.textContent = 'Вся страница — один мобильный сценарий';
      sheetContent.innerHTML = `
        <div class="mv2-sheet-nav">
          <button type="button" data-mv2-go="#mobile-journey"><span>01</span>Путь заказа<span>›</span></button>
          <button type="button" data-mv2-go="#mobile-director"><span>02</span>Директору<span>›</span></button>
          <button type="button" data-mv2-go="#mobile-menu"><span>03</span>Управление меню<span>›</span></button>
          <button type="button" data-mv2-go="#mobile-ways"><span>04</span>Способы получения<span>›</span></button>
          <button type="button" data-mv2-show-demo><span>05</span>Получить демо<span>→</span></button>
        </div>`;
    } else {
      sheetTitle.textContent = 'Подключить заведение';
      sheetDescription.textContent = 'Выберите мессенджер для демонстрации';
      sheetContent.innerHTML = `
        <div class="mv2-demo-actions">
          <button type="button" data-mv2-demo-platform="telegram">➤ &nbsp;Открыть демо в Telegram</button>
          <button type="button" data-mv2-demo-platform="max">✦ &nbsp;Открыть демо в MAX</button>
          <p>✓ &nbsp;Без установки и отдельного кабинета</p>
        </div>`;
    }
    sheet.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => sheetContent.querySelector('button')?.focus());
  }

  root.querySelector('[data-mv2-open-menu]')?.addEventListener('click', (event) => openSheet('menu', event.currentTarget));
  root.querySelectorAll('[data-mv2-open-demo]').forEach((button) => button.addEventListener('click', (event) => openSheet('demo', event.currentTarget)));
  root.querySelector('[data-mv2-close-sheet]')?.addEventListener('click', closeSheet);

  sheetContent?.addEventListener('click', (event) => {
    const target = event.target.closest('[data-mv2-go]');
    if (target) {
      const section = document.querySelector(target.dataset.mv2Go);
      closeSheet();
      section?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      return;
    }
    if (event.target.closest('[data-mv2-show-demo]')) {
      openSheet('demo', lastFocused);
      return;
    }
    const demoPlatform = event.target.closest('[data-mv2-demo-platform]');
    if (demoPlatform) {
      setPlatform(demoPlatform.dataset.mv2DemoPlatform);
      closeSheet();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sheet && !sheet.hidden) closeSheet();
  });

  function setupJourneyMotion() {
    const revealItems = [...root.querySelectorAll('[data-mv2-reveal]')];
    if (!revealItems.length) return;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-revealed'));
      return;
    }

    root.classList.add('mv2-motion-ready');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  function setupLaunchMotion() {
    const section = root.querySelector('[data-mv2-launch]');
    const flow = section?.querySelector('[data-mv2-launch-flow]');
    const steps = [...(section?.querySelectorAll('[data-mv2-launch-step]') || [])];
    const proofCards = [...(section?.querySelectorAll('.mv2-launch-proof > li') || [])];
    const bonus = section?.querySelector('[data-mv2-launch-bonus]');
    const bonusCards = [...(bonus?.querySelectorAll('article') || [])];
    if (!section || !flow || !bonus || steps.length !== 3 || proofCards.length !== 4 || bonusCards.length !== 3) return;

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const setStepState = (activeIndex, progress) => {
      steps.forEach((step, index) => {
        step.classList.toggle('is-active', index === activeIndex);
        step.classList.toggle('is-passed', index < activeIndex);
      });
      section.style.setProperty('--mv2-launch-progress', progress.toFixed(3));
    };

    if (reduceMotion || !('IntersectionObserver' in window)) {
      section.classList.add('mv2-launch-motion-static', 'is-intro-visible');
      bonus.classList.add('is-bonus-visible');
      setStepState(2, 1);
      return;
    }

    section.classList.add('mv2-launch-motion-ready');

    const introObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        section.classList.add('is-intro-visible');
        observer.unobserve(section);
      });
    }, { threshold: .08, rootMargin: '0px 0px -12% 0px' });
    introObserver.observe(section);

    const bonusObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        bonus.classList.add('is-bonus-visible');
        observer.unobserve(bonus);
      });
    }, { threshold: .18, rootMargin: '0px 0px -8% 0px' });
    bonusObserver.observe(bonus);

    let motionFrame = 0;
    const syncLaunchStory = () => {
      motionFrame = 0;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const sectionBox = section.getBoundingClientRect();
      const firstBox = steps[0].getBoundingClientRect();
      const lastBox = steps[steps.length - 1].getBoundingClientRect();
      const target = viewportHeight * .58;
      const firstCenter = firstBox.top + firstBox.height / 2;
      const lastCenter = lastBox.top + lastBox.height / 2;
      const journeySpan = Math.max(1, lastCenter - firstCenter);
      const progress = Math.min(1, Math.max(0, (target - firstCenter) / journeySpan));
      const storyEntered = firstCenter <= viewportHeight * .82;
      const activeIndex = storyEntered
        ? Math.min(steps.length - 1, Math.max(0, Math.round(progress * (steps.length - 1))))
        : -1;
      const travel = Math.min(1, Math.max(0, (viewportHeight - sectionBox.top) / (viewportHeight + sectionBox.height)));
      const parallax = (travel - .5) * 20;

      section.classList.toggle('is-launch-story-entered', storyEntered);
      setStepState(activeIndex, progress);
      section.style.setProperty('--mv2-launch-phone-y', `${parallax.toFixed(2)}px`);
      section.style.setProperty('--mv2-launch-bg-y', `${(-parallax * .52).toFixed(2)}px`);
      section.style.setProperty('--mv2-launch-lines-y', `${(parallax * .36).toFixed(2)}px`);
    };

    const requestLaunchSync = () => {
      if (motionFrame) return;
      motionFrame = requestAnimationFrame(syncLaunchStory);
    };
    window.addEventListener('scroll', requestLaunchSync, { passive: true });
    window.addEventListener('resize', requestLaunchSync, { passive: true });
    syncLaunchStory();

    const tactileCards = [...proofCards, ...bonusCards, ...steps.map((step) => step.querySelector('article'))].filter(Boolean);
    const updateCardMotion = (card, event) => {
      if (event.pointerType === 'touch' && !card.classList.contains('is-pressed')) return;
      const box = card.getBoundingClientRect();
      const x = Math.min(1, Math.max(-1, ((event.clientX - box.left) / box.width - .5) * 2));
      const y = Math.min(1, Math.max(-1, ((event.clientY - box.top) / box.height - .5) * 2));
      card.style.setProperty('--mv2-card-x', `${(x * 1.8).toFixed(2)}px`);
      card.style.setProperty('--mv2-card-y', `${(y * 1.2).toFixed(2)}px`);
      card.style.setProperty('--mv2-card-r', `${(x * .28).toFixed(2)}deg`);
    };
    const resetCardMotion = (card) => {
      card.classList.remove('is-pressed');
      card.style.setProperty('--mv2-card-x', '0px');
      card.style.setProperty('--mv2-card-y', '0px');
      card.style.setProperty('--mv2-card-r', '0deg');
    };

    tactileCards.forEach((card) => {
      card.addEventListener('pointerdown', (event) => {
        card.classList.add('is-pressed');
        updateCardMotion(card, event);
      });
      card.addEventListener('pointermove', (event) => updateCardMotion(card, event));
      card.addEventListener('pointerleave', () => resetCardMotion(card));
      card.addEventListener('pointercancel', () => resetCardMotion(card));
      card.addEventListener('pointerup', () => resetCardMotion(card));
    });
  }

  function setupFinalCtaMotion() {
    const finalCta = root.querySelector('[data-mv2-final]');
    if (!finalCta) return;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      finalCta.classList.add('is-in-view');
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        finalCta.classList.add('is-in-view');
        currentObserver.unobserve(finalCta);
      });
    }, { threshold: .22 });
    observer.observe(finalCta);
  }

  function setupScanInteraction() {
    const scanSection = root.querySelector('[data-mv2-scan]');
    const scanTrigger = scanSection?.querySelector('[data-mv2-scan-trigger]');
    const scanLive = scanSection?.querySelector('[data-mv2-scan-live]');
    const nextTrigger = scanSection?.querySelector('[data-mv2-scan-next]');
    if (!scanSection || !scanTrigger) return;

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const announcementTimers = [];
    const clearAnnouncements = () => {
      while (announcementTimers.length) clearTimeout(announcementTimers.pop());
    };

    const replayScan = () => {
      clearAnnouncements();
      if (scanLive) scanLive.textContent = 'Сканируем QR-код…';

      if (!reduceMotion) {
        scanSection.classList.remove('is-scanning');
        void scanSection.offsetWidth;
        scanSection.classList.add('is-scanning');
      }

      announcementTimers.push(setTimeout(() => {
        if (scanLive) scanLive.textContent = 'QR считан.';
      }, reduceMotion ? 0 : 560));
      announcementTimers.push(setTimeout(() => {
        if (scanLive) scanLive.textContent = 'QR считан. Меню найдено. Загружаем меню.';
      }, reduceMotion ? 0 : 1080));
    };

    scanTrigger.addEventListener('click', replayScan);
    nextTrigger?.addEventListener('click', () => {
      root.querySelector('#mobile-platforms')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  function setupDirectorDemo() {
    const section = root.querySelector('.mv2-director');
    const phone = section?.querySelector('.mv2-director-phone');
    const replay = section?.querySelector('[data-mv2-director-replay]');
    const screen = phone?.querySelector('dl-product-screen');
    if (!section || !phone || !replay || !screen) return;

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revenue = screen.querySelector('.yj-revenue-card > strong');
    const metricValues = [...screen.querySelectorAll('.yj-director-metrics strong')];
    const metricCards = [...screen.querySelectorAll('.yj-director-metrics > span')];
    const inPhoneToast = screen.querySelector('.yj-director-update');
    const inPhoneTitle = inPhoneToast?.querySelector('strong');
    const inPhoneDetail = inPhoneToast?.querySelector('small');
    const inPhoneAmount = inPhoneToast?.querySelector('b');
    const noteLabel = replay.querySelector('span');
    const noteTitle = replay.querySelector('b');
    const noteAmount = replay.querySelector('strong');
    const bridge = section.querySelector('.mv2-director-bridge');
    const bridgeCopy = section.querySelector('[data-mv2-director-bridge-copy]');
    const states = [
      { revenue: '19 580 ₽', orders: '26', average: '753 ₽' },
      { revenue: '20 160 ₽', orders: '27', average: '747 ₽' },
    ];
    let stateIndex = 0;
    let eventTimer = null;
    let updateTimer = null;
    let resetTimer = null;
    let loopTimer = null;

    const clearTimers = () => {
      [eventTimer, updateTimer, resetTimer, loopTimer].forEach((timer) => timer && clearTimeout(timer));
      eventTimer = updateTimer = resetTimer = loopTimer = null;
    };

    const playUpdate = () => {
      clearTimeout(eventTimer);
      clearTimeout(updateTimer);
      clearTimeout(resetTimer);
      phone.classList.remove('is-updating');
      metricCards.forEach((card) => card.classList.remove('is-updating'));
      replay.classList.remove('is-visible', 'is-success');
      noteLabel.textContent = 'LIVE · данные обновляются';
      noteTitle.textContent = 'Кухня завершила заказ №120';
      noteAmount.textContent = 'синхронизация';
      if (bridgeCopy) bridgeCopy.textContent = 'кухня передала данные';
      bridge?.classList.remove('is-updated');

      eventTimer = setTimeout(() => replay.classList.add('is-visible'), 120);
      updateTimer = setTimeout(() => {
        const next = states[stateIndex % states.length];
        stateIndex += 1;
        if (revenue) revenue.textContent = next.revenue;
        if (metricValues[0]) metricValues[0].textContent = next.orders;
        if (metricValues[1]) metricValues[1].textContent = next.average;
        if (inPhoneTitle) inPhoneTitle.textContent = 'Заказ №120 завершён';
        if (inPhoneDetail) inPhoneDetail.textContent = 'Выручка и заказы обновлены';
        if (inPhoneAmount) inPhoneAmount.textContent = '+580 ₽';
        noteLabel.textContent = 'LIVE · только что';
        noteTitle.textContent = 'Заказ №120 завершён';
        noteAmount.textContent = '+580 ₽';
        if (bridgeCopy) bridgeCopy.textContent = 'данные обновлены у директора';
        bridge?.classList.add('is-updated');
        phone.classList.add('is-updating');
        metricCards.forEach((card) => card.classList.add('is-updating'));
        replay.classList.add('is-visible', 'is-success');
        resetTimer = setTimeout(() => {
          phone.classList.remove('is-updating');
          metricCards.forEach((card) => card.classList.remove('is-updating'));
        }, 900);
      }, 720);
    };

    replay.addEventListener('click', playUpdate);
    if (reduceMotion || !('IntersectionObserver' in window)) {
      replay.classList.add('is-visible', 'is-success');
      return;
    }

    section.classList.add('mv2-director-demo-ready');
    const directorObserver = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (!visible) {
        clearTimers();
        return;
      }
      if (loopTimer) return;
      playUpdate();
      loopTimer = setInterval(playUpdate, 8200);
    }, { threshold: .2 });
    directorObserver.observe(section);
  }

  renderScreens();
  setPlatform(platform);
  setupWayScrollStory();
  setupJourneyMotion();
  setupLaunchMotion();
  setupFinalCtaMotion();
  setupScanInteraction();
  setupDirectorDemo();
})();
