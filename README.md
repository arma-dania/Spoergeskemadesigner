# Spørgeskemadesigner

**Fra emne til spørgsmål.** Et interaktivt undervisningsværktøj, der fører studerende i markedsanalyse trin for trin fra et formål til et færdigt spørgeskema, der er klar til pilottest. Hvert trin giver regelbaseret feedback og valgfri AI-feedback.

Værktøjet dækker **udarbejdelsen af spørgeskemaet**. Databehandlingen i sprint 3 (kodebog, rensning, Chi², t-test og ANOVA) ligger på søstersiden **Statistiske test** (`arma-dania/tests`), der bygger på SonicWave-casen. De to sider skal være indbyrdes kongruente. Et SonicWave-skema bygget i designeren skal give præcis det datasæt og den kodebog, som statistiksiden bruger. Se **[KONGRUENS.md](KONGRUENS.md)**.

---

## Kom i gang

| Sådan vil du bruge det | Gør dette |
|---|---|
| **Hurtigt, i en browser** | Åbn `index.html`. Filen er selvstændig, så du kan dobbeltklikke på den, lægge den på Moodle/itslearning eller hoste den på GitHub Pages. |
| **Med AI-feedback** | Indsæt `spoergeskemadesigner.jsx` som et Claude-artifact (React). AI-kaldene virker kun i det miljø, se [Begrænsninger](#begrænsninger). |
| **Videreudvikle** | Redigér `spoergeskemadesigner.jsx`, og kør `npm install && npm run build` for at generere en ny `index.html`. |

`index.html` kræver ingen internetforbindelse ud over Google Fonts. Uden net bruges standardskrifttyper.

---

## De seks trin

| # | Trin | Den studerende… | Feedback |
|---|---|---|---|
| 1 | **Forskningsemne** | formulerer formål (ledelsesbeslutning), forskningsspørgsmål og målgruppe | Krav om minimumslængde |
| 2 | **Emner** | nedbryder forskningsspørgsmålet i emner, typebestemmer dem (holdning, adfærd, intention, viden, demografi), operationaliserer og markerer screeningsspørgsmål | AI: klarhed, type-match, operationalisering |
| 3 | **Skalavalg** | vælger blandt 14 skalaer (anbefalede skalaer vises først) og begrunder valget | AI: skala-egnethed, måleniveau, begrundelse |
| 4 | **Spørgsmål** | formulerer ét spørgsmål pr. emne | Regelbaseret: dobbeltspørgsmål, negation, ledende ord, længde, hypotetik. AI: emne-match, skala-match, formulering |
| 5 | **Rækkefølge** | ordner spørgsmålene (screening først, tragtprincip, demografi sidst) | AI: indledning, flow, afslutning og en foreslået rækkefølge |
| 6 | **Færdigt udkast** | ser opsummering og skema og eksporterer | Download som Word, PDF (via print), .txt eller kopi |

Den analytiske kæde, som værktøjet bygger på:

```
Formål → Forskningsspørgsmål → Emner → Skalaer → Spørgsmål
```

På statistiksiden fortsætter kæden: `… → Data → Kodebog → Rensning → Test → Beslutning`.

---

## Sammenhæng med statistiksiden (SonicWave)

| Spørgeskemadesigneren (sprint 2) | Statistiske test (sprint 3) |
|---|---|
| Emne → spørgsmål | Variabel i kodebogen |
| Skalaens måleniveau | Måleniveau i kodebogen → valg af test (beslutningstræet) |
| Screening / filterspørgsmål | Frasorterede respondenter / springlogik (tomme celler = "ikke relevant") |
| "Ved ikke" som svarmulighed | Kode 99 → tom celle før analyse |
| Flere udsagn om samme holdning | Indeks (negativt formulerede vendes: 6 − svar) |

Et tjek af, om de to sider faktisk siger det samme, og en liste over det, der skal rettes, står i **[KONGRUENS.md](KONGRUENS.md)**.

Konkrete øvelser, animationer og forslag til udvidelser står i **[FORSLAG.md](FORSLAG.md)**.

---

## Filer

```
spoergeskemadesigner.jsx   Kildekoden: én React-komponent (pædagogiske data, regler, AI-prompts, UI)
index.html                 Selvstændig, bygget version: åbnes direkte i en browser
scripts/build-html.mjs     Bygger index.html (esbuild + Tailwind, alt lægges inline)
scripts/entry.jsx          Monterer App-komponenten i siden
package.json               Byggeafhængigheder (esbuild, React 18, Tailwind 3)
FORSLAG.md                 Gennemgang, fejl, forbedringsforslag, animationer, guides og øvelser
```

### Hvor ændrer jeg indholdet?

Det meste af det faglige indhold ligger som data øverst i `spoergeskemadesigner.jsx`:

- `CONSTRUCT_TYPES` er de fem emnetyper med beskrivelse og eksempler.
- `SCALES` er de 14 skalaer med måleniveau, svarmuligheder, formuleringstip, faldgrube og `bestFor`, som styrer anbefalingerne.
- `ruleBasedChecks()` er de regelbaserede advarsler på spørgsmålsformuleringer.
- `FEEDBACK_TONE` og de fire `evaluate…WithAI()`-funktioner er AI-prompterne og tonen i AI-feedbacken.

Redigér `index.html` ikke direkte. Den overskrives, når du kører `npm run build`.

---

## Begrænsninger

- **AI-feedback virker kun som Claude-artifact.** Koden kalder `https://api.anthropic.com/v1/messages` uden API-nøgle, og det virker kun inde i claude.ai. I `index.html` vises *"AI-feedback ikke tilgængelig: Failed to fetch"*, og de regelbaserede advarsler i trin 4 fungerer stadig. Alle andre trin kan gennemføres uden AI.
- **Intet gemmes.** Hvis siden genindlæses, er arbejdet væk. Bed de studerende om at eksportere undervejs.
- **Kendt fejl:** Hvis man efter trin 4 går tilbage til *Emner*, tilføjer et nyt emne og hopper frem via trinlinjen, går siden i hvidt, og data mistes. Brug i stedet *Næste*-knappen. Fejlen er beskrevet sammen med forslag til rettelse i [FORSLAG.md](FORSLAG.md#1-fejl-fundet-ved-test).

---

## Test

Den byggede `index.html` er gennemtestet i Chromium (Playwright). Testen dækkede:

- alle seks trin på desktop (1280 px) og mobil (390 px), uden vandret scroll
- AI-feedback med simulerede svar og uden netværk (fejlbesked vises korrekt)
- *Anvend foreslået rækkefølge* (screeningsspørgsmål flyttes først)
- regelbaserede advarsler (fx dobbeltspørgsmål ved "og")
