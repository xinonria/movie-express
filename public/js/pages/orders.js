import { apiFetch, formatDate } from '../api.js';
import { loadHeader } from '../header.js';

function renderOrder(order) {
  return `
    <div class="order-item">
      <div>
        <div class="order-type">${order.orderType}</div>
        <div class="order-meta">${formatDate(order.orderTime)}</div>
      </div>
      <div class="order-meta">${order.orderStatus}</div>
    </div>
  `;
}

async function init() {
  await loadHeader();

  try {
    const data = await apiFetch('/users/me/orders');
    const list = document.getElementById('orders-list');
    const empty = document.getElementById('orders-empty');

    if (!data.data.length) {
      if (empty) {
        empty.style.display = 'block';
      }
      if (list) {
        list.innerHTML = '';
      }
      return;
    }

    if (empty) {
      empty.style.display = 'none';
    }
    if (list) {
      list.innerHTML = data.data.map(renderOrder).join('');
    }
  } catch {
    window.location.href = '/pages/login.html';
  }
}

init();
