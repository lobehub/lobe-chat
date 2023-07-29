import { OpenAIPluginPayload } from '@/types/plugin';

import { PluginsMap } from '../../plugins';

export const runtime = 'edge';

export default async function handler(req: Request) {
  const { name, arguments: args } = (await req.json()) as OpenAIPluginPayload;

  console.log(`检测到 functionCall: ${name}`);

  const func = PluginsMap[name];

  if (func) {
    const data = JSON.parse(args);
    const result = await func.runner(data);

    console.log(`[${name}]`, args, `result:`, JSON.stringify(result, null, 2));

    return new Response(JSON.stringify(result));
  }
}
