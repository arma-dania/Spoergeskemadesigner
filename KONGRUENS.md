# Kongruens: Spørgeskemadesigneren ↔ Statistiske test (SonicWave)

| Side | Repository | Rolle |
|---|---|---|
| **Spørgeskemadesigneren** | `arma-dania/Spoergeskemadesigner` (`spoergeskemadesigner.jsx`) | Kvantitativ metode, sprint 3: fra formål til spørgeskema og kodebog |
| **Statistiske test** | `arma-dania/tests` (`statistiske_test.jsx`, `data/`) | Kvantitativ metode, sprint 3: fra datasæt til Chi², t-test og ANOVA |

**Status (oktober 2026):** Alle fundne uoverensstemmelser er rettet. Knappen *Indlæs eksempel: SonicWave* i designeren giver en kodebog, der er **ordret den samme** som kodebogen på statistiksiden (§ 01) og i `sonicwave_spoergeskema.xlsx`. Statistiksiden har én ekstra række, den afledte variabel *aldersgruppe*. Testtallene i casene er uændrede: χ² = 103,94, χ²(3) = 26,46, t = 2,68 og F = 10,17.

**Udvidet (oktober 2026):** Skemaet har nu 14 spørgsmål. Spørgsmål 11–13 (købsintention, betalingsvillighed og købskriterium) er tilføjet til kundecasen med to grupper: A *Køb og adfærd* og B *Ønsker og holdninger*. Eksemplets formål og forskningsspørgsmål følger problemformuleringen på statistiksidens side *Om casen*. Kodebogens tredje kolonne hedder nu **Skalatype** begge steder.

---

## SonicWave-skemaet (fælles for begge sider)

| # | Variabel | Spørgsmål | Skala i designeren | Skalatype | Rute |
|---|---|---|---|---|---|
| 1 | `alder` | Hvor gammel er du? | Talsvar (år) | Ratio | **Screening:** under 20 eller over 55 → skemaet slutter |
| 2 | `foretrukken_farve` | SonicWaves nye model kommer i tre farver. Hvilken foretrækker du? | MC (ét svar) | Nominal | |
| 3 | `ejer_produkt` | Ejer du en SonicWave-højttaler? | MC (ét svar) | Nominal | **Filter:** kun «Ja» får 4–7 |
| 4 | `produktlinje` | Hvilken produktlinje ejer du? | MC (ét svar) | Nominal | Kun hvis «Ja» til 3 |
| 5 | `kanal` | Hvor købte du din SonicWave? | MC (ét svar) | Nominal | Kun hvis «Ja» til 3 |
| 6 | `ordreværdi` | Hvad betalte du for din SonicWave? (kr.) | Talsvar (kr.) | Ratio | Kun hvis «Ja» til 3 |
| 7 | `tilfredshed` | Hvor tilfreds er du alt i alt med din SonicWave? (1–10) | Numerisk (1–10) | Interval* | Kun hvis «Ja» til 3 |
| 8–10 | `q1`–`q3` | “SonicWave har god lydkvalitet” · “… er pengene værd” · “… er for dyr” (negativt formuleret) | Likert 5 + Ved ikke | Ordinal (Likert) | Ét emne med tre udsagn (indeks = niveau 2) |
| 11 | `købsintention` | SonicWaves nye model kommer på markedet næste år. Hvor sandsynligt er det, at du køber den inden for det første år? | Sandsynlighedsskala (1–5 + Ved ikke) | Ordinal | Alle (gruppe A) |
| 12 | `betalingsvillighed` | Hvad vil du højst betale for en trådløs højttaler? (kr.) | Talsvar (kr.) | Ratio | Alle (gruppe A) |
| 13 | `købskriterium` | Hvad er vigtigst for dig, når du køber en højttaler? | MC (ét svar) | Nominal | Lydkvalitet · Pris · Design · Batteritid · Mærke (gruppe B) |
| 14 | `køn` | Hvad er dit køn? | MC (ét svar) | Nominal | Kvinde · Mand · Vil ikke oplyse |

