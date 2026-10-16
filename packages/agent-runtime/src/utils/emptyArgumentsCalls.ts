import type { ChatToolPayload } from '@lobechat/types';

import type { AgentState } from '../types';
import { selectEffectiveToolManifestMap } from './operationToolSet';

/**
 * What the model reads back when a call arrives with an empty `arguments`
 * string and its tool cannot legally be called without arguments. Parallel
 * tool-call batches from some model/gateway pairs lose the per-call arguments
 * during streaming serialization: the batch reaches the platform as
 * fully-formed calls whose `arguments` is `''` (vent T-673 — 5/7/12 identical
 * retries because the executor only answers with per-call schema errors).
 * Executing them just burns one validation error per call, so the agent
 * rejects them here with one actionable signal instead; the escape that works
 * is re-issuing the calls one at a time with complete arguments.
 */
export const EMPTY_ARGS_TOOL_CONTENT =
  'Tool call rejected: the arguments of this call arrived empty — the parameters were lost before execution, a known failure mode when several tool calls are emitted in parallel. The call was not executed. Call the tool again one call at a time and include the complete arguments JSON for the call.';
export const EMPTY_ARGS_TOOL_REASON = 'tool_arguments_empty';

/**
 * Whether the tool's declared parameter schema makes this a legal no-argument
 * call. A tool whose schema has no required properties can be invoked with
 * `{}` (or with the `arguments` field omitted entirely — several
 * provider/gateway serialization paths drop an empty arguments string when
 * streaming a tool call), so an empty `arguments` there is not the T-673
 * serialization-loss shape and must not be rejected. Manifests without a
 * parameters schema stay loss-shaped: absence of a schema proves nothing.
 */
export const toolExpectsNoArguments = (
  toolCalling: ChatToolPayload,
  state: AgentState,
): boolean => {
  // Effective lookup (static map + step-activated manifests): a tool exposed
  // only through `state.activatedStepTools` has no static entry, and a lookup
  // that misses it degrades a legal no-argument call to the rejection path.
  const manifest = selectEffectiveToolManifestMap(state)[toolCalling.identifier];
  if (!manifest) return false;

  const api = manifest.api?.find((a: any) => a.name === toolCalling.apiName);
  // API-level schema takes precedence over tool-level, mirroring getToolInterventionConfig.
  const parameters = api?.parameters ?? manifest.parameters;
  if (!parameters || typeof parameters !== 'object') return false;

  const required = (parameters as { required?: unknown }).required;
  return !Array.isArray(required) || required.length === 0;
};

/**
 * Splits a batch into calls the executor can attempt and calls that arrived
 * with no `arguments` at all. `{}` stays executable — it is a legal
 * no-argument call and JSON-parses fine; only a missing arguments string is
 * the serialization-loss shape, and it cannot survive `JSON.parse` in the
 * executor anyway. Exception: a tool whose manifest declares no required
 * parameters accepts an empty `arguments` — providers may omit the field for
 * no-parameter calls, and rejecting it blocks legal listCriteria-style calls
 * (vent T-800), so those calls are normalized to `{}` and executed.
 */
export const partitionEmptyArgumentsCalls = (
  toolsCalling: ChatToolPayload[],
  state: AgentState,
) => {
  const emptyArgsCalls: ChatToolPayload[] = [];
  const executableCalls: ChatToolPayload[] = [];
  for (const toolCalling of toolsCalling) {
    if (toolCalling.arguments && toolCalling.arguments.trim().length > 0) {
      executableCalls.push(toolCalling);
    } else if (toolExpectsNoArguments(toolCalling, state)) {
      executableCalls.push({ ...toolCalling, arguments: '{}' });
    } else {
      emptyArgsCalls.push(toolCalling);
    }
  }
  return { emptyArgsCalls, executableCalls };
};
