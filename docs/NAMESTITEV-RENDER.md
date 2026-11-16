# Namestitev na Render (CI/CD)

Cevovod `.github/workflows/ci-cd.yml` ob pushu na `main` aplikacijo samodejno namesti. Ta dokument opisuje enkratno nastavitev zunanjih storitev.

## Pregled

```text
GitHub Actions (main)
  build ──► artefakta frontend-dist, backend-dist
  deploy ─► Docker sliki iz artefaktov ──► ghcr.io/<lastnik>/hisniservis-{backend,frontend}:<sha>
         └► Render deploy hook (?imgURL=…:<sha>) ──► Render Web Service (backend), Render Web Service (frontend)
                                                         │
                                                         └► MongoDB Atlas (M0)
```

| Del | Storitev | Nastavitve |
|---|---|---|
| Podatkovna baza | MongoDB Atlas, brezplačna gruča M0 | Replica set (potreben za transakcije pri izbiri ponudbe) |
| Backend | Render Web Service iz slike `ghcr.io/<lastnik>/hisniservis-backend` | `DB_MODE`, `MONGO_URI_ATLAS`, `JWT_SECRET`, `CORS_ORIGIN` |
| Frontend | Render Web Service iz slike `ghcr.io/<lastnik>/hisniservis-frontend` (nginx) | URL backenda je vgrajen ob gradnji iz `VITE_API_URL` |
| GitHub | Okolje `production` | Secrets `RENDER_DEPLOY_HOOK_BACKEND`, `RENDER_DEPLOY_HOOK_FRONTEND`, spremenljivka `FRONTEND_URL` |
| GitHub | Spremenljivka repozitorija | `VITE_API_URL` (uporablja job `build`, ki ni v okolju) |

Job `deploy` aplikacije ne gradi ponovno: prenese artefakta joba `build` in ju z ukazom `COPY` zapakira v sliki (`deploy/backend/Dockerfile`, `deploy/frontend/Dockerfile`).

## 1. MongoDB Atlas

1. Na <https://cloud.mongodb.com> ustvarite projekt in gručo **M0 (Free)**, regija npr. Frankfurt (`eu-central-1`).
2. **Database Access → Add New Database User**: metoda *Password*, vloga *Read and write to any database*. Geslo shranite.
3. **Network Access → Add IP Address → Allow access from anywhere** (`0.0.0.0/0`). Brezplačne storitve Render nimajo stalnih IP-naslovov.
4. **Connect → Drivers** kopirajte niz in vanj vstavite ime baze:
   `mongodb+srv://UPORABNIK:GESLO@GRUCA.xxxxx.mongodb.net/hisniservis?retryWrites=true&w=majority`
   Posebne znake v geslu kodirajte za URL (npr. `@` → `%40`).

## 2. GitHub: Actions, prvi zagon in slike

1. V forku odprite zavihek **Actions** in kliknite **I understand my workflows, go ahead and enable them**.
2. Združite pull requeste s cevovodom v `main`. Prvi zagon na `main` objavi sliki na GHCR. Namestitev na Render se preskoči z opozorilom, ker deploy hooka še nista nastavljena.
3. Sliki naredite javni, da ju Render lahko prenese: profil → **Packages** → `hisniservis-backend` → **Package settings** → **Change visibility → Public**. Enako za `hisniservis-frontend`.
   Druga možnost: sliki ostaneta zasebni, v Renderju pa dodate *Registry Credential* (GitHub uporabnik + osebni žeton z dovoljenjem `read:packages`).

## 3. Render: backend

1. <https://dashboard.render.com> → **New → Web Service → Existing Image**.
2. Image URL: `ghcr.io/<lastnik>/hisniservis-backend:latest`.
3. Ime npr. `hisniservis-api`, regija **Frankfurt**, instance **Free**.
4. **Environment Variables:**

   | Ključ | Vrednost |
   |---|---|
   | `DB_MODE` | `atlas` |
   | `MONGO_URI_ATLAS` | niz iz koraka 1.4 |
   | `JWT_SECRET` | dolg naključen niz, npr. izhod `openssl rand -hex 32` |
   | `CORS_ORIGIN` | zaenkrat `http://localhost:5173`, v koraku 4 URL frontenda |

   `PORT` nastavi Render sam (10000).
