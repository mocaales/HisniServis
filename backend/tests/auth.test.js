import { describe, expect, it } from "vitest";
import { api, ustvariUporabnika } from "./pomocniki.js";

const stanovalec = {
  ime: "Ana",
  priimek: "Novak",
  email: "ana.novak@primer.si",
  geslo: "Geslo1234",
  telefon: "041123456",
  vloga: "Stanovalec"
};

describe("Registracija in prijava (US-01)", () => {
  it("registrira stanovalca in ne vrne gesla", async () => {
    const odgovor = await api().post("/api/auth/register").send(stanovalec);

    expect(odgovor.status).toBe(201);
    expect(odgovor.body.uporabnik.email).toBe("ana.novak@primer.si");
    expect(odgovor.body.uporabnik.geslo).toBeUndefined();
  });

  it("zavrne registracijo z že uporabljenim e-poštnim naslovom", async () => {
    await api().post("/api/auth/register").send(stanovalec).expect(201);

    const odgovor = await api()
      .post("/api/auth/register")
      .send({ ...stanovalec, email: "ANA.NOVAK@primer.si" });

    expect(odgovor.status).toBe(409);
  });

  it("zahteva specializacijo in opis za izvajalca", async () => {
    const odgovor = await api()
      .post("/api/auth/register")
      .send({ ...stanovalec, vloga: "Izvajalec" });

    expect(odgovor.status).toBe(400);
    expect(odgovor.body.message).toMatch(/specializacijo/);
  });

  it("zavrne registracijo s prekratkim geslom", async () => {
    const odgovor = await api()
      .post("/api/auth/register")
      .send({ ...stanovalec, geslo: "kratko" });

    expect(odgovor.status).toBe(400);
  });

  it("ob pravilni prijavi vrne JWT žeton", async () => {
    const uporabnik = await ustvariUporabnika();

    expect(uporabnik.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
  });

  it("zavrne prijavo z napačnim geslom", async () => {
    await api().post("/api/auth/register").send(stanovalec).expect(201);

    const odgovor = await api()
      .post("/api/auth/login")
      .send({ email: stanovalec.email, geslo: "NapacnoGeslo" });

    expect(odgovor.status).toBe(401);
    expect(odgovor.body.token).toBeUndefined();
  });

  it("/me brez žetona vrne 401, z žetonom pa uporabnika", async () => {
    await api().get("/api/auth/me").expect(401);

    const uporabnik = await ustvariUporabnika();
    const odgovor = await api()
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${uporabnik.token}`);

    expect(odgovor.status).toBe(200);
    expect(odgovor.body.uporabnik.vloga).toBe("Stanovalec");
  });
});

describe("Zdravje API-ja", () => {
  it("/api/health odgovori s 200", async () => {
    const odgovor = await api().get("/api/health");

    expect(odgovor.status).toBe(200);
    expect(odgovor.body.message).toBe("HišniServis API deluje!");
  });
});
