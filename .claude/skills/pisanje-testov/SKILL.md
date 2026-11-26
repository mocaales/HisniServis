---
name: pisanje-testov
description: Konvencije za pisanje testov v projektu HišniServis – backend (Vitest + Supertest + MongoDB v pomnilniku) in frontend (Vitest + Testing Library + jsdom). Uporabi vedno, ko dodajaš ali spreminjaš teste, pokrivaš sprejemne kriterije uporabniške zgodbe ali popravljaš napako, ki potrebuje regresijski test.
---

# Pisanje testov

## Splošno

- En test (`it`) = en sprejemni kriterij ali en robni primer. Opis v slovenščini, v sedanjiku, kaj sistem naredi: `"stanovalec vidi tudi zaključena popravila"`.
- `describe` vsebuje ime funkcionalnosti in US: `describe("Zgodovina popravil (US-10)", ...)`.
- Struktura Pripravi / Izvedi / Preveri, ločena s prazno vrstico.
- Ne uporabljaj `it.only`, `it.skip`, `setTimeout` ali naključnih podatkov.
- Pri delu po specifikaciji v komentar ali opis dodaj oznako kriterija (`SK-3`).

## Backend – `backend/tests/*.test.js`

- `tests/setup.js` samodejno zažene MongoDB replica set v pomnilniku, nastavi `JWT_SECRET` in **po vsakem testu izprazni vse zbirke** – vsak test si podatke pripravi sam.
- Uporabljaj pomočnike iz `tests/pomocniki.js`:

```js
import { api, objaviPopravilo, oddajPonudbo, ustvariAdministratorja, ustvariUporabnika } from "./pomocniki.js";

const stanovalec = await ustvariUporabnika();             // { id, ime, vloga, token }
const izvajalec = await ustvariUporabnika("Izvajalec");
const id = (await objaviPopravilo(stanovalec.token, { naslov: "X" })).body.popravilo.id;
const ponudba = (await oddajPonudbo(izvajalec.token, id)).body.ponudba;

const odgovor = await api()
  .get("/api/popravila/moja")
  .set("Authorization", `Bearer ${stanovalec.token}`);

expect(odgovor.status).toBe(200);
```

- Registracija prek API-ja dovoli samo `Stanovalec` in `Izvajalec`. Za administratorja uporabi `await ustvariAdministratorja()`.
- Stanje, ki ga API ne omogoča neposredno (npr. `ZAKLJUCENO`), nastavi prek modela: `await Popravilo.updateOne({ _id: id }, { status: "ZAKLJUCENO" })`.
- Če potrebuješ nov splošen pomočnik, ga dodaj v `pomocniki.js`, ne kopiraj kode med datotekami.
- Vedno preveri status **in** obliko telesa (`toMatchObject`, `toHaveLength`).

## Frontend – `frontend/src/tests/*.test.jsx`

- Ime: `<Stran>.test.jsx`. Komponento upodobi v `MemoryRouter` (ali `Routes`, če testiraš preusmeritev).
- `fetch` zamenjaj s `zamenjajFetch` iz `./pomocniki` – vsak argument je `[status, telo]` za zaporedni klic:

```jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { zamenjajFetch } from "./pomocniki";

const fetch = zamenjajFetch([200, { popravila: [...] }]);
render(<MemoryRouter><Stran uporabnik={...} token="t" /></MemoryRouter>);

expect(await screen.findByText("Pokvarjena pipa")).toBeInTheDocument();
expect(fetch).toHaveBeenCalledWith(
  "http://localhost:5000/api/popravila/moja",
  expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer t" }) })
);
```

- Elemente iskati po vlogi ali oznaki (`getByRole`, `getByLabelText`), šele nato po besedilu. Ne uporabljaj razredov CSS.
- Interakcije z `userEvent.setup()`, asinhrone rezultate s `findBy*`.
- `setup.js` po vsakem testu počisti DOM, `sessionStorage` in zamenjane globale.

## Zagon

```bash
cd backend  && npx vitest run tests/<ime>.test.js   # posamezna datoteka
cd frontend && npx vitest run src/tests/<Ime>.test.jsx
npm test --prefix backend && npm test --prefix frontend   # vse, pred oddajo
```

Po dodajanju testov posodobi število testov v `README.md` (tabela v razdelku CI/CD).
