import { apiFetch, setToken } from '../api.js';
import { loadHeader } from '../header.js';

async function init() {
  await loadHeader();

  const form = document.getElementById('register-form');
  const errorBox = document.getElementById('error');

  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (errorBox) {
      errorBox.style.display = 'none';
    }

    const nickname = form.nickname.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nickname, email, password }),
      });
      setToken(data.token);
      window.location.href = '/pages/profile.html';
    } catch (error) {
      if (errorBox) {
        errorBox.textContent = error.message;
        errorBox.style.display = 'block';
      }
    }
  });
}

init();
