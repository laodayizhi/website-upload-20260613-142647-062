(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(text) {
    return (text || '').toString().trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero || !Array.isArray(window.HERO_MOVIES) || window.HERO_MOVIES.length === 0) {
      return;
    }

    var image = hero.querySelector('[data-hero-image]');
    var title = hero.querySelector('[data-hero-title]');
    var oneLine = hero.querySelector('[data-hero-one-line]');
    var meta = hero.querySelector('[data-hero-meta]');
    var detailLink = hero.querySelector('[data-hero-link]');
    var playLink = hero.querySelector('[data-hero-play]');
    var dots = hero.querySelector('[data-hero-dots]');
    var current = 0;

    function render(index) {
      var item = window.HERO_MOVIES[index];

      if (!item) {
        return;
      }

      current = index;

      if (image) {
        image.src = item.image;
        image.alt = item.title;
      }

      if (title) {
        title.textContent = item.title;
      }

      if (oneLine) {
        oneLine.textContent = item.oneLine;
      }

      if (meta) {
        meta.innerHTML = '';
        item.meta.split(' · ').forEach(function (part) {
          var span = document.createElement('span');
          span.textContent = part;
          meta.appendChild(span);
        });
      }

      if (detailLink) {
        detailLink.href = item.href;
      }

      if (playLink) {
        playLink.href = item.playHref;
      }

      if (dots) {
        Array.prototype.forEach.call(dots.children, function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }
    }

    if (dots) {
      window.HERO_MOVIES.forEach(function (_, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-dot' + (index === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', '切换到第 ' + (index + 1) + ' 个焦点影片');
        dot.addEventListener('click', function () {
          render(index);
        });
        dots.appendChild(dot);
      });
    }

    window.setInterval(function () {
      render((current + 1) % window.HERO_MOVIES.length);
    }, 5200);
  }

  function setupCardFilters() {
    var scopes = document.querySelectorAll('[data-filter-scope]');

    Array.prototype.forEach.call(scopes, function (scope) {
      var searchInput = scope.querySelector('[data-card-search]');
      var categorySelect = scope.querySelector('[data-card-category]');
      var yearSelect = scope.querySelector('[data-card-year]');
      var list = document.querySelector('[data-card-list]');

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

      function applyFilter() {
        var keyword = normalize(searchInput && searchInput.value);
        var category = normalize(categorySelect && categorySelect.value);
        var year = normalize(yearSelect && yearSelect.value);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var cardCategory = normalize(card.getAttribute('data-category'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedCategory = !category || cardCategory === category;
          var matchedYear = !year || cardYear === year;

          card.classList.toggle('is-hidden-card', !(matchedKeyword && matchedCategory && matchedYear));
        });
      }

      [searchInput, categorySelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });
    });
  }

  function getSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function createResultCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    article.setAttribute('data-title', movie.title);
    article.setAttribute('data-year', movie.year);
    article.setAttribute('data-category', movie.categorySlug);
    article.setAttribute('data-genre', movie.genre);
    article.setAttribute('data-tags', (movie.tags || []).join(' '));

    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    article.innerHTML =
      '<a class="poster-frame" href="' + movie.href + '" aria-label="查看 ' + escapeHtml(movie.title) + '">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="play-chip">播放</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<div class="movie-meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '<h3><a href="' + movie.href + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="mini-tags">' + tags + '</div>' +
      '</div>';

    return article;
  }

  function escapeHtml(value) {
    return (value || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var searchRoot = document.querySelector('[data-search-page]');
    var resultsRoot = document.querySelector('[data-search-results]');

    if (!searchRoot || !resultsRoot || !Array.isArray(window.MOVIE_DATA)) {
      return;
    }

    var input = searchRoot.querySelector('[data-search-input]');
    var category = searchRoot.querySelector('[data-search-category]');
    var button = searchRoot.querySelector('[data-search-button]');

    if (input) {
      input.value = getSearchQuery();
    }

    function render() {
      var keyword = normalize(input && input.value);
      var categoryValue = normalize(category && category.value);
      var fragment = document.createDocumentFragment();
      var rendered = 0;

      window.MOVIE_DATA.some(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.oneLine,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' ')
        ].join(' '));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedCategory = !categoryValue || normalize(movie.categorySlug) === categoryValue;

        if (matchedKeyword && matchedCategory) {
          fragment.appendChild(createResultCard(movie));
          rendered += 1;
        }

        return rendered >= 120;
      });

      resultsRoot.innerHTML = '';
      resultsRoot.appendChild(fragment);
    }

    if (button) {
      button.addEventListener('click', render);
    }

    [input, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });

    render();
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupCardFilters();
    setupSearchPage();
  });
})();
