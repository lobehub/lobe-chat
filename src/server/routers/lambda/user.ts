import { UserJSON } from '@clerk/backend';
import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

import { enableClerk } from '@/const/auth';
import { serverDB } from '@/database/server';
import { MessageModel } from '@/database/server/models/message';
import { SessionModel } from '@/database/server/models/session';
import { UserModel, UserNotFoundError } from '@/database/server/models/user';
import { authedProcedure, router } from '@/libs/trpc';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';
import { UserService } from '@/server/services/user';
import { UserGuideSchema, UserInitializationState, UserPreference } from '@/types/user';
import { UserSettings } from '@/types/user/settings';

const userProcedure = authedProcedure.use(async (opts) => {
  return opts.next({
    ctx: { userModel: new UserModel(serverDB, opts.ctx.userId) },
  });
});

export const userRouter = router({
  getUserState: userProcedure.query(async ({ ctx }): Promise<UserInitializationState> => {
    let state: Awaited<ReturnType<UserModel['getUserState']>> | undefined;

    // get or create first-time user
    while (!state) {
      try {
        state = await ctx.userModel.getUserState(KeyVaultsGateKeeper.getUserKeyVaults);
      } catch (error) {
        if (enableClerk && error instanceof UserNotFoundError) {
          const user = await currentUser();
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