\* Tilfredshed 1–10 er strengt taget ordinal, men behandles som interval. Det står på begge sider.

---

## Hvad der er rettet

### I Spørgeskemadesigneren
| | Før | Nu |
|---|---|---|
| D1 | Likert, vigtighed og sandsynlighed: "ordinal med metrisk tilføjelse (behandles som interval)" | **Ordinal**. Vis svarene som en fordeling (som statistiksiden) |
| D2 | Numerisk skala 0–10 som "interval" | "Ordinal (behandles som interval)", og en ny 1–10-variant |
| D3 | Ingen skala til præcise tal | Ny skala **Talsvar (præcist tal)**, ratio |
| D4 | Kun screening | **Springlogik** ved siden af screening. Den vises i udkast og kodebog, rækkefølgetrinnet advarer, og AI-prompten forstår den |
| D5 | Ét spørgsmål pr. emne | **Niveau 2:** flere udsagn pr. emne (indeks) og negativt formulerede udsagn |
| D6 | "Ved ikke" kun ved multiple choice | "Ved ikke" på Likert, vigtighed og sandsynlighed, med koden 99 → tom celle |
| D7 | Intet eksempel, ingen kodebog | **Indlæs eksempel: SonicWave** og kodebog i trin 6 (skærm, Word/PDF, .txt, .csv) med statistiksidens kolonner |
| + | Svarmuligheder var pladsholdere | Den studerende skriver selv svarmuligheder, enhed eller endepunkter |
| + | Siden gik i hvidt ved nyt emne + spring frem; intet blev gemt | Man kan ikke hoppe forbi et ufærdigt trin; arbejdet gemmes automatisk |

### I SonicWave-casen (statistiksiden og datasættet)
| | Før | Nu |
|---|---|---|
| S1 | Farve: tre farver uden forklaring, selv om der sælges fire | "Den nye model kommer i tre farver", og Navy udgår (forklaret i § 01 og § 04) |
| S2 | Køn og alder først; ufuldstændige havde køn + alder | Alder er **screening** og står først, og køn står sidst. Ufuldstændige har alder + farve. Kolonnerne følger skemaets rækkefølge |
| S3 | "Hvor så du første gang SonicWave?" | "Hvor købte du din SonicWave?" (købskanal), som passer til t-testen |
| S4 | Køn uden "Vil ikke oplyse" | "Vil ikke oplyse" (6 respondenter, bruges ikke i testene) |

### Lavere sværhedsgrad på statistiksiden
De studerende skal kun kunne **Chi², t-test og ANOVA**. Alt andet ligger i lukkede bokse mærket **Niveau 2**:
- Welch-frihedsgrader og Levene
- parret t-test
- post hoc/Tukey og η²
- Fisher og Cramérs V
- type II-fejl og styrke
- indeks og omvendt kodning
- regression
- to af quizzens 16 spørgsmål (nu ekstraopgaver)

Det samme gælder rensningen: Den rå eksport findes i en **basisudgave** med tre fejltyper (dubletter, ufuldstændige besvarelser, 99) og i en **niveau 2-udgave** med alle syv fejltyper.

---

## Sådan holdes siderne ens fremover

1. Ændres SonicWave-skemaet, så ret **tre steder**:
   - `sonicWaveExample()` i `spoergeskemadesigner.jsx`
   - `CODEBOOK` i `statistiske_test.jsx`
   - `CODEBOOK` i `data/generate_dataset.py`
2. Den nemmeste kontrol: Indlæs eksemplet i designeren, gå til trin 6, og sammenlign kodebogen med § 01 på statistiksiden (eller download `kodebog.csv`).
3. Kør `npm run data` i `tests` efter ændringer i generatoren. Scriptet skal stadig give χ² = 103,94, t = 2,677 og F = 10,17. Nye tilfældige valg skal bruge `rng2`.
4. Begge sider bygges med `npm run build`.
