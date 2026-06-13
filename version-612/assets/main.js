const MovieSite = (function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    const toggle = document.querySelector("[data-mobile-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const input = form.querySelector("input[name='q']");
        const value = input ? input.value.trim() : "";
        const target = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    const root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }

    const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
    let index = 0;
    let timer = null;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        activate(dotIndex);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    activate(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    const panels = document.querySelectorAll("[data-filter-panel]");

    panels.forEach(function (panel) {
      const scope = document.querySelector(panel.getAttribute("data-filter-panel")) || document;
      const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
      const keyword = panel.querySelector("[data-filter-keyword]");
      const year = panel.querySelector("[data-filter-year]");
      const region = panel.querySelector("[data-filter-region]");
      const type = panel.querySelector("[data-filter-type]");
      const reset = panel.querySelector("[data-filter-reset]");
      const empty = scope.querySelector("[data-no-results]");

      function apply() {
        const keyValue = normalize(keyword && keyword.value);
        const yearValue = normalize(year && year.value);
        const regionValue = normalize(region && region.value);
        const typeValue = normalize(type && type.value);
        let visible = 0;

        cards.forEach(function (card) {
          const text = normalize(card.getAttribute("data-search-text"));
          const cardYear = normalize(card.getAttribute("data-year"));
          const cardRegion = normalize(card.getAttribute("data-region"));
          const cardType = normalize(card.getAttribute("data-type"));
          const matchKeyword = !keyValue || text.indexOf(keyValue) !== -1;
          const matchYear = !yearValue || cardYear === yearValue;
          const matchRegion = !regionValue || cardRegion === regionValue;
          const matchType = !typeValue || cardType === typeValue;
          const shouldShow = matchKeyword && matchYear && matchRegion && matchType;

          card.style.display = shouldShow ? "" : "none";
          if (shouldShow) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [keyword, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          [keyword, year, region, type].forEach(function (control) {
            if (control) {
              control.value = "";
            }
          });
          apply();
        });
      }

      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q && keyword) {
        keyword.value = q;
      }

      apply();
    });
  }

  function setupPlayer(source) {
    ready(function () {
      const frame = document.querySelector("[data-player-frame]");
      const video = document.querySelector("[data-player-video]");
      const overlay = document.querySelector("[data-player-overlay]");

      if (!frame || !video || !overlay || !source) {
        return;
      }

      let attached = false;

      function attach() {
        if (attached) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }

        attached = true;
      }

      function play() {
        attach();
        overlay.classList.add("is-hidden");
        video.controls = true;
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            video.controls = true;
          });
        }
      }

      overlay.addEventListener("click", play);
      frame.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          play();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });

  return {
    setupPlayer: setupPlayer
  };
})();
