import { apiFetch, formatDate } from '../api.js';
import { loadHeader } from '../header.js';

async function loadStatus() {
  const data = await apiFetch('/users/me');
  const status = document.getElementById('vip-status');
  if (status) {
    if (data.user.isVip) {
      status.textContent = `VIP有效期至 ${formatDate(data.user.vipExpiresAt)}`;
    } else {
      status.textContent = '开通会员，解锁更多精彩';
    }
  }
}

async function init() {
  await loadHeader();

  try {
    await loadStatus();
  } catch {
    window.location.href = '/pages/login.html';
    return;
  }

  document.querySelectorAll('.plan-button').forEach((button) => {
    button.addEventListener('click', async () => {
      const months = Number(button.dataset.months || 0);
      if (!months) {
        return;
      }
      try {
        await apiFetch('/orders/vip', {
          method: 'POST',
          body: JSON.stringify({ months }),
        });
        await loadStatus();
      } catch (error) {
        console.error(error);
      }
    });
  });
}

init();
