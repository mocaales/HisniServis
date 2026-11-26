# Pregled prevzetega projekta – HišniServis

Pregled je bil izveden 14. 11. 2026 na forku izvornega repozitorija (`jurcek210/HisniServis`, zadnji commit `9ec3951`). Pregledani so bili dokumentacija (`docs/01–06`), arhitekturne odločitve (`docs/adr/0001–0007`), koda backenda in frontenda, aplikacija pa je bila zagnana lokalno po navodilih iz `docs/LOKALNI_ZAGON.md` (MongoDB v Dockerju, Express backend, Vite frontend). Delovanje je bilo preverjeno z ročnimi klici API-ja in v brskalniku (frontend je bil za to začasno usmerjen na lokalni backend na drugih vratih).

## 1. Implementirane funkcionalnosti MVP

Dokument `02-funkcionalnosti-in-obseg.md` za MVP določa šest funkcionalnosti. Vseh šest je implementiranih v backendu (REST API) in frontendu.

| # | Funkcionalnost MVP | Stanje | Backend | Frontend |
|---|---|---|---|---|
| 1 | Objavljanje hišnega popravila | Implementirano | `POST /api/popravila` (multipart, fotografija do 2 MB) | `ObjavaPopravila.jsx` |
| 2 | Pregled in iskanje objavljenih popravil | Implementirano | `GET /api/popravila` (odprta popravila, javno) | `PregledPopravil.jsx` (iskanje, filter kategorije in lokacije, razvrščanje, strani) |
| 3 | Oddaja ponudbe za popravilo | Implementirano | `POST /api/ponudbe` | `PodrobnostiPopravila.jsx` |
| 4 | Pregled in primerjava prejetih ponudb | Implementirano | `GET /api/ponudbe/prejete`, `GET /api/ponudbe/popravilo/:id` | `PrejetePonudbe.jsx` (filter po popravilu, razvrščanje po ceni in času) |
| 5 | Izbira ponudbe | Implementirano, lokalno ne deluje | `PATCH /api/ponudbe/:id/izberi` (transakcija) | `PrejetePonudbe.jsx` |
| 6 | Spreminjanje statusa in potrditev zaključka | Implementirano | `PATCH /api/popravila/:id/status` (`V_TEKU → V_DELU → CAKA_POTRDITEV → ZAKLJUCENO`) | `PotrjenePonudbe.jsx`, `PrejetePonudbe.jsx` |

Poleg MVP so implementirani še registracija in prijava (JWT, bcrypt), zaščita poti po vlogah (Stanovalec, Izvajalec, Administrator) ter urejanje in brisanje lastnih odprtih popravil. Funkcionalnosti 7–14 (termini, ocene, zgodovina, komunikacija, profil izvajalca, moderiranje) niso implementirane, kar je skladno z obsegom MVP.

### Ugotovitve pri pregledu in zagonu

- **Izbira ponudbe ne deluje z lokalno bazo iz `docker-compose.yml`.** Izbira uporablja MongoDB transakcijo, ki zahteva replica set, `docker-compose.yml` pa zažene samostojno instanco. Strežnik vrne `500 Napaka pri izbiri ponudbe.` (v dnevniku: *Transaction numbers are only allowed on a replica set member or mongos*). Na MongoDB, zagnanem kot replica set z enim vozliščem (enako kot pri MongoDB Atlas), celoten postopek deluje.
- **Objava popravila brez lokacije vrne 500.** Backend kliče `lokacija.trim()`, čeprav lokacija ni obvezna. Frontend lokacijo zahteva, zato se napaka pokaže le pri neposrednem klicu API-ja.
- **Fotografije WebP so zavrnjene** zaradi tipkarske napake `"iage/webp"` v seznamu dovoljenih tipov.
- **Naslov API-ja je zapisan v kodi** (`http://localhost:5000` v 8 datotekah frontenda), CORS pa dovoljuje samo `http://localhost:5173`. Aplikacije zato ni mogoče namestiti brez sprememb.
- Na macOS so vrata 5000 privzeto zasedena (AirPlay Receiver), zato je bil backend lokalno zagnan na drugih vratih.
- Projekt nima avtomatskih testov. ESLint za frontend javi 2 napaki in 1 opozorilo, backend linterja nima.
- Podatkovni model v `03-podatkovni-model.md` loči entiteti STANOVALEC in IZVAJALEC, implementacija pa uporablja eno zbirko `Uporabnik` s poljem `vloga`. Model popravila v dokumentu nima polja `lokacija`, ki ga koda uporablja.

## 2. Ustreznost implementacije uporabniškim zgodbam

Pregledanih je bilo pet uporabniških zgodb, ki pokrivajo jedro poslovnega procesa MVP: od objave popravila do izbire ponudbe (US-02 do US-06). Vsak kriterij sprejemljivosti je bil preverjen v kodi in z lokalnim klicem API-ja oziroma v uporabniškem vmesniku.

### US-02: Objava hišnega popravila

