"use strict";
(function () {
  const views = [...document.querySelectorAll('[data-view]')];
  const navLinks = [...document.querySelectorAll('.nav a')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const baseTitle = 'Lanyu Li';
  const viewTitles = { home: 'content and web', work: 'Work', built: 'Built', about: 'About' };

  // Hash routes: #home, #work, #work/articles, #built, #about
  function parseHash() {
    const [view, tab] = location.hash.replace(/^#/, '').split('/');
    return { view: view || 'home', tab };
  }

  function loadFrames(viewEl) {
    viewEl.querySelectorAll('iframe[data-src]').forEach((frameEl) => {
      frameEl.src = frameEl.dataset.src;
      frameEl.removeAttribute('data-src');
    });
  }

  function showView(name, { moveFocus }) {
    const viewEl = views.find((v) => v.dataset.view === name);
    if (!viewEl) return false;

    views.forEach((v) => { v.hidden = v !== viewEl; });
    navLinks.forEach((a) => {
      if (a.getAttribute('href') === '#' + name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.title = name === 'home' ? `${baseTitle}, ${viewTitles.home}` : `${viewTitles[name]} | ${baseTitle}`;
    loadFrames(viewEl);

    if (moveFocus) {
      window.scrollTo(0, 0);
      viewEl.querySelector('h1')?.focus({ preventScroll: true });
    }
    return true;
  }

  function route({ moveFocus }) {
    const { view, tab } = parseHash();
    const update = () => {
      if (showView(view, { moveFocus }) && view === 'work' && tab) selectTab(tab, { moveFocus: false });
    };
    if (moveFocus && document.startViewTransition && !reduceMotion.matches) {
      // A skipped transition (fast second click, hidden tab) rejects `ready`; the view still switches
      // A rapid second click skips the running transition; that rejects these promises, which is expected
      const transition = document.startViewTransition(update);
      transition.ready.catch(() => {});
      transition.finished.catch(() => {});
    } else {
      update();
    }
  }

  // Work sub-tabs (ARIA tabs pattern, arrow keys move between tabs)
  const tabEls = [...document.querySelectorAll('[role="tab"]')];

  function selectTab(name, { moveFocus }) {
    const tabEl = tabEls.find((t) => t.id === 'tab-' + name);
    if (!tabEl) return;
    tabEls.forEach((t) => {
      const isSelected = t === tabEl;
      t.setAttribute('aria-selected', String(isSelected));
      t.tabIndex = isSelected ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !isSelected;
    });
    if (moveFocus) tabEl.focus();
  }

  tabEls.forEach((tabEl, i) => {
    tabEl.addEventListener('click', () => {
      const name = tabEl.id.replace('tab-', '');
      selectTab(name, { moveFocus: false });
      history.replaceState(null, '', '#work/' + name);
    });
    tabEl.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = tabEls[(i + step + tabEls.length) % tabEls.length];
      next.click();
      next.focus();
    });
  });

  // Same idea, two ways
  const examples = [
    {
      topic: 'my 3D photo album',
      tech: "Hand-landmark detection maps how open your palm is to the camera's position on a 3D timeline.",
      plain: 'Open your hand to move forward through your photos.',
    },
    {
      topic: 'vocabulary apps',
      tech: 'Spaced repetition schedules each review just before the forgetting curve drops.',
      plain: "The app shows you a word again right before you'd forget it.",
    },
    {
      topic: 'my work at Huatai',
      tech: 'Python scripts automate subscription and redemption workflows across 180+ fund products.',
      plain: 'I wrote scripts that do the repetitive paperwork for 180+ funds, so people do half as much by hand.',
    },
    {
      topic: 'an employer pitch',
      tech: 'Apprentices who convert to full-time hires lower future recruiting costs.',
      plain: 'Train a student now, and you may not need to recruit for that role later.',
    },
  ];
  const pairEl = document.querySelector('[data-pair]');
  const nextEl = document.querySelector('[data-next]');
  let current = 0;

  function renderExample() {
    const ex = examples[current];
    document.querySelector('[data-topic]').textContent = 'Topic: ' + ex.topic;
    document.querySelector('[data-tech]').textContent = ex.tech;
    document.querySelector('[data-plain]').textContent = ex.plain;
    document.querySelector('[data-count]').textContent = `${current + 1} of ${examples.length}`;
  }

  if (pairEl && nextEl) {
    nextEl.hidden = false;
    nextEl.addEventListener('click', () => {
      current = (current + 1) % examples.length;
      if (reduceMotion.matches) {
        renderExample();
        return;
      }
      pairEl.classList.add('is-swapping');
      setTimeout(() => {
        renderExample();
        pairEl.classList.remove('is-swapping');
      }, 180);
    });
  }

  // Border under the sticky bar once the page scrolls
  const topbarEl = document.querySelector('.topbar');
  const onScroll = () => topbarEl.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  window.addEventListener('hashchange', () => {
    if (views.some((v) => v.dataset.view === parseHash().view)) route({ moveFocus: true });
  });
  route({ moveFocus: false });
})();
