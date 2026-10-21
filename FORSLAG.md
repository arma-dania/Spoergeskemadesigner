# Gennemgang og forslag: Spørgeskemadesigneren i sprint 3

*Gennemgang af `spoergeskemadesigner.jsx`, testet som `index.html` i Chromium (desktop og mobil), oktober 2026.*

**Samlet vurdering:** Værktøjet er fagligt stærkt og pædagogisk velgennemtænkt. Den analytiske kæde (formål → forskningsspørgsmål → emne → skala → spørgsmål) er tydelig. AI-prompterne er usædvanligt omhyggelige, fx med reglen mod at skifte holdning ("anti-flip-flop") ved gråzonetyper og kravet om, at kategorier skal passe til målgruppen. Det visuelle udtryk er roligt og akademisk.

Den største mangel i forhold til **sprint 3 (databehandling)** er, at værktøjet *slutter, hvor databehandlingen begynder*. Udkastet nævner måleniveau, men giver ingen kodebog, ingen variabelnavne, ingen kodning af manglende værdier og ingen analyseplan. Forslagene nedenfor handler derfor især om at forlænge kæden:

```
… → Spørgsmål → Kodebog → Data → Rensning → Analyse → Beslutning (tilbage til formålet)
```

---

## 1. Fejl fundet ved test

| Prioritet | Fejl | Konsekvens | Forslag til rettelse |
|---|---|---|---|
| 🔴 **Høj** | Man når trin 4, går tilbage til *Emner*, tilføjer et emne og klikker på *Spørgsmål* i trinlinjen. Siden crasher (`Cannot read properties of undefined (reading 'scaleId')`). | Hvid skærm, og alt arbejde er tabt. Det sker let i en undervisningssituation. | Fjern senere trin fra `completedSteps`, når emner tilføjes eller fjernes, og/eller skriv `scaleChoices[c.id]?.scaleId` og spring emner uden skala over i `QuestionsStep`. |
| 🔴 **Høj** | Intet gemmes. Genindlæsning eller et lukket faneblad sletter alt. | Studerende mister 30-60 minutters arbejde. | Gem automatisk i `localStorage`, og tilføj *Gem/indlæs projekt (.json)*, så designet kan tages med fra sprint 2 til sprint 3. |
| 🟠 Middel | AI-kaldene virker kun i et Claude-artifact. Som almindelig webside står der "Failed to fetch". | Forvirrende besked for de studerende. | Gør beskeden letforståelig ("AI-feedback er kun tilgængelig i Claude-versionen"), eller skjul AI-knapperne, når API'et ikke svarer. |
| 🟠 Middel | Modellen `claude-sonnet-4-20250514` står hårdkodet fire steder, og `fetch`/parse-koden er kopieret fire gange. | Svært at opdatere til en nyere model. | Lav én `callClaude(prompt)`-hjælpefunktion og én `AI_MODEL`-konstant. |
| 🟡 Lav | Tjekket for dobbeltspørgsmål slår ud på *ethvert* "og", "samt" eller "eller". `split(...).length > 2` er altid sandt, fordi regex'et har en fangende gruppe. Fx giver "Hvor ofte køber du tøj **og** sko online?" en advarsel. | Mange falske advarsler, og de studerende lærer at ignorere advarslerne. | Formulér advarslen som et spørgsmål ("Måler du én eller to ting?"), eller kræv to sammenhængende forhold. |
| 🟡 Lav | Ændres et spørgsmål, *mens* AI'en vurderer det, lægger den gamle vurdering sig over den nye tekst. | Feedbacken passer ikke til teksten. | Gem den tekst, der blev vurderet, sammen med resultatet, og kassér svaret, hvis teksten er ændret. |
| 🟡 Lav | *Start forfra* sletter alt uden at spørge først. | Data går tabt ved et fejlklik. | Bed om bekræftelse med `confirm()`. |
| 🟡 Lav | Hver `<label>` er ikke koblet til sit felt (`htmlFor`/`id`), og knapperne har ikke tydelig tastaturfokus. | Ringere tilgængelighed (WCAG). | Tilføj `id`/`htmlFor` og en `:focus-visible`-stil. |
| 🟡 Lav | Headeren nævner "de tre kritiske led", men værktøjet har seks trin. | Lille uoverensstemmelse. | Ret til "seks trin" eller "fra formål til færdigt skema". |

