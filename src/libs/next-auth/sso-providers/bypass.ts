import Credential from 'next-auth/providers/credentials';

import { getServerDBConfig } from '@/config/db';
import { UserModel } from '@/database/models/user';
import { serverDB } from '@/database/server';
import { AgentService } from '@/server/services/agent';

export const bypass = Credential({
  async authorize() {
    const { NEXT_PUBLIC_ENABLED_SERVER_SERVICE } = getServerDBConfig();

    // Ensure the user exists, since credentials provider won't trigger the db adapter.
    if (NEXT_PUBLIC_ENABLED_SERVER_SERVICE && process.env.NEXT_RUNTIME === 'nodejs') {
      const id = 'bYpaSsusER';
      const email = 'bypass@lobehub.com';
      const avatar = '/icons/icon-192x192.png';
      const fullName = 'Bypass User';

      const existingUser = await UserModel.findById(serverDB, id);

      if (!existingUser) {
        await UserModel.createUser(serverDB, {
          avatar,
          email,
          emailVerifiedAt: new Date(),
          fullName,
          id,
        });

        const agentService = new AgentService(serverDB, id);
        await agentService.createInbox();
      }
      return { email, id, image: avatar, name: fullName };
    } else {
      throw new Error(
        'Bypass authentication is only available in server mode with Node.js runtime',
      );
    }
  },
  id: 'bypass',
  name: 'Development Bypass',
});
