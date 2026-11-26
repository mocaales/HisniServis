import { describe, expect, it } from "vitest";
import Popravilo from "../models/Popravilo.js";
import {
  api,
  objaviPopravilo,
  oddajPonudbo,
  ustvariAdministratorja,
  ustvariUporabnika
} from "./pomocniki.js";

const zgodovina = (token) => {
  const zahteva = api().get("/api/popravila/moja");
  return token ? zahteva.set("Authorization", `Bearer ${token}`) : zahteva;
};

const objavi = async (token, naslov) =>
  (await objaviPopravilo(token, { naslov })).body.popravilo.id;

describe("Zgodovina popravil (US-10)", () => {
  it("stanovalec vidi svoja popravila v vseh statusih, najnovejša najprej (SK-1)", async () => {
    const stanovalec = await ustvariUporabnika();
    const staroId = await objavi(stanovalec.token, "Staro popravilo");
    await Popravilo.updateOne(
      { _id: staroId },
      { status: "ZAKLJUCENO", datum_objave: new Date("2026-01-01") }
    );
    await objavi(stanovalec.token, "Novo popravilo");

    const odgovor = await zgodovina(stanovalec.token);

    expect(odgovor.status).toBe(200);
    expect(odgovor.body.stevilo).toBe(2);
    expect(odgovor.body.popravila).toHaveLength(2);
    expect(odgovor.body.popravila[0]).toMatchObject({
      naslov: "Novo popravilo",
      status: "ODPRTO",
      kategorija: "Vodovod",
      lokacija: "Maribor"
    });
    expect(odgovor.body.popravila[1]).toMatchObject({
      id: staroId,
      naslov: "Staro popravilo",
      status: "ZAKLJUCENO"
    });
    expect(odgovor.body.popravila[0].datum_objave).toBeDefined();
    expect(odgovor.body.popravila[0].fotografija).toBeUndefined();
  });

  it("izvajalec vidi samo popravila s svojo sprejeto ponudbo (SK-3)", async () => {
    const stanovalec = await ustvariUporabnika();
    const izvajalec = await ustvariUporabnika("Izvajalec");
    const sprejetoId = await objavi(stanovalec.token, "Sprejeto popravilo");
    const oddanoId = await objavi(stanovalec.token, "Samo oddana ponudba");
    const ponudba = (await oddajPonudbo(izvajalec.token, sprejetoId)).body.ponudba;
    await oddajPonudbo(izvajalec.token, oddanoId).expect(201);
    await api()
      .patch(`/api/ponudbe/${ponudba.id}/izberi`)
      .set("Authorization", `Bearer ${stanovalec.token}`)
      .expect(200);

    const odgovor = await zgodovina(izvajalec.token);

    expect(odgovor.status).toBe(200);
    expect(odgovor.body.popravila).toHaveLength(1);
    expect(odgovor.body.popravila[0]).toMatchObject({
      id: sprejetoId,
      naslov: "Sprejeto popravilo",
      status: "V_TEKU"
    });
  });

  it("stanovalec ne vidi popravil drugih stanovalcev (SK-4)", async () => {
    const ana = await ustvariUporabnika();
    const bojan = await ustvariUporabnika();
    await objavi(ana.token, "Anino popravilo");
    await objavi(bojan.token, "Bojanovo popravilo");

    const odgovor = await zgodovina(ana.token);

    expect(odgovor.status).toBe(200);
    expect(odgovor.body.popravila.map((p) => p.naslov)).toEqual([
      "Anino popravilo"
    ]);
  });

  it("brez prave prijave vrne 401 (SK-5)", async () => {
    const odgovor = await zgodovina();

    expect(odgovor.status).toBe(401);
  });

  it("administratorju vrne 403 (SK-5)", async () => {
    const admin = await ustvariAdministratorja();

    const odgovor = await zgodovina(admin.token);

    expect(odgovor.status).toBe(403);
  });
});
