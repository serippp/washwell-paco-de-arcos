'use strict';

(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  const mobile = window.matchMedia('(max-width: 900px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setMenu(open, restoreFocus = false) {
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
    if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) setMenu(false, true);
    if (event.key !== 'Tab' || menu.hidden) return;
    const last = menu.querySelector('a:last-child');
    if (event.shiftKey && document.activeElement === menuButton) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); menuButton.focus();
    }
  });
  mobile.addEventListener('change', () => { if (!mobile.matches) setMenu(false); });
  document.addEventListener('click', event => {
    if (!menu.hidden && !event.target.closest('.site-header')) setMenu(false);
  });

  const hero = document.querySelector('#hero-video');
  const videoButton = document.querySelector('#video-toggle');
  const processVideo = document.querySelector('#process-video');
  let userPaused = reducedMotion.matches;
  let heroOnScreen = true;

  function updateVideoButton() {
    const paused = hero.paused;
    videoButton.setAttribute('aria-label', paused ? 'Reproduzir vídeo' : 'Pausar vídeo');
    videoButton.querySelector('use').setAttribute('href', paused ? '#play' : '#pause');
  }
  function playHero() {
    if (userPaused || !heroOnScreen || document.hidden || !processVideo.paused) return;
    const promise = hero.play();
    if (promise) promise.catch(updateVideoButton);
  }
  hero.muted = true;
  if (reducedMotion.matches) { hero.removeAttribute('autoplay'); hero.pause(); }
  hero.addEventListener('loadeddata', () => { hero.classList.add('is-ready'); updateVideoButton(); });
  hero.addEventListener('playing', () => { hero.classList.add('is-ready'); updateVideoButton(); });
  hero.addEventListener('pause', updateVideoButton);
  hero.addEventListener('error', () => {
    videoButton.setAttribute('aria-label', 'Vídeo indisponível');
    videoButton.disabled = true;
  });
  videoButton.addEventListener('click', () => {
    userPaused = !hero.paused;
    if (userPaused) hero.pause();
    else { processVideo.pause(); playHero(); }
  });
  processVideo.addEventListener('play', () => hero.pause());
  processVideo.addEventListener('pause', playHero);
  processVideo.addEventListener('ended', playHero);
  reducedMotion.addEventListener('change', event => {
    userPaused = event.matches;
    if (event.matches) hero.pause(); else playHero();
  });

  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => {
      heroOnScreen = entries[0].isIntersecting;
      if (heroOnScreen) playHero(); else hero.pause();
    }, { threshold: 0.12 });
    heroObserver.observe(hero);
    const processObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        processVideo.preload = 'metadata';
        processVideo.load();
        processObserver.disconnect();
      }
    }, { rootMargin: '350px' });
    processObserver.observe(processVideo);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hero.pause(); processVideo.pause(); } else playHero();
  });
  if (hero.readyState >= 2) hero.classList.add('is-ready');
  updateVideoButton();
  if (!reducedMotion.matches) playHero();

  const dialog = document.querySelector('#result-dialog');
  let resultTrigger;
  document.querySelectorAll('[data-open-result]').forEach(button => {
    button.addEventListener('click', () => {
      resultTrigger = button;
      if (typeof dialog.showModal !== 'function') {
        window.open('assets/images/estofos-antes-depois.jpg', '_blank', 'noopener');
        return;
      }
      dialog.showModal();
      document.body.classList.add('dialog-open');
      dialog.querySelector('.dialog-close').focus();
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (resultTrigger) resultTrigger.focus({ preventScroll: true });
  });
})();
