import { buildImageUrl, formatDate } from './api.js';

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderMovieCard(movie) {
  const score = movie.doubanScore ? Number(movie.doubanScore).toFixed(1) : '';
  const cover = movie.cover ? buildImageUrl(movie.cover) : '/images/herobackground.jpg';
  const badge = movie.isVip ? '<span class="movie-badge vip">VIP</span>' : '<span class="movie-badge">HD</span>';
  return `
    <div class="movie-item">
      <a href="/pages/movie.html?id=${escapeHtml(movie.movieId)}" style="text-decoration: none;">
        <div class="movie-thumbnail">
          <img src="${cover}" alt="${escapeHtml(movie.name)}">
          ${badge}
          ${score ? `<span class="movie-rating">${escapeHtml(score)}</span>` : ''}
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${escapeHtml(movie.name)}</h3>
          <div class="movie-meta">
            <span class="movie-year">${escapeHtml(movie.year ?? '')}</span>
            <span class="movie-genre">${escapeHtml(movie.genres ?? '')}</span>
          </div>
        </div>
      </a>
    </div>
  `;
}

export function renderMovieGridCard(movie) {
  const score = movie.doubanScore ? Number(movie.doubanScore).toFixed(1) : '';
  const cover = movie.cover ? buildImageUrl(movie.cover) : '/images/herobackground.jpg';
  const badge = movie.isVip ? '<span class="movie-badge vip">VIP</span>' : '<span class="movie-badge">HD</span>';
  return `
    <a href="/pages/movie.html?id=${escapeHtml(movie.movieId)}" class="movie-card-list">
      <div class="movie-poster-wrapper">
        <img src="${cover}" alt="${escapeHtml(movie.name)}" />
        ${badge}
        ${score ? `<span class="movie-rating">${escapeHtml(score)}</span>` : ''}
      </div>
      <div class="movie-info-bottom">
        <h3 class="movie-title-list">${escapeHtml(movie.name)}</h3>
        <div class="movie-meta-list">
          <span>${escapeHtml(movie.year ?? '')}</span>
          <span>${escapeHtml(movie.genres ?? '')}</span>
        </div>
      </div>
    </a>
  `;
}

export function renderMovieRow(container, movies) {
  container.innerHTML = movies.map(renderMovieCard).join('');
}

export function renderMovieGrid(container, movies) {
  container.innerHTML = movies.map(renderMovieGridCard).join('');
}

export function renderHero(movie) {
  if (!movie) {
    return;
  }
  const heroTitle = document.getElementById('hero-title');
  const heroDescription = document.getElementById('hero-description');
  const heroPlay = document.getElementById('hero-play');
  const heroImage = document.getElementById('hero-image');

  if (heroTitle) {
    heroTitle.textContent = movie.name;
  }
  if (heroDescription) {
    const text = movie.storyline || '精彩大片，不容错过';
    heroDescription.textContent = text.length > 100 ? `${text.slice(0, 100)}...` : text;
  }
  if (heroPlay) {
    heroPlay.setAttribute('href', `/pages/play.html?id=${movie.movieId}`);
  }
  if (heroImage) {
    const cover = movie.cover ? buildImageUrl(movie.cover) : '/images/herobackground.jpg';
    heroImage.setAttribute('src', cover);
    heroImage.setAttribute('alt', movie.name);
  }
}

export function renderCommentItem(comment) {
  const avatar = comment.userAvatar
    ? buildImageUrl(comment.userAvatar)
    : '/images/herobackground.jpg';
  const rating = comment.rating ? `评分 ${escapeHtml(comment.rating)}` : '';
  const votedClass = comment.hasVoted ? 'active' : '';
  return `
    <div class="comment-item">
      <div class="comment-avatar">
        <img src="${avatar}" alt="${escapeHtml(comment.userNickname)}" />
      </div>
      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-user">${escapeHtml(comment.userNickname)}</span>
          <span class="comment-rating">${rating}</span>
          <span class="comment-time">${formatDate(comment.createdAt)}</span>
        </div>
        <p>${escapeHtml(comment.content)}</p>
        <button class="comment-vote ${votedClass}" data-id="${escapeHtml(comment.commentId)}">👍 ${escapeHtml(comment.votes)}</button>
      </div>
    </div>
  `;
}
