# Naloge 001: Pregled zgodovine popravil

Načrt: [plan.md](plan.md). Naloge se izvajajo po vrsti; po vsaki nalogi agent zažene lint in teste dela, ki ga je spremenil.

## Backend (skill `nova-api-tocka`, `pisanje-testov`)

- [x] **T1** Napiši teste `backend/tests/zgodovina.test.js` za SK-1, SK-3, SK-4, SK-5 (najprej morajo pasti).
- [x] **T2** Dodaj `GET /api/popravila/moja` v `backend/routes/popravila.js` pred `GET /:id`.
- [x] **T3** `npm run lint --prefix backend` in `npm test --prefix backend` – vse zeleno.

## Frontend (skill `nova-stran`, `pisanje-testov`)

- [x] **T4** Napiši teste `frontend/src/tests/ZgodovinaPopravil.test.jsx` za SK-1, SK-2, SK-6, SK-7.
- [x] **T5** Ustvari `frontend/src/pages/ZgodovinaPopravil.jsx` in `ZgodovinaPopravil.css`.
- [x] **T6** Dodaj pot `/zgodovina` v `frontend/src/App.jsx` (Stanovalec, Izvajalec).
- [x] **T7** Dodaj povezavo »Zgodovina popravil« v stranski meni `PregledPopravil.jsx`.
- [x] **T8** `npm run lint --prefix frontend` in `npm test --prefix frontend` – vse zeleno, `npm run build --prefix frontend` uspe.

## Dokumentacija

- [x] **T9** Posodobi tabelo API-ja/funkcionalnosti v `README.md` in število testov v razdelku CI/CD.
- [x] **T10** Označi spec kot implementiran.
