import { apiFetch, getQueryParam } from '../api.js';
import { loadHeader } from '../header.js';
import { renderMovieGrid } from '../ui.js';

const typeLabels = {
  week: '本周排行',
  monthly: '本月排行',
  month: '本月排行',
  all: '全部排行',
  rating: '好评排行',
  hot: '热门排行',
  score: '高分排行',
  new: '新片排行',
  classic: '经典排行',
};

async function init() {
  await loadHeader();

  const type = getQueryParam('type') || 'all';
  const title = document.getElementById('rank-title');
  if (title) {
    title.textContent = typeLabels[type] || '排行榜';
  }

  try {
    const data = await apiFetch(`/movies/rankings/${type}`);
    const grid = document.getElementById('rank-grid');
    if (grid) {
      renderMovieGrid(grid, data.data || []);
    }
  } catch (error) {
    console.error(error);
  }
}

init();
