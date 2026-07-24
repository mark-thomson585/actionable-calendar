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
  const period = h >= 12 ? 'pm' : 'am';
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
// line, just prefixed with a time), 'range' (two-line block), 'prong' (a
// solo range overlapping only a point, own short branch), 'cluster' (two or
// more one-off ranges that overlap each other — directly or transitively —
// share one backwards-C bracket), or 'anchor' (a daily weekday-routine item
// that a one-off item's time genuinely overlaps — the one-off branches off
// to the right instead of crowding the left list; daily items always stay
// on the left regardless).
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

  const dailyItems = timed.filter((i) => i.repeat_rule === 'weekday');
  const otherTimed = timed.filter((i) => i.repeat_rule !== 'weekday');

  // A one-off item only branches right if it genuinely overlaps a daily
  // item's time; otherwise it's laid out normally among the other one-offs.
  const dailyBranches = new Map();
  const attached = new Set();
  for (const preset of otherTimed) {
    const dailyMatch = dailyItems.find((d) => overlaps(preset, d));
    if (dailyMatch) {
      if (!dailyBranches.has(dailyMatch.id)) dailyBranches.set(dailyMatch.id, []);
      dailyBranches.get(dailyMatch.id).push(preset);
      attached.add(preset.id);
    }
  }
  const freePresets = otherTimed.filter((i) => !attached.has(i.id));

  const ranges = freePresets.filter((i) => i.end_time);
  const points = freePresets.filter((i) => !i.end_time);

  // Union-find over free one-off ranges only — clusters form from
  // range-to-range overlap among items not already claimed by a daily item.
  const parent = new Map(ranges.map((r) => [r.id, r.id]));
  function find(id) {
    while (parent.get(id) !== id) {
      parent.set(id, parent.get(parent.get(id)));
      id = parent.get(id);
    }
    return id;
  }
  function union(a, b) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      if (overlaps(ranges[i], ranges[j])) union(ranges[i].id, ranges[j].id);
    }
  }
  const groups = new Map();
  for (const r of ranges) {
    const root = find(r.id);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(r);
  }

  const laidOut = [];
  const clustered = new Set();

  for (const members of groups.values()) {
    if (members.length < 2) continue;
    members.sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
    laidOut.push({ mode: 'cluster', members, sortKey: toMinutes(members[0].start_time) });
    for (const m of members) clustered.add(m.id);
  }

  for (const r of ranges) {
    if (clustered.has(r.id)) continue;
    const intersects = freePresets.some((other) => other.id !== r.id && overlaps(r, other));
    laidOut.push({ item: r, mode: intersects ? 'prong' : 'range', sortKey: toMinutes(r.start_time) });
  }

  for (const p of points) {
    laidOut.push({ item: p, mode: 'point', sortKey: toMinutes(p.start_time) });
  }

  for (const d of dailyItems) {
    const branches = dailyBranches.get(d.id) || [];
    laidOut.push({
      item: d,
      mode: branches.length ? 'anchor' : 'range',
      branches,
      sortKey: toMinutes(d.start_time),
    });
  }

  laidOut.sort((a, b) => a.sortKey - b.sortKey);

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
    text.appendChild(titleSpan());
    if (mode === 'point') {
      const connector = document.createElement('span');
      connector.className = 'connector-word';
      connector.textContent = ' @ ';
      text.append(connector, timeSpan('start_time', 'time-suffix'));
    }
    const tag = makeRepeatTag(item);
    if (tag) text.appendChild(tag);
    li.append(checkbox, text);
  } else if (mode === 'range') {
    const block = document.createElement('div');
    block.className = 'range-block';

    const title = document.createElement('span');
    const fromWord = document.createElement('span');
    fromWord.className = 'connector-word';
    fromWord.textContent = ' from';
    title.append(titleSpan(), fromWord);

    const times = document.createElement('span');
    times.className = 'range-times';
    times.append(timeSpan('start_time', 'range-time'), timeSpan('end_time', 'range-time'));

    block.append(title, times);
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

// Ranges created here so `renderDayColumn` can measure and position their
// backwards-C bracket once the elements are actually laid out in the DOM
// (pixel geometry isn't knowable before that).
let pendingClusters = [];

function makeClusterRow(item, { branch } = {}) {
  const row = document.createElement('div');
  row.className = 'cluster-row' + (item.status === 'done' ? ' done' : '') + (branch ? ' cluster-branch-row' : '');
  row.draggable = true;
  row.dataset.id = item.id;
  row.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', item.id));

  const checkbox = makeCheckbox(item);

  const title = makeEditableSpan({
    displayText: item.text,
    editValue: item.text,
    inputType: 'text',
    className: 'cluster-title',
    deleteOnEmpty: true,
    onCommit: (val) => (val === null ? deleteItem(item.id) : updateItem(item.id, { text: val })),
  });

  const times = document.createElement('span');
  times.className = 'range-times';
  times.appendChild(
    makeEditableSpan({
      displayText: fmtTime(item.start_time),
      editValue: item.start_time.slice(0, 5),
      inputType: 'time',
      className: 'range-time',
      deleteOnEmpty: false,
      onCommit: (val) => updateItem(item.id, { start_time: val }),
    }),
  );
  if (item.end_time) {
    times.appendChild(
      makeEditableSpan({
        displayText: fmtTime(item.end_time),
        editValue: item.end_time.slice(0, 5),
        inputType: 'time',
        className: 'range-time',
        deleteOnEmpty: false,
        onCommit: (val) => updateItem(item.id, { end_time: val }),
      }),
    );
  }

  row.append(checkbox, title, times);
  return { row, times };
}

// Two or more mutually-overlapping ranges share one backwards-C bracket: a
// horizontal tick from the earliest and latest item's time column, joined by
// a vertical segment — all three segments the same length. Any items
// overlapping in between (not the earliest/latest) branch off the middle of
// that vertical segment with their own equal-length horizontal segment,
// their row sitting at the far end of it.
function makeClusterLi({ members }) {
  const li = document.createElement('li');
  li.className = 'item prong-cluster';

  const top = members[0];
  const bottom = members[members.length - 1];
  const branchItems = members.slice(1, -1);

  const rows = document.createElement('div');
  rows.className = 'cluster-rows';
  const { row: topRow, times: topTimes } = makeClusterRow(top);
  const { row: bottomRow, times: bottomTimes } = makeClusterRow(bottom);
  rows.append(topRow, bottomRow);

  const hTop = document.createElement('div');
  hTop.className = 'bracket-h';
  const vMid = document.createElement('div');
  vMid.className = 'bracket-v';
  const hBottom = document.createElement('div');
  hBottom.className = 'bracket-h';

  li.append(rows, hTop, vMid, hBottom);

  const branches = branchItems.map((item) => {
    const { row, times } = makeClusterRow(item, { branch: true });
    const segment = document.createElement('div');
    segment.className = 'bracket-h';
    li.append(row, segment);
    return { row, times, segment };
  });

  pendingClusters.push(() => {
    const liRect = li.getBoundingClientRect();
    const firstRect = topTimes.getBoundingClientRect();
    const lastRect = bottomTimes.getBoundingClientRect();
    const centerTop = firstRect.top + firstRect.height / 2 - liRect.top;
    const centerBottom = lastRect.top + lastRect.height / 2 - liRect.top;
    const gap = 6;
    const startX = Math.max(firstRect.right, lastRect.right) - liRect.left + gap;
    const length = Math.max(0, centerBottom - centerTop);
    const trunkX = startX + length;

    hTop.style.left = `${startX}px`;
    hTop.style.top = `${centerTop}px`;
    hTop.style.width = `${length}px`;

    hBottom.style.left = `${startX}px`;
    hBottom.style.top = `${centerBottom}px`;
    hBottom.style.width = `${length}px`;

    vMid.style.left = `${trunkX}px`;
    vMid.style.top = `${centerTop}px`;
    vMid.style.height = `${length}px`;

    branches.forEach(({ row, segment }, i) => {
      const frac = (i + 1) / (branches.length + 1);
      const branchY = centerTop + frac * length;

      segment.style.left = `${trunkX}px`;
      segment.style.top = `${branchY}px`;
      segment.style.width = `${length}px`;

      row.style.left = `${trunkX + length + gap}px`;
      row.style.top = `${branchY}px`;
    });
  });

  return li;
}

// A daily weekday-routine item that one or more one-off items genuinely
// overlap: the daily item stays put in the left list, and each overlapping
// one-off branches off to the right with a single horizontal line (no
// vertical/second-anchor segment needed — there's only one anchor).
const ANCHOR_BRANCH_LENGTH = 40;
const ANCHOR_BRANCH_SPACING = 32;

function makeAnchorLi(item, branches) {
  const li = document.createElement('li');
  li.className = 'item prong-cluster';

  const rows = document.createElement('div');
  rows.className = 'cluster-rows';
  const { row: anchorRow, times: anchorTimes } = makeClusterRow(item);
  rows.appendChild(anchorRow);
  li.appendChild(rows);

  const branchEls = branches.map((preset) => {
    const { row, times } = makeClusterRow(preset, { branch: true });
    const hSeg = document.createElement('div');
    hSeg.className = 'bracket-h';
    const vSeg = document.createElement('div');
    vSeg.className = 'bracket-v';
    li.append(row, hSeg, vSeg);
    return { row, times, hSeg, vSeg };
  });

  pendingClusters.push(() => {
    const liRect = li.getBoundingClientRect();
    const anchorRect = anchorTimes.getBoundingClientRect();
    const anchorY = anchorRect.top + anchorRect.height / 2 - liRect.top;
    const gap = 6;
    const startX = anchorRect.right - liRect.left + gap;

    branchEls.forEach(({ row, hSeg, vSeg }, i) => {
      const targetY = anchorY + i * ANCHOR_BRANCH_SPACING;
      const vLen = targetY - anchorY;

      if (vLen > 0.5) {
        vSeg.style.display = 'block';
        vSeg.style.left = `${startX}px`;
        vSeg.style.top = `${anchorY}px`;
        vSeg.style.height = `${vLen}px`;
      } else {
        vSeg.style.display = 'none';
      }

      hSeg.style.left = `${startX}px`;
      hSeg.style.top = `${targetY}px`;
      hSeg.style.width = `${ANCHOR_BRANCH_LENGTH}px`;

      row.style.left = `${startX + ANCHOR_BRANCH_LENGTH + gap}px`;
      row.style.top = `${targetY}px`;
    });
  });

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
  for (const laidOut of layoutDayItems(dayItems)) {
    if (laidOut.mode === 'cluster') {
      ul.appendChild(makeClusterLi(laidOut));
    } else if (laidOut.mode === 'anchor') {
      ul.appendChild(makeAnchorLi(laidOut.item, laidOut.branches));
    } else {
      ul.appendChild(makeItemLi(laidOut));
    }
  }
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
  pendingClusters = [];

  for (let d = new Date(rangeStart); d <= rangeEnd; d = addDays(d, 1)) {
    const dateStr = toISODate(d);
    frag.appendChild(makeDayBlock(dateStr, byDate.get(dateStr) || [], dateStr === todayStr));
  }

  daysEl.innerHTML = '';
  daysEl.appendChild(frag);

  // Bracket geometry depends on actual rendered pixel positions, so it can
  // only be measured now that everything is attached to the live DOM.
  for (const position of pendingClusters) position();
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
