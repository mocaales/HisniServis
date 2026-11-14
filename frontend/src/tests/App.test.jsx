import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../App";
import { zamenjajFetch } from "./pomocniki";

const prikazi = (pot) =>
  render(
    <MemoryRouter initialEntries={[pot]}>
      <App />
    </MemoryRouter>
  );

describe("Zaščita poti", () => {
  it("neprijavljenega uporabnika z objave popravila preusmeri na prijavo", async () => {
    prikazi("/stanovalec/objavi");

    expect(
      await screen.findByRole("button", { name: "Prijavi se" })
    ).toBeInTheDocument();
  });

  it("ob neveljavnem shranjenem žetonu odstrani prijavo", async () => {
    sessionStorage.setItem("prijava", JSON.stringify({ token: "potekel" }));
    zamenjajFetch([401, { message: "Neveljaven ali potekel JWT žeton." }]);

    prikazi("/stanovalec/objavi");

    expect(
      await screen.findByRole("button", { name: "Prijavi se" })
    ).toBeInTheDocument();
    expect(sessionStorage.getItem("prijava")).toBeNull();
  });
});
