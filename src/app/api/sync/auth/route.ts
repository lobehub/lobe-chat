import { Liveblocks } from '@liveblocks/node';

import { getAppConfig } from '@/config/app';
import { hashRoomName } from '@/libs/sync/liveblocks/utils';

import { checkAuth } from '../../middleware/auth';

const { LIVEBLOCKS_SECRET_KEY } = getAppConfig();

const liveblocks = new Liveblocks({
  secret: LIVEBLOCKS_SECRET_KEY || '',
});

export const POST = checkAuth(async (req: Request) => {
  if (!LIVEBLOCKS_SECRET_KEY) {
    return new Response('Liveblocks secret key is not set', { status: 500 });
  }

  const { name, password }: { name: string; password?: string } = await req.json();

  const hashedRoomName = hashRoomName(name, password);

  const session = liveblocks.prepareSession(hashedRoomName);

  session.allow(hashedRoomName, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new Response(body, { status });
});
