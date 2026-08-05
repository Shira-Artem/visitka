(function () {
  'use strict';

  var hero = document.querySelector('.hero-demo');
  var display = document.getElementById('heroPhoneDisplay');
  var caption = document.getElementById('heroDemoCaption');

  if (!hero || !display || !caption) return;

  window.YJ_HERO_DEMO_ACTIVE = true;

  // Когда на странице есть .story, телефон управляется скроллом (main.js:initStoryScroll),
  // а не собственной цепочкой автоплей-таймеров — см. scheduleNext()/applyState() ниже.
  var scrollDriven = Boolean(document.querySelector('.story'));

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var roleOrder = ['guest', 'cash', 'cook', 'director'];
  var timers = [];
  var tickerTimer = 0;
  var directorFrame = 0;
  var currentRole = 'guest';
  var orderStatus = 'draft';
  var hasStarted = false;
  var isVisible = true;
  var formatter = new Intl.NumberFormat('ru-RU');

  var captions = {
    venue: 'Гость выбирает заведение',
    menu: 'Гость собирает заказ',
    checkout: 'Гость оформляет заказ',
    success: 'Заказ №120 отправлен',
    cash: 'Касса получила заказ №120',
    cashAccepted: 'Касса приняла заказ',
    cook: 'Заказ №120 появился на кухне',
    cooking: 'Кухня начала готовить',
    ready: 'Заказ №120 готов',
    director: 'Директор видит результат',
    updated: 'Выручка обновилась на 580 ₽'
  };

  var screens = Array.prototype.slice.call(display.querySelectorAll('[data-role-screen]'));
  var roleButtons = Array.prototype.slice.call(hero.querySelectorAll('[data-demo-role]'));
  var guestScenes = Array.prototype.slice.call(display.querySelectorAll('[data-guest-scene]'));

  var cashCard = display.querySelector('[data-cash-card]');
  var cashStatus = display.querySelector('[data-cash-status]');
  var cashAction = display.querySelector('[data-cash-action]');
  var cashProgress = display.querySelector('[data-cash-progress]');
  var cashCount = display.querySelector('.yj-cash-new-count');
  var cashAlert = display.querySelector('.yj-demo-cashier .yj-staff-alert');

  var cookCard = display.querySelector('[data-cook-card]');
  var cookStatus = display.querySelector('[data-cook-status]');
  var cookAction = display.querySelector('[data-cook-action]');
  var cookProgress = display.querySelector('[data-cook-progress]');
  var cookCount = display.querySelector('[data-cook-count]');
  var cookTime = cookProgress.querySelector('b');
  var cookToast = display.querySelector('[data-ready-toast]');

  var revenueNode = display.querySelector('[data-director-revenue]');
  var ordersNode = display.querySelector('[data-director-orders]');
  var averageNode = display.querySelector('[data-director-average]');
  var tasksNode = display.querySelector('[data-director-tasks]');
  var directorCard = display.querySelector('[data-director-revenue-card]');
  var directorUpdate = display.querySelector('[data-director-update]');
  var directorTabButtons = Array.prototype.slice.call(display.querySelectorAll('[data-director-tab]'));
  var directorPanels = Array.prototype.slice.call(display.querySelectorAll('[data-director-panel]'));

  var catButtons = Array.prototype.slice.call(display.querySelectorAll('.yj-menu-cats [data-cat]'));
  var foodCard = display.querySelector('[data-food-card]');
  var foodImg = display.querySelector('[data-food-img]');
  var foodName = display.querySelector('[data-food-name]');
  var foodDesc = display.querySelector('[data-food-desc]');
  var foodPrice = display.querySelector('[data-food-price]');
  var FOOD_BY_CAT = {
    all: { img: 'assets/img/generated/dish-shawarma.png', alt: 'Шаурма Классическая', name: 'Шаурма Классическая', desc: 'Курица, овощи, фирменный соус', price: '500' },
    shawarma: { img: 'assets/img/generated/dish-shawarma.png', alt: 'Шаурма Классическая', name: 'Шаурма Классическая', desc: 'Курица, овощи, фирменный соус', price: '500' },
    grill: { img: 'assets/img/generated/dish-plov-lamb.png', alt: 'Плов с бараниной', name: 'Плов с бараниной', desc: 'Рис, баранина, морковь, зира', price: '650' }
  };

  function pop(el) {
    if (!el) return;
    el.classList.remove('is-pop');
    void el.offsetWidth;
    el.classList.add('is-pop');
  }

  function clearTimers() {
    timers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    timers = [];
    window.clearInterval(tickerTimer);
    tickerTimer = 0;
    window.cancelAnimationFrame(directorFrame);
    directorFrame = 0;
  }

  function queue(callback, delay) {
    if (reduceMotion.matches || !isVisible) return;
    timers.push(window.setTimeout(callback, delay));
  }

  function setCaption(text) {
    caption.textContent = text;
    caption.classList.remove('is-changing');
    void caption.offsetWidth;
    caption.classList.add('is-changing');
  }

  // Фильтр категорий меню: не показывает/прячет карточки, а подменяет содержимое
  // единственной карточки-слота — так на компактном экране телефона никогда нет
  // риска переполнения по высоте, при этом переключение выглядит по-настоящему живым.
  function setFoodCategory(cat, instant) {
    var food = FOOD_BY_CAT[cat] || FOOD_BY_CAT.all;
    catButtons.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-cat') === cat);
    });
    if (!foodCard) return;

    function apply() {
      if (foodImg) { foodImg.src = food.img; foodImg.alt = food.alt; }
      if (foodName) { foodName.textContent = food.name; }
      if (foodDesc) { foodDesc.textContent = food.desc; }
      if (foodPrice) { foodPrice.textContent = food.price; }
      foodCard.classList.remove('is-swapping');
    }

    if (instant || reduceMotion.matches) { apply(); return; }
    foodCard.classList.add('is-swapping');
    window.setTimeout(apply, 180);
  }

  // Вкладки директора: переключают, какая из .yj-director-panels видна —
  // без изменения общей высоты экрана (панели одна за другой, не рядом).
  function setDirectorTab(tab) {
    directorTabButtons.forEach(function (btn) {
      var active = btn.getAttribute('data-director-tab') === tab;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    directorPanels.forEach(function (panel) {
      panel.classList.toggle('is-active', panel.getAttribute('data-director-panel') === tab);
    });
  }

  function setGuestScene(scene, instant) {
    display.dataset.guestScene = scene;

    if (instant) display.dataset.instant = 'true';

    guestScenes.forEach(function (item) {
      var active = item.getAttribute('data-guest-scene') === scene;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-hidden', String(!active));
    });

    setCaption(captions[scene]);

    if (instant) {
      window.requestAnimationFrame(function () {
        delete display.dataset.instant;
      });
    }
  }

  function showRole(role, instant) {
    currentRole = role;
    hero.dataset.role = role;
    display.dataset.role = role;

    if (instant) display.dataset.instant = 'true';

    screens.forEach(function (screen) {
      var active = screen.getAttribute('data-role-screen') === role;
      screen.classList.toggle('is-active', active);
      screen.setAttribute('aria-hidden', String(!active));
    });

    roleButtons.forEach(function (button) {
      var active = button.getAttribute('data-demo-role') === role;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      button.tabIndex = active ? 0 : -1;
    });

    if (instant) {
      window.requestAnimationFrame(function () {
        delete display.dataset.instant;
      });
    }
  }

  function resetCash() {
    orderStatus = 'new';
    cashCard.classList.remove('yj-order-card--accepted');
    cashCard.classList.add('yj-order-card--new');
    cashStatus.className = 'yj-status yj-status--new';
    cashStatus.textContent = 'Новый';
    cashAction.hidden = false;
    cashAction.disabled = false;
    cashProgress.hidden = true;
    cashCount.textContent = '1 новый';
    cashAlert.classList.remove('is-clear');
  }

  function acceptCash() {
    if (orderStatus !== 'new') return;

    orderStatus = 'accepted';
    cashCard.classList.remove('yj-order-card--new');
    cashCard.classList.add('yj-order-card--accepted');
    cashStatus.className = 'yj-status yj-status--accepted';
    cashStatus.textContent = 'Принят';
    cashAction.hidden = true;
    cashProgress.hidden = false;
    cashCount.textContent = '0 новых';
    cashAlert.classList.add('is-clear');
    setCaption(captions.cashAccepted);
    pop(cashCard);
    pop(cashStatus);
  }

  function resetCook() {
    orderStatus = 'accepted';
    cookCard.classList.remove('yj-order-card--new', 'yj-order-card--cooking', 'yj-order-card--ready');
    cookCard.classList.add('yj-order-card--accepted');
    cookStatus.className = 'yj-status yj-status--accepted';
    cookStatus.textContent = 'Принят';
    cookAction.hidden = false;
    cookAction.disabled = false;
    cookAction.textContent = 'Начать готовить';
    cookAction.classList.remove('is-ready');
    cookProgress.hidden = true;
    cookToast.classList.remove('is-visible');
    cookToast.hidden = true;
    cookCount.textContent = '1 в работе';
    cookTime.textContent = '00:00';
  }

  function startKitchenTicker() {
    var startedAt = Date.now();
    window.clearInterval(tickerTimer);

    tickerTimer = window.setInterval(function () {
      var elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
      var seconds = String(elapsed % 60).padStart(2, '0');
      var minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
      cookTime.textContent = minutes + ':' + seconds;
    }, 500);
  }

  function startCooking() {
    if (orderStatus !== 'accepted') return;

    orderStatus = 'cooking';
    cookCard.classList.remove('yj-order-card--accepted');
    cookCard.classList.add('yj-order-card--cooking');
    cookStatus.className = 'yj-status yj-status--cooking';
    cookStatus.textContent = 'Готовится';
    cookProgress.hidden = false;
    cookAction.textContent = 'Заказ готов';
    cookAction.classList.add('is-ready');
    startKitchenTicker();
    setCaption(captions.cooking);
    pop(cookCard);
    pop(cookStatus);
  }

  function finishCooking() {
    if (orderStatus !== 'cooking') return;

    orderStatus = 'ready';
    window.clearInterval(tickerTimer);
    tickerTimer = 0;
    cookCard.classList.remove('yj-order-card--cooking');
    cookCard.classList.add('yj-order-card--ready');
    cookStatus.className = 'yj-status yj-status--ready';
    cookStatus.textContent = 'Готов';
    cookProgress.hidden = true;
    cookAction.hidden = true;
    cookToast.hidden = false;
    window.requestAnimationFrame(function () {
      cookToast.classList.add('is-visible');
    });
    cookCount.textContent = '0 в работе';
    setCaption(captions.ready);
    pop(cookCard);
    pop(cookStatus);
  }

  function resetDirector() {
    window.cancelAnimationFrame(directorFrame);
    directorFrame = 0;
    revenueNode.textContent = '18 420 ₽';
    ordersNode.textContent = '24';
    averageNode.textContent = '767 ₽';
    tasksNode.textContent = '3';
    directorCard.classList.remove('is-updated');
    directorUpdate.classList.remove('is-visible');
    directorUpdate.hidden = true;
    setDirectorTab('overview');
  }

  function setDirectorFinal() {
    revenueNode.textContent = '19 000 ₽';
    ordersNode.textContent = '25';
    averageNode.textContent = '760 ₽';
    tasksNode.textContent = '2';
    directorCard.classList.add('is-updated');
    directorUpdate.hidden = false;
    window.requestAnimationFrame(function () {
      directorUpdate.classList.add('is-visible');
    });
    setCaption(captions.updated);
  }

  function animateDirector() {
    if (reduceMotion.matches) {
      setDirectorFinal();
      return;
    }

    var startedAt = performance.now();
    var duration = 820;

    directorUpdate.hidden = false;
    directorCard.classList.add('is-updated');
    pop(directorCard);
    window.requestAnimationFrame(function () {
      directorUpdate.classList.add('is-visible');
    });

    function frame(now) {
      var progress = Math.min(1, (now - startedAt) / duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      var revenue = Math.round(18420 + 580 * eased);

      revenueNode.textContent = formatter.format(revenue) + ' ₽';
      ordersNode.textContent = progress < 0.58 ? '24' : '25';
      averageNode.textContent = formatter.format(Math.round(767 - 7 * eased)) + ' ₽';
      tasksNode.textContent = progress < 0.72 ? '3' : '2';

      if (progress < 1) {
        directorFrame = window.requestAnimationFrame(frame);
      } else {
        directorFrame = 0;
        setDirectorFinal();
      }
    }

    directorFrame = window.requestAnimationFrame(frame);
  }

  function scheduleNext(role, delay) {
    if (scrollDriven) return; // скролл сам решает, что идёт следующим — см. initStoryScroll()
    queue(function () {
      enterRole(role);
    }, delay);
  }

  function enterRole(role, options) {
    options = options || {};
    clearTimers();
    showRole(role, Boolean(options.instant));

    if (role === 'guest') {
      resetCash();
      resetCook();
      resetDirector();
      setFoodCategory('all', true);
      orderStatus = 'draft';
      setGuestScene('venue', Boolean(options.instant));
      queue(function () { setGuestScene('menu'); }, 1350);
      queue(function () { setGuestScene('checkout'); }, 3000);
      queue(function () {
        orderStatus = 'new';
        setGuestScene('success');
      }, 4650);
      scheduleNext('cash', 6350);
      return;
    }

    if (role === 'cash') {
      resetCash();
      setCaption(captions.cash);
      queue(acceptCash, 1900);
      scheduleNext('cook', 4750);
      return;
    }

    if (role === 'cook') {
      resetCook();
      setCaption(captions.cook);
      queue(startCooking, 1350);
      queue(finishCooking, 3650);
      scheduleNext('director', 5350);
      return;
    }

    resetDirector();
    orderStatus = 'ready';
    setCaption(captions.director);
    if (reduceMotion.matches) {
      animateDirector();
    } else {
      queue(animateDirector, 700);
    }
    scheduleNext('guest', 5000);
  }

  // Детерминированное применение состояния для scroll-driven режима: один вызов —
  // один гарантированный результат, без прохождения промежуточных шагов и без
  // зависимости от цепочки таймеров. Каждый вызов начинается с clearTimers(), поэтому
  // быстрый/прыжковый скролл всегда доводит телефон ровно до запрошенного состояния.
  function applyState(role, subState) {
    clearTimers();
    showRole(role, true);

    if (role === 'guest') {
      resetCash();
      resetCook();
      resetDirector();
      setFoodCategory('all', true);
      var scene = subState || 'venue';
      orderStatus = (scene === 'success') ? 'new' : 'draft';
      setGuestScene(scene, true);
      return;
    }

    if (role === 'cash') {
      resetCash();
      setCaption(captions.cash);
      if (subState === 'accepted') acceptCash();
      return;
    }

    if (role === 'cook') {
      resetCook();
      setCaption(captions.cook);
      if (subState === 'cooking' || subState === 'ready') startCooking();
      if (subState === 'ready') finishCooking();
      return;
    }

    resetDirector();
    orderStatus = 'ready';
    setCaption(captions.director);
    animateDirector();
  }

  function defaultSubForRole(role) {
    if (role === 'cash') return 'new';
    if (role === 'cook') return 'new';
    if (role === 'guest') return 'venue';
    return 'default';
  }

  function signalManualInteraction(role) {
    window.dispatchEvent(new CustomEvent('yj:manual-role', { detail: { role: role } }));
  }

  window.YJ_HERO_DEMO = { applyState: applyState };

  function advanceGuest(scene) {
    clearTimers();

    if (scene === 'menu') {
      setGuestScene('menu');
      queue(function () { setGuestScene('checkout'); }, 2200);
      queue(function () {
        orderStatus = 'new';
        setGuestScene('success');
      }, 4100);
      scheduleNext('cash', 5900);
      return;
    }

    if (scene === 'checkout') {
      setGuestScene('checkout');
      queue(function () {
        orderStatus = 'new';
        setGuestScene('success');
      }, 1900);
      scheduleNext('cash', 3900);
      return;
    }

    orderStatus = 'new';
    setGuestScene('success');
    scheduleNext('cash', 1900);
  }

  catButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setFoodCategory(btn.getAttribute('data-cat'));
    });
  });

  directorTabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setDirectorTab(btn.getAttribute('data-director-tab'));
    });
  });

  roleButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var role = button.getAttribute('data-demo-role');
      if (scrollDriven) {
        applyState(role, defaultSubForRole(role));
        signalManualInteraction(role);
      } else {
        enterRole(role);
      }
    });

    button.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      event.preventDefault();
      var direction = event.key === 'ArrowRight' ? 1 : -1;
      var index = roleOrder.indexOf(currentRole);
      var nextRole = roleOrder[(index + direction + roleOrder.length) % roleOrder.length];
      var nextButton = hero.querySelector('[data-demo-role="' + nextRole + '"]');

      if (scrollDriven) {
        applyState(nextRole, defaultSubForRole(nextRole));
        signalManualInteraction(nextRole);
      } else {
        enterRole(nextRole, { instant: true });
      }
      nextButton.focus();
    });
  });

  display.addEventListener('click', function (event) {
    var advance = event.target.closest('[data-demo-advance]');
    var cashButton = event.target.closest('[data-cash-action]');
    var cookButton = event.target.closest('[data-cook-action]');

    if (advance) {
      advanceGuest(advance.getAttribute('data-demo-advance'));
      return;
    }

    if (cashButton) {
      clearTimers();
      acceptCash();
      scheduleNext('cook', 2100);
      return;
    }

    if (cookButton) {
      clearTimers();

      if (orderStatus === 'accepted') {
        startCooking();
        queue(finishCooking, 2600);
        scheduleNext('director', 4400);
      } else if (orderStatus === 'cooking') {
        finishCooking();
        scheduleNext('director', 1900);
      }
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      clearTimers();
    } else if (isVisible && !scrollDriven) {
      enterRole(currentRole, { instant: true });
    }
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      var entry = entries[0];
      isVisible = entry.isIntersecting && entry.intersectionRatio > 0.22;

      if (scrollDriven) {
        if (isVisible && !hasStarted) {
          hasStarted = true;
          applyState('guest', 'venue');
        } else if (!isVisible) {
          clearTimers();
        }
        return;
      }

      if (isVisible && !hasStarted) {
        hasStarted = true;
        enterRole('guest', { instant: true });
      } else if (!isVisible) {
        clearTimers();
      } else if (!document.hidden) {
        enterRole(currentRole, { instant: true });
      }
    }, { threshold: [0, 0.22, 0.6] });

    observer.observe(hero);
  } else {
    hasStarted = true;
    if (scrollDriven) {
      applyState('guest', 'venue');
    } else {
      enterRole('guest', { instant: true });
    }
  }
})();
