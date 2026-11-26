import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PregledPopravil.css";
import "./PrejetePonudbe.css";
import "./ZgodovinaPopravil.css";

import { API_URL } from "../config";

// Berljivi nazivi statusov popravila (US-10, US-11).
const NAZIVI_STATUSOV = {
  ODPRTO: "Objavljeno",
  V_TEKU: "Ponudba sprejeta",
  V_DELU: "V izvedbi",
  CAKA_POTRDITEV: "Čaka potrditev",
  ZAKLJUCENO: "Zaključeno",
};

const oblikujDatum = (vrednost) =>
  vrednost
    ? new Date(vrednost).toLocaleDateString("sl-SI")
    : "Ni navedeno";

function ZgodovinaPopravil({ uporabnik, token }) {
  const [popravila, setPopravila] = useState([]);
  const [nalaganje, setNalaganje] = useState(true);
  const [napaka, setNapaka] = useState("");
  const [status, setStatus] = useState("");

  const vloga = uporabnik?.vloga;

  useEffect(() => {
    const controller = new AbortController();

    const nalozi = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/popravila/moja`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Napaka pri pridobivanju zgodovine popravil."
          );
        }

        if (!controller.signal.aborted) {
          setPopravila(data.popravila || []);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setNapaka(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setNalaganje(false);
        }
      }
    };

    nalozi();

    return () => controller.abort();
  }, [token]);

  const prikazana = status
    ? popravila.filter((popravilo) => popravilo.status === status)
    : popravila;

  const steviloZakljucenih = popravila.filter(
    (popravilo) => popravilo.status === "ZAKLJUCENO"
  ).length;

  return (
    <div className="pp-layout">

      {/* ZGORNJA NAVIGACIJA */}
      <header className="pp-header">
        <Link to="/popravila" className="pp-brand">
          <span className="pp-brand-icon">⌂</span>
          <strong>HišniServis</strong>
          <span className="pp-brand-subtitle">
            Delovni prostor
          </span>
        </Link>

        <div className="pp-header-right">
          <span className="pp-vloga">
            {uporabnik?.ime} · {vloga}
          </span>
        </div>
      </header>

      {/* STRANSKI MENI */}
      <aside className="pp-sidebar">
        <div className="pp-sidebar-content">
          <div className="pp-sidebar-title">
            DELO IN POPRAVILA
          </div>

          <Link to="/popravila" className="pp-menu-item">
            <span>▤</span> Razpoložljiva popravila
          </Link>

          {vloga === "Stanovalec" && (
            <Link to="/stanovalec/ponudbe" className="pp-menu-item">
              <span>✉</span> Prejete ponudbe
            </Link>
          )}

          {vloga === "Izvajalec" && (
            <Link to="/izvajalec/ponudbe" className="pp-menu-item">
              <span>✓</span> Potrjene ponudbe
            </Link>
          )}

          <Link to="/zgodovina" className="pp-menu-item active">
            <span>◷</span> Zgodovina popravil
          </Link>
        </div>

        <div className="pp-sidebar-bottom">
          <strong>Pregled preteklih del</strong>
          <p>
            {vloga === "Izvajalec"
              ? "Popravila, za katera je bila izbrana vaša ponudba."
              : "Vsa popravila, ki ste jih objavili."}
          </p>
        </div>
      </aside>

      {/* GLAVNA VSEBINA */}
      <main className="pp-main">
        <div className="pp-breadcrumb">
          Delovni prostor
          <span>›</span>
          Zgodovina popravil
        </div>

        <div className="pp-heading">
          <h1>Zgodovina popravil</h1>
          <p>
            Preverite pretekla in tekoča popravila ter njihove statuse.
          </p>
        </div>

        <div className="pr-stats">
          <div className="pr-stat-card">
            <span>Vsa popravila</span>
            <strong>{popravila.length}</strong>
          </div>

          <div className="pr-stat-card">
            <span>Zaključena</span>
            <strong>{steviloZakljucenih}</strong>
          </div>
        </div>

        <div className="pp-filters">
          <div className="pp-filters-row">
            <div className="pp-field zg-status-field">
              <label htmlFor="zg-status">Status</label>
              <select
                id="zg-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Vsi statusi</option>
                {Object.entries(NAZIVI_STATUSOV).map(
                  ([vrednost, naziv]) => (
                    <option key={vrednost} value={vrednost}>
                      {naziv}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>

        {napaka && (
          <div className="pp-alert pp-error" role="alert">
            {napaka}
          </div>
        )}

        <section className="pr-results">
          {nalaganje ? (
            <div className="pr-empty">Nalaganje zgodovine...</div>
          ) : napaka ? null : popravila.length === 0 ? (
            <div className="pr-empty">Zgodovina je prazna.</div>
          ) : prikazana.length === 0 ? (
            <div className="pr-empty">
              Ni popravil z izbranim statusom.
            </div>
          ) : (
            <table className="zg-tabela">
              <thead>
                <tr>
                  <th scope="col">Naslov</th>
                  <th scope="col">Kategorija</th>
                  <th scope="col">Datum objave</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="zg-skrito">Podrobnosti</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {prikazana.map((popravilo) => (
                  <tr key={popravilo.id}>
                    <td>
                      <strong>{popravilo.naslov}</strong>
                      <small>
                        {popravilo.lokacija || "Lokacija ni navedena"}
                      </small>
                    </td>
                    <td>{popravilo.kategorija}</td>
                    <td>{oblikujDatum(popravilo.datum_objave)}</td>
                    <td>
                      <span
                        className={`zg-status zg-status-${popravilo.status.toLowerCase()}`}
                      >
                        {NAZIVI_STATUSOV[popravilo.status] ||
                          popravilo.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/popravila/${popravilo.id}`}>
                        Podrobnosti ›
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

export default ZgodovinaPopravil;
