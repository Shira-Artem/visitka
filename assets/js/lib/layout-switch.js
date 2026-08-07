/* ============================================================
   layout-switch.js — «одна секция, несколько раскладок».

   Story живёт в трёх вариантах (пин-десктоп / потоковый / мобильная
   Story), Ways — в двух. Раньше у каждой секции была своя копия связки
   «снести предыдущую раскладку → собрать новую → подписаться на пачку
   matchMedia», и они успели разойтись: Ways не знала про брейкпоинт 768.

   Здесь это один хелпер. Раскладка выбирается по имени, и пересборка
   происходит только когда имя реально изменилось: смена ширины внутри
   одной и той же раскладки (например 700 → 640, обе «мобильная Story»)
   больше не перемонтирует сцену.

     const layout = createLayoutSwitch(
       () => bp.atMost('mobile') ? 'story' : 'desktop',   // выбор имени
       { story: setupMobileStory, desktop: setupDesktop } // сборщики
     );
     layout.destroy();

   Каждый сборщик возвращает свою функцию teardown (или ничего).
   ============================================================ */
import { bp, onReducedChange } from './breakpoints.js';

export function createLayoutSwitch(choose, setups) {
  let key = null;
  let teardown = null;

  function apply() {
    const next = choose();
    if (next === key) return;
    if (teardown) teardown();
    key = next;
    teardown = setups[next]() || null;
  }

  apply();

  const offBp = bp.onChange(apply);
  const offReduce = onReducedChange(apply);

  return {
    current: function () { return key; },
    destroy: function () {
      offBp();
      offReduce();
      if (teardown) teardown();
      teardown = null;
      key = null;
    }
  };
}
