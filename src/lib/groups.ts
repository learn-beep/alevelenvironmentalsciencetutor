// AQA Environmental Science (7447) topic groups: section code, badge, where each is examined and the header motif.
export type Group = { key: string; sec: string; n: number; heading: string; where: string; as: boolean; motif: string };
export const GROUPS: Group[] = [
  { key: 'The living environment', sec: '3.1', n: 1, heading: '3.1 The living environment (Paper 2)', where: 'Paper 2', as: false, motif: 'leaf' },
  { key: 'The physical environment', sec: '3.2', n: 2, heading: '3.2 The physical environment (Paper 1)', where: 'Paper 1', as: false, motif: 'globe' },
  { key: 'Energy resources', sec: '3.3', n: 3, heading: '3.3 Energy resources (Paper 1)', where: 'Paper 1', as: false, motif: 'turbine' },
  { key: 'Pollution', sec: '3.4', n: 4, heading: '3.4 Pollution (Paper 1)', where: 'Paper 1', as: false, motif: 'plume' },
  { key: 'Biological resources', sec: '3.5', n: 5, heading: '3.5 Biological resources (Paper 2)', where: 'Paper 2', as: false, motif: 'crop' },
  { key: 'Sustainability', sec: '3.6', n: 6, heading: '3.6 Sustainability (Paper 2)', where: 'Paper 2', as: false, motif: 'cycle' },
  { key: 'Research methods', sec: '3.7', n: 7, heading: '3.7 Research methods (both papers)', where: 'Paper 1 and Paper 2', as: false, motif: 'stats' },
];
export const groupOf = (key: string): Group => GROUPS.find((g) => g.key === key) || GROUPS[0];
export const badgeText = (key: string) => groupOf(key).sec;
export const badgeClass = (key: string) => `badge badge-${groupOf(key).n}`;
export function whereExamined(t: { slug: string; group: string }): string {
  return groupOf(t.group).where;
}
export const motifFor = (t: { slug: string; group: string }) => {
  if (t.slug.includes('cycle') || t.slug.includes('circular')) return 'cycle';
  if (t.slug.includes('fishing') || t.slug.includes('hydrosphere') || t.slug.includes('water')) return 'wave';
  if (t.slug.includes('dynamic')) return 'energy';
  return groupOf(t.group).motif;
};
