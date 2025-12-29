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
        prevNextButtons: true,
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

      // Optional: keep disabled state accurate when wrapAround is false
  function syncArrowDisabledState() {
    if (flkty.options.wrapAround) return; // never disabled in loop mode

    prevBtn.disabled = flkty.selectedIndex === 0;
    nextBtn.disabled = flkty.selectedIndex === flkty.slides.length - 1;
  }

  flkty.on('ready', syncArrowDisabledState);
  flkty.on('change', syncArrowDisabledState);
    });
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
