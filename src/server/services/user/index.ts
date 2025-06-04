import { UserJSON } from '@clerk/backend';

import { UserModel } from '@/database/models/user';
import { serverDB } from '@/database/server';
import { pino } from '@/libs/logger';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';
import { S3 } from '@/server/modules/S3';
import { AgentService } from '@/server/services/agent';

export class UserService {
  createUser = async (id: string, params: UserJSON) => {
    // Check if user already exists
    const res = await UserModel.findById(serverDB, id);

    // If user already exists, skip creating a new user
    if (res)
      return {
        message: 'user not created due to user already existing in the database',
        success: false,
      };

    const email = params.email_addresses.find((e) => e.id === params.primary_email_address_id);

    const phone = params.phone_numbers.find((e, index) => {
      if (!!params.primary_phone_number_id) return e.id === params.primary_phone_number_id;

      return index === 0;
    });

    /* ↓ cloud slot ↓ */

    /* ↑ cloud slot ↑ */

    // 2. create user in database
    await UserModel.createUser(serverDB, {
      avatar: params.image_url,
      clerkCreatedAt: new Date(params.created_at),
      email: email?.email_address,
      firstName: params.first_name,
      id,
      lastName: params.last_name,
      phone: phone?.phone_number,
      username: params.username,
    });

    // 3. Create an inbox session for the user
    const agentService = new AgentService(serverDB, id);
    await agentService.createInbox();

    /* ↓ cloud slot ↓ */

    /* ↑ cloud slot ↑ */

    return { message: 'user created', success: true };
  };

  deleteUser = async (id: string) => {
    await UserModel.deleteUser(serverDB, id);
  };

  updateUser = async (id: string, params: UserJSON) => {
    const userModel = new UserModel(serverDB, id);

    // Check if user already exists
    const res = await UserModel.findById(serverDB, id);

    // If user not exists, skip update the user
    if (!res)
      return {
        message: "user not updated due to the user don't existing in the database",
        success: false,
      };

    pino.info('updating user due to clerk webhook');

    const email = params.email_addresses.find((e) => e.id === params.primary_email_address_id);
    const phone = params.phone_numbers.find((e, index) => {
      if (params.primary_phone_number_id) return e.id === params.primary_phone_number_id;
      return index === 0;
    });

    await userModel.updateUser({
      avatar: params.image_url,
      email: email?.email_address,
      firstName: params.first_name,
      id,
      lastName: params.last_name,
      phone: phone?.phone_number,
      username: params.username,
    });

    return { message: 'user updated', success: true };
  };

  getUserApiKeys = async (id: string) => {
    return UserModel.getUserApiKeys(serverDB, id, KeyVaultsGateKeeper.getUserKeyVaults);
  };

  getUserAvatar = async (id: string, image: string) => {
    const s3 = new S3();
    const s3FileUrl = `user/avatar/${id}/${image}`;

    try {
      const file = await s3.getFileByteArray(s3FileUrl);
      if (!file) {
        return null;
      }
      const fileBuffer = Buffer.from(file);
      return fileBuffer;
    } catch (error) {
      pino.error('Failed to get user avatar:', error);
    }
  };
}
