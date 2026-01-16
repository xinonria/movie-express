import { apiFetch, formatDate, getQueryParam } from '../api.js';
import { loadHeader } from '../header.js';

async function init() {
  await loadHeader();

  const movieId = getQueryParam('id');
  if (!movieId) {
    window.location.href = '/';
    return;
  }

  try {
    const data = await apiFetch(`/movies/${movieId}/play`);
    const videoSource = document.getElementById('videoSource');
    const player = document.getElementById('videoPlayer');
    const trialNotice = document.getElementById('trial-notice');
    const overlay = document.getElementById('vipOverlay');

    if (videoSource) {
      videoSource.setAttribute('src', data.videoPath);
    }
    if (player) {
      player.load();
    }

    document.title = `${data.movie.name} - 播放`;

    const title = document.getElementById('movie-title');
    const meta = document.getElementById('movie-meta');
    const storyline = document.getElementById('movie-storyline');

    if (title) {
      title.textContent = data.movie.name;
    }
    if (meta) {
      const releaseDate = formatDate(data.movie.releaseDate);
      const mins = data.movie.mins ? `${data.movie.mins}分钟` : '';
      const vipTag = data.movie.isVip ? 'VIP' : '';
      meta.textContent = [releaseDate, mins, vipTag].filter(Boolean).join(' | ');
    }
    if (storyline) {
      storyline.textContent = data.movie.storyline || '';
    }

    if (data.isTrial && trialNotice) {
      trialNotice.style.display = 'block';
    }

    if (data.isTrial && player && overlay) {
      const trialDuration = 15;
      let shown = false;
      player.addEventListener('timeupdate', () => {
        if (player.currentTime >= trialDuration && !shown) {
          player.pause();
          overlay.classList.add('show');
          shown = true;
        }
      });

      player.addEventListener('seeking', () => {
        if (player.currentTime > trialDuration) {
          player.currentTime = trialDuration;
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
}

init();
