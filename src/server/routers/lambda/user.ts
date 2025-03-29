import { UserJSON } from '@clerk/backend';
import { z } from 'zod';

import { enableClerk } from '@/const/auth';
import { serverDB } from '@/database/server';
import { MessageModel } from '@/database/server/models/message';
import { SessionModel } from '@/database/server/models/session';
import { UserModel, UserNotFoundError } from '@/database/server/models/user';
import { ClerkAuth } from '@/libs/clerk-auth';
import { LobeNextAuthDbAdapter } from '@/libs/next-auth/adapter';
import { authedProcedure, router } from '@/libs/trpc';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';
import { S3 } from '@/server/modules/S3';
import { UserService } from '@/server/services/user';
import { getFullFileUrl } from '@/server/utils/files';
import {
  NextAuthAccountSchame,
  UserGuideSchema,
  UserInitializationState,
  UserPreference,
} from '@/types/user';
import { UserSettings } from '@/types/user/settings';

const userProcedure = authedProcedure.use(async (opts) => {
  return opts.next({
    ctx: {
      clerkAuth: new ClerkAuth(),
      nextAuthDbAdapter: LobeNextAuthDbAdapter(serverDB),
      userModel: new UserModel(serverDB, opts.ctx.userId),
    },
  });
});

export const userRouter = router({
  getUserRegistrationDuration: userProcedure.query(async ({ ctx }) => {
    return ctx.userModel.getUserRegistrationDuration();
  }),

  getUserSSOProviders: userProcedure.query(async ({ ctx }) => {
    return ctx.userModel.getUserSSOProviders();
  }),

  getUserState: userProcedure.query(async ({ ctx }): Promise<UserInitializationState> => {
    let state: Awaited<ReturnType<UserModel['getUserState']>> | undefined;

    // get or create first-time user
    while (!state) {
      try {
        state = await ctx.userModel.getUserState(KeyVaultsGateKeeper.getUserKeyVaults);
      } catch (error) {
        if (enableClerk && error instanceof UserNotFoundError) {
          const user = await ctx.clerkAuth.getCurrentUser();
          if (user) {
            const userService = new UserService();

            await userService.createUser(user.id, {
              created_at: user.createdAt,
              email_addresses: user.emailAddresses.map((e) => ({
                email_address: e.emailAddress,
                id: e.id,
              })),
              first_name: user.firstName,
              id: user.id,
              image_url: user.imageUrl,
              last_name: user.lastName,
              phone_numbers: user.phoneNumbers.map((e) => ({
                id: e.id,
                phone_number: e.phoneNumber,
              })),
              primary_email_address_id: user.primaryEmailAddressId,
              primary_phone_number_id: user.primaryPhoneNumberId,
              username: user.username,
            } as UserJSON);

            continue;
          }
        }
        throw error;
      }
    }

    const messageModel = new MessageModel(serverDB, ctx.userId);
    const hasMoreThan4Messages = await messageModel.hasMoreThanN(4);

    const sessionModel = new SessionModel(serverDB, ctx.userId);
    const hasAnyMessages = await messageModel.hasMoreThanN(0);
    const hasExtraSession = await sessionModel.hasMoreThanN(1);

    return {
      avatar: state.avatar ?? '',
      canEnablePWAGuide: hasMoreThan4Messages,
      canEnableTrace: hasMoreThan4Messages,
      // 有消息，或者创建过助手，则认为有 conversation
      hasConversation: hasAnyMessages || hasExtraSession,

      // always return true for community version
      isOnboard: state.isOnboarded || true,
      preference: state.preference as UserPreference,
      settings: state.settings,
      userId: ctx.userId,
    };
  }),

  makeUserOnboarded: userProcedure.mutation(async ({ ctx }) => {
    return ctx.userModel.updateUser({ isOnboarded: true });
  }),

  resetSettings: userProcedure.mutation(async ({ ctx }) => {
    return ctx.userModel.deleteSetting();
  }),

  unlinkSSOProvider: userProcedure.input(NextAuthAccountSchame).mutation(async ({ ctx, input }) => {
    const { provider, providerAccountId } = input;
    if (
      ctx.nextAuthDbAdapter?.unlinkAccount &&
      typeof ctx.nextAuthDbAdapter.unlinkAccount === 'function' &&
      ctx.nextAuthDbAdapter?.getAccount &&
      typeof ctx.nextAuthDbAdapter.getAccount === 'function'
    ) {
      const account = await ctx.nextAuthDbAdapter.getAccount(providerAccountId, provider);
      // The userId can either get from ctx.nextAuth?.id or ctx.userId
      if (!account || account.userId !== ctx.userId) throw new Error('The account does not exist');
      await ctx.nextAuthDbAdapter.unlinkAccount({ provider, providerAccountId });
    } else {
      throw new Error('The method in LobeNextAuthDbAdapter `unlinkAccount` is not implemented');
    }
  }),

  // 服务端上传头像
  updateAvatar: userProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    // 如果是 Base64 数据，需要上传到 S3
    if (input.startsWith('data:image')) {
      try {
        // 提取 mimeType，例如 "image/png"
        const prefix = 'data:';
        const semicolonIndex = input.indexOf(';');
        const mimeType =
          semicolonIndex !== -1 ? input.slice(prefix.length, semicolonIndex) : 'image/png';
        const fileType = mimeType.split('/')[1];

        // 分割字符串，获取 Base64 部分
        const commaIndex = input.indexOf(',');
        if (commaIndex === -1) {
          throw new Error('Invalid Base64 data');
        }
        const base64Data = input.slice(commaIndex + 1);

        // 创建 S3 客户端
        const s3 = new S3();

        // 使用固定文件名，确保每个用户只有一个头像（直接覆盖）
        const fileName = `avatar.${fileType}`;
        const filePath = `users/avatars/${ctx.userId}/${fileName}`;

        // 将 Base64 数据转换为 Buffer 再上传到 S3
        const buffer = Buffer.from(base64Data, 'base64');

        await s3.uploadBuffer(filePath, buffer, mimeType);

        // 获取公共访问 URL
        let avatarUrl = await getFullFileUrl(filePath);
        avatarUrl = avatarUrl + `?t=${Date.now()}`; // 添加时间戳以避免缓存

        return ctx.userModel.updateUser({ avatar: avatarUrl });
      } catch (error) {
        throw new Error(
          'Error uploading avatar: ' + (error instanceof Error ? error.message : String(error)),
        );
      }
    }

    // 如果不是 Base64 数据，直接使用 URL 更新用户头像
    return ctx.userModel.updateUser({ avatar: input });
  }),

  updateGuide: userProcedure.input(UserGuideSchema).mutation(async ({ ctx, input }) => {
    return ctx.userModel.updateGuide(input);
  }),

  updatePreference: userProcedure.input(z.any()).mutation(async ({ ctx, input }) => {
    return ctx.userModel.updatePreference(input);
  }),

  updateSettings: userProcedure
    .input(z.object({}).passthrough())
    .mutation(async ({ ctx, input }) => {
      const { keyVaults, ...res } = input as Partial<UserSettings>;

      // Encrypt keyVaults
      let encryptedKeyVaults: string | null = null;

      if (keyVaults) {
        // TODO: better to add a validation
        const data = JSON.stringify(keyVaults);
        const gateKeeper = await KeyVaultsGateKeeper.initWithEnvKey();

        encryptedKeyVaults = await gateKeeper.encrypt(data);
      }

      const nextValue = { ...res, keyVaults: encryptedKeyVaults };

      return ctx.userModel.updateSetting(nextValue);
    }),
});

export type UserRouter = typeof userRouter;
