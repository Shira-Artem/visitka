/* ============================================================
   chrome.js — постоянный «хром» страницы: шапка, плавающая кнопка,
   бургер-меню и общий reveal секций. К сценариям Story/Ways отношения
   не имеет, поэтому живёт отдельным модулем.
   ============================================================ */

/** Шапка при скролле + мобильная фикс-кнопка. */
function initHeader() {
  const header = document.getElementById('header');
  const mobileCta = document.getElementById('mobileCta');
  const finalSection = document.getElementById('final');
  const storySection = document.getElementById('story');
  if (!header || !mobileCta) return;

  let finalInView = false;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    // Скрываем плавающую кнопку в блоке #final — там уже есть свои Telegram/MAX-кнопки,
    // и фикс-кнопка иначе перекрывает их снизу.
    const storyInView = storySection && storySection.getBoundingClientRect().bottom > 0 && storySection.getBoundingClientRect().top < window.innerHeight;
    mobileCta.classList.toggle('show', y > 600 && !finalInView && !storyInView);
  }

  if (finalSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { finalInView = e.isIntersecting; });
      onScroll();
    }, { rootMargin: '0px 0px -10% 0px' }).observe(finalSection);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/** Бургер-меню. */
function initMenu() {
  const burger = document.getElementById('burger');
  const mmenu = document.getElementById('mmenu');
  if (!burger || !mmenu) return;

  burger.addEventListener('click', function () {
    mmenu.classList.toggle('open');
    document.body.style.overflow = mmenu.classList.contains('open') ? 'hidden' : '';
  });
  mmenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      mmenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/** Reveal секций при появлении в зоне видимости. */
function initReveal() {
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }
}

export function initChrome() {
  initHeader();
  initMenu();
  initReveal();
}
