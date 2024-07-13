import { openAiPreferredRegion } from '@/app/api/openai/config';

import { POST as UniverseRoute } from '../[provider]/route';

export const runtime = 'edge';

export const preferredRegion = openAiPreferredRegion();

export const POST = async (req: Request) => UniverseRoute(req, { params: { provider: 'openai' } });
