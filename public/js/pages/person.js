import { apiFetch, buildImageUrl, formatDate, getQueryParam } from '../api.js';
import { loadHeader } from '../header.js';
import { renderMovieGrid } from '../ui.js';

function renderMeta(person) {
  const items = [
    person.birth && { label: '出生日期', value: formatDate(person.birth) },
    person.birthplace && { label: '出生地', value: person.birthplace },
    person.profession && { label: '职业', value: person.profession },
    person.sex && { label: '性别', value: person.sex },
    person.constellatory && { label: '星座', value: person.constellatory },
  ].filter(Boolean);

  return items
    .map(
      (item) => `
        <div class="person-meta-item">
          <span>${item.label}</span>
          <div>${item.value}</div>
        </div>
      `,
    )
    .join('');
}

async function init() {
  await loadHeader();

  const personId = getQueryParam('id');
  if (!personId) {
    window.location.href = '/pages/persons.html';
    return;
  }

  try {
    const data = await apiFetch(`/persons/${personId}`);
    const person = data.person;

    const image = document.getElementById('person-image');
    const name = document.getElementById('person-name');
    const bio = document.getElementById('person-bio');
    const alias = document.getElementById('person-alias');
    const meta = document.getElementById('person-meta');

    if (image) {
      if (person.profileImage) {
        image.setAttribute('src', buildImageUrl(person.profileImage));
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'person-placeholder';
        placeholder.textContent = '👤';
        image.replaceWith(placeholder);
      }
    }
    if (name) {
      name.textContent = person.name;
    }
    if (alias) {
      const aliasParts = [person.nameZh, person.nameEn].filter(Boolean);
      alias.textContent = aliasParts.length ? aliasParts.join(' / ') : '';
    }
    if (meta) {
      meta.innerHTML = renderMeta(person);
    }
    if (bio) {
      bio.textContent = person.biography || '暂无简介';
    }

    const actorGrid = document.getElementById('actor-movies');
    const directorGrid = document.getElementById('director-movies');
    const actorEmpty = document.getElementById('actor-empty');
    const directorEmpty = document.getElementById('director-empty');

    if (actorGrid) {
      const actorMovies = data.actorMovies || [];
      renderMovieGrid(actorGrid, actorMovies);
      if (actorEmpty) {
        actorEmpty.style.display = actorMovies.length ? 'none' : 'block';
      }
    }
    if (directorGrid) {
      const directorMovies = data.directorMovies || [];
      renderMovieGrid(directorGrid, directorMovies);
      if (directorEmpty) {
        directorEmpty.style.display = directorMovies.length ? 'none' : 'block';
      }
    }
  } catch (error) {
    console.error(error);
  }
}

init();