---

## 2. Faglige forbedringer: bro til databehandling (sprint 3)

### 2.1 Nyt trin 7: *Kodebog og analyseplan* (største gevinst)
Generér automatisk en kodebog ud fra designet:

| Variabel | Spørgsmål | Type | Skala | Måleniveau | Koder | Manglende | Lovlige analyser |
|---|---|---|---|---|---|---|---|
| `q01_alder` | Hvor gammel er du? | Demografi (screening) | Kategorier | Ordinal | 1 = 18-21, 2 = 22-25 … | 98 = Vil ikke svare | Frekvens, median, χ² |
| `q02_tilf` | Jeg er tilfreds med butikken | Holdning | Likert 5 | Interval* | 1-5 | 99 = Ved ikke | Gennemsnit, sd, t-test, korrelation |
| `q03_kanal_1` … `_k` | Hvor har du købt…? | Adfærd | MC flere svar | Nominal (0/1) | 0 = ikke valgt, 1 = valgt | n/a | Andel pr. dummy, χ² |

- **Eksport til CSV/Excel.** Så kan de studerende lægge kodebogen direkte ind i Excel, SPSS, R eller Stata.
- **Analyseplan.** Forbind hvert forskningsspørgsmål med en konkret analyse ("Adskiller tilfredshed sig på køn?" → t-test af `q02_tilf` fordelt på `q05_koen`).
- **Måleniveau styrer analysen.** Brug den eksisterende `measurement`-egenskab til at foreslå lovlige deskriptive mål og test.

### 2.2 Lad de studerende skrive de rigtige svarmuligheder
I dag er svarmulighederne for *multiple choice*, *rangordning* og *kategorier* kun pladsholdere ("Tilføj konkrete svarmuligheder før udsendelse"). Det er netop dem, der skal kodes i sprint 3. Foreslå:
- en lille editor til svarmuligheder pr. spørgsmål, med tjek af om listen er *udtømmende* og *gensidigt udelukkende* (fx at intervaller ikke overlapper)
- afkrydsning af *"Ved ikke"* og *"Vil ikke svare"*, som automatisk bliver manglende-koder i kodebogen
- et flag for **omvendt kodet item** (fx en negativt formuleret Likert-påstand), så omkodning bliver en del af kodebogen

### 2.3 Genererede øvelsesdatasæt
En knap *"Generér testdatasæt (n = 200)"* kunne lave syntetiske svar, der passer til skemaet, med bevidst indbyggede fejl til rensningsøvelser:
- respondenter, der ikke består screeningen, men alligevel har svaret videre
- straightlinere (samme svar på alle Likert-items)
- manglende værdier, kodet både som tom celle, `99` og `"ved ikke"`
- umulige værdier (alder 245, Likert 6) og dubletter
- inkonsistens mellem spørgsmål (svarer "0 gange" på adfærd, men vurderer kvaliteten)

Hver studerende eller gruppe får dermed **sit eget datasæt fra sit eget skema**. Det giver ejerskab og gør det svært blot at kopiere hinandens løsninger.

