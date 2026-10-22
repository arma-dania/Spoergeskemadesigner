# Spørgeskemadesigner

**Fra emne til spørgsmål.** Et interaktivt undervisningsværktøj, der fører studerende i markedsanalyse trin for trin fra et formål til et færdigt spørgeskema og en kodebog, der er klar til pilottest. Hvert trin giver regelbaseret feedback og valgfri AI-feedback. Knappen **Indlæs eksempel: SonicWave** udfylder alle trin med casen.

**Placering i undervisningen:** For at kunne lave en markedsundersøgelse skal de studerende lære metode, både kvalitativ og kvantitativ. Spørgeskemadesigneren og søstersiden **Statistiske test** (`arma-dania/tests`) er begge til den **kvantitative metode i sprint 3**. Designeren dækker udarbejdelsen af spørgeskemaet, og statistiksiden dækker arbejdet med de data, et spørgeskema giver (kodebog, rensning, Chi², t-test og ANOVA). Begge bygger på SonicWave-casen. Testene nævnes bevidst ikke i designeren. De to sider er indbyrdes kongruente: SonicWave-eksemplet i designeren giver ordret den kodebog, statistiksiden og datasættet bruger, og begge sider lærer det samme om måleniveauer, screening, springlogik og "ved ikke". Se **[KONGRUENS.md](KONGRUENS.md)**.

---

## Kom i gang

