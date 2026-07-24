import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://mmnjybuvugljecorkoss.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AuKmTTUz9HSTG-1pIllqug_9DwOhE3f';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const statusEl = document.getElementById('status');
const dayColumn = document.getElementById('day-column');
const daysEl = document.getElementById('days');
const topSentinel = document.getElementById('top-sentinel');
const bottomSentinel = document.getElementById('bottom-sentinel');
const monthList = document.getElementById('month-list');

const DAY_MS = 24 * 60 * 60 * 1000;
const INITIAL_PAST_DAYS = 60;
const INITIAL_FUTURE_DAYS = 180;
const EXTEND_CHUNK = 30;

function todayDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(d, n) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function fmtDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function fmtTime(t) {
  // t is "HH:MM:SS" or "HH:MM"
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function toMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

let allItems = [];
let rangeStart = addDays(todayDate(), -INITIAL_PAST_DAYS);
let rangeEnd = addDays(todayDate(), INITIAL_FUTURE_DAYS);
let initialRenderDone = false;

// Full re-renders would blow away an in-progress inline edit (losing focus
// and unsaved keystrokes), so we pause rendering while any field is being
// edited and catch up once editing ends.
let activeEdits = 0;
let pendingRerender = false;

function itemsByDate(items) {
  const map = new Map();
  for (const item of items) {
    if (!item.date) continue;
    if (!map.has(item.date)) map.set(item.date, []);
    map.get(item.date).push(item);
  }
  return map;
}

// Decides how each timed item in a single day should render: 'point' (plain
// line, just prefixed with a time), 'range' (two-line block), or 'prong'
// (branch visual) when a range overlaps any other timed item that day.
function layoutDayItems(dayItems) {
  const timed = dayItems.filter((i) => i.start_time);
  const untimed = dayItems.filter((i) => !i.start_time);
  timed.sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));

  function overlaps(a, b) {
    const aStart = toMinutes(a.start_time);
    const aEnd = a.end_time ? toMinutes(a.end_time) : aStart;
    const bStart = toMinutes(b.start_time);
    const bEnd = b.end_time ? toMinutes(b.end_time) : bStart;
    return aStart < bEnd && bStart < aEnd;
  }

  const laidOut = timed.map((item) => {
    if (!item.end_time) return { item, mode: 'point' };
    const intersects = timed.some((other) => other.id !== item.id && overlaps(item, other));
    return { item, mode: intersects ? 'prong' : 'range' };
  });

  for (const item of untimed) laidOut.push({ item, mode: 'plain' });
  return laidOut;
}

function makeCheckbox(item) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = item.status === 'done';
  checkbox.addEventListener('change', () => toggleStatus(item.id, checkbox.checked));
  return checkbox;
}

function makeRepeatTag(item) {
  if (!item.repeat_rule) return null;
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = '↻ ' + item.repeat_rule;
  return tag;
}

// A span that turns into an inline <input> on click. Committing an empty
// text field deletes the item; committing an empty time field just cancels.
// Escape cancels without saving; blur/Enter commits.
function makeEditableSpan({ displayText, editValue, inputType, className, onCommit, deleteOnEmpty }) {
  const span = document.createElement('span');
  span.className = className;
  span.textContent = displayText;

  span.addEventListener('click', (e) => {
    e.stopPropagation();
    startEdit();
  });

  function startEdit() {
    activeEdits++;
    const input = document.createElement('input');
    input.type = inputType;
    input.value = editValue ?? '';
    input.className = className + ' inline-edit-input';
    input.addEventListener('mousedown', (e) => e.stopPropagation());
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('dragstart', (e) => e.stopPropagation());

    let settled = false;
    function settle(commit) {
      if (settled) return;
      settled = true;
      if (commit) {
        const val = input.value.trim();
        if (val === '' && deleteOnEmpty) {
          onCommit(null);
        } else if (val !== '' && val !== (editValue ?? '')) {
          onCommit(val);
        }
      }
      input.replaceWith(span);
      activeEdits--;
      if (activeEdits === 0 && pendingRerender) {
        pendingRerender = false;
        renderAll();
      }
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); settle(true); }
      if (e.key === 'Escape') { e.preventDefault(); settle(false); }
    });
    input.addEventListener('blur', () => settle(true));

    span.replaceWith(input);
    input.focus();
    if (inputType === 'text') input.select();
  }

  return span;
}

