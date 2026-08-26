import { useState } from "react";
import {
  ArrowRightIcon,
  BackpackIcon,
  BarChartIcon,
  CheckCircledIcon,
  ChevronRightIcon,
  DashboardIcon,
  HamburgerMenuIcon,
  HomeIcon,
  LightningBoltIcon,
  MixerHorizontalIcon,
  PaperPlaneIcon,
  PersonIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { BottomSheet, Carousel, MobileScroll } from "./mobile";

type Platform = "telegram" | "max";
type Role = "guest" | "cash" | "kitchen" | "director";
type Sheet = "menu" | "demo" | null;

const roles: Array<{ id: Role; label: string; kicker: string }> = [
  { id: "guest", label: "Гость", kicker: "Заказывает" },
  { id: "cash", label: "Касса", kicker: "Принимает" },
  { id: "kitchen", label: "Кухня", kicker: "Готовит" },
  { id: "director", label: "Директор", kicker: "Видит выручку" },
];

function Brand() {
  return (
    <div className="brand" aria-label="Юрта НеЖди">
      <img className="brand-mark" src="/assets/content/brand-flame.png" alt="" draggable="false" />
      <span>Юрта <b>НеЖди</b></span>
    </div>
  );
}

function PlatformToggle({ platform, onChange }: { platform: Platform; onChange: (value: Platform) => void }) {
  return (
    <div className="platform-toggle" aria-label="Выбор мессенджера">
      <button className={platform === "telegram" ? "is-active" : ""} onClick={() => onChange("telegram")} type="button">
        <PaperPlaneIcon /> Telegram
      </button>
      <button className={platform === "max" ? "is-active" : ""} onClick={() => onChange("max")} type="button">
        <RocketIcon /> MAX
      </button>
    </div>
  );
}

function MiniTop({ title, platform }: { title: string; platform: Platform }) {
  return (
    <div className="mini-top">
      <span className="mini-avatar"><LightningBoltIcon /></span>
      <span><b>ЮртаНеЖди</b><small>{title}</small></span>
      <i>{platform === "telegram" ? "TG" : "MAX"}</i>
    </div>
  );
}

function GuestScreen({ platform, compact = false }: { platform: Platform; compact?: boolean }) {
  return (
    <div className={`product-screen guest-screen ${compact ? "is-compact" : ""}`}>
      <MiniTop title="меню" platform={platform} />
      <div className="screen-pad">
        <span className="screen-kicker">01 · гость</span>
        <h3>Выбирает блюда</h3>
        <div className="dish-row">
          <img src="/assets/content/dish-shawarma.png" alt="Шаурма классическая" draggable="false" />
          <span><b>Шаурма классическая</b><small>Фирменный соус</small><strong>500 ₽</strong></span>
          <button type="button" aria-label="Добавить шаурму">+</button>
        </div>
        {!compact ? (
          <div className="dish-row">
            <img src="/assets/content/dish-plov.png" alt="Плов с бараниной" draggable="false" />
            <span><b>Плов с бараниной</b><small>Рис, баранина, зира</small><strong>480 ₽</strong></span>
            <button type="button" aria-label="Добавить плов">+</button>
          </div>
        ) : null}
        <div className="cart-row"><span>Корзина · 1 позиция</span><b>500 ₽</b></div>
      </div>
    </div>
  );
}

function CashScreen({ platform, compact = false }: { platform: Platform; compact?: boolean }) {
  return (
    <div className={`product-screen cash-screen ${compact ? "is-compact" : ""}`}>
      <MiniTop title="касса" platform={platform} />
      <div className="screen-pad">
        <span className="screen-kicker">02 · касса</span>
        <h3>Получает заказ</h3>
        <div className="order-box">
          <div><b>№120</b><span className="status-chip">Новый</span></div>
          <small>Самовывоз · к 19:20</small>
          <p>Шаурма ×1 <b>500 ₽</b></p>
          <p>Лимонад ×1 <b>80 ₽</b></p>
          {!compact ? <button type="button">Принять заказ</button> : null}
        </div>
      </div>
    </div>
  );
}

function KitchenScreen({ platform, compact = false }: { platform: Platform; compact?: boolean }) {
  return (
    <div className={`product-screen kitchen-screen ${compact ? "is-compact" : ""}`}>
      <MiniTop title="кухня" platform={platform} />
      <div className="screen-pad">
        <span className="screen-kicker">03 · кухня</span>
        <h3>Готовит заказ</h3>
        <div className="ticket-box">
          <div><b>№120</b><span>19:20</span></div>
          <strong>Шаурма классическая ×1</strong>
          <small>+ Фирменный соус · без лука</small>
          <strong>Лимонад ×1</strong>
          {!compact ? <button type="button"><CheckCircledIcon /> Готово</button> : <span className="ticket-progress">Готовится</span>}
        </div>
      </div>
    </div>
  );
}

function DirectorScreen({ platform, compact = false }: { platform: Platform; compact?: boolean }) {
  return (
    <div className={`product-screen director-screen ${compact ? "is-compact" : ""}`}>
      <MiniTop title="директор" platform={platform} />
      <div className="screen-pad">
        <span className="screen-kicker">04 · директор</span>
        <h3>Видит результат</h3>
        <div className="revenue-box">
          <small>Выручка сегодня</small>
          <strong>19 000 ₽</strong>
          <div className="revenue-bars" aria-label="График выручки"><i /><i /><i /><i /><i /><i /><i /></div>
        </div>
        <div className="metric-grid">
          <span><b>25</b><small>заказов</small></span>
          <span><b>760 ₽</b><small>средний чек</small></span>
        </div>
        {!compact ? <div className="success-toast"><CheckCircledIcon /> №120 завершён <b>+580 ₽</b></div> : null}
      </div>
    </div>
  );
}

function RoleScreen({ role, platform }: { role: Role; platform: Platform }) {
  if (role === "guest") return <GuestScreen platform={platform} />;
  if (role === "cash") return <CashScreen platform={platform} />;
  if (role === "kitchen") return <KitchenScreen platform={platform} />;
  return <DirectorScreen platform={platform} />;
}

function HeroJourney({ platform }: { platform: Platform }) {
  return (
    <div className="hero-journey" aria-label="Путь заказа по четырём ролям">
      <div className="hero-status"><CheckCircledIcon /> №120 · принят · готовится</div>
      <article className="hero-device hero-device--guest"><GuestScreen platform={platform} compact /></article>
      <article className="hero-device hero-device--cash"><CashScreen platform={platform} compact /></article>
      <article className="hero-device hero-device--kitchen"><KitchenScreen platform={platform} compact /></article>
      <article className="hero-device hero-device--director"><DirectorScreen platform={platform} compact /></article>
      <div className="role-label role-label--guest"><PersonIcon /> Гость</div>
      <div className="role-label role-label--cash"><BackpackIcon /> Касса</div>
      <div className="role-label role-label--kitchen"><MixerHorizontalIcon /> Кухня</div>
      <div className="role-label role-label--director"><BarChartIcon /> Директор</div>
    </div>
  );
}

export default function Prototype() {
  const [platform, setPlatform] = useState<Platform>("telegram");
  const [activeRole, setActiveRole] = useState<Role>("guest");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [menuOnline, setMenuOnline] = useState(true);

  return (
    <div className="prototype-shell">
      <MobileScroll className="app-screen">
        <main className="mobile-site" data-testid="mobile-site" aria-label="Мобильный сайт ЮртаНеЖди">
          <header className="site-header">
            <Brand />
            <button className="menu-button" type="button" onClick={() => setSheet("menu")} aria-label="Открыть меню"><HamburgerMenuIcon /></button>
          </header>

          <section className="hero-section">
            <span className="eyebrow">Один заказ · четыре роли</span>
            <h1>Заказ живёт<br /><em>в телефоне.</em></h1>
            <p>От гостя до директора — один Mini App внутри {platform === "telegram" ? "Telegram" : "MAX"}.</p>
            <button className="primary-button" type="button" onClick={() => setSheet("demo")}>Подключить заведение <ArrowRightIcon /></button>
            <PlatformToggle platform={platform} onChange={setPlatform} />
            <HeroJourney platform={platform} />
          </section>

          <section className="proof-strip" aria-label="Ключевые преимущества">
            <div><b>1</b><span>Mini App</span></div><div><b>4</b><span>роли</span></div><div><b>0</b><span>ПК</span></div>
          </section>

          <section className="section journey-section">
            <div className="section-heading">
              <span className="eyebrow">Как это работает</span>
              <h2>Один заказ.<br /><em>Весь путь.</em></h2>
              <p>Нажми на роль — увидишь, что происходит с заказом №120 на каждом телефоне.</p>
            </div>
            <div className="role-tabs" role="tablist" aria-label="Роли в заказе">
              {roles.map((role, index) => (
                <button key={role.id} type="button" role="tab" aria-selected={activeRole === role.id} className={activeRole === role.id ? "is-active" : ""} onClick={() => setActiveRole(role.id)}>
                  <span>0{index + 1}</span>{role.label}
                </button>
              ))}
            </div>
            <div className="role-stage">
              <div className="role-stage__top"><span>{roles.find((role) => role.id === activeRole)?.kicker}</span><b>Заказ №120</b></div>
              <div className="role-stage__device"><RoleScreen role={activeRole} platform={platform} /></div>
              <div className="role-stage__status"><CheckCircledIcon /> Всё обновляется автоматически</div>
            </div>
          </section>

          <section className="section director-feature">
            <span className="eyebrow eyebrow--dark">Директору</span>
            <h2>Вся точка<br /><em>в кармане.</em></h2>
            <p>Выручка, заказы и стоп-лист обновляются сразу после каждого действия команды.</p>
            <div className="director-showcase">
              <DirectorScreen platform={platform} />
              <div className="live-note"><span>Только что</span><b>№120 завершён</b><strong>+580 ₽</strong></div>
            </div>
            <ul className="feature-list">
              <li><CheckCircledIcon /><span><b>Живые показатели</b> без обновления страницы</span></li>
              <li><CheckCircledIcon /><span><b>Все точки сети</b> в одном телефоне</span></li>
              <li><CheckCircledIcon /><span><b>Меню и стоп-лист</b> меняются на ходу</span></li>
            </ul>
          </section>

          <section className="section menu-feature">
            <div className="section-heading">
              <span className="eyebrow">Меню с телефона</span>
              <h2>Изменили раз —<br /><em>увидели все.</em></h2>
              <p>Закончилась позиция? Скрыли у директора — она исчезла у гостя.</p>
            </div>
            <div className={`availability-card ${menuOnline ? "is-online" : "is-offline"}`}>
              <div className="availability-card__top">
                <div><small>Директор · товары</small><h3>Шаурма классическая</h3></div>
                <button type="button" className="switch" aria-pressed={menuOnline} onClick={() => setMenuOnline((value) => !value)}><span /></button>
              </div>
              <div className="availability-preview">
                <img src="/assets/content/dish-shawarma.png" alt="Шаурма классическая" draggable="false" />
                <span><b>Шаурма классическая</b><small>{menuOnline ? "Доступна гостю" : "Скрыта из меню"}</small></span>
                <strong>{menuOnline ? "500 ₽" : "Стоп"}</strong>
              </div>
              <p><CheckCircledIcon /> {menuOnline ? "Позиция видна во всех точках" : "Изменение уже у гостей"}</p>
            </div>
          </section>

          <section className="section ways-section">
            <div className="section-heading">
              <span className="eyebrow">Способы получения</span>
              <h2>Выбирай,<br /><em>как удобно.</em></h2>
              <p>Три сценария для гостя — единый понятный заказ для команды.</p>
            </div>
            <Carousel ariaLabel="Способы получения заказа" className="ways-carousel" contentClassName="ways-track">
              <article className="way-card way-card--orange"><span className="way-number">01</span><BackpackIcon /><h3>Самовывоз</h3><p>Готово ко времени. Без очереди и кассы.</p><div><CheckCircledIcon /> Заказ №118 готов</div></article>
              <article className="way-card way-card--amber"><span className="way-number">02</span><RocketIcon /><h3>Доставка</h3><p>Статус готовки и путь курьера — в чате.</p><div><CheckCircledIcon /> Курьер в пути · 18 мин</div></article>
              <article className="way-card way-card--blue"><span className="way-number">03</span><HomeIcon /><h3>К столику</h3><p>Заказ по QR, оплата без ожидания официанта.</p><div><CheckCircledIcon /> Стол №7 · принято</div></article>
            </Carousel>
          </section>

          <section className="messenger-section">
            <div className="messenger-orbit">
              <span className="messenger-logo messenger-logo--tg"><PaperPlaneIcon /></span>
              <div className="messenger-phone"><DashboardIcon /><b>Mini App</b><small>без установки</small></div>
              <span className="messenger-logo messenger-logo--max"><RocketIcon /></span>
            </div>
            <span className="eyebrow">Один продукт</span>
            <h2>Telegram<br /><em>или MAX.</em></h2>
            <p>Гость открывает привычный чат. Команда получает рабочий интерфейс там же.</p>
            <PlatformToggle platform={platform} onChange={setPlatform} />
          </section>

          <section className="final-cta">
            <img src="/assets/content/cat-ordering.webp" alt="Фирменный кот оформляет заказ с телефона" draggable="false" />
            <span className="eyebrow eyebrow--light">Покажем на вашем меню</span>
            <h2>Гости уже<br /><em>не ждут.</em></h2>
            <p>Подключим демо и пройдём весь заказ за 15 минут.</p>
            <button className="primary-button primary-button--light" type="button" onClick={() => setSheet("demo")}>Получить демо <ArrowRightIcon /></button>
          </section>

          <footer className="site-footer">
            <Brand />
            <p>Mini App для гостя, кассы, кухни и директора — внутри Telegram и MAX.</p>
            <div><span>© 2026</span><b>Весь продукт — в телефоне</b></div>
          </footer>
        </main>
      </MobileScroll>

      <BottomSheet open={sheet !== null} onOpenChange={(open) => { if (!open) setSheet(null); }} title={sheet === "menu" ? "Навигация" : "Подключить заведение"} description={sheet === "menu" ? "Вся страница — один мобильный сценарий" : "Выберите мессенджер для демонстрации"} snap={sheet === "menu" ? 0.54 : 0.48}>
        {sheet === "menu" ? (
          <div className="sheet-nav">
            {roles.map((role, index) => <button key={role.id} type="button" onClick={() => { setActiveRole(role.id); setSheet(null); }}><span>0{index + 1}</span>{role.label}<ChevronRightIcon /></button>)}
            <button type="button" onClick={() => setSheet("demo")}><span>05</span>Получить демо<ArrowRightIcon /></button>
          </div>
        ) : (
          <div className="demo-sheet">
            <button className="telegram-action" type="button" onClick={() => { setPlatform("telegram"); setSheet(null); }}><PaperPlaneIcon /> Открыть демо в Telegram</button>
            <button className="max-action" type="button" onClick={() => { setPlatform("max"); setSheet(null); }}><RocketIcon /> Открыть демо в MAX</button>
            <p><CheckCircledIcon /> Без установки и отдельного кабинета</p>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
