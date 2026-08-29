/* ════════════════════════════════════════════════════════
   PhoneScript — UI / DOM Layer
   Handles all user interaction and DOM updates.
   Depends on: phrases.js + engine.js (loaded before this)
════════════════════════════════════════════════════════ */

/* ── State ──────────────────────────────────────────────────── */
let mode   = 'positive';
let points = [];

/* ── Escape HTML ────────────────────────────────────────────── */
function escHtml(s) {
  return s
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

/* ── Read form details ──────────────────────────────────────── */
function getDetails() {
  return {
    teacher : document.getElementById('teacherName').value.trim() || 'the teacher',
    student : document.getElementById('studentName').value.trim() || 'your child',
    subject : document.getElementById('subject').value.trim()     || 'class',
    parent  : document.getElementById('parentName').value.trim()  || 'Parent/Carer',
  };
}

/* ── Quick-suggestion chips ─────────────────────────────────── */
function buildChips(containerId, items) {
  const c = document.getElementById(containerId);
  c.innerHTML = '';
  items.forEach(text => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = '+ ' + text;
    chip.onclick = () => addPointText(text);
    c.appendChild(chip);
  });
}

/* ── Mode switching ─────────────────────────────────────────── */
function setMode(m) {
  mode = m;
  const isPos = m === 'positive';
  document.getElementById('btn-pos').className = 'type-btn' + (isPos  ? ' active-pos' : '');
  document.getElementById('btn-neg').className = 'type-btn' + (!isPos ? ' active-neg' : '');
  document.getElementById('pointsTitle').textContent =
    isPos ? '✅ Points to Cover' : '⚠️ Concerns to Address';
  document.getElementById('pointsHint').textContent =
    isPos
      ? 'Add the key positives you want to share — the script engine will weave them into a warm, encouraging call.'
      : 'Add the concerns or issues to address — the script engine will craft a professional, constructive call.';
  document.getElementById('generateBtn').className = 'btn ' + (isPos ? 'btn-pos' : 'btn-neg');
  document.getElementById('quickPos').style.display = isPos  ? '' : 'none';
  document.getElementById('quickNeg').style.display = !isPos ? '' : 'none';
  document.getElementById('scriptCard').style.display    = 'none';
  document.getElementById('responsesCard').style.display = 'none';
  // Clear points when switching to avoid accidental mixing
  points = [];
  renderPoints();
}

/* ── Points management ──────────────────────────────────────── */
document.getElementById('pointInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); addPoint(); }
});

function addPoint() {
  const input = document.getElementById('pointInput');
  addPointText(input.value);
  input.value = '';
  input.focus();
}

/* Normalise a point for duplicate comparison:
   lowercase, strip punctuation, collapse whitespace */
