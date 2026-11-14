import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Register from "../pages/Register";

describe("Registracija", () => {
  it("polja za specializacijo in opis prikaže samo izvajalcu", async () => {
    const uporabnik = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.queryByLabelText(/Specializacija/i)).not.toBeInTheDocument();

    await uporabnik.selectOptions(
      screen.getByLabelText("Registrirajte se kot"),
      "Izvajalec"
    );

    expect(screen.getByLabelText(/Specializacija/i)).toBeRequired();
  });
});
