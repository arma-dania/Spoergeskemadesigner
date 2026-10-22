// Netlify Function: sender spørgeskemadesignerens feedback-prompts videre til Claude.
// API-nøglen (ANTHROPIC_API_KEY) ligger kun i Netlifys miljøvariabler - aldrig i browseren.
import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.AI_MODEL || 'claude-opus-5-5';
const EFFORT = ['low', 'medium', 'high'].includes(process.env.AI_EFFORT) ? process.env.AI_EFFORT : 'low'; // kort JSON-feedback: lav effort = hurtigt svar
const MAX_PROMPT_CHARS = 30000;
// Kun sidens egne prompts accepteres, så funktionen ikke kan bruges som gratis, åben chatbot
const PROMPT_PREFIX = 'Du er en erfaren underviser i markedsanalyse';
// Modeller, der understøtter server-side fallback ved afvisning (fallbacks: "default")
const FALLBACK_MODELS = new Set(['claude-opus-5-5', 'claude-opus-5', 'claude-sonnet-5-5', 'claude-fable-5-1']);

const client = new Anthropic(); // læser ANTHROPIC_API_KEY

const json = (status, body) => Response.json(body, { status });

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Brug POST.' });
  if (!process.env.ANTHROPIC_API_KEY) return json(500, { error: 'ANTHROPIC_API_KEY er ikke sat i Netlify.' });

  let prompt;
  try {
    ({ prompt } = await req.json());
  } catch (e) {
    return json(400, { error: 'Ugyldig forespørgsel.' });
  }
  if (typeof prompt !== 'string' || !prompt.startsWith(PROMPT_PREFIX) || prompt.length > MAX_PROMPT_CHARS) {
    return json(400, { error: 'Ugyldig forespørgsel.' });
  }

  const useFallback = FALLBACK_MODELS.has(MODEL);
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: EFFORT },
      messages: [{ role: 'user', content: prompt }],
      ...(useFallback ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {}),
    });
    if (response.stop_reason === 'refusal') {
      return json(422, { error: 'AI’en kunne ikke vurdere teksten. Prøv at omformulere.' });
    }
    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
    return json(200, { text });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json(429, { error: 'For mange forespørgsler lige nu. Prøv igen om lidt.' });
    if (e instanceof Anthropic.AuthenticationError) return json(500, { error: 'API-nøglen blev afvist. Tjek ANTHROPIC_API_KEY i Netlify.' });
    if (e instanceof Anthropic.APIError) return json(502, { error: `Claude svarede med fejl ${e.status ?? ''}`.trim() });
    return json(502, { error: 'Kunne ikke kontakte Claude.' });
  }
};

export const config = { path: '/api/claude' };
