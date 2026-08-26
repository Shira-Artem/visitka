/* ============================================================
   story/config.js — сценарий Story одним файлом.

   Всё, что описывает «что рассказываем», лежит здесь; «как показываем» —
   в core.js и трёх раскладках рядом. Веса актов (vh) — единственный
   источник правды для длины сценария (~660svh итого на десктопе).
   ============================================================ */

export const STORY_ACTS = [
  { id: 'hero',     vh: 70,  states: ['idle'] },
  { id: 'how',      vh: 130, states: ['venue', 'menu', 'checkout', 'success'] },
  { id: 'checkout', vh: 65,  states: ['checkout'] },
  { id: 'cash',     vh: 230, states: ['sent', 'received', 'accepted'] },
  { id: 'kitchen',  vh: 90,  states: ['new', 'cooking', 'ready'] },
  { id: 'director', vh: 75,  states: ['default'] }
];

export const ACT_ROLE = { hero: 'guest', how: 'guest', checkout: 'guest', cash: 'cash', kitchen: 'cook', director: 'director' };

// Mobile follows the same narrative in scroll order: the link opens the
// venue screen, then every new card advances the single live phone by one
// understandable product step.
export const MOBILE_ACT_STATE = { hero: 'venue', how: 'menu', checkout: 'checkout', cash: 'accepted', kitchen: 'ready', director: 'default' };

export const HOW_COPY = {
  venue: { kicker: 'Шаг 1 / 4', headline: 'Открыл Telegram / MAX' },
  menu: { kicker: 'Шаг 2 / 4', headline: 'Выбрал блюда' },
  checkout: { kicker: 'Шаг 3 / 4', headline: 'Оплатил' },
  success: { kicker: 'Шаг 4 / 4', headline: 'Забрал заказ' }
};

export const KITCHEN_CHIP = { new: 'Новый заказ', cooking: 'Готовится', ready: 'Готово' };

/* ---- Мобильный Hero «Блок 1» (≤768px) ----
   Отдельный контент от десктопного hero-акта: тот говорит языком гостя
   («НеЖди.Закажи.Оплати.Забери.»), этот — языком владельца заведения,
   который выбирает, подключать сервис или нет. Монтируется mobile-story.js
   поверх обычной потоковой раскладки (mobile-flow.js); экран телефона при
   этом сразу стоит на «Директоре» — сильный, уже готовый product visual
   вместо цикла по четырём ролям. */
export const MOBILE_HERO_CAPTION = {
  eyebrow: 'Mini App для заведений',
  lines: ['Гости', 'не ждут'],
  sub: 'Заказы — в Telegram и MAX. Каждый у вас на виду.',
  ctaLabel: 'Подключить заведение',
  ctaHref: '#final',
  hint: 'Как это работает'
};
