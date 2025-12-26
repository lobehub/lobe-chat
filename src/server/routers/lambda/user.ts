import { UserJSON } from '@clerk/backend';
import { enableClerk, isDesktop } from '@lobechat/const';
import {
  NextAuthAccountSchame,
  UserGuideSchema,
  UserInitializationState,
  UserPreference,
  UserPreferenceSchema,
  UserSettings,
  UserSettingsSchema,
} from '@lobechat/types';
import { TRPCError } from '@trpc/server';
import { after } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { MessageModel } from '@/database/models/message';
import { SessionModel } from '@/database/models/session';
import { UserModel, UserNotFoundError } from '@/database/models/user';
import { ClerkAuth } from '@/libs/clerk-auth';
import { pino } from '@/libs/logger';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';
import { S3 } from '@/server/modules/S3';
import { FileService } from '@/server/services/file';
import { NextAuthUserService } from '@/server/services/nextAuthUser';
import { UserService } from '@/server/services/user';

const usernameSchema = z
  .string()
  .trim()
  .min(1, { message: 'USERNAME_REQUIRED' })
  .regex(/^\w+$/, { message: 'USERNAME_INVALID' });

const userProcedure = authedProcedure.use(serverDatabase).use(async ({ ctx, next }) => {
  return next({
    ctx: {
      clerkAuth: new ClerkAuth(),
      fileService: new FileService(ctx.serverDB, ctx.userId),
      messageModel: new MessageModel(ctx.serverDB, ctx.userId),
      nextAuthUserService: new NextAuthUserService(ctx.serverDB),
      sessionModel: new SessionModel(ctx.serverDB, ctx.userId),
      userModel: new UserModel(ctx.serverDB, ctx.userId),
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
    try {
      after(async () => {
        try {
          await ctx.userModel.updateUser({ lastActiveAt: new Date() });
        } catch (err) {
          console.error('update lastActiveAt failed, error:', err);
        }
      });
    } catch {
      // `after` may fail outside request scope (e.g., in tests), ignore silently
    }

    let state: Awaited<ReturnType<UserModel['getUserState']>> | undefined;

    // get or create first-time user
    while (!state) {
      try {
        state = await ctx.userModel.getUserState(KeyVaultsGateKeeper.getUserKeyVaults);
      } catch (error) {
        // user not create yet
        if (error instanceof UserNotFoundError) {
          // if in clerk auth mode
          if (enableClerk) {
            const user = await ctx.clerkAuth.getCurrentUser();
            if (user) {
              const userService = new UserService(ctx.serverDB);

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

          // if in desktop mode, make sure desktop user exist
          else if (isDesktop) {
            await UserModel.makeSureUserExist(ctx.serverDB, ctx.userId);
            pino.info('create desktop user');
            continue;
          }
        }

        console.error('getUserState:', error);
        throw error;
      }
    }

    // Run all count queries in parallel
    const [hasMoreThan4Messages, hasAnyMessages, hasExtraSession] = await Promise.all([
      ctx.messageModel.hasMoreThanN(4),
      ctx.messageModel.hasMoreThanN(0),
      ctx.sessionModel.hasMoreThanN(1),
    ]);

    return {
      avatar: state.avatar,
      canEnablePWAGuide: hasMoreThan4Messages,
      canEnableTrace: hasMoreThan4Messages,
      email: state.email,
      firstName: state.firstName,

      fullName: state.fullName,

      // Has messages or created assistants, then considered has conversation
      hasConversation: hasAnyMessages || hasExtraSession,
      // always return true for community version
      isOnboard: state.isOnboarded || true,
      lastName: state.lastName,
      preference: state.preference as UserPreference,
      settings: state.settings,
      userId: ctx.userId,
      username: state.username,
    } satisfies UserInitializationState;
  }),

  makeUserOnboarded: userProcedure.mutation(async ({ ctx }) => {
    return ctx.userModel.updateUser({ isOnboarded: true });
  }),

  resetSettings: userProcedure.mutation(async ({ ctx }) => {
    return ctx.userModel.deleteSetting();
  }),

  unlinkSSOProvider: userProcedure.input(NextAuthAccountSchame).mutation(async ({ ctx, input }) => {
    const { provider, providerAccountId } = input;
    const account = await ctx.nextAuthUserService.getAccount(providerAccountId, provider);
    // The userId can either get from ctx.nextAuth?.id or ctx.userId
    if (!account || account.userId !== ctx.userId) throw new Error('The account does not exist');
    await ctx.nextAuthUserService.unlinkAccount({ provider, providerAccountId });
  }),

  // Server-side avatar upload
  updateAvatar: userProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    // If Base64 data, need to upload to S3
    if (input.startsWith('data:image')) {
      try {
        // Extract mimeType, e.g. "image/png"
        const prefix = 'data:';
        const semicolonIndex = input.indexOf(';');
        const mimeType =
          semicolonIndex !== -1 ? input.slice(prefix.length, semicolonIndex) : 'image/png';
        const fileType = mimeType.split('/')[1];

        // Split string to get Base64 part
        const commaIndex = input.indexOf(',');
        if (commaIndex === -1) {
          throw new Error('Invalid Base64 data');
        }
        const base64Data = input.slice(commaIndex + 1);

        // Create S3 client
        const s3 = new S3();

        // Use UUID to generate unique filename, prevent caching issues
        // Get old avatar URL, delete it later
        const userState = await ctx.userModel.getUserState(KeyVaultsGateKeeper.getUserKeyVaults);
        const oldAvatarUrl = userState.avatar;

        const fileName = `${uuidv4()}.${fileType}`;
        const filePath = `user/avatar/${ctx.userId}/${fileName}`;

        // Convert Base64 data to Buffer then upload to S3
        const buffer = Buffer.from(base64Data, 'base64');

        await s3.uploadBuffer(filePath, buffer, mimeType);

        // Delete old avatar
        if (oldAvatarUrl && oldAvatarUrl.startsWith('/webapi/')) {
          const oldFilePath = oldAvatarUrl.replace('/webapi/', '');
          await s3.deleteFile(oldFilePath);
        }

        const avatarUrl = '/webapi/' + filePath;

        return ctx.userModel.updateUser({ avatar: avatarUrl });
      } catch (error) {
        throw new Error(
          'Error uploading avatar: ' + (error instanceof Error ? error.message : String(error)),
        );
      }
    }

    // If not Base64 data, directly use URL to update user avatar
    return ctx.userModel.updateUser({ avatar: input });
  }),

  updateFullName: userProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return ctx.userModel.updateUser({ fullName: input });
  }),

  updateGuide: userProcedure.input(UserGuideSchema).mutation(async ({ ctx, input }) => {
    return ctx.userModel.updateGuide(input);
  }),

  updatePreference: userProcedure.input(UserPreferenceSchema).mutation(async ({ ctx, input }) => {
    return ctx.userModel.updatePreference(input);
  }),

  updateSettings: userProcedure.input(UserSettingsSchema).mutation(async ({ ctx, input }) => {
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

  updateUsername: userProcedure.input(usernameSchema).mutation(async ({ ctx, input }) => {
    const username = input.trim();

    const existedUser = await UserModel.findByUsername(ctx.serverDB, username);
    if (existedUser && existedUser.id !== ctx.userId) {
      throw new TRPCError({ code: 'CONFLICT', message: 'USERNAME_TAKEN' });
    }

    return ctx.userModel.updateUser({ username });
  }),
});

export type UserRouter = typeof userRouter;
