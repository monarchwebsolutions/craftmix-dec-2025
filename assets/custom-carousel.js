function waitForFlickityAndInit() {
  if (typeof Flickity === 'undefined') {
    return setTimeout(waitForFlickityAndInit, 50);
  }

  // Track last Tab direction so we do NOT trap Shift+Tab
  let lastTabDirection = 'forward';
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Tab') lastTabDirection = e.shiftKey ? 'backward' : 'forward';
    },
    true
  );

  function initializeCarousels(cellAlign, contain, freeScroll) {
    const carousels = document.querySelectorAll('.custom-carousel');

    carousels.forEach((el, index) => {
      const flkty = new Flickity(el, {
        cellAlign: cellAlign,
        wrapAround: false,
        contain: contain,
        fullscreen: true,
        pageDots: true,
        prevNextButtons: false,
        freeScroll: freeScroll,
      });

      console.log(`Carousel ${index + 1} has ${flkty.slides.length} slides`);

      const container =
        el.closest('.custom-video-review-carousel-container') || document;

      const prevBtn =
        container.querySelector('.custom-carousel-prev') ||
        document.querySelector('.custom-carousel-prev');

      const nextBtn =
        container.querySelector('.custom-carousel-next') ||
        document.querySelector('.custom-carousel-next');

      // ----- Visible count + max index (for real "end" disabling) -----
      let visibleCount = 1;

      function computeVisibleCount() {
        try {
          const viewport = flkty.viewport;
          const firstCell = flkty.cells && flkty.cells[0];
          if (!viewport || !firstCell || !firstCell.size) {
            visibleCount = 1;
            return;
          }

          const viewportW = viewport.clientWidth || 0;
          const cellOuterW =
            firstCell.size.outerWidth || firstCell.size.width || 1;

          visibleCount = Math.max(1, Math.floor(viewportW / cellOuterW));
        } catch (e) {
          visibleCount = 1;
        }
      }

      function getMaxIndex() {
        computeVisibleCount();
        const total = flkty.slides.length; // one slide per cell in your setup
        return Math.max(0, total - visibleCount);
      }

      function syncArrowDisabledState() {
        if (!prevBtn || !nextBtn) return;

        if (flkty.options.wrapAround) {
          prevBtn.disabled = false;
          nextBtn.disabled = false;
          prevBtn.classList.remove('disabled');
          nextBtn.classList.remove('disabled');
          return;
        }

        const maxIndex = getMaxIndex();

        const isFirst = flkty.selectedIndex <= 0;
        const isLast = flkty.selectedIndex >= maxIndex;

        prevBtn.disabled = isFirst;
        nextBtn.disabled = isLast;

        prevBtn.classList.toggle('disabled', isFirst);
        nextBtn.classList.toggle('disabled', isLast);
      }

      // ----- Arrow click behavior (clamped) -----
      function goPrev() {
        const target = Math.max(0, flkty.selectedIndex - 1);
        if (target === flkty.selectedIndex) return;
        flkty.select(target, false, false);
      }

      function goNext() {
        const maxIndex = getMaxIndex();
        const target = Math.min(maxIndex, flkty.selectedIndex + 1);
        if (target === flkty.selectedIndex) return;
        flkty.select(target, false, false);
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          // Keep focus on the button; do not redirect focus into the carousel.
          e.preventDefault();
          if (prevBtn.disabled) return;
          goPrev();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (nextBtn.disabled) return;
          goNext();
        });
      }

      // ----- Focus behavior -----
      function focusFirstFocusableInCell(cellEl) {
        if (!cellEl) return;

        const focusable = cellEl.querySelector(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusable) focusable.focus({ preventScroll: true });
      }

      function focusSelectedCell() {
        const cells = flkty.getCellElements();
        const cellEl = cells && cells[flkty.selectedIndex];
        focusFirstFocusableInCell(cellEl);
      }

      // IMPORTANT:
      // - Do NOT “auto focus into carousel” on Shift+Tab (prevents backwards trap).
      // - Do NOT react to focus events originating from the external arrow buttons or Flickity dots/buttons.
      el.addEventListener('focusin', (e) => {
        // If your custom arrows are inside the carousel DOM, ignore them.
        if (
          e.target.closest('.custom-carousel-prev, .custom-carousel-next') ||
          e.target.closest('.flickity-button') ||
          e.target.closest('.flickity-page-dots') ||
          e.target.closest('.dot')
        ) {
          return;
        }

        const insideCell = e.target.closest('.carousel-cell');

        // If focus landed on the carousel root itself (tabindex=0),
        // only “enter” the selected cell when tabbing FORWARD.
        if (!insideCell) {
          if (e.target === el && lastTabDirection === 'forward') {
            focusSelectedCell();
          }
          return;
        }

        // When tabbing inside cells:
        // Only shift when focused cell is outside the current visible window,
        // and clamp target index so we never overshoot to blank space.
        const cellEl = insideCell;
        const cells = flkty.getCellElements();
        const focusedIndex = cells.indexOf(cellEl);
        if (focusedIndex < 0) return;

        computeVisibleCount();

        const leftMost = flkty.selectedIndex;
        const rightMost = flkty.selectedIndex + visibleCount - 1;

        // Already visible -> do nothing
        if (focusedIndex >= leftMost && focusedIndex <= rightMost) return;

        const maxIndex = getMaxIndex();

        // Focus went left -> align left
        if (focusedIndex < leftMost) {
          const target = Math.max(0, Math.min(maxIndex, focusedIndex));
          flkty.select(target, false, false);
          return;
        }

        // Focus went right -> shift so focused becomes right-most visible item
        const targetIndex = Math.max(0, focusedIndex - (visibleCount - 1));
        const target = Math.max(0, Math.min(maxIndex, targetIndex));
        flkty.select(target, false, false);
      });

      // Keep disabled state correct no matter how the carousel moves
      flkty.on('ready', () => {
        computeVisibleCount();
        syncArrowDisabledState();
      });
      flkty.on('select', syncArrowDisabledState);
      flkty.on('settle', syncArrowDisabledState);

      window.addEventListener('resize', () => {
        computeVisibleCount();
        syncArrowDisabledState();
      });

      // Initial pass
      computeVisibleCount();
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
