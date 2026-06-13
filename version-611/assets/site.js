(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.getElementById("heroSlider");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        function show(next) {
            index = next % slides.length;
            if (index < 0) {
                index = slides.length - 1;
            }
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 6200);
    }

    function setupFilters() {
        var grid = document.querySelector("[data-card-grid]");
        var input = document.querySelector("[data-filter-input]");
        var year = document.querySelector("[data-year-filter]");
        var empty = document.querySelector("[data-empty-state]");
        if (!grid || !input) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (initial) {
            input.value = initial;
        }
        function apply() {
            var keyword = normalize(input.value);
            var selectedYear = year ? normalize(year.value) : "";
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-channel")
                ].join(" "));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matchText = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !selectedYear || cardYear === selectedYear;
                var visible = matchText && matchYear;
                card.style.display = visible ? "" : "none";
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }
        input.addEventListener("input", apply);
        if (year) {
            year.addEventListener("change", apply);
        }
        apply();
    }

    function initPlayer(options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var url = options.streamUrl;
        var attached = false;
        if (!video || !overlay || !url) {
            return;
        }
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }
        function start() {
            attach();
            overlay.classList.add("is-hidden");
            var playAction = video.play();
            if (playAction && typeof playAction.catch === "function") {
                playAction.catch(function () {});
            }
        }
        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!attached) {
                start();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });

    window.MovieSite = {
        initPlayer: initPlayer
    };
})();
