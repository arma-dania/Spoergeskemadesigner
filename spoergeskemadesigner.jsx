import React, { useState, useEffect } from 'react';

// ============================================================================
// PEDAGOGISKE DATA
// ============================================================================

const CONSTRUCT_TYPES = [
  {
    id: 'holdning',
    label: 'Holdning',
    description: 'Tanker, vurderinger eller præferencer respondenten har',
    examples: 'tilfredshed, opfattet kvalitet, brand-præference',
  },
  {
    id: 'adfaerd',
    label: 'Adfærd',
    description: 'Hvad respondenten faktisk gør eller har gjort',
    examples: 'købsfrekvens, brug af tjeneste, butiksbesøg',
  },
  {
    id: 'intention',
    label: 'Intention',
    description: 'Hvad respondenten planlægger eller forventer at gøre',
    examples: 'genkøbssandsynlighed, anbefalingsvilje, planlagt forbrug',
  },
  {
    id: 'viden',
    label: 'Viden / kendskab',
    description: 'Hvad respondenten ved, kan genkende eller huske',
    examples: 'brand-kendskab, produktviden, faktuel hukommelse',
  },
  {
    id: 'demografi',
    label: 'Demografisk',
    description: 'Baggrundsvariable til segmentering',
    examples: 'alder, indkomst, uddannelse, husstandstype',
  },
];

const SCALES = [
  {
    id: 'likert5',
    label: 'Likert-skala (5 punkter)',
    measurement: 'ordinal med metrisk tilføjelse (behandles som interval)',
    description: 'Symmetrisk enighedsskala med numeriske ankre (1-5). Det er den metriske tilføjelse og antagelsen om lige afstand mellem trinene, der gør skalaen behandlelig som interval - og dermed adskiller Likert fra rent ordinale skalaer.',
    responseOptions: ['1 Helt uenig', '2 Uenig', '3 Hverken eller', '4 Enig', '5 Helt enig'],
    bestFor: ['holdning', 'intention'],
    formulationHint: 'Formuleres som påstand, ikke spørgsmål: "Jeg er tilfreds med…"',
    pitfall: 'Hold skala-retningen konsistent gennem hele spørgeskemaet.',
  },
  {
    id: 'likert7',
    label: 'Likert-skala (7 punkter)',
    measurement: 'ordinal med metrisk tilføjelse (behandles som interval)',
    description: 'Mere differentieret enighedsskala med numeriske ankre (1-7). Den metriske tilføjelse muliggør interval-behandling - giver større variation, egnet ved nuancerede holdninger.',
    responseOptions: ['1 Helt uenig', '2 Uenig', '3 Lidt uenig', '4 Hverken eller', '5 Lidt enig', '6 Enig', '7 Helt enig'],
    bestFor: [],
    formulationHint: 'Formuleres som påstand. Egnet når du forventer nuancerede holdninger.',
    pitfall: 'Kan være overkill - 5 punkter er ofte tilstrækkeligt.',
  },
  {
    id: 'semantisk',
    label: 'Semantisk differential',
    measurement: 'interval',
    description: 'To modsatrettede udtryk med en skala imellem.',
    responseOptions: ['Eks: Billig — — — — — — — Dyr'],
    bestFor: ['holdning'],
    formulationHint: 'Vælg ordpar der reelt er antonymer i målgruppens sprog.',
    pitfall: 'Undgå tekniske ord - test ordparrene i pilot.',
  },
  {
    id: 'numerisk',
    label: 'Numerisk skala (0-10)',
    measurement: 'interval',
    description: 'Talvurdering, fx NPS-stilen 0-10.',
    responseOptions: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    bestFor: ['holdning', 'intention'],
    formulationHint: 'Angiv altid hvad endepunkterne betyder ("0 = meget usandsynligt").',
    pitfall: 'Tal tolkes kulturelt forskelligt - en 7\'er kan være enten god eller middel.',
  },
  {
    id: 'frekvens_vag',
    label: 'Frekvensskala (vag)',
    measurement: 'ordinal',
    description: 'Vage frekvensord som "ofte", "sjældent".',
    responseOptions: ['Aldrig', 'Sjældent', 'Nogle gange', 'Ofte', 'Altid'],
    bestFor: ['adfaerd'],
    formulationHint: 'Brug kun til omtrentlig kortlægning - tolkningen er upræcis.',
    pitfall: '"Ofte" tolkes vidt forskelligt af respondenter. Overvej konkrete intervaller i stedet.',
  },
  {
    id: 'frekvens_konkret',
    label: 'Frekvensskala (konkret)',
    measurement: 'ordinal eller ratio',
    description: 'Faktiske antalsintervaller for adfærd.',
    responseOptions: ['0 gange', '1-2 gange', '3-5 gange', '6-10 gange', 'Mere end 10 gange'],
    bestFor: ['adfaerd'],
    formulationHint: 'Specificér tidsperiode: "...inden for de seneste 30 dage".',
    pitfall: 'Intervaller skal dække hele spektrum uden overlap.',
  },
  {
    id: 'vigtighed',
    label: 'Vigtighedsskala',
    measurement: 'ordinal med metrisk tilføjelse (behandles som interval)',
    description: 'Hvor vigtigt et aspekt er for respondenten. Med numeriske ankre (1-5) og antagelsen om lige afstand mellem trinene kan skalaen behandles som interval - samme princip som ved Likert.',
    responseOptions: ['1 Slet ikke vigtigt', '2 Lidt vigtigt', '3 Nogenlunde vigtigt', '4 Vigtigt', '5 Meget vigtigt'],
    bestFor: ['holdning'],
    formulationHint: '"Hvor vigtigt er X, når du…?"',
    pitfall: 'Næsten alt fremstår "vigtigt" - kombinér ofte med rangordning.',
  },
  {
    id: 'sandsynlighed',
    label: 'Sandsynlighedsskala',
    measurement: 'ordinal med metrisk tilføjelse (behandles som interval)',
    description: 'Hvor sandsynligt det er, at respondenten gør noget. Med numeriske ankre (1-5) og antagelsen om lige afstand mellem trinene kan skalaen behandles som interval - samme princip som ved Likert og vigtighedsskalaen.',
    responseOptions: ['1 Slet ikke sandsynligt', '2 Lidt sandsynligt', '3 Sandsynligt', '4 Meget sandsynligt', '5 Helt sikkert'],
    bestFor: ['intention'],
    formulationHint: '"Hvor sandsynligt er det, at du…?"',
    pitfall: 'Intentioner overstiger ofte faktisk adfærd - tolk forsigtigt.',
  },
  {
    id: 'mc_single',
    label: 'Multiple choice (ét svar)',
    measurement: 'nominal',
    description: 'Respondenten vælger én svarmulighed. Bruges når operationaliseringen lægger op til netop ét valg - fx præference, kanalvalg eller faktuelt svar.',
    responseOptions: ['Liste over indbyrdes udelukkende muligheder'],
    bestFor: ['holdning', 'adfaerd', 'intention', 'viden', 'demografi'],
    formulationHint: 'Inkludér altid "Andet" og evt. "Ved ikke" som svarmuligheder.',
    pitfall: 'Listen skal være udtømmende OG gensidigt udelukkende.',
  },
  {
    id: 'mc_multi',
    label: 'Multiple choice (flere svar)',
    measurement: 'nominal',
    description: 'Respondenten kan vælge flere svar samtidigt. Bruges når operationaliseringen lægger op til at flere muligheder kan gælde - fx "hvilke egenskaber er vigtige" (holdning), "hvilke butikker har du besøgt" (adfærd) eller "hvilke vil du overveje" (intention).',
    responseOptions: ['Liste hvor flere kan vælges'],
    bestFor: ['adfaerd', 'viden'],
    formulationHint: 'Tilføj eksplicit: "(sæt gerne flere kryds)".',
    pitfall: 'Hver mulighed bliver reelt en ja/nej-variabel i analysen.',
  },
  {
    id: 'rang',
    label: 'Rangordning',
    measurement: 'ordinal',
    description: 'Respondenten ranker elementer i prioritetsrækkefølge. Velegnet både til at indfange relative præferencer (holdning) og prioritering af planlagte handlinger (intention).',
    responseOptions: ['1. plads, 2. plads, 3. plads…'],
    bestFor: [],
    formulationHint: 'Begræns til 3-7 elementer.',
    pitfall: 'Kognitivt tungt - ikke alle gennemfører rangordning korrekt.',
  },
  {
    id: 'aaben',
    label: 'Åbent spørgsmål',
    measurement: 'kvalitativt',
    description: 'Respondenten skriver svar med egne ord.',
    responseOptions: ['Fri tekst'],
    bestFor: ['viden'],
    formulationHint: 'Brug sparsomt - mange respondenter springer åbne spørgsmål over.',
    pitfall: 'Krævende analyse. Overvej om et lukket spørgsmål kunne dække behovet.',
  },
  {
    id: 'kategorier',
    label: 'Kategoriserede svar',
    measurement: 'ordinal eller nominal',
    description: 'Foruddefinerede kategorier - typisk demografiske, men også prisintervaller, beløbsstørrelser eller andre naturligt kategoriserbare værdier.',
    responseOptions: ['Aldersgrupper, indkomst- eller prisintervaller, m.v.'],
    bestFor: ['adfaerd', 'intention', 'demografi'],
    formulationHint: 'Vælg intervaller der matcher dine ønskede analysesegmenter.',
    pitfall: 'Tilbyd "Vil ikke svare" på sensitive variable som indkomst.',
  },
];

const SCALE_BY_ID = Object.fromEntries(SCALES.map(s => [s.id, s]));
const CONSTRUCT_TYPE_BY_ID = Object.fromEntries(CONSTRUCT_TYPES.map(c => [c.id, c]));

// Skalaer hvor responseOptions er konkrete svarmuligheder, der kan vises direkte.
// De øvrige (mc_single, mc_multi, rang, aaben, semantisk, kategorier) har
// responseOptions som beskrivende placeholder - den studerende skal selv tilføje konkrete svarmuligheder før udsendelse.
const REAL_OPTION_SCALES = new Set(['likert5', 'likert7', 'numerisk', 'frekvens_vag', 'frekvens_konkret', 'vigtighed', 'sandsynlighed']);

// ============================================================================
// RULE-BASED FORMULATION CHECKS
// ============================================================================

function ruleBasedChecks(question) {
  const issues = [];
  const q = question.trim();
  if (q.length < 10) return [{ type: 'warn', text: 'Spørgsmålet er meget kort - sandsynligvis upræcist.' }];

  // Double-barreled
  if (/\b(og|samt|eller)\b/i.test(q) && q.split(/\b(og|samt|eller)\b/i).length > 2) {
    issues.push({ type: 'warn', text: 'Spørgsmålet kan være dobbelt-barreled (måler to ting). Tjek om "og"/"samt"/"eller" forbinder to selvstændige forhold.' });
  }
  // Negationer
  if (/\bikke\b|\baldrig\b/i.test(q)) {
    issues.push({ type: 'info', text: 'Indeholder negation - kan være kognitivt forvirrende. Overvej en positiv formulering.' });
  }
  // Ledende ord
  if (/\b(naturligvis|selvfølgelig|jo|enig\?|ikke sandt)\b/i.test(q)) {
    issues.push({ type: 'warn', text: 'Indeholder ledende formulering der kan farve svaret.' });
  }
  // Lukkede stikord der virker som introduktion
  if (q.length > 200) {
    issues.push({ type: 'info', text: 'Spørgsmålet er meget langt - respondenter mister fokus. Forkort hvis muligt.' });
  }
  // Hypotetisk
  if (/\bhvis du\b|\bforestil dig\b|\bantag\b/i.test(q)) {
    issues.push({ type: 'info', text: 'Hypotetisk formulering - svar afspejler ofte ikke faktisk adfærd.' });
  }

  return issues;
}

