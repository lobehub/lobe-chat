import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { router } from '@/libs/trpc/lambda';

import { configurationSchema } from '../_schema/environment';
import { environmentProcedures } from '../environment';
import { rethrowDuplicateEnvironmentName } from './constraintErrors';
import { driveForEnvironment } from './driveScope';
import { createDerivedInstance } from './instanceOperations';
import { instanceProcedure } from './procedures';
import { nameSchema, visibilitySchema } from './schemas';

/**
 * `sandboxStorage.createEnvironment` as released, for clients from before the
 * environment router moved out: they send `withDefaultInstance: true` and
 * start the build of the `defaultInstance` they get back, and have no dialog
 * to create one themselves. Without the flag it is the definition alone, as
 * `environment.createEnvironment` is.
 *
 * All or nothing, as it was: an instance that cannot be made takes the new
 * environment back with it, so the caller sees the failure and retries.
 */
const legacyCreateEnvironment = instanceProcedure
  .input(
    z.object({
      configuration: configurationSchema.optional(),
      description: z.string().max(2000).optional(),
      name: nameSchema,
      visibility: visibilitySchema.optional(),
      withDefaultInstance: z.boolean().optional(),
    }),
  )
  .mutation(async ({ ctx, input: { withDefaultInstance, ...input } }) => {
    const environment = await ctx.environmentModel
      .create(input)
      .catch(rethrowDuplicateEnvironmentName);
    if (!withDefaultInstance) return { ...environment, defaultInstance: undefined };

    try {
      const access = await ctx.drives.client(driveForEnvironment(environment, ctx.workspaceId));
      if (!access) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This account has no persistent sandbox workspace',
        });
      }
      const defaultInstance = await createDerivedInstance(
        ctx.instanceModel,
        access.client,
        access.claim.key,
        environment,
      );

      return { ...environment, defaultInstance };
    } catch (error) {
      await ctx.environmentModel.delete(environment.id).catch(() => undefined);
      throw error;
    }
  });

/**
 * The environment procedures under their released `sandboxStorage` paths —
 * the same procedures, not copies — with `createEnvironment` keeping its
 * released input and answer.
 */
export const legacyEnvironmentRouter = router({
  ...environmentProcedures,
  createEnvironment: legacyCreateEnvironment,
});
