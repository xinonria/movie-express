import { apiFetch, getQueryParam } from '../api.js';
import { loadHeader } from '../header.js';
import { renderMovieGrid } from '../ui.js';

const periodMap = {
  today: 'today',
  week: 'week',
  month: 'month',
  all: 'hot',
};

const titleMap = {
  today: '今日最热',
  week: '本周热播',
  month: '本月热播',
  all: '全部热门',
};

async function init() {
  await loadHeader();

  const period = getQueryParam('period') || 'week';
  const type = periodMap[period] || 'week';
  const title = document.getElementById('hot-title');
  if (title) {
    title.textContent = titleMap[period] || '热播电影';
  }

  try {
    const data = await apiFetch(`/movies/rankings/${type}`);
    const grid = document.getElementById('hot-grid');
    if (grid) {
      renderMovieGrid(grid, data.data || []);
    }
  } catch (error) {
    console.error(error);
  }
}

init();
