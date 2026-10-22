# Kongruens: Spørgeskemadesigneren ↔ Statistiske test (SonicWave)

*Tjek af, om de to undervisningssider siger det samme, med særligt fokus på SonicWave-casen. Oktober 2026.*

| Side | Repository | Rolle |
|---|---|---|
| **Spørgeskemadesigneren** | `arma-dania/Spoergeskemadesigner` (`spoergeskemadesigner.jsx`) | Sprint 2: fra formål til spørgeskema |
| **Statistiske test** | `arma-dania/tests`, gren `claude/upbeat-fermi-th1k12` (`statistiske_test.jsx`, `data/`) | Sprint 3: fra datasæt til test, bygget på SonicWave-casen |

**Metode:** De 11 spørgsmål i SonicWaves kodebog (`statistiske_test.jsx` linje 4115-4129 og `data/generate_dataset.py`) er ført igennem designerens seks trin. For hvert spørgsmål er designerens emnetype, skala og måleniveau sammenholdt med statistiksidens kodebog og afsnittet om måleniveauer (§ 01). Formuleringerne er også kørt gennem designerens regelbaserede tjek.

**Konklusion i én sætning:** Formuleringerne er i orden (designeren giver ingen advarsler på nogen af de 11 spørgsmål), men der er **fem strukturelle uoverensstemmelser**. En studerende, der følger designeren, *kan ikke* bygge SonicWave-skemaet, og designeren lærer på to punkter noget andet end statistiksiden.

---

## 1. Spørgsmål for spørgsmål

| # | Variabel (statistiksiden) | Spørgsmål | Måleniveau på statistiksiden | Bedste match i designeren | Designerens måleniveau | Status |
|---|---|---|---|---|---|---|
| 1 | `køn` | Hvad er dit køn? | Nominal | Demografi · MC (ét svar) | nominal | ✅ (men mangler "Vil ikke oplyse", se S4) |
| 2 | `alder` | Hvor gammel er du? | **Ratio** (år 20-55) | Demografi · *Kategoriserede svar* | ordinal eller nominal | ❌ **Designeren har ingen skala til et præcist tal** (D3) |
| 3 | `foretrukken_farve` | Hvilken farve foretrækker du til en højttaler? | Nominal | Holdning · MC (ét svar) | nominal | ⚠️ Listen er ikke udtømmende (S1) |
| 4 | `ejer_produkt` | Ejer du en SonicWave-højttaler? | Nominal | Adfærd · MC (ét svar) | nominal | ❌ **Er et filter (springlogik), ikke screening.** Designeren kender kun screening (D4) |
| 5 | `produktlinje` | Hvilken produktlinje ejer du? | Nominal | Adfærd · MC (ét svar) | nominal | ⚠️ Stilles kun til ejere. Kan ikke angives i designeren (D4) |
| 6 | `kanal` | Hvor så du første gang SonicWave? | Nominal | Adfærd/viden · MC (ét svar) | nominal | ⚠️ Ordlyd vs. brug i t-testen (S3) |
| 7 | `ordreværdi` | Hvad betalte du for din seneste ordre? (DKK) | **Ratio** (kroner) | Adfærd · ingen passende | (åbent = "kvalitativt") | ❌ **Ingen skala til et præcist tal** (D3) |
| 8 | `tilfredshed` | Hvor tilfreds er du alt i alt? (1-10) | Interval\* ("behandles som") | Holdning · Numerisk skala (**0-10**) | **interval** (uden forbehold) | ⚠️ 0-10 vs. 1-10, og forbeholdet mangler (D2) |
| 9 | `q1_lydkvalitet` | "SonicWave har god lydkvalitet" | **Ordinal (Likert)** | Holdning · Likert (5) | **ordinal med metrisk tilføjelse (behandles som interval)** | ❌ **Modstridende lære om Likert** (D1) |
| 10 | `q2_pengene_værd` | "SonicWave-højttalere er pengene værd" | Ordinal (Likert) | som q1 | som q1 | ❌ som q1, og q1-q3 er ét indeks (D5) |
| 11 | `q3_for_dyr` | "SonicWave er for dyr" (negativt formuleret) | Ordinal (Likert), vendes (6 − q3) | som q1 | som q1 | ❌ Designeren kender ikke omvendt kodede items (D5) |

Rækkefølgen strider også mod designerens regel: SonicWave stiller `køn` og `alder` **først**. De 22 ufuldstændige besvarelser har kun køn og alder udfyldt. Designeren siger *"demografi til sidst, bortset fra screening"* (S2).

---

## 2. De fem væsentlige uoverensstemmelser

