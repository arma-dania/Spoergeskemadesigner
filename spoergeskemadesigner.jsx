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
    measurement: 'ordinal',
    codebookLevel: 'Ordinal (Likert)',
    description: 'Symmetrisk enighedsskala med numeriske ankre (1-5). Ét udsagn er ordinalt: Vi ved, at 4 er mere enig end 3, men ikke at afstandene er lige store. Vis svarene som en fordeling, fx andelen der er enige.',
    responseOptions: ['1 Helt uenig', '2 Uenig', '3 Hverken eller', '4 Enig', '5 Helt enig', 'Ved ikke'],
    bestFor: ['holdning', 'intention'],
    formulationHint: 'Formuleres som påstand, ikke spørgsmål: "Jeg er tilfreds med…"',
    pitfall: '"Ved ikke" er ikke det samme som midtpunktet 3 - det kodes for sig (fx 99) og bliver en tom celle i analysen.',
  },
  {
    id: 'likert7',
    label: 'Likert-skala (7 punkter)',
    measurement: 'ordinal',
    codebookLevel: 'Ordinal (Likert)',
    description: 'Mere differentieret enighedsskala med numeriske ankre (1-7). Ordinal ligesom 5-punkts Likert - giver flere nuancer, men også flere celler i en krydstabel.',
    responseOptions: ['1 Helt uenig', '2 Uenig', '3 Lidt uenig', '4 Hverken eller', '5 Lidt enig', '6 Enig', '7 Helt enig', 'Ved ikke'],
    bestFor: [],
    formulationHint: 'Formuleres som påstand. Egnet når du forventer nuancerede holdninger.',
    pitfall: 'Kan være overkill - 5 punkter er ofte tilstrækkeligt.',
  },
  {
    id: 'semantisk',
    label: 'Semantisk differential',
    measurement: 'ordinal (behandles ofte som interval)',
    codebookLevel: 'Interval*',
    description: 'To modsatrettede udtryk med en skala imellem.',
    responseOptions: ['Eks: Billig — — — — — — — Dyr'],
    bestFor: ['holdning'],
    formulationHint: 'Vælg ordpar der reelt er antonymer i målgruppens sprog.',
    pitfall: 'Undgå tekniske ord - test ordparrene i pilot.',
  },
  {
    id: 'numerisk',
    label: 'Numerisk skala (0-10)',
    measurement: 'ordinal (behandles som interval)',
    codebookLevel: 'Interval*',
    description: 'Talvurdering, fx NPS-stilen 0-10. Med mange trin behandles den som interval, så du kan regne gennemsnit.',
    responseOptions: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    bestFor: ['holdning', 'intention'],
    formulationHint: 'Angiv altid hvad endepunkterne betyder ("0 = meget usandsynligt").',
    pitfall: 'Tal tolkes kulturelt forskelligt - en 7\'er kan være enten god eller middel.',
  },
  {
    id: 'numerisk10',
    label: 'Numerisk skala (1-10)',
    measurement: 'ordinal (behandles som interval)',
    codebookLevel: 'Interval*',
    description: 'Talvurdering fra 1 til 10, fx samlet tilfredshed. Med mange trin behandles den som interval, så du kan regne gennemsnit.',
    responseOptions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    bestFor: ['holdning'],
    formulationHint: 'Angiv altid hvad endepunkterne betyder ("1 = Meget utilfreds … 10 = Meget tilfreds").',
    pitfall: 'Der er ingen midte på en 1-10-skala - vil du have et neutralt midtpunkt, så brug 0-10.',
  },
  {
    id: 'talsvar',
    label: 'Talsvar (præcist tal)',
    measurement: 'ratio',
    codebookLevel: 'Ratio',
    description: 'Respondenten skriver et tal: alder i år, beløb i kroner, antal gange. Giver de mest præcise data - grupper kan altid dannes bagefter i analysen.',
    responseOptions: ['_____ (tal med enhed)'],
    bestFor: ['adfaerd', 'demografi'],
    formulationHint: 'Angiv enheden i spørgsmålet: "Hvor gammel er du? (år)", "Hvad betalte du? (kr.)".',
    pitfall: 'Gruppér først i analysen, ikke i spørgsmålet - så kan du både regne gennemsnit og danne grupper.',
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
    measurement: 'ordinal',
    description: 'Faktiske antalsintervaller for adfærd. Intervallerne gør skalaen ordinal - vil du regne gennemsnit, så spørg til det præcise antal (Talsvar).',
    responseOptions: ['0 gange', '1-2 gange', '3-5 gange', '6-10 gange', 'Mere end 10 gange'],
    bestFor: ['adfaerd'],
    formulationHint: 'Specificér tidsperiode: "...inden for de seneste 30 dage".',
    pitfall: 'Intervaller skal dække hele spektrum uden overlap.',
  },
  {
    id: 'vigtighed',
    label: 'Vigtighedsskala',
    measurement: 'ordinal',
    codebookLevel: 'Ordinal',
    description: 'Hvor vigtigt et aspekt er for respondenten (1-5). Ordinal ligesom Likert: vis svarene som en fordeling.',
    responseOptions: ['1 Slet ikke vigtigt', '2 Lidt vigtigt', '3 Nogenlunde vigtigt', '4 Vigtigt', '5 Meget vigtigt', 'Ved ikke'],
    bestFor: ['holdning'],
    formulationHint: '"Hvor vigtigt er X, når du…?"',
    pitfall: 'Næsten alt fremstår "vigtigt" - kombinér ofte med rangordning.',
  },
  {
    id: 'sandsynlighed',
    label: 'Sandsynlighedsskala',
    measurement: 'ordinal',
    codebookLevel: 'Ordinal',
    description: 'Hvor sandsynligt det er, at respondenten gør noget (1-5). Ordinal ligesom Likert: vis svarene som en fordeling.',
    responseOptions: ['1 Slet ikke sandsynligt', '2 Lidt sandsynligt', '3 Sandsynligt', '4 Meget sandsynligt', '5 Helt sikkert', 'Ved ikke'],
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
const REAL_OPTION_SCALES = new Set(['likert5', 'likert7', 'numerisk', 'numerisk10', 'frekvens_vag', 'frekvens_konkret', 'vigtighed', 'sandsynlighed']);

// Skalaer med udsagn, hvor flere udsagn om samme emne kan samles i et indeks (niveau 2)
const STATEMENT_SCALES = new Set(['likert5', 'likert7', 'vigtighed', 'sandsynlighed']);

// Skalaer, hvor den studerende selv skriver svarmuligheder, enhed eller endepunkter
const CUSTOM_OPTION_HELP = {
  mc_single: { label: 'Svarmuligheder (én pr. linje)', placeholder: 'Sort\nHvid\nSand' },
  mc_multi: { label: 'Svarmuligheder (én pr. linje)', placeholder: 'Instagram\nFacebook\nTikTok' },
  rang: { label: 'Elementer, der skal rangordnes (én pr. linje)', placeholder: 'Pris\nLyd\nDesign' },
  kategorier: { label: 'Kategorier (én pr. linje)', placeholder: '20-29 år\n30-39 år\n40-55 år' },
  semantisk: { label: 'Ordpar (venstre … højre)', placeholder: 'Billig … Dyr' },
  talsvar: { label: 'Enhed og evt. spænd', placeholder: 'År (20–55)' },
  numerisk: { label: 'Hvad betyder endepunkterne?', placeholder: '0 = Meget usandsynligt … 10 = Meget sandsynligt' },
  numerisk10: { label: 'Hvad betyder endepunkterne?', placeholder: '1 = Meget utilfreds … 10 = Meget tilfreds' },
};
const LIST_OPTION_SCALES = new Set(['mc_single', 'mc_multi', 'rang', 'kategorier']);

const listOptions = text => (text || '').split('\n').map(o => o.trim()).filter(Boolean);

// Variabelnavn til kodebogen: små bogstaver, understreg i stedet for mellemrum
const slugify = name => (name || '').toLowerCase().trim()
  .replace(/[^a-z0-9æøå]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30) || 'variabel';

// Alle spørgsmål (udsagn) for ét emne: hovedspørgsmålet + evt. ekstra udsagn til et indeks
function itemsOf(construct, scaleChoices, questions) {
  const q = questions[construct.id] || {};
  const base = construct.varName || slugify(construct.name);
  const scaleId = scaleChoices[construct.id]?.scaleId;
  const extra = STATEMENT_SCALES.has(scaleId) ? (q.extraItems || []) : [];
  const items = [{ text: q.text || '', reversed: !!q.reversed, varName: extra.length ? (q.varName || `${base}_1`) : base }];
  extra.forEach((it, k) => items.push({ text: it.text || '', reversed: !!it.reversed, varName: it.varName || `${base}_${k + 2}` }));
  return items;
}

// Spørgsmålsnumre i skemaet: { emne-id: [numre] } - et emne med indeks fylder flere numre
function questionNumbers(constructs, scaleChoices, questions) {
  let n = 0;
  const out = {};
  constructs.forEach(c => { out[c.id] = itemsOf(c, scaleChoices, questions).map(() => ++n); });
  return out;
}

const numRange = nums => {
  if (!nums.length) return '';
  const sorted = [...nums].sort((a, b) => a - b);
  const contiguous = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1);
  return contiguous && sorted.length > 1 ? `${sorted[0]}–${sorted[sorted.length - 1]}` : sorted.join(', ');
};

// Tekst om springlogik/screening, som den står i udkast og kodebog
function routingNotes(c, constructs, numbers) {
  const notes = [];
  if (c.isScreening) notes.push(`screening: ${c.screeningRule?.trim() || 'uden for målgruppen'} → skemaet slutter`);
  const src = c.filter && constructs.find(x => x.id === c.filter.sourceId);
  if (src) notes.push(`kun hvis «${c.filter.answer || 'Ja'}» til ${numbers[src.id]?.[0]}`);
  const deps = constructs.filter(x => x.filter?.sourceId === c.id);
  if (deps.length) {
    const answer = deps[0].filter.answer || 'Ja';
    notes.push(`filter: kun «${answer}» får spørgsmål ${numRange(deps.flatMap(d => numbers[d.id] || []))}`);
  }
  return notes;
}

