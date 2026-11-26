# HišniServis

[![CI/CD](https://github.com/mocaales/HisniServis/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/mocaales/HisniServis/actions/workflows/ci-cd.yml)

**Nameščena aplikacija:** [hisniservis-frontend.onrender.com](https://hisniservis-frontend.onrender.com) · API: [hisniservis-backend.onrender.com/api/health](https://hisniservis-backend.onrender.com/api/health)

## Opis projekta

HišniServis je spletna aplikacija, ki povezuje stanovalce z izvajalci hišnih popravil. Stanovalcem omogoča objavo popravil, prejemanje in primerjavo ponudb ter izbiro izvajalca. Izvajalci lahko iščejo objavljena popravila in oddajajo ponudbe, administrator pa skrbi za upravljanje in moderiranje platforme.

## Uporabljene tehnologije

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Podatkovna baza:** MongoDB
- **Dostop do podatkovne baze:** Mongoose
- **Avtentikacija:** JSON Web Tokens (JWT)
- **Zgoščevanje gesel:** bcrypt
- **Paketni upravljalnik:** npm
- **Razvojna orodja:** Visual Studio Code, Git, GitHub

## CI/CD cevovod

Cevovod [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) (GitHub Actions) se zažene ob vsakem pull requestu v `main` in ob vsakem pushu na `main`. Spremembe se razvijajo v ločenih vejah in v `main` združujejo prek pull requestov; veja `main` zahteva uspešne preverbe `lint`, `build` in `test`.

| Faza | Kaj naredi |
|---|---|
| **lint** | ESLint za frontend (`frontend/eslint.config.js`) in backend (`backend/eslint.config.js`). Vsaka napaka ali opozorilo podre job. |
| **build** | Zgradi frontend (`vite build`, URL backenda iz spremenljivke `VITE_API_URL`) in pripravi paket backenda s produkcijskimi odvisnostmi. Odvisnosti npm so predpomnjene (`actions/setup-node`, `cache: npm`). Rezultata sta artefakta `frontend-dist` in `backend-dist`. |
| **test** | Vitest za frontend (Testing Library, 15 testov) in backend (Supertest + MongoDB v pomnilniku, 25 testov). Poročilo o pokritosti je artefakt `coverage-report`, povzetek pa je v povzetku zagona. Binarka MongoDB je predpomnjena (`actions/cache`). |
| **deploy** | Samo ob pushu na `main` in ko `lint`, `build` in `test` uspejo. V okolju `production` prenese artefakta iz joba build, ju brez ponovne gradnje zapakira v Docker sliki (`deploy/`), ju objavi na GitHub Container Registry in prek deploy hookov namesti na Render. Na koncu preveri, ali sta frontend in `/api/health` dostopna. |

Namestitev: frontend in backend sta ločeni storitvi Render (Docker slike), podatkovna baza je MongoDB Atlas. Navodila za nastavitev so v [docs/NAMESTITEV-RENDER.md](docs/NAMESTITEV-RENDER.md), lokalni zagon pa v [docs/LOKALNI_ZAGON.md](docs/LOKALNI_ZAGON.md).

## Dokumentacija

- [Zasnova rešitve](docs/01-zasnova-resitve.md)
- [Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
- [Podatkovni model](docs/03-podatkovni-model.md)
- [Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
- [Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
- [Wireframes](docs/06-wireframes.md)
- [Pregled prevzetega projekta](docs/07-pregled-projekta.md)
- [Arhitekturne odločitve (ADR)](docs/adr/)
- [Specifikacije funkcionalnosti](docs/specs/)
- [Lokalni zagon](docs/LOKALNI_ZAGON.md)
- [Namestitev na Render](docs/NAMESTITEV-RENDER.md)

## Agentno programiranje

Projekt je pripravljen za delo s kodirnim agentom **[Claude Code](https://docs.claude.com/en/docs/claude-code/overview)** (Anthropic). Agent v repozitoriju najde navodila, kontekst, ponovljive postopke, povratne informacije (lint, testi) in dostop do zunanjih sistemov (MCP).

### Zagon

```bash
npm install -g @anthropic-ai/claude-code   # enkratna namestitev (Node.js 18+)
npm ci --prefix backend && npm ci --prefix frontend
export GITHUB_PERSONAL_ACCESS_TOKEN=...    # za MCP strežnik github (fine-grained PAT, samo ta repozitorij)
claude                                     # v korenu repozitorija
```

Ob prvem zagonu Claude Code vpraša za zaupanje projektu in odobritev MCP strežnikov iz `.mcp.json`. Stanje strežnikov preverite z ukazom `/mcp`, naložena navodila z `/memory`, skills pa se prikažejo v `/skills`. Primer naloge: *»Implementiraj docs/specs/001-zgodovina-popravil po tasks.md.«*

### Datoteke za agenta

| Datoteka | Namen |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Glavna navodila: ukazi (namestitev, zagon, lint, testi), struktura, kdaj brati katero dokumentacijo, konvencije, pravilo »lint + testi pred oddajo«, prepovedana območja in varnostne omejitve. |
| [`CLAUDE.md`](CLAUDE.md) | Samo `@AGENTS.md` – Claude Code tako naloži ista navodila. |
| [`.claude/settings.json`](.claude/settings.json) | Dovoljeni, prepovedani (`rm -rf`, `git push --force`, branje `.env`, ključev …) in potrjevanja potrebni ukazi ter urejanje (`.github/workflows/`, `deploy/`, modeli). Hook `PostToolUse`. |
| [`.claude/hooks/lint-spremenjeno.sh`](.claude/hooks/lint-spremenjeno.sh) | Po vsakem urejanju `.js`/`.jsx` v `frontend/` ali `backend/` zažene `eslint --fix` na tej datoteki; preostale napake vrne agentu. |
| [`.claude/skills/`](.claude/skills/) | Ponovljivi postopki: `nova-api-tocka`, `nova-stran`, `pisanje-testov`, `pisanje-adr` (s skripto `nov-adr.sh`). |
| [`.mcp.json`](.mcp.json) | MCP strežnika `github` (issues, PR, stanje CI; žeton iz `GITHUB_PERSONAL_ACCESS_TOKEN`) in `playwright` (preverjanje UI v brskalniku). |
| [`docs/specs/`](docs/specs/) | Specifikacijski tok `spec.md` → `plan.md` → `tasks.md` za posamezno funkcionalnost (npr. [001 – zgodovina popravil](docs/specs/001-zgodovina-popravil/)). |
| [`docs/`](docs/) | Uporabniške zgodbe, podatkovni model, arhitektura, ADR, wireframes – agent jih bere po tabeli v `AGENTS.md`. |