### 2.4 Mindre faglige justeringer
- **Måleniveau for Likert.** Formuleringen "ordinal med metrisk tilføjelse (behandles som interval)" er god. Tilføj gerne en kort note om, at det er en *antagelse*, der bør diskuteres (median vs. gennemsnit). Det er et oplagt diskussionspunkt i sprint 3.
- **Frekvensskala (konkret)** står som "ordinal eller ratio". Grupperede intervaller (1-2, 3-5 …) er ordinale. Kun et eksakt antal er ratio. Overvej at dele skalaen i to.
- **Stikprøve og svarprocent.** Tjeklisten kunne udvides med *stikprøvestørrelse*, *forventet svarprocent* og *GDPR/samtykke*, som alle har betydning for den senere databehandling.
- **Eksport til spørgeskemaplatforme**, fx Google Forms, Microsoft Forms eller SurveyXact (import af spørgsmål), så skemaet faktisk kan sendes ud og give rigtige data.

---

## 3. Forslag til animationer

Animationerne skal forklare et begreb, ikke pynte. Alle bør respektere `prefers-reduced-motion`.

| # | Animation | Hvor | Hvad den lærer |
|---|---|---|---|
| A1 | **Den levende kæde.** Sidebjælkens kæde (formål → … → spørgsmål) lyser op led for led, efterhånden som trinene gennemføres. I trin 7 fortsætter den med *data → analyse → beslutning* og slutter tilbage ved *formål*. | Sidebjælke i alle trin | Spørgeskemaet er et middel til en beslutning. |
| A2 | **Fra svar til datarække.** Et udfyldt skema "flyver" ind i et regneark. Hvert svar bliver til en celle, og kolonneoverskriften bliver variabelnavnet. | Overgang trin 6 → 7 | Hvad der fysisk sker med et svar, og hvorfor en respondent er én række. |
| A3 | **Måleniveau-trappen.** Nominal → ordinal → interval → ratio som trappetrin. For hvert trin "låses" nye operationer op (=, ≠ → <, > → +, − → ×, ÷) og nye mål (typetal → median → gennemsnit → variationskoefficient). | Trin 3, ved valg af skala | Hvorfor skalavalget afgør, hvilke analyser der er tilladt. |
| A4 | **Multiple choice eksploderer.** Ét spørgsmål med fem afkrydsningsfelter splittes til fem 0/1-kolonner. | Trin 3/7, ved *MC (flere svar)* | Dummy-kodning. |
| A5 | **Screening-tragten.** 1000 prikker løber ned gennem tragten. Prikker, der ikke består screeningen, falder fra, og *n* tæller ned. | Trin 5 | Screening først, og konsekvensen for stikprøvestørrelsen. |
| A6 | **Gennemsnit vs. median.** En Likert-fordeling, hvor de studerende kan trække søjlerne skæve og se, hvordan gennemsnit og median skilles ad. | Trin 7 / analyseplan | Diskussionen om, hvorvidt Likert er ordinal eller interval. |
| A7 | **Rensning i slowmotion.** Et beskidt datasæt, hvor problemrækker blinker og forsvinder én regel ad gangen (screening, dubletter, umulige værdier, straightlinere), med en løbende *n*-tæller. | Sprint 3-modul | Rensning er en række dokumenterbare beslutninger. |
| A8 | **Mikroanimationer.** AI-feedback toner ind dimension for dimension. "Valgt" på et skalakort får et kort pulse. Hver advarsel glider ind under tekstfeltet, mens der skrives. | Hele værktøjet | Opmærksomhed på feedbacken. |

---

## 4. Forslag til guides

1. **Underviserguide (1 side).** Lektionsplan til 3 × 45 min, forventede faldgruber pr. trin, og hvornår man bør stoppe op i plenum (typisk trin 2: *emne vs. spørgsmål*, og trin 3: *måleniveau*).
2. **Studieguide / "Sådan kommer du i gang" (vises første gang).** Tre korte skærmbilleder: *Hvad er et emne?*, *Hvad er måleniveau?*, *Gem dit arbejde!* Overlay med "Næste/Spring over".
3. **"Hvorfor?"-ikoner.** Et lille ⓘ ved hvert fagbegreb (operationalisering, screening, måleniveau, tragtprincip), der åbner en kort forklaring på to linjer med et eksempel.
4. **Gennemført eksempel.** En knap *"Indlæs eksempel: mobilcovers til 18-29-årige"*, der udfylder alle trin med et gennemarbejdet case. Den kan bruges til demonstration i plenum og som facit.
5. **Ordliste.** Emne, operationalisering, måleniveau, screening, kodebog, manglende værdi, omkodning, dummyvariabel, straightlining.
6. **Sprint 3-guide: "Fra skema til datasæt".** Trin for trin: eksportér kodebog → importér data → tjek screening → håndtér manglende værdier → omkod → deskriptiv analyse → test → konklusion mod formålet.

