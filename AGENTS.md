# AGENTS.md – HišniServis

Spletna aplikacija, ki povezuje stanovalce z izvajalci hišnih popravil. Monorepo z dvema ločenima npm projektoma: `frontend/` (React 19 + Vite) in `backend/` (Node.js + Express 5 + MongoDB/Mongoose, JWT). Jezik kode, UI, sporočil API-ja, testov in dokumentacije je **slovenščina**.

## Ukazi

Node.js 24 (enako kot CI). Vsi ukazi se poganjajo iz korena repozitorija.

| Namen | Backend | Frontend |
|---|---|---|
| Namestitev | `npm ci --prefix backend` | `npm ci --prefix frontend` |
| Razvojni zagon | `npm run dev --prefix backend` (potrebuje `backend/.env` in MongoDB) | `npm run dev --prefix frontend` (http://localhost:5173) |
| Lint | `npm run lint --prefix backend` | `npm run lint --prefix frontend` (0 opozoril) |
| Testi | `npm test --prefix backend` | `npm test --prefix frontend` |
| Pokritost | `npm run test:coverage --prefix backend` | `npm run test:coverage --prefix frontend` |
| Gradnja | – | `npm run build --prefix frontend` |

- Lokalna MongoDB: `docker compose up -d mongodb` (replica set, ker izbira ponudbe uporablja transakcije).
- Backend testi **ne potrebujejo** Dockerja ali `.env`: uporabljajo `mongodb-memory-server` (prvi zagon prenese binarko MongoDB).
- Posamezen test: `npx vitest run tests/zgodovina.test.js` v mapi `backend/` oziroma `frontend/`.

## Struktura

```
backend/
  app.js            Express aplikacija (poti, CORS) – uvaža jo tudi test
  server.js         povezava z MongoDB + zagon (bere .env)
  routes/           REST poti: authRoutes, popravila, ponudbe, roleRoutes
  models/           Mongoose sheme: Uporabnik, Popravilo, Ponudba
  middleware/       preveriJWT (req.uporabnik), preveriVlogo(...vloge)
  tests/            Vitest + Supertest; setup.js (baza v pomnilniku), pomocniki.js
frontend/src/
  App.jsx           usmerjanje (react-router) in zaščita poti po vlogah
  config.js         API_URL iz VITE_API_URL
  pages/            strani (.jsx + .css z isto osnovo imena)
  tests/            Vitest + Testing Library; pomocniki.js (zamenjajFetch)
docs/               projektna dokumentacija (glej spodaj)
deploy/             Dockerfile in nginx za Render
.github/workflows/  CI/CD cevovod (lint, build, test, deploy)
.claude/            nastavitve agenta, hooki, skills
```

## Dokumentacija – kdaj jo prebrati

| Datoteka | Preberi, ko … |
|---|---|
| `docs/05-uporabniske-zgodbe.md` | implementiraš funkcionalnost (US-xx in kriteriji sprejemljivosti) |
| `docs/03-podatkovni-model.md` | spreminjaš ali dodajaš Mongoose model (koda ima prednost pred dokumentom) |
| `docs/04-arhitektura-in-tehnoloski-sklad.md`, `docs/adr/` | uvajaš novo knjižnico, vzorec ali arhitekturno spremembo |
| `docs/06-wireframes.md`, `docs/wireframes/` | dodajaš ali spreminjaš stran v UI |
| `docs/07-pregled-projekta.md` | iščeš znane napake in odstopanja od zgodb |
| `docs/specs/NNN-ime/` | delaš na funkcionalnosti po specifikacijskem toku |
| `docs/LOKALNI_ZAGON.md`, `docs/NAMESTITEV-RENDER.md` | zaganjaš aplikacijo ali spreminjaš namestitev |

## Specifikacijski tok

Nova funkcionalnost gre skozi `docs/specs/NNN-ime/`: `spec.md` (zahteve, sprejemni kriteriji) → `plan.md` (tehnični načrt; **počakaj na potrditev uporabnika**) → `tasks.md` (naloge s kljukicami) → implementacija s testi. Vsak sprejemni kriterij mora imeti vsaj en test.

## Konvencije

- **Poimenovanje v slovenščini:** spremenljivke, funkcije, datoteke testov in sporočila (`popravilo`, `ponudba`, `preveriVlogo`, `zamenjajFetch`). camelCase za spremenljivke, PascalCase za React komponente in Mongoose modele, polja modela kot v shemi (`datum_objave`, `predviden_cas`).
- **Statusi** so velike črke: popravilo `ODPRTO → V_TEKU → V_DELU → CAKA_POTRDITEV → ZAKLJUCENO`, ponudba `ODDANA | SPREJETA | ZAVRNJENA`. Vloge: `Stanovalec`, `Izvajalec`, `Administrator`.
- **Backend:** ES moduli (`import`), `async/await` s `try/catch`, odgovor JSON z `message` v slovenščini; kode 400 (validacija, neveljaven ID), 401 (ni prijave), 403 (vloga/lastništvo), 404, 409 (konflikt stanja), 500. Zaščita z `preveriJWT` + `preveriVlogo`. V odgovorih `_id` preslikaj v `id`, ne vračaj `geslo` ali binarnih fotografij. Specifične poti (`/moja`) pred `/:id`.
- **Frontend:** funkcijske komponente in hooki, `fetch` na `${API_URL}/api/...` z `Authorization: Bearer ${token}`, `AbortController` v `useEffect`. Stanje prijave (`uporabnik`, `token`) pride prek props iz `App.jsx`. CSS razredi s predpono strani (`pp-`, `pr-`, `zg-`).
- **Testi:** opis v slovenščini, v `describe` navedi US (npr. `"Zgodovina popravil (US-10)"`). Backend uporablja pomočnike `ustvariUporabnika`, `objaviPopravilo`, `oddajPonudbo`; frontend `zamenjajFetch` in `MemoryRouter`.
- **Git:** veje `feat/…`, `fix/…`, `docs/…`; Conventional Commits v slovenščini (`feat: zgodovina popravil`). V `main` samo prek PR z zelenim cevovodom.

## Pravilo pred oddajo

Preden oznaniš, da je naloga končana, ali predlagaš commit, **zaženi lint in teste za vsak del, ki si ga spremenil**:

```bash
npm run lint --prefix backend && npm test --prefix backend
npm run lint --prefix frontend && npm test --prefix frontend && npm run build --prefix frontend
```

Če kaj pade, popravi in ponovi. Ne utišaj pravil ESLinta (`eslint-disable`) in ne briši ali preskakuj testov (`it.skip`), da bi bil cevovod zelen. Rezultat (število testov) navedi v povzetku.

## Česa ne spreminjaj brez izrecne potrditve uporabnika

- `.github/workflows/` – CI/CD cevovod in zaščita veje `main`.
- `deploy/`, `docker-compose.yml` – namestitev na Render in lokalna baza.
- `.env`, `.env.*` (razen `.env.example`) – skrivnosti; jih tudi **ne beri**.
- `backend/models/` – sprememba sheme je migracija podatkov v obstoječi bazi (Atlas).
- `package.json` odvisnosti in `package-lock.json` – nove knjižnice samo s potrditvijo (in ADR, če gre za večjo odločitev).
- `docs/adr/0001–0007` – sprejete odločitve; spremembo zapiši kot nov ADR.
- `.claude/settings.json`, `.mcp.json` – varnostne omejitve agenta.

## Varnostne omejitve (`.claude/settings.json`)

- **Prepovedano branje/urejanje:** `.env`, `.env.*` (razen primerov), `*.pem`, `*.key`, `id_rsa*`, `~/.ssh`, `~/.aws`.
- **Prepovedani ukazi:** `rm -rf`, `sudo`, `git push --force`/`-f`, `git reset --hard`, `git clean -f`, `git rebase`, `git commit --no-verify`, `curl … | sh`, `npm publish`, branje `.env` prek `cat`/`less`/`head`/`tail`.
- **Zahteva potrditev:** `git push`, `git commit`, `git merge`, `gh pr create/merge`, `npm install` (nove odvisnosti), `docker`, urejanje `.github/workflows/`, `deploy/`, `docker-compose.yml`, `backend/models/`.
- **Dovoljeno brez vprašanja:** lint, testi, build, `git status/diff/log`, branje kode.
- **Hook:** po vsakem `Edit`/`Write` datoteke `.js`/`.jsx` v `frontend/` ali `backend/` se samodejno zažene `eslint --fix` na tej datoteki (`.claude/hooks/lint-spremenjeno.sh`). Napake, ki jih ni mogoče samodejno popraviti, agent dobi kot povratno informacijo in jih mora odpraviti.

## MCP (`.mcp.json`)

- **github** – issues, PR-ji in stanje cevovoda za `mocaales/HisniServis`. Žeton iz okoljske spremenljivke `GITHUB_PERSONAL_ACCESS_TOKEN` (nikoli v datoteki).
- **playwright** – brskalnik za preverjanje UI na http://localhost:5173 po spremembi strani.

## Skills (`.claude/skills/`)

- `nova-api-tocka` – dodajanje REST končne točke v backend s testi.
- `nova-stran` – dodajanje strani v frontend (pot, postavitev, test).
- `pisanje-testov` – konvencije za Vitest/Supertest/Testing Library.
- `pisanje-adr` – nov ADR po predlogi v `docs/adr/`.

## Naučene lekcije

- Express ujame `/moja` kot `/:id`, če je specifična pot definirana za parametrično – vedno jo postavi prej in jo pokrij s testom.
- Vloge `Administrator` ni mogoče registrirati prek API-ja (400) – v testih uporabi `ustvariAdministratorja()` iz `tests/pomocniki.js`.
- Datoteka strani v `pages/` sme izvažati samo komponento (`react-refresh/only-export-components`); skupne konstante daj v ločeno datoteko ali jih ne izvažaj.
- `npm test` v backendu ob prvem zagonu prenese ~100 MB binarke MongoDB; časovne omejitve testov so zato visoke, ne zmanjšuj jih.
