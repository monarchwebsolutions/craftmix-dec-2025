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

      let nextButton = el.querySelector(".flickity-button.next");
      let prevButton = el.querySelector(".flickity-button.previous");

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
