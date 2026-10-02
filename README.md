# AlgoCore Cambridge 9618 Paper 1

Interactive bilingual revision website for Cambridge International AS & A Level Computer Science (9618) Paper 1.

The current public snapshot contains the eight Chapter 1 lessons, interactive models, self-check activities and EN/VI learning content. Sections 2–8 remain visibly marked as planned.

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
- `/paper-1/topics/<lesson-slug>`

Use `?lang=en` or `?lang=vi` for the learning language.

## Repository scope

This repository contains the Paper 1 application source and runtime learning assets. Source coursebook PDFs, private planning files, credentials, build output and dependency folders are not included.

Cambridge International and the referenced qualifications are trademarks of their respective owners. This independent educational project is not endorsed by Cambridge University Press & Assessment. No licence is granted for reuse unless AlgoCore Education provides one separately.
