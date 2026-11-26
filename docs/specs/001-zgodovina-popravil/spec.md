# Specifikacija 001: Pregled zgodovine popravil

- **Uporabniška zgodba:** [US-10](../../05-uporabniske-zgodbe.md#us-10-pregled-zgodovine-popravil)
- **Vloge:** Stanovalec, Izvajalec
- **Stanje:** implementirano

## Problem

Stanovalec trenutno vidi samo odprta popravila (`GET /api/popravila` vrne samo status `ODPRTO`). Ko je ponudba izbrana, popravilo izgine s seznama, zato stanovalec nima pregleda nad svojimi preteklimi in tekočimi popravili. Izvajalec vidi potrjene ponudbe, nima pa strnjenega pregleda popravil, ki jih je izvajal, in njihovih statusov.

## Uporabniška zgodba

Kot stanovalec želim pregledati zgodovino svojih popravil, da lahko preverim pretekla dela in njihove statuse. Kot izvajalec želim videti popravila, za katera je bila izbrana moja ponudba.

## Funkcionalne zahteve

1. **Z-1** Prijavljen stanovalec dobi seznam vseh popravil, ki jih je objavil, ne glede na status (`ODPRTO`, `V_TEKU`, `V_DELU`, `CAKA_POTRDITEV`, `ZAKLJUCENO`).
2. **Z-2** Prijavljen izvajalec dobi seznam popravil, pri katerih ima ponudbo s statusom `SPREJETA`.
3. **Z-3** Vsak element seznama vsebuje vsaj: ID, naslov, kategorijo, lokacijo, datum objave in trenutni status.
4. **Z-4** Seznam je razvrščen po datumu objave od najnovejšega.
5. **Z-5** Seznam se vedno določi iz identitete v JWT; API ne sprejme ID-ja uporabnika kot parametra.
6. **Z-6** V uporabniškem vmesniku je stran »Zgodovina popravil« dostopna stanovalcu in izvajalcu; statusi so prikazani v berljivi obliki (npr. `V_DELU` → »V izvedbi«).
7. **Z-7** Uporabnik lahko seznam v vmesniku filtrira po statusu.

## Nefunkcionalne zahteve

- API sledi obstoječim konvencijam (REST, JSON, slovenska sporočila, `preveriJWT` + `preveriVlogo`).
- Odgovor ne vsebuje binarnih podatkov fotografije (samo `fotografijaDodana`).
- Brez sprememb podatkovnega modela (ni migracij).

## Sprejemni kriteriji

| # | Kriterij (Given / When / Then) | Preverjanje |
|---|---|---|
| SK-1 | *Dano:* stanovalec ima odprto in zaključeno popravilo. *Ko* odpre zgodovino, *potem* vidi obe popravili z njunima statusoma. | backend test, frontend test |
| SK-2 | Seznam prikazuje naslov, datum objave in trenutni status vsakega popravila. | frontend test |
| SK-3 | *Dano:* izvajalec ima sprejeto ponudbo za popravilo A in samo oddano ponudbo za popravilo B. *Ko* odpre zgodovino, *potem* vidi samo popravilo A. | backend test |
| SK-4 | Stanovalec v svoji zgodovini ne vidi popravil drugih stanovalcev. | backend test |
| SK-5 | Neprijavljen uporabnik dobi `401`, administrator `403`. | backend test |
| SK-6 | Če uporabnik nima popravil, vmesnik prikaže »Zgodovina je prazna.« | frontend test |
| SK-7 | Filter po statusu skrije popravila z drugimi statusi. | frontend test |

## Izven obsega

- Strežniško ostranjevanje in filtriranje (seznam enega uporabnika je majhen).
- Zgodovina za administratorja (pokriva jo US-15).
- Ocenjevanje zaključenih popravil (US-09).