| Kriterij | Ocena | Utemeljitev |
|---|---|---|
| 1. Vnos naslova, kategorije in opisa | izpolnjeno | Obrazec ima naslov, kategorijo (izbirni seznam), lokacijo in opis. |
| 2. Zahtevani obvezni podatki pred objavo | izpolnjeno | Frontend preveri polja, backend vrne 400 `Naslov, kategorija in opis so obvezni.` Brez lokacije backend vrne 500 namesto 400 (glej ugotovitve). |
| 3. Objava fotografije | delno izpolnjeno | JPEG in PNG delujeta (do 2 MB, shranjeno v MongoDB). WebP je zaradi napake zavrnjen. |
| 4. Shranjeno in prikazano med odprtimi | izpolnjeno | Novo popravilo ima status `ODPRTO` in se takoj pojavi v `GET /api/popravila`. |

**Sklep:** zgodba je izpolnjena z manjšima napakama (WebP, manjkajoča lokacija v API-ju).

### US-03: Pregled in iskanje popravil

| Kriterij | Ocena | Utemeljitev |
|---|---|---|
| 1. Seznam objavljenih popravil, na voljo za ponudbe | izpolnjeno | `GET /api/popravila` vrne samo popravila s statusom `ODPRTO`, razvrščena od najnovejšega. |
| 2. Filtriranje po kategoriji in lokaciji | izpolnjeno | Filtra in prosto iskanje sta izvedena na frontendu nad prejetim seznamom. |
| 3. Prikaz naslova, kategorije, opisa in lokacije | izpolnjeno | Kartica popravila prikazuje vse štiri podatke. |
| 4. Obvestilo, ko ni rezultatov | izpolnjeno | Prikaže se `Ni popravil, ki ustrezajo iskanju.` |

**Sklep:** zgodba je izpolnjena. Filtriranje poteka na odjemalcu, kar pri večjem številu popravil ne bo skaliralo (ni filtrov v API-ju, ni strežniškega ostranjevanja).

### US-04: Oddaja ponudbe

| Kriterij | Ocena | Utemeljitev |
|---|---|---|
| 1. Vnos cene, opisa in predvidenega časa za odprto popravilo | izpolnjeno | Za neodprta popravila backend vrne 400. |
| 2. Zavrnitev brez obveznih podatkov ali z negativno ceno | izpolnjeno | Preverjeno: negativna cena → 400, manjkajoč opis → 400. |
| 3. Ponudba povezana s popravilom in izvajalcem | izpolnjeno | Ponudba hrani `popravilo` in `izvajalec` (iz JWT). |
| 4. Samo ena ponudba na izvajalca | izpolnjeno | Preverjanje v kodi in unikatni indeks `{popravilo, izvajalec}`; druga oddaja vrne 409. |

**Sklep:** zgodba je v celoti izpolnjena.

### US-05: Primerjava prejetih ponudb

| Kriterij | Ocena | Utemeljitev |
|---|---|---|
| 1. Stanovalec vidi vse ponudbe za svoje popravilo | izpolnjeno | `GET /api/ponudbe/prejete` in `/popravilo/:id`. |
| 2. Cena, čas, opis in podatki o izvajalcu | delno izpolnjeno | Prikazani so cena, čas, opis ter ime in priimek izvajalca. Specializacija in opis izvajalca, ki ju izvajalec vnese ob registraciji, se ne prikažeta. |
| 3. Primerjava na enem mestu | izpolnjeno | Ponudbe so na eni strani, s filtrom po popravilu in razvrščanjem po ceni ali času izvedbe. |
| 4. Ni vpogleda v ponudbe drugih stanovalcev | izpolnjeno | Preverjeno: drug stanovalec dobi 403. |

**Sklep:** zgodba je večinoma izpolnjena. Podatki o izvajalcu so skromni.

### US-06: Izbira ponudbe

| Kriterij | Ocena | Utemeljitev |
|---|---|---|
| 1. Izbira samo ponudbe za svoje popravilo | izpolnjeno | Drug stanovalec dobi 403. |
| 2. Največ ena izbrana ponudba | izpolnjeno | Izbira v transakciji preveri status popravila `ODPRTO` in ga spremeni v `V_TEKU`. |
| 3. Izbrana `SPREJETA`, ostale zavrnjene | izpolnjeno | Preverjeno: izbrana ponudba `SPREJETA`, druga `ZAVRNJENA`. |
| 4. Preprečena druga izbira brez preklica | izpolnjeno | Druga izbira vrne 409. Postopek preklica ni implementiran, zato izbire ni mogoče spremeniti. |

**Sklep:** logika zgodbe je izpolnjena, vendar deluje samo na MongoDB z replica setom (npr. Atlas). Z lokalno bazo iz `docker-compose.yml` izbira vrne 500.

## 3. Povzetek

Vseh šest funkcionalnosti MVP je implementiranih, pregledane uporabniške zgodbe US-02 do US-06 pa so izpolnjene v celoti ali z manjšimi odstopanji (WebP, podatki o izvajalcu, lokalna transakcija). Za prevzem in namestitev so potrebni naslednji popravki, ki so izvedeni v ločenih vejah in pull requestih:

1. Naslov backenda prek okoljske spremenljivke `VITE_API_URL` in CORS prek `CORS_ORIGIN`.
2. Lokalna MongoDB kot replica set z enim vozliščem, da deluje izbira ponudbe.
3. Popravek WebP in neobvezne lokacije.
4. Linter za frontend in backend, avtomatski testi ter CI/CD cevovod z GitHub Actions in namestitvijo na Render.