---

## 5. Forslag til øvelser (sprint 3)

| # | Øvelse | Form | Tid | Læringsmål |
|---|---|---|---|---|
| Ø1 | **Kodebogen.** Lav en kodebog ud fra jeres eget udkast fra sprint 2: variabelnavn, koder, manglende-koder og måleniveau. | Gruppe | 30 min | Oversætte spørgsmål til variable |
| Ø2 | **Måleniveau-memory.** Match 12 variable med de lovlige statistikker (typetal/median/gennemsnit, χ²/Mann-Whitney/t-test). | Par, kort eller quiz | 15 min | Måleniveau → analyse |
| Ø3 | **Find 8 fejl.** Et "beskidt" datasæt (n = 200) med indbyggede fejl, jf. afsnit 2.3. Find, beskriv og ret dem, og før en rense-log. | Individuel | 45 min | Datarensning og dokumentation |
| Ø4 | **Omkodning.** (a) Vend et negativt formuleret Likert-item om. (b) Lav aldersgrupper ud fra præcis alder. (c) Lav dummyvariable af MC-flere-svar. (d) Saml tre items til et indeks. | Individuel i Excel/R/SPSS | 45 min | Transformation af variable |
| Ø5 | **Hvad koster et dårligt spørgsmål?** Sammenlign data fra et dobbeltspørgsmål ("tilfreds med pris og kvalitet") med to separate spørgsmål. Hvad kan man og kan man ikke konkludere? | Plenum | 20 min | Kobling mellem design og datakvalitet |
| Ø6 | **Analyseplan.** For hvert forskningsspørgsmål: hvilke variable, hvilken analyse, hvilken figur, og hvad ville resultatet betyde for beslutningen? | Gruppe | 30 min | Analyse mod formålet |
| Ø7 | **Krydstabel og test.** Krydstabel mellem en screening- eller segmentvariabel og et adfærdsspørgsmål, χ²-test og fortolkning. | Individuel | 30 min | Bivariat analyse |
| Ø8 | **Fra tal til ledelsesanbefaling.** Skriv ét afsnit (maks. 100 ord) til ledelsen, der svarer på *formålet* fra trin 1. | Individuel | 20 min | Kæden lukkes |
| Ø9 | **Peer review af skemaer.** Byt udkast med en anden gruppe og find tre problemer, der vil give besvær i databehandlingen. | Par | 20 min | Kritisk vurdering |

**Progression:** Ø1 → Ø2 → Ø3 → Ø4 → Ø6/Ø7 → Ø8. Ø5 og Ø9 kan bruges som opvarmning eller afrunding.

---

## 6. Prioriteret køreplan

1. **Inden undervisningen (lav indsats, stor effekt):** ret crashet (1 🔴), tilføj autogem og JSON-eksport, gør AI-fejlbeskeden letforståelig, tilføj et indlæsbart eksempel.
2. **Til sprint 3:** editor til svarmuligheder med manglende-koder og flag for omvendt kodning, trin 7 med kodebog og analyseplan (CSV-eksport), generator til øvelsesdatasæt.
3. **Senere:** animationer A1-A8, intro-guide og "Hvorfor?"-ikoner, eksport til Google Forms/SurveyXact, opdateret model og en fælles `callClaude()`-funktion.
