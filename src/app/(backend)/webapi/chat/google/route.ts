import { POST as UniverseRoute } from '../[provider]/route';

// due to the Chinese region does not support accessing Google
// we need to use proxy to access it
// refs: https://github.com/google/generative-ai-js/issues/29#issuecomment-1866246513
// if (process.env.HTTP_PROXY_URL) {
//   const { setGlobalDispatcher, ProxyAgent } = require('undici');
//
//   setGlobalDispatcher(new ProxyAgent({ uri: process.env.HTTP_PROXY_URL }));
// }

// but undici only can be used in NodeJS
// so if you want to use with proxy, you need comment the code below
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

export const POST = async (req: Request) => UniverseRoute(req, { params: { provider: 'google' } });
