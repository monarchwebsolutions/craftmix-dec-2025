document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".custom-review-carousel-card");

  // Pause all other videos when one plays
  function pauseAllOtherVideos(currentVideo) {
    const videos = document.querySelectorAll(".custom-video-review-carousel-video");

    videos.forEach((video) => {
      if (video !== currentVideo) {
        video.pause();
        const parentCard = video.closest(".custom-review-carousel-card");
        const playBtn = parentCard && parentCard.querySelector(".play-btn");
        if (playBtn) {
          playBtn.style.display = "block";
        }
      }
    });
  }

  // Pause videos when they leave the viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (!entry.isIntersecting) {
          video.pause();
          const parentCard = video.closest(".custom-review-carousel-card");
          const playBtn = parentCard && parentCard.querySelector(".play-btn");
          if (playBtn) {
            playBtn.style.display = "block";
          }
        }
      });
    },
    { threshold: 0.1 }
  );

  // Apply behavior to each video card
  cards.forEach((card) => {
    const video = card.querySelector(".custom-video-review-carousel-video");
    const playBtn = card.querySelector(".play-btn");
    const volumeBtn = card.querySelector(".volume-btn");

    if (!video || !playBtn || !volumeBtn) return;

    const volumeIcon = volumeBtn.querySelector(".volume-icon");
    const muteIcon = volumeBtn.querySelector(".mute-icon");

    // Make the video keyboard focusable if it isn't already
    if (!video.hasAttribute("tabindex")) {
      video.setAttribute("tabindex", "0");
    }

    // Optional but recommended: expose intent to assistive tech
    // (Video isn't natively a button even when focusable)
    if (!video.hasAttribute("role")) {
      video.setAttribute("role", "button");
    }
    if (!video.hasAttribute("aria-label")) {
      video.setAttribute("aria-label", "Play or pause video");
    }

    function setPlayButtonVisible(visible) {
      playBtn.style.display = visible ? "block" : "none";
    }

    // Toggle play/pause. If activatedFromKeyboardPlayBtn === true and we start playing,
    // we will move focus to the video after hiding the play button.
    function toggleVideoPlay({ activatedFromKeyboardPlayBtn = false } = {}) {
      const isPlaying = !video.paused;

      if (isPlaying) {
        video.pause();
        setPlayButtonVisible(true);
        return;
      }

      pauseAllOtherVideos(video);
      video.muted = false;

      video
        .play()
        .then(() => {
          setPlayButtonVisible(false);

          // If play button was activated via keyboard, hand focus to the video
          // so the user can press Enter/Space to pause without tabbing back.
          if (activatedFromKeyboardPlayBtn) {
            requestAnimationFrame(() => {
              try {
                video.focus({ preventScroll: true });
              } catch (e) {}
            });
          }
        })
        .catch((err) => {
          console.error("Video play failed:", err);
        });
    }

    // Click anywhere on video toggles play/pause
    video.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleVideoPlay();
    });

    // Keyboard on video toggles play/pause (Enter/Space)
    video.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); // prevent Space scrolling page
        e.stopPropagation();
        toggleVideoPlay();
      }
    });

    // Click play button toggles play/pause
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleVideoPlay();
    });

    // Keyboard activation on play button should move focus to video after it hides
    playBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        toggleVideoPlay({ activatedFromKeyboardPlayBtn: true });
      }
    });

    video.addEventListener("ended", () => {
      setPlayButtonVisible(true);
    });

    volumeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (video.muted) {
        video.muted = false;
        if (volumeIcon) volumeIcon.style.display = "block";
        if (muteIcon) muteIcon.style.display = "none";
      } else {
        video.muted = true;
        if (volumeIcon) volumeIcon.style.display = "none";
        if (muteIcon) muteIcon.style.display = "block";
      }
    });

    // Start observing the video for scroll visibility
    observer.observe(video);
  });
});
