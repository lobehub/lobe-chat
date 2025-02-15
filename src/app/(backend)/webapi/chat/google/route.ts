import { POST as UniverseRoute } from '../[provider]/route';

export const runtime = 'edge';

// due to Gemini-1.5-pro is not available in Hong Kong, we need to set the preferred region to exclude "Hong Kong (hkg1)".
// the paid service of the Gemini API is required in the following regions until 8 July 2024. The free service is not available. Therefore, the regions is temporarily disabled.
// regions include Dublin (dub1, Ireland), Paris (cdg1, France), Frankfurt (fra1, Germany), London (lhr1, UK), and Stockholm (arn1, Sweden).
// refs: https://ai.google.dev/gemini-api/docs/available-regions
export const preferredRegion = [
  'icn1',
  'sin1',
  'hnd1',
  'kix1',
  'bom1',
  'cpt1',
  'pdx1',
  'cle1',
  'syd1',
  'iad1',
  'sfo1',
  'gru1',
];

export const POST = async (req: Request) =>
  UniverseRoute(req, { params: Promise.resolve({ provider: 'google' }) });
