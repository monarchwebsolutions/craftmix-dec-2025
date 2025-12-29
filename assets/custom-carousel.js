function waitForFlickityAndInit() {
  if (typeof Flickity === 'undefined') {
    return setTimeout(waitForFlickityAndInit, 50);
  }

  // Function to initialize carousels
  function initializeCarousels(cellAlign, contain, freeScroll) {
    let carousels = document.querySelectorAll(".custom-carousel");

    carousels.forEach((el, index) => {
      let flkty = new Flickity(el, {
        cellAlign: cellAlign,
        wrapAround: false,
        contain: contain,
        fullscreen: true,
        pageDots: true,
        prevNextButtons: false,
        freeScroll: freeScroll,
      });

      console.log(`Carousel ${index + 1} has ${flkty.slides.length} slides`);
      
      const carouselEl = document.querySelector('[data-carousel]');
      const prevBtn = document.querySelector('.custom-carousel-prev');
      const nextBtn = document.querySelector('.custom-carousel-next');

      // External arrow wiring
      prevBtn.addEventListener('click', () => flkty.previous(true));
      nextBtn.addEventListener('click', () => flkty.next(true));

      function getVisibleSlides() {
        let visibleWidth = flkty.viewport.clientWidth;
        let cellWidth = flkty.cells[0].size.width;
        return Math.floor(visibleWidth / cellWidth);
      }

      // flkty.on("select", updateButtonStates);
      // updateButtonStates();

      // function updateButtonStates() {
      //   const totalSlides = flkty.slides.length;
      //   const visibleSlides = getVisibleSlides();
      //   const maxIndex = totalSlides - visibleSlides;

      //   if (prevBtn) {
      //     prevBtn.classList.toggle("disabled", flkty.selectedIndex === 0);
      //   }

      //   if (nextBtn) {
      //     nextBtn.classList.toggle(
      //       "disabled",
      //       flkty.selectedIndex >= maxIndex
      //     );
      //   }
      // }

      function syncArrowDisabledState() {
        if (flkty.options.wrapAround) {
          // Ensure arrows are enabled in loop mode
          prevBtn.disabled = false;
          nextBtn.disabled = false;

          prevBtn.classList.remove('disabled');
          nextBtn.classList.remove('disabled');
          return;
        }

        const isFirst = flkty.selectedIndex === 0;
        const isLast = flkty.selectedIndex === flkty.slides.length - 1;

        prevBtn.disabled = isFirst;
        nextBtn.disabled = isLast;

        prevBtn.classList.toggle('disabled', isFirst);
        nextBtn.classList.toggle('disabled', isLast);
      }

      flkty.on('ready', syncArrowDisabledState);
      flkty.on('change', syncArrowDisabledState);
      flkty.on('settle', syncArrowDisabledState);
    });
    // Make focus "pull" the carousel to the focused cell
    carouselEl.addEventListener('focusin', (e) => {
      const cellEl = e.target.closest('.carousel-cell');
      if (!cellEl) return;

      const cells = flkty.getCellElements();
      const index = cells.indexOf(cellEl);
      if (index < 0) return;

      // If the focused cell isn't the selected one, select it
      if (index !== flkty.selectedIndex) {
        flkty.select(index, false, true); // (index, isWrapped, isInstant)
      }
  }

  function initializeOnLoad() {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1020) {
      initializeCarousels("left", true, false);
    } else {
      initializeCarousels("center", false, true);
    }
  }

  // Wait for DOM and Flickity
  document.addEventListener("DOMContentLoaded", initializeOnLoad);
}

waitForFlickityAndInit();
