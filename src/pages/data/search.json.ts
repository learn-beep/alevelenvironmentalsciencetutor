import { allTopics, allPapers } from '../../lib/data';
import spec from '../../data/spec.json';
const tools = [{"t": "Practice player", "u": "/practice/", "kind": "Tool"}, {"t": "Mini-mock builder", "u": "/mock/", "kind": "Tool"}, {"t": "Question of the day", "u": "/today/", "kind": "Tool"}, {"t": "Spec checklist", "u": "/specification/", "kind": "Tool"}, {"t": "Grade boundaries and calculator", "u": "/grade-boundaries/", "kind": "Tool"}, {"t": "Exam dates", "u": "/exam-dates/", "kind": "Tool"}, {"t": "Revision planner", "u": "/planner/", "kind": "Tool"}, {"t": "What comes up (analysis)", "u": "/analysis/", "kind": "Tool"}, {"t": "What came up in the latest papers", "u": "/what-came-up/", "kind": "Tool"}, {"t": "Every paper as a timeline", "u": "/timeline/", "kind": "Tool"}, {"t": "Hardest questions", "u": "/hardest-questions/", "kind": "Tool"}, {"t": "Tutor", "u": "/tutors/", "kind": "Tool"}, {"t": "Flashcards", "u": "/flashcards/", "kind": "Tool"}, {"t": "25-mark essays", "u": "/essays/", "kind": "Tool"}, {"t": "Nine-mark extended response questions", "u": "/nine-mark-questions/", "kind": "Tool"}, {"t": "Research methods, sampling and fieldwork", "u": "/research-methods/", "kind": "Tool"}, {"t": "Calculations and maths skills", "u": "/maths-skills/", "kind": "Tool"}, {"t": "Define it drill", "u": "/practice/define/", "kind": "Tool"}, {"t": "Data interpretation questions", "u": "/questions/type/data-interpretation/", "kind": "Tool"}, {"t": "Statistics questions", "u": "/questions/type/statistics/", "kind": "Tool"}, {"t": "Practical and fieldwork questions", "u": "/questions/type/practical-questions/", "kind": "Tool"}, {"t": "Multiple-choice questions", "u": "/questions/type/multiple-choice/", "kind": "Tool"}];
export function GET() {
  const items = [
    ...allTopics.map((t) => ({ t: t.name, k: t.group, u: `/questions/${t.slug}/`, kind: 'Topic' })),
    ...allPapers.map((p) => ({ t: `${p.series} ${p.paper}`, k: p.spec, u: `/past-papers/${p.slug}/`, kind: 'Paper' })),
  ...spec.flatMap((s) => s.statements.map((st) => ({ t: `${st.id} ${st.text.slice(0, 80)}`, k: s.title, u: `/questions/${s.topic}/`, kind: 'Spec statement' }))),
    ...tools,
  ];
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
}
