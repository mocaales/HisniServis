# Načrt 001: Pregled zgodovine popravil

Specifikacija: [spec.md](spec.md). Načrt je pripravil agent (Claude Code), pregleda in potrdi ga razvijalec.

## Pregled rešitve

Nova zaščitena končna točka `GET /api/popravila/moja` vrne popravila glede na vlogo prijavljenega uporabnika. Frontend doda stran `ZgodovinaPopravil` na poti `/zgodovina`, ki seznam prikaže v obliki tabele s filtrom po statusu. Podatkovni model ostane nespremenjen.

## Backend

**Datoteka:** `backend/routes/popravila.js`

```
GET /api/popravila/moja
  preveriJWT → preveriVlogo("Stanovalec", "Izvajalec")
  Stanovalec: Popravilo.find({ stanovalec: req.uporabnik.id })
  Izvajalec:  ids = Ponudba.distinct("popravilo", { izvajalec, status: "SPREJETA" })
              Popravilo.find({ _id: { $in: ids } })
  .select(brez fotografija.data).sort({ datum_objave: -1 }).lean()
  200 { message, stevilo, popravila: [{ id, naslov, kategorija, lokacija,
                                        status, datum_objave, fotografijaDodana }] }
```

- Pot mora biti v datoteki **pred** `router.get("/:id", ...)`, sicer jo Express ujame kot `:id = "moja"`.
- Odgovor 401/403 zagotovita obstoječa middlewara, 500 s slovenskim sporočilom ob nepričakovani napaki.
- Preslikava v odgovor sledi obstoječi `GET /api/popravila` (`id`, `fotografijaDodana`).

**Testi:** `backend/tests/zgodovina.test.js` (Supertest, MongoDB v pomnilniku, pomočniki iz `tests/pomocniki.js`), en `it` na sprejemni kriterij SK-1, SK-3, SK-4, SK-5.

## Frontend

**Nove datoteke:**

- `frontend/src/pages/ZgodovinaPopravil.jsx` – stran z obstoječo postavitvijo (`pp-layout`, `pp-header`, `pp-sidebar`, `pp-main`) iz `PregledPopravil.css`.
- `frontend/src/pages/ZgodovinaPopravil.css` – samo dodatni razredi s predpono `zg-` (tabela, značke statusov).
- `frontend/src/tests/ZgodovinaPopravil.test.jsx` – Testing Library + `zamenjajFetch`.

**Spremembe:**

- `frontend/src/App.jsx` – pot `/zgodovina`, dostopna vlogama Stanovalec in Izvajalec (sicer preusmeritev na `/login`).
- `frontend/src/pages/PregledPopravil.jsx` – povezava »Zgodovina popravil« v stranskem meniju za prijavljenega stanovalca in izvajalca.

**Prikaz statusov** (konstanta `NAZIVI_STATUSOV` v strani):

| Status | Naziv |
|---|---|
| `ODPRTO` | Objavljeno |
| `V_TEKU` | Ponudba sprejeta |
| `V_DELU` | V izvedbi |
| `CAKA_POTRDITEV` | Čaka potrditev |
| `ZAKLJUCENO` | Zaključeno |

Filter statusa je lokalno stanje (`useState`) nad prejetim seznamom.

## Tveganja in odločitve

- **Vrstni red poti** (`/moja` pred `/:id`) – pokrito s testom, ki bi ob napačnem vrstnem redu dobil 400 »Neveljaven ID popravila«.
- **Brez novega ADR:** rešitev ne uvaja nove tehnologije ali vzorca, sledi ADR 0007 (REST API).
- **Brez sprememb CI** (`.github/workflows/`): novi testi se samodejno vključijo v obstoječa `npm run test:coverage`.

## Pregled načrta
