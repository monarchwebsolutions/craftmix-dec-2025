document.addEventListener("DOMContentLoaded", function () {
  // Lazy load video thumbnails
  const lazyVideos = document.querySelectorAll('video[data-poster]');

  const videoObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        const poster = video.getAttribute('data-poster');
        if (poster) {
          video.setAttribute('poster', poster);
          video.removeAttribute('data-poster');
        }
        obs.unobserve(video);
      }
    });
  });
  lazyVideos.forEach(video => videoObserver.observe(video));
  
  // Lazy load regular images
  const lazyImages = document.querySelectorAll('img.lazy-img[data-src]');

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imageObserver.observe(img));

  // Lazy load all Swiper images when any Swiper section scrolls into view
  document.querySelectorAll('.swiper.preview').forEach((swiperSection) => {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const images = swiperSection.querySelectorAll('img.lazy-img[data-src]');
          images.forEach(img => {
            const src = img.getAttribute('data-src');
            if (src) {
              img.setAttribute('src', src);
              img.removeAttribute('data-src');
            }
          });
          obs.unobserve(entry.target); // Only trigger once
        }
      });
    }, { threshold: 0.2 });
  
    observer.observe(swiperSection);
  });

});




function setupToolTip(buttonClass, toolTipClass, isOpen = true) {
  // Select elements
  const button = document.querySelector(buttonClass);
  const toolTip = document.querySelector(toolTipClass);

  if (!button || !toolTip) {
    console.error(`Elements not found for button: ${buttonClass}, tooltip: ${toolTipClass}`);
    return;
  }

  // Initialize the state based on isOpen
  if (isOpen) {
    button.classList.add("tool-tip-open");
    toolTip.classList.remove("hidden");
    button.innerText = "-";
  } else {
    button.classList.remove("tool-tip-open");
    toolTip.classList.add("hidden");
    button.innerText = "+";
  }

  // Toggle logic on button click
  button.addEventListener("click", () => {
    // Toggle class "tool-tip-open" on button
    button.classList.toggle("tool-tip-open");

    // Toggle class "hidden" on tooltip div
    toolTip.classList.toggle("hidden");

    // Toggle button text between "-" and "+"
    button.innerText = button.classList.contains("tool-tip-open") ? "-" : "+";
  });
}