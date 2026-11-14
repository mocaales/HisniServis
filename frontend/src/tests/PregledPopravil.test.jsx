import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import PregledPopravil from "../pages/PregledPopravil";
import { zamenjajFetch } from "./pomocniki";

const popravila = [
  {
    id: "1",
    naslov: "Pokvarjena pipa",
    kategorija: "Vodovod",
    opis: "Pipa pušča.",
    lokacija: "Maribor",
    status: "ODPRTO",
    datum_objave: "2026-11-01T10:00:00.000Z"
  },
  {
    id: "2",
    naslov: "Iskreča vtičnica",
    kategorija: "Elektrika",
    opis: "Vtičnica iskri.",
    lokacija: "Ljubljana",
    status: "ODPRTO",
    datum_objave: "2026-11-02T10:00:00.000Z"
  }
];

const prikazi = () =>
  render(
    <MemoryRouter>
      <PregledPopravil uporabnik={null} token={null} onLogout={() => {}} />
    </MemoryRouter>
  );

describe("Pregled in iskanje popravil (US-03)", () => {
  it("prikaže odprta popravila z naslovom in lokacijo", async () => {
    zamenjajFetch([200, { popravila }]);
    prikazi();

    expect(await screen.findByText("Pokvarjena pipa")).toBeInTheDocument();
    expect(screen.getByText("Iskreča vtičnica")).toBeInTheDocument();
    expect(screen.getByText(/Maribor/, { selector: "span" })).toBeInTheDocument();
  });

  it("filtrira po kategoriji", async () => {
    zamenjajFetch([200, { popravila }]);
    prikazi();
    await screen.findByText("Pokvarjena pipa");

    await userEvent.setup().selectOptions(
      screen.getByLabelText("Kategorija"),
      "Elektrika"
    );

    expect(screen.queryByText("Pokvarjena pipa")).not.toBeInTheDocument();
    expect(screen.getByText("Iskreča vtičnica")).toBeInTheDocument();
  });

  it("brez zadetkov prikaže obvestilo", async () => {
    zamenjajFetch([200, { popravila: [] }]);
    prikazi();

    expect(
      await screen.findByText("Ni popravil, ki ustrezajo iskanju.")
    ).toBeInTheDocument();
  });
});