// ============================================================================
// API-KALD TIL CLAUDE
// ============================================================================

const FEEDBACK_TONE = `SPROG - hold det enkelt og direkte:
- Korte sætninger, højst ca. 15 ord. Hellere to korte end én lang med "hvorved", "således at" og "i forhold til".
- Aktivt sprog: "du måler X" frem for "der måles X".
- Hverdagsord frem for metodisk jargon. Skriv "bredt" i stedet for "underspecificeret", "klart" i stedet for "tilstrækkeligt operationaliseret", "passer" i stedet for "er kongruent med", "rammer ved siden af" i stedet for "indfanger ikke emnet".
- FORBUDTE ORD i feedbacken: "konstrukt" (skriv "emne" eller "det du vil måle"), "operationalisere" som verbum (skriv "afgrænse" eller "gøre konkret"), "kongruent", "validitet" (skriv "rammer rigtigt"), "respondent" (skriv "den der svarer" eller bare "kunden"/"personen"). Substantiver som "operationalisering" som tingen-i-feltet er ok, men brug det sparsomt.
- Ét punkt pr. sætning. Har du to observationer, så lav to sætninger.
- Drop hedging-fyld som "kunne måske", "det kan argumenteres", "i et vist omfang", "der kan være tendens til". Sig det direkte.
- Tal til den studerende: "du har...", "prøv at...", "det her gør at...". Ikke om spørgsmålet i tredje person.
- Konkrete eksempler eller modforslag frem for abstrakte beskrivelser, når det hjælper.

Vær venlig men ærlig. Hvis noget halter, så sig det rent ud - bare uden at gøre det stort.`;

async function evaluateWithAI(question, construct, scale, topic) {
  const prompt = `Du er en erfaren underviser i markedsanalyse, der hjælper en studerende med at skærpe deres spørgsmålsformulering.

${FEEDBACK_TONE}

KONTEKST FRA UNDERSØGELSEN:
Formål: ${topic?.purpose || '(ikke angivet)'}
Forskningsspørgsmål: ${topic?.research_question || '(ikke angivet)'}
Målgruppe: ${topic?.target_group || '(ikke angivet)'}

VIGTIGT OM MÅLGRUPPE OG KATEGORISERING:
Når du foreslår konkrete svarmuligheder, aldersgrupper, indkomstintervaller, prisintervaller eller andre kategorier, SKAL de respektere den angivne målgruppe. Hvis målgruppen er 17-25-årige, så foreslå IKKE aldersgrupper som "18-29, 30-44, 45-59" - de fleste falder udenfor. Lav i stedet finere inddelinger inden for målgruppens spænd (fx "17-19, 20-22, 23-25") eller foreslå at spørge til præcis alder. Samme princip gælder indkomst, geografi og andre demografiske inddelinger: intervallerne skal være meningsfulde for netop den målgruppe, undersøgelsen handler om.

EMNE: ${construct.name}
EMNE-TYPE: ${CONSTRUCT_TYPE_BY_ID[construct.type].label} (${CONSTRUCT_TYPE_BY_ID[construct.type].description})
DEFINITION/OPERATIONALISERING: ${construct.definition || '(ingen angivet)'}

VALGT SVARSKALA: ${scale.label} - måleniveau: ${scale.measurement}
SVARMULIGHEDER: ${scale.responseOptions.join(' | ')}

SPØRGSMÅL TIL VURDERING: "${question}"

Vurder i tre dimensioner. For hver: angiv score (god/nogen/svag) og 1-2 sætningers konkret feedback i samtaletone.

1. EMNE-MATCH: Måler spørgsmålet faktisk det, emnet beskriver? Eller måler det noget beslægtet, men forskelligt?
2. SKALA-MATCH: Passer spørgsmålets formulering til svarskalaen? (Likert kræver påstand, frekvens kræver "hvor ofte", etc.) Hvis skalaen er "Kategoriserede svar", så tjek om kategorierne passer til målgruppen.
3. FORMULERING: Er spørgsmålet klart? Fri for ledende ord, dobbeltspørgsmål, jargon, negationer, hypotetiske præmisser?

Hvis spørgsmålet kan skærpes: giv ÉT konkret omformuleringsforslag. Eventuelle foreslåede kategorier/aldersgrupper SKAL ligge inden for målgruppens spænd. Ellers: null.

Svar UDELUKKENDE med gyldig JSON i præcis dette format:
{
  "emne_match": { "score": "god", "feedback": "..." },
  "scale_match": { "score": "god", "feedback": "..." },
  "formulation": { "score": "god", "feedback": "..." },
  "suggestion": null
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!res.ok) throw new Error(`API svarede med ${res.status}`);
    const data = await res.json();
    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const cleaned = text.replace(/```json|```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Kunne ikke parse svar');
    return JSON.parse(match[0]);
  } catch (e) {
    return { error: e.message };
  }
}

async function evaluateEmneWithAI(construct, topic) {
  const ctype = CONSTRUCT_TYPE_BY_ID[construct.type];
  const prompt = `Du er en erfaren underviser i markedsanalyse, der hjælper en studerende med at skærpe et emne i deres spørgeskema.

${FEEDBACK_TONE}

VIGTIGT - METODISK HIERARKI:
Spørgeskemadesign forløber i adskilte trin, og operationalisering hører til ét bestemt sted i kæden:

  Trin 2 (DETTE TRIN): EMNE - HVAD skal måles? (abstrakt definition)
  Trin 3: SKALA - HVORDAN skal det måles? (måleniveau, skalatype)
  Trin 4: SPØRGSMÅL - eksakt formulering + svarmuligheder

På dette trin handler operationaliseringen om at definere HVAD emnet betyder - tilstrækkeligt konkret til, at det er klart hvad der skal måles. Den må IKKE allerede angive antal svarmuligheder, eksakte respondentinstruktioner ("vælg én blandt 5"), skalaformat eller specifikke svarværdier - alt det hører til på senere trin.

Hvis operationaliseringen er for konkret og foregriber skalavalg eller spørgsmålsformulering, så flag det venligt og hjælp den studerende op på det rette abstraktionsniveau.

OM TYPE-KLASSIFIKATIONEN:
De fem typer i værktøjet er HOLDNING, ADFÆRD, INTENTION, VIDEN og DEMOGRAFI - og KUN disse fem. Brug ALDRIG andre kategorinavne i din feedback (fx "motivation", "præference", "evaluering", "behov", "tilfredshed-som-type") - de findes ikke som valgmulighed for den studerende, og forvirrer mere end de hjælper. Hvis du intuitivt vil bruge et andet ord, oversæt til den nærmeste af de fem:
- "motivation" → typisk HOLDNING (når det handler om hvad respondenten værdsætter) eller INTENTION (når det handler om fremadrettet handling)
- "præference" → HOLDNING
- "evaluering"/"vurdering"/"oplevelse" → HOLDNING
- "behov" → HOLDNING
- "kendskab" → VIDEN
- "valg"/"hvad gjorde du" → ADFÆRD
- "vil du"/"planlægger du" → INTENTION

Type-klassifikationen er en GUIDE til at vælge passende skala - ikke en streng ontologi. Mange emner er hybride - HER ER DE KLASSISKE GRÅZONE-TILFÆLDE:
- "tilfredshed" → HOLDNING (vurdering) ELLER ADFÆRD (rapporteret oplevelse); begge forsvarlige
- "genkøbssandsynlighed" → INTENTION ELLER HOLDNING; begge forsvarlige
- "årsag til seneste køb" / "motivation bag køb" → ADFÆRD (faktisk hændelse) ELLER HOLDNING (begrundelse); begge forsvarlige
- "præference målt via faktisk valg" → ADFÆRD (det rapporterede valg) ELLER HOLDNING (præferencen bag); begge forsvarlige
- "brand-kendskab" → VIDEN ELLER HOLDNING (genkendelse vs. vurdering)

Vær VELVILLIG i vurderingen:
- "god" hvis den valgte type er rimelig og defensiblel for emnet
- "nogen" KUN hvis en anden type tydeligt ville passe bedre, men den valgte ikke er forkert
- "svag" KUN hvis typen er klart forkert (fx hvis 'alder' var klassificeret som HOLDNING)

KRITISK ANTI-FLIP-FLOP-REGEL: Hvis emnet er en gråzone hvor BEGGE typer er forsvarlige, så SKAL du give "god" uanset hvilken type den studerende har valgt. Du må IKKE skrive "X er mere korrekt" eller "Y ville passe bedre" når den valgte type er forsvarlig. Hvis to undervisere kunne være uenige om typevalget, er den studerendes valg pr. definition forsvarligt - så sig "Det her er en typisk gråzone, og du kan forsvare valget af [valgt type] med at [konkret begrundelse]." Skift ALDRIG holdning baseret på hvad den studerende har valgt - din vurdering må ikke afhænge af, om de havde sat den anden type på.

Studerende skal ikke straffes for at vælge én rimelig type frem for en anden rimelig type. Default til "god" når valget er forsvarligt.

EMNE-NAVN: "${construct.name}"
TYPE: ${ctype.label} (${ctype.description})
DEFINITION/OPERATIONALISERING: ${construct.definition || '(ingen angivet)'}

KONTEKST FRA UNDERSØGELSEN:
Formål: ${topic.purpose || '(ikke angivet)'}
Forskningsspørgsmål: ${topic.research_question || '(ikke angivet)'}

Vurder i tre dimensioner. For hver: angiv score (god/nogen/svag) og 1-2 sætningers konkret feedback i samtaletone.

1. KLARHED: Er emnet skarpt afgrænset? Eller er det for bredt eller diffust til at kunne måles ordentligt?
2. TYPE-MATCH: Er den valgte type (${ctype.label}) defensiblel for emnet? Default til "god" når valget er rimeligt - kun "nogen" eller "svag" hvis der er en tydelig bedre type. I dit feedback må du KUN bruge de fem typenavne (HOLDNING, ADFÆRD, INTENTION, VIDEN, DEMOGRAFI), aldrig opfinde nye.
3. OPERATIONALISERING: Definerer operationaliseringen klart HVAD der måles, uden at gribe forud for skalavalg og spørgsmålsformulering? Den må gerne være konkret nok til at to forskere ville være enige om hvad der måles - men hvis den allerede specificerer antal svarmuligheder, eksakte instruktioner eller skalaformat, skal det flages som for konkret for dette trin.

   VIGTIGT - læs operationaliseringen i lyset af den VALGTE type. Hvis den studerende har skrevet "måle X ved at spørge til Y", så er Y den konkrete METODE/PROXY, og X det målte - det er IKKE to ting på én gang. Eksempel: "Undersøge præference for prisniveau ved at spørge til prisinterval ved seneste køb" er ét emne (prisinterval ved seneste køb) målt som ADFÆRD, hvor præference er den BAGVEDLIGGENDE interesse. Den slags formulering er FORSVARLIG - flag den ikke som "to retninger" eller "dobbelt-tråd". Ægte dobbelt-tråd er KUN når to selvstændige fænomener forsøges målt med samme spørgsmål, fx "tilfredshed OG forventninger til fremtiden".

Hvis emnet kan skærpes: giv ÉT konkret forslag til en bedre formulering af DEFINITIONEN (ikke navnet). FORSLAGET SKAL HOLDES PÅ EMNE-NIVEAU - dvs. uden konkrete svarmuligheder, uden antal valg, uden skalaformat og uden eksakte spørgsmålsformuleringer. Hvis operationaliseringen er fin som den er, returnér null.

Svar UDELUKKENDE med gyldig JSON i præcis dette format:
{
  "klarhed": { "score": "god", "feedback": "..." },
  "type_match": { "score": "god", "feedback": "..." },
  "operationalisering": { "score": "god", "feedback": "..." },
  "suggestion": null
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!res.ok) throw new Error(`API svarede med ${res.status}`);
    const data = await res.json();
    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const cleaned = text.replace(/```json|```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Kunne ikke parse svar');
    return JSON.parse(match[0]);
  } catch (e) {
    return { error: e.message };
  }
}

