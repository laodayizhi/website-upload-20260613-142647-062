(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenus() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                var target = form.getAttribute("action") || "./search.html";
                window.location.href = target + "?q=" + encodeURIComponent(input.value.trim());
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;

        function show(nextIndex) {
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

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5000);
    }

    function setupLocalFilters() {
        document.querySelectorAll("[data-filter-input]").forEach(function (input) {
            var root = input.closest("main") || document;
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-filter-card]"));
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-tags") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-year") || ""
                    ].join(" ").toLowerCase();
                    card.hidden = query && text.indexOf(query) === -1;
                });
            });
        });
    }

    function createResultCard(movie) {
        var article = document.createElement("article");
        article.className = "movie-card";
        var link = document.createElement("a");
        link.className = "movie-link";
        link.href = movie.url;
        link.setAttribute("aria-label", movie.title);

        var cover = document.createElement("div");
        cover.className = "movie-cover";
        var img = document.createElement("img");
        img.src = movie.cover;
        img.alt = movie.title;
        img.loading = "lazy";
        var shade = document.createElement("div");
        shade.className = "movie-cover-shade";
        var play = document.createElement("span");
        play.className = "play-round";
        play.textContent = "▶";
        var year = document.createElement("span");
        year.className = "year-badge";
        year.textContent = movie.year || "精选";
        shade.appendChild(play);
        cover.appendChild(img);
        cover.appendChild(shade);
        cover.appendChild(year);

        var body = document.createElement("div");
        body.className = "movie-body";
        var title = document.createElement("h3");
        title.textContent = movie.title;
        var desc = document.createElement("p");
        desc.textContent = movie.oneLine;
        var meta = document.createElement("div");
        meta.className = "movie-meta-row";
        var region = document.createElement("span");
        region.textContent = movie.region;
        var type = document.createElement("span");
        type.textContent = movie.type;
        meta.appendChild(region);
        meta.appendChild(type);
        body.appendChild(title);
        body.appendChild(desc);
        body.appendChild(meta);

        link.appendChild(cover);
        link.appendChild(body);
        article.appendChild(link);
        return article;
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var resultSection = document.querySelector("[data-search-section]");
        var defaultSection = document.querySelector("[data-search-default]");
        var input = document.querySelector("[data-search-input]");
        if (!results || typeof movieIndex === "undefined") {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (input) {
            input.value = query;
        }
        if (!query) {
            return;
        }
        var lower = query.toLowerCase();
        var matches = movieIndex.filter(function (movie) {
            return [movie.title, movie.region, movie.type, movie.year, movie.tags, movie.oneLine].join(" ").toLowerCase().indexOf(lower) !== -1;
        });
        results.innerHTML = "";
        matches.slice(0, 240).forEach(function (movie) {
            results.appendChild(createResultCard(movie));
        });
        if (!matches.length) {
            var empty = document.createElement("p");
            empty.className = "empty-search";
            empty.textContent = "没有找到相关影片";
            results.appendChild(empty);
        }
        if (resultSection) {
            resultSection.hidden = false;
        }
        if (defaultSection) {
            defaultSection.hidden = true;
        }
    }

    ready(function () {
        setupMenus();
        setupSearchForms();
        setupHero();
        setupLocalFilters();
        setupSearchPage();
    });
})();

function startMoviePlayer(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var button = document.querySelector("[data-player-button]");
    if (!video || !button || !streamUrl) {
        return;
    }
    var started = false;

    function play() {
        if (started) {
            video.play().catch(function () {});
            return;
        }
        started = true;
        button.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }
        video.src = streamUrl;
        video.play().catch(function () {});
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (!started) {
            play();
        }
    });
}
