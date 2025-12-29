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
        prevNextButtons: false,
        freeScroll: freeScroll,
      });

      console.log(`Carousel ${index + 1} has ${flkty.slides.length} slides`);

      // Scope external arrows to this carousel’s container if possible
      const container =
        el.closest('.custom-video-review-carousel-container') || document;

      const prevBtn =
        container.querySelector('.custom-carousel-prev') ||
        document.querySelector('.custom-carousel-prev');

      const nextBtn =
        container.querySelector('.custom-carousel-next') ||
        document.querySelector('.custom-carousel-next');

      // Compute how many slides are visible at once (used for disabled state + keyboard windowing)
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
          const cellOuterW = firstCell.size.outerWidth || firstCell.size.width || 1;

          visibleCount = Math.max(1, Math.floor(viewportW / cellOuterW));
        } catch (e) {
          visibleCount = 1;
        }
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

        computeVisibleCount();

        const total = flkty.slides.length;
        const maxIndex = Math.max(0, total - visibleCount);

        const isFirst = flkty.selectedIndex <= 0;
        const isLast = flkty.selectedIndex >= maxIndex;

        prevBtn.disabled = isFirst;
        nextBtn.disabled = isLast;

        prevBtn.classList.toggle('disabled', isFirst);
        nextBtn.classList.toggle('disabled', isLast);
      }

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

      // External arrow wiring (NO "true" arg; that was causing overshoot/blank space issues)
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (prevBtn.disabled) return;
          flkty.previous();

          // After moving via arrow, keep focus behavior consistent if user is interacting with arrows via keyboard
          flkty.once('settle', () => {
            syncArrowDisabledState();
          });
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (nextBtn.disabled) return;
          flkty.next();

          flkty.once('settle', () => {
            syncArrowDisabledState();
          });
        });
      }

      // If the user tabs INTO the carousel (not already inside a cell), land on the selected/visible cell
      el.addEventListener('focusin', (e) => {
        const insideCell = e.target.closest('.carousel-cell');
        if (!insideCell) {
          // Focus entered the carousel container (or something outside cells)
          // Move focus to the selected cell’s first interactive element
          focusSelectedCell();
          return;
        }

        // KEY FIX:
        // When tabbing within, only shift the carousel when the focused cell is OUTSIDE the current visible window.
        // And when shifting, shift just enough so the focused cell becomes visible (not forced to far-left).
        const cellEl = insideCell;
        const cells = flkty.getCellElements();
        const focusedIndex = cells.indexOf(cellEl);
        if (focusedIndex < 0) return;

        computeVisibleCount();

        const leftMost = flkty.selectedIndex;
        const rightMost = flkty.selectedIndex + visibleCount - 1;

        // If already within the visible window, do nothing (prevents constant sliding)
        if (focusedIndex >= leftMost && focusedIndex <= rightMost) return;

        // If focus went LEFT of window, align to that cell
        if (focusedIndex < leftMost) {
          flkty.select(focusedIndex, false, false);
          flkty.once('settle', syncArrowDisabledState);
          return;
        }

        // If focus went RIGHT of window, shift so focused becomes the RIGHTMOST visible item
        const targetIndex = Math.max(0, focusedIndex - (visibleCount - 1));
        flkty.select(targetIndex, false, false);
        flkty.once('settle', syncArrowDisabledState);
      });

      // Keep arrows + visibleCount updated
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

      // Optional improvement:
      // If user clicks arrows then immediately tabs, ensure Flickity is settled and focus begins on visible slide
      if (prevBtn) {
        prevBtn.addEventListener('keydown', (e) => {
          if (e.key !== 'Tab') return;
          flkty.once('settle', focusSelectedCell);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('keydown', (e) => {
          if (e.key !== 'Tab') return;
          flkty.once('settle', focusSelectedCell);
        });
      }

      // Initial state in case ready fires before buttons exist
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
