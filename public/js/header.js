import { apiFetch, clearToken, getToken } from './api.js';

export async function loadHeader() {
  const container = document.getElementById('site-header');
  if (!container) {
    return;
  }

  const response = await fetch('/partials/header.html');
  const html = await response.text();
  container.innerHTML = html;

  setupHeaderScripts();
  await setupUserMenu();
}

function setupHeaderScripts() {
  const searchIcon = document.getElementById('search-icon');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('search-close');
  const navToggle = document.getElementById('nav-toggle');
  const navPanel = document.getElementById('nav-panel');

  if (searchIcon && searchOverlay) {
    searchIcon.addEventListener('click', () => {
      if (navPanel) {
        navPanel.classList.remove('is-open');
      }
      if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
      }
      document.body.classList.remove('nav-open');
      searchOverlay.classList.add('active');
      const input = searchOverlay.querySelector('.search-input');
      if (input) {
        input.focus();
      }
    });
  }

  if (searchClose && searchOverlay) {
    searchClose.addEventListener('click', () => {
      searchOverlay.classList.remove('active');
    });
  }

  if (navToggle && navPanel) {
    const closeNav = () => {
      navPanel.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };

    navToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = navPanel.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    });

    navPanel.addEventListener('click', (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('a')) {
        closeNav();
      }
    });

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (
        target instanceof Element &&
        !navPanel.contains(target) &&
        !navToggle.contains(target)
      ) {
        closeNav();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        closeNav();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    if (searchOverlay) {
      searchOverlay.classList.remove('active');
    }

    if (navPanel) {
      navPanel.classList.remove('is-open');
    }
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.classList.remove('nav-open');
  });

  window.addEventListener('scroll', () => {
    const header = document.getElementById('mainHeader');
    if (!header) {
      return;
    }
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

async function setupUserMenu() {
  const authLinks = document.getElementById('auth-links');
  const userProfile = document.getElementById('user-profile');
  const nickname = document.getElementById('user-nickname');
  const vipTag = document.getElementById('vip-tag');
  const logoutBtn = document.getElementById('logout-btn');

  if (!authLinks || !userProfile) {
    return;
  }

  const token = getToken();
  if (!token) {
    authLinks.style.display = 'block';
    userProfile.style.display = 'none';
    return;
  }

  try {
    const data = await apiFetch('/auth/me');
    authLinks.style.display = 'none';
    userProfile.style.display = 'flex';
    if (nickname) {
      nickname.textContent = data.user.userNickname;
    }
    if (vipTag) {
      vipTag.style.display = data.user.isVip ? 'inline-block' : 'none';
    }
  } catch {
    clearToken();
    authLinks.style.display = 'block';
    userProfile.style.display = 'none';
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      clearToken();
      window.location.href = '/';
    });
  }
}
