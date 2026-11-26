import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ZgodovinaPopravil from "../pages/ZgodovinaPopravil";
import { zamenjajFetch } from "./pomocniki";

const popravila = [
  {
    id: "1",
    naslov: "Pokvarjena pipa",
    kategorija: "Vodovod",
    lokacija: "Maribor",
    status: "ODPRTO",
    datum_objave: "2026-11-20T10:00:00.000Z"
  },
  {
    id: "2",
    naslov: "Iskreča vtičnica",
    kategorija: "Elektrika",
    lokacija: "Ljubljana",
    status: "ZAKLJUCENO",
    datum_objave: "2026-10-05T10:00:00.000Z"
  }
];

const stanovalec = { id: "s1", ime: "Ana", vloga: "Stanovalec" };

const prikazi = () =>
  render(
    <MemoryRouter>
      <ZgodovinaPopravil uporabnik={stanovalec} token="t" />
    </MemoryRouter>
  );

describe("Zgodovina popravil (US-10)", () => {
  it("prikaže naslov, datum objave in status vseh popravil (SK-1, SK-2)", async () => {
    const fetch = zamenjajFetch([200, { stevilo: 2, popravila }]);
    prikazi();

    const vrstica = (await screen.findByText("Iskreča vtičnica")).closest("tr");

    expect(screen.getByText("Pokvarjena pipa")).toBeInTheDocument();
    expect(within(vrstica).getByText("Zaključeno")).toBeInTheDocument();
    expect(
      within(vrstica).getByText(new Date(popravila[1].datum_objave).toLocaleDateString("sl-SI"))
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/popravila/moja",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer t" })
      })
    );
  });

  it("brez popravil prikaže obvestilo o prazni zgodovini (SK-6)", async () => {
    zamenjajFetch([200, { stevilo: 0, popravila: [] }]);
    prikazi();

    expect(await screen.findByText("Zgodovina je prazna.")).toBeInTheDocument();
  });

  it("filter po statusu skrije popravila z drugimi statusi (SK-7)", async () => {
    zamenjajFetch([200, { stevilo: 2, popravila }]);
    prikazi();
    await screen.findByText("Pokvarjena pipa");

    await userEvent.setup().selectOptions(
      screen.getByLabelText("Status"),
      "ZAKLJUCENO"
    );

    expect(screen.queryByText("Pokvarjena pipa")).not.toBeInTheDocument();
    expect(screen.getByText("Iskreča vtičnica")).toBeInTheDocument();
  });

  it("ob napaki strežnika prikaže sporočilo", async () => {
    zamenjajFetch([500, { message: "Napaka pri pridobivanju zgodovine popravil." }]);
    prikazi();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Napaka pri pridobivanju zgodovine popravil."
    );
  });
});
