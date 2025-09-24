import { POST as UniverseRoute } from '../[provider]/route';

export const runtime = 'edge';

export const POST = async (req: Request) =>
  UniverseRoute(req, { params: Promise.resolve({ provider: 'azureai' }) });
