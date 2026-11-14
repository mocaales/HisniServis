import { describe, expect, it } from "vitest";
import { api, objaviPopravilo, ustvariUporabnika } from "./pomocniki.js";

describe("Objava in pregled popravil (US-02, US-03)", () => {
  it("stanovalec objavi popravilo, ki se pojavi med odprtimi", async () => {
    const { token } = await ustvariUporabnika();

    const objava = await objaviPopravilo(token);
    expect(objava.status).toBe(201);
    expect(objava.body.popravilo.status).toBe("ODPRTO");

    const seznam = await api().get("/api/popravila").expect(200);
    expect(seznam.body.stevilo).toBe(1);
    expect(seznam.body.popravila[0]).toMatchObject({
      naslov: "Pokvarjena pipa",
      kategorija: "Vodovod",
      lokacija: "Maribor"
    });
  });

  it("zavrne objavo brez obveznih podatkov", async () => {
    const { token } = await ustvariUporabnika();

    const odgovor = await objaviPopravilo(token, { opis: "   " });

    expect(odgovor.status).toBe(400);
  });

  it("izvajalec ne sme objaviti popravila", async () => {
    const { token } = await ustvariUporabnika("Izvajalec");

    const odgovor = await objaviPopravilo(token);

    expect(odgovor.status).toBe(403);
  });

  it("dovoli objavo brez neobvezne lokacije", async () => {
    const { token } = await ustvariUporabnika();

    const odgovor = await objaviPopravilo(token, { lokacija: undefined });

    expect(odgovor.status).toBe(201);
    expect(odgovor.body.popravilo.lokacija).toBeNull();
  });

  it("sprejme fotografijo v formatu WebP", async () => {
    const { token } = await ustvariUporabnika();

    const odgovor = await objaviPopravilo(token).attach(
      "fotografija",
      Buffer.from("RIFF0000WEBPVP8 "),
      { filename: "pipa.webp", contentType: "image/webp" }
    );

    expect(odgovor.status).toBe(201);
    expect(odgovor.body.popravilo.fotografijaDodana).toBe(true);
  });

  it("zavrne fotografijo nedovoljenega formata", async () => {
    const { token } = await ustvariUporabnika();

    const odgovor = await objaviPopravilo(token).attach(
      "fotografija",
      Buffer.from("%PDF-1.4"),
      { filename: "racun.pdf", contentType: "application/pdf" }
    );

    expect(odgovor.status).toBe(400);
  });
});
