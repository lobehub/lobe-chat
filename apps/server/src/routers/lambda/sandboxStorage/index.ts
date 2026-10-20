import { mergeRouters } from '@/libs/trpc/lambda';

import { environmentsRouter } from './environments';
import { filesRouter } from './files';
import { githubRouter } from './github';
import { instanceBuildRouter } from './instanceBuild';
import { instancesRouter } from './instances';
import { storageRouter } from './storage';

/**
 * Browsing and managing the persistent sandbox workspace.
 *
 * The workspace lives on a volume mounted into the sandbox runtime, so every
 * call here runs inside a sandbox session on the caller's behalf. Paths are
 * always relative to the workspace root; the absolute mount path never reaches
 * a client, which leaves nothing for one to smuggle back.
 */

export const sandboxStorageRouter = mergeRouters(
  filesRouter,
  storageRouter,
  instancesRouter,
  instanceBuildRouter,
  environmentsRouter,
  githubRouter,
);

export type SandboxStorageRouter = typeof sandboxStorageRouter;
