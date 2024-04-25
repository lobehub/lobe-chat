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

// due to Gemini-1.5-pro is not available in Hong Kong and Ireland, we need to set the preferred region to exclude "Hong Kong" or "Ireland".
// refs: https://github.com/lobehub/lobe-chat/pull/2149
export const preferredRegion = ['cle1', 'iad1', 'pdx1', 'sfo1'];

export const POST = async (req: Request) => UniverseRoute(req, { params: { provider: 'google' } });