5. **Advanced → Health Check Path:** `/api/health`. Ustvarite storitev.
6. Ko je storitev aktivna, preverite `https://<backend>.onrender.com/api/health`. Pričakovan je odgovor `"database":"Povezana"`.
7. **Settings → Deploy Hook**: kopirajte URL. Je skrivnost, zato ga ne objavljajte.

## 4. Render: frontend

1. **New → Web Service → Existing Image**, Image URL `ghcr.io/<lastnik>/hisniservis-frontend:latest`.
2. Ime npr. `hisniservis`, regija **Frankfurt**, instance **Free**, Health Check Path `/`.
3. Po ustvarjanju kopirajte URL (`https://<frontend>.onrender.com`) in **Settings → Deploy Hook**.
4. Pri **backend** storitvi nastavite `CORS_ORIGIN` na URL frontenda (brez `/` na koncu) in shranite (Save, rebuild and deploy).

## 5. GitHub: okolje, secrets in spremenljivke

1. **Settings → Environments → New environment** z imenom `production`.
   - **Deployment branches and tags → Selected branches and tags → Add rule:** `main`.
   - **Environment secrets:**
     - `RENDER_DEPLOY_HOOK_BACKEND`: deploy hook backenda;
     - `RENDER_DEPLOY_HOOK_FRONTEND`: deploy hook frontenda.
   - **Environment variables:** `FRONTEND_URL` = `https://<frontend>.onrender.com`.
2. **Settings → Secrets and variables → Actions → Variables → New repository variable:** `VITE_API_URL` = `https://<backend>.onrender.com`, brez `/` na koncu. To mora biti spremenljivka repozitorija, ker jo bere job `build`.
3. **Actions →** zadnji zagon na `main` → **Re-run all jobs**. Frontend se zdaj zgradi z naslovom backenda, `deploy` pa sproži oba deploy hooka in preveri dostopnost.

## 6. Zaščita veje `main`

**Settings → Branches → Add classic branch protection rule**, Branch name pattern `main`:

- **Require a pull request before merging**;
- **Require status checks to pass before merging** in **Require branches to be up to date before merging**; v iskalniku dodajte `lint`, `build` in `test` (prikažejo se, ko se cevovod enkrat zažene);
- po želji **Do not allow bypassing the above settings**.

Job `deploy` ni obvezna preverba, ker se na pull requestih ne izvaja.

## 7. Preverjanje

- README prikazuje značko zadnjega zagona na `main`.
- `https://<frontend>.onrender.com` odpre aplikacijo; registracija, objava popravila, ponudba in izbira delujejo.
- Brezplačne storitve Render se po 15 minutah nedejavnosti ustavijo, zato prvi obisk traja do minute.

## Pogoste težave

| Težava | Rešitev |
|---|---|
| Render: `unauthorized` pri prenosu slike | Paket na GHCR ni javen ali manjka *Registry Credential*. |
| Brskalnik: napaka CORS | `CORS_ORIGIN` na backendu se mora natančno ujemati z URL-jem frontenda (shema, brez `/`). |
| Frontend kliče `localhost:5000` | `VITE_API_URL` ni nastavljena kot spremenljivka repozitorija; nastavite jo in ponovno zaženite cevovod. |
| `deploy`: `Render (backend): HTTP 4xx` | Deploy hook v okolju `production` je napačen ali je bil ponovno ustvarjen. |
| Backend se ne zažene | V dnevniku Render preverite `MONGO_URI_ATLAS` in `JWT_SECRET` ter ali Atlas dovoljuje dostop z `0.0.0.0/0`. |
