import { POST as UniverseRoute } from '../[provider]/route';

export const runtime = 'nodejs';

export const POST = async (req: Request) => UniverseRoute(req, { params: { provider: 'minimax' } });
