import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { router } from '@/libs/trpc/lambda';
import { forgetDriveFolders } from '@/server/services/sandbox';

import { configurationSchema } from '../_schema/environment';
import { environmentProcedures } from '../environment';
import { rethrowDuplicateEnvironmentName, rethrowEnvironmentInUse } from './constraintErrors';
import { driveForEnvironment, resolveInstanceDrive } from './driveScope';
import { createDerivedInstance, deleteInstanceSnapshot } from './instanceOperations';
import { instanceProcedure } from './procedures';
import { idSchema, nameSchema, visibilitySchema } from './schemas';

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
      // The released input, `files` included: desktop clients bundle the
      // form that still offers it. The new endpoint creates code only.
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
 * `sandboxStorage.removeEnvironment` as released: the environment goes with the
 * copies built from it, their snapshots and what their builds left on the
 * drive — a file someone put in such a folder themselves stays. Released
 * clients offer no other way to delete a copy, and the current page shows
 * none, so this is how an environment that still has one is removed.
 *
 * Each copy as `removeInstance` removes it: snapshot first, row after, so a
 * snapshot the execution plane refuses to drop (a run still holds it) stops
 * the delete with nothing lost.
 */
const legacyRemoveEnvironment = instanceProcedure
  .input(z.object({ id: idSchema }))
  .mutation(async ({ ctx, input }) => {
    // Ownership before anything reaches the execution plane: a member who can
    // see a published environment must not get its snapshots deleted on the
    // way to being refused the row.
    const environment = await ctx.environmentModel.findOwnedById(input.id);
    if (!environment) throw new TRPCError({ code: 'NOT_FOUND', message: 'Environment not found' });

    const instances = await ctx.instanceModel.query({ environmentId: environment.id });
    for (const instance of instances.filter((entry) => entry.kind === 'sandbox')) {
      const { claim, client } = await resolveInstanceDrive(ctx, instance);
      await deleteInstanceSnapshot(client, instance.id);
      forgetDriveFolders(claim.key);
      await ctx.instanceModel.delete(instance.id);
    }

    const removed = await ctx.environmentModel.delete(input.id).catch(rethrowEnvironmentInUse);
    if (!removed) throw new TRPCError({ code: 'NOT_FOUND', message: 'Environment not found' });

    return removed;
  });

/**
 * The environment procedures under their released `sandboxStorage` paths —
 * the same procedures, not copies — with `createEnvironment` and
 * `removeEnvironment` keeping their released input and behavior.
 */
export const legacyEnvironmentRouter = router({
  ...environmentProcedures,
  createEnvironment: legacyCreateEnvironment,
  removeEnvironment: legacyRemoveEnvironment,
});
