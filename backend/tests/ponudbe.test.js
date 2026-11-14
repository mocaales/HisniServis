import { beforeEach, describe, expect, it } from "vitest";
import {
  api,
  objaviPopravilo,
  oddajPonudbo,
  ustvariUporabnika
} from "./pomocniki.js";

let stanovalec;
let izvajalec;
let popraviloId;

beforeEach(async () => {
  stanovalec = await ustvariUporabnika();
  izvajalec = await ustvariUporabnika("Izvajalec");
  popraviloId = (await objaviPopravilo(stanovalec.token)).body.popravilo.id;
});

const izberi = (token, ponudbaId) =>
  api()
    .patch(`/api/ponudbe/${ponudbaId}/izberi`)
    .set("Authorization", `Bearer ${token}`);

const spremeniStatus = (token, status) =>
  api()
    .patch(`/api/popravila/${popraviloId}/status`)
    .set("Authorization", `Bearer ${token}`)
    .send({ status });

describe("Oddaja ponudbe (US-04)", () => {
  it("izvajalec odda ponudbo za odprto popravilo", async () => {
    const odgovor = await oddajPonudbo(izvajalec.token, popraviloId);

    expect(odgovor.status).toBe(201);
    expect(odgovor.body.ponudba).toMatchObject({ cena: 120, status: "ODDANA" });
  });

  it("zavrne ponudbo z negativno ceno", async () => {
    const odgovor = await oddajPonudbo(izvajalec.token, popraviloId, {
      cena: -10
    });

    expect(odgovor.status).toBe(400);
  });

  it("prepreči drugo ponudbo istega izvajalca", async () => {
    await oddajPonudbo(izvajalec.token, popraviloId).expect(201);

    const odgovor = await oddajPonudbo(izvajalec.token, popraviloId, {
      cena: 90
    });

    expect(odgovor.status).toBe(409);
  });
});

describe("Primerjava in izbira ponudbe (US-05, US-06)", () => {
  it("drug stanovalec ne vidi ponudb za tuje popravilo", async () => {
    const drugi = await ustvariUporabnika();

    const odgovor = await api()
      .get(`/api/ponudbe/popravilo/${popraviloId}`)
      .set("Authorization", `Bearer ${drugi.token}`);

    expect(odgovor.status).toBe(403);
  });

  it("izbrana ponudba je sprejeta, ostale zavrnjene, druga izbira ni mogoča", async () => {
    const drugiIzvajalec = await ustvariUporabnika("Izvajalec");
    const prva = (await oddajPonudbo(izvajalec.token, popraviloId)).body.ponudba;
    const druga = (
      await oddajPonudbo(drugiIzvajalec.token, popraviloId, { cena: 99 })
    ).body.ponudba;

    const izbira = await izberi(stanovalec.token, prva.id);
    expect(izbira.status).toBe(200);
    expect(izbira.body.popravilo.status).toBe("V_TEKU");

    const pregled = await api()
      .get(`/api/ponudbe/popravilo/${popraviloId}`)
      .set("Authorization", `Bearer ${stanovalec.token}`)
      .expect(200);
    const statusi = Object.fromEntries(
      pregled.body.ponudbe.map((p) => [p.id, p.status])
    );
    expect(statusi).toEqual({ [prva.id]: "SPREJETA", [druga.id]: "ZAVRNJENA" });

    await izberi(stanovalec.token, druga.id).expect(409);
  });
});

describe("Status in zaključek popravila", () => {
  it("izbrani izvajalec vodi delo, stanovalec potrdi zaključek", async () => {
    const drugiIzvajalec = await ustvariUporabnika("Izvajalec");
    const ponudba = (await oddajPonudbo(izvajalec.token, popraviloId)).body
      .ponudba;
    await izberi(stanovalec.token, ponudba.id).expect(200);

    await spremeniStatus(drugiIzvajalec.token, "V_DELU").expect(403);
    await spremeniStatus(izvajalec.token, "V_DELU").expect(200);
    await spremeniStatus(izvajalec.token, "ZAKLJUCENO").expect(409);
    await spremeniStatus(izvajalec.token, "CAKA_POTRDITEV").expect(200);

    const zakljucek = await spremeniStatus(stanovalec.token, "ZAKLJUCENO");
    expect(zakljucek.status).toBe(200);
    expect(zakljucek.body.popravilo.status).toBe("ZAKLJUCENO");
  });
});