function makeItemLi({ item, mode }) {
  const li = document.createElement('li');
  li.className = 'item' + (item.status === 'done' ? ' done' : '');
  li.draggable = true;
  li.dataset.id = item.id;
  li.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', item.id));

  const checkbox = makeCheckbox(item);

  const titleSpan = () => makeEditableSpan({
    displayText: item.text,
    editValue: item.text,
    inputType: 'text',
    className: mode === 'range' ? 'range-title' : mode === 'prong' ? 'prong-title' : 'text-title',
    deleteOnEmpty: true,
    onCommit: (val) => (val === null ? deleteItem(item.id) : updateItem(item.id, { text: val })),
  });

  const timeSpan = (field, className) => makeEditableSpan({
    displayText: fmtTime(item[field]),
    editValue: item[field].slice(0, 5),
    inputType: 'time',
    className,
    deleteOnEmpty: false,
    onCommit: (val) => updateItem(item.id, { [field]: val }),
  });

  if (mode === 'plain' || mode === 'point') {
    const text = document.createElement('span');
    text.className = 'text';
    const titleWrap = document.createElement('span');
    titleWrap.className = 'title-wrap';
    titleWrap.appendChild(titleSpan());
    const tag = makeRepeatTag(item);
    if (tag) titleWrap.appendChild(tag);
    text.appendChild(titleWrap);
    if (mode === 'point') {
      text.appendChild(timeSpan('start_time', 'time-suffix'));
    }
    li.append(checkbox, text);
  } else if (mode === 'range') {
    const block = document.createElement('div');
    block.className = 'range-block';
    const times = document.createElement('span');
    times.className = 'range-times';
    times.append(timeSpan('start_time', 'range-time'), timeSpan('end_time', 'range-time'));
    block.append(titleSpan(), times);
    li.append(checkbox, block);
  } else if (mode === 'prong') {
    const block = document.createElement('div');
    block.className = 'prong-block';
    const connector = document.createElement('span');
    connector.className = 'prong-connector';
    const line = document.createElement('div');
    line.className = 'prong-line';
    const topTime = timeSpan('start_time', 'prong-time top');
    const bottomTime = timeSpan('end_time', 'prong-time bottom');
    block.append(titleSpan(), connector, line, topTime, bottomTime);
    li.append(checkbox, block);
  }

  return li;
}

function makeDayBlock(dateStr, dayItems, isToday) {
  const isWeekStart = new Date(dateStr + 'T00:00:00').getDay() === 1; // Monday
  const dayDiv = document.createElement('div');
  dayDiv.className = 'day'
    + (isToday ? ' today' : '')
    + (dayItems.length === 0 ? ' empty-day' : '')
    + (isWeekStart ? ' week-start' : '');
  dayDiv.dataset.date = dateStr;

  const h3 = document.createElement('h3');
  h3.className = 'day-heading';
  h3.textContent = fmtDay(dateStr);
  dayDiv.appendChild(h3);

  const ul = document.createElement('ul');
  ul.className = 'item-list';
  for (const laidOut of layoutDayItems(dayItems)) ul.appendChild(makeItemLi(laidOut));
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
    rescheduleItem(id, dateStr);
  });

  return dayDiv;
}

function renderDayColumn() {
  const byDate = itemsByDate(allItems);
  const todayStr = toISODate(todayDate());
  const frag = document.createDocumentFragment();

  for (let d = new Date(rangeStart); d <= rangeEnd; d = addDays(d, 1)) {
    const dateStr = toISODate(d);
    frag.appendChild(makeDayBlock(dateStr, byDate.get(dateStr) || [], dateStr === todayStr));
  }

  daysEl.innerHTML = '';
  daysEl.appendChild(frag);
}

function renderMonthColumn() {
  const today = todayDate();
  const monthEnd = addDays(today, 30);
  const todayStr = toISODate(today);
  const monthEndStr = toISODate(monthEnd);

  const upcoming = allItems
    .filter((i) => i.date && i.date >= todayStr && i.date <= monthEndStr && !i.repeat_rule)
    .sort((a, b) => (a.date + (a.start_time || '')).localeCompare(b.date + (b.start_time || '')));

  monthList.innerHTML = '';
  if (upcoming.length === 0) {
    monthList.innerHTML = '<li class="empty-month">Nothing major this month.</li>';
    return;
  }

  for (const item of upcoming) {
    const li = document.createElement('li');
    li.className = 'month-row';
    const date = document.createElement('span');
    date.className = 'month-date';
    date.textContent = new Date(item.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const title = document.createElement('span');
    title.className = 'month-title';
    title.textContent = item.text;
    li.append(date, title);
    monthList.appendChild(li);
  }
}

function scrollToToday() {
  const todayEl = daysEl.querySelector('.day.today');
  if (todayEl) todayEl.scrollIntoView({ block: 'start' });
}

function renderAll() {
  if (activeEdits > 0) {
    pendingRerender = true;
    return;
  }
  renderDayColumn();
  renderMonthColumn();
  if (!initialRenderDone) {
    scrollToToday();
    initialRenderDone = true;
  }
}

async function loadAll() {
  const { data, error } = await supabase.from('items').select('*').order('date').order('created_at');
  if (error) {
    statusEl.textContent = 'error: ' + error.message;
    return;
  }
  allItems = data;
  renderAll();
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

async function updateItem(id, patch) {
  const { error } = await supabase
    .from('items')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) statusEl.textContent = 'update failed: ' + error.message;
}

async function deleteItem(id) {
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) statusEl.textContent = 'delete failed: ' + error.message;
}

const edgeObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (entry.target === bottomSentinel) {
        rangeEnd = addDays(rangeEnd, EXTEND_CHUNK);
        renderDayColumn();
      } else if (entry.target === topSentinel) {
        const prevScrollHeight = dayColumn.scrollHeight;
        rangeStart = addDays(rangeStart, -EXTEND_CHUNK);
        renderDayColumn();
        dayColumn.scrollTop += dayColumn.scrollHeight - prevScrollHeight;
      }
    }
  },
  { root: dayColumn, threshold: 0 },
);
edgeObserver.observe(topSentinel);
edgeObserver.observe(bottomSentinel);

await loadAll();
statusEl.textContent = 'live';

supabase
  .channel('items-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
    loadAll();
  })
  .subscribe();
