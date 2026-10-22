# Spørgeskemadesigner

**Fra emne til spørgsmål.** Et interaktivt undervisningsværktøj, der fører studerende i markedsanalyse trin for trin fra et formål til et færdigt spørgeskema og en kodebog, der er klar til pilottest og databehandling. Hvert trin giver regelbaseret feedback og valgfri AI-feedback. Knappen **Indlæs eksempel: SonicWave** udfylder alle trin med casen fra databehandlingen.

Værktøjet dækker **udarbejdelsen af spørgeskemaet**. Databehandlingen i sprint 3 (kodebog, rensning, Chi², t-test og ANOVA) ligger på søstersiden **Statistiske test** (`arma-dania/tests`), der bygger på SonicWave-casen. De to sider er indbyrdes kongruente: SonicWave-eksemplet i designeren giver ordret den kodebog, statistiksiden og datasættet bruger, og begge sider lærer det samme om måleniveauer, screening, springlogik og "ved ikke". Se **[KONGRUENS.md](KONGRUENS.md)**.

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
| 2 | **Emner** | nedbryder forskningsspørgsmålet i emner, typebestemmer dem (holdning, adfærd, intention, viden, demografi), operationaliserer, markerer screening (skemaet slutter) og springlogik (spørgsmålet stilles kun til nogle) og kan navngive variablen | AI: klarhed, type-match, operationalisering |
| 3 | **Skalavalg** | vælger blandt 15 skalaer (anbefalede vises først). Hvert kort viser måleniveau og hvilken af Chi², t-test og ANOVA svarene kan bruges i | AI: skala-egnethed, måleniveau, begrundelse |
| 4 | **Spørgsmål** | formulerer ét spørgsmål pr. emne og skriver svarmuligheder, enhed eller endepunkter. *Niveau 2:* flere udsagn til et indeks og negativt formulerede udsagn | Regelbaseret: dobbeltspørgsmål, negation, ledende ord, længde, hypotetik. AI: emne-match, skala-match, formulering |
| 5 | **Rækkefølge** | ordner spørgsmålene (screening først, filter før opfølgning, tragtprincip, demografi sidst) | Advarsel ved forkert springlogik. AI: indledning, flow, afslutning og en foreslået rækkefølge |
| 6 | **Færdigt udkast** | ser opsummering, skema og **kodebog** og eksporterer | Download som Word, PDF (via print), .txt, kodebog som .csv eller kopi |

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
| Screening (skemaet slutter) | Personen er ikke i datasættet |
| Springlogik (kun nogle får spørgsmålet) | Tomme celler = "ikke relevant", ikke manglende svar |
| Skalakortets "Analyse" | De tre test: Chi², t-test og ANOVA (alt andet er niveau 2) |
| Kodebogen i trin 6 | Kodebogen i § 01 (samme kolonner; SonicWave ordret ens) |
| "Ved ikke" som svarmulighed | Kode 99 → tom celle før analyse |
| Flere udsagn om samme holdning | Indeks (negativt formulerede vendes: 6 − svar) |

Hvad der blev tjekket og rettet, og hvordan de to sider holdes ens fremover, står i **[KONGRUENS.md](KONGRUENS.md)**.

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
KONGRUENS.md               Sammenhængen med statistiksiden og SonicWave-casen
```

### Hvor ændrer jeg indholdet?

Det meste af det faglige indhold ligger som data øverst i `spoergeskemadesigner.jsx`:

- `CONSTRUCT_TYPES` er de fem emnetyper med beskrivelse og eksempler.
- `SCALES` er de 15 skalaer med måleniveau, kodebogens måleniveau (`codebookLevel`), analyse (`analysis`), svarmuligheder, formuleringstip, faldgrube og `bestFor`, som styrer anbefalingerne.
- `sonicWaveExample()` er SonicWave-eksemplet. Det skal stemme med kodebogen på statistiksiden (`CODEBOOK` i `statistiske_test.jsx` og i `data/generate_dataset.py`).
- `ruleBasedChecks()` er de regelbaserede advarsler på spørgsmålsformuleringer.
- `FEEDBACK_TONE` og de fire `evaluate…WithAI()`-funktioner er AI-prompterne og tonen i AI-feedbacken.

Redigér `index.html` ikke direkte. Den overskrives, når du kører `npm run build`.

---

## Begrænsninger

- **AI-feedback virker kun som Claude-artifact.** Koden kalder `https://api.anthropic.com/v1/messages` uden API-nøgle, og det virker kun inde i claude.ai. I `index.html` vises *"AI-feedback ikke tilgængelig: Failed to fetch"*, og de regelbaserede advarsler i trin 4 fungerer stadig. Alle andre trin kan gennemføres uden AI.
- **Gemmes kun i browseren.** Arbejdet gemmes automatisk (`localStorage`) og overlever genindlæsning, men ikke et skift af computer eller browser, og ikke et privat vindue. Bed de studerende om at eksportere, når de er færdige.

---

## Test

Den byggede `index.html` er gennemtestet i Chromium (Playwright). Testen dækkede:

- alle seks trin på desktop (1280 px) og mobil (390 px), uden vandret scroll
- *Indlæs eksempel: SonicWave*: kodebogen i trin 6 er ordret den samme som på statistiksiden
- download af kodebog (.csv), .txt og Word
- autogem (genindlæsning bevarer arbejdet) og den tidligere crash-fejl (et nyt emne uden skala sender nu tilbage til trin 3)
- AI-feedback med simulerede svar og uden netværk (fejlbesked vises korrekt)
- *Anvend foreslået rækkefølge* (screeningsspørgsmål flyttes først)
- regelbaserede advarsler (fx dobbeltspørgsmål ved "og")
