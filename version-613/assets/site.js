document.addEventListener("DOMContentLoaded", function () {
  var mobileToggle = document.querySelector(".mobile-toggle");
  var navLinks = document.querySelector(".nav-links");

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    showSlide(0);
    start();
  });

  document.querySelectorAll(".filter-panel").forEach(function (panel) {
    var input = panel.querySelector(".filter-input");
    var scopeSelector = panel.getAttribute("data-scope") || "body";
    var scope = document.querySelector(scopeSelector) || document.body;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var empty = scope.querySelector(".empty-state");

    function applyFilter() {
      var term = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        var matched = !term || text.indexOf(term) !== -1;
        card.classList.toggle("hidden-card", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
      applyFilter();
    }
  });

  var searchInput = document.querySelector("[data-search-input]");
  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    searchInput.value = query;
    searchInput.dispatchEvent(new Event("input"));
  }

  document.querySelectorAll(".player-card").forEach(function (player) {
    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");
    var buttons = Array.prototype.slice.call(player.querySelectorAll(".play-button, .player-cover"));
    var hlsInstance = null;
    var prepared = false;

    function prepare() {
      if (!video || prepared) {
        return;
      }

      prepared = true;
      var streamUrl = video.getAttribute("data-stream") || "";

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      prepare();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (video) {
        video.play().catch(function () {});
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });
    });

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