### ❌ 1. Likert: ordinal eller interval? (de to sider lærer modsat)
- **Designeren** (`SCALES`, `likert5`, `likert7`, `vigtighed`, `sandsynlighed`): *"ordinal med metrisk tilføjelse (behandles som interval)"*. Beskrivelsen siger, at det netop er den metriske tilføjelse, der "gør skalaen behandlelig som interval". Teksten indgår også i AI-prompterne (`scale.measurement`), så AI-feedbacken vil sige det samme.
- **Statistiksiden** (§ 01, beslutningstræet, glossaret, kodebogen): *Ét Likert-spørgsmål er strengt taget **ordinalt**. Vis fordelingen og test med Chi². Gennemsnit er almindelig praksis, men skal nævnes som en begrænsning. **Et indeks** af flere spørgsmål kan behandles som interval.*
- **Konsekvens:** En studerende, der i sprint 2 har lært "Likert = interval", møder i sprint 3 en kodebog, hvor q1-q3 står som ordinale, og et beslutningstræ, der sender ét Likert-spørgsmål til Chi².

### ❌ 2. Ingen skala til præcise tal (alder, ordreværdi)
SonicWave spørger til **præcis alder** og **ordreværdi i kroner**, begge ratio, og danner `aldersgruppe` bagefter. Designeren har ingen skala til det. *Åbent spørgsmål* er "kvalitativt", og *Kategoriserede svar* er ordinal. Statistiksiden advarer endda mod at gruppere kvantitative variable på forhånd ("mister du information unødigt"). Designerens AI-prompt foreslår godt nok "at spørge til præcis alder", men der findes ingen skala at vælge.

### ❌ 3. Springlogik findes ikke i designeren
`ejer_produkt` er et **filterspørgsmål**. De 480, der svarer *Nej*, springer produktlinje, kanal, ordreværdi og tilfredshed over, men **bliver i undersøgelsen**, fordi de skal med i Chi²-analysen af farve (n = 800). Statistiksiden har et helt afsnit og et quizspørgsmål om, at tomme celler pga. springlogik ikke er manglende svar.

Designeren kender kun **screening**, som den definerer som noget, der frasorterer respondenten (*"ellers spilder respondenten tid på et skema der alligevel kasseres"*). En studerende, der markerer `ejer_produkt` som screening, vil:
- miste 480 respondenter og dermed farveanalysen på alle 800
- få AI-feedback om at placere spørgsmålet allerførst

### ❌ 4. Ét spørgsmål pr. emne, men SonicWave måler holdning med et indeks
Designeren siger *"Skriv ét spørgsmål per emne"* og har kun ét tekstfelt pr. emne. SonicWaves holdning til brandet måles med **tre udsagn (q1-q3)**, der samles i et indeks, og et af dem er **bevidst negativt formuleret** og skal vendes (6 − q3). Statistiksiden bruger det til at forklare indeks og omkodning. Designeren kan hverken lave flere items pr. emne eller markere et item som omvendt kodet. Dens regelbaserede tjek advarer generelt mod negationer (det rammer dog ikke q3, som ikke indeholder "ikke").

### ❌ 5. "Ved ikke" er ikke en del af designerens Likert-skala
SonicWaves Likert-spørgsmål har *"Ved ikke"* (kodet 99 → tom), og statistiksidens quiz lærer, at *"Ved ikke" ≠ midtpunktet 3*. Designerens Likert-svarmuligheder har ikke "Ved ikke". Den nævner det kun ved multiple choice ("evt. 'Ved ikke'").

---

## 3. Mindre uoverensstemmelser i selve SonicWave-casen

Her bryder SonicWave-skemaet med designerens egne regler for god praksis. Det skal enten rettes i casen eller bruges bevidst som et diskussionspunkt.

| | Problem | Designerens regel | Hvor |
|---|---|---|---|
| **S1** | Farvespørgsmålet har kun *Sort · Hvid · Sand*, men SonicWave sælger **fire** farver (Navy i Salg Q3), og der er ingen *Andet/Ved ikke*. | MC (ét svar): "Listen skal være udtømmende OG gensidigt udelukkende. Inkludér altid 'Andet'". | Kodebog, `generate_dataset.py` (`COLORS`), § 04 goodness-of-fit |
| **S2** | Køn og alder stilles først. De ufuldstændige besvarelser har kun køn og alder. | "Demografi til sidst, bortset fra screening-demografi." | `RAW_COLS`-rækkefølge, `incomplete` i generatoren |
| **S3** | `kanal` spørger, hvor man *første gang så* SonicWave, men t-testen omtaler det som kunder *fra* Instagram/Facebook (købskanal). *Butik* er heller ikke et sted, man typisk "ser" et brand første gang online. | Emne-match: måler spørgsmålet det, emnet beskriver? | Kodebog linje 4123, t-test-casen § 05 |
| **S4** | Køn har kun *Kvinde · Mand*, uden *Andet/Vil ikke oplyse*. | Kategorier: "Tilbyd 'Vil ikke svare' på sensitive variable". | Kodebog, generator |
| **S5** | Tilfredshed er 1-10. Designerens numeriske skala er 0-10 (NPS). | Ikke en fejl, men designeren bør kunne begge. | `SCALES.numerisk` |

