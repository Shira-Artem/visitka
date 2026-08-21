/* Production desktop embeds the proven Mini App screens from the previous site. */

const productScreens = {
  menu: `
    <div class="hero-phone__statusbar" aria-hidden="true"><span>9:41</span><span>⌁ ▰</span></div>
    <div class="hero-phone__island" aria-hidden="true"></div>
    <section class="yj-demo-screen yj-demo-client is-active" aria-label="Клиентское меню">
      <header class="yj-client-topbar">
        <span class="yj-client-logo" aria-hidden="true">🔥</span>
        <span class="yj-client-brand"><small>Еда рядом с вами</small><strong>ЮртаНеЖди</strong></span>
        <span class="yj-client-bell" aria-hidden="true">⌁</span>
      </header>
      <div class="yj-guest-stage">
        <div class="yj-guest-scene is-active">
          <div class="yj-menu-head"><span><small>Шашлычная №1</small><strong>Меню</strong></span><span class="yj-open-chip">Открыто</span></div>
          <div class="yj-menu-cats" aria-label="Категории меню"><span class="is-active" data-product-menu-category="all">Все</span><span data-product-menu-category="shawarma">🥙 Шаурма</span><span data-product-menu-category="grill">🍖 Мангал</span><span data-product-menu-category="soups">🍜 Супы</span><span data-product-menu-category="drinks">☕ Напитки</span></div>
          <div class="yj-menu-list">
            <article class="yj-food-card" data-product-menu-item="shawarma"><img src="assets/img/generated/dish-shawarma.png" alt="Шаурма классическая" width="120" height="120" /><span class="yj-food-copy"><strong>Шаурма Классическая</strong><small>Курица, овощи, фирменный соус</small><b>500 ₽</b></span><button class="is-added" type="button" data-product-menu-add data-menu-price="500" aria-label="Добавить шаурму">+<span class="yj-food-qty">1</span></button></article>
            <article class="yj-food-card" data-product-menu-item="grill"><img src="assets/img/generated/dish-plov-lamb.png" alt="Плов с бараниной" width="120" height="120" /><span class="yj-food-copy"><strong>Плов с бараниной</strong><small>Рис, баранина, морковь, зира</small><b>480 ₽</b></span><button type="button" data-product-menu-add data-menu-price="480" aria-label="Добавить плов">+</button></article>
            <article class="yj-food-card" data-product-menu-item="soups"><img src="assets/img/generated/dish-lagman.png" alt="Лагман" width="120" height="120" /><span class="yj-food-copy"><strong>Лагман</strong><small>Домашняя лапша, говядина, овощи</small><b>340 ₽</b></span><button type="button" data-product-menu-add data-menu-price="340" aria-label="Добавить лагман">+</button></article>
            <article class="yj-food-card" data-product-menu-item="shawarma"><img src="assets/img/generated/dish-samsa.png" alt="Самса тандырная" width="120" height="120" /><span class="yj-food-copy"><strong>Самса тандырная</strong><small>Слоёное тесто, сочная начинка</small><b>200 ₽</b></span><button type="button" data-product-menu-add data-menu-price="200" aria-label="Добавить самсу">+</button></article>
            <article class="yj-food-card" data-product-menu-item="drinks"><img src="assets/img/generated/dish-black-tea.png" alt="Чёрный чай" width="120" height="120" /><span class="yj-food-copy"><strong>Чёрный чай</strong><small>Крепкая заварка · чайник 400 мл</small><b>120 ₽</b></span><button type="button" data-product-menu-add data-menu-price="120" aria-label="Добавить чай">+</button></article>
          </div>
          <button class="yj-cart-bar" type="button" data-product-menu-cart><span data-product-menu-label>Корзина · 1 позиция</span><strong data-product-menu-total>500 ₽</strong></button>
        </div>
      </div>
    </section>
    <div class="yj-demo-live" aria-hidden="true"><span></span> LIVE</div>
  `,
  guest: `
    <div class="hero-phone__statusbar" aria-hidden="true"><span>9:41</span><span>⌁ ▰</span></div>
    <div class="hero-phone__island" aria-hidden="true"></div>
    <section class="yj-demo-screen yj-demo-client is-active" aria-label="Экран гостя">
      <header class="yj-client-topbar">
        <span class="yj-client-logo" aria-hidden="true">🔥</span>
        <span class="yj-client-brand"><small>Еда рядом с вами</small><strong>ЮртаНеЖди</strong></span>
        <span class="yj-client-bell" aria-hidden="true">⌁</span>
      </header>
      <div class="yj-guest-stage">
        <div class="yj-guest-scene is-active">
          <div class="yj-checkout-head"><span class="yj-back" aria-hidden="true">‹</span><strong>Оформление заказа</strong></div>
          <div class="yj-checkout-label">Способ получения</div>
          <div class="yj-methods">
            <span class="is-active"><i>✓</i><b>Самовывоз</b><small>К 19:20</small></span>
            <span><i></i><b>К столику</b><small>В заведении</small></span>
          </div>
          <div class="yj-checkout-order">
            <div><span>Шаурма Классическая ×1</span><b>500 ₽</b></div>
            <div><span>Лимонад ×1</span><b>80 ₽</b></div>
          </div>
          <div class="yj-payment-row"><span aria-hidden="true">⚡</span><span><b>Онлайн-оплата</b><small>Сохранённым способом</small></span><i>✓</i></div>
          <div class="yj-checkout-total"><span>Итого</span><strong>580 ₽</strong></div>
          <button class="yj-primary-action" type="button" data-product-action="guest">Оплатить 580 ₽</button>
          <div class="yj-ready-toast" data-product-success role="status"><span>✓</span><strong>Заказ №120 оформлен</strong><small>Касса уже получила заказ</small></div>
        </div>
      </div>
    </section>
    <div class="yj-demo-live" aria-hidden="true"><span></span> LIVE</div>
  `,
  cash: `
    <div class="hero-phone__statusbar" aria-hidden="true"><span>9:41</span><span>⌁ ▰</span></div>
    <div class="hero-phone__island" aria-hidden="true"></div>
    <section class="yj-demo-screen yj-demo-cashier is-active" aria-label="Экран кассира">
      <header class="yj-staff-topbar">
        <span class="yj-staff-logo" aria-hidden="true">🧾</span>
        <span class="yj-staff-title"><strong>Касса</strong><small>Марина · <b>1 новый</b></small></span>
        <span class="yj-staff-alert" aria-hidden="true">1</span>
      </header>
      <nav class="yj-staff-tabs" aria-label="Фильтры заказов"><span>Все</span><span class="is-active">Новые</span><span>В работе</span><span>К выдаче</span></nav>
      <div class="yj-staff-scroll">
        <article class="yj-order-card yj-order-card--new">
          <div class="yj-order-head"><strong>№ 120</strong><span class="yj-status yj-status--new" data-product-status>Новый</span></div>
          <small class="yj-created">Создан только что</small>
          <div class="yj-order-meta"><span>🏪 Самовывоз</span><b>⏰ К 19:20</b></div>
          <div class="yj-cash-items"><div><span>Шаурма Классическая <b>×1</b></span><strong>500 ₽</strong></div><small>+ Фирменный соус</small><div><span>Лимонад <b>×1</b></span><strong>80 ₽</strong></div></div>
          <div class="yj-order-total"><span>Оплачено онлайн</span><strong>580 ₽</strong></div>
          <button class="yj-staff-action" type="button" data-product-action="cash">✓ Принять заказ</button>
          <div class="yj-progress-strip" data-product-progress hidden><span>⏳ Ждём кухню</span><b>00:01</b></div>
        </article>
      </div>
    </section>
    <div class="yj-demo-live" aria-hidden="true"><span></span> LIVE</div>
  `,
  kitchen: `
    <div class="hero-phone__statusbar" aria-hidden="true"><span>9:41</span><span>⌁ ▰</span></div>
    <div class="hero-phone__island" aria-hidden="true"></div>
    <section class="yj-demo-screen yj-demo-kitchen is-active" aria-label="Экран кухни">
      <header class="yj-staff-topbar">
        <span class="yj-staff-logo yj-staff-logo--cook" aria-hidden="true">👨‍🍳</span>
        <span class="yj-staff-title"><strong>Кухня</strong><small>Алексей · <b>1 в работе</b></small></span>
        <span class="yj-staff-alert" aria-hidden="true">1</span>
      </header>
      <div class="yj-kitchen-label"><span>Очередь кухни</span><b>По времени</b></div>
      <div class="yj-staff-scroll">
        <article class="yj-order-card yj-order-card--new">
          <div class="yj-order-head"><strong>№ 120</strong><span class="yj-status yj-status--new" data-product-status>Новый заказ</span></div>
          <small class="yj-created">Создан в 19:02</small>
          <div class="yj-kitchen-items"><div><span>Шаурма Классическая</span><b>×1</b></div><small>+ Фирменный соус</small><small>💬 Без лука</small><div><span>Лимонад</span><b>×1</b></div></div>
          <div class="yj-progress-strip yj-progress-strip--cook" data-product-progress><span>🔥 Готовится</span><b>04:12</b></div>
          <button class="yj-staff-action" type="button" data-product-action="kitchen">✓ Заказ готов</button>
        </article>
        <div class="yj-ready-toast" data-product-success role="status"><span>✓</span><strong>Заказ готов</strong><small>Передан кассиру</small></div>
      </div>
    </section>
    <div class="yj-demo-live" aria-hidden="true"><span></span> LIVE</div>
  `,
  director: `
    <div class="hero-phone__statusbar" aria-hidden="true"><span>9:41</span><span>⌁ ▰</span></div>
    <div class="hero-phone__island" aria-hidden="true"></div>
    <section class="yj-demo-screen yj-demo-director is-active" aria-label="Экран директора">
      <header class="yj-staff-topbar">
        <span class="yj-staff-logo yj-staff-logo--director" aria-hidden="true">📊</span>
        <span class="yj-staff-title"><strong>Директор</strong><small>Иван Петрович · Центр</small></span>
        <span class="yj-director-avatar" aria-hidden="true">ИП</span>
      </header>
      <div class="yj-director-scroll">
        <div class="yj-revenue-card is-updated">
          <small>Выручка сегодня</small><strong>19 000 ₽</strong>
          <svg class="yj-revenue-chart" viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true"><path class="yj-revenue-chart__area" d="M0,29 L14,25 L28,26 L42,19 L56,21 L70,11 L84,13 L100,4 L100,34 L0,34 Z"></path><path class="yj-revenue-chart__line" pathLength="100" d="M0,29 L14,25 L28,26 L42,19 L56,21 L70,11 L84,13 L100,4"></path></svg>
          <span><i>●</i> Смена открыта</span>
        </div>
        <nav class="yj-director-tabbar" role="tablist" aria-label="Разделы директора">
          <button type="button" class="is-active" role="tab" aria-selected="true" data-product-director-tab="overview">Обзор</button>
          <button type="button" role="tab" aria-selected="false" data-product-director-tab="products">Товары</button>
          <button type="button" role="tab" aria-selected="false" data-product-director-tab="staff">Люди</button>
          <button type="button" role="tab" aria-selected="false" data-product-director-tab="venues">Точки</button>
        </nav>
        <div class="yj-director-panels">
          <div class="yj-director-metrics is-active" data-director-panel="overview" data-product-director-panel="overview"><span><i>🧾</i><strong>25</strong><small>Заказов</small></span><span><i>💳</i><strong>760 ₽</strong><small>Средний чек</small></span><span><i>🔥</i><strong>2</strong><small>Активных задач</small></span><span><i>🚫</i><strong>1</strong><small>Отменён</small></span></div>
          <div class="yj-director-list" data-director-panel="products" data-product-director-panel="products"><div style="--pct:80%"><span>Шаурма Классическая</span><b>×12</b></div><div style="--pct:53%"><span>Плов с бараниной</span><b>×8</b></div><div style="--pct:100%"><span>Лимонад</span><b>×15</b></div></div>
          <div class="yj-director-list" data-director-panel="staff" data-product-director-panel="staff"><div><span>Марина · Касса</span><b class="is-on">На смене</b></div><div><span>Алексей · Кухня</span><b class="is-on">На смене</b></div><div><span>Иван Петрович</span><b>Сейчас здесь</b></div></div>
          <div class="yj-director-list" data-director-panel="venues" data-product-director-panel="venues"><div style="--pct:100%"><span>Шашлычная №1</span><b>12 920 ₽</b></div><div style="--pct:33%"><span>Тёплый кофе</span><b>4 120 ₽</b></div><div style="--pct:16%"><span>King Food</span><b>1 960 ₽</b></div></div>
        </div>
        <div class="yj-director-update is-visible"><span>✓</span><span><strong>Заказ №120 завершён</strong><small>Показатели обновлены</small></span><b>+580 ₽</b></div>
      </div>
    </section>
    <div class="yj-demo-live" aria-hidden="true"><span></span> LIVE</div>
  `,
};

class DesktopProductScreen extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered === 'true') return;
    const role = this.getAttribute('role-screen') || 'guest';
    this.dataset.rendered = 'true';
    this.innerHTML = productScreens[role] || productScreens.guest;
  }
}

if (!customElements.get('dl-product-screen')) {
  customElements.define('dl-product-screen', DesktopProductScreen);
}
