const header = document.querySelector('[data-header]');
const mobileToggle = document.querySelector('[data-mobile-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

function updateHeader() {
    if (!header) {
        return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 20);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('is-open');
    });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    if (prev) {
        prev.addEventListener('click', () => showSlide(current - 1));
    }

    if (next) {
        next.addEventListener('click', () => showSlide(current + 1));
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    window.setInterval(() => showSlide(current + 1), 5200);
}

function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

const filterArea = document.querySelector('[data-filter-area]');

if (filterArea) {
    const input = filterArea.querySelector('[data-search-input]');
    const category = filterArea.querySelector('[data-filter-category]');
    const year = filterArea.querySelector('[data-filter-year]');
    const cards = Array.from(filterArea.querySelectorAll('[data-card]'));
    const count = filterArea.querySelector('[data-visible-count]');
    const params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
        input.value = params.get('q');
    }

    if (category && params.get('category')) {
        category.value = params.get('category');
    }

    function updateCards() {
        const queryValue = normalizeText(input ? input.value : '');
        const categoryValue = category ? category.value : '';
        const yearValue = normalizeText(year ? year.value : '');
        let visible = 0;

        cards.forEach((card) => {
            const searchText = normalizeText(card.dataset.search);
            const groupText = card.dataset.groups || '';
            const cardYear = normalizeText(card.dataset.year);
            const matchQuery = !queryValue || searchText.includes(queryValue);
            const matchCategory = !categoryValue || groupText.includes(categoryValue);
            const matchYear = !yearValue || cardYear.includes(yearValue);
            const isVisible = matchQuery && matchCategory && matchYear;
            card.style.display = isVisible ? '' : 'none';
            if (isVisible) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = String(visible);
        }
    }

    [input, category, year].forEach((control) => {
        if (control) {
            control.addEventListener('input', updateCards);
            control.addEventListener('change', updateCards);
        }
    });

    updateCards();
}

const videos = Array.from(document.querySelectorAll('video[data-hls]'));

if (videos.length > 0) {
    import('./hls-dru42stk.js').then(({ H: Hls }) => {
        videos.forEach((video) => {
            const source = video.dataset.hls;
            if (!source) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (Hls && Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.ERROR, function (_event, data) {
                    if (data && data.fatal) {
                        hls.destroy();
                        video.src = source;
                    }
                });
                return;
            }

            video.src = source;
        });
    }).catch(() => {
        videos.forEach((video) => {
            const source = video.dataset.hls;
            if (source) {
                video.src = source;
            }
        });
    });
}

document.querySelectorAll('[data-play-target]').forEach((button) => {
    button.addEventListener('click', () => {
        const target = document.getElementById(button.dataset.playTarget);
        if (!target) {
            return;
        }
        target.play().catch(() => {
            target.controls = true;
        });
    });
});
