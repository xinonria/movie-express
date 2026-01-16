import { apiFetch, buildImageUrl, formatDate, getQueryParam, getToken } from '../api.js';
import { loadHeader } from '../header.js';
import { escapeHtml, renderCommentItem } from '../ui.js';

function renderMeta(movie) {
  const meta = [];
  if (movie.year) {
    meta.push(`<span><strong>年份：</strong>${escapeHtml(movie.year)}</span>`);
  }
  if (movie.releaseDate) {
    meta.push(`<span><strong>上映：</strong>${escapeHtml(formatDate(movie.releaseDate))}</span>`);
  }
  if (movie.genres) {
    meta.push(`<span><strong>类型：</strong>${escapeHtml(movie.genres)}</span>`);
  }
  if (movie.regions) {
    meta.push(`<span><strong>地区：</strong>${escapeHtml(movie.regions)}</span>`);
  }
  if (movie.languages) {
    meta.push(`<span><strong>语言：</strong>${escapeHtml(movie.languages)}</span>`);
  }
  if (movie.mins) {
    meta.push(`<span><strong>时长：</strong>${escapeHtml(movie.mins)} 分钟</span>`);
  }
  return meta.join('');
}

function renderCast(actors, directors) {
  const container = document.getElementById('cast-list');
  if (!container) {
    return;
  }
  const items = [];
  const buildCard = (person, role) => {
    const image = person.profileImage
      ? buildImageUrl(person.profileImage)
      : '/images/herobackground.jpg';
    return `
      <a class="cast-card" href="/pages/person.html?id=${person.personId}">
        <img src="${image}" alt="${escapeHtml(person.name)}" />
        <div>${escapeHtml(person.name)}</div>
        <div style="color: var(--text-secondary); font-size: 14px;">${role}</div>
      </a>
    `;
  };

  actors.forEach((person) => items.push(buildCard(person, '演员')));
  directors.forEach((person) => items.push(buildCard(person, '导演')));
  container.innerHTML = items.join('');
}

function bindCommentVotes(movieId) {
  const list = document.getElementById('comments-list');
  if (!list) {
    return;
  }
  list.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (!target.classList.contains('comment-vote')) {
      return;
    }
    const commentId = target.dataset.id;
    if (!commentId) {
      return;
    }

    try {
      const result = await apiFetch(`/comments/${commentId}/vote`, {
        method: 'POST',
      });
      target.classList.toggle('active', result.voted);
      target.textContent = `👍 ${result.votes}`;
    } catch (error) {
      console.error(error);
    }
  });
}

async function submitComment(movieId) {
  const contentEl = document.getElementById('comment-content');
  const ratingEl = document.getElementById('comment-rating');
  if (!contentEl || !ratingEl) {
    return;
  }

  const content = contentEl.value.trim();
  const ratingValue = ratingEl.value ? Number(ratingEl.value) : undefined;
  if (!content) {
    return;
  }

  const payload = { content };
  if (ratingValue) {
    payload.rating = ratingValue;
  }

  const data = await apiFetch(`/movies/${movieId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const list = document.getElementById('comments-list');
  const empty = document.getElementById('comments-empty');
  if (list && data.comment) {
    list.insertAdjacentHTML('afterbegin', renderCommentItem(data.comment));
  }
  if (empty) {
    empty.style.display = 'none';
  }
  contentEl.value = '';
  ratingEl.value = '';
}

async function init() {
  await loadHeader();

  const movieId = getQueryParam('id');
  if (!movieId) {
    window.location.href = '/';
    return;
  }

  try {
    const data = await apiFetch(`/movies/${movieId}`);
    const movie = data.movie;

    document.title = `${movie.name} - 电影天堂`;
    const backdrop = document.getElementById('backdrop-image');
    const poster = document.getElementById('poster-image');
    const title = document.getElementById('movie-title');
    const subtitle = document.getElementById('movie-subtitle');
    const score = document.getElementById('movie-score');
    const votes = document.getElementById('movie-votes');
    const meta = document.getElementById('movie-meta');
    const storyline = document.getElementById('movie-storyline');
    const watch = document.getElementById('watch-button');

    const cover = movie.cover ? buildImageUrl(movie.cover) : '/images/herobackground.jpg';
    if (backdrop) {
      backdrop.setAttribute('src', cover);
    }
    if (poster) {
      poster.setAttribute('src', cover);
    }
    if (title) {
      title.textContent = movie.name;
    }
    if (subtitle) {
      subtitle.textContent = movie.alias || movie.tags || '';
    }
    if (score) {
      score.textContent = movie.doubanScore ? Number(movie.doubanScore).toFixed(1) : '--';
    }
    if (votes) {
      votes.textContent = movie.doubanVotes ?? '--';
    }
    if (meta) {
      meta.innerHTML = renderMeta(movie);
    }
    if (storyline) {
      storyline.textContent = movie.storyline || '暂无简介';
    }
    if (watch) {
      watch.setAttribute('href', `/pages/play.html?id=${movie.movieId}`);
    }

    renderCast(data.actors || [], data.directors || []);

    const commentList = document.getElementById('comments-list');
    const commentEmpty = document.getElementById('comments-empty');
    if (commentList) {
      commentList.innerHTML = (data.comments || []).map(renderCommentItem).join('');
    }
    if (commentEmpty) {
      commentEmpty.style.display = data.comments?.length ? 'none' : 'block';
    }

    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
      commentForm.style.display = getToken() ? 'block' : 'none';
    }

    const submitBtn = document.getElementById('comment-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        try {
          await submitComment(movieId);
        } catch (error) {
          console.error(error);
        }
      });
    }

    bindCommentVotes(movieId);
  } catch (error) {
    console.error(error);
  }
}

init();