function normalisePoint(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

/* Minimal stem: strip trailing 's', 'ing', 'ed', 'ly' so
   "lessons"/"lesson", "helping"/"help" etc. match. */
function stem(w) {
  return w.replace(/(?:ing|ed|ly)$/, '').replace(/s$/, '');
}

function isSimilar(a, b) {
  if (a === b) return true;
  const wa = a.split(' ').map(stem), wb = b.split(' ').map(stem);
  const [shorter, longer] = wa.length <= wb.length ? [wa, wb] : [wb, wa];
  const longerSet = new Set(longer);
  const meaningful = shorter.filter(w => w.length > 3);
  if (meaningful.length < 2) return a === b;
  const overlap = meaningful.filter(w => longerSet.has(w)).length;
  // 2 shared content words is always a duplicate; otherwise require ≥60% match
  return overlap >= 2 && (overlap === 2 || overlap / meaningful.length >= 0.6);
}

function addPointText(text) {
  text = text.trim();
  if (!text) return;
  const norm = normalisePoint(text);
  const dup = points.find(p => isSimilar(normalisePoint(p), norm));
  if (dup) {
    showToast('That point is already covered — skipping duplicate.', 'warn');
    return;
  }
  points.push(text);
  renderPoints();
}

function removePoint(idx) {
  points.splice(idx, 1);
  renderPoints();
}

function renderPoints() {
  const list = document.getElementById('pointsList');
  list.innerHTML = '';
  if (points.length === 0) {
    list.innerHTML = '<li style="color:var(--neutral);font-size:.88rem;font-style:italic;padding:.25rem 0;">No points added yet</li>';
    return;
  }
  points.forEach((p, i) => {
    const li = document.createElement('li');
    li.className = 'point-item';
    li.innerHTML = `<span>• ${escHtml(p)}</span>
      <button title="Remove" onclick="removePoint(${i})">✕</button>`;
    list.appendChild(li);
  });
}

/* ── Generate script ────────────────────────────────────────── */
function generateScript() {
  if (points.length === 0) {
    showToast('⚠️ Please add at least one point first.');
    return;
  }

  const d        = getDetails();
  const btn      = document.getElementById('generateBtn');
  const statusEl = document.getElementById('aiStatus');

  btn.disabled  = true;
  btn.innerHTML = '<span class="spinner"></span> Generating…';

  setTimeout(() => {
    try {
      const script = generateScriptText(mode, d, points);
      showScript(script);
      showResponses(mode);
      statusEl.textContent = '✅ Script generated — click Regenerate for a different phrasing';
    } catch (e) {
      console.error(e);
      statusEl.textContent = '⚠️ Something went wrong — please try again.';
    }
    btn.disabled  = false;
    btn.innerHTML = '✨ Generate Script';
  }, 80);
}

/* ── Display script ─────────────────────────────────────────── */
function showScript(text) {
  const card = document.getElementById('scriptCard');
  const out  = document.getElementById('scriptOutput');
  const meta = document.getElementById('scriptMeta');

  out.textContent = text;
  out.className   = 'script-output ' + (mode === 'positive' ? 'pos-tinted' : 'neg-tinted');

  // Word count & estimated reading time (avg speaking pace ~130 wpm for careful phone calls)
  const words    = text.trim().split(/\s+/).length;
  const minutes  = Math.floor(words / 130);
  const seconds  = Math.round((words % 130) / 130 * 60);
  const timeStr  = minutes > 0
    ? `~${minutes} min ${seconds > 0 ? seconds + ' sec' : ''}`.trim()
    : `~${seconds} sec`;
  meta.innerHTML = `<span>📝 ${words.toLocaleString()} words</span><span>🕐 Est. call time: ${timeStr}</span>`;

  card.style.display = '';
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function copyScript() {
  const text = document.getElementById('scriptOutput').textContent;
  navigator.clipboard.writeText(text).then(() => showToast('✅ Copied to clipboard!'));
}

function printScript() {
  const d      = getDetails();
  const script = document.getElementById('scriptOutput').textContent;
  const type   = mode === 'positive' ? 'Positive Call' : 'Concern / Follow-up Call';
  const words  = script.trim().split(/\s+/).length;
  const mins   = Math.floor(words / 130);
  const secs   = Math.round((words % 130) / 130 * 60);
  const time   = mins > 0 ? `~${mins} min ${secs > 0 ? secs + ' sec' : ''}`.trim() : `~${secs} sec`;
  const date   = new Date().toLocaleDateString('en-AU', { day:'numeric', month:'long', year:'numeric' });
  const win    = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <title>Phone Script — ${escHtml(d.student)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      body  { font-family: 'Montserrat', Arial, sans-serif; max-width: 700px; margin: 2.5rem auto; color: #041e42; line-height: 1.85; padding: 0 1rem; }
      h1    { font-size: 1.05rem; font-weight: 800; margin-bottom: .2rem; color: #041e42; }
      .meta { font-size: .75rem; color: #697b95; margin-bottom: 1.25rem; border-bottom: 2px solid #99d3e9; padding-bottom: .6rem; display: flex; gap: 1.5rem; flex-wrap: wrap; }
      pre   { white-space: pre-wrap; font-family: inherit; font-size: .93rem; line-height: 1.9; }
      footer{ margin-top: 2rem; border-top: 1px solid #cdd3dc; padding-top: .6rem; font-size: .7rem; color: #9ba7b8; text-align: center; }
      @media print { body { margin: 1rem; } }
    </style>
  </head><body>
    <h1>📞 Phone Script — ${escHtml(d.student)} · ${escHtml(type)}</h1>
    <div class="meta">
      <span>Teacher: ${escHtml(d.teacher)}</span>
      <span>Parent: ${escHtml(d.parent)}</span>
      <span>Class: ${escHtml(d.subject)}</span>
      <span>Date: ${date}</span>
      <span>Est. time: ${time}</span>
    </div>
    <pre>${escHtml(script)}</pre>
    <footer>Callaghan College · Wallsend Campus · PhoneScript · For staff use only · Generated entirely in-browser — no data transmitted</footer>
    <script>window.onload = () => window.print();<\/script>
  </body></html>`);
  win.document.close();
}

function regenerate() {
  const out = document.getElementById('scriptOutput');
  out.style.opacity    = '0.3';
  out.style.transition = 'opacity .15s';
  setTimeout(() => {
    generateScript();
    out.style.opacity = '1';
  }, 150);
}

/* ── Parent response suggestions ────────────────────────────── */
function showResponses(m) {
  const grid = document.getElementById('responsesGrid');
  const card = document.getElementById('responsesCard');
  const list  = m === 'positive' ? RESPONSES_POS : RESPONSES_NEG;
  const cls   = m === 'positive' ? 'pos-card'    : 'neg-card';

  grid.innerHTML = '';
  list.forEach(item => {
    const det = document.createElement('details');
    det.className = 'response-card ' + cls;
    det.innerHTML = `
      <summary>${escHtml(item.q)}</summary>
      <p>${escHtml(item.a).replace(/\[([^\]]+)\]/g, '<em>[$1]</em>')}</p>`;
    grid.appendChild(det);
  });
  card.style.display = '';
}

/* ── Toast notification ─────────────────────────────────────── */
function showToast(msg, style) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('toast-warn');
  if (style === 'warn') t.classList.add('toast-warn');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show', 'toast-warn'), 3000);
}

/* ── Initialise ─────────────────────────────────────────────── */
buildChips('quickPosChips', QUICK_POS);
buildChips('quickNegChips', QUICK_NEG);
renderPoints();
