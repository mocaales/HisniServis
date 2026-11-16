# HišniServis

[![CI/CD](https://github.com/mocaales/HisniServis/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/mocaales/HisniServis/actions/workflows/ci-cd.yml)

**Nameščena aplikacija:** [FRONTEND_URL](FRONTEND_URL) · API: [BACKEND_URL/api/health](BACKEND_URL/api/health)

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
| **test** | Vitest za frontend (Testing Library, 11 testov) in backend (Supertest + MongoDB v pomnilniku, 20 testov). Poročilo o pokritosti je artefakt `coverage-report`, povzetek pa je v povzetku zagona. Binarka MongoDB je predpomnjena (`actions/cache`). |
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
- [Lokalni zagon](docs/LOKALNI_ZAGON.md)
- [Namestitev na Render](docs/NAMESTITEV-RENDER.md)
