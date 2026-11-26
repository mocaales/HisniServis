---
name: pisanje-adr
description: Zapis nove arhitekturne odločitve (ADR) v docs/adr po predlogi projekta HišniServis. Uporabi, ko se uvaja nova knjižnica, ogrodje, storitev ali vzorec, ko se spremeni obstoječa odločitev (ADR 0001–0007) ali ko uporabnik prosi za ADR.
---

# Pisanje ADR

ADR-ji so v `docs/adr/`, oštevilčeni s štirimi mestami (`0008-kratek-opis.md`), v slovenščini, po predlogi `docs/adr/adr-template.md` (MADR, poenostavljen).

## Koraki

1. Preberi obstoječe ADR-je v `docs/adr/` in preveri, ali odločitev že obstaja. Sprejetih ADR-jev ne spreminjaj – nova odločitev, ki staro nadomesti, je nov ADR, ki v kontekstu navede, kateri ADR nadomešča.
2. Ustvari datoteko s skripto (izračuna naslednjo številko in kopira predlogo):

   ```bash
   .claude/skills/pisanje-adr/nov-adr.sh "kratek opis odlocitve"
   ```

   Skripta izpiše pot do nove datoteke, npr. `docs/adr/0008-kratek-opis-odlocitve.md`.
3. Izpolni vse razdelke predloge:
   - **Naslov** – problem in izbrana rešitev v enem stavku.
   - **Kontekst in opredelitev problema** – zakaj je odločitev potrebna, katere dele sistema zadeva.
   - **Obravnavane možnosti** – vsaj dve realni možnosti.
   - **Izid odločitve** – `Izbrana možnost: »…«, ker …` z utemeljitvijo za ta projekt.
   - **Posledice** – vsaj ena »Dobro, ker …« in ena »Slabo, ker …«.
4. Ne puščaj zavitih oklepajev `{...}` iz predloge (preveri z `grep -n "{" docs/adr/00NN-*.md`).
5. Če odločitev vpliva na sklad, posodobi `docs/04-arhitektura-in-tehnoloski-sklad.md` in seznam tehnologij v `README.md`.

## Slog

- Kratki, jasni stavki; brez marketinškega jezika.
- Narekovaji »…« za imena možnosti, `koda` za imena paketov in datotek.
- Primer dobrega ADR: `docs/adr/0003-mongodb-mongoose.md`.
