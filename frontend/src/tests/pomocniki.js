import { vi } from "vitest";

// Nadomestek za fetch, ki vrne podan JSON odgovor.
export function odgovor(status, telo) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(telo)
  });
}

export function zamenjajFetch(...odgovori) {
  const fetch = vi.fn();
  for (const [status, telo] of odgovori) {
    fetch.mockImplementationOnce(() => odgovor(status, telo));
  }
  vi.stubGlobal("fetch", fetch);
  return fetch;
}
