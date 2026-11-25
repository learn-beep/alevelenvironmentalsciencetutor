#!/usr/bin/env python3
"""Export the AQA Environmental Science (7447) question bank into the site's data files.

  python3 scripts/export.py --bank /path/to/es [--images]

--bank is the bank's working folder: out/*.tagged.json, out/PREFIX.json (stems), out/img/*.png,
spec_es.json, skills_es.json. Writes src/data/{questions,papers,topics,spec,weighting}.json and,
with --images, public/img/<bundle>/*.webp.
"""
import argparse, glob, json, os, re, sys
from collections import Counter, defaultdict
from concurrent.futures import ProcessPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERIES = {'JUN': 'June', 'NOV': 'November', 'SAM': 'Specimen'}

def clean(t):
    t = re.sub(r'\s+', ' ', t or '').strip()
    t = re.sub(r'^(\d ){2}(\. \d )?', '', t)            # "0 6 . 2 " question label
    t = re.sub(r'Question \d+ continues on the next page', '', t)
    t = re.sub(r'Shade (one|the) (box|lozenge)[^.]*\.', '', t)
    return t.strip()

def webp(job):
    src, dst = job
    from PIL import Image
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src): return 0
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    Image.open(src).convert('RGB').save(dst, 'WEBP', lossless=True, method=4)
    return 1

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--bank', required=True); ap.add_argument('--images', action='store_true')
    a = ap.parse_args(); B = a.bank
    cfg = json.load(open(os.path.join(ROOT, 'topics.json')))
    S = json.load(open(os.path.join(B, 'spec_es.json'))); SK = json.load(open(os.path.join(B, 'skills_es.json')))
    heads = S['heads']; stmts = S['stmts']
    groups = {g['sec']: g for g in cfg['groups']}
    prefixes = sorted(((sec, t) for t in cfg['topics'] for sec in t['secs']), key=lambda x: -len(x[0]))
    def topic_of(sec):
        for p, t in prefixes:
            if sec == p or sec.startswith(p + '.'): return t
        return None
    st_by_id = {s['id']: s for s in stmts}
    for s in stmts:
        if not topic_of(s['sec']): sys.exit('no topic for ' + s['sec'])

    questions, papers, jobs = [], [], []
    by_paper = defaultdict(Counter)
    for f in sorted(glob.glob(os.path.join(B, 'out', '*.tagged.json'))):
        d = json.load(open(f)); pre = d['prefix']; raw = json.load(open(f.replace('.tagged', '')))
        stems = raw.get('stems', {})
        tag, code = pre.split('_'); kind = 'specimen' if tag.startswith('SAM') else 'exam'
        year = 2000 + int(tag[3:]); n = code[-1]
        series = 'Specimen paper' if kind == 'specimen' else f"{SERIES[tag[:3]]} {year}"
        pid = f"7447-{n}-{tag}"
        img = lambda name: f"/img/{pre}/{name[:-4]}.webp" if name else None
        labels = {p['label']: p for p in d['parts']}
        ids = []
        for p in d['parts']:
            qn = str(int(p['label'].split('.')[0])); question = qn + ('.' + p['label'].split('.')[1] if '.' in p['label'] else '')
            A = [x for x in p['A'] if x in st_by_id]; C = [x for x in p['C'] if x in st_by_id]
            tslugs = []
            for x in A or C:
                s = topic_of(st_by_id[x]['sec'])['slug']
                if s not in tslugs: tslugs.append(s)
            ao = p.get('ao') or {}
            text = clean(p['text'])
            stem = stems.get(qn) or stems.get(str(p['q']))
            ctx = [img(labels[c]['qp_img']) for c in p.get('context') or [] if c in labels and labels[c].get('qp_img')]
            skills = [{'code': s, 'text': SK.get(s, '')} for s in p.get('skills') or []]
            feats = []
            if p['type'] == 'Practical' or any(s['code'].startswith(('Me', 'ST')) for s in skills): feats.append('practical')
            if any(s['code'].startswith('MS') for s in skills): feats.append('maths')
            if any(s['code'] == 'Me 6' or s['code'] in ('MS 1.9', 'MS 1.10') for s in skills): feats.append('statistics')
            mcq = p['type'] == 'Multiple choice' and p.get('key')
            rec = {
                'id': f"{pid}-{p['label']}", 'paperId': pid, 'bundle': pre, 'series': series, 'year': year, 'spec': '7447',
                'paper': f"Paper {n}", 'paperName': None, 'question': question, 'marks': p['marks'], 'level': 'A level',
                'difficulty': p['difficulty'] if p.get('difficulty') in ('Easy', 'Medium', 'Hard') else None, 'facility': None,
                'topics': tslugs, 'statements': A, 'context': C,
                'ao': [ao.get('AO1', 0), ao.get('AO2', 0), ao.get('AO3', 0)],
                'aoText': ','.join(f"{k} {v}" for k, v in ao.items()) if ao else None,
                'format': p['type'], 'commands': p['command'] if isinstance(p['command'], list) else [p['command']],
                'features': feats, 'skills': skills, 'choice': 'either' if p['type'] == 'Essay' else None,
                'sourceLines': '', 'mistakes': [], 'text': text, 'msText': '', 'erText': '',
                'stemId': f"{pid}-Q{qn}" if stem else None, 'stemText': clean(stem['text']) if stem else '',
                'stemCrop': img(stem['img']) if stem else None, 'contextCrops': ctx, 'familiar': None,
                'crop': img(p.get('qp_img')), 'msCrop': img(p.get('ms_img')), 'erCrop': img(p.get('er_img')),
                'msBands': [], 'lds': False, 'notCurrentSpec': False, 'specNote': '',
                'mcqAnswers': [p['key']] if mcq else None,
                'mcqOptions': (5 if re.search(r'\bD\b.*\sE\s', p['text']) else 4) if mcq else None,
            }
            questions.append(rec); ids.append(rec['id'])
            for sec3 in {'.'.join(st_by_id[x]['sec'].split('.')[:3]) for x in A}: by_paper[pid][sec3] += p['marks']
        papers.append({'id': pid, 'bundle': pre, 'series': series, 'year': year, 'qual': 'A-level', 'spec': '7447', 'paperNo': '0' + n,
                       'paper': f"Paper {n}", 'name': None, 'total': 120, 'source': 'AQA', 'kind': kind, 'files': {},
                       'slug': f"{series.lower().replace(' ', '-')}-7447-0{n}", 'questions': ids})
        for png in glob.glob(os.path.join(B, 'out', 'img', pre + '_*.png')):
            jobs.append((png, os.path.join(ROOT, 'public', 'img', pre, os.path.basename(png)[:-4] + '.webp')))
    papers.sort(key=lambda p: (p['kind'] != 'exam', -p['year'], p['paperNo']))
    order = {p['id']: i for i, p in enumerate(papers)}
    questions.sort(key=lambda q: order[q['paperId']])

    topics = []
    for t in cfg['topics']:
        sts = [s for s in stmts if topic_of(s['sec']) is t]
        g = groups['.'.join(t['secs'][0].split('.')[:2])]
        qs = [q for q in questions if t['slug'] in q['topics']]
        topics.append({'slug': t['slug'], 'name': t['name'], 'group': g['key'], 'strand': g['key'], 'paper': g['key'],
                       'code': ', '.join(t['secs']), 'option': None, 'statements': [s['id'] for s in sts],
                       'statementText': {s['id']: s['content'] + ((' ' if s['content'].rstrip().endswith(('.', ':')) else ': ') + s['info'] if s['info'] else '') for s in sts},
                       'statementShort': {s['id']: '' for s in sts}, 'asStatements': [], 'levels': {s['id']: None for s in sts},
                       'parts': len(qs), 'marks': sum(q['marks'] for q in qs),
                       'essays': sum(q['format'] in ('Essay', 'Extended response') for q in qs),
                       'mcq': sum(q['format'] == 'Multiple choice' for q in qs),
                       'papers': sorted({q['paper'] for q in qs}), 'asOrA': 'A level'})

    spec = []
    for sec, title in heads.items():
        sts = [s for s in stmts if s['sec'] == sec]
        if not sts: continue
        t = topic_of(sec); g = groups['.'.join(sec.split('.')[:2])]
        parent = '.'.join(sec.split('.')[:3])
        spec.append({'code': sec, 'title': title, 'paper': g['paper'], 'option': None, 'area': heads.get(parent) if parent != sec else None,
                     'theme': None, 'module': int(sec.split('.')[1]), 'aLevelOnly': False, 'topic': t['slug'],
                     'statements': [{'id': s['id'], 'short': '', 'text': s['content'], 'guidance': s['info'], 'level': None, 'points': None,
                                     'page': s['page'], 'aLevelPart': None, 'as': False, 'topics': [t['slug']]} for s in sts]})
    areas = {}
    for s in stmts:
        k = '.'.join(s['sec'].split('.')[:3]); areas.setdefault(k, heads[k])
    out = os.path.join(ROOT, 'src', 'data')
    for name, data in (('questions', questions), ('papers', papers), ('topics', topics), ('spec', spec),
                       ('weighting', {'areas': areas, 'byPaper': {k: dict(v) for k, v in by_paper.items()}})):
        json.dump(data, open(os.path.join(out, name + '.json'), 'w'), ensure_ascii=False, indent=0)
    print(len(questions), 'parts', len(papers), 'papers', len(topics), 'topics', sum(len(s['statements']) for s in spec), 'statements')
    print('no topic:', [q['id'] for q in questions if not q['topics']])
    for t in topics: print(f"  {t['parts']:4d} {t['slug']}")
    if a.images:
        with ProcessPoolExecutor() as ex: n = sum(ex.map(webp, jobs, chunksize=20))
        print('images written', n, 'of', len(jobs))
    missing = [q[k] for q in questions for k in ('crop', 'msCrop', 'erCrop', 'stemCrop') if q[k] and not os.path.exists(os.path.join(ROOT, 'public', q[k].lstrip('/')))]
    missing += [c for q in questions for c in q['contextCrops'] if not os.path.exists(os.path.join(ROOT, 'public', c.lstrip('/')))]
    print('missing crops:', len(missing), missing[:5])

if __name__ == '__main__':
    main()
