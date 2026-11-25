// Shared client code for the practice player, mock builder, essays and question of the day (Environmental Science).
import { iconSvg } from '../lib/icons.js';
export const SCORES_KEY = 'malt-scores';
export async function loadBank() { const r = await fetch('/data/practice.json'); return r.json(); }
export function loadScores() { try { return JSON.parse(localStorage.getItem(SCORES_KEY) || '{}'); } catch { return {}; } }
export function saveScore(topics, earned, total, id) {
  const s = loadScores();
  for (const t of topics) { const row = s[t] || { earned: 0, total: 0, n: 0, ids: [] }; if (row.ids.includes(id)) continue; row.earned += earned; row.total += total; row.n += 1; row.ids.push(id); s[t] = row; }
  try { localStorage.setItem(SCORES_KEY, JSON.stringify(s)); } catch {}
  return s;
}
export function clearScores() { try { localStorage.removeItem(SCORES_KEY); } catch {} }
export function shuffle(a) { for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; }
export function esc(s) { return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

/** Question card. opts.mark adds self-marking (marks for short answers, levels for essays); opts.mcq adds tappable A–E for MCQs. */
export function card(q, opts = {}) {
  const el = document.createElement('article');
  el.className = 'qcard'; el.dataset.id = q.id;
  const pill = q.d ? `<span class="pill pill-${q.d.toLowerCase()}">${q.d}</span>` : '';
  const isMcq = q.f === 'Multiple choice' && q.ans && q.ans.length;
  const isEssay = q.f === 'Essay'; const isLor = q.f === 'Extended response';
  // AQA 7447 essays are marked in five levels of five marks; these are the middle marks of each level.
  const LEVELS = { 25: [[1, 3], [2, 8], [3, 13], [4, 18], [5, 23]] };
  const levels = LEVELS[q.m] || [[1, Math.round(q.m * 0.3)], [2, Math.round(q.m * 0.6)], [3, Math.round(q.m * 0.9)]];
  el.innerHTML = `
    <div class="meta"><strong>${esc(q.s)} · ${esc(q.p)} · Q${esc(q.q)}</strong><span>${q.m} mark${q.m === 1 ? '' : 's'}</span>${q.ao ? `<span>${esc(q.ao)}</span>` : ''}${q.f ? `<span>${esc(q.f)}</span>` : ''}${pill}</div>
    ${q.sm ? `<img class="crop stemcrop" src="${q.sm}" alt="Information for question ${esc(String(q.q).replace(/[.(].*$/, ''))}" decoding="async">` : ''}
    ${q.st && q.st.length ? `<details class="stem"><summary>${iconSvg('file')}Earlier part${q.st.length === 1 ? '' : 's'} of question ${esc(String(q.q).replace(/[.(].*$/, ''))} that this part uses</summary>${q.st.map((c) => `<img class="crop" data-src="${c}" alt="Earlier part of the question" decoding="async">`).join('')}</details>` : ''}
    ${q.c ? `<img class="crop" src="${q.c}" alt="Question ${esc(q.q)}, ${esc(q.s)} ${esc(q.p)}" decoding="async">` : ''}
    ${isMcq && opts.mcq ? `<div class="markrow mcqrow"><span>Your answer:</span>${['A', 'B', 'C', 'D', 'E'].slice(0, q.no || 4).map((L) => `<button class="chip" type="button" data-opt="${L}">${L}</button>`).join('')}</div><p class="text mcqfb" hidden></p>` : ''}
    <div class="actions">
      ${isMcq && !opts.mcq ? `<button class="btn" type="button" data-reveal="ans" aria-expanded="false">${iconSvg('key')}Answer</button>` : ''}
      ${q.ms ? `<button class="btn" type="button" data-reveal="ms" aria-expanded="false">${iconSvg('check')}Mark scheme</button>` : ''}
      ${q.er ? `<button class="btn" type="button" data-reveal="er" aria-expanded="false">${iconSvg('comment')}Examiner's comment</button>` : ''}
    </div>
    ${isMcq ? `<div class="reveal" data-panel="ans" hidden><h4>Answer</h4><p><strong>${q.ans.join(' and ')}</strong></p></div>` : ''}
    ${q.ms ? `<div class="reveal" data-panel="ms" hidden><h4>Mark scheme</h4><div class="ms-wrap"><img class="crop" data-src="${q.ms}" alt="Mark scheme" decoding="async"></div>
      ${opts.mark && !isMcq ? (isEssay
        ? `<div class="markrow"><span>Level you'd award:</span>${levels.map(([l, mk]) => `<button class="chip" type="button" data-mark="${mk}">Level ${l} (${mk - 2}–${mk + 2})</button>`).join('')}<button class="chip" type="button" data-mark="0">0</button></div><p class="muted">Read the level descriptors at the end of the mark scheme, pick the level that fits best, and your score is counted as the middle mark of that level.</p>`
        : `<div class="markrow"><span>Marks you earned:</span>${Array.from({ length: q.m + 1 }, (_, i) => `<button class="chip" type="button" data-mark="${i}">${i}</button>`).join('')}</div>${isLor ? '<p class="muted">Level 1 is 1–3 marks, Level 2 is 4–6, Level 3 is 7–9. Pick the level from the descriptors first, then the mark within it.</p>' : ''}`) : ''}</div>` : ''}
    ${q.er ? `<div class="reveal" data-panel="er" hidden><h4>Examiner's comment</h4><img class="crop" data-src="${q.er}" alt="Examiner's report extract" decoding="async"></div>` : ''}`;
  el.querySelectorAll('[data-reveal]').forEach((btn) => btn.addEventListener('click', () => {
    const panel = el.querySelector(`[data-panel="${btn.dataset.reveal}"]`);
    panel.querySelectorAll('img[data-src]').forEach((img) => { img.src = img.dataset.src; img.removeAttribute('data-src'); });
    const open = panel.hasAttribute('hidden'); panel.toggleAttribute('hidden', !open); btn.setAttribute('aria-expanded', String(open));
  }));
  el.querySelectorAll('details.stem').forEach((d) => d.addEventListener('toggle', () => { if (!d.open) return; d.querySelectorAll('img[data-src]').forEach((img) => { img.src = img.dataset.src; img.removeAttribute('data-src'); }); }, { once: true }));
  el.querySelectorAll('[data-mark]').forEach((b) => b.addEventListener('click', () => {
    el.querySelectorAll('[data-mark]').forEach((x) => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true');
    opts.onMark && opts.onMark(Number(b.dataset.mark));
  }));
  if (isMcq && opts.mcq) {
    const chosen = new Set(); const need = q.ans.length; const fb = el.querySelector('.mcqfb');
    el.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', () => {
      if (fb.textContent) return;
      const L = b.dataset.opt; chosen.has(L) ? chosen.delete(L) : chosen.add(L); b.setAttribute('aria-pressed', String(chosen.has(L)));
      if (chosen.size === need) {
        const right = q.ans.every((a) => chosen.has(a)); fb.hidden = false;
        fb.textContent = right ? `Correct: ${q.ans.join(' and ')}.` : `Not quite: the answer is ${q.ans.join(' and ')}.`;
        opts.onMark && opts.onMark(right ? q.m : 0);
      }
    }));
  }
  return el;
}
export function fmtTime(s) { const m = Math.floor(s / 60), r = s % 60; return `${m}:${String(r).padStart(2, '0')}`; }
