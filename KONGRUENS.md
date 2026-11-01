# Kongruens: Spørgeskemadesigneren ↔ Statistiske test

| Side | Repository | Rolle |
|---|---|---|
| **Spørgeskemadesigneren** | `arma-dania/Spoergeskemadesigner` (`spoergeskemadesigner.jsx`) | Kvantitativ metode, sprint 3: fra formål til spørgeskema og kodebog |
| **Statistiske test** | `arma-dania/tests` (`statistiske_test.jsx`, `data/`) | Kvantitativ metode, sprint 3: fra datasæt til Chi², t-test og ANOVA |

**Status (november 2026): to skemaer med hver sin rolle.**

| Skema | Rolle | Hvor |
|---|---|---|
| **Eksemplet: SonicWaves webshopundersøgelse** (sidste år) | Løst eksempel (modellering). Viser metoden uden at løse holdets opgaver | Designerens *Indlæs eksemplet* og eksempeldataene på statistiksiden |
| **Holdets SonicWave-skema** (den nye model, 14 spørgsmål) | Gruppernes opgave med facit (*Tjek dine tal*) | Statistiksidens *Om casen*, kodebog og øvelsesdatasæt. Findes **ikke** i designeren — grupperne indtaster det selv |

Knappen *Indlæs eksemplet* giver en kodebog, der er **ordret den samme** som eksempelkodebogen på statistiksiden.

---

## Eksemplet: SonicWaves webshopundersøgelse

**Formål:** SonicWave vil forbedre sin webshop og bruge markedsføringsbudgettet bedre. Undersøgelsen skal give grundlag for at beslutte, hvor annoncerne skal ligge, og hvad der skal forbedres først i webshoppen.
**Forskningsspørgsmål:** Hvor hører danskere på 18 år og derover om SonicWave, og hænger det sammen med, hvor ofte de lytter til musik? Hvordan oplever kunderne webshoppen, og er oplevelsen forskellig for nye og faste kunder?
**Målgruppe:** Danskere på 18 år og derover

| # | Variabel | Spørgsmål | Skala i designeren | Skalatype | Rute |
|---|---|---|---|---|---|
| 1 | `over_18` | Er du fyldt 18 år? | MC (ét svar) | Nominal | **Screening:** Nej → skemaet slutter |
| 2 | `hørt_om` | Hvor hørte du første gang om SonicWave? | MC (ét svar) | Nominal | |
| 3 | `lyttefrekvens` | Hvor mange gange har du lyttet til musik på en højttaler den seneste uge? | Frekvensskala (konkret) | Ordinal | |
| 4 | `købt_webshop` | Har du købt noget i SonicWaves webshop inden for det seneste år? | MC (ét svar) | Nominal | **Filter:** kun «Ja» får 5–10 |
| 5 | `kundetype` | Var det første gang, du købte i SonicWaves webshop? | MC (ét svar) | Nominal | Kun hvis «Ja» til 4 |
| 6 | `minutter` | Hvor mange minutter brugte du i webshoppen ved dit seneste køb? | Talsvar (minutter) | Ratio | Kun hvis «Ja» til 4 |
| 7 | `vurdering` | Hvordan vurderer du SonicWaves webshop alt i alt? (1–10) | Numerisk (1–10) | Interval* | Kun hvis «Ja» til 4 |
| 8–10 | `q1`–`q3` | “Det var nemt at finde det, jeg søgte” · “Leveringen var hurtig” · “Webshoppen er forvirrende” (negativt formuleret) | Likert 5 + Ved ikke | Ordinal (Likert) | Kun hvis «Ja» til 4. Ét emne med tre udsagn (indeks = niveau 2) |
| 11 | `forbrug_elektronik` | Hvor meget har du i alt brugt på elektronik det seneste år? (kr.) | Talsvar (kr.) | Ratio | |
| 12 | `region` | I hvilken region bor du? | MC (ét svar) | Nominal | Demografi til sidst |

\* Vurderingen 1–10 er strengt taget ordinal, men behandles som interval.

Gennemgående eksempler på statistiksiden: Chi² *hørt om × lyttefrekvens*, t-test *vurdering for nye vs. faste kunder*, ANOVA *minutter × hørt om*.

---

## Hvad der er rettet (oktober 2026)

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

1. Ændres eksemplet, så ret **tre steder**:
   - `webshopExample()` i `spoergeskemadesigner.jsx`
   - `EXAMPLE_CODEBOOK` i `statistiske_test.jsx`
   - kodebogen i `data/generate_example.py`
2. Den nemmeste kontrol: Indlæs eksemplet i designeren, gå til trin 6, og sammenlign kodebogen med eksempelkodebogen på statistiksiden.
3. Holdets SonicWave-skema rettes kun på statistiksiden (`CODEBOOK` i `statistiske_test.jsx` og i `data/generate_dataset.py`). Kør `npm run data` i `tests` bagefter.
4. Begge sider bygges med `npm run build`.
