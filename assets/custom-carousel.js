function waitForFlickityAndInit() {
  if (typeof Flickity === 'undefined') {
    return setTimeout(waitForFlickityAndInit, 50);
  }

  function initializeCarousels(cellAlign, contain, freeScroll) {
    const carousels = document.querySelectorAll('.custom-carousel');

    carousels.forEach((el, index) => {
      const flkty = new Flickity(el, {
        cellAlign: cellAlign,
        wrapAround: false,
        contain: contain,
        fullscreen: true,
        pageDots: true,
        prevNextButtons: false, // we are using custom external arrows
        freeScroll: freeScroll
      });

      console.log(`Carousel ${index + 1} has ${flkty.slides.length} slides`);

      // IMPORTANT: scope arrows to the closest carousel container if possible
      // (prevents multiple carousels on a page from sharing one set of buttons)
      const container = el.closest('.custom-video-review-carousel-container') || document;

      const prevBtn = container.querySelector('.custom-carousel-prev');
      const nextBtn = container.querySelector('.custom-carousel-next');

      // If you truly have only one carousel on the page and the buttons live elsewhere,
      // fall back to global selectors.
      const prev = prevBtn || document.querySelector('.custom-carousel-prev');
      const next = nextBtn || document.querySelector('.custom-carousel-next');

      if (!prev || !next) {
        console.warn('Custom carousel prev/next buttons not found.');
      }

      function syncArrowDisabledState() {
        // never disabled in loop mode
        if (flkty.options.wrapAround) {
          if (prev) {
            prev.disabled = false;
            prev.classList.remove('disabled');
          }
          if (next) {
            next.disabled = false;
            next.classList.remove('disabled');
          }
          return;
        }

        const isFirst = flkty.selectedIndex === 0;
        const isLast = flkty.selectedIndex === flkty.slides.length - 1;

        if (prev) {
          prev.disabled = isFirst;
          prev.classList.toggle('disabled', isFirst);
        }
        if (next) {
          next.disabled = isLast;
          next.classList.toggle('disabled', isLast);
        }
      }

      // External arrow wiring
      // IMPORTANT: do NOT pass true to next/previous when wrapAround is false.
      if (prev) {
        prev.addEventListener('click', () => {
          if (prev.disabled) return;
          flkty.previous();
        });
      }

      if (next) {
        next.addEventListener('click', () => {
          if (next.disabled) return;
          flkty.next();
        });
      }

      flkty.on('ready', syncArrowDisabledState);
      flkty.on('change', syncArrowDisabledState);
      flkty.on('settle', syncArrowDisabledState);

      // Make focus "pull" the carousel to the focused cell,
      // but ONLY when the focused cell is offscreen.
      el.addEventListener('focusin', (e) => {
        const cellEl = e.target.closest('.carousel-cell');
        if (!cellEl) return;

        const viewport = flkty.viewport;
        if (!viewport) return;

        const vRect = viewport.getBoundingClientRect();
        const cRect = cellEl.getBoundingClientRect();

        const fullyVisible = cRect.left >= vRect.left && cRect.right <= vRect.right;
        if (fullyVisible) return;

        // Select by element (more reliable than index)
        flkty.selectCell(cellEl, false, false);

        // Ensure arrows reflect the new selection after motion completes
        flkty.once('settle', syncArrowDisabledState);
      });

      // Initial state
      syncArrowDisabledState();
    });
  }

  function initializeOnLoad() {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1020) {
      initializeCarousels('left', true, false);
    } else {
      initializeCarousels('center', false, true);
    }
  }

  document.addEventListener('DOMContentLoaded', initializeOnLoad);
}

waitForFlickityAndInit();
