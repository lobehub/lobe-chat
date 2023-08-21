export const runtime = 'edge';

// chat plugin gateway
// refs to: https://github.com/lobehub/chat-plugins-gateway
const PLUGIN_GATEWAY_URL = process.env.PLUGIN_GATEWAY_URL || 'https://chat-plugins.lobehub.com';

export default async function handler(req: Request) {
  const payload = await req.text();
  return fetch(`${PLUGIN_GATEWAY_URL}/api/v1/runner`, { body: payload, method: 'POST' });
}
