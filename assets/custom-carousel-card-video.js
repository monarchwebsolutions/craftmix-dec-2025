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
          showPlayButton(playBtn);
        }
      }
    });
  }

  // Cache the "default display" for each play button so we restore correctly (flex/inline-flex/etc.)
  function getDefaultDisplay(playBtn) {
    if (!playBtn) return "block";
    if (playBtn.dataset.defaultDisplay) return playBtn.dataset.defaultDisplay;

    // Prefer computed style so we restore what the theme intended
    const computed = window.getComputedStyle(playBtn);
    let d = computed && computed.display ? computed.display : "";

    // If CSS starts it hidden (display:none), we still need something to show it.
    if (!d || d === "none") d = "block";

    playBtn.dataset.defaultDisplay = d;
    return d;
  }

  function showPlayButton(playBtn) {
    if (!playBtn) return;
    playBtn.style.display = getDefaultDisplay(playBtn);
  }

  function hidePlayButton(playBtn) {
    if (!playBtn) return;
    // Ensure we capture default before hiding
    getDefaultDisplay(playBtn);
    playBtn.style.display = "none";
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
            showPlayButton(playBtn);
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

    // Volume controls are optional
    const volumeBtn = card.querySelector(".volume-btn");
    const volumeIcon = volumeBtn ? volumeBtn.querySelector(".volume-icon") : null;
    const muteIcon = volumeBtn ? volumeBtn.querySelector(".mute-icon") : null;

    if (!video || !playBtn) return;

    // Cache default display immediately (prevents "block" mistakes later)
    getDefaultDisplay(playBtn);

    // Make the video keyboard focusable if it isn't already
    if (!video.hasAttribute("tabindex")) {
      video.setAttribute("tabindex", "0");
    }

    // Optional: convey intent to assistive tech
    if (!video.hasAttribute("role")) {
      video.setAttribute("role", "button");
    }
    if (!video.hasAttribute("aria-label")) {
      video.setAttribute("aria-label", "Play or pause video");
    }

    // If your CSS starts play hidden for some reason, ensure it’s visible on load
    // (If your CSS already shows it, this is harmless.)
    showPlayButton(playBtn);

    function toggleVideoPlay({ activatedFromKeyboardPlayBtn = false } = {}) {
      const isPlaying = !video.paused;

      if (isPlaying) {
        video.pause();
        showPlayButton(playBtn);
        return;
      }

      pauseAllOtherVideos(video);
      video.muted = false;

      video
        .play()
        .then(() => {
          hidePlayButton(playBtn);

          // Keyboard user activated play button: move focus to video so they can pause without retabbing
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

    // Click on video toggles play/pause
    video.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleVideoPlay();
    });

    // Keyboard on video toggles play/pause
    video.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); // prevent Space scroll
        e.stopPropagation();
        toggleVideoPlay();
      }
    });

    // Click play button toggles play/pause
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleVideoPlay();
    });

    // Keyboard activation on play button: toggle + move focus to video after play button hides
    playBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        toggleVideoPlay({ activatedFromKeyboardPlayBtn: true });
      }
    });

    video.addEventListener("ended", () => {
      showPlayButton(playBtn);
    });

    if (volumeBtn) {
      volumeBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        if (video.muted) {
          video.muted = false;
          if (volumeIcon) volumeIcon.style.display = getDefaultDisplay(volumeIcon) || "block";
          if (muteIcon) muteIcon.style.display = "none";
        } else {
          video.muted = true;
          if (volumeIcon) volumeIcon.style.display = "none";
          if (muteIcon) muteIcon.style.display = getDefaultDisplay(muteIcon) || "block";
        }
      });
    }

    observer.observe(video);
  });
});
