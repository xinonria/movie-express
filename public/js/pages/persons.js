import { apiFetch, buildImageUrl } from '../api.js';
import { loadHeader } from '../header.js';
import { escapeHtml } from '../ui.js';

function renderPerson(person) {
  const image = person.profileImage
    ? buildImageUrl(person.profileImage)
    : '/images/herobackground.jpg';
  return `
    <a href="/pages/person.html?id=${escapeHtml(person.personId)}" class="person-card">
      <img src="${image}" alt="${escapeHtml(person.name)}" />
      <div>${escapeHtml(person.name)}</div>
      <div style="color: var(--text-secondary); font-size: 14px;">${escapeHtml(person.profession || '')}</div>
    </a>
  `;
}

async function loadPersons(query) {
  const data = await apiFetch(`/persons${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  const grid = document.getElementById('persons-grid');
  if (grid) {
    grid.innerHTML = (data.data || []).map(renderPerson).join('');
  }
}

async function init() {
  await loadHeader();

  const input = document.getElementById('person-query');
  const button = document.getElementById('person-search');

  await loadPersons('');

  if (button) {
    button.addEventListener('click', async () => {
      await loadPersons(input?.value.trim());
    });
  }

  if (input) {
    input.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        await loadPersons(input.value.trim());
      }
    });
  }
}

init();
