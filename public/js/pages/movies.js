import { apiFetch, buildQuery, getQueryParam } from '../api.js';
import { loadHeader } from '../header.js';
import { renderMovieGrid } from '../ui.js';

const pageSize = 21;

function parsePage(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

function updateActiveLinks(sort, genre, region) {
  const sortLink = document.getElementById(`sort-${sort}`);
  if (sortLink) {
    sortLink.classList.add('active');
  }

  const genreLinks = document.querySelectorAll('#genre-filters a');
  genreLinks.forEach((link) => {
    if (genre && link.href.includes(`genre=${encodeURIComponent(genre)}`)) {
      link.classList.add('active');
    }
    if (!genre && link.getAttribute('href') === '/pages/movies.html') {
      link.classList.add('active');
    }
  });

  const regionLinks = document.querySelectorAll('#region-filters a');
  regionLinks.forEach((link) => {
    if (region && link.href.includes(`region=${encodeURIComponent(region)}`)) {
      link.classList.add('active');
    }
    if (!region && link.getAttribute('href') === '/pages/movies.html') {
      link.classList.add('active');
    }
  });
}

function updateTitle({ sort, genre, region, keyword }) {
  const title = document.getElementById('page-title');
  if (!title) {
    return;
  }

  if (keyword) {
    title.textContent = `🔍 搜索：${keyword}`;
    return;
  }
  if (genre) {
    title.textContent = `🎬 ${genre}电影`;
    return;
  }
  if (region) {
    title.textContent = `🌍 ${region}电影`;
    return;
  }
  if (sort === 'hot') {
    title.textContent = '🔥 热播电影';
    return;
  }
  if (sort === 'score') {
    title.textContent = '⭐ 高分电影';
    return;
  }
  if (sort === 'time') {
    title.textContent = '🆕 最新上映';
    return;
  }
  title.textContent = '🎬 全部电影';
}

function renderPagination({ page, totalPages, sort, genre, region, keyword }) {
  const container = document.getElementById('pagination');
  if (!container) {
    return;
  }

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  const buildLink = (pageNumber) => {
    return `/pages/movies.html${buildQuery({
      page: pageNumber,
      pageSize,
      sort,
      genre,
      region,
      q: keyword,
    })}`;
  };

  const items = [];
  if (page > 1) {
    items.push(`<a class="page-item page-prev" href="${buildLink(page - 1)}">上一页</a>`);
  }

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  if (start > 1) {
    items.push(`<a class="page-item" href="${buildLink(1)}">1</a>`);
    if (start > 2) {
      items.push('<span style="color: var(--text-secondary)">...</span>');
    }
  }

  for (let i = start; i <= end; i += 1) {
    if (i === page) {
      items.push(`<span class="page-item active">${i}</span>`);
    } else {
      items.push(`<a class="page-item" href="${buildLink(i)}">${i}</a>`);
    }
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      items.push('<span style="color: var(--text-secondary)">...</span>');
    }
    items.push(`<a class="page-item" href="${buildLink(totalPages)}">${totalPages}</a>`);
  }

  if (page < totalPages) {
    items.push(`<a class="page-item page-next" href="${buildLink(page + 1)}">下一页</a>`);
  }

  container.innerHTML = items.join('');
}

async function init() {
  await loadHeader();

  const sortParam = getQueryParam('sort');
  const sort = ['time', 'score', 'hot'].includes(sortParam) ? sortParam : 'time';
  const genre = getQueryParam('genre');
  const region = getQueryParam('region');
  const keyword = getQueryParam('q');
  const page = parsePage(getQueryParam('page'));

  updateActiveLinks(sort, genre, region);
  updateTitle({ sort, genre, region, keyword });

  try {
    const data = await apiFetch(
      `/movies${buildQuery({
        page,
        pageSize,
        sort,
        genre,
        region,
        q: keyword,
      })}`,
    );

    const grid = document.getElementById('movies-grid');
    const emptyState = document.getElementById('empty-state');
    const resultCount = document.getElementById('result-count');

    if (resultCount) {
      resultCount.innerHTML = `共找到 <strong>${data.total}</strong> 部电影`;
    }

    if (!data.data.length) {
      if (grid) {
        grid.innerHTML = '';
      }
      if (emptyState) {
        emptyState.style.display = 'block';
      }
      return;
    }

    if (emptyState) {
      emptyState.style.display = 'none';
    }

    if (grid) {
      renderMovieGrid(grid, data.data);
    }

    renderPagination({
      page: data.page,
      totalPages: data.totalPages,
      sort,
      genre,
      region,
      keyword,
    });
  } catch (error) {
    console.error(error);
  }
}

init();
