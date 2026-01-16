import { apiFetch, buildImageUrl, formatDate } from '../api.js';
import { loadHeader } from '../header.js';

function renderHistoryItem(record) {
  const movie = record.movie;
  const cover = movie.cover ? buildImageUrl(movie.cover) : '/images/herobackground.jpg';
  return `
    <div class="history-item">
      <img class="movie-poster" src="${cover}" alt="${movie.name}" />
      <div class="history-info">
        <h3>${movie.name}</h3>
        <p>观看时间：${formatDate(record.historyTime)}</p>
        <p>${movie.genres || ''}</p>
        <a href="/pages/movie.html?id=${movie.movieId}" class="btn-hero btn-play" style="padding: 8px 16px;">查看详情</a>
      </div>
    </div>
  `;
}

async function init() {
  await loadHeader();

  try {
    const data = await apiFetch('/users/me/history?page=1&pageSize=50');
    const list = document.getElementById('history-list');
    const empty = document.getElementById('history-empty');
    const count = document.getElementById('history-count');

    if (count) {
      count.textContent = data.total;
    }

    if (!data.data.length) {
      if (empty) {
        empty.style.display = 'block';
      }
      if (list) {
        list.innerHTML = '';
      }
      return;
    }

    if (empty) {
      empty.style.display = 'none';
    }
    if (list) {
      list.innerHTML = data.data.map(renderHistoryItem).join('');
    }
  } catch {
    window.location.href = '/pages/login.html';
  }
}

init();