// Svarmuligheder, som de vises for respondenten (null = skriv selv / ikke angivet)
function displayOptions(scale, q) {
  if (!scale) return null;
  if (LIST_OPTION_SCALES.has(scale.id)) { const o = listOptions(q?.options); return o.length ? o : null; }
  if (REAL_OPTION_SCALES.has(scale.id)) return scale.responseOptions;
  return null;
}

// "Koder" i kodebogen
function codesText(scale, q) {
  if (!scale) return '';
  const custom = (q?.options || '').trim();
  if (LIST_OPTION_SCALES.has(scale.id)) return listOptions(custom).join(' · ') || '(svarmuligheder mangler)';
  if (['talsvar', 'semantisk', 'numerisk', 'numerisk10'].includes(scale.id) && custom) return custom.replace(/\n/g, ' ');
  if (scale.id === 'aaben') return 'Fri tekst';
  const opts = scale.responseOptions;
  if (scale.id === 'frekvens_konkret') return opts.join(' · ');
  const labelled = opts.filter(o => /^\d+ /.test(o)).map(o => o.replace(/^(\d+) /, '$1 = '));
  const extra = opts.filter(o => !/^\d/.test(o));
  if (labelled.length) return [`${labelled[0]} … ${labelled[labelled.length - 1]}`, ...extra].join(' · ');
  return `${opts[0]} … ${opts[opts.length - 1]}`;
}

// Kodebog med samme kolonner som kodebogen på statistiksiden
const CODEBOOK_HEAD = ['Variabel', 'Spørgsmål', 'Skalatype', 'Koder', 'Manglende'];
function buildCodebook(constructs, scaleChoices, questions) {
  const numbers = questionNumbers(constructs, scaleChoices, questions);
  const rows = [['id', 'Respondentens løbenummer', 'Nominal (id)', 'Heltal', '—']];
  constructs.forEach(c => {
    const scale = SCALE_BY_ID[scaleChoices[c.id]?.scaleId];
    const q = questions[c.id] || {};
    const notes = routingNotes(c, constructs, numbers);
    const level = scale ? (scale.codebookLevel || scale.measurement.charAt(0).toUpperCase() + scale.measurement.slice(1)) : '?';
    const codes = codesText(scale, q);
    const opts = scale ? (displayOptions(scale, q) || []) : [];
    const dontKnow = opts.some(o => /ved ikke/i.test(o));
    const missing = c.filter ? `Tom = ikke relevant (springlogik)${dontKnow ? ' · 99 = Ved ikke → tom' : ''}`
      : dontKnow ? '99 = Ved ikke → tom' : 'Tom';
    itemsOf(c, scaleChoices, questions).forEach((it, k) => {
      const statement = STATEMENT_SCALES.has(scale?.id);
      let text = `${numbers[c.id][k]}. ${statement ? `“${it.text}”` : it.text}`;
      if (it.reversed) text += ' (negativt formuleret)';
      if (notes.length && k === 0) text += ` (${notes.join('; ')})`;
      rows.push([it.varName, text, level, codes, missing]);
    });
  });
  return rows;
}

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

// På Netlify går kaldet gennem /api/claude (netlify/functions/claude.mjs), hvor API-nøglen
// ligger. Køres siden som Claude-artifact, findes /api/claude ikke - så bruges artifactets
// indbyggede adgang til Claude i stedet.
const AI_PROXY = '/api/claude';
const ARTIFACT_MODEL = 'claude-sonnet-4-20250514';

async function callClaude(prompt) {
  let res = null;
  if (window.location.protocol.startsWith('http')) {
    try {
      res = await fetch(AI_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
    } catch (e) { res = null; }
  }
  if (res && res.status !== 404) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `serveren svarede med ${res.status}`);
    return data.text || '';
  }
  // Fallback: Claude-artifact
  let direct;
  try {
    direct = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: ARTIFACT_MODEL, max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }),
    });
  } catch (e) {
    throw new Error('AI-feedback kræver, at siden åbnes fra Netlify-adressen (eller som Claude-artifact)');
  }
  if (!direct.ok) throw new Error(`API svarede med ${direct.status}`);
  const data = await direct.json();
  return data.content.filter(b => b.type === 'text').map(b => b.text).join('');
}

// Alle feedback-prompts beder om ren JSON; svaret pakkes ud her
async function askClaudeForJson(prompt) {
  try {
    const text = await callClaude(prompt);
    const cleaned = text.replace(/```json|```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Kunne ikke læse AI-svaret');
    return JSON.parse(match[0]);
  } catch (e) {
    return { error: e.message };
  }
}

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

  return askClaudeForJson(prompt);
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

  return askClaudeForJson(prompt);
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

  return askClaudeForJson(prompt);
}

