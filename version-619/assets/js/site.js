(function () {
    var body = document.body;
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var searchToggle = document.querySelector('[data-search-toggle]');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', function () {
            body.classList.toggle('menu-open');
            body.classList.remove('search-open');
        });
    }

    if (searchToggle) {
        searchToggle.addEventListener('click', function () {
            body.classList.toggle('search-open');
            body.classList.remove('menu-open');
            var input = document.querySelector('.header-search input');
            if (body.classList.contains('search-open') && input) {
                input.focus();
            }
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var heroIndex = 0;

    function setHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === heroIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === heroIndex);
        });
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            setHero(i);
        });
    });

    if (slides.length > 1) {
        setHero(0);
        setInterval(function () {
            setHero(heroIndex + 1);
        }, 5800);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }
        var query = normalize(filterInput ? filterInput.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.dataset.title,
                card.dataset.tags,
                card.dataset.year,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre
            ].join(' '));
            var ok = true;

            if (query && haystack.indexOf(query) === -1) {
                ok = false;
            }
            if (year && card.dataset.year !== year) {
                ok = false;
            }
            if (type && card.dataset.type.indexOf(type) === -1) {
                ok = false;
            }
            if (region && card.dataset.region.indexOf(region) === -1) {
                ok = false;
            }

            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.style.display = visible ? 'none' : 'block';
        }
    }

    [filterInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilter);
            control.addEventListener('change', applyFilter);
        }
    });

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            filterInput.value = q;
        }
    }
    applyFilter();

    var playerBox = document.querySelector('[data-player]');
    if (playerBox) {
        var video = playerBox.querySelector('video');
        var playButton = playerBox.querySelector('[data-play]');
        var sourceUrl = playerBox.getAttribute('data-hls');
        var hlsInstance = null;

        function loadPlayer() {
            if (!video || video.dataset.ready === '1') {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                video.dataset.ready = '1';
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                video.dataset.ready = '1';
            } else {
                video.src = sourceUrl;
                video.dataset.ready = '1';
            }
        }

        function startPlayer() {
            loadPlayer();
            playerBox.classList.add('is-playing');
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (playButton) {
            playButton.addEventListener('click', startPlayer);
        }
        if (video) {
            video.addEventListener('click', function () {
                loadPlayer();
            });
            video.addEventListener('play', function () {
                playerBox.classList.add('is-playing');
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    var backTop = document.createElement('button');
    backTop.className = 'back-top';
    backTop.type = 'button';
    backTop.textContent = '↑';
    document.body.appendChild(backTop);

    backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function () {
        backTop.classList.toggle('is-visible', window.scrollY > 600);
    });
})();
