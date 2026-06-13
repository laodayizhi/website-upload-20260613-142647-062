(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('is-menu-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var nextButton = hero.querySelector('[data-hero-next]');
    var prevButton = hero.querySelector('[data-hero-prev]');
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    };

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var searchCards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));

  if (searchInput && searchCards.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query) {
      searchInput.value = query;
    }

    var filterCards = function () {
      var keyword = searchInput.value.trim().toLowerCase();

      searchCards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
      });
    };

    searchInput.addEventListener('input', filterCards);
    filterCards();
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var veil = player.querySelector('[data-player-veil]');
    var buttons = Array.prototype.slice.call(player.querySelectorAll('[data-play-button]'));
    var streamUrl = player.getAttribute('data-video');
    var hlsPlayer = null;
    var attached = false;

    var attachStream = function () {
      if (!video || !streamUrl || attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsPlayer.loadSource(streamUrl);
        hlsPlayer.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      attached = true;
    };

    var startPlayback = function () {
      attachStream();
      video.setAttribute('controls', 'controls');

      if (veil) {
        veil.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };

    buttons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    });

    if (video) {
      video.addEventListener('click', function () {
        if (!attached || video.paused) {
          startPlayback();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsPlayer) {
        hlsPlayer.destroy();
      }
    });
  }
})();
