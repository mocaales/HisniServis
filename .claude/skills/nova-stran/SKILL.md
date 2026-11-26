---
name: nova-stran
description: Postopek za dodajanje nove strani (React komponente na svoji poti) v frontend HišniServis – datoteka v src/pages, CSS, pot in zaščita po vlogi v App.jsx, povezava v meniju in test. Uporabi, ko naloga zahteva nov zaslon, novo pot v usmerjanju ali večjo predelavo obstoječe strani.
---

# Nova stran (frontend)

## 1. Priprava

- Preberi ustrezno zgodbo v `docs/05-uporabniske-zgodbe.md` in wireframe v `docs/06-wireframes.md`, če obstaja.
- Preveri, ali backend končna točka že obstaja (`grep -n "router\." backend/routes/*.js`). Če ne, najprej uporabi skill `nova-api-tocka`.
- Za postavitev vzemi obstoječo stran kot vzor: `PotrjenePonudbe.jsx` (seznam z menijem) ali `ObjavaPopravila.jsx` (obrazec).

## 2. Datoteke

| Datoteka | Vsebina |
|---|---|
| `frontend/src/pages/<Ime>.jsx` | komponenta, `export default` |
| `frontend/src/pages/<Ime>.css` | samo novi razredi s kratko predpono strani (npr. `zg-`) |
| `frontend/src/tests/<Ime>.test.jsx` | test po skillu `pisanje-testov` |

Ime strani v PascalCase in slovenščini (`ZgodovinaPopravil`).

## 3. Komponenta – obvezni vzorci

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PregledPopravil.css";   // skupna postavitev pp-layout/pp-header/pp-sidebar/pp-main
import "./<Ime>.css";
import { API_URL } from "../config";

function Ime({ uporabnik, token }) {
  const [podatki, setPodatki] = useState([]);
  const [nalaganje, setNalaganje] = useState(true);
  const [napaka, setNapaka] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const nalozi = async () => {
      try {
        const response = await fetch(`${API_URL}/api/...`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Napaka pri ...");
        if (!controller.signal.aborted) setPodatki(data.seznam || []);
      } catch (error) {
        if (!controller.signal.aborted) setNapaka(error.message);
      } finally {
        if (!controller.signal.aborted) setNalaganje(false);
      }
    };
    nalozi();
    return () => controller.abort();
  }, [token]);
  ...
}
```

- Nikoli ne zapisuj `http://localhost:5000` – vedno `API_URL`.
- Stanja: nalaganje, napaka (`role="alert"`), prazen seznam (sporočilo), podatki.
- Datumi: `toLocaleDateString("sl-SI")`, cene: `Intl.NumberFormat("sl-SI", { style: "currency", currency: "EUR" })`.
- Vnosna polja imajo `<label htmlFor>` (testi jih iščejo z `getByLabelText`).
- Datoteka strani izvaža **samo** komponento (`export default`). Izvoz konstant sproži `react-refresh/only-export-components`.
- ESLint (`react-hooks`) ne dovoli klicanja `setState` sinhrono v `useEffect` – nastavljaj stanje v asinhroni funkciji.

## 4. Usmerjanje in meni

- V `frontend/src/App.jsx` dodaj `<Route path="/..." element={...} />`. Za eno vlogo uporabi `PreveriPrijavo` z `dovoljenaVloga`; za več vlog preveri `["Stanovalec", "Izvajalec"].includes(prijava.uporabnik?.vloga) && prijava.token`, sicer `<Navigate to="/login" replace />`.
- Dodaj povezavo `<Link className="pp-menu-item">` v stranski meni strani, s katerih naj bo dostopna (najmanj `PregledPopravil.jsx`).

## 5. Preverjanje

```bash
npm run lint --prefix frontend
npm test --prefix frontend
npm run build --prefix frontend
```

Če je na voljo MCP strežnik `playwright` in tečeta backend ter frontend (`npm run dev`), odpri stran na http://localhost:5173 in preveri prikaz ter konzolo brskalnika.
