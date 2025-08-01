import { POST as UniverseRoute } from '../[provider]/route';

// Explicitly set Node.js runtime for AWS profile support
export const runtime = 'nodejs';

export const POST = async (req: Request) =>
  UniverseRoute(req, { params: Promise.resolve({ provider: 'bedrock' }) });
