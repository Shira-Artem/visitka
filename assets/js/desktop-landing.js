/* Desktop / «Продукт в телефоне» — small, scroll-independent interactions. */

function initDesktopLanding() {
  const root = document.querySelector('.desktop-site');
  if (!root || root.dataset.ready === 'true') return;
  root.dataset.ready = 'true';

  const roleTabs = [...root.querySelectorAll('[data-dl-role]')];
  const rolePanels = [...root.querySelectorAll('[data-dl-panel]')];

  function setRole(nextTab) {
    const role = nextTab.dataset.dlRole;
    roleTabs.forEach((tab) => {
      const active = tab === nextTab;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
    });
    rolePanels.forEach((panel) => {
      const active = panel.dataset.dlPanel === role;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
  }

  roleTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setRole(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
      const next = roleTabs[(index + direction + roleTabs.length) % roleTabs.length];
      setRole(next);
      next.focus();
    });
  });
  if (roleTabs[0]) setRole(roleTabs[0]);

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

  const form = root.querySelector('[data-dl-lead-form]');
  const formStatus = root.querySelector('[data-dl-form-status]');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (formStatus) formStatus.textContent = 'Готово — следующим шагом подключим отправку заявки в рабочий канал.';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDesktopLanding, { once: true });
} else {
  initDesktopLanding();
}
