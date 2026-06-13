(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById('movie-player');
    var playButton = document.querySelector('[data-play-button]');
    var message = document.querySelector('[data-player-message]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-source');
    var hlsInstance = null;
    var initialized = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function hideOverlay() {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    }

    function initializePlayer() {
      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;

      if (!source) {
        setMessage('播放源暂不可用');
        return Promise.reject(new Error('Missing m3u8 source'));
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setMessage('正在使用浏览器原生 HLS 播放');
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        setMessage('正在初始化 HLS 播放器');

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('播放源已就绪');
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setMessage('播放加载失败，请刷新后重试');
            hlsInstance.destroy();
            hlsInstance = null;
            initialized = false;
          }
        });

        return Promise.resolve();
      }

      video.src = source;
      setMessage('当前浏览器可能不支持 HLS 播放');
      return Promise.resolve();
    }

    function startPlayback() {
      initializePlayer()
        .then(function () {
          return video.play();
        })
        .then(function () {
          hideOverlay();
          setMessage('');
        })
        .catch(function () {
          setMessage('请再次点击播放器开始播放');
        });
    }

    if (playButton) {
      playButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', hideOverlay);
    video.addEventListener('click', function () {
      if (!initialized) {
        startPlayback();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
