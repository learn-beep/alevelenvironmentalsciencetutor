import { allQuestions, allTopics } from '../../lib/data';
import { cropsOn } from '../../lib/site';
export function GET() {
  const q = allQuestions.map((x) => ({
    id: x.id, t: x.topics, s: x.series, y: x.year, p: x.paper, l: x.level, q: x.question, m: x.marks, f: x.format, ao: x.aoText,
    d: x.difficulty, c: cropsOn ? x.crop : null, ms: cropsOn ? x.msCrop : null, er: cropsOn ? x.erCrop : null, sm: cropsOn ? x.stemCrop : null,
    st: cropsOn && x.contextCrops && x.contextCrops.length ? x.contextCrops : null, old: 0, ans: x.mcqAnswers || null, no: x.mcqOptions || null,
    def: (x.commands || []).includes('Define') || /what is meant by|\bdefine\b/i.test(x.text || '') ? 1 : 0,
    pr: (x.features || []).includes('practical') ? 1 : 0, ma: (x.features || []).includes('maths') ? 1 : 0, sx: (x.features || []).includes('statistics') ? 1 : 0,
    qn: Number(String(x.question).replace(/[.(].*$/, '')), g: x.paperId + '#' + String(x.question).replace(/[.(].*$/, ''), ch: x.choice ? 1 : 0, k: x.series === 'Specimen paper' ? 1 : 0,
  }));
  const topics = allTopics.map((t) => ({ slug: t.slug, name: t.name, paper: t.paper, parts: t.parts }));
  return new Response(JSON.stringify({ q, topics }), { headers: { 'Content-Type': 'application/json' } });
}
