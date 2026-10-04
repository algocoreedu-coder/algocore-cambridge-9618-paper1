# AlgoCore Cambridge 9618 Paper 1

Interactive bilingual revision website for Cambridge International AS & A Level Computer Science (9618) Paper 1.

The current release candidate contains Chapters 1–7: 43 bilingual lessons aligned to the 2026 syllabus, 43 interactive models, 174 requirement-level checks and seven mixed revision sets. Chapter 1 also includes a 55-item learner visual Atlas. Chapters 4, 5, 6 and 7 classify 43, 26, 25 and 6 unique coursebook source pointers respectively while their learner models use original, deterministic diagrams. Section 8 remains visibly marked as planned.

Chapter 1 covers all 17 learning objectives and all 23 atomic requirements in syllabus Sections 1.1–1.3. Chapter 2 covers all 15 learning objectives and all 26 atomic requirements in syllabus Section 2.1. Chapter 3 covers all 13 learning objectives and all 26 atomic requirements in syllabus Sections 3.1–3.2. Chapter 4 covers all 17 learning objectives and all 41 atomic requirements in syllabus Sections 4.1–4.3. Chapter 5 covers all 8 learning objectives and all 24 atomic requirements in syllabus Sections 5.1–5.2. Chapter 6 covers all 9 learning objectives and all 25 atomic requirements in syllabus Sections 6.1–6.2. Chapter 7 covers all 5 learning objectives and all 9 atomic requirements in syllabus Section 7.1. Each lesson follows the same six-stage teaching route: Understand, Observe, Worked example, Recognise, Check and Recall. Visuals used in the teaching route state the learner action and expected observation; supporting coursebook visuals appear after lessons or in the separate Chapter 1 Atlas. Chapter 7 keeps all six coursebook pointers as non-rendered source-alignment records and uses original professional-ethics, licence-comparison and AI-impact fixtures; open judgements use rubric self-review rather than an automatic moral or legal score.

Progress distinguishes lesson availability from learner activity. Opening a hint or solution never marks a lesson reviewed. Deterministic checks require a correct attempt, while open responses require a recorded answer and an explicit rubric review.

## Requirements

- Node.js 22
- npm 10

## Local setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:3018/login`. Configure the class login with:

```text
ALGOCORE_STUDENT_USERNAME
ALGOCORE_STUDENT_PASSWORD
ALGOCORE_SESSION_SECRET
ALGOCORE_COOKIE_SECURE
```

Use a random session secret of at least 32 bytes. Set `ALGOCORE_COOKIE_SECURE=false` for local HTTP development and `true` for HTTPS hosting. `.env.local` is ignored by Git.

## Validation

```bash
npm run verify
```

For the HTTP route check, start a production server with the authentication variables configured, then run:

```bash
npm run check:paper1:http
```

## Routes

- `/login`
- `/paper-1`
- `/paper-1/sections/1`
- `/paper-1/sections/2`
- `/paper-1/sections/3`
- `/paper-1/sections/4`
- `/paper-1/sections/5`
- `/paper-1/sections/6`
- `/paper-1/sections/7`
- `/paper-1/atlas`
- `/paper-1/practice`
- `/paper-1/practice/1`
- `/paper-1/practice/2`
- `/paper-1/practice/3`
- `/paper-1/practice/4`
- `/paper-1/practice/5`
- `/paper-1/practice/6`
- `/paper-1/practice/7`
- `/paper-1/topics/<lesson-slug>`

Use `?lang=en` or `?lang=vi` for the learning language.

## Repository scope

This repository contains the Paper 1 application source and runtime learning assets. Source coursebook PDFs, private planning files, credentials, build output and dependency folders are not included.

Cambridge International and the referenced qualifications are trademarks of their respective owners. This independent educational project is not endorsed by Cambridge University Press & Assessment. No licence is granted for reuse unless AlgoCore Education provides one separately.
