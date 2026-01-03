const MEMO_KEY = 'hospital_memos';

function loadMemos() {
  return JSON.parse(localStorage.getItem(MEMO_KEY) || '[]');
}

function saveMemos(memos) {
  localStorage.setItem(MEMO_KEY, JSON.stringify(memos));
}

function renderMemos() {
  const list = document.getElementById('memoList');
  if (!list) return;

  const memos = loadMemos();
  list.innerHTML = '';

  memos.slice().reverse().forEach(m => {
    const div = document.createElement('div');
    div.className = 'memo';
    div.innerHTML = `
      <div class="from">${m.from}</div>
      <div>${m.text}</div>
      <div class="time">${m.time}</div>
    `;
    list.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderMemos();

  const btn = document.getElementById('sendMemoBtn');
  btn.addEventListener('click', () => {
    const input = document.getElementById('memoInput');
    const text = input.value.trim();
    if (!text) return;

    const memos = loadMemos();
    memos.push({
      from: localStorage.getItem('demo_user_name') || '익명',
      text,
      time: new Date().toLocaleString()
    });

    saveMemos(memos);
    input.value = '';
    renderMemos();
  });
});
