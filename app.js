import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://mmnjybuvugljecorkoss.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AuKmTTUz9HSTG-1pIllqug_9DwOhE3f';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const statusEl = document.getElementById('status');
const goalsList = document.getElementById('goals-list');
const daysEl = document.getElementById('days');

function fmtDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function makeItemEl(item) {
  const li = document.createElement('li');
  li.className = 'item' + (item.status === 'done' ? ' done' : '');
  li.draggable = true;
  li.dataset.id = item.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = item.status === 'done';
  checkbox.addEventListener('change', () => toggleStatus(item.id, checkbox.checked));

  const text = document.createElement('span');
  text.className = 'text';
  text.textContent = item.text;
  if (item.repeat_rule) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = '↻ ' + item.repeat_rule;
    text.appendChild(tag);
  }

  li.append(checkbox, text);

  li.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', item.id);
  });

  return li;
}

function render(items) {
  goalsList.innerHTML = '';
  daysEl.innerHTML = '';

  const goals = items.filter((i) => i.type === 'goal' && !i.date);
  const tasks = items.filter((i) => i.date);

  if (goals.length === 0) {
    goalsList.innerHTML = '<li class="empty">No open-ended goals yet.</li>';
  } else {
    for (const g of goals) goalsList.appendChild(makeItemEl(g));
  }

  const byDate = new Map();
  for (const t of tasks) {
    if (!byDate.has(t.date)) byDate.set(t.date, []);
    byDate.get(t.date).push(t);
  }

  const dates = [...byDate.keys()].sort();

  for (const date of dates) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    dayDiv.dataset.date = date;

    const h3 = document.createElement('h3');
    h3.textContent = fmtDay(date);
    dayDiv.appendChild(h3);

    const ul = document.createElement('ul');
    ul.className = 'item-list';
    for (const item of byDate.get(date)) ul.appendChild(makeItemEl(item));
    dayDiv.appendChild(ul);

    dayDiv.addEventListener('dragover', (e) => {
      e.preventDefault();
      dayDiv.classList.add('drag-over');
    });
    dayDiv.addEventListener('dragleave', () => dayDiv.classList.remove('drag-over'));
    dayDiv.addEventListener('drop', (e) => {
      e.preventDefault();
      dayDiv.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      rescheduleItem(id, date);
    });

    daysEl.appendChild(dayDiv);
  }

  if (dates.length === 0) {
    daysEl.innerHTML = '<p class="empty">No dated items yet.</p>';
  }
}

async function loadAll() {
  const { data, error } = await supabase.from('items').select('*').order('date').order('created_at');
  if (error) {
    statusEl.textContent = 'error: ' + error.message;
    return;
  }
  render(data);
}

async function toggleStatus(id, checked) {
  const { error } = await supabase
    .from('items')
    .update({ status: checked ? 'done' : 'open', updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) statusEl.textContent = 'update failed: ' + error.message;
}

async function rescheduleItem(id, date) {
  const { error } = await supabase
    .from('items')
    .update({ date, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) statusEl.textContent = 'reschedule failed: ' + error.message;
}

await loadAll();
statusEl.textContent = 'live';

supabase
  .channel('items-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
    loadAll();
  })
  .subscribe();