async function evaluateOrderWithAI(constructs, scaleChoices, questions, topic) {
  const numbered = constructs.map((c, i) => {
    const scale = SCALE_BY_ID[scaleChoices[c.id]?.scaleId];
    const q = questions[c.id]?.text ?? '(ikke formuleret)';
    const ctype = CONSTRUCT_TYPE_BY_ID[c.type].label;
    const screeningTag = c.isScreening ? ' [SCREENING]' : '';
    const srcIdx = c.filter ? constructs.findIndex(x => x.id === c.filter.sourceId) : -1;
    const filterTag = srcIdx >= 0 ? ` [KUN HVIS «${c.filter.answer}» TIL NR. ${srcIdx + 1}]` : '';
    return `${i + 1}. [${ctype}]${screeningTag}${filterTag} ${c.name} (${scale?.label ?? '?'}) — "${q}"`;
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
- SPRINGLOGIK (markeret [KUN HVIS … TIL NR. X]) er IKKE screening: De, der ikke får spørgsmålet, fortsætter i skemaet. Spørgsmålet, der styrer springet, skal stå FØR de spørgsmål, der afhænger af det, og de afhængige spørgsmål bør stå samlet lige efter det. Filterspørgsmålet skal IKKE flyttes allerførst.
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

  return askClaudeForJson(prompt);
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

function TopicStep({ topic, setTopic, onNext, onLoadExample }) {
  const canProceed = topic.research_question.trim().length > 15 && topic.purpose.trim().length > 15;
  return (
    <div>
      <StepHeader
        number={1}
        title="Formål og forskningsspørgsmål"
        subtitle="Start ved formålet — den praktiske beslutning eller ledelsesønske, der har udløst undersøgelsen. Derfra udledes forskningsspørgsmålet, som spørgeskemaet skal kunne besvare. Når kæden er rigtig fra start, falder emner og skalaer naturligt på plads."
      />

      <div className="mb-10 p-5 flex flex-wrap items-center gap-4" style={{ backgroundColor: 'var(--paper-warm)', border: '1px dashed var(--rule)' }}>
        <div className="flex-1" style={{ minWidth: '240px' }}>
          <p className="text-sm" style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, color: 'var(--ink)' }}>Se et færdigt eksempel: SonicWaves webshopundersøgelse</p>
          <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            SonicWaves undersøgelse af webshoppen fra sidste år. Eksemplet viser alle seks trin med screening, springlogik, et indeks og kodebog — det samme skema, som eksempeldataene på statistiksiden kommer fra.
          </p>
        </div>
        <button onClick={onLoadExample} className="px-4 py-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500, color: 'var(--ink)', border: '1px solid var(--ink)', backgroundColor: 'transparent' }}>
          Indlæs eksemplet
        </button>
      </div>

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
              Det overordnede empiriske spørgsmål, der oversætter formålet til noget undersøgelsen kan besvare. Det er ikke det samme som problemformuleringen: Problemformuleringen gælder hele opgaven, mens forskningsspørgsmålet er den del, spørgeskemaet skal kunne besvare.
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
  // Fjernes et emne, fjernes også springlogik, der peger på det
  const removeConstruct = id => setConstructs(constructs.filter(c => c.id !== id)
    .map(c => c.filter?.sourceId === id ? { ...c, filter: null } : c));

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
          const filterSources = constructs.slice(0, idx).filter(c => !c.filter);
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
                    Markér hvis svaret afgør, om personen overhovedet hører til målgruppen — fx alder, når målgruppen er 20-55 år. Passer svaret ikke, <em style={{ fontFamily: 'Fraunces, serif' }}>slutter</em> skemaet, og personen er ikke med i datasættet. Screeningsspørgsmål placeres altid <em style={{ fontFamily: 'Fraunces, serif' }}>først</em> i skemaet, også selvom de er demografiske.
                  </span>
                </label>
                {construct.isScreening && (
                  <input
                    type="text"
                    value={construct.screeningRule || ''}
                    onChange={e => updateConstruct(construct.id, { screeningRule: e.target.value })}
                    placeholder="Hvem slutter skemaet? Fx: under 20 eller over 55"
                    aria-label="Hvem slutter skemaet ved screeningen"
                    className="w-full mt-3 px-3 py-2 text-sm focus:outline-none"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', backgroundColor: 'var(--paper-warm)', border: '1px solid var(--rule)', color: 'var(--ink)' }}
                  />
                )}
              </div>
            </div>

            {(filterSources.length > 0 || construct.filter) && (
              <div className="mt-5">
                <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                  Springlogik — stilles kun til nogle
                </label>
                <div className="p-3" style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--rule)' }}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!construct.filter}
                      onChange={e => updateConstruct(construct.id, {
                        filter: e.target.checked ? { sourceId: filterSources[filterSources.length - 1].id, answer: 'Ja' } : null,
                      })}
                      style={{ marginTop: '3px', accentColor: 'var(--accent)', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                      Markér hvis spørgsmålet kun skal stilles til dem, der har svaret noget bestemt på et tidligere spørgsmål — fx produktspørgsmål kun til dem, der ejer produktet. Til forskel fra screening <em style={{ fontFamily: 'Fraunces, serif' }}>fortsætter</em> de andre i skemaet. Deres tomme svar betyder "ikke relevant" — ikke manglende svar.
                    </span>
                  </label>
                  {construct.filter && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink)' }}>
                      <span>Kun hvis svaret er</span>
                      <input
                        type="text"
                        value={construct.filter.answer}
                        onChange={e => updateConstruct(construct.id, { filter: { ...construct.filter, answer: e.target.value } })}
                        aria-label="Svar, der giver adgang til spørgsmålet"
                        className="px-2 py-1 text-sm focus:outline-none"
                        style={{ width: '7rem', backgroundColor: 'var(--paper-warm)', border: '1px solid var(--rule)', color: 'var(--ink)' }}
                      />
                      <span>på</span>
                      <select
                        value={construct.filter.sourceId}
                        onChange={e => updateConstruct(construct.id, { filter: { ...construct.filter, sourceId: Number(e.target.value) } })}
                        aria-label="Spørgsmål, der styrer springlogikken"
                        className="px-2 py-1 text-sm focus:outline-none"
                        style={{ backgroundColor: 'var(--paper-warm)', border: '1px solid var(--rule)', color: 'var(--ink)', maxWidth: '100%' }}
                      >
                        {(filterSources.some(c => c.id === construct.filter.sourceId) ? filterSources
                          : [...filterSources, constructs.find(c => c.id === construct.filter.sourceId)].filter(Boolean)).map(c => (
                          <option key={c.id} value={c.id}>{c.name || '(unavngivet emne)'}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-5">
              <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                Variabelnavn i kodebogen (valgfrit)
              </label>
              <input
                type="text"
                value={construct.varName || ''}
                onChange={e => updateConstruct(construct.id, { varName: e.target.value.replace(/\s+/g, '_') })}
                placeholder={slugify(construct.name)}
                className="w-full px-3 py-2 text-sm focus:outline-none"
                style={{ fontFamily: 'ui-monospace, Menlo, Consolas, monospace', backgroundColor: 'var(--paper)', border: '1px solid var(--rule)', color: 'var(--ink)' }}
              />
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
  // Funktionelle opdateringer, så samtidige ændringer (fx AI-svar) ikke overskriver hinanden
  const patchQuestion = (constructId, patch) => {
    setQuestions(prev => ({ ...prev, [constructId]: { ...prev[constructId], ...patch } }));
  };
  const setQuestionForConstruct = (constructId, value) => patchQuestion(constructId, { text: value, evaluation: null });
  const setExtraItems = (constructId, items) => patchQuestion(constructId, { extraItems: items });

  const allFormulated = constructs.every(c => questions[c.id]?.text?.trim().length > 5);
  const numbers = questionNumbers(constructs, scaleChoices, questions);

  return (
    <div>
      <StepHeader
        number={4}
        title="Formulér spørgsmålene"
        subtitle="Nu kobles emne og skala til konkret formulering. Skriv ét spørgsmål per emne - hold dig til netop det, emnet skal måle. Skriv også svarmulighederne, hvor skalaen kræver det: Det er dem, der bliver til koder i kodebogen. Brug 'Få AI-feedback' for grundig vurdering, eller stol på de automatiske advarsler."
      />

      <div className="space-y-8">
        {constructs.map(construct => {
          const choice = scaleChoices[construct.id];
          const scale = SCALE_BY_ID[choice?.scaleId];
          if (!scale) {
            return (
              <div key={construct.id} className="p-4 text-sm" style={{ backgroundColor: 'var(--paper-warm)', borderLeft: '2px solid var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink)' }}>
                <strong>{construct.name || 'Et nyt emne'}</strong> mangler en skala. Gå tilbage til trin 3 og vælg en skala først.
              </div>
            );
          }
          const q = questions[construct.id] ?? { text: '', evaluation: null, loading: false };
          const text = q.text || '';
          const ruleIssues = text.trim().length > 5 ? ruleBasedChecks(text) : [];
          const customHelp = CUSTOM_OPTION_HELP[scale.id];
          const isStatement = STATEMENT_SCALES.has(scale.id);
          const extraItems = q.extraItems || [];
          const shown = displayOptions(scale, q);

          return (
            <div key={construct.id} className="pb-8 border-b" style={{ borderColor: 'var(--rule)' }}>
              <div className="grid lg:grid-cols-3 gap-6 mb-4">
                <div className="lg:col-span-2">
                  <h3 className="text-xl mb-1" style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, color: 'var(--ink)' }}>
                    <span style={{ color: 'var(--accent)' }}>{numRange(numbers[construct.id])}.</span> {construct.name}
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
                  {shown ? shown.join(' · ') : scale.responseOptions.join(' · ')}
                </div>
              </div>

              <textarea
                value={text}
                onChange={e => setQuestionForConstruct(construct.id, e.target.value)}
                placeholder={isStatement ? 'Formulér dit udsagn her...' : 'Formulér dit spørgsmål her...'}
                aria-label={`Spørgsmål til ${construct.name}`}
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

              {isStatement && (
                <label className="mt-2 flex items-center gap-2 text-xs cursor-pointer" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink-soft)' }}>
                  <input type="checkbox" checked={!!q.reversed} onChange={e => patchQuestion(construct.id, { reversed: e.target.checked })} style={{ accentColor: 'var(--accent)' }} />
                  Negativt formuleret (enig er dårligt) — markeres i kodebogen
                </label>
              )}

              {customHelp && (
                <div className="mt-4">
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                    {customHelp.label}
                  </label>
                  <textarea
                    value={q.options || ''}
                    onChange={e => patchQuestion(construct.id, { options: e.target.value })}
                    placeholder={customHelp.placeholder}
                    rows={LIST_OPTION_SCALES.has(scale.id) ? 4 : 1}
                    className="w-full px-3 py-2 text-sm focus:outline-none"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', backgroundColor: 'transparent', border: '1px solid var(--rule)', color: 'var(--ink)', lineHeight: 1.5 }}
                  />
                </div>
              )}

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

              {isStatement && (
                <details className="mt-5 niveau2" open={extraItems.length > 0}>
                  <summary className="text-sm cursor-pointer flex items-center gap-3 flex-wrap" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink)' }}>
                    <span className="text-xs uppercase px-2 py-0.5" style={{ letterSpacing: '0.15em', fontWeight: 600, color: 'var(--paper)', backgroundColor: 'var(--ink)' }}>Niveau 2</span>
                    <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500 }}>Flere udsagn om samme emne (indeks)</span>
                    <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>valgfrit</span>
                  </summary>
                  <div className="mt-3 pl-4" style={{ borderLeft: '1px dashed var(--rule)' }}>
                    <p className="text-xs mb-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink-soft)', lineHeight: 1.55 }}>
                      Et emne kan måles med flere udsagn, som senere lægges sammen til et indeks. Bland gerne positive og negative udsagn — de negative skal så vendes (6 − svar), før de lægges sammen. Hvert udsagn bliver sit eget spørgsmål i skemaet og sin egen variabel i kodebogen.
                    </p>
                    {extraItems.map((it, k) => (
                      <div key={k} className="mb-3">
                        <div className="flex items-start gap-2">
                          <textarea
                            value={it.text}
                            onChange={e => setExtraItems(construct.id, extraItems.map((x, j) => j === k ? { ...x, text: e.target.value } : x))}
                            placeholder={`Udsagn ${k + 2}`}
                            aria-label={`Udsagn ${k + 2} til ${construct.name}`}
                            rows={1}
                            className="flex-1 px-3 py-2 text-sm focus:outline-none"
                            style={{ fontFamily: 'Fraunces, serif', backgroundColor: 'transparent', border: '1px solid var(--rule)', color: 'var(--ink)' }}
                          />
                          <button onClick={() => setExtraItems(construct.id, extraItems.filter((_, j) => j !== k))} className="text-xs px-2 py-2" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif' }}>Fjern</button>
                        </div>
                        <label className="mt-1 flex items-center gap-2 text-xs cursor-pointer" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink-soft)' }}>
                          <input type="checkbox" checked={!!it.reversed} onChange={e => setExtraItems(construct.id, extraItems.map((x, j) => j === k ? { ...x, reversed: e.target.checked } : x))} style={{ accentColor: 'var(--accent)' }} />
                          Negativt formuleret
                        </label>
                      </div>
                    ))}
                    <button onClick={() => setExtraItems(construct.id, [...extraItems, { text: '', reversed: false }])} className="text-xs px-3 py-1.5" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--accent)', border: '1px dashed var(--rule)' }}>
                      + Tilføj udsagn
                    </button>
                  </div>
                </details>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={async () => {
                    patchQuestion(construct.id, { loading: true });
                    const result = await evaluateWithAI(text, construct, scale, topic);
                    patchQuestion(construct.id, { evaluation: result, loading: false });
                  }}
                  disabled={!text || q.loading}
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
              <li><span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>Springlogik</span> — filterspørgsmålet står før de spørgsmål, det styrer, og de står samlet lige efter.</li>
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
          const srcIdx = c.filter ? constructs.findIndex(x => x.id === c.filter.sourceId) : -1;
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
                  {c.filter && srcIdx >= 0 && (
                    <span className="px-1.5 py-0.5" style={{ color: 'var(--ink)', fontWeight: 600, letterSpacing: '0.05em', border: '1px dashed var(--ink-soft)' }}>
                      KUN HVIS «{c.filter.answer}» TIL {String(srcIdx + 1).padStart(2, '0')}
                    </span>
                  )}
                </p>
                {c.filter && srcIdx > idx && (
                  <p className="text-xs mb-1" style={{ color: '#a14242', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    ⚠ Spørgsmålet, der styrer springlogikken, står efter dette spørgsmål. Flyt det op.
                  </p>
                )}
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

  const numbers = questionNumbers(constructs, scaleChoices, questions);
  const codebook = buildCodebook(constructs, scaleChoices, questions);
  // Ét element pr. spørgsmål i skemaet (et emne med indeks giver flere)
  const flatItems = constructs.flatMap(c => {
    const scale = SCALE_BY_ID[scaleChoices[c.id]?.scaleId];
    const q = questions[c.id] || {};
    const notes = routingNotes(c, constructs, numbers);
    return itemsOf(c, scaleChoices, questions).map((it, k) => ({
      c, scale, q, item: it, num: numbers[c.id][k], notes: k === 0 ? notes : [],
    }));
  });
  // Tekstlinjer for svarmulighederne - bruges i .txt-eksporten
  const optionLines = (scale, q) => {
    if (!scale) return [];
    const custom = (q.options || '').trim();
    if (scale.id === 'aaben') return ['_'.repeat(50), '_'.repeat(50)];
    if (scale.id === 'talsvar') return [`_______ ${custom}`.trim()];
    if (scale.id === 'semantisk') return [custom ? custom.replace('…', '— — — — — — —') : '[Specificér to modsatrettede ord med skala imellem, fx: Billig — — — — — — — Dyr]'];
    const opts = displayOptions(scale, q);
    const mark = scale.id === 'mc_multi' ? '[ ]' : '( )';
    const lines = opts ? opts.map(o => `${mark}  ${o}`) : [`[Tilføj konkrete svarmuligheder før udsendelse — ${(scale.responseOptions[0] || '').toLowerCase()}]`];
    if ((scale.id === 'numerisk' || scale.id === 'numerisk10') && custom) lines.push(`(${custom})`);
    return lines;
  };

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
      const notes = routingNotes(c, constructs, numbers);
      out += `${idx + 1}. ${c.name}${screeningTag} · ${ctype}\n`;
      out += `   Operationalisering: ${c.definition}\n`;
      out += `   Skala: ${scale?.label ?? '?'} (${scale?.measurement ?? '?'})\n`;
      if (notes.length) out += `   Rute: ${notes.join('; ')}\n`;
      if (justification) out += `   Begrundelse: ${justification}\n`;
      out += `\n`;
    });

    // === SEKTION 2: SPØRGESKEMA ===
    out += `\n${bar}\nSPØRGESKEMA — KLAR TIL PILOTTEST\n${bar}\n\n`;
    flatItems.forEach(({ scale, q, item, num, notes, c }) => {
      const screeningTag = c.isScreening && notes.length ? ' [SCREENING]' : '';
      out += `${num}.${screeningTag} ${item.text || '(ikke formuleret)'}\n`;
      if (notes.length) out += `   (${notes.join('; ')})\n`;
      out += `\n`;
      optionLines(scale, q).forEach(line => { out += `   ${line}\n`; });
      out += `\n${thin}\n\n`;
    });

    // === SEKTION 3: KODEBOG ===
    out += `\n${bar}\nKODEBOG\n${bar}\n\n`;
    out += codebook.map(r => r.join(' | ')).join('\n') + '\n';

    // === SEKTION 4: TJEKLISTE ===
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
          ${routingNotes(c, constructs, numbers).length ? `<p class="design-meta"><strong>Rute:</strong> ${escape(routingNotes(c, constructs, numbers).join('; '))}</p>` : ''}
          ${choice.justification ? `<p class="design-meta"><strong>Begrundelse:</strong> ${escape(choice.justification)}</p>` : ''}
        </div>
      `;
    }).join('');

    // Svarmuligheder - samme logik som optionLines i .txt-eksporten
    const renderOptionsHtml = (scale, q) => {
      if (!scale) return '';
      if (scale.id === 'aaben') {
        return `<div class="options">
          <div class="text-line"></div>
          <div class="text-line"></div>
          <div class="text-line"></div>
        </div>`;
      }
      const lines = optionLines(scale, q);
      const isChoice = displayOptions(scale, q);
      return `<div class="options">${lines.map(l => isChoice && /^(\(\)|\[ \])/.test(l)
        ? `<p class="opt-line"><span class="opt-mark">${scale.id === 'mc_multi' ? '&#9744;' : '&#9675;'}</span> ${escape(l.replace(/^(\(\)|\[ \])\s+/, ''))}</p>`
        : `<p class="opt-note">${escape(l)}</p>`).join('')}</div>`;
    };

    const questionsHtml = flatItems.map(({ c, scale, q, item, num, notes }) => {
      const screeningBadge = c.isScreening && notes.length
        ? ` <span class="screening-badge">SCREENING</span>`
        : '';
      return `
        <div class="question-block">
          <p class="question-text"><span class="q-num">${String(num).padStart(2, '0')}.</span> ${escape(item.text || '(ikke formuleret)')}${screeningBadge}</p>
          ${notes.length ? `<p class="route-note">(${escape(notes.join('; '))})</p>` : ''}
          ${renderOptionsHtml(scale, q)}
        </div>
      `;
    }).join('');

    const codebookHtml = `<table class="codebook"><thead><tr>${CODEBOOK_HEAD.map(h => `<th>${escape(h)}</th>`).join('')}</tr></thead>
      <tbody>${codebook.map(r => `<tr>${r.map((v, i) => `<td${i === 0 ? ' class="var"' : ''}>${escape(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

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
  /* h1-h3 bliver til Words indbyggede typografier Overskrift 1-3 */
  h1 { font-family: Georgia, serif; font-size: 24pt; font-weight: normal; color: #1a2332; margin: 0 0 4pt 0; }
  h2 { font-family: Georgia, serif; font-size: 16pt; font-weight: normal; color: #7a2e3d; margin: 24pt 0 10pt 0; page-break-after: avoid; }
  h3 { font-family: Calibri, Helvetica, sans-serif; font-size: 11.5pt; font-weight: bold; color: #1a2332; margin: 14pt 0 4pt 0; page-break-after: avoid; }
  .subtitle { color: #6b6557; font-style: italic; margin: 0; font-size: 10.5pt; }

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
  .route-note { font-family: Calibri, Helvetica, sans-serif; font-size: 9.5pt; color: #7a2e3d; font-style: italic; margin: 0 0 6pt 22pt; }
  .codebook { width: 100%; border-collapse: collapse; font-family: Calibri, Helvetica, sans-serif; font-size: 8.5pt; margin-top: 8pt; }
  .codebook th, .codebook td { border: 0.5pt solid #d6cfc1; padding: 3pt 5pt; text-align: left; vertical-align: top; }
  .codebook th { background: #efe9dc; text-transform: uppercase; letter-spacing: 0.08em; font-size: 7.5pt; }
  .codebook td.var { font-family: Consolas, monospace; color: #7a2e3d; white-space: nowrap; }

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

  <h2>Opsummering</h2>

  <div class="research-section">
    <div class="field">
      <h3>Formål</h3>
      <p class="context-line">${escape(topic.purpose)}</p>
    </div>
    <div class="field">
      <h3>Forskningsspørgsmål</h3>
      <p class="research-question">${escape(topic.research_question)}</p>
    </div>
    ${topic.target_group ? `<div class="field">
      <h3>Målgruppe</h3>
      <p class="context-line">${escape(topic.target_group)}</p>
    </div>` : ''}
  </div>

  <h3>Designgrundlag — emner og skalavalg</h3>
  ${designHtml}

  <div class="divider-strong"></div>

  <h2>Spørgeskema</h2>

  ${questionsHtml}

  <div class="divider-strong"></div>
  <h2>Kodebog</h2>
  <p class="subtitle">Samme kolonner som kodebogen på statistiksiden. Tilføj selv afledte variable, fx aldersgruppe.</p>
  ${codebookHtml}

  <div class="checklist">
    <h2>Tjekliste før udsendelse</h2>
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

  const downloadCodebook = () => {
    const csv = '\ufeff' + [CODEBOOK_HEAD, ...codebook].map(r => r.map(v => /[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v).join(';')).join('\r\n') + '\r\n';
    triggerDownload('kodebog.csv', csv, 'text/csv;charset=utf-8');
  };

  const renderQuestionnaireOptions = (scale, q) => {
    if (!scale) return null;
    const custom = (q.options || '').trim();

    // Åbent spørgsmål: linjer til fri tekst
    if (scale.id === 'aaben') {
      return (
        <div className="ml-10 mt-4 space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} style={{ borderBottom: '1px solid var(--rule)', height: '18px' }}></div>
          ))}
        </div>
      );
    }

    // Talsvar og semantisk differential: én linje
    if (scale.id === 'talsvar' || scale.id === 'semantisk') {
      return (
        <div className="ml-10 mt-4 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink-soft)' }}>
          {optionLines(scale, q)[0]}
        </div>
      );
    }

    const opts = displayOptions(scale, q);
    if (!opts) {
      return (
        <div className="ml-10 mt-4 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--accent)', fontStyle: 'italic' }}>
          Svarmulighederne mangler — tilføj dem i trin 4.
        </div>
      );
    }
    const isMulti = scale.id === 'mc_multi';

    return (
      <div className="ml-10 mt-4 space-y-2.5">
        {opts.map((opt, i) => (
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
        {(scale.id === 'numerisk' || scale.id === 'numerisk10') && custom && (
          <div className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink-soft)' }}>({custom})</div>
        )}
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
        <div className="lg:col-span-2 min-w-0">
          <div className="p-5 sm:p-8" style={{ backgroundColor: 'var(--paper-warm)' }}>

            {/* OPSUMMERING — TRIN 1-3 */}
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
                Opsummering
              </p>

              <div className="space-y-4 mb-7 pb-6" style={{ borderBottom: '1px solid var(--rule)' }}>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                    Formål
                  </p>
                  <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink)', lineHeight: 1.55 }}>
                    {topic.purpose}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--ink-soft)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500 }}>
                    Forskningsspørgsmål
                  </p>
                  <p className="text-base" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.55 }}>
                    {topic.research_question}
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
                      {routingNotes(c, constructs, numbers).length > 0 && (
                        <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Rute: </span>{routingNotes(c, constructs, numbers).join('; ')}
                        </p>
                      )}
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
                {flatItems.map(({ c, scale, q, item, num, notes }) => (
                  <div key={`${c.id}-${num}`}>
                    <div className="flex items-baseline gap-3 mb-1">
                      <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: '1.05rem', color: 'var(--accent)', minWidth: '2rem' }}>
                        {String(num).padStart(2, '0')}.
                      </span>
                      <div className="flex-1">
                        <p style={{ fontFamily: 'Fraunces, serif', color: 'var(--ink)', fontSize: '1.05rem', lineHeight: 1.5 }}>
                          {item.text || '(ikke formuleret)'}
                        </p>
                        {notes.length > 0 && (
                          <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--accent)', fontStyle: 'italic' }}>
                            ({notes.join('; ')})
                          </p>
                        )}
                        {c.isScreening && notes.length > 0 && (
                          <span className="inline-block text-xs px-1.5 py-0.5 uppercase mt-2" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600, letterSpacing: '0.05em', border: '1px solid var(--accent)' }}>
                            Screening
                          </span>
                        )}
                      </div>
                    </div>
                    {renderQuestionnaireOptions(scale, q)}
                  </div>
                ))}
              </div>
            </div>

            {/* KODEBOG */}
            <div className="pt-8 mt-10" style={{ borderTop: '2px solid var(--ink)' }}>
              <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--accent)', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
                Kodebog
              </p>
              <p className="text-sm mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink-soft)', lineHeight: 1.55 }}>
                Sådan bliver svarene til data. Kolonnerne er de samme som i kodebogen på statistiksiden.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table className="w-full text-xs" style={{ borderCollapse: 'collapse', fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink)' }}>
                  <thead>
                    <tr>{CODEBOOK_HEAD.map(h => (
                      <th key={h} className="text-left uppercase tracking-wider p-2" style={{ border: '1px solid var(--rule)', backgroundColor: 'var(--paper)', fontWeight: 600, color: 'var(--ink-soft)' }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {codebook.map((r, i) => (
                      <tr key={i}>{r.map((v, j) => (
                        <td key={j} className="p-2 align-top" style={{ border: '1px solid var(--rule)', fontFamily: j === 0 ? 'ui-monospace, Menlo, Consolas, monospace' : undefined, color: j === 0 ? 'var(--accent)' : j === 4 ? 'var(--ink-soft)' : 'var(--ink)', whiteSpace: j === 0 ? 'nowrap' : undefined }}>{v}</td>
                      ))}</tr>
                    ))}
                  </tbody>
                </table>
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

            <button
              onClick={downloadCodebook}
              className="w-full px-4 py-3 text-sm transition-all"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontWeight: 500,
                color: 'var(--ink)',
                backgroundColor: 'transparent',
                border: '1px solid var(--ink)',
              }}
            >
              Download kodebog (.csv)
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
// INTRODUKTION: FORMÅL, ANVENDELSE OG ANIMATION AF DE SEKS TRIN
// ============================================================================

// Animeret element: toner/glider ind efter `delay` sekunder (slås fra ved reduceret bevægelse)
function Anim({ delay = 0, kind = 'introFadeUp', className = '', style, children }) {
  return (
    <div className={`intro-anim ${className}`} style={{ animationName: kind, animationDelay: `${delay}s`, ...style }}>
      {children}
    </div>
  );
}

// Tekst, der "skrives" ord for ord
function Words({ text, start = 0, step = 0.07 }) {
  return text.split(' ').map((w, i) => (
    <span key={i} className="intro-anim" style={{ animationName: 'introFade', animationDelay: `${start + i * step}s`, display: 'inline-block', marginRight: '0.28em' }}>{w}</span>
  ));
}

const introFont = { fontFamily: 'IBM Plex Sans, sans-serif' };
const introSerif = { fontFamily: 'Fraunces, serif' };

function IntroChip({ label, type, accent }) {
  return (
    <div className="px-3 py-2" style={{ backgroundColor: 'var(--paper)', border: `1px solid ${accent ? 'var(--accent)' : 'var(--rule)'}`, borderLeft: `3px solid ${accent ? 'var(--accent)' : 'var(--ink)'}`, minWidth: '9.5rem' }}>
      <div className="text-sm" style={{ ...introSerif, fontWeight: 500, color: 'var(--ink)' }}>{label}</div>
      <div className="text-xs uppercase tracking-wider" style={{ ...introFont, color: 'var(--ink-soft)' }}>{type}</div>
    </div>
  );
}

// Trin 5: kortene bytter plads, så screening kommer først og demografi sidst
function IntroReorder() {
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [sorted, setSorted] = useState(reduce);
  useEffect(() => {
    if (reduce) return undefined;
    const t = setTimeout(() => setSorted(true), 1600);
    return () => clearTimeout(t);
  }, [reduce]);
  const items = [
    { id: 'region', label: 'I hvilken region bor du?', tag: 'demografi' },
    { id: 'hoert', label: 'Hvor hørte du om SonicWave?', tag: '' },
    { id: 'voksen', label: 'Er du fyldt 18 år?', tag: 'SCREENING' },
    { id: 'koebt', label: 'Har du købt i webshoppen?', tag: 'filter' },
  ];
  const order = sorted ? ['voksen', 'hoert', 'koebt', 'region'] : items.map(i => i.id);
  return (
    <div className="relative mx-auto" style={{ height: `${items.length * 52}px`, maxWidth: '26rem' }}>
      {items.map(it => {
        const pos = order.indexOf(it.id);
        return (
          <div key={it.id} className="intro-move absolute left-0 right-0 flex items-center gap-3 px-3"
            style={{ top: `${pos * 52}px`, height: '44px', transition: 'top 0.9s cubic-bezier(.2,.7,.2,1)', backgroundColor: 'var(--paper)', border: `1px solid ${it.tag === 'SCREENING' ? 'var(--accent)' : 'var(--rule)'}` }}>
            <span style={{ ...introSerif, color: 'var(--accent)', fontWeight: 500, minWidth: '1.6rem' }}>{String(pos + 1).padStart(2, '0')}</span>
            <span className="text-sm flex-1" style={{ ...introSerif, color: 'var(--ink)' }}>{it.label}</span>
            {it.tag && <span className="text-xs uppercase px-1.5" style={{ ...introFont, letterSpacing: '0.08em', color: it.tag === 'SCREENING' ? 'var(--accent)' : 'var(--ink-soft)', border: `1px solid ${it.tag === 'SCREENING' ? 'var(--accent)' : 'var(--rule)'}` }}>{it.tag}</span>}
          </div>
        );
      })}
    </div>
  );
}

const INTRO_SCENES = [
  {
    title: 'Forskningsemne',
    caption: 'Start med beslutningen, undersøgelsen skal hjælpe med. Den bliver til et forskningsspørgsmål, som data kan besvare.',
    render: () => (
      <div className="flex flex-col items-center gap-3 w-full" style={{ maxWidth: '30rem' }}>
        <Anim className="w-full p-4" style={{ backgroundColor: 'var(--paper)', borderLeft: '3px solid var(--accent)' }}>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ ...introFont, color: 'var(--accent)', fontWeight: 600 }}>Formål · beslutning</div>
          <div className="text-base" style={{ ...introSerif, color: 'var(--ink)' }}><Words text="Hvad skal SonicWave forbedre først i webshoppen?" start={0.3} /></div>
        </Anim>
        <Anim delay={1.6} kind="introFade" className="text-xl" style={{ color: 'var(--ink-soft)' }}>↓</Anim>
        <Anim delay={1.9} className="w-full p-4" style={{ backgroundColor: 'var(--paper)', borderLeft: '3px solid var(--ink)' }}>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ ...introFont, color: 'var(--ink-soft)', fontWeight: 600 }}>Forskningsspørgsmål</div>
          <div className="text-base" style={{ ...introSerif, color: 'var(--ink)', fontStyle: 'italic' }}><Words text="Er oplevelsen af webshoppen forskellig for nye og faste kunder?" start={2.1} /></div>
        </Anim>
      </div>
    ),
  },
  {
    title: 'Emner',
    caption: 'Del forskningsspørgsmålet op i emner — det, du skal måle. Hvert emne får en type: holdning, adfærd, intention, viden eller demografi.',
    render: () => (
      <div className="flex flex-col items-center gap-4 w-full">
        <Anim className="px-4 py-2 text-sm" style={{ ...introSerif, fontStyle: 'italic', color: 'var(--ink)', backgroundColor: 'var(--paper)', border: '1px solid var(--rule)' }}>
          Er oplevelsen af webshoppen forskellig for nye og faste kunder?
        </Anim>
        <div className="flex flex-wrap justify-center gap-3">
          <Anim delay={0.8} kind="introPop"><IntroChip label="Købt i webshoppen" type="adfærd" /></Anim>
          <Anim delay={1.2} kind="introPop"><IntroChip label="Kundetype" type="adfærd" /></Anim>
          <Anim delay={1.6} kind="introPop"><IntroChip label="Vurdering af webshoppen" type="holdning" /></Anim>
        </div>
        <Anim delay={2.4} kind="introFade" className="text-xs text-center" style={{ ...introFont, color: 'var(--ink-soft)', maxWidth: '26rem' }}>
          Operationalisering: Hvad betyder emnet helt konkret? Fx “ny kunde = første køb i webshoppen”.
        </Anim>
      </div>
    ),
  },
  {
    title: 'Skalavalg',
    caption: 'Vælg en svarskala til hvert emne. Skalaen bestemmer måleniveauet — hvilken slags data svarene bliver til.',
    render: () => (
      <div className="flex flex-wrap justify-center gap-4 w-full">
        {[
          ['Købt i webshoppen', 'adfærd', 'Ja / Nej', 'nominal'],
          ['Kundetype', 'adfærd', 'Multiple choice', 'nominal'],
          ['Vurdering af webshoppen', 'holdning', 'Numerisk 1–10', 'interval'],
        ].map(([label, type, scale, level], i) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <IntroChip label={label} type={type} />
            <Anim delay={0.5 + i * 0.5} kind="introSlideIn" className="text-xs px-2 py-1" style={{ ...introFont, color: 'var(--paper)', backgroundColor: 'var(--ink)' }}>{scale}</Anim>
            <Anim delay={1.9 + i * 0.3} kind="introPop" className="text-xs px-2 py-1" style={{ ...introFont, color: 'var(--accent)', border: '1px solid var(--accent)', fontWeight: 600 }}>Måleniveau: {level}</Anim>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Spørgsmål',
    caption: 'Formulér spørgsmålet og svarmulighederne. Automatiske advarsler og AI-feedback hjælper dig med at gøre det klart og uden ledende ord.',
    render: () => (
      <div className="w-full p-5" style={{ maxWidth: '30rem', backgroundColor: 'var(--paper)', border: '1px solid var(--rule)' }}>
        <div className="text-base mb-3" style={{ ...introSerif, color: 'var(--ink)' }}>
          <Words text="Var det første gang, du købte i SonicWaves webshop?" start={0.2} step={0.08} />
        </div>
        {['Ny kunde (første køb)', 'Fast kunde (har købt før)'].map((o, i) => (
          <Anim key={o} delay={1.5 + i * 0.25} kind="introSlideIn" className="flex items-center gap-2 text-sm mb-1.5" style={{ ...introFont, color: 'var(--ink)' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid var(--ink-soft)', display: 'inline-block' }} /> {o}
          </Anim>
        ))}
        <Anim delay={2.8} kind="introPop" className="mt-3 inline-flex items-center gap-2 text-xs px-2 py-1" style={{ ...introFont, backgroundColor: 'var(--paper-warm)' }}>
          <span style={{ color: 'var(--ink-soft)', letterSpacing: '0.1em', fontWeight: 600 }}>FORMULERING</span>
          <span style={{ color: 'var(--success)', fontWeight: 600 }}>GOD</span>
        </Anim>
      </div>
    ),
  },
  {
    title: 'Rækkefølge',
    caption: 'Læg spørgsmålene i en rækkefølge, der virker for respondenten: screening først, filter før de spørgsmål, det styrer, og demografi til sidst.',
    render: () => <div className="w-full"><IntroReorder /></div>,
  },
  {
    title: 'Færdigt udkast',
    caption: 'Du får et færdigt skema til pilottest og en kodebog, der viser, hvordan svarene bliver til data.',
    render: () => (
      <div className="flex flex-wrap justify-center items-start gap-5 w-full">
        <Anim className="p-4" style={{ width: '14rem', backgroundColor: 'var(--paper)', border: '1px solid var(--rule)', boxShadow: '0 2px 6px rgba(26,35,50,0.08)' }}>
          <div className="text-xs uppercase tracking-wider mb-2" style={{ ...introFont, color: 'var(--accent)', fontWeight: 600 }}>Spørgeskema</div>
          {['Er du fyldt 18 år?', 'Hvor hørte du om …?', 'Har du købt i …?', 'I hvilken region …?'].map((q, i) => (
            <Anim key={q} delay={0.4 + i * 0.25} kind="introSlideIn" className="text-xs mb-1.5" style={{ ...introSerif, color: 'var(--ink)' }}>
              <span style={{ color: 'var(--accent)' }}>{String(i + 1).padStart(2, '0')}.</span> {q}
            </Anim>
          ))}
        </Anim>
        <Anim delay={1.6} kind="introFade" className="self-center text-xl" style={{ color: 'var(--ink-soft)' }}>→</Anim>
        <Anim delay={1.8} className="p-4" style={{ width: '15rem', backgroundColor: 'var(--paper)', border: '1px solid var(--rule)' }}>
          <div className="text-xs uppercase tracking-wider mb-2" style={{ ...introFont, color: 'var(--accent)', fontWeight: 600 }}>Kodebog</div>
          {[['over_18', 'Nominal'], ['hørt_om', 'Nominal'], ['købt_webshop', 'Nominal'], ['region', 'Nominal']].map(([v, l], i) => (
            <Anim key={v} delay={2.1 + i * 0.2} kind="introFade" className="flex justify-between text-xs py-0.5" style={{ ...introFont, borderBottom: '1px solid var(--rule)' }}>
              <span style={{ fontFamily: 'ui-monospace, Menlo, Consolas, monospace', color: 'var(--accent)' }}>{v}</span>
              <span style={{ color: 'var(--ink-soft)' }}>{l}</span>
            </Anim>
          ))}
          <Anim delay={3.1} kind="introPop" className="mt-3 text-xs text-center px-2 py-1" style={{ ...introFont, color: 'var(--paper)', backgroundColor: 'var(--accent)', fontWeight: 600 }}>
            Klar til pilottest
          </Anim>
        </Anim>
      </div>
    ),
  },
];

const INTRO_SCENE_MS = 7500;

function StepsAnimation() {
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  useEffect(() => {
    if (!playing) return undefined;
    const t = setTimeout(() => setScene(s => (s + 1) % INTRO_SCENES.length), INTRO_SCENE_MS);
    return () => clearTimeout(t);
  }, [playing, scene]);
  const go = i => setScene((i + INTRO_SCENES.length) % INTRO_SCENES.length);
  const sc = INTRO_SCENES[scene];

  return (
    <div style={{ backgroundColor: 'var(--paper-warm)', border: '1px solid var(--rule)' }}>
      {/* Trinlinje: klik for at hoppe */}
      <div className="flex flex-wrap gap-1 p-3" style={{ borderBottom: '1px solid var(--rule)' }} role="tablist" aria-label="De seks trin">
        {INTRO_SCENES.map((s, i) => (
          <button key={s.title} role="tab" aria-selected={i === scene} onClick={() => go(i)}
            className="flex items-center gap-2 px-2 py-1 text-xs" style={{ ...introFont, color: i === scene ? 'var(--ink)' : 'var(--ink-soft)', fontWeight: i === scene ? 600 : 400 }}>
            <span className="flex items-center justify-center" style={{ width: 20, height: 20, borderRadius: '50%', ...introSerif, fontSize: '0.7rem',
              backgroundColor: i === scene ? 'var(--ink)' : i < scene ? 'var(--accent)' : 'transparent',
              color: i <= scene ? 'var(--paper)' : 'var(--ink-soft)', border: i <= scene ? 'none' : '1px solid var(--rule)' }}>{i + 1}</span>
            <span className="hidden sm:inline">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Scenen: key tvinger animationerne til at starte forfra */}
      <div key={scene} className="px-4 sm:px-8 pt-8 pb-4 flex flex-col items-center" aria-live="polite">
        <Anim kind="introFade" className="text-xs uppercase tracking-[0.2em] mb-1" style={{ ...introFont, color: 'var(--accent)', fontWeight: 600 }}>
          Trin {scene + 1} af 6
        </Anim>
        <Anim kind="introFade" className="mb-6 text-center" style={{ ...introSerif, fontSize: '1.6rem', fontWeight: 500, color: 'var(--ink)' }}>
          {sc.title}
        </Anim>
        <div className="w-full flex justify-center items-center" style={{ minHeight: '230px' }}>{sc.render()}</div>
        <p className="mt-6 text-sm text-center" style={{ ...introFont, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: '38rem' }}>{sc.caption}</p>
      </div>

      {/* Fremdrift og knapper */}
      <div style={{ height: 2, backgroundColor: 'var(--rule)' }}>
        {playing && <div key={`p${scene}`} className="intro-progress" style={{ height: 2, backgroundColor: 'var(--accent)', animation: `introProgress ${INTRO_SCENE_MS}ms linear both` }} />}
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <button onClick={() => go(scene - 1)} className="px-3 py-1.5 text-xs" style={{ ...introFont, color: 'var(--ink-soft)' }} aria-label="Forrige trin">← Forrige</button>
        <button onClick={() => setPlaying(!playing)} className="px-3 py-1.5 text-xs" style={{ ...introFont, color: 'var(--ink)', border: '1px solid var(--rule)' }}>
          {playing ? '❚❚ Pause' : '▶ Afspil'}
        </button>
        <button onClick={() => go(scene + 1)} className="px-3 py-1.5 text-xs" style={{ ...introFont, color: 'var(--ink-soft)' }} aria-label="Næste trin">Næste →</button>
      </div>
    </div>
  );
}

function IntroPage({ onStart, onLoadExample, onRestart, hasWork }) {
  const cards = [
    ['Formål', 'At lære at designe et spørgeskema, hvor hvert spørgsmål har en grund til at være der — og hvor svarene kan bruges til at træffe en beslutning.'],
    ['Til hvem', 'Studerende i markedsanalyse, der skal lave en kvantitativ undersøgelse som en del af metoden i sprint 3.'],
    ['Det får du', 'Et færdigt udkast til pilottest og en kodebog, der viser, hvordan svarene bliver til data. Det kan hentes som Word, PDF, tekst og CSV.'],
  ];
  const howTo = [
    ['Start med formålet.', 'Hvilken beslutning skal undersøgelsen hjælpe med? Resten udledes derfra.'],
    ['Brug feedbacken som sparring.', 'De automatiske advarsler og AI-feedbacken peger på svagheder — men det er dig, der beslutter.'],
    ['Kig på eksemplet.', 'Eksemplet, SonicWaves webshopundersøgelse, viser alle seks trin færdige. Det er det samme skema, som eksempeldataene på statistiksiden kommer fra.'],
    ['Niveau 2 er valgfrit.', 'Bokse mærket “Niveau 2” går et skridt videre (fx indeks af flere udsagn). Du skal ikke bruge dem.'],
    ['Dit arbejde gemmes.', 'Alt gemmes automatisk i browseren. Hent udkastet, når du er færdig, og pilottest det på 3–5 personer.'],
  ];
  return (
    <div>
      <header className="mb-10">
        <div className="text-xs uppercase tracking-[0.2em] mb-3" style={{ ...introFont, color: 'var(--accent)', fontWeight: 500 }}>Introduktion</div>
        <h1 className="mb-3" style={{ ...introSerif, fontSize: '2.25rem', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.15 }}>
          Et godt spørgeskema starter med en beslutning
        </h1>
        <p className="max-w-2xl" style={{ ...introFont, color: 'var(--ink-soft)', fontSize: '0.975rem', lineHeight: 1.6 }}>
          Spørgeskemadesigneren fører dig i seks trin fra et formål til et færdigt spørgeskema. Undervejs træffer du de valg,
          der afgør, om dine data senere kan svare på det, du vil vide: hvad du måler, hvordan du måler det, og hvordan
          du spørger.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-4 mb-12">
        {cards.map(([t, d]) => (
          <div key={t} className="p-5" style={{ backgroundColor: 'var(--paper-warm)', borderTop: '2px solid var(--accent)' }}>
            <h2 className="text-xs uppercase tracking-[0.18em] mb-2" style={{ ...introFont, color: 'var(--accent)', fontWeight: 600 }}>{t}</h2>
            <p className="text-sm" style={{ ...introFont, color: 'var(--ink)', lineHeight: 1.6 }}>{d}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-2" style={{ ...introSerif, fontSize: '1.5rem', fontWeight: 500, color: 'var(--ink)' }}>De seks trin</h2>
      <p className="text-sm mb-5 max-w-2xl" style={{ ...introFont, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
        Animationen følger eksemplet, SonicWaves webshopundersøgelse, gennem alle seks trin. Klik på et trin for at hoppe, eller sæt den på pause.
      </p>
      <StepsAnimation />

      <div className="grid lg:grid-cols-3 gap-10 mt-12">
        <div className="lg:col-span-2">
          <h2 className="mb-4" style={{ ...introSerif, fontSize: '1.5rem', fontWeight: 500, color: 'var(--ink)' }}>Sådan bruger du værktøjet</h2>
          <ol className="space-y-3">
            {howTo.map(([t, d], i) => (
              <li key={t} className="flex gap-4 text-sm" style={{ ...introFont, color: 'var(--ink)', lineHeight: 1.6 }}>
                <span style={{ ...introSerif, color: 'var(--accent)', fontWeight: 500, minWidth: '1.5rem' }}>{i + 1}.</span>
                <span><strong style={{ fontWeight: 600 }}>{t}</strong> {d}</span>
              </li>
            ))}
          </ol>
        </div>
        <aside className="p-6" style={{ backgroundColor: 'var(--paper-warm)', borderLeft: '2px solid var(--accent)' }}>
          <h3 className="text-xs uppercase tracking-[0.18em] mb-3" style={{ ...introFont, color: 'var(--accent)', fontWeight: 600 }}>Del af den kvantitative metode</h3>
          <p className="text-sm" style={{ ...introFont, color: 'var(--ink)', lineHeight: 1.6 }}>
            En markedsundersøgelse kræver metode — både kvalitativ og kvantitativ. Spørgeskemadesigneren og
            statistiksiden hører til den kvantitative del: Her designer du spørgeskemaet, og på statistiksiden arbejder du
            med de data, et spørgeskema giver. Kodebogen i trin 6 har samme form som kodebogen dér.
          </p>
        </aside>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-10 mt-10 border-t" style={{ borderColor: 'var(--rule)' }}>
        <button onClick={onStart} className="px-6 py-2.5 text-sm" style={{ ...introFont, fontWeight: 500, backgroundColor: 'var(--ink)', color: 'var(--paper)' }}>
          {hasWork ? 'Fortsæt dit skema →' : 'Start dit eget skema →'}
        </button>
        <button onClick={onLoadExample} className="px-5 py-2.5 text-sm" style={{ ...introFont, fontWeight: 500, color: 'var(--ink)', border: '1px solid var(--ink)' }}>
          Se eksemplet
        </button>
        {hasWork && (
          <button onClick={onRestart} className="px-5 py-2.5 text-sm" style={{ ...introFont, color: 'var(--ink-soft)' }}>
            Start forfra med et tomt skema
          </button>
        )}
      </div>
    </div>
  );
}

// Logoet: clipboard med to afkrydsningsfelter og en fritekstlinje (samme tegning som favicon.svg)
function ClipboardMark({ size = 96 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="11.5" y="8" width="41" height="52.5" rx="4.5" fill="#fbf8f1" stroke="var(--ink)" strokeWidth="2.6" />
      <rect x="23.5" y="3.5" width="17" height="9" rx="3.5" fill="var(--paper-warm)" stroke="var(--ink)" strokeWidth="2.6" />
      <rect x="18.5" y="20.5" width="9.5" height="9.5" rx="1.2" stroke="var(--accent)" strokeWidth="2.3" />
      <path d="M20.8 25.4l2.2 2.2 3.6-4.7" stroke="var(--accent)" strokeWidth="2.3" />
      <path d="M33 25.2h13" stroke="var(--ink)" strokeWidth="2.6" />
      <rect x="18.5" y="35.5" width="9.5" height="9.5" rx="1.2" stroke="var(--ink)" strokeWidth="2.3" />
      <path d="M33 40.2h13" stroke="var(--ink)" strokeWidth="2.6" />
      <path d="M18.5 53h27.5" stroke="var(--ink)" strokeWidth="2.6" opacity=".45" />
    </svg>
  );
}

// ============================================================================
// EKSEMPEL: SONICWAVES WEBSHOPUNDERSØGELSE (sidste år)
// Samme spørgsmål, rækkefølge, skalatyper og koder som eksempelkodebogen på
// statistiksiden (arma-dania/tests). Ændres det ene, skal det andet følge med.
// Eksemplet bruger bevidst andre spørgsmål end holdets SonicWave-skema, så det
// viser metoden uden at løse de studerendes opgaver.
// ============================================================================

function webshopExample() {
  const C = { voksen: 1, hoert: 2, lyt: 3, koebt: 4, kunde: 5, minutter: 6, vurdering: 7, oplevelse: 8, forbrug: 9, region: 10 };
  const filter = { sourceId: C.koebt, answer: 'Ja' };
  const constructs = [
    { id: C.voksen, name: 'Voksen (18+)', type: 'demografi', varName: 'over_18', isScreening: true, screeningRule: 'svarer Nej',
      definition: 'Om respondenten er 18 år eller ældre. Afgør, om personen er i målgruppen.' },
    { id: C.hoert, name: 'Hørt om SonicWave', type: 'adfaerd', varName: 'hørt_om', isScreening: false,
      definition: 'Hvor respondenten første gang hørte om SonicWave. Viser, hvilke kanaler der skaber kendskab.' },
    { id: C.lyt, name: 'Lyttevaner', type: 'adfaerd', varName: 'lyttefrekvens', isScreening: false,
      definition: 'Hvor mange gange respondenten har lyttet til musik på en højttaler den seneste uge.' },
    { id: C.koebt, name: 'Købt i webshoppen', type: 'adfaerd', varName: 'købt_webshop', isScreening: false,
      definition: 'Om respondenten har købt i SonicWaves webshop det seneste år. Afgør, hvem der får spørgsmålene om webshoppen.' },
    { id: C.kunde, name: 'Kundetype', type: 'adfaerd', varName: 'kundetype', isScreening: false, filter,
      definition: 'Om kunden handlede i webshoppen for første gang (ny) eller har købt før (fast).' },
    { id: C.minutter, name: 'Tid i webshoppen', type: 'adfaerd', varName: 'minutter', isScreening: false, filter,
      definition: 'Antal minutter, kunden brugte i webshoppen ved sit seneste køb.' },
    { id: C.vurdering, name: 'Vurdering af webshoppen', type: 'holdning', varName: 'vurdering', isScreening: false, filter,
      definition: 'Kundens samlede vurdering af webshoppen.' },
    { id: C.oplevelse, name: 'Oplevelse af webshoppen', type: 'holdning', varName: 'oplevelse', isScreening: false, filter,
      definition: 'Kundens oplevelse af at finde varer, leveringen og overskueligheden i webshoppen.' },
    { id: C.forbrug, name: 'Forbrug på elektronik', type: 'adfaerd', varName: 'forbrug_elektronik', isScreening: false,
      definition: 'Det samlede beløb i kroner, respondenten har brugt på elektronik det seneste år.' },
    { id: C.region, name: 'Region', type: 'demografi', varName: 'region', isScreening: false,
      definition: 'Den region, respondenten bor i. Bruges til at beskrive stikprøven.' },
  ];
  const scale = (scaleId, justification) => ({ scaleId, justification });
  const scaleChoices = {
    [C.voksen]: scale('mc_single', 'Ja/nej-spørgsmål, der frasorterer personer under 18 år.'),
    [C.hoert]: scale('mc_single', 'Respondenten vælger én kanal. Kanalerne har ingen rækkefølge - nominale data.'),
    [C.lyt]: scale('frekvens_konkret', 'Konkrete antal gange inden for en bestemt periode er lettere at svare præcist på end “ofte” og “sjældent”. Intervallerne har en rækkefølge - ordinale data.'),
    [C.koebt]: scale('mc_single', 'Ja/nej-spørgsmål, der styrer springlogikken.'),
    [C.kunde]: scale('mc_single', 'To kategorier uden rækkefølge, så der skal kun vælges ét svar.'),
    [C.minutter]: scale('talsvar', 'Et præcist antal minutter har et naturligt nulpunkt - ratiodata.'),
    [C.vurdering]: scale('numerisk10', 'Ti trin giver nok nuancer til at fange forskelle i vurderingen.'),
    [C.oplevelse]: scale('likert5', 'Påstande om oplevelsen måles bedst som grad af enighed.'),
    [C.forbrug]: scale('talsvar', 'Et beløb i kroner er et præcist tal med et naturligt nulpunkt - ratiodata.'),
    [C.region]: scale('mc_single', 'Nominal baggrundsvariabel med fem regioner.'),
  };
  const questions = {
    [C.voksen]: { text: 'Er du fyldt 18 år?', options: 'Ja\nNej' },
    [C.hoert]: { text: 'Hvor hørte du første gang om SonicWave?', options: 'Venner og familie\nSociale medier\nSøgemaskine\nInfluencer' },
    [C.lyt]: { text: 'Hvor mange gange har du lyttet til musik på en højttaler den seneste uge?' },
    [C.koebt]: { text: 'Har du købt noget i SonicWaves webshop inden for det seneste år?', options: 'Ja\nNej' },
    [C.kunde]: { text: 'Var det første gang, du købte i SonicWaves webshop?', options: 'Ny kunde (første køb)\nFast kunde (har købt før)' },
    [C.minutter]: { text: 'Hvor mange minutter brugte du i webshoppen ved dit seneste køb?', options: 'Minutter' },
    [C.vurdering]: { text: 'Hvordan vurderer du SonicWaves webshop alt i alt? (1–10)', options: '1 = Meget dårlig … 10 = Meget god' },
    [C.oplevelse]: { text: 'Det var nemt at finde det, jeg søgte', varName: 'q1_nemt_at_finde', extraItems: [
      { text: 'Leveringen var hurtig', varName: 'q2_hurtig_levering' },
      { text: 'Webshoppen er forvirrende', reversed: true, varName: 'q3_forvirrende' },
    ] },
    [C.forbrug]: { text: 'Hvor meget har du i alt brugt på elektronik det seneste år? (kr.)', options: 'Kroner' },
    [C.region]: { text: 'I hvilken region bor du?', options: 'Hovedstaden\nSjælland\nSyddanmark\nMidtjylland\nNordjylland' },
  };
  return {
    topic: {
      purpose: 'SonicWave vil forbedre sin webshop og bruge markedsføringsbudgettet bedre. Undersøgelsen skal give grundlag for at beslutte, hvor annoncerne skal ligge, og hvad der skal forbedres først i webshoppen.',
      // Forskningsspørgsmålet er den del af formålet, spørgeskemaet kan besvare
      research_question: 'Hvor hører danskere på 18 år og derover om SonicWave, og hænger det sammen med, hvor ofte de lytter til musik? Hvordan oplever kunderne webshoppen, og er oplevelsen forskellig for nye og faste kunder?',
      target_group: 'Danskere på 18 år og derover',
    },
    constructs, scaleChoices, questions,
  };
}

// ============================================================================
// HOVEDKOMPONENT
// ============================================================================

const STORAGE_KEY = 'spoergeskemadesigner:v2';
const emptyConstruct = () => ({ id: Date.now(), name: '', type: 'holdning', definition: '', isScreening: false });

// Gemt arbejde fra browseren (uden midlertidige felter som "loading")
function loadSaved() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d && d.topic && Array.isArray(d.constructs) ? d : null;
  } catch (e) { return null; }
}
const stripLoading = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v && typeof v === 'object' ? { ...v, loading: false } : v]));

export default function App() {
  const [saved] = useState(loadSaved);
  const [currentStep, setCurrentStep] = useState(saved?.currentStep ?? 0);
  const [topic, setTopic] = useState(saved?.topic ?? { research_question: '', purpose: '', target_group: '' });
  const [constructs, setConstructs] = useState(saved?.constructs?.map(c => ({ ...c, loading: false })) ?? [emptyConstruct()]);
  const [scaleChoices, setScaleChoices] = useState(saved ? stripLoading(saved.scaleChoices || {}) : {});
  const [questions, setQuestions] = useState(saved ? stripLoading(saved.questions || {}) : {});
  const [completedSteps, setCompletedSteps] = useState(new Set(saved?.completedSteps ?? []));
  const [showIntro, setShowIntro] = useState(!saved);

  // Inject Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  // Autogem: arbejdet overlever genindlæsning i samme browser
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentStep, topic, constructs, scaleChoices, questions, completedSteps: [...completedSteps],
      }));
    } catch (e) { /* fx privat vindue - siden virker stadig, men gemmer ikke */ }
  }, [currentStep, topic, constructs, scaleChoices, questions, completedSteps]);

  // Det første trin, der mangler noget. Man kan aldrig hoppe forbi det
  // (fx når et nyt emne uden skala er tilføjet, efter at trin 3 var færdigt).
  const firstIncompleteStep = () => {
    if (topic.research_question.trim().length <= 15 || topic.purpose.trim().length <= 15) return 0;
    if (!constructs.length || !constructs.every(c => c.name.trim().length > 2 && c.definition.trim().length > 10)) return 1;
    if (!constructs.every(c => scaleChoices[c.id]?.scaleId)) return 2;
    if (!constructs.every(c => questions[c.id]?.text?.trim().length > 5)) return 3;
    return 5;
  };
  const reachable = Math.min(firstIncompleteStep(), 5);
  const safeStep = Math.min(currentStep, reachable);
  // Gennemførte trin, man kan hoppe til. Er alt udfyldt (reachable === 5), kan man også
  // vende tilbage til det færdige udkast, når man først har været forbi trin 5.
  const effectiveCompleted = new Set([...completedSteps].filter(st => st < reachable || reachable === 5));
  if (reachable === 5 && completedSteps.has(4)) effectiveCompleted.add(5);

  const goNext = () => {
    setCompletedSteps(new Set([...completedSteps, safeStep]));
    setCurrentStep(Math.min(safeStep + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goBack = () => {
    setCurrentStep(Math.max(safeStep - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goTo = (step) => {
    setCurrentStep(Math.min(step, reachable));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const hasWork = Boolean(topic.purpose.trim() || topic.research_question.trim() || constructs.some(c => c.name.trim()));
  // Bekræftelse vises på selve siden (window.confirm kan være blokeret, fx i et Claude-artifact)
  const [pendingConfirm, setPendingConfirm] = useState(null);
  const askConfirm = (message, confirmLabel, action) => {
    setPendingConfirm({ message, confirmLabel, action });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const doRestart = () => {
    setCurrentStep(0);
    setTopic({ research_question: '', purpose: '', target_group: '' });
    setConstructs([emptyConstruct()]);
    setScaleChoices({});
    setQuestions({});
    setCompletedSteps(new Set());
    setShowIntro(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const restart = () => {
    if (!hasWork) { doRestart(); return; }
    askConfirm('Vil du starte forfra med et tomt skema? Alt, der står i skemaet nu, bliver slettet.', 'Ja, slet og start forfra', doRestart);
  };
  const openIntro = () => { setShowIntro(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const startFromIntro = () => { setShowIntro(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const loadExample = () => {
    if (hasWork) askConfirm('Eksemplet erstatter det, der står i skemaet nu.', 'Ja, indlæs eksemplet', doLoadExample);
    else doLoadExample();
  };
  const doLoadExample = () => {
    const ex = webshopExample();
    setTopic(ex.topic);
    setConstructs(ex.constructs);
    setScaleChoices(ex.scaleChoices);
    setQuestions(ex.questions);
    setCompletedSteps(new Set([0, 1, 2, 3, 4, 5]));
    setCurrentStep(5);
    setShowIntro(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        @keyframes introFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes introFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes introPop { 0% { opacity: 0; transform: scale(0.85); } 70% { opacity: 1; transform: scale(1.04); } 100% { opacity: 1; transform: none; } }
        @keyframes introSlideIn { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: none; } }
        @keyframes introProgress { from { width: 0; } to { width: 100%; } }
        .intro-anim { animation-duration: 0.6s; animation-fill-mode: both; animation-timing-function: cubic-bezier(.2,.7,.2,1); }
        @media (prefers-reduced-motion: reduce) {
          .intro-anim { animation: none !important; }
          .intro-move { transition: none !important; }
          .intro-progress { display: none; }
        }
        details summary { list-style: none; }
        details.niveau2 > summary::after { content: '▸'; color: var(--ink-soft); margin-left: auto; }
        details.niveau2[open] > summary::after { content: '▾'; }
        button:focus-visible, summary:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        details summary::-webkit-details-marker { display: none; }
        details[open] summary { margin-bottom: 0.5rem; }
        details .summary-open-text { display: none; }
        details[open] .summary-closed-text { display: none; }
        details[open] .summary-open-text { display: inline; }
      `}</style>

      <header className="border-b" style={{ borderColor: 'var(--rule)', backgroundColor: 'var(--paper-warm)' }}>
        <div className="max-w-6xl mx-auto px-8 py-8 flex items-center justify-between gap-6">
          <div>
          <p className="text-xs uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Spørgeskemadesigner · markedsanalyse
          </p>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.015em', lineHeight: 1.1 }}>
            Fra emne til <span style={{ fontStyle: 'italic' }}>spørgsmål</span>
          </h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--ink-soft)', lineHeight: 1.55 }}>
            En struktureret guide i seks trin fra formål til færdigt spørgeskema og kodebog.
          </p>
          <button
            onClick={showIntro ? startFromIntro : openIntro}
            className="mt-4 px-3 py-1.5 text-xs"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500, color: 'var(--ink)', border: '1px solid var(--rule)', backgroundColor: 'var(--paper)' }}
          >
            {showIntro ? 'Gå til værktøjet →' : 'Om værktøjet og de seks trin'}
          </button>
          {hasWork && (
            <button
              onClick={restart}
              className="mt-4 ml-2 px-3 py-1.5 text-xs"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500, color: 'var(--ink-soft)', border: '1px solid var(--rule)', backgroundColor: 'transparent' }}
            >
              Start forfra
            </button>
          )}
          </div>
          <div className="hidden sm:block"><ClipboardMark size={104} /></div>
        </div>
      </header>

      {pendingConfirm && (
        <div role="alertdialog" aria-live="assertive" className="border-b" style={{ borderColor: 'var(--rule)', backgroundColor: '#f6e9e6' }}>
          <div className="max-w-6xl mx-auto px-8 py-4 flex flex-wrap items-center gap-3">
            <p className="text-sm flex-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink)', minWidth: '14rem' }}>{pendingConfirm.message}</p>
            <button
              onClick={() => { const a = pendingConfirm.action; setPendingConfirm(null); a(); }}
              className="px-4 py-2 text-sm"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 500, color: 'var(--paper)', backgroundColor: 'var(--accent)' }}
            >
              {pendingConfirm.confirmLabel}
            </button>
            <button
              onClick={() => setPendingConfirm(null)}
              className="px-4 py-2 text-sm"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: 'var(--ink)', border: '1px solid var(--rule)' }}
            >
              Fortryd
            </button>
          </div>
        </div>
      )}

      {!showIntro && <StepIndicator currentStep={safeStep} onJump={goTo} completedSteps={effectiveCompleted} />}

      <main className="max-w-6xl mx-auto px-8 py-12">
        {showIntro && <IntroPage onStart={startFromIntro} onLoadExample={loadExample} onRestart={restart} hasWork={hasWork} />}
        {!showIntro && safeStep === 0 && <TopicStep topic={topic} setTopic={setTopic} onNext={goNext} onLoadExample={loadExample} />}
        {!showIntro && safeStep === 1 && <ConstructsStep topic={topic} constructs={constructs} setConstructs={setConstructs} onBack={goBack} onNext={goNext} />}
        {!showIntro && safeStep === 2 && <ScalesStep topic={topic} constructs={constructs} scaleChoices={scaleChoices} setScaleChoices={setScaleChoices} onBack={goBack} onNext={goNext} />}
        {!showIntro && safeStep === 3 && <QuestionsStep topic={topic} constructs={constructs} scaleChoices={scaleChoices} questions={questions} setQuestions={setQuestions} onBack={goBack} onNext={goNext} />}
        {!showIntro && safeStep === 4 && <OrderStep topic={topic} constructs={constructs} setConstructs={setConstructs} scaleChoices={scaleChoices} questions={questions} onBack={goBack} onNext={goNext} />}
        {!showIntro && safeStep === 5 && <FinalStep topic={topic} constructs={constructs} scaleChoices={scaleChoices} questions={questions} onBack={goBack} onRestart={restart} />}
      </main>

      <footer className="max-w-6xl mx-auto px-8 py-8 mt-12 text-xs" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--rule)' }}>
        Værktøj til markedsanalyse · Dit arbejde gemmes automatisk i denne browser · Husk: spørgeskemaer skal altid pilottestes
      </footer>
    </div>
  );
}
