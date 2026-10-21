/**
 * Runtime context handed to a builtin tool's manifest resolver so the tool can
 * self-trim per conversation context instead of relying on scattered, hard-coded
 * filters in the consuming layers (agentConfigResolver / toolSetComposer).
 *
 * Mirror of the builtin-agent `runtime: (ctx) => config` pattern, but for tools.
 * Extend this with new signals (e.g. isDesktop, isPageEditorReady, groupId) as
 * more tools migrate their context-based trimming here.
 */
export interface BuiltinToolResolveContext {
  /**
   * IM platform the run originates from (bot conversations only). Lets platform-
   * aware tools trim APIs the platform can't fulfil — e.g. the `lobe-message`
   * tool drops `readMessages` on WeChat, which has no history-read API and would
   * otherwise throw `PlatformUnsupportedError` after the model dutifully calls it.
   */
  botPlatform?: {
    /** Platform id (e.g. `wechat`, `discord`). */
    id: string;
    /**
     * `lobe-message` API names this platform does not support. Sourced from the
     * platform definition (`PlatformDefinition.unsupportedMessageApis`) so the
     * manifest trim stays in lock-step with the runtime that throws.
     */
    unsupportedMessageApis?: string[];
  };
  /**
   * Where this run executes, derived from the resolved `ExecutionPlan`. The
   * routed desktop-local target stays `local`; other plans mirror their `kind`
   * (`device` / `device-unrouted` / `sandbox` / `none`). Lets exec-capable tools (e.g. lobe-skills)
   * rewrite their API descriptions per environment — most notably
   * `device-unrouted`, where the user picked their local device but it is
   * offline and commands silently fall back to the cloud sandbox. Kept as a
   * plain union to avoid coupling the tool layer to the execution-plan types.
   */
  executionEnv?: 'device' | 'device-unrouted' | 'local' | 'none' | 'sandbox';
  /**
   * Why a `device-unrouted` plan failed to route, mirroring
   * `ExecutionPlanUnroutedReason` (`src/helpers/executionTarget.ts`). Only set
   * when `executionEnv` is `device-unrouted`. Offline reasons and
   * still-selectable reasons (unbound / several devices online, where the
   * remote-device picker is active) need different prompt wording.
   */
  executionEnvUnroutedReason?:
    'ambiguous-online-devices' | 'bound-device-offline' | 'no-bound-device' | 'no-online-device';
  /**
   * True when running inside a sub-agent execution. A nested sub-agent must not
   * be able to dispatch further sub-agents.
   */
  isSubAgent?: boolean;
  /**
   * In page scope, the kind of the open page: an HTML page (`custom/html`) is
   * edited as raw HTML, any other page node by node. Lets the page tool expose
   * only the APIs that apply to it. Unknown when not in page scope.
   */
  pageDocumentType?: 'html' | 'rich-text';
  /**
   * Conversation scope, e.g. 'main' | 'page' | 'task' | 'group' | 'group_agent'
   * | 'thread' | 'sub_agent'. Kept as a string to avoid coupling the tool layer
   * to the operation/message scope unions.
   */
  scope?: string;
}