| Sådan vil du bruge det | Gør dette |
|---|---|
| **Med AI-feedback (anbefalet)** | Udgiv på **Netlify** — se [AI-feedback via Netlify](#ai-feedback-via-netlify). |
| **Hurtigt, uden AI** | Åbn `index.html`. Filen er selvstændig, så du kan dobbeltklikke på den eller lægge den på Moodle/itslearning. Alt undtagen AI-feedbacken virker. |
| **Som Claude-artifact** | Indsæt `spoergeskemadesigner.jsx` som et Claude-artifact (React). AI-feedbacken bruger så artifactets egen adgang til Claude. |
| **Videreudvikle** | Redigér `spoergeskemadesigner.jsx`, og kør `npm install && npm run build` for at generere en ny `index.html`. |

`index.html` kræver ingen internetforbindelse ud over Google Fonts. Uden net bruges standardskrifttyper.

---

## AI-feedback via Netlify

AI-feedbacken kører gennem en lille serverfunktion, `netlify/functions/claude.mjs`, som Netlify udgiver på `/api/claude`. Browseren sender kun prompten dertil; funktionen kalder Claude API'et med nøglen, som ligger hos Netlify og aldrig når frem til de studerende.

1. **Forbind repoet:** I Netlify-projektet: *Project configuration → Build & deploy → Link repository* → `arma-dania/Spoergeskemadesigner`, og vælg den gren, der skal udgives. Byggeindstillingerne læses fra `netlify.toml` (`npm run build`, udgiv `dist/`).
2. **Sæt API-nøglen:** *Project configuration → Environment variables → Add a variable* → `ANTHROPIC_API_KEY` = din nøgle fra [console.anthropic.com](https://console.anthropic.com). Markér den som hemmelig.
3. **Deploy:** *Deploys → Trigger deploy*. Åbn siden, indlæs SonicWave-eksemplet, og tryk *Få AI-feedback* for at tjekke.

Valgfrie miljøvariabler:

| Variabel | Standard | Betydning |
|---|---|---|
| `AI_MODEL` | `claude-opus-5-5` | Modellen. `claude-sonnet-5-5` er billigere og hurtigere. |
| `AI_EFFORT` | `low` | Hvor grundigt modellen tænker: `low`, `medium` eller `high`. Feedbacken er kort, så `low` er normalt nok og holder svartiden nede. |

**Sikkerhed og pris:** Funktionen accepterer kun sidens egne feedback-prompts (de starter alle med samme tekst), og prompten må højst være 30.000 tegn. Den kan altså ikke bruges som åben chatbot. Den har dog ingen login. Sæt derfor en månedlig udgiftsgrænse i Anthropic Console (*Settings → Limits*), før siden deles med holdet.

---

## Introduktionsside

Første gang værktøjet åbnes, vises en introduktionsside. Den forklarer formål og anvendelse og har en animation, der følger SonicWave-casen gennem de seks trin. Animationen kører automatisk og kan sættes på pause. Man kan også klikke direkte på et trin. Ved reduceret bevægelse (styresystemets indstilling) vises hvert trin uden animation. Siden kan altid åbnes igen med knappen *Om værktøjet og de seks trin* i toppen.

## De seks trin

| # | Trin | Den studerende… | Feedback |
|---|---|---|---|
| 1 | **Forskningsemne** | formulerer formål (ledelsesbeslutning), forskningsspørgsmål og målgruppe | Krav om minimumslængde |
| 2 | **Emner** | nedbryder forskningsspørgsmålet i emner, typebestemmer dem (holdning, adfærd, intention, viden, demografi), operationaliserer, markerer screening (skemaet slutter) og springlogik (spørgsmålet stilles kun til nogle) og kan navngive variablen | AI: klarhed, type-match, operationalisering |
| 3 | **Skalavalg** | vælger blandt 15 skalaer (anbefalede vises først). Hvert kort viser skalaens måleniveau | AI: skala-egnethed, måleniveau, begrundelse |
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

| Spørgeskemadesigneren | Statistiske test |
|---|---|
| Emne → spørgsmål | Variabel i kodebogen |
| Skalaens måleniveau | Måleniveau i kodebogen → valg af test (beslutningstræet) |
| Screening (skemaet slutter) | Personen er ikke i datasættet |
| Springlogik (kun nogle får spørgsmålet) | Tomme celler = "ikke relevant", ikke manglende svar |
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
package.json               Afhængigheder (esbuild, React 18, Tailwind 3, @anthropic-ai/sdk til serverfunktionen)
netlify.toml               Netlify: byggekommando, udgivelsesmappe (dist/) og funktioner
netlify/functions/claude.mjs  Serverfunktion, der kalder Claude API'et med nøglen fra Netlify
FORSLAG.md                 Gennemgang, fejl, forbedringsforslag, animationer, guides og øvelser
KONGRUENS.md               Sammenhængen med statistiksiden og SonicWave-casen
```

### Hvor ændrer jeg indholdet?

Det meste af det faglige indhold ligger som data øverst i `spoergeskemadesigner.jsx`:

- `CONSTRUCT_TYPES` er de fem emnetyper med beskrivelse og eksempler.
- `SCALES` er de 15 skalaer med måleniveau, kodebogens måleniveau (`codebookLevel`), svarmuligheder, formuleringstip, faldgrube og `bestFor`, som styrer anbefalingerne.
- `sonicWaveExample()` er SonicWave-eksemplet. Det skal stemme med kodebogen på statistiksiden (`CODEBOOK` i `statistiske_test.jsx` og i `data/generate_dataset.py`).
- `ruleBasedChecks()` er de regelbaserede advarsler på spørgsmålsformuleringer.
- `FEEDBACK_TONE` og de fire `evaluate…WithAI()`-funktioner er AI-prompterne og tonen i AI-feedbacken.

Redigér `index.html` ikke direkte. Den overskrives, når du kører `npm run build`.

---

## Begrænsninger

- **AI-feedback kræver Netlify (eller Claude-artifact).** Åbnes `index.html` direkte fra disken, vises *"AI-feedback kræver, at siden åbnes fra Netlify-adressen"*. De regelbaserede advarsler i trin 4 og alle andre trin virker stadig.
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
- AI-feedback end-to-end gennem `/api/claude` mod en lokal efterligning af Claude API'et: nøglen sendes kun fra serveren, browseren kalder aldrig `api.anthropic.com` direkte, og fremmede prompts afvises