async function evaluateSkalaWithAI(construct, scale, justification, topic) {
  const ctype = CONSTRUCT_TYPE_BY_ID[construct.type];
  const recommendedTypes = scale.bestFor.map(t => CONSTRUCT_TYPE_BY_ID[t].label).join(', ');
  const prompt = `Du er en erfaren underviser i markedsanalyse, der hjælper en studerende med at reflektere over deres skalavalg.

${FEEDBACK_TONE}

Studerende skriver ofte "ved ikke", "gæt", "fordi det er bedst" eller lignende intetsigende begrundelser, fordi de ikke kan formulere det metodisk. Det er ikke fordi de ikke ved noget - de mangler bare ord. Hjælp dem ved at give et konkret modeleksempel på en god begrundelse, de kan bygge videre på.

EMNE: ${construct.name}
EMNE-TYPE: ${ctype.label} (${ctype.description})
OPERATIONALISERING: ${construct.definition}

VALGT SKALA: ${scale.label}
MÅLENIVEAU: ${scale.measurement}
SKALAEN ER GENERELT EGNET TIL: ${recommendedTypes}

BEGRUNDELSE FRA DEN STUDERENDE: "${justification || '(ingen begrundelse skrevet endnu)'}"

KONTEKST FRA UNDERSØGELSEN:
Formål: ${topic.purpose || '(ikke angivet)'}
Forskningsspørgsmål: ${topic.research_question || '(ikke angivet)'}

Vurder i tre dimensioner. For hver: angiv score (god/nogen/svag) og 1-2 sætningers konkret feedback i samtaletone.

1. SKALA-EGNETHED: Passer skalaen til emnet og operationaliseringen? Eller var en anden skala mere oplagt? Vær konkret hvis du foreslår en alternativ skala.
2. MÅLENIVEAU: Giver skalaens måleniveau (${scale.measurement}) mening for de analyser, der er meningsfulde for dette emne?
3. BEGRUNDELSE: Er begrundelsen substantiel og metodisk? Eller er den tom (ved ikke, gæt, intet, "fordi det er bedst") eller for overfladisk?

Giv ALTID ÉT konkret forslag til en stærk begrundelse på 1-2 sætninger, som tager udgangspunkt i den valgte skala og det konkrete emne. Forslaget skal være noget, den studerende kan kopiere og evt. tilpasse.

Svar UDELUKKENDE med gyldig JSON i præcis dette format:
{
  "skala_egnethed": { "score": "god", "feedback": "..." },
  "maaleniveau": { "score": "god", "feedback": "..." },
  "begrundelse": { "score": "god", "feedback": "..." },
  "suggestion": "Forslag til begrundelse..."
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!res.ok) throw new Error(`API svarede med ${res.status}`);
    const data = await res.json();
    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const cleaned = text.replace(/```json|```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Kunne ikke parse svar');
    return JSON.parse(match[0]);
  } catch (e) {
    return { error: e.message };
  }
}

async function evaluateOrderWithAI(constructs, scaleChoices, questions, topic) {
  const numbered = constructs.map((c, i) => {
    const scale = SCALE_BY_ID[scaleChoices[c.id]?.scaleId];
    const q = questions[c.id]?.text ?? '(ikke formuleret)';
    const ctype = CONSTRUCT_TYPE_BY_ID[c.type].label;
    const screeningTag = c.isScreening ? ' [SCREENING]' : '';
    return `${i + 1}. [${ctype}]${screeningTag} ${c.name} (${scale?.label ?? '?'}) — "${q}"`;
  }).join('\n');

  const hasScreening = constructs.some(c => c.isScreening);

  const prompt = `Du er en erfaren underviser i markedsanalyse, der hjælper en studerende med at vurdere rækkefølgen af spørgsmål i deres spørgeskema.

${FEEDBACK_TONE}

KONTEKST FOR UNDERSØGELSEN:
Formål: ${topic.purpose || '(ikke angivet)'}
Forskningsspørgsmål: ${topic.research_question || '(ikke angivet)'}
Målgruppe: ${topic.target_group || '(ikke angivet)'}

NUVÆRENDE RÆKKEFØLGE:
${numbered}

PRINCIPPER FOR GOD RÆKKEFØLGE:
- SCREENINGSSPØRGSMÅL (markeret med [SCREENING]) skal placeres ALLERFØRST, før alt andet. De filtrerer hvem der må svare videre - og det skal afgøres øjeblikkeligt, ellers spilder respondenten tid på et skema der alligevel kasseres. Dette gælder OGSÅ hvis screeningsspørgsmålet er demografisk (fx alders-screening når målgruppen er afgrænset). Screening trumfer demografi-til-sidst-reglen.
- Hvis der er FLERE screeningsspørgsmål: placér dem alle først, i den mest naturlige rækkefølge (typisk hårdest filter først).
- Generelle/lette spørgsmål før specifikke/svære (engagement-opbygning) - efter eventuelle screeningsspørgsmål.
- Funnel-princip: bredt før specifikt.
- Adfærd før holdning om samme emne (så holdninger ikke farver adfærdsrapportering).
- Logisk gruppering af tematisk relaterede spørgsmål - undgå bratte temaskift.
- Følsomme spørgsmål placeres når engagement er etableret (midt-sent).
- IKKE-screenende demografi til sidst - de er nemme at besvare selv ved træthed, og respondenter springer dem sjældent over.

${hasScreening ? `BEMÆRK: Skemaet indeholder screeningsspørgsmål (markeret med [SCREENING] ovenfor). Tjek særligt at de står først - hvis ikke, er det den vigtigste rettelse uanset alt andet.` : `BEMÆRK: Skemaet indeholder ingen screeningsspørgsmål. Hvis du undrer dig over et spørgsmål, der måske burde være screening (fx alder når målgruppen er afgrænset), så nævn det kort i flow-feedbacken - men kun som en venlig observation, ikke som en score-sænkende fejl. Den studerende kan have valgt ikke at screene bevidst.`}

Vurder rækkefølgen i tre dimensioner. For hver: angiv score (god/nogen/svag) og 1-2 sætningers konkret feedback i samtaletone.

1. INDLEDNING: Står evt. screeningsspørgsmål allerførst? Starter skemaet derefter med generelle, lette spørgsmål der bygger engagement op?
2. FLOW: Er beslægtede spørgsmål grupperet sammen? Er der bratte temaskift eller logiske spring respondenten skal hoppe over?
3. AFSLUTNING: Er ikke-screenende demografi placeret til sidst? Er evt. følsomme spørgsmål placeret hensigtsmæssigt?

Hvis rækkefølgen kan forbedres: angiv den anbefalede nye rækkefølge ved at returnere de oprindelige spørgsmålsnumre i deres nye orden, plus en kort forklaring på hvorfor. Hvis nuværende rækkefølge er fin: returnér null som suggested_order og null som suggestion_reasoning.

VIGTIGT: suggested_order skal indeholde præcis ${constructs.length} numre, hver fra 1 til ${constructs.length}, og hver kun ÉN gang. Hvis du ikke kan opfylde dette krav, skal du returnere null.

Svar UDELUKKENDE med gyldig JSON i præcis dette format:
{
  "indledning": { "score": "god", "feedback": "..." },
  "flow": { "score": "god", "feedback": "..." },
  "afslutning": { "score": "god", "feedback": "..." },
  "suggested_order": null,
  "suggestion_reasoning": null
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!res.ok) throw new Error(`API svarede med ${res.status}`);
    const data = await res.json();
    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const cleaned = text.replace(/```json|```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Kunne ikke parse svar');
    return JSON.parse(match[0]);
  } catch (e) {
    return { error: e.message };
  }
}

// ============================================================================
// UI-KOMPONENTER
// ============================================================================

const STEPS = [
  { id: 0, label: 'Forskningsemne' },
  { id: 1, label: 'Emner' },
  { id: 2, label: 'Skalavalg' },
  { id: 3, label: 'Spørgsmål' },
  { id: 4, label: 'Rækkefølge' },
  { id: 5, label: 'Færdigt udkast' },
];