---

## 4. Anbefalede rettelser

**Princip:** Statistiksiden og datasættet er *facit*, fordi alle tal i casene er låst til det genererede datasæt. Designeren tilpasses derfor til statistiksiden. Casen ændres kun dér, hvor SonicWave-skemaet bryder god praksis, og helst uden at ændre de tal, testene giver.

### I Spørgeskemadesigneren
| | Rettelse | Omfang |
|---|---|---|
| **D1** | Likert, vigtighed og sandsynlighed: måleniveau → *"ordinal (ét udsagn) · indeks af flere udsagn kan behandles som interval"*. Beskrivelsen omskrives, så den matcher statistiksidens § 01 ordret i substansen. | Lille (tekst i `SCALES`) |
| **D2** | Numerisk skala: måleniveau → *"ordinal, behandles som interval"*. Tilføj 1-10 som variant, eller skriv "0-10 eller 1-10". | Lille |
| **D3** | **Ny skala: "Talsvar (præcist tal)"**, ratio, til alder, beløb og antal. Formuleringstip: "Angiv enhed (år, kr., antal)". Faldgrube: "Gruppér først i analysen, ikke i spørgsmålet". | Lille |
| **D4** | **Springlogik ved siden af screening:** "Stilles kun til dem, der svarer ___ på spørgsmål ___". Vises i udkastet som *"(Kun hvis Ja til spm. 4)"*. Rækkefølge-prompten opdateres, så filterspørgsmål står før deres opfølgning, men *ikke* nødvendigvis først. | Mellem |
| **D5** | **Flere udsagn pr. emne (indeks)** for holdning med Likert, med et flag *"negativt formuleret, vendes før indeks"*. | Mellem-stor |
| **D6** | Likert, vigtighed og sandsynlighed får svarmuligheden *"Ved ikke"* med noten *"kodes separat (fx 99), ikke som midtpunkt"*. | Lille |
| **D7** | **"Indlæs eksempel: SonicWave"** udfylder alle seks trin med præcis de 11 spørgsmål fra kodebogen. Udkastet får en kodebog med samme kolonner som statistiksiden (*Variabel · Spørgsmål · Måleniveau · Koder · Manglende værdi*). Det er den stærkeste garanti for kongruens: de studerende ser det samme skema i sprint 2 og sprint 3. | Mellem |

### I SonicWave-casen (statistiksiden og datasættet)
| | Rettelse | Ændrer testtallene? |
|---|---|---|
| **S1** | Omformulér til *"Hvilken af de tre nye farver foretrækker du til den nye model?"*, og forklar, at Navy udgår af den nye model. Så er listen udtømmende inden for beslutningen, og Chi² på 3 × 3 er uændret. | Nej |
| **S2** | Gør alder til **screening** (målgruppe 20-55 år, hvilket forklarer aldersspændet), og flyt køn til sidst. Så indeholder de ufuldstændige besvarelser *alder + farve* i stedet for *køn + alder*. | Nej (kun rå eksport og kolonnerækkefølge) |
| **S3** | Omdøb til *"Hvor købte du din SonicWave?"* (købskanal), som passer til t-testens fortolkning. Alternativt beholdes ordlyden, og casen omtales som "første kontaktpunkt". | Nej (kun tekst) |
| **S4** | Tilføj *"Andet / Vil ikke oplyse"* i kodebogen med 0 svar, eller nævn det under begrænsninger. | Nej |

---

*Detaljer om de enkelte linjer: designeren `spoergeskemadesigner.jsx` linje 40-171 (`SCALES`), 466-473 (rækkefølgeprincipper), 864-883 (screening), 1141 ("ét spørgsmål per emne"). Statistiksiden `statistiske_test.jsx` linje 4115-4129 (kodebog), 4176-4182 (måleniveauer), 4414-4440 (springlogik og Likert), 3375-3379 (quiz om "ved ikke"), 1804-1871 (fire farver).*
