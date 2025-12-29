function waitForFlickityAndInit() {
  if (typeof Flickity === 'undefined') {
    return setTimeout(waitForFlickityAndInit, 50);
  }

  function initializeCarousels(cellAlign, contain, freeScroll) {
    const carousels = document.querySelectorAll('.custom-carousel');

    carousels.forEach((carouselEl, index) => {
      // Prevent double-init if this runs more than once
      if (carouselEl.__flktyInitialized) return;
      carouselEl.__flktyInitialized = true;

      const flkty = new Flickity(carouselEl, {
        cellAlign,
        wrapAround: false,
        contain,
        fullscreen: true,
        pageDots: true,
        prevNextButtons: false,
        freeScroll,
      });

      console.log(`Carousel ${index + 1} has ${flkty.slides.length} slides`);

      // Scope buttons to this carousel container (IMPORTANT)
      const container =
        carouselEl.closest('.custom-video-review-carousel-container') || document;

      const prevBtn = container.querySelector('.custom-carousel-prev');
      const nextBtn = container.querySelector('.custom-carousel-next');

      // If your arrows are truly global (only one carousel), this still works.
      if (!prevBtn || !nextBtn) return;

      // Make sure we don't attach handlers multiple times on the same buttons
      // (in case markup has one set of arrows reused across multiple carousels)
      if (prevBtn.__flktyBound || nextBtn.__flktyBound) {
        // If you really have multiple carousels sharing one arrow set,
        // you should not do that. But this prevents multi-fire anyway.
      } else {
        prevBtn.__flktyBound = true;
        nextBtn.__flktyBound = true;

        prevBtn.addEventListener('click', (e) => {
          if (prevBtn.disabled || prevBtn.classList.contains('disabled')) return;
          flkty.previous(false, true);
        });

        nextBtn.addEventListener('click', (e) => {
          if (nextBtn.disabled || nextBtn.classList.contains('disabled')) return;
          flkty.next(false, true);
        });
      }

      function getVisibleCellsCount() {
        // Works best on desktop (contain: true, cellAlign: left)
        if (!flkty.cells || !flkty.cells.length) return 1;

        const viewport = flkty.viewport;
        const cellW = flkty.cells[0].size && flkty.cells[0].size.outerWidth
          ? flkty.cells[0].size.outerWidth
          : flkty.cells[0].size.width;

        if (!viewport || !cellW) return 1;

        const visible = Math.floor(viewport.clientWidth / cellW);
        return Math.max(1, visible);
      }

      function syncArrowDisabledState() {
        if (flkty.options.wrapAround) {
          prevBtn.disabled = false;
          nextBtn.disabled = false;
          prevBtn.classList.remove('disabled');
          nextBtn.classList.remove('disabled');
          return;
        }

        const total = flkty.slides.length;

        // If contain=true and left aligned, the "last usable index" depends on how many cells fit.
        // This prevents the "blank space at the end" behavior by disabling Next earlier.
        let lastSelectableIndex = total - 1;

        if (flkty.options.contain && flkty.options.cellAlign === 'left') {
          const visible = getVisibleCellsCount();
          lastSelectableIndex = Math.max(0, total - visible);
        }

        const isFirst = flkty.selectedIndex <= 0;
        const isLast = flkty.selectedIndex >= lastSelectableIndex;

        prevBtn.disabled = isFirst;
        nextBtn.disabled = isLast;

        prevBtn.classList.toggle('disabled', isFirst);
        nextBtn.classList.toggle('disabled', isLast);
      }

      // Update states on all relevant lifecycle events
      flkty.on('ready', syncArrowDisabledState);
      flkty.on('select', syncArrowDisabledState);
      flkty.on('change', syncArrowDisabledState);
      flkty.on('settle', syncArrowDisabledState);

      // If user tabs into any element inside a cell, select that cell
      carouselEl.addEventListener('focusin', (e) => {
        const cellEl = e.target.closest('.carousel-cell');
        if (!cellEl) return;

        const cells = flkty.getCellElements();
        const cellIndex = cells.indexOf(cellEl);
        if (cellIndex < 0) return;

        if (cellIndex !== flkty.selectedIndex) {
          flkty.select(cellIndex, false, true);
          // Ensure arrow state updates even if Flickity doesn't emit change in some edge case
          syncArrowDisabledState();
        }
      });

      // Also resync on resize because visible cells count changes
      window.addEventListener('resize', () => {
        syncArrowDisabledState();
      });

      // Initial sync
      syncArrowDisabledState();
    });
  }

  function initializeOnLoad() {
    const screenWidth = window.innerWidth;

    // Desktop
    if (screenWidth >= 1024) {
      initializeCarousels('left', true, false);
    } else {
      // Mobile
      initializeCarousels('center', false, true);
    }
  }

  document.addEventListener('DOMContentLoaded', initializeOnLoad);
}

waitForFlickityAndInit();
