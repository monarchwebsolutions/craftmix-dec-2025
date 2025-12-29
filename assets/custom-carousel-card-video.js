document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".custom-review-carousel-card");

  // Pause all other videos when one plays
  function pauseAllOtherVideos(currentVideo) {
    const videos = document.querySelectorAll(
      ".custom-video-review-carousel-video"
    );

    videos.forEach((video) => {
      if (video !== currentVideo) {
        video.pause();
        const parentCard = video.closest(".custom-review-carousel-card");
        const playBtn = parentCard.querySelector(".play-btn");
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
          const playBtn = parentCard.querySelector(".play-btn");
          if (playBtn) {
            playBtn.style.display = "block";
          }
        }
      });
    },
    { threshold: 0.1 }
  ); // Adjust threshold if needed

  // Apply behavior to each video card
  cards.forEach((card) => {
    const video = card.querySelector(".custom-video-review-carousel-video");
    const playBtn = card.querySelector(".play-btn");
    const volumeBtn = card.querySelector(".volume-btn");
    const volumeIcon = volumeBtn.querySelector(".volume-icon");
    const muteIcon = volumeBtn.querySelector(".mute-icon");

    function toggleVideoPlay() {
      const isPlaying = !video.paused;

      if (isPlaying) {
        video.pause();
        playBtn.style.display = "block";
      } else {
        pauseAllOtherVideos(video);
        video.muted = false;
        video
          .play()
          .then(() => {
            playBtn.style.display = "none";
          })
          .catch((err) => {
            console.error("Video play failed:", err);
          });
      }
    }

    video.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleVideoPlay();
    });

    video.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.stopPropagation();
      toggleVideoPlay();
      }
    });

    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleVideoPlay();
    });

    video.addEventListener("ended", () => {
      playBtn.style.display = "block";
    });

    volumeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (video.muted) {
        video.muted = false;
        volumeIcon.style.display = "block";
        muteIcon.style.display = "none";
      } else {
        video.muted = true;
        volumeIcon.style.display = "none";
        muteIcon.style.display = "block";
      }
    });

    // Start observing the video for scroll visibility
    observer.observe(video);
  });
});
