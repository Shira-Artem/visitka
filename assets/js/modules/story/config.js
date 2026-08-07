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

/* ---- Мобильная Story «Свет заказа» (≤768px) ---- */

export const MOBILE_SCENE_VH = 108;         // высота прокрутки одной сцены
export const MOBILE_HEADER_CLEARANCE = 68;  // воздух под фиксированной шапкой
export const MOBILE_CAPTION_GAP = 16;       // зазор между подписью и телефоном
export const MOBILE_RAIL_SPACE = 46;        // нить + маршрутная шкала под телефоном
export const MOBILE_MIN_CAPTION_BAND = 196;
export const PHONE_WIDTH_RATIO = 9 / 19.5;  // пропорции корпуса (components.css)
export const RAIL_ENERGY_GAIN = 42;         // сколько энергии даёт скорость прокрутки
export const RAIL_ENERGY_DECAY = 0.84;      // затухание энергии за кадр 16 мс
export const RAIL_SETTLE_MS = 420;          // страховочный сброс энергии после остановки
export const MOBILE_TONE_LEAD = 0.62;       // с какой доли сцены свет начинает уходить в следующую
export const MOBILE_EXIT_START = 0.95;      // мягкая передача кадра секции «Способы получения»
export const MOBILE_PAGE_TONE = [250, 247, 243]; // фон страницы сразу под Story

/* Сцены сценария: подпись + собственная световая температура.
   Дуга света: тёплая бумага → оранжевый выбор → золото оплаты →
   огонь кассы → самая горячая точка кухни → холодный контроль директора. */
export const MOBILE_SCENES = {
  hero: {
    tone: { base: [241, 232, 220], key: [255, 173, 114], tint: [168, 84, 50] }
  },
  how: {
    index: '01', label: 'Выбор',
    lines: ['Выбрал', 'блюдо'],
    note: 'Меню заведения открывается прямо в Telegram или MAX',
    tone: { base: [242, 229, 213], key: [255, 152, 78], tint: [171, 78, 40] }
  },
  checkout: {
    index: '02', label: 'Оплата',
    lines: ['Оплатил', 'онлайн'],
    note: '580 ₽ сохранённой картой — без ввода данных и очереди',
    tone: { base: [246, 234, 203], key: [255, 190, 58], tint: [156, 102, 16] }
  },
  cash: {
    index: '03', label: 'Касса',
    lines: ['Заказ уже', 'у <span class="story__hl-accent">кассира</span>'],
    note: 'Заказ №120 пришёл автоматически — без звонков и бумажек',
    tone: { base: [245, 226, 202], key: [255, 126, 40], tint: [174, 68, 22] }
  },
  kitchen: {
    index: '04', label: 'Кухня',
    lines: ['Кухня уже', 'готовит'],
    note: 'Состав, модификаторы и комментарий гостя — сразу у повара',
    tone: { base: [235, 206, 186], key: [240, 62, 22], tint: [152, 42, 14] }
  },
  director: {
    index: '05', label: 'Контроль',
    lines: ['Директор', 'видит <span class="story__hl-accent">всё</span>'],
    note: 'Выручка, заказы и смена — в реальном времени',
    tone: { base: [224, 231, 232], key: [70, 183, 150], tint: [26, 100, 80] }
  }
};
