function waitForFlickityAndInit() {
  if (typeof Flickity === 'undefined') {
    return setTimeout(waitForFlickityAndInit, 50);
  }

  // Track Tab direction to avoid Shift+Tab traps
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
      // Prevent double init (theme editor / script duplication / etc.)
      if (el.dataset.customCarouselInitialized === 'true') return;
      el.dataset.customCarouselInitialized = 'true';

      const flkty = new Flickity(el, {
        cellAlign: cellAlign,
        wrapAround: false,
        contain: contain,
        fullscreen: true,
        pageDots: true,
        prevNextButtons: true,
        freeScroll: freeScroll,
      });

      console.log(`Carousel ${index + 1} has ${flkty.slides.length} slides`);

      // ---- Find the correct arrow buttons for THIS carousel (no global fallback) ----
      function findArrowButtonsForCarousel(carouselEl) {
        let node = carouselEl;

        while (node && node !== document.documentElement) {
          if (node.querySelector) {
            const prev = node.querySelector('.custom-carousel-prev');
            const next = node.querySelector('.custom-carousel-next');

            // Only accept a scope that contains BOTH buttons
            if (prev && next) {
              return { prev, next, scope: node };
            }
          }
          node = node.parentElement;
        }

        return { prev: null, next: null, scope: null };
      }

      const { prev: prevBtn, next: nextBtn } = findArrowButtonsForCarousel(el);

      if (!prevBtn || !nextBtn) {
        console.warn(
          'custom-carousel.js: Could not find scoped prev/next buttons for this carousel. ' +
            'Ensure the carousel and its buttons share a common ancestor wrapper.',
          el
        );
      }

      // ---- Visible window math (robust) ----
      let visibleCount = 1;

      function getCellOuterWidth() {
        const firstCell = flkty.cells && flkty.cells[0];
        if (!firstCell || !firstCell.size) return 0;
        return firstCell.size.outerWidth || firstCell.size.width || 0;
      }

      function computeVisibleCount() {
        const viewport = flkty.viewport;
        const cellOuterW = getCellOuterWidth();

        if (!viewport || !cellOuterW) {
          visibleCount = 1;
          return visibleCount;
        }

        const viewportW = viewport.clientWidth || 0;
        visibleCount = Math.max(1, Math.round(viewportW / cellOuterW));
        return visibleCount;
      }

      function getMaxIndex() {
        const total = flkty.cells ? flkty.cells.length : 0;
        const vis = computeVisibleCount();
        return Math.max(0, total - vis);
      }

      // ---- Keep focus on arrows while using them ----
      let arrowLock = null; // 'prev' | 'next' | null
      let arrowLockTimer = null;

      function lockArrow(which) {
        arrowLock = which;
        if (arrowLockTimer) clearTimeout(arrowLockTimer);
        // brief lock window so carousel focus handlers don't steal focus mid-transition
        arrowLockTimer = setTimeout(() => (arrowLock = null), 600);
      }

      function safeFocus(elm) {
        if (!elm) return;
        // ensure focus persists after Flickity DOM updates
        requestAnimationFrame(() => {
          try {
            elm.focus({ preventScroll: true });
          } catch (e) {}
        });
      }

      // ---- Disabled state (deferred + stable) ----
      function setDisabled(btn, disabled) {
        if (!btn) return;
        btn.disabled = !!disabled;
        btn.classList.toggle('disabled', !!disabled);
        // If it becomes disabled while focused, keep focus there (do not let it "fall through")
        if (disabled && document.activeElement === btn) safeFocus(btn);
      }

      function syncArrowDisabledState() {
        if (!prevBtn || !nextBtn) return;

        if (flkty.options.wrapAround) {
          setDisabled(prevBtn, false);
          setDisabled(nextBtn, false);
          return;
        }

        const maxIndex = getMaxIndex();
        const idx = flkty.selectedIndex;

        setDisabled(prevBtn, idx <= 0);
        setDisabled(nextBtn, idx >= maxIndex);
      }

      // Flickity sometimes reports transient indices during animation.
      // Only finalize disabled states on 'settle' (authoritative).
      function syncOnSettle() {
        syncArrowDisabledState();

        // If the user is navigating via arrow buttons, preserve focus there.
        if (arrowLock === 'prev' && prevBtn) safeFocus(prevBtn);
        if (arrowLock === 'next' && nextBtn) safeFocus(nextBtn);
      }

      // ---- Arrow movement (clamped, no overshoot) ----
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
          e.preventDefault();
          if (prevBtn.disabled) {
            safeFocus(prevBtn);
            return;
          }
          lockArrow('prev');
          goPrev();
          safeFocus(prevBtn);
        });

        prevBtn.addEventListener('keydown', (e) => {
          // Support Space/Enter on buttons reliably (some themes interfere)
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            prevBtn.click();
          }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (nextBtn.disabled) {
            safeFocus(nextBtn);
            return;
          }
          lockArrow('next');
          goNext();
          safeFocus(nextBtn);
        });

        nextBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            nextBtn.click();
          }
        });
      }

      // ---- Focus behavior inside carousel ----
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

      el.addEventListener('focusin', (e) => {
        // While user is operating arrows, do not let carousel focus handlers run
        if (arrowLock) return;

        // Ignore focus from dots / flickity internal buttons
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

        const cellEl = insideCell;
        const cells = flkty.getCellElements();
        const focusedIndex = cells.indexOf(cellEl);
        if (focusedIndex < 0) return;

        const vis = computeVisibleCount();

        const leftMost = flkty.selectedIndex;
        const rightMost = flkty.selectedIndex + vis - 1;

        // If already within visible window, do nothing
        if (focusedIndex >= leftMost && focusedIndex <= rightMost) return;

        const maxIndex = getMaxIndex();

        if (focusedIndex < leftMost) {
          const target = Math.max(0, Math.min(maxIndex, focusedIndex));
          flkty.select(target, false, false);
          return;
        }

        const targetIndex = Math.max(0, focusedIndex - (vis - 1));
        const target = Math.max(0, Math.min(maxIndex, targetIndex));
        flkty.select(target, false, false);
      });

      // ---- Event wiring (use settle for stable end detection) ----
      flkty.on('ready', () => {
        computeVisibleCount();
        syncArrowDisabledState();
      });

      // Avoid disabling mid-animation; keep arrows enabled until settle recalculates.
      flkty.on('select', () => {
        // Keep focus on arrow if user is arrowing
        if (arrowLock === 'prev' && prevBtn) safeFocus(prevBtn);
        if (arrowLock === 'next' && nextBtn) safeFocus(nextBtn);
      });

      flkty.on('settle', syncOnSettle);

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
