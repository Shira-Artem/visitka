/* ============================================================
   motion.js — математика скролл-сцен.
   Раньше эти три функции лежали по копии в каждой сцене main.js.
   ============================================================ */

export function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

/** Плавная (smoothstep) доля прогресса внутри окна [start, end]. */
export function smoothRange(progress, start, end) {
  const value = clamp01((progress - start) / (end - start));
  return value * value * (3 - 2 * value);
}

/* Hysteresis: требует реально «перейти» границу с запасом (margin), а не
   коснуться её — иначе медленный скролл туда-сюда рядом с границей дребезжит. */
export function pickIndex(rawFloat, lastIndex, count, margin) {
  const rounded = Math.max(0, Math.min(count - 1, Math.round(rawFloat)));
  if (rounded === lastIndex) return lastIndex;
  const forward = rounded > lastIndex;
  const threshold = lastIndex + (forward ? (1 - margin) : -(1 - margin));
  const crossed = forward ? rawFloat >= threshold : rawFloat <= threshold;
  return crossed ? rounded : lastIndex;
}
