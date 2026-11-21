/* ══════════════════════════════════════════════
   Fadhil's Dashboard — app.js
   Vanilla JS · LocalStorage · No frameworks
   ══════════════════════════════════════════════ */

// ── Utility helpers ──────────────────────────────
const $  = id => document.getElementById(id);
const ls = {
  get: k      => JSON.parse(localStorage.getItem(k)),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

function pad(n) { return String(n).padStart(2, '0'); }

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2400);
}

// ══════════════════════════════════════════════
// 1. LIGHT / DARK MODE  (Challenge ✅)
// ══════════════════════════════════════════════
let theme = ls.get('theme') || 'dark';

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  $('themeToggle').textContent = t === 'dark' ? '🌙' : '☀️';
  ls.set('theme', t);
  theme = t;
}

applyTheme(theme);

$('themeToggle').addEventListener('click', () => {
  applyTheme(theme === 'dark' ? 'light' : 'dark');
});

// ══════════════════════════════════════════════
// 2. CLOCK, DATE & GREETING
// ══════════════════════════════════════════════
function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

function updateClock() {
  const now  = new Date();
  const h    = now.getHours();
  const name = ls.get('userName') || 'Fadhil';

  $('clock').textContent        = `${pad(h)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  $('greeting').textContent     = `${getGreeting(h)}, ${name}! 👋`;
  $('date-display').textContent = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

updateClock();
setInterval(updateClock, 1000);

// ══════════════════════════════════════════════
// 3. CUSTOM NAME IN GREETING  (Challenge ✅)
// ══════════════════════════════════════════════
$('nameInput').value = ls.get('userName') || 'Fadhil';

$('saveName').addEventListener('click', () => {
  const name = $('nameInput').value.trim() || 'Fadhil';
  ls.set('userName', name);
  updateClock();
  showToast(`Name saved as "${name}"`);
});

$('nameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') $('saveName').click();
});

// ══════════════════════════════════════════════
// 4. FOCUS TIMER  +  CHANGE POMODORO TIME (Challenge ✅)
// ══════════════════════════════════════════════
let totalSeconds  = (ls.get('pomodoroMins') || 25) * 60;
let remaining     = totalSeconds;
let timerInterval = null;
let timerRunning  = false;

// Restore saved pomodoro minutes in input
$('pomodoroMinutes').value = ls.get('pomodoroMins') || 25;

function renderTimer() {
  $('timerDisplay').textContent = `${pad(Math.floor(remaining / 60))}:${pad(remaining % 60)}`;
}

function setTimerClass(cls) {
  $('timerDisplay').classList.remove('running', 'finished');
  if (cls) $('timerDisplay').classList.add(cls);
}

$('applyPomodoro').addEventListener('click', () => {
  if (timerRunning) { showToast('Stop the timer first.'); return; }
  const mins = parseInt($('pomodoroMinutes').value, 10);
  if (!mins || mins < 1 || mins > 999) { showToast('Enter a valid number (1–999).'); return; }
  totalSeconds = mins * 60;
  remaining    = totalSeconds;
  ls.set('pomodoroMins', mins);
  renderTimer();
  setTimerClass(null);
  showToast(`Timer set to ${mins} min`);
});

$('startTimer').addEventListener('click', () => {
  if (timerRunning) return;
  if (remaining <= 0) { remaining = totalSeconds; renderTimer(); }
  timerRunning = true;
  setTimerClass('running');
  timerInterval = setInterval(() => {
    remaining--;
    renderTimer();
    if (remaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      setTimerClass('finished');
      showToast('⏰ Time is up! Great work, Fadhil!');
    }
  }, 1000);
});

$('stopTimer').addEventListener('click', () => {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerRunning = false;
  setTimerClass(null);
});

$('resetTimer').addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRunning = false;
  remaining    = totalSeconds;
  renderTimer();
  setTimerClass(null);
});

renderTimer();

// ══════════════════════════════════════════════
// 5. TO-DO LIST  +  PREVENT DUPLICATES (Challenge ✅)
//                +  SORT TASKS         (Challenge ✅)
// ══════════════════════════════════════════════
let tasks = ls.get('tasks') || [];

function saveTasks() { ls.set('tasks', tasks); }

function renderTasks(list) {
  const ul = $('taskList');
  ul.innerHTML = '';

  list.forEach((task, i) => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');

    // Checkbox
    const check    = document.createElement('input');
    check.type     = 'checkbox';
    check.className = 'task-check';
    check.checked  = task.done;
    check.addEventListener('change', () => {
      tasks[i].done = check.checked;
      saveTasks();
      renderTasks(tasks);
    });

    // Label
    const label     = document.createElement('span');
    label.className = 'task-label';
    label.textContent = task.text;

    // Actions
    const actions   = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn   = document.createElement('button');
    editBtn.className = 'btn btn-small';
    editBtn.textContent = '✏️';
    editBtn.title   = 'Edit task';

    const delBtn    = document.createElement('button');
    delBtn.className = 'btn btn-danger btn-small';
    delBtn.textContent = '🗑';
    delBtn.title    = 'Delete task';
    delBtn.addEventListener('click', () => {
      tasks.splice(i, 1);
      saveTasks();
      renderTasks(tasks);
    });

    editBtn.addEventListener('click', () => startEdit(li, label, editBtn, i));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    li.appendChild(check);
    li.appendChild(label);
    li.appendChild(actions);
    ul.appendChild(li);
  });
}

function startEdit(li, label, editBtn, i) {
  const input     = document.createElement('input');
  input.type      = 'text';
  input.className = 'task-edit-input';
  input.value     = tasks[i].text;
  li.replaceChild(input, label);
  input.focus();
  editBtn.textContent = '✔️';

  function save() {
    const val = input.value.trim();
    if (!val) { showToast('Task cannot be empty.'); input.focus(); return; }
    // Prevent duplicate on edit (Challenge ✅)
    const dup = tasks.some((t, idx) => idx !== i && t.text.toLowerCase() === val.toLowerCase());
    if (dup) { showToast('That task already exists!'); input.focus(); return; }
    tasks[i].text = val;
    saveTasks();
    renderTasks(tasks);
  }

  editBtn.onclick = save;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter')  save();
    if (e.key === 'Escape') renderTasks(tasks);
  });
}

// Add task
$('addTask').addEventListener('click', () => {
  const val = $('taskInput').value.trim();
  if (!val) { showToast('Type a task first.'); return; }
  // Prevent duplicate on add (Challenge ✅)
  const dup = tasks.some(t => t.text.toLowerCase() === val.toLowerCase());
  if (dup) { showToast('Task already exists!'); return; }
  tasks.push({ text: val, done: false });
  saveTasks();
  renderTasks(tasks);
  $('taskInput').value = '';
});

$('taskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') $('addTask').click();
});

// Sort tasks (Challenge ✅)
$('sortAZ').addEventListener('click', () => {
  tasks.sort((a, b) => a.text.localeCompare(b.text));
  saveTasks(); renderTasks(tasks);
});

$('sortZA').addEventListener('click', () => {
  tasks.sort((a, b) => b.text.localeCompare(a.text));
  saveTasks(); renderTasks(tasks);
});

$('sortDone').addEventListener('click', () => {
  tasks.sort((a, b) => Number(a.done) - Number(b.done));
  saveTasks(); renderTasks(tasks);
});

renderTasks(tasks);

// ══════════════════════════════════════════════
// 6. QUICK LINKS
// ══════════════════════════════════════════════
let links = ls.get('links') || [];

function saveLinks() { ls.set('links', links); }

function renderLinks() {
  const grid = $('linkGrid');
  grid.innerHTML = '';

  links.forEach((link, i) => {
    const chip     = document.createElement('a');
    chip.className = 'link-chip';
    chip.href      = link.url;
    chip.target    = '_blank';
    chip.rel       = 'noopener noreferrer';

    const name     = document.createTextNode(link.name);

    const del      = document.createElement('button');
    del.className  = 'link-delete';
    del.textContent = '✕';
    del.title      = 'Remove link';
    del.addEventListener('click', e => {
      e.preventDefault();
      links.splice(i, 1);
      saveLinks();
      renderLinks();
    });

    chip.appendChild(name);
    chip.appendChild(del);
    grid.appendChild(chip);
  });
}

$('addLink').addEventListener('click', () => {
  const name = $('linkName').value.trim();
  let   url  = $('linkURL').value.trim();
  if (!name || !url) { showToast('Enter both a label and a URL.'); return; }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  links.push({ name, url });
  saveLinks();
  renderLinks();
  $('linkName').value = '';
  $('linkURL').value  = '';
});

$('linkURL').addEventListener('keydown', e => {
  if (e.key === 'Enter') $('addLink').click();
});

renderLinks();