function StepIndicator({ currentStep, onJump, completedSteps }) {
  return (
    <nav className="border-b border-stone-300/60" style={{ backgroundColor: 'var(--paper)' }}>
      <ol className="max-w-6xl mx-auto px-8 py-5 flex items-center gap-1 overflow-x-auto">
        {STEPS.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.has(step.id);
          const canJump = isCompleted || step.id === currentStep;
          return (
            <React.Fragment key={step.id}>
              <li className="flex items-center gap-3 min-w-fit">
                <button
                  onClick={() => canJump && onJump(step.id)}
                  disabled={!canJump}
                  className={`flex items-center gap-3 px-3 py-1.5 transition-all ${canJump ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                >
                  <span
                    className="flex items-center justify-center w-6 h-6 text-xs"
                    style={{
                      fontFamily: 'Fraunces, serif',
                      fontWeight: 500,
                      backgroundColor: isActive ? 'var(--ink)' : isCompleted ? 'var(--accent)' : 'transparent',
                      color: isActive || isCompleted ? 'var(--paper)' : 'var(--ink-soft)',
                      border: isActive || isCompleted ? 'none' : '1px solid var(--rule)',
                      borderRadius: '50%',
                    }}
                  >
                    {step.id + 1}
                  </span>
                  <span
                    className="text-sm whitespace-nowrap"
                    style={{ color: isActive ? 'var(--ink)' : 'var(--ink-soft)', fontWeight: isActive ? 500 : 400 }}
                  >
                    {step.label}
                  </span>
                </button>
              </li>
              {idx < STEPS.length - 1 && (
                <div className="w-6 h-px" style={{ backgroundColor: 'var(--rule)' }} />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

function StepHeader({ number, title, subtitle }) {
  return (
    <header className="mb-10">
      <div className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
        Trin {number} af {STEPS.length}
      </div>
      <h1 className="mb-3" style={{ fontFamily: 'Fraunces, serif', fontSize: '2.25rem', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
        {title}
      </h1>
      <p className="max-w-2xl" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '0.975rem', lineHeight: 1.6 }}>
        {subtitle}
      </p>
    </header>
  );
}

function NavButtons({ onBack, onNext, nextLabel = 'Næste', nextDisabled, backDisabled }) {
  return (
    <div className="flex items-center justify-between pt-10 mt-10 border-t" style={{ borderColor: 'var(--rule)' }}>
      <button
        onClick={onBack}
        disabled={backDisabled}
        className="px-5 py-2.5 text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          fontFamily: 'IBM Plex Sans, sans-serif',
          color: 'var(--ink-soft)',
          fontWeight: 400,
        }}
      >
        ← Tilbage
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="px-6 py-2.5 text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          fontFamily: 'IBM Plex Sans, sans-serif',
          fontWeight: 500,
          backgroundColor: 'var(--ink)',
          color: 'var(--paper)',
          letterSpacing: '0.01em',
        }}
      >
        {nextLabel} →
      </button>
    </div>
  );
}

// ============================================================================
// TRIN 1: FORSKNINGSEMNE
// ============================================================================

function TopicStep({ topic, setTopic, onNext }) {
  const canProceed = topic.research_question.trim().length > 15 && topic.purpose.trim().length > 15;
  return (
    <div>
      <StepHeader
        number={1}
        title="Formål og forskningsspørgsmål"
        subtitle="Start ved formålet — den praktiske beslutning eller ledelsesønske, der har udløst undersøgelsen. Derfra udledes forskningsspørgsmålet, som spørgeskemaet skal kunne besvare. Når kæden er rigtig fra start, falder emner og skalaer naturligt på plads."
      />

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--ink)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
              Formål — ledelsesønske eller beslutning
            </label>
            <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Den praktiske beslutning eller indsigt, der gør undersøgelsen relevant. Alt det efterfølgende udledes herfra.
            </p>
            <textarea
              value={topic.purpose}
              onChange={e => setTopic({ ...topic, purpose: e.target.value })}
              placeholder="F.eks.: Vi skal afgøre, hvilke produktegenskaber butikken bør prioritere i sortimentet til 18-29-årige det kommende halvår."
              rows={3}
              className="w-full px-4 py-3 text-sm focus:outline-none transition-colors"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                backgroundColor: 'transparent',
                border: '1px solid var(--rule)',
                color: 'var(--ink)',
                lineHeight: 1.5,
              }}
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--ink)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
              Forskningsspørgsmål — udledt af formålet
            </label>
            <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Det overordnede empiriske spørgsmål, der oversætter formålet til noget undersøgelsen kan besvare.
            </p>
            <textarea
              value={topic.research_question}
              onChange={e => setTopic({ ...topic, research_question: e.target.value })}
              placeholder="F.eks.: Hvilke faktorer påvirker unges valg af mobilcover, og hvordan adskiller mønstrene sig på tværs af køn og indkomst?"
              rows={3}
              className="w-full px-4 py-3 text-sm focus:outline-none transition-colors"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                backgroundColor: 'transparent',
                border: '1px solid var(--rule)',
                color: 'var(--ink)',
                lineHeight: 1.5,
              }}
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--ink)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
              Målgruppe (valgfrit)
            </label>
            <input
              type="text"
              value={topic.target_group}
              onChange={e => setTopic({ ...topic, target_group: e.target.value })}
              placeholder="F.eks.: Danskere mellem 18-29 år, som har købt en mobilcover de seneste 12 måneder"
              className="w-full px-4 py-3 text-sm focus:outline-none"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                backgroundColor: 'transparent',
                border: '1px solid var(--rule)',
                color: 'var(--ink)',
              }}
            />
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="p-6 sticky top-6" style={{ backgroundColor: 'var(--paper-warm)', borderLeft: '2px solid var(--accent)' }}>
            <h3 className="text-xs uppercase tracking-[0.18em] mb-4" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
              Den analytiske kæde
            </h3>
            <ol className="space-y-1.5 text-sm mb-5" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink)', lineHeight: 1.5 }}>
              <li><span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500 }}>Formål</span> <span style={{ color: 'var(--ink-soft)' }}>(ledelsesønsket)</span></li>
              <li style={{ color: 'var(--ink-soft)', paddingLeft: '0.5rem' }}>↓ udledes til</li>
              <li><span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500 }}>Forskningsspørgsmål</span></li>
              <li style={{ color: 'var(--ink-soft)', paddingLeft: '0.5rem' }}>↓ nedbrydes i</li>
              <li><span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500 }}>Emner</span></li>
              <li style={{ color: 'var(--ink-soft)', paddingLeft: '0.5rem' }}>↓ måles via</li>
              <li><span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500 }}>Skalaer</span></li>
              <li style={{ color: 'var(--ink-soft)', paddingLeft: '0.5rem' }}>↓ realiseres som</li>
              <li><span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500 }}>Spørgsmål</span></li>
            </ol>
            <div className="pt-4" style={{ borderTop: '1px solid var(--rule)' }}>
              <p className="text-xs uppercase tracking-[0.18em] mb-3" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
                Et godt forskningsspørgsmål er
              </p>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--ink)', fontFamily: 'IBM Plex Sans, sans-serif', lineHeight: 1.5 }}>
                <li><span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>konkret</span> — peger på en målbar målgruppe og fænomen.</li>
                <li><span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>afgrænset</span> — kan besvares inden for ét spørgeskema.</li>
                <li><span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>empirisk</span> — kan besvares med data, ikke med ideologi.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <NavButtons onBack={() => {}} onNext={onNext} nextDisabled={!canProceed} backDisabled />
    </div>
  );
}

// ============================================================================
// TRIN 2: EMNER
// ============================================================================

function ConstructsStep({ topic, constructs, setConstructs, onBack, onNext }) {
  const addConstruct = () => {
    setConstructs([...constructs, { id: Date.now(), name: '', type: 'holdning', definition: '', isScreening: false }]);
  };
  const updateConstruct = (id, patch) => {
    setConstructs(constructs.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, ...patch };
      // Clear evaluation if any evaluated field changes (not for evaluation/loading patches themselves)
      const evalRelevantChange = ('name' in patch || 'definition' in patch || 'type' in patch || 'isScreening' in patch);
      if (evalRelevantChange && c.evaluation) {
        updated.evaluation = null;
      }
      return updated;
    }));
  };
  const removeConstruct = id => setConstructs(constructs.filter(c => c.id !== id));

  const allValid = constructs.length >= 1 && constructs.every(c => c.name.trim().length > 2 && c.definition.trim().length > 10);

  return (
    <div>
      <StepHeader
        number={2}
        title="Hvilke emner skal måles?"
        subtitle="Et emne er det abstrakte begreb, du vil indfange - fx 'kundetilfredshed' eller 'købsintention'. Operationalisering betyder at gøre emnet konkret nok til, at det kan måles. Det er her, de fleste spørgeskemaer vinder eller taber."
      />

      <div className="space-y-5">
        {constructs.map((construct, idx) => {
          const canEvaluate = construct.name.trim().length > 2 && construct.definition.trim().length > 10;
          return (
          <div key={construct.id} className="p-6" style={{ backgroundColor: 'var(--paper-warm)', border: '1px solid var(--rule)' }}>
            <div className="flex items-baseline justify-between mb-5">
              <span className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
                Emne {idx + 1}
              </span>
              <button
                onClick={() => removeConstruct(construct.id)}
                className="text-xs"
                style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                Fjern
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                  Navn
                </label>
                <input
                  type="text"
                  value={construct.name}
                  onChange={e => updateConstruct(construct.id, { name: e.target.value })}
                  placeholder="F.eks. tilfredshed med butikken"
                  className="w-full px-3 py-2 text-sm focus:outline-none"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    backgroundColor: 'var(--paper)',
                    border: '1px solid var(--rule)',
                    color: 'var(--ink)',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                  Type
                </label>
                <select
                  value={construct.type}
                  onChange={e => updateConstruct(construct.id, { type: e.target.value })}
                  className="w-full px-3 py-2 text-sm focus:outline-none"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    backgroundColor: 'var(--paper)',
                    border: '1px solid var(--rule)',
                    color: 'var(--ink)',
                  }}
                >
                  {CONSTRUCT_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                <p className="text-xs mt-2" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', lineHeight: 1.4 }}>
                  {CONSTRUCT_TYPE_BY_ID[construct.type].description}. <span style={{ fontStyle: 'italic' }}>Fx {CONSTRUCT_TYPE_BY_ID[construct.type].examples}.</span>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                Operationalisering — hvad måles? (ikke hvordan)
              </label>
              <textarea
                value={construct.definition}
                onChange={e => updateConstruct(construct.id, { definition: e.target.value })}
                placeholder="F.eks.: Den samlede vurdering kunden har af deres oplevelse i butikken — omfatter både service, sortiment og atmosfære.

Hold dig på emne-niveau: skalavalg og svarmuligheder kommer på de næste trin."
                rows={3}
                className="w-full px-3 py-2 text-sm focus:outline-none"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  backgroundColor: 'var(--paper)',
                  border: '1px solid var(--rule)',
                  color: 'var(--ink)',
                  lineHeight: 1.5,
                }}
              />
            </div>

            <div className="mt-5">
              <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                Screeningsspørgsmål — filtrerer hvem der må svare videre
              </label>
              <div className="p-3" style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--rule)' }}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!construct.isScreening}
                    onChange={e => updateConstruct(construct.id, { isScreening: e.target.checked })}
                    style={{
                      marginTop: '3px',
                      accentColor: 'var(--accent)',
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  />
                  <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                    Markér hvis spørgsmålet bestemmer om respondenten passer til målgruppen — fx alder (når målgruppen er afgrænset), om de har købt produktet, eller om de er kunder. Screeningsspørgsmål placeres altid <em style={{ fontFamily: 'Fraunces, serif' }}>først</em> i skemaet, også selvom de er demografiske.
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={async () => {
                  updateConstruct(construct.id, { loading: true });
                  const result = await evaluateEmneWithAI(construct, topic);
                  setConstructs(prev => prev.map(c => c.id === construct.id ? { ...c, evaluation: result, loading: false } : c));
                }}
                disabled={!canEvaluate || construct.loading}
                className="text-xs px-4 py-2 transition-all disabled:opacity-30"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontWeight: 500,
                  color: 'var(--paper)',
                  backgroundColor: 'var(--accent)',
                  letterSpacing: '0.02em',
                }}
              >
                {construct.loading ? 'Vurderer…' : 'Få AI-feedback på emnet'}
              </button>
              {!canEvaluate && (
                <span className="text-xs" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontStyle: 'italic' }}>
                  Udfyld navn og operationalisering først
                </span>
              )}
            </div>

            {construct.evaluation && (
              <EvaluationDisplay
                evaluation={construct.evaluation}
                onApplySuggestion={() => updateConstruct(construct.id, { definition: construct.evaluation.suggestion })}
                dims={EMNE_DIMS}
                suggestionLabel="Forslag til skarpere operationalisering"
                suggestionButtonText="Indsæt forslag i operationaliseringsfeltet"
              />
            )}
          </div>
          );
        })}

        <button
          onClick={addConstruct}
          className="w-full py-4 text-sm transition-colors"
          style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            color: 'var(--accent)',
            border: '1px dashed var(--rule)',
            backgroundColor: 'transparent',
          }}
        >
          + Tilføj emne
        </button>

        <div className="p-5 mt-8" style={{ borderLeft: '2px solid var(--accent)' }}>
          <p className="text-sm" style={{ color: 'var(--ink)', fontFamily: 'IBM Plex Sans, sans-serif', lineHeight: 1.6 }}>
            <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontStyle: 'italic' }}>Test din operationalisering:</span> Kunne to forskere kigge på samme respondent og blive enige om scoren? Hvis svaret er nej, er definitionen ikke konkret nok endnu.
          </p>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!allValid} />
    </div>
  );
}

// ============================================================================
// TRIN 3: SKALAVALG
// ============================================================================

function ScalesStep({ topic, constructs, scaleChoices, setScaleChoices, onBack, onNext }) {
  const updateChoice = (constructId, patch) => {
    setScaleChoices(prev => {
      const current = prev[constructId] || { scaleId: null, justification: '' };
      return { ...prev, [constructId]: { ...current, ...patch } };
    });
  };

  const allChosen = constructs.every(c => scaleChoices[c.id]?.scaleId);

  return (
    <div>
      <StepHeader
        number={3}
        title="Hvilken skala passer til hvert emne?"
        subtitle="Valg af svarskala bestemmer både hvad respondenten kan udtrykke - og hvilke statistiske analyser du kan lave bagefter. En holdning måles ikke med en frekvensskala. En adfærd måles ikke med en Likert-skala. Match emnets natur til skalaens måleniveau."
      />

      <div className="space-y-8">
        {constructs.map(construct => {
          const ctype = CONSTRUCT_TYPE_BY_ID[construct.type];
          const recommended = SCALES.filter(s => s.bestFor.includes(construct.type));
          const otherScales = SCALES.filter(s => !s.bestFor.includes(construct.type));
          const choice = scaleChoices[construct.id] || {};
          const chosen = choice.scaleId;
          const justification = choice.justification ?? '';
          const evaluation = choice.evaluation;
          const loading = choice.loading;
          const chosenScale = chosen ? SCALE_BY_ID[chosen] : null;

          return (
            <div key={construct.id} className="pb-8 border-b" style={{ borderColor: 'var(--rule)' }}>
              <div className="mb-5">
                <h3 className="text-xl mb-1" style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, color: 'var(--ink)' }}>
                  {construct.name}
                </h3>
                <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                  {ctype.label}
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', lineHeight: 1.55 }}>
                  {construct.definition}
                </p>
              </div>

              <div className="mb-3">
                <p className="text-xs uppercase tracking-[0.18em] mb-3" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
                  Anbefalet til {ctype.label.toLowerCase()}
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {recommended.map(scale => (
                    <ScaleCard key={scale.id} scale={scale} chosen={chosen === scale.id} onClick={() => updateChoice(construct.id, { scaleId: scale.id, evaluation: null })} recommended />
                  ))}
                </div>
              </div>

              <details className="mt-4 group">
                <summary className="text-xs uppercase tracking-[0.18em] cursor-pointer" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
                  <span className="summary-closed-text">Vis øvrige skalaer ({otherScales.length})</span>
                  <span className="summary-open-text">Vis kun anbefalede skalaer</span>
                </summary>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  {otherScales.map(scale => (
                    <ScaleCard key={scale.id} scale={scale} chosen={chosen === scale.id} onClick={() => updateChoice(construct.id, { scaleId: scale.id, evaluation: null })} />
                  ))}
                </div>
              </details>

              {chosen && (
                <div className="mt-5">
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                    Begrundelse for valget (1-2 sætninger)
                  </label>
                  <input
                    type="text"
                    value={justification}
                    onChange={e => updateChoice(construct.id, { justification: e.target.value, evaluation: null })}
                    placeholder="Hvorfor passer denne skala til netop dette emne?"
                    className="w-full px-3 py-2 text-sm focus:outline-none"
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--rule)',
                      color: 'var(--ink)',
                    }}
                  />

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={async () => {
                        updateChoice(construct.id, { loading: true });
                        const result = await evaluateSkalaWithAI(construct, chosenScale, justification, topic);
                        updateChoice(construct.id, { evaluation: result, loading: false });
                      }}
                      disabled={loading}
                      className="text-xs px-4 py-2 transition-all disabled:opacity-30"
                      style={{
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        fontWeight: 500,
                        color: 'var(--paper)',
                        backgroundColor: 'var(--accent)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {loading ? 'Vurderer…' : 'Få AI-feedback på skalavalg og begrundelse'}
                    </button>
                    {!justification.trim() && (
                      <span className="text-xs" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontStyle: 'italic' }}>
                        Får du ikke skrevet en begrundelse, foreslår AI'en én du kan bruge
                      </span>
                    )}
                  </div>

                  {evaluation && (
                    <EvaluationDisplay
                      evaluation={evaluation}
                      onApplySuggestion={() => updateChoice(construct.id, { justification: evaluation.suggestion })}
                      dims={SCALE_DIMS}
                      suggestionLabel="Forslag til begrundelse"
                      suggestionButtonText="Indsæt forslag i begrundelsesfeltet"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!allChosen} />
    </div>
  );
}

function ScaleCard({ scale, chosen, onClick, recommended }) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 transition-all"
      style={{
        backgroundColor: chosen ? 'var(--paper-warm)' : 'transparent',
        border: chosen ? '1px solid var(--accent)' : '1px solid var(--rule)',
        borderLeft: chosen ? '3px solid var(--accent)' : '1px solid var(--rule)',
      }}
    >
      <div className="flex items-baseline justify-between mb-1">
        <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: '1.05rem', color: 'var(--ink)' }}>
          {scale.label}
        </span>
        {chosen && <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>Valgt</span>}
      </div>
      <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
        Måleniveau: {scale.measurement}
      </p>
      <p className="text-sm mb-3" style={{ color: 'var(--ink)', fontFamily: 'IBM Plex Sans, sans-serif', lineHeight: 1.5 }}>
        {scale.description}
      </p>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontStyle: 'italic' }}>
        Fx: {scale.responseOptions.join(' · ')}
      </p>
    </button>
  );
}

// ============================================================================
// TRIN 4: SPØRGSMÅLSFORMULERING
// ============================================================================

function QuestionsStep({ topic, constructs, scaleChoices, questions, setQuestions, onBack, onNext }) {
  const setQuestionForConstruct = (constructId, value) => {
    setQuestions({ ...questions, [constructId]: { ...questions[constructId], text: value, evaluation: null } });
  };
  const setEvaluation = (constructId, evaluation) => {
    setQuestions({ ...questions, [constructId]: { ...questions[constructId], evaluation } });
  };
  const setLoading = (constructId, loading) => {
    setQuestions({ ...questions, [constructId]: { ...questions[constructId], loading } });
  };

  const allFormulated = constructs.every(c => questions[c.id]?.text?.trim().length > 5);

  return (
    <div>
      <StepHeader
        number={4}
        title="Formulér spørgsmålene"
        subtitle="Nu kobles emne og skala til konkret formulering. Skriv ét spørgsmål per emne - hold dig til netop det, emnet skal måle. Brug 'Få AI-feedback' for grundig vurdering, eller stol på de automatiske advarsler."
      />

      <div className="space-y-8">
        {constructs.map(construct => {
          const choice = scaleChoices[construct.id];
          const scale = SCALE_BY_ID[choice.scaleId];
          const q = questions[construct.id] ?? { text: '', evaluation: null, loading: false };
          const ruleIssues = q.text.trim().length > 5 ? ruleBasedChecks(q.text) : [];

          return (
            <div key={construct.id} className="pb-8 border-b" style={{ borderColor: 'var(--rule)' }}>
              <div className="grid lg:grid-cols-3 gap-6 mb-4">
                <div className="lg:col-span-2">
                  <h3 className="text-xl mb-1" style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, color: 'var(--ink)' }}>
                    {construct.name}
                  </h3>
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                    {CONSTRUCT_TYPE_BY_ID[construct.type].label} · {scale.label}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', lineHeight: 1.55, fontStyle: 'italic' }}>
                    {scale.formulationHint}
                  </p>
                </div>
                <div className="text-xs p-3" style={{ backgroundColor: 'var(--paper-warm)', color: 'var(--ink)', fontFamily: 'IBM Plex Sans, sans-serif', lineHeight: 1.5 }}>
                  <span className="block uppercase tracking-wider mb-1" style={{ fontWeight: 600, color: 'var(--ink-soft)' }}>Svarmuligheder</span>
                  {scale.responseOptions.join(' · ')}
                </div>
              </div>

              <textarea
                value={q.text}
                onChange={e => setQuestionForConstruct(construct.id, e.target.value)}
                placeholder="Formulér dit spørgsmål her..."
                rows={2}
                className="w-full px-4 py-3 text-base focus:outline-none"
                style={{
                  fontFamily: 'Fraunces, serif',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--rule)',
                  color: 'var(--ink)',
                  lineHeight: 1.5,
                }}
              />

              {ruleIssues.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {ruleIssues.map((issue, i) => (
                    <div key={i} className="text-xs flex items-start gap-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      <span style={{ color: issue.type === 'warn' ? 'var(--accent)' : 'var(--ink-soft)', fontWeight: 600, marginTop: '1px' }}>
                        {issue.type === 'warn' ? '⚠' : 'ℹ'}
                      </span>
                      <span style={{ color: 'var(--ink)', lineHeight: 1.5 }}>{issue.text}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={async () => {
                    setLoading(construct.id, true);
                    const result = await evaluateWithAI(q.text, construct, scale, topic);
                    setQuestions(prev => ({ ...prev, [construct.id]: { ...prev[construct.id], evaluation: result, loading: false } }));
                  }}
                  disabled={!q.text || q.loading}
                  className="text-xs px-4 py-2 transition-all disabled:opacity-30"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontWeight: 500,
                    color: 'var(--paper)',
                    backgroundColor: 'var(--accent)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {q.loading ? 'Vurderer…' : 'Få AI-feedback'}
                </button>
                {q.evaluation && !q.evaluation.error && (
                  <span className="text-xs" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    Vurdering tilgængelig
                  </span>
                )}
              </div>

              {q.evaluation && <EvaluationDisplay evaluation={q.evaluation} onApplySuggestion={() => setQuestionForConstruct(construct.id, q.evaluation.suggestion)} dims={QUESTION_DIMS} suggestionLabel="Forslag til omformulering" suggestionButtonText="Indsæt forslag i spørgsmålsfeltet" />}
            </div>
          );
        })}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Til rækkefølge" nextDisabled={!allFormulated} />
    </div>
  );
}

function EvaluationDisplay({ evaluation, onApplySuggestion, dims, suggestionLabel = 'Forslag til omformulering', suggestionButtonText = 'Indsæt forslag i feltet' }) {
  if (evaluation.error) {
    return (
      <div className="mt-4 p-4 text-sm" style={{ backgroundColor: 'var(--paper-warm)', color: 'var(--ink)', fontFamily: 'IBM Plex Sans, sans-serif', borderLeft: '2px solid var(--accent)' }}>
        AI-feedback ikke tilgængelig: {evaluation.error}. Brug de regelbaserede advarsler ovenfor som vejledning.
      </div>
    );
  }

  const scoreColor = score => {
    if (score === 'god') return 'var(--success)';
    if (score === 'nogen') return 'var(--accent)';
    return '#a14242';
  };

  return (
    <div className="mt-4 p-5" style={{ backgroundColor: 'var(--paper-warm)' }}>
      <div className="space-y-4">
        {dims.map(d => {
          const v = evaluation[d.key];
          if (!v) return null;
          return (
            <div key={d.key}>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
                  {d.label}
                </span>
                <span className="text-xs uppercase" style={{ color: scoreColor(v.score), fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600, letterSpacing: '0.05em' }}>
                  {v.score}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--ink)', fontFamily: 'IBM Plex Sans, sans-serif', lineHeight: 1.55 }}>
                {v.feedback}
              </p>
            </div>
          );
        })}

        {evaluation.suggestion && (
          <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--rule)' }}>
            <p className="text-xs uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
              {suggestionLabel}
            </p>
            <p className="text-base mb-3" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.5 }}>
              "{evaluation.suggestion}"
            </p>
            <button
              onClick={onApplySuggestion}
              className="text-xs px-3 py-1.5"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontWeight: 500,
                color: 'var(--ink)',
                border: '1px solid var(--ink)',
                backgroundColor: 'transparent',
              }}
            >
              {suggestionButtonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const QUESTION_DIMS = [
  { key: 'emne_match', label: 'Emne-match' },
  { key: 'scale_match', label: 'Skala-match' },
  { key: 'formulation', label: 'Formulering' },
];

const EMNE_DIMS = [
  { key: 'klarhed', label: 'Klarhed' },
  { key: 'type_match', label: 'Type-match' },
  { key: 'operationalisering', label: 'Operationalisering' },
];

const SCALE_DIMS = [
  { key: 'skala_egnethed', label: 'Skala-egnethed' },
  { key: 'maaleniveau', label: 'Måleniveau' },
  { key: 'begrundelse', label: 'Begrundelse' },
];

// ============================================================================
// TRIN 5: RÆKKEFØLGE AF SPØRGSMÅL
// ============================================================================

function OrderEvaluationDisplay({ evaluation, onApplySuggestion, constructs }) {
  if (evaluation.error) {
    return (
      <div className="mt-4 p-4 text-sm" style={{ backgroundColor: 'var(--paper-warm)', color: 'var(--ink)', fontFamily: 'IBM Plex Sans, sans-serif', borderLeft: '2px solid var(--accent)' }}>
        AI-feedback ikke tilgængelig: {evaluation.error}.
      </div>
    );
  }

  const dims = [
    { key: 'indledning', label: 'Indledning' },
    { key: 'flow', label: 'Flow' },
    { key: 'afslutning', label: 'Afslutning' },
  ];

  const scoreColor = score => {
    if (score === 'god') return 'var(--success)';
    if (score === 'nogen') return 'var(--accent)';
    return '#a14242';
  };

  const sug = evaluation.suggested_order;
  const validSuggestion = Array.isArray(sug)
    && sug.length === constructs.length
    && sug.every(n => Number.isInteger(n) && n >= 1 && n <= constructs.length)
    && new Set(sug).size === sug.length;
  const isCurrentOrder = validSuggestion && sug.every((n, i) => n === i + 1);

  return (
    <div className="mt-4 p-5" style={{ backgroundColor: 'var(--paper-warm)' }}>
      <div className="space-y-4">
        {dims.map(d => {
          const v = evaluation[d.key];
          if (!v) return null;
          return (
            <div key={d.key}>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
                  {d.label}
                </span>
                <span className="text-xs uppercase" style={{ color: scoreColor(v.score), fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600, letterSpacing: '0.05em' }}>
                  {v.score}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--ink)', fontFamily: 'IBM Plex Sans, sans-serif', lineHeight: 1.55 }}>
                {v.feedback}
              </p>
            </div>
          );
        })}

        {validSuggestion && !isCurrentOrder && (
          <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--rule)' }}>
            <p className="text-xs uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
              Foreslået rækkefølge
            </p>
            <ol className="space-y-1.5 mb-3">
              {sug.map((originalIdx, newPos) => {
                const c = constructs[originalIdx - 1];
                if (!c) return null;
                return (
                  <li key={newPos} className="text-sm flex items-baseline gap-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, color: 'var(--accent)', minWidth: '1.5rem' }}>
                      {String(newPos + 1).padStart(2, '0')}
                    </span>
                    <span style={{ color: 'var(--ink)' }}>{c.name}</span>
                    {c.isScreening && (
                      <span className="text-xs px-1.5 py-0.5" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600, letterSpacing: '0.05em', border: '1px solid var(--accent)' }}>
                        SCREENING
                      </span>
                    )}
                    {originalIdx !== newPos + 1 && (
                      <span className="text-xs" style={{ color: 'var(--ink-soft)', fontStyle: 'italic' }}>
                        (var nr. {originalIdx})
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
            {evaluation.suggestion_reasoning && (
              <p className="text-sm mb-4" style={{ color: 'var(--ink)', fontFamily: 'IBM Plex Sans, sans-serif', lineHeight: 1.55, fontStyle: 'italic' }}>
                {evaluation.suggestion_reasoning}
              </p>
            )}
            <button
              onClick={() => onApplySuggestion(sug)}
              className="text-xs px-3 py-1.5"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontWeight: 500,
                color: 'var(--ink)',
                border: '1px solid var(--ink)',
                backgroundColor: 'transparent',
              }}
            >
              Anvend foreslået rækkefølge
            </button>
          </div>
        )}

        {validSuggestion && isCurrentOrder && evaluation.suggestion_reasoning && (
          <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--rule)' }}>
            <p className="text-sm" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontStyle: 'italic', lineHeight: 1.55 }}>
              {evaluation.suggestion_reasoning}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderStep({ topic, constructs, setConstructs, scaleChoices, questions, onBack, onNext }) {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...constructs];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setConstructs(next);
    setEvaluation(null);
  };

  const moveDown = (idx) => {
    if (idx === constructs.length - 1) return;
    const next = [...constructs];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setConstructs(next);
    setEvaluation(null);
  };

  const applySuggestedOrder = (suggestion) => {
    const next = suggestion.map(originalIdx => constructs[originalIdx - 1]).filter(Boolean);
    if (next.length === constructs.length) {
      setConstructs(next);
      setEvaluation(null);
    }
  };

  const fetchFeedback = async () => {
    setLoading(true);
    const result = await evaluateOrderWithAI(constructs, scaleChoices, questions, topic);
    setEvaluation(result);
    setLoading(false);
  };

  return (
    <div>
      <StepHeader
        number={5}
        title="Rækkefølge af spørgsmål"
        subtitle="Indtil nu har du arbejdet ét spørgsmål ad gangen. Nu træder du et skridt tilbage og ser på den samlede rejse, respondenten skal igennem. Rækkefølgen påvirker både dropout-rate og svarkvalitet — et godt skema starter blødt, bygger engagement op, og placerer det administrative til sidst."
      />

      <div className="grid lg:grid-cols-3 gap-10 mb-10">
        <div className="lg:col-span-2">
          <p className="text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink)', lineHeight: 1.65 }}>
            Tjek dine spørgsmål igennem og overvej, om rækkefølgen følger en logik der virker for respondenten. Bratte spring mellem temaer trætter; følsomme spørgsmål kan skræmme folk væk hvis de kommer for tidligt; demografi placeret først giver respondenten følelsen af at sidde til en registrering frem for en samtale. Brug pilene til at flytte spørgsmål, eller bed AI'en om at vurdere flowet.
          </p>
        </div>

        <aside className="lg:col-span-1">
          <div className="p-6" style={{ backgroundColor: 'var(--paper-warm)', borderLeft: '2px solid var(--accent)' }}>
            <h3 className="text-xs uppercase tracking-[0.18em] mb-4" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
              Den gode rækkefølge
            </h3>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--ink)', fontFamily: 'IBM Plex Sans, sans-serif', lineHeight: 1.55 }}>
              <li><span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>Screening allerførst</span> — filtrerings-spørgsmål skal afgøres med det samme, selv hvis de er demografiske.</li>
              <li><span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>Engagement først</span> — generelle, lette spørgsmål før specifikke og svære.</li>
              <li><span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>Funnel</span> — bredt før smalt, overordnet før detalje.</li>
              <li><span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>Adfærd før holdning</span> om samme tema — ellers risikerer du at holdningen farver adfærdsrapporteringen.</li>
              <li><span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>Tematisk gruppering</span> — beslægtede spørgsmål bør stå sammen; undgå bratte skift.</li>
              <li><span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>Følsomt midt-sent</span> — når respondenten har investeret tid, er de mere villige.</li>
              <li><span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>Demografi til sidst</span> — bortset fra screening-demografi, jf. ovenfor.</li>
            </ul>
          </div>
        </aside>
      </div>

      <p className="text-xs uppercase tracking-[0.18em] mb-4" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
        Spørgsmål i nuværende rækkefølge
      </p>

      <div className="space-y-3">
        {constructs.map((c, idx) => {
          const scale = SCALE_BY_ID[scaleChoices[c.id]?.scaleId];
          const q = questions[c.id]?.text ?? '(ikke formuleret)';
          const ctype = CONSTRUCT_TYPE_BY_ID[c.type].label;
          return (
            <div key={c.id} className="flex items-start gap-5 p-5" style={{ backgroundColor: 'var(--paper-warm)', border: '1px solid var(--rule)' }}>
              <span className="text-2xl pt-1" style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, color: 'var(--accent)', minWidth: '2rem' }}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider mb-1 flex items-center gap-2 flex-wrap" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                  <span>{c.name} · {ctype} · {scale?.label ?? '?'}</span>
                  {c.isScreening && (
                    <span className="px-1.5 py-0.5" style={{ color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em', border: '1px solid var(--accent)' }}>
                      SCREENING
                    </span>
                  )}
                </p>
                <p className="text-base" style={{ fontFamily: 'Fraunces, serif', color: 'var(--ink)', lineHeight: 1.5 }}>
                  {q}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="px-3 py-1.5 text-sm transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: 'var(--ink)',
                    backgroundColor: 'var(--paper)',
                    border: '1px solid var(--rule)',
                  }}
                  aria-label="Flyt op"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === constructs.length - 1}
                  className="px-3 py-1.5 text-sm transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: 'var(--ink)',
                    backgroundColor: 'var(--paper)',
                    border: '1px solid var(--rule)',
                  }}
                  aria-label="Flyt ned"
                >
                  ↓
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={fetchFeedback}
          disabled={loading}
          className="text-xs px-4 py-2 transition-all disabled:opacity-30"
          style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontWeight: 500,
            color: 'var(--paper)',
            backgroundColor: 'var(--accent)',
            letterSpacing: '0.02em',
          }}
        >
          {loading ? 'Vurderer…' : 'Få AI-feedback på rækkefølgen'}
        </button>
      </div>

      {evaluation && (
        <OrderEvaluationDisplay
          evaluation={evaluation}
          onApplySuggestion={applySuggestedOrder}
          constructs={constructs}
        />
      )}

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Se færdigt udkast" />
    </div>
  );
}

// ============================================================================
// TRIN 6: FÆRDIGT UDKAST
// ============================================================================

function FinalStep({ topic, constructs, scaleChoices, questions, onBack, onRestart }) {
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const buildExportText = () => {
    const bar = '='.repeat(60);
    const thin = '-'.repeat(60);
    let out = `SPØRGESKEMA-UDKAST\n${bar}\n\n`;

    // === SEKTION 1: OPSUMMERING ===
    out += `OPSUMMERING\n${bar}\n\n`;
    out += `Formål:\n${topic.purpose}\n\n`;
    out += `Forskningsspørgsmål:\n${topic.research_question}\n\n`;
    if (topic.target_group) out += `Målgruppe: ${topic.target_group}\n\n`;

    out += `${thin}\nEMNER OG SKALAVALG\n${thin}\n\n`;
    constructs.forEach((c, idx) => {
      const scale = SCALE_BY_ID[scaleChoices[c.id]?.scaleId];
      const justification = scaleChoices[c.id]?.justification || '';
      const screeningTag = c.isScreening ? ' [SCREENING]' : '';
      const ctype = CONSTRUCT_TYPE_BY_ID[c.type].label;
      out += `${idx + 1}. ${c.name}${screeningTag} · ${ctype}\n`;
      out += `   Operationalisering: ${c.definition}\n`;
      out += `   Skala: ${scale?.label ?? '?'} (${scale?.measurement ?? '?'})\n`;
      if (justification) out += `   Begrundelse: ${justification}\n`;
      out += `\n`;
    });

    // === SEKTION 2: SPØRGESKEMA ===
    out += `\n${bar}\nSPØRGESKEMA — KLAR TIL PILOTTEST\n${bar}\n\n`;
    constructs.forEach((c, idx) => {
      const scale = SCALE_BY_ID[scaleChoices[c.id]?.scaleId];
      const q = questions[c.id]?.text ?? '(ikke formuleret)';
      const screeningTag = c.isScreening ? ' [SCREENING]' : '';
      out += `${idx + 1}.${screeningTag} ${q}\n\n`;

      if (scale) {
        if (scale.id === 'aaben') {
          out += `   ${'_'.repeat(50)}\n`;
          out += `   ${'_'.repeat(50)}\n`;
        } else if (scale.id === 'semantisk') {
          out += `   [Specificér to modsatrettede ord med skala imellem, fx: Billig — — — — — — — Dyr]\n`;
        } else if (REAL_OPTION_SCALES.has(scale.id)) {
          const marker = '( )';
          scale.responseOptions.forEach(opt => {
            out += `   ${marker}  ${opt}\n`;
          });
        } else {
          // mc_single, mc_multi, rang, kategorier - placeholders
          const note = scale.responseOptions[0] || '';
          out += `   [Tilføj konkrete svarmuligheder før udsendelse — ${note.toLowerCase()}]\n`;
        }
      }
      out += `\n${thin}\n\n`;
    });

    // === SEKTION 3: TJEKLISTE ===
    out += `\n${bar}\nTJEKLISTE FØR UDSENDELSE\n${bar}\n\n`;
    out += `[ ] Sprog: Spørgsmålene er målrettet respondenternes hverdagssprog, ikke akademisk eller branchejargon\n`;
    out += `[ ] Svartid: Estimeret gennemførelsestid er under 10 minutter\n`;
    out += `[ ] Pilottest: Skemaet er testet på 3-5 personer fra målgruppen, og deres uklarheder er rettet\n`;
    return out;
  };

  const buildHtmlDocument = () => {
    const escape = s => (s || '').toString().replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

    // Designgrundlag (one block per emne)
    const designHtml = constructs.map(c => {
      const choice = scaleChoices[c.id] || {};
      const scale = SCALE_BY_ID[choice.scaleId];
      const ctype = CONSTRUCT_TYPE_BY_ID[c.type].label;
      const screeningBadge = c.isScreening
        ? `<span class="screening-badge">SCREENING</span>`
        : '';
      return `
        <div class="design-block${c.isScreening ? ' design-block-screening' : ''}">
          <p class="design-header">
            <span class="design-name">${escape(c.name)}</span>
            <span class="design-type">${escape(ctype)}</span>
            ${screeningBadge}
          </p>
          <p class="design-def">${escape(c.definition)}</p>
          <p class="design-meta"><strong>Skala:</strong> ${escape(scale?.label || '')} <em>(${escape(scale?.measurement || '')})</em></p>
          ${choice.justification ? `<p class="design-meta"><strong>Begrundelse:</strong> ${escape(choice.justification)}</p>` : ''}
        </div>
      `;
    }).join('');

    // Vertical option rendering — mirrors buildExportText logic
    const renderOptionsHtml = (scale) => {
      if (!scale) return '';
      if (scale.id === 'aaben') {
        return `<div class="options">
          <div class="text-line"></div>
          <div class="text-line"></div>
          <div class="text-line"></div>
        </div>`;
      }
      if (scale.id === 'semantisk') {
        return `<div class="options"><p class="opt-note">Specificér to modsatrettede ord med skala imellem, fx: Billig — — — — — — — Dyr</p></div>`;
      }
      if (REAL_OPTION_SCALES.has(scale.id)) {
        return `<div class="options">${scale.responseOptions.map(opt =>
          `<p class="opt-line"><span class="opt-mark">&#9675;</span> ${escape(opt)}</p>`
        ).join('')}</div>`;
      }
      // mc_single, mc_multi, rang, kategorier — placeholder
      const note = scale.responseOptions[0] || '';
      return `<div class="options"><p class="opt-note">[Tilføj konkrete svarmuligheder før udsendelse — ${escape(note.toLowerCase())}]</p></div>`;
    };

    const questionsHtml = constructs.map((c, idx) => {
      const scale = SCALE_BY_ID[scaleChoices[c.id]?.scaleId];
      const q = questions[c.id]?.text ?? '(ikke formuleret)';
      const screeningBadge = c.isScreening
        ? ` <span class="screening-badge">SCREENING</span>`
        : '';
      return `
        <div class="question-block">
          <p class="question-text"><span class="q-num">${String(idx + 1).padStart(2, '0')}.</span> ${escape(q)}${screeningBadge}</p>
          ${renderOptionsHtml(scale)}
        </div>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Spørgeskema-udkast</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
<style>
  @page { size: A4; margin: 2.5cm; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a2332; line-height: 1.55; font-size: 11pt; max-width: 720px; margin: 0 auto; padding: 24pt; }

  .header { margin-bottom: 18pt; padding-bottom: 12pt; border-bottom: 1pt solid #d6cfc1; }
  h1 { font-size: 24pt; font-weight: normal; margin: 0 0 4pt 0; letter-spacing: -0.01em; }
  .subtitle { color: #6b6557; font-style: italic; margin: 0; font-size: 10.5pt; }

  .section-heading { font-family: Calibri, Helvetica, sans-serif; font-size: 9pt; color: #7a2e3d; text-transform: uppercase; letter-spacing: 0.2em; margin: 22pt 0 14pt 0; font-weight: bold; }
  .subsection-heading { font-family: Calibri, Helvetica, sans-serif; font-size: 8pt; color: #6b6557; text-transform: uppercase; letter-spacing: 0.18em; margin: 16pt 0 10pt 0; font-weight: bold; }

  .meta { font-family: Calibri, Helvetica, sans-serif; font-size: 8pt; color: #6b6557; text-transform: uppercase; letter-spacing: 0.18em; margin: 0 0 4pt 0; font-weight: bold; }
  .research-section .field { margin-bottom: 12pt; }
  .research-question { font-style: italic; font-size: 12pt; margin: 0; line-height: 1.5; }
  .context-line { margin: 0; font-size: 10.5pt; line-height: 1.5; }

  .design-block { padding-left: 10pt; margin-bottom: 12pt; border-left: 1pt solid #d6cfc1; page-break-inside: avoid; }
  .design-block-screening { border-left: 2pt solid #7a2e3d; }
  .design-header { margin: 0 0 4pt 0; font-family: Calibri, Helvetica, sans-serif; font-size: 10pt; }
  .design-name { font-family: Georgia, serif; font-weight: normal; font-size: 11pt; color: #1a2332; margin-right: 10pt; }
  .design-type { color: #6b6557; text-transform: uppercase; font-size: 8pt; letter-spacing: 0.1em; margin-right: 10pt; }
  .screening-badge { color: #7a2e3d; font-weight: bold; font-size: 8pt; letter-spacing: 0.08em; padding: 1pt 4pt; border: 0.75pt solid #7a2e3d; text-transform: uppercase; }
  .design-def { margin: 0 0 4pt 0; font-size: 10pt; font-style: italic; color: #6b6557; line-height: 1.5; }
  .design-meta { margin: 2pt 0; font-size: 9.5pt; color: #6b6557; font-family: Calibri, Helvetica, sans-serif; line-height: 1.4; }
  .design-meta strong { color: #1a2332; font-weight: bold; }

  .divider-strong { border-top: 1.5pt solid #1a2332; margin: 24pt 0 0 0; }

  .question-block { margin-bottom: 18pt; page-break-inside: avoid; }
  .question-text { font-size: 12pt; margin: 0 0 6pt 0; line-height: 1.5; }
  .q-num { color: #7a2e3d; font-weight: bold; margin-right: 4pt; }
  .options { margin-left: 22pt; }
  .opt-line { font-family: Calibri, Helvetica, sans-serif; font-size: 10.5pt; margin: 3pt 0; line-height: 1.4; }
  .opt-mark { color: #6b6557; font-size: 12pt; margin-right: 6pt; }
  .opt-note { font-family: Calibri, Helvetica, sans-serif; font-size: 9.5pt; color: #6b6557; font-style: italic; margin: 3pt 0; }
  .text-line { border-bottom: 0.5pt solid #6b6557; height: 14pt; margin: 4pt 0; }

  .checklist { margin-top: 24pt; padding-top: 14pt; border-top: 1pt solid #d6cfc1; page-break-inside: avoid; }
  .checklist ul { padding-left: 0; margin: 8pt 0; list-style: none; }
  .checklist li { font-size: 10.5pt; margin: 6pt 0; line-height: 1.5; }
  .checklist li:before { content: "\\2610  "; color: #6b6557; }
  .checklist em { font-family: Georgia, serif; font-style: italic; color: #1a2332; font-weight: bold; }

  .footer { margin-top: 22pt; padding-top: 10pt; border-top: 0.5pt solid #d6cfc1; font-size: 8.5pt; color: #6b6557; font-style: italic; text-align: center; }
</style>
</head>
<body>
  <div class="header">
    <h1>Spørgeskema-udkast</h1>
    <p class="subtitle">Genereret til pilottest</p>
  </div>

  <p class="section-heading">Opsummering</p>

  <div class="research-section">
    <div class="field">
      <p class="meta">Forskningsspørgsmål</p>
      <p class="research-question">${escape(topic.research_question)}</p>
    </div>
    <div class="field">
      <p class="meta">Formål</p>
      <p class="context-line">${escape(topic.purpose)}</p>
    </div>
    ${topic.target_group ? `<div class="field">
      <p class="meta">Målgruppe</p>
      <p class="context-line">${escape(topic.target_group)}</p>
    </div>` : ''}
  </div>

  <p class="subsection-heading">Designgrundlag — emner og skalavalg</p>
  ${designHtml}

  <div class="divider-strong"></div>

  <p class="section-heading">Spørgeskema</p>

  ${questionsHtml}

  <div class="checklist">
    <p class="meta">Tjekliste før udsendelse</p>
    <ul>
      <li><em>Sprog</em> — målrettet respondenterne, ikke akademisk eller intern jargon</li>
      <li><em>Svartid</em> — under 10 minutter, mål faktisk tid på pilottest</li>
      <li><em>Pilottest</em> — 3-5 personer fra målgruppen før udrulning</li>
    </ul>
  </div>

  <div class="footer">Udarbejdet med spørgeskemadesigneren — husk pilottest før udsendelse.</div>
</body>
</html>`;
  };

  const exportText = buildExportText();

  const copy = async () => {
    let success = false;

    // Try modern Clipboard API first
    try {
      await navigator.clipboard.writeText(exportText);
      success = true;
    } catch (e) { /* fall through to legacy approach */ }

    // Fallback: textarea + execCommand (works in some sandboxed iframes where Clipboard API is blocked)
    if (!success) {
      try {
        const ta = document.createElement('textarea');
        ta.value = exportText;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '0';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        success = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) { /* both methods failed */ }
    }

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      // Both methods blocked — surface manual fallback
      setShowFallback(true);
    }
  };

  // Robust download: appends element to DOM (required by some browsers/sandboxes)
  const triggerDownload = (filename, content, mimeType) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try { document.body.removeChild(a); } catch (e) {}
        URL.revokeObjectURL(url);
      }, 200);
    } catch (e) {
      console.error('Download error:', e);
      setShowFallback(true);
    }
  };

  const downloadText = () => triggerDownload('spoergeskema_udkast.txt', exportText, 'text/plain;charset=utf-8');

  const downloadWord = () => {
    // BOM ensures correct encoding when Word opens the file
    triggerDownload('spoergeskema_udkast.doc', '\ufeff' + buildHtmlDocument(), 'application/msword');
  };

  const downloadPDF = () => {
    const html = buildHtmlDocument();
    try {
      // Hidden iframe approach — opens print dialog where user chooses "Save as PDF"
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          console.error('Print failed:', e);
          setShowFallback(true);
        }
        setTimeout(() => {
          try { document.body.removeChild(iframe); } catch (e) {}
        }, 2000);
      }, 350);
    } catch (e) {
      console.error('PDF generation failed:', e);
      setShowFallback(true);
    }
  };

  const renderQuestionnaireOptions = (scale) => {
    if (!scale) return null;

    // Open-ended: render as text-input lines
    if (scale.id === 'aaben') {
      return (
        <div className="ml-10 mt-4 space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} style={{ borderBottom: '1px solid var(--rule)', height: '18px' }}></div>
          ))}
        </div>
      );
    }

    // Semantic differential: descriptive line
    if (scale.id === 'semantisk') {
      return (
        <div className="ml-10 mt-4 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink-soft)' }}>
          {scale.responseOptions[0]}
        </div>
      );
    }

    const isMulti = scale.id === 'mc_multi';

    return (
      <div className="ml-10 mt-4 space-y-2.5">
        {scale.responseOptions.map((opt, i) => (
          <div key={i} className="flex items-center gap-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink)', fontSize: '0.95rem', lineHeight: 1.4 }}>
            <span style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              border: '1.5px solid var(--ink-soft)',
              borderRadius: isMulti ? '2px' : '50%',
              flexShrink: 0,
            }} />
            <span>{opt}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <StepHeader
        number={6}
        title="Færdigt udkast"
        subtitle="Her er det samlede spørgeskema. Brug det som udgangspunkt - men husk: et godt spørgeskema færdigprøves i en pilot på 3-5 personer fra målgruppen, før det rulles ud."
      />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="p-8" style={{ backgroundColor: 'var(--paper-warm)' }}>

            {/* OPSUMMERING — TRIN 1-3 */}
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
                Opsummering
              </p>

              <div className="space-y-4 mb-7 pb-6" style={{ borderBottom: '1px solid var(--rule)' }}>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                    Forskningsspørgsmål
                  </p>
                  <p className="text-base" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.55 }}>
                    {topic.research_question}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                    Formål
                  </p>
                  <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink)', lineHeight: 1.55 }}>
                    {topic.purpose}
                  </p>
                </div>
                {topic.target_group && (
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                      Målgruppe
                    </p>
                    <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink)', lineHeight: 1.55 }}>
                      {topic.target_group}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                Designgrundlag — emner og skalavalg
              </p>
              <div className="space-y-5">
                {constructs.map(c => {
                  const choice = scaleChoices[c.id] || {};
                  const scale = SCALE_BY_ID[choice.scaleId];
                  const ctype = CONSTRUCT_TYPE_BY_ID[c.type];
                  return (
                    <div key={c.id} className="pl-3" style={{ borderLeft: c.isScreening ? '2px solid var(--accent)' : '1px solid var(--rule)' }}>
                      <div className="flex items-baseline gap-2 flex-wrap mb-1">
                        <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: '1rem', color: 'var(--ink)' }}>
                          {c.name}
                        </span>
                        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                          {ctype.label}
                        </span>
                        {c.isScreening && (
                          <span className="text-xs px-1.5 py-0.5 uppercase" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600, letterSpacing: '0.05em', border: '1px solid var(--accent)' }}>
                            Screening
                          </span>
                        )}
                      </div>
                      <p className="text-sm mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink-soft)', lineHeight: 1.5, fontStyle: 'italic' }}>
                        {c.definition}
                      </p>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Skala: </span>{scale?.label} <span style={{ fontStyle: 'italic' }}>({scale?.measurement})</span>
                      </p>
                      {choice.justification && (
                        <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Begrundelse: </span>{choice.justification}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SPØRGESKEMA */}
            <div className="pt-8" style={{ borderTop: '2px solid var(--ink)' }}>
              <p className="text-xs uppercase tracking-[0.2em] mb-7" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
                Spørgeskema
              </p>

              <div className="space-y-9">
                {constructs.map((c, idx) => {
                  const scale = SCALE_BY_ID[scaleChoices[c.id]?.scaleId];
                  const q = questions[c.id]?.text ?? '(ikke formuleret)';
                  return (
                    <div key={c.id}>
                      <div className="flex items-baseline gap-3 mb-1">
                        <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: '1.05rem', color: 'var(--accent)', minWidth: '2rem' }}>
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <div className="flex-1">
                          <p style={{ fontFamily: 'Fraunces, serif', color: 'var(--ink)', fontSize: '1.05rem', lineHeight: 1.5 }}>
                            {q}
                          </p>
                          {c.isScreening && (
                            <span className="inline-block text-xs px-1.5 py-0.5 uppercase mt-2" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600, letterSpacing: '0.05em', border: '1px solid var(--accent)' }}>
                              Screening
                            </span>
                          )}
                        </div>
                      </div>
                      {renderQuestionnaireOptions(scale)}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        <aside>
          <div className="space-y-3 sticky top-6">
            <button
              onClick={downloadWord}
              className="w-full px-4 py-3 text-sm transition-all"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontWeight: 500,
                color: 'var(--paper)',
                backgroundColor: 'var(--ink)',
              }}
            >
              Download som Word
            </button>
            <button
              onClick={downloadPDF}
              className="w-full px-4 py-3 text-sm transition-all"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontWeight: 500,
                color: 'var(--ink)',
                backgroundColor: 'transparent',
                border: '1px solid var(--ink)',
              }}
            >
              Download som PDF
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={copy}
                className="px-3 py-2 text-xs transition-all"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontWeight: 400,
                  color: 'var(--ink-soft)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--rule)',
                }}
              >
                {copied ? 'Kopieret ✓' : 'Kopiér tekst'}
              </button>
              <button
                onClick={downloadText}
                className="px-3 py-2 text-xs transition-all"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontWeight: 400,
                  color: 'var(--ink-soft)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--rule)',
                }}
              >
                Som .txt
              </button>
            </div>

            <button
              onClick={onRestart}
              className="w-full px-4 py-3 text-sm transition-all mt-2"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontWeight: 400,
                color: 'var(--ink-soft)',
                backgroundColor: 'transparent',
              }}
            >
              Start forfra
            </button>

            <button
              onClick={() => setShowFallback(!showFallback)}
              className="w-full px-3 py-2 text-xs transition-all mt-2"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontWeight: 400,
                color: 'var(--ink-soft)',
                backgroundColor: 'transparent',
                border: '1px dashed var(--rule)',
              }}
            >
              {showFallback ? 'Skjul fuld tekst' : 'Vis fuld tekst (manuel kopi)'}
            </button>

            <p className="text-xs pt-2" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontStyle: 'italic', lineHeight: 1.5 }}>
              PDF åbner i printdialogen — vælg "Gem som PDF" som destination. Hvis browseren blokerer downloads eller kopiering, brug "Vis fuld tekst" og kopiér manuelt med Ctrl+C.
            </p>

            <div className="p-5 mt-6" style={{ borderLeft: '2px solid var(--accent)' }}>
              <p className="text-xs uppercase tracking-[0.18em] mb-3" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
                Tjekliste før udsendelse
              </p>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--ink)', fontFamily: 'IBM Plex Sans, sans-serif', lineHeight: 1.5 }}>
                <li><span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>Sprog</span> — målrettet respondenterne, ikke akademisk eller intern jargon</li>
                <li><span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>Svartid</span> — under 10 minutter, mål faktisk tid på pilottest</li>
                <li><span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>Pilottest</span> — 3-5 personer fra målgruppen før udrulning</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {showFallback && (
        <div className="mt-10 p-6" style={{ backgroundColor: 'var(--paper-warm)', border: '1px solid var(--rule)' }}>
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
              Manuel kopi
            </p>
            <p className="text-sm" style={{ color: 'var(--ink)', fontFamily: 'IBM Plex Sans, sans-serif', lineHeight: 1.55 }}>
              Klik i tekstboksen nedenfor for at markere alt, og kopiér med Ctrl+C (Cmd+C på Mac). Indsæt derefter i Word, Google Docs eller anden tekstbehandling.
            </p>
          </div>
          <textarea
            readOnly
            value={exportText}
            onClick={e => { e.target.focus(); e.target.select(); }}
            rows={20}
            className="w-full p-4 text-xs focus:outline-none"
            style={{
              fontFamily: 'ui-monospace, SF Mono, Menlo, Consolas, monospace',
              backgroundColor: 'var(--paper)',
              color: 'var(--ink)',
              border: '1px solid var(--rule)',
              lineHeight: 1.55,
              resize: 'vertical',
            }}
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-10 mt-10 border-t" style={{ borderColor: 'var(--rule)' }}>
        <button
          onClick={onBack}
          className="px-5 py-2.5 text-sm"
          style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink-soft)' }}
        >
          ← Tilbage til spørgsmål
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// HOVEDKOMPONENT
// ============================================================================

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [topic, setTopic] = useState({ research_question: '', purpose: '', target_group: '' });
  const [constructs, setConstructs] = useState([{ id: Date.now(), name: '', type: 'holdning', definition: '', isScreening: false }]);
  const [scaleChoices, setScaleChoices] = useState({});
  const [questions, setQuestions] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Inject Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  const goNext = () => {
    setCompletedSteps(new Set([...completedSteps, currentStep]));
    setCurrentStep(s => Math.min(s + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goBack = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goTo = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const restart = () => {
    setCurrentStep(0);
    setTopic({ research_question: '', purpose: '', target_group: '' });
    setConstructs([{ id: Date.now(), name: '', type: 'holdning', definition: '', isScreening: false }]);
    setScaleChoices({});
    setQuestions({});
    setCompletedSteps(new Set());
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <style>{`
        :root {
          --paper: #f7f3ea;
          --paper-warm: #efe9dc;
          --ink: #1a2332;
          --ink-soft: #6b6557;
          --accent: #7a2e3d;
          --success: #4a6b50;
          --rule: #d6cfc1;
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder, textarea::placeholder {
          color: #a39c8e;
          font-style: italic;
        }
        input:focus, textarea:focus, select:focus {
          border-color: var(--ink) !important;
        }
        details summary { list-style: none; }
        details summary::-webkit-details-marker { display: none; }
        details[open] summary { margin-bottom: 0.5rem; }
        details .summary-open-text { display: none; }
        details[open] .summary-closed-text { display: none; }
        details[open] .summary-open-text { display: inline; }
      `}</style>

      <header className="border-b" style={{ borderColor: 'var(--rule)', backgroundColor: 'var(--paper-warm)' }}>
        <div className="max-w-6xl mx-auto px-8 py-8">
          <p className="text-xs uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Spørgeskemadesigner · markedsanalyse
          </p>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.015em', lineHeight: 1.1 }}>
            Fra emne til <span style={{ fontStyle: 'italic' }}>spørgsmål</span>
          </h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--ink-soft)', lineHeight: 1.55 }}>
            En struktureret guide gennem de tre kritiske led: emne-operationalisering, skalavalg og spørgsmålsformulering.
          </p>
        </div>
      </header>

      <StepIndicator currentStep={currentStep} onJump={goTo} completedSteps={completedSteps} />

      <main className="max-w-6xl mx-auto px-8 py-12">
        {currentStep === 0 && <TopicStep topic={topic} setTopic={setTopic} onNext={goNext} />}
        {currentStep === 1 && <ConstructsStep topic={topic} constructs={constructs} setConstructs={setConstructs} onBack={goBack} onNext={goNext} />}
        {currentStep === 2 && <ScalesStep topic={topic} constructs={constructs} scaleChoices={scaleChoices} setScaleChoices={setScaleChoices} onBack={goBack} onNext={goNext} />}
        {currentStep === 3 && <QuestionsStep topic={topic} constructs={constructs} scaleChoices={scaleChoices} questions={questions} setQuestions={setQuestions} onBack={goBack} onNext={goNext} />}
        {currentStep === 4 && <OrderStep topic={topic} constructs={constructs} setConstructs={setConstructs} scaleChoices={scaleChoices} questions={questions} onBack={goBack} onNext={goNext} />}
        {currentStep === 5 && <FinalStep topic={topic} constructs={constructs} scaleChoices={scaleChoices} questions={questions} onBack={goBack} onRestart={restart} />}
      </main>

      <footer className="max-w-6xl mx-auto px-8 py-8 mt-12 text-xs" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--rule)' }}>
        Værktøj til markedsanalyse · Akademisk niveau · Husk: spørgeskemaer skal altid pilottestes
      </footer>
    </div>
  );
}
