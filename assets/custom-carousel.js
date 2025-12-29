function waitForFlickityAndInit() {
  if (typeof Flickity === "undefined") {
    return setTimeout(waitForFlickityAndInit, 50);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const carousels = document.querySelectorAll(".custom-carousel");
    if (!carousels.length) return;

    // Global arrows (your current setup)
    const prevBtn = document.querySelector(".custom-carousel-prev");
    const nextBtn = document.querySelector(".custom-carousel-next");

    // Track the Flickity instance we want the arrows to control
    // If you have only one carousel, this is perfect.
    // If you have multiple, we’ll keep "active" as the last interacted one.
    let activeFlkty = null;

    function initOneCarousel(el) {
      if (el.__flktyInitialized) return el.__flktyInstance;
      el.__flktyInitialized = true;

      const isDesktop = window.innerWidth >= 1024;

      const flkty = new Flickity(el, {
        cellAlign: isDesktop ? "left" : "center",
        wrapAround: false,
        contain: isDesktop ? true : false,
        fullscreen: true,
        pageDots: true,
        prevNextButtons: false,
        freeScroll: isDesktop ? false : true,
      });

      el.__flktyInstance = flkty;

      // Make this carousel the active target when user interacts with it
      const makeActive = () => {
        activeFlkty = flkty;
        syncArrowDisabledState();
      };

      el.addEventListener("pointerdown", makeActive);
      el.addEventListener("focusin", makeActive);

      function getVisibleCellsCount() {
        // Only relevant for desktop contain + left aligned
        if (!flkty.cells || !flkty.cells.length) return 1;

        const viewport = flkty.viewport;
        const first = flkty.cells[0];
        const cellW =
          (first.size && (first.size.outerWidth || first.size.width)) || 0;

        if (!viewport || !cellW) return 1;

        return Math.max(1, Math.floor(viewport.clientWidth / cellW));
      }

      function syncArrowDisabledState() {
        // If arrows don't exist, nothing to sync
        if (!prevBtn || !nextBtn) return;

        const instance = activeFlkty || flkty;
        if (!instance) return;

        const total = instance.slides.length;

        // Default "last index" for single-item view
        let lastSelectableIndex = total - 1;

        // Desktop: if contain + left align, disable Next earlier to prevent blank space
        if (instance.options.contain && instance.options.cellAlign === "left") {
          const visible = getVisibleCellsCount();
          lastSelectableIndex = Math.max(0, total - visible);
        }

        const isFirst = instance.selectedIndex <= 0;
        const isLast = instance.selectedIndex >= lastSelectableIndex;

        prevBtn.disabled = isFirst;
        nextBtn.disabled = isLast;

        prevBtn.classList.toggle("disabled", isFirst);
        nextBtn.classList.toggle("disabled", isLast);
      }

      // Update disabled state when Flickity changes for ANY reason
      flkty.on("ready", syncArrowDisabledState);
      flkty.on("select", syncArrowDisabledState);
      flkty.on("change", syncArrowDisabledState);
      flkty.on("settle", syncArrowDisabledState);

      // Critical: when tabbing into a cell, select that cell so index updates
      el.addEventListener("focusin", (e) => {
        const cellEl = e.target.closest(".carousel-cell");
        if (!cellEl) return;

        // Make this the active carousel
        activeFlkty = flkty;

        // If the cell is already mostly visible, do NOT move the carousel.
        const viewport = flkty.viewport;
        if (!viewport) return;

        const vRect = viewport.getBoundingClientRect();
        const cRect = cellEl.getBoundingClientRect();

        // How much of the cell is visible horizontally?
        const visibleLeft = Math.max(cRect.left, vRect.left);
        const visibleRight = Math.min(cRect.right, vRect.right);
        const visibleWidth = Math.max(0, visibleRight - visibleLeft);
        const totalWidth = Math.max(1, cRect.width);
        const ratioVisible = visibleWidth / totalWidth;

        // If at least 85% visible, leave it alone (prevents "snap left every tab")
        if (ratioVisible >= 0.85) {
          syncArrowDisabledState();
          return;
        }

        // Otherwise, select it to bring it into view
        const cells = flkty.getCellElements();
        const idx = cells.indexOf(cellEl);
        if (idx < 0) return;

        flkty.select(idx, false, false); // animate into view (not instant)

        syncArrowDisabledState();
      });


      window.addEventListener("resize", () => {
        // Re-sync because visible count changes on desktop
        syncArrowDisabledState();
      });

      // Start with this as the active carousel if none set
      if (!activeFlkty) activeFlkty = flkty;

      return flkty;
    }

    // Init all carousels
    carousels.forEach(initOneCarousel);

    // Wire arrows ONCE (prevents multi-fire / overshoot)
    if (prevBtn && !prevBtn.__boundToFlickity) {
      prevBtn.__boundToFlickity = true;
      prevBtn.addEventListener("click", () => {
        if (!activeFlkty) return;
        if (prevBtn.disabled || prevBtn.classList.contains("disabled")) return;
        activeFlkty.previous(false, true);
      });
    }

    if (nextBtn && !nextBtn.__boundToFlickity) {
      nextBtn.__boundToFlickity = true;
      nextBtn.addEventListener("click", () => {
        if (!activeFlkty) return;
        if (nextBtn.disabled || nextBtn.classList.contains("disabled")) return;
        activeFlkty.next(false, true);
      });
    }
  });
}

waitForFlickityAndInit();
