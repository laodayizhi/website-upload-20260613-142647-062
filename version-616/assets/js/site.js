(function () {
    function toggleMobileNav() {
        var button = document.querySelector('.mobile-menu-button');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        panels.forEach(function (panel) {
            var section = panel.parentElement;
            if (!section) {
                return;
            }
            var input = panel.querySelector('.filter-input');
            var typeFilter = panel.querySelector('.type-filter');
            var yearFilter = panel.querySelector('.year-filter');
            var empty = panel.querySelector('.filter-empty');
            var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
            function apply() {
                var keyword = normalize(input ? input.value : '');
                var typeValue = typeFilter ? typeFilter.value : '';
                var yearValue = yearFilter ? yearFilter.value : '';
                var visibleCount = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-title'));
                    var cardType = card.getAttribute('data-type') || '';
                    var cardYear = card.getAttribute('data-year') || '';
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchType = !typeValue || cardType === typeValue;
                    var matchYear = !yearValue || cardYear === yearValue;
                    var visible = matchKeyword && matchType && matchYear;
                    card.hidden = !visible;
                    if (visible) {
                        visibleCount += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visibleCount === 0);
                }
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            if (typeFilter) {
                typeFilter.addEventListener('change', apply);
            }
            if (yearFilter) {
                yearFilter.addEventListener('change', apply);
            }
        });
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.video-shell'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video[data-src]');
            var button = shell.querySelector('.js-play');
            var attached = false;
            var hls = null;
            function attach() {
                if (!video || attached) {
                    return;
                }
                var src = video.getAttribute('data-src');
                if (!src) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
                attached = true;
            }
            function play() {
                attach();
                if (!video) {
                    return;
                }
                video.controls = true;
                shell.classList.add('is-playing');
                var request = video.play();
                if (request && typeof request.catch === 'function') {
                    request.catch(function () {
                        shell.classList.remove('is-playing');
                    });
                }
            }
            if (button) {
                button.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener('ended', function () {
                    shell.classList.remove('is-playing');
                });
            }
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        toggleMobileNav();
        initHero();
        initFilters();
        initPlayers();
    });
}());
