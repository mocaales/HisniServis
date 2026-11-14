import { describe, expect, it, vi } from "vitest";

const naloziKonfiguracijo = async () => {
  vi.resetModules();
  return (await import("../config")).API_URL;
};

describe("Konfiguracija naslova API-ja", () => {
  it("brez VITE_API_URL uporabi lokalni backend", async () => {
    vi.stubEnv("VITE_API_URL", "");

    expect(await naloziKonfiguracijo()).toBe("http://localhost:5000");
  });

  it("uporabi VITE_API_URL brez zaključne poševnice", async () => {
    vi.stubEnv("VITE_API_URL", "https://hisniservis-api.onrender.com/");

    expect(await naloziKonfiguracijo()).toBe(
      "https://hisniservis-api.onrender.com"
    );
  });
});
