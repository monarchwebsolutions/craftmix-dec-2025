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
        prevNextButtons: false, // we use external arrows
        freeScroll: freeScroll,
      });

      console.log(`Carousel ${index + 1} has ${flkty.slides.length} slides`);

      // Scope external arrows to this carousel’s container if possible
      const container = el.closest('.custom-video-review-carousel-container') || document;
      const prevBtn =
        container.querySelector('.custom-carousel-prev') || document.querySelector('.custom-carousel-prev');
      const nextBtn =
        container.querySelector('.custom-carousel-next') || document.querySelector('.custom-carousel-next');

      // -----------------------------
      // Helpers: compute true maxIndex
      // -----------------------------
      function getMaxIndex() {
        // Maximum cell index that can be selected WITHOUT leaving blank space on the right.
        // Uses Flickity’s actual geometry (cell x positions + slideable width).
        try {
          const cells = flkty.cells || [];
          if (!cells.length || !flkty.size) return 0;

          const lastLeft = Math.max(0, flkty.slideableWidth - flkty.size.innerWidth);

          // Find last cell whose x <= lastLeft (small tolerance)
          let max = 0;
          const EPS = 2;
          for (let i = 0; i < cells.length; i++) {
            if (cells[i].x <= lastLeft + EPS) max = i;
          }
          return max;
        } catch (e) {
          return 0;
        }
      }

      // -----------------------------
      // Arrow disabled state
      // -----------------------------
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

      // -----------------------------
      // External arrow actions (clamped)
      // -----------------------------
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
          if (prevBtn.disabled) return;
          goPrev();
          // keep focus on the button
          prevBtn.focus({ preventScroll: true });
        });

        // Ensure Enter/Space keeps focus
        prevBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (prevBtn.disabled) return;
            goPrev();
            prevBtn.focus({ preventScroll: true });
          }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          if (nextBtn.disabled) return;
          goNext();
          nextBtn.focus({ preventScroll: true });
        });

        nextBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (nextBtn.disabled) return;
            goNext();
            nextBtn.focus({ preventScroll: true });
          }
        });
      }

      // -----------------------------
      // Focus behavior: only shift when needed,
      // and clamp to true maxIndex to prevent end blank space.
      // -----------------------------
      el.addEventListener('focusin', (e) => {
        const cellEl = e.target.closest('.carousel-cell');
        if (!cellEl) return;

        const cells = flkty.getCellElements();
        const focusedIndex = cells.indexOf(cellEl);
        if (focusedIndex < 0) return;

        // Determine current visible window using geometry.
        // Leftmost is flkty.selectedIndex. Visible end is approximated by viewport width.
        // We’ll compute a targetIndex that ensures focused cell is not offscreen to the right.
        const maxIndex = getMaxIndex();

        // If focused is current or earlier than selected, snap left to it.
        if (focusedIndex < flkty.selectedIndex) {
          const target = Math.max(0, Math.min(maxIndex, focusedIndex));
          if (target !== flkty.selectedIndex) flkty.select(target, false, false);
          return;
        }

        // If focused is to the right, shift just enough so it becomes visible.
        // Use cell positions: if focused cell's x is beyond current left + viewport width, shift.
        try {
          const viewportW = flkty.size?.innerWidth || flkty.viewport?.clientWidth || 0;
          const leftX = flkty.x * -1; // current left scroll position (positive)
          const focusedCell = flkty.cells[focusedIndex];
          const focusedLeft = focusedCell?.x ?? 0;
          const focusedRight = focusedLeft + (focusedCell?.size?.outerWidth || focusedCell?.size?.width || 0);

          const viewLeft = leftX;
          const viewRight = leftX + viewportW;

          // If fully in view, do nothing.
          if (focusedLeft >= viewLeft - 2 && focusedRight <= viewRight + 2) return;

          // If off to the right, shift so the focused cell becomes the rightmost fully visible.
          // Find the leftmost index such that focusedRight <= (cells[left].x + viewportW)
          let targetIndex = flkty.selectedIndex;

          for (let left = focusedIndex; left >= 0; left--) {
            const leftCell = flkty.cells[left];
            const leftCellX = leftCell?.x ?? 0;
            if (focusedRight <= leftCellX + viewportW + 2) {
              targetIndex = left;
            } else {
              break;
            }
          }

          const clamped = Math.max(0, Math.min(maxIndex, targetIndex));
          if (clamped !== flkty.selectedIndex) flkty.select(clamped, false, false);
        } catch (err) {
          // fallback: at least clamp to focused index (or max)
          const target = Math.max(0, Math.min(maxIndex, focusedIndex));
          if (target !== flkty.selectedIndex) flkty.select(target, false, false);
        }
      });

      // -----------------------------
      // Keep state synced (including when tabbing causes selects)
      // -----------------------------
      function syncOnSettle() {
        syncArrowDisabledState();
      }

      flkty.on('ready', () => {
        syncArrowDisabledState();
      });

      flkty.on('select', () => {
        syncArrowDisabledState();
      });

      flkty.on('settle', () => {
        // Hard clamp: prevents the rare “blank space at end” drift case.
        const maxIndex = getMaxIndex();
        if (flkty.selectedIndex > maxIndex) {
          flkty.select(maxIndex, false, true);
          return;
        }
        syncOnSettle();
      });

      window.addEventListener('resize', () => {
        // After resize, clamp and resync
        const maxIndex = getMaxIndex();
        if (flkty.selectedIndex > maxIndex) {
          flkty.select(maxIndex, false, true);
        }
        syncArrowDisabledState();
      });

      // Initial safety
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
