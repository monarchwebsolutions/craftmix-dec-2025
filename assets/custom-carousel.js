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

      
  const carouselEl = root.querySelector('[data-carousel]');
  const prevBtn = root.querySelector('.custom-carousel-prev');
  const nextBtn = root.querySelector('.custom-carousel-next');

      // External arrow wiring
      prevBtn.addEventListener('click', () => flkty.previous(true));
      nextBtn.addEventListener('click', () => flkty.next(true));

      function getVisibleSlides() {
        let visibleWidth = flkty.viewport.clientWidth;
        let cellWidth = flkty.cells[0].size.width;
        return Math.floor(visibleWidth / cellWidth);
      }

      flkty.on("select", updateButtonStates);
      updateButtonStates();

      function updateButtonStates() {
        const totalSlides = flkty.slides.length;
        const visibleSlides = getVisibleSlides();
        const maxIndex = totalSlides - visibleSlides;

        if (prevButton) {
          prevButton.classList.toggle("disabled", flkty.selectedIndex === 0);
        }

        if (nextButton) {
          nextButton.classList.toggle(
            "disabled",
            flkty.selectedIndex >= maxIndex
          );
        }
      }
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
