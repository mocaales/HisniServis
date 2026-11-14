import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Login from "../pages/Login";
import { zamenjajFetch } from "./pomocniki";

const prikazi = (onLogin = vi.fn()) =>
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="/stanovalec" element={<p>Delovni prostor stanovalca</p>} />
      </Routes>
    </MemoryRouter>
  );

const prijava = async (email, geslo) => {
  const uporabnik = userEvent.setup();
  await uporabnik.type(screen.getByLabelText("E-poštni naslov"), email);
  await uporabnik.type(screen.getByLabelText("Geslo"), geslo);
  await uporabnik.click(screen.getByRole("button", { name: "Prijavi se" }));
};

describe("Prijava", () => {
  it("pošlje podatke in stanovalca preusmeri v delovni prostor", async () => {
    const onLogin = vi.fn();
    const fetch = zamenjajFetch([
      200,
      { token: "a.b.c", uporabnik: { id: "1", ime: "Ana", vloga: "Stanovalec" } }
    ]);
    prikazi(onLogin);

    await prijava("ana@primer.si", "Geslo1234");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "ana@primer.si", geslo: "Geslo1234" })
      })
    );
    expect(onLogin).toHaveBeenCalledWith(
      expect.objectContaining({ vloga: "Stanovalec" }),
      "a.b.c"
    );
    expect(await screen.findByText("Delovni prostor stanovalca")).toBeInTheDocument();
  });

  it("pri napačnih podatkih prikaže sporočilo strežnika in ne prijavi", async () => {
    const onLogin = vi.fn();
    zamenjajFetch([401, { message: "Napačen e-poštni naslov ali geslo." }]);
    prikazi(onLogin);

    await prijava("ana@primer.si", "napacno");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Napačen e-poštni naslov ali geslo."
    );
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("zavrne odgovor z neznano vlogo", async () => {
    const onLogin = vi.fn();
    zamenjajFetch([200, { token: "a.b.c", uporabnik: { vloga: "Gost" } }]);
    prikazi(onLogin);

    await prijava("ana@primer.si", "Geslo1234");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Neznana uporabniška vloga."
    );
    expect(onLogin).not.toHaveBeenCalled();
  });
});
