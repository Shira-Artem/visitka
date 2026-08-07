/* ============================================================
   breakpoints.js — текущая раскладка одним именем.

   Числа брейкпоинтов НЕ живут в JS. Единственный их источник —
   assets/css/tokens.css, где на :root объявлена переменная --bp:

     desktop  ≥981px   compact  769…980   mobile  621…768   phone  ≤620

   Здесь мы её только читаем. Хочешь подвинуть границу — правишь
   tokens.css, и скрипт едет следом сам.

   Про prefers-reduced-motion: это не ширина, поэтому он остаётся
   обычным matchMedia и живёт рядом — его слушают те же места, что
   и смену раскладки.
   ============================================================ */

// От узкой к широкой: индекс в этом массиве задаёт порядок сравнения.
const ORDER = ['phone', 'mobile', 'compact', 'desktop'];
const FALLBACK = 'desktop';

const root = document.documentElement;
const listeners = new Set();
let frame = 0;

function read() {
  const raw = getComputedStyle(root).getPropertyValue('--bp').trim().replace(/^["']|["']$/g, '');
  return ORDER.indexOf(raw) === -1 ? FALLBACK : raw;
}

let current = read();

function sync() {
  frame = 0;
  const next = read();
  if (next === current) return;
  current = next;
  listeners.forEach(function (fn) { fn(current); });
}

// Одна подписка на resize на весь сайт, прижатая к кадру: слушателей
// раскладки может быть сколько угодно, чтения --bp — одно на кадр.
window.addEventListener('resize', function () {
  if (!frame) frame = requestAnimationFrame(sync);
}, { passive: true });

export const bp = {
  name() { return current; },
  is(name) { return current === name; },
  /** Текущая раскладка не шире указанной: atMost('mobile') === «≤768px». */
  atMost(name) { return ORDER.indexOf(current) <= ORDER.indexOf(name); },
  /** Текущая раскладка не уже указанной: atLeast('compact') === «≥769px». */
  atLeast(name) { return ORDER.indexOf(current) >= ORDER.indexOf(name); },
  onChange(fn) {
    listeners.add(fn);
    return function off() { listeners.delete(fn); };
  }
};

const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

export function prefersReduced() {
  return reduceMQ.matches;
}

export function onReducedChange(fn) {
  if (reduceMQ.addEventListener) {
    reduceMQ.addEventListener('change', fn);
    return function off() { reduceMQ.removeEventListener('change', fn); };
  }
  reduceMQ.addListener(fn);
  return function off() { reduceMQ.removeListener(fn); };
}
