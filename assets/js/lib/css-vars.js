/* ============================================================
   css-vars.js — запись и, главное, уборка CSS-переменных сцены.

   Сцена — это набор переменных на DOM-узле, которые читает CSS.
   Забытая при teardown переменная = «залипшая» раскладка после
   поворота экрана, поэтому каждый список переменных объявляется
   один раз константой и переиспользуется и на set, и на clear.
   ============================================================ */

export function setVars(el, map) {
  if (!el) return;
  for (const name in map) el.style.setProperty(name, map[name]);
}

export function clearVars(el, names) {
  if (!el) return;
  names.forEach(function (name) { el.style.removeProperty(name); });
}
