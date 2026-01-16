import { apiFetch, formatDate } from '../api.js';
import { loadHeader } from '../header.js';

async function init() {
  await loadHeader();

  try {
    const data = await apiFetch('/users/me');
    const user = data.user;

    const avatar = document.getElementById('profile-avatar');
    const name = document.getElementById('profile-name');
    const email = document.getElementById('profile-email');
    const created = document.getElementById('profile-created');
    const vipExpiry = document.getElementById('profile-vip-expiry');
    const vipBadge = document.getElementById('vip-badge');

    if (avatar) {
      avatar.textContent = user.userNickname?.charAt(0).toUpperCase() || 'M';
    }
    if (name) {
      name.textContent = user.userNickname;
    }
    if (email) {
      email.textContent = user.userEmail;
    }
    if (created) {
      created.textContent = formatDate(user.createdAt);
    }
    if (vipExpiry) {
      vipExpiry.textContent = user.vipExpiresAt ? formatDate(user.vipExpiresAt) : '未开通';
    }
    if (vipBadge) {
      vipBadge.style.display = user.isVip ? 'inline-block' : 'none';
    }
  } catch {
    window.location.href = '/pages/login.html';
  }
}

init();
