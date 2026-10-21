import { getServerDB } from '@/database/server';
import { createCanvasStorageService } from '@/server/services/canvas';
import { resolveCanvasRuntimeUrl } from '@/server/services/canvas/runtimeUrl';
import { serveCanvasFile } from '@/server/services/canvas/serve';

type Params = Promise<{ path?: string[]; token: string }>;

export const GET = async (_req: Request, segmentData: { params: Params }) => {
  const { path, token } = await segmentData.params;
  const db = await getServerDB();

  try {
    return await serveCanvasFile({
      createStorage: (payload) =>
        createCanvasStorageService(db, payload.userId, payload.workspaceId),
      path: path?.join('/') ?? '',
      runtimeUrl: resolveCanvasRuntimeUrl(),
      token,
    });
  } catch (error) {
    console.error('Canvas preview error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
