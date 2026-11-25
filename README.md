# alevelenvironmentalsciencetutor.com

Static Astro site for AQA A-level Environmental Science (7447), deployed on Netlify. Built from the physicsaleveltutor.com template with the `subject-revision-site` skill on 25 November 2026. Tutor: Oliver.

## Run locally
    npm install
    npm run dev        # http://localhost:4321
    npm run build      # writes dist/ (122 pages)

## Deploy
Push to `main` of the linked GitHub repository (`learn-beep/alevelenvironmentalsciencetutor`); Netlify builds with `npm run build` (Node 22) and publishes `dist/`.
Set `CROPS=off` in Netlify's environment to replace every AQA crop with a link to AQA's site.

## Data
- `python3 scripts/export.py --bank <bank working folder> [--images]` reads the Environmental Science bank's working files (`out/*.tagged.json`, `out/PREFIX.json` for the shared figures, `out/img/*.png`, `spec_es.json`, `skills_es.json`: all inside `source.zip` in `Dropbox\Teaching\Environmental Science\AQA\Question Bank`) and writes `src/data/questions.json`, `papers.json`, `topics.json`, `spec.json`, `weighting.json`, and with `--images` the lossless WebP crops under `public/img/<bundle>/` (1,582 crops, 24 MB). It ends by checking that every crop path exists. This bank is not in the `window.QB` format the other sites' export scripts read.
- 14 papers (specimen, November 2020, November 2021, June 2022 to June 2025), 551 parts. June 2019 is not on AQA's public site. Examiner's report crops exist for June 2022 to June 2025 only.
- `topics.json` (repo root) maps specification sections to the 29 site topics and the seven groups; `src/lib/groups.ts` holds the badges, where each section is examined and the motifs.
- Each record carries `stemCrop` (the figure, table or passage the whole question is built on, shown above every part), `contextCrops` (earlier parts a part depends on, folded out), `mcqAnswers` and `mcqOptions` (4 or 5), `features` (`practical`, `maths`, `statistics`) and `skills` (MS, PS, Me, ST codes).
- No AI-written notes from board material are shown: `mistakes` is empty and the examiner's comment is AQA's own crop.
- `site.config.json` holds the site line, WhatsApp wording, exam dates and grade boundaries (copied into `src/data`); `src/data/tutors.json` holds Oliver's profile.

## Pages that differ from the Physics template
- Single board: no board switch, plain `astro build`.
- `/essays/` (25-mark essays, five levels) and `/nine-mark-questions/` (three levels) replace `/six-mark-questions/`.
- `/research-methods/` (Me 1–6, ST 1–6 and PS skills) replaces `/required-practicals/`; `/formula-sheet/` removed.
- `/maths-skills/`: MS 0.1 to MS 4.1.
- `/mock/`: Paper 1 or Paper 2 at 90 seconds a mark: about 40 marks of whole questions, an essay pair, or a full paper (about 95 structured marks plus an essay pair, counted once).
- Question types: Short answer, Data interpretation, Calculation, Practical, Multiple choice, Table completion, Extended response (9 marks), Essay (25 marks); type pages also for practical and statistics features.
- Grade boundaries out of 240 (120 + 120). No AS.

## Content that needs the tutor's check before launch
- The 14 key-term decks in `src/data/decks/` (`"checked": false` shows a "being checked" line).
- The notes on `/research-methods/` and `/maths-skills/` and the level summaries on `/essays/` and `/nine-mark-questions/`.
- Oliver's profile in `src/data/tutors.json`: the bio is from Tom's notes of 25 November 2026 (AQA examiner for five years, teaches at a top sixth-form college), `fee` is `null` (shows "Fee on enquiry") and there is no photo (add `public/tutors/oliver.webp`, 320×320, and set `"photo": "/tutors/oliver.webp"`).

## Upkeep
New papers (AQA publishes each summer's papers the following summer): run the bank pipeline, then `export.py --images`, commit `src/data` and `public/img`. Grade boundaries (`src/data/boundaries.json`) in August; exam dates (`src/data/exams.json`) when AQA updates the timetable.
