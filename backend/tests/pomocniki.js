import request from "supertest";
import app from "../app.js";

let stevec = 0;

export const api = () => request(app);

export async function ustvariUporabnika(vloga = "Stanovalec") {
  stevec += 1;
  const podatki = {
    ime: "Testni",
    priimek: "Uporabnik",
    email: `uporabnik${stevec}@primer.si`,
    geslo: "Geslo1234",
    telefon: "041123456",
    vloga,
    ...(vloga === "Izvajalec" && {
      specializacija: "Vodovod",
      opis: "Izkušen vodovodar"
    })
  };

  await api().post("/api/auth/register").send(podatki).expect(201);

  const prijava = await api()
    .post("/api/auth/login")
    .send({ email: podatki.email, geslo: podatki.geslo })
    .expect(200);

  return { ...prijava.body.uporabnik, token: prijava.body.token };
}

export function objaviPopravilo(token, polja = {}) {
  const zahteva = api()
    .post("/api/popravila")
    .set("Authorization", `Bearer ${token}`);

  const vrednosti = {
    naslov: "Pokvarjena pipa",
    kategorija: "Vodovod",
    opis: "Pipa v kopalnici pušča.",
    lokacija: "Maribor",
    ...polja
  };

  for (const [kljuc, vrednost] of Object.entries(vrednosti)) {
    if (vrednost !== undefined) zahteva.field(kljuc, vrednost);
  }

  return zahteva;
}

export function oddajPonudbo(token, popravilo, polja = {}) {
  return api()
    .post("/api/ponudbe")
    .set("Authorization", `Bearer ${token}`)
    .send({
      popravilo,
      cena: 120,
      opis: "Zamenjava pipe",
      predviden_cas: 2,
      ...polja
    });
}
