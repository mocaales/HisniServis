---
name: nova-api-tocka
description: Postopek za dodajanje ali spreminjanje REST končne točke v Express backendu HišniServis (backend/routes/*.js) skupaj s Supertest testi. Uporabi, ko naloga zahteva nov ali spremenjen API klic (GET/POST/PATCH/DELETE /api/...), novo pot v obstoječem routerju ali nov router.
---

# Nova API končna točka (backend)

Sledi korakom po vrsti. Ne preskakuj testov.

## 1. Umestitev

- Poišči router glede na vir: `popravila` → `backend/routes/popravila.js`, `ponudbe` → `backend/routes/ponudbe.js`, prijava → `authRoutes.js`. Nov vir = nova datoteka v `routes/` in `app.use("/api/<vir>", ...)` v `backend/app.js`.
- **Vrstni red:** specifične poti (`/moja`, `/prejete`) morajo biti v datoteki **pred** parametričnimi (`/:id`), sicer jih Express ujame kot ID.
- Če potrebuješ spremembo v `backend/models/`, se ustavi in vprašaj uporabnika (migracija podatkov).

## 2. Testi najprej

Ustvari ali dopolni `backend/tests/<vir>.test.js` po skillu `pisanje-testov`. Za vsako končno točko pokrij vsaj:

- uspešen primer (pravilna koda in oblika odgovora),
- `401` brez žetona,
- `403` za napačno vlogo ali tujega lastnika,
- `400` za neveljavne podatke / neveljaven ID (če točka sprejema vhod),
- `404` / `409`, kjer je smiselno.

Zaženi `npx vitest run tests/<vir>.test.js` v `backend/` in preveri, da novi testi **padejo**.

## 3. Implementacija – predloga

```js
router.get(
  "/moja",
  preveriJWT,
  preveriVlogo("Stanovalec", "Izvajalec"),
  async (req, res) => {
    try {
      // identiteta vedno iz req.uporabnik (JWT), nikoli iz parametrov
      const podatki = await Model.find({ lastnik: req.uporabnik.id })
        .select("polje1 polje2")   // brez binarnih podatkov in gesel
        .sort({ datum_objave: -1 })
        .lean();

      return res.status(200).json({
        message: "Seznam ... uspešno pridobljen.",
        stevilo: podatki.length,
        seznam: podatki.map((p) => ({ id: p._id, ...})),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Napaka pri ..." });
    }
  }
);
```

Pravila:

- Sporočila (`message`) v slovenščini, celi stavki s piko.
- Validiraj tipe (`typeof x !== "string" || !x.trim()`) in ID-je (`mongoose.isValidObjectId`) → `400`.
- Lastništvo preveri s `dokument.stanovalec.toString() === req.uporabnik.id` → `403`.
- Spremembe statusa z `findOneAndUpdate({ _id, status: trenutni }, ...)` za zaščito pred tekmovanjem → `409`, če vrne `null`.
- `_id` preslikaj v `id`.

## 4. Preverjanje

```bash
npm run lint --prefix backend
npm test --prefix backend
```

Oba morata uspeti. Nato:

- Če točko kliče frontend, nadaljuj s skillom `nova-stran` ali posodobi obstoječo stran.
- Posodobi `README.md` (tabela v razdelku CI/CD: število testov) in, če obstaja, `docs/specs/NNN-*/tasks.md`.
