import { isGoalPrompt } from '@lobechat/builtin-tool-goal';

import type { HeteroOperationCapability } from '@/libs/trpc/utils/internalJwt';

/**
 * What a heterogeneous run's operation token may do.
 *
 * `goal:manage` lets the CLI create a goal the agent supervises from this
 * conversation (`lh goal create --conversation`), or bind an existing one to it
 * (`lh goal bind-topic`, which the `/goal` instructions route a named goal to). The token is exposed to the
 * always-installed CLI, so it is granted only when the user asked for a goal
 * with `/goal`: an ordinary coding run that meets instructions telling it to
 * run that command must not be able to launch persistent follow-on work.
 * Renewal copies the minted claims, so a run never gains it later.
 *
 * `caller:act` lets the agent's own `lh` commands write as the user who started
 * the run, in the run's workspace, while the run lasts. Without it the agent
 * fell back to the device's `lh login`, which on a shared device belongs to
 * someone else.
 */
export const heteroOperationCapabilities = (prompt: unknown): HeteroOperationCapability[] => [
  'caller:act',
  'hetero:ingest',
  'hetero:finish',
  'hetero:intervention:read',
  ...(isGoalPrompt(prompt) ? (['goal:manage'] as const) : []),
];
