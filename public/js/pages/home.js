import { apiFetch } from '../api.js';
import { loadHeader } from '../header.js';
import { renderHero, renderMovieRow } from '../ui.js';

async function init() {
  await loadHeader();

  try {
    const data = await apiFetch('/movies/featured');
    if (data.hotMovies?.length) {
      renderHero(data.hotMovies[0]);
    }

    const hotRow = document.getElementById('hot-movies');
    const newRow = document.getElementById('new-movies');
    const vipRow = document.getElementById('vip-movies');

    if (hotRow) {
      renderMovieRow(hotRow, data.hotMovies || []);
    }
    if (newRow) {
      renderMovieRow(newRow, data.latestMovies || []);
    }
    if (vipRow) {
      renderMovieRow(vipRow, data.vipMovies || []);
    }

    enableRowScroll();
    enableFadeIn();
  } catch (error) {
    console.error(error);
  }
}

function enableRowScroll() {
  document.querySelectorAll('.movie-row').forEach((row) => {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    row.addEventListener('mousedown', (event) => {
      isDown = true;
      startX = event.pageX - row.offsetLeft;
      scrollLeft = row.scrollLeft;
    });

    row.addEventListener('mouseleave', () => {
      isDown = false;
    });

    row.addEventListener('mouseup', () => {
      isDown = false;
    });

    row.addEventListener('mousemove', (event) => {
      if (!isDown) {
        return;
      }
      event.preventDefault();
      const x = event.pageX - row.offsetLeft;
      const walk = (x - startX) * 2;
      row.scrollLeft = scrollLeft - walk;
    });
  });
}

function enableFadeIn() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.content-section').forEach((section) => {
    observer.observe(section);
  });
}

init();
