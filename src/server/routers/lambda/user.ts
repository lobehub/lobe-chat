import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

import { enableClerk } from '@/const/auth';
import { MessageModel } from '@/database/server/models/message';
import { SessionModel } from '@/database/server/models/session';
import { UserModel, UserNotFoundError } from '@/database/server/models/user';
import { authedProcedure, router } from '@/libs/trpc';
import { UserInitializationState, UserPreference } from '@/types/user';

const userProcedure = authedProcedure.use(async (opts) => {
  return opts.next({
    ctx: { userModel: new UserModel() },
  });
});

export const userRouter = router({
  getUserState: userProcedure.query(async ({ ctx }): Promise<UserInitializationState> => {
    let state: Awaited<ReturnType<UserModel['getUserState']>> | undefined;

    // get or create first-time user
    while (!state) {
      try {
        state = await ctx.userModel.getUserState(ctx.userId);
      } catch (error) {
        if (enableClerk && error instanceof UserNotFoundError) {
          const user = await currentUser();
          if (user) {
            const email =
              user.primaryEmailAddress ??
              user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);
            const phone =
              user.primaryPhoneNumber ??
              user.phoneNumbers.find((e) => e.id === user.primaryPhoneNumberId);
            await ctx.userModel.createUser({
              avatar: user.imageUrl,
              clerkCreatedAt: new Date(user.createdAt),
              email: email?.emailAddress,
              firstName: user.firstName,
              id: user.id,
              lastName: user.lastName,
              phone: phone?.phoneNumber,
              username: user.username,
            });
            continue;
          }
        }
        throw error;
      }
    }

    const messageModel = new MessageModel(ctx.userId);
    const messageCount = await messageModel.count();

    const sessionModel = new SessionModel(ctx.userId);
    const sessionCount = await sessionModel.count();

    return {
      canEnablePWAGuide: messageCount >= 2,
      canEnableTrace: messageCount >= 4,
      // 有消息，或者创建过助手，则认为有 conversation
      hasConversation: messageCount > 0 || sessionCount > 1,

      // always return true for community version
      isOnboard: state.isOnboarded || true,
      preference: state.preference as UserPreference,
      settings: state.settings,
      userId: ctx.userId,
    };
  }),

  makeUserOnboarded: userProcedure.mutation(async ({ ctx }) => {
    return ctx.userModel.updateUser(ctx.userId, { isOnboarded: true });
  }),

  resetSettings: userProcedure.mutation(async ({ ctx }) => {
    return ctx.userModel.deleteSetting(ctx.userId);
  }),

  updatePreference: userProcedure.input(z.any()).mutation(async ({ ctx, input }) => {
    return ctx.userModel.updatePreference(ctx.userId, input);
  }),

  updateSettings: userProcedure
    .input(z.object({}).passthrough())
    .mutation(async ({ ctx, input }) => {
      return ctx.userModel.updateSetting(ctx.userId, input);
    }),
});

export type UserRouter = typeof userRouter;
