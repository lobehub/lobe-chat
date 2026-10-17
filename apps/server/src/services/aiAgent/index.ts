import type { AgentState } from '@lobechat/agent-runtime';
import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';
import type { SandboxStorageClaim } from '@lobechat/builtin-tool-cloud-sandbox';
import type { LobeChatDatabase } from '@lobechat/database';
import type {
  AgentSenderMetadata,
  ExecAgentResult,
  ExecGroupAgentParams,
  ExecGroupAgentResult,
  ExecSubAgentParams,
  ExecSubAgentResult,
  ExecVirtualSubAgentParams,
  ScheduleAgentRunParams,
  ScheduleAgentRunResult,
  UserInterventionConfig,
} from '@lobechat/types';
import { RequestTrigger } from '@lobechat/types';
import { nanoid } from '@lobechat/utils';
import { TRPCError } from '@trpc/server';
import debug from 'debug';

import {
  deriveAgentInterventionContinuationMessageId,
  deriveAgentInterventionContinuationOperationId,
} from '@/business/server/agent-run/agentInterventionIdentity';
import { AgentModel } from '@/database/models/agent';
import { AgentOperationModel } from '@/database/models/agentOperation';
import { AgentShareModel } from '@/database/models/agentShare';
import { ChatGroupModel } from '@/database/models/chatGroup';
import { ConnectorModel } from '@/database/models/connector';
import { ConnectorToolModel } from '@/database/models/connectorTool';
import { DeviceModel } from '@/database/models/device';
import { MessageModel } from '@/database/models/message';
import { PluginModel } from '@/database/models/plugin';
import { TaskModel } from '@/database/models/task';
import { ThreadModel } from '@/database/models/thread';
import { TopicModel } from '@/database/models/topic';
import { UserModel } from '@/database/models/user';
import { createStreamEventManager } from '@/server/modules/AgentRuntime/factory';
import { AgentService } from '@/server/services/agent';
import { AgentDocumentsService } from '@/server/services/agentDocuments';
import type {
  AgentExecutionParams,
  AgentExecutionResult,
  AgentRuntimeServiceOptions,
  AgentStepContinuation,
  SubAgentBridgeParams,
} from '@/server/services/agentRuntime';
import { AgentRuntimeService } from '@/server/services/agentRuntime';
import { getAbortError, throwIfAborted } from '@/server/services/agentRuntime/abort';
import type {
  ExecGroupMemberParams,
  ExecGroupMemberResult,
  GroupActionMemberBridgeParams,
} from '@/server/services/agentRuntime/types';
import { ComposioService } from '@/server/services/composio';
import { MarketService } from '@/server/services/market';
import { markdownToTxt } from '@/utils/markdownToTxt';

import { createGraphAwareAgentFactory } from './helpers/agentFactory';
import {
  createGroupActionMemberBridgeHook,
  createThreadHooks,
  pickThreadUsageBaseline,
} from './hooks/threadRunHooks';
import { InterventionController } from './intervention/InterventionController';
import type { ApprovalClaimState } from './pipeline/approvalResume';
import { claimApprovalResume, tryReuseInterventionContinuation } from './pipeline/approvalResume';
import {
  type ForegroundSupersedeDeps,
  recordSupersede,
  resolveReplacedOperationId,
  supersedeRunningForegroundOperation,
} from './pipeline/foregroundSupersede';
import {
  rearmGroupMemberDeadline,
  resolveGroupMemberApprovalContinuation,
} from './pipeline/groupMemberApproval';
import { dispatchHeteroAgent } from './pipeline/heteroDispatch';
import { resolveNewThread } from './pipeline/newThread';
import { buildOperationInitRequest, runOperationInit } from './pipeline/operationInit';
import { createHistoryMessagesLoader } from './pipeline/operationPrep';
import { type PrecreatedTopicDeps, resolvePrecreatedTopicConfig } from './pipeline/precreatedTopic';
import { resolveRunAgentConfig } from './pipeline/resolveRunAgentConfig';
import { scheduleAgentRun } from './pipeline/scheduleAgentRun';
import { traceSendStage } from './pipeline/sendTracing';
import { startOperation } from './pipeline/startOperation';
import { bindTopicWorkingDirectory } from './pipeline/topicWorkingDirectory';
import { resolveNewTopicSnapshot, setupTurn } from './pipeline/turnSetup';
import { createRunFacts, type RunFacts } from './runFacts';
import { applyShareGateToAgentConfig } from './shareGate';
import { resolveAgentSenderFromOperation } from './sourceAttribution';
import type { SubAgentLlmRelayRequest } from './subAgentLlmRelay';
import { closeSubAgentLlmRelay, openSubAgentLlmRelay } from './subAgentLlmRelay';
import type { SubAgentRunDeps } from './subAgentRuns';
import { execAgentMember, execAgentThreadRun, execIsolatedAgentMember } from './subAgentRuns';
import { acquireTopicStartReservation, TopicStartReservationError } from './topicStartReservation';
import type { ExecRunContext, InternalExecAgentParams } from './types';

const log = debug('lobe-server:ai-agent-service');

/**
 * AI Agent Service
 *
 * Encapsulates agent execution logic that can be triggered via:
 * - tRPC router (aiAgent.execAgent)
 * - REST API endpoint (/api/agent)
 * - Cron jobs / scheduled tasks
 */
export class AiAgentService {
  private readonly userId: string;
  private readonly db: LobeChatDatabase;
  private readonly agentDocumentsService: AgentDocumentsService;
  private readonly agentModel: AgentModel;
  private readonly agentOperationModel: AgentOperationModel;
  private readonly agentService: AgentService;
  private readonly messageModel: MessageModel;
  private readonly connectorModel: ConnectorModel;
  private readonly connectorToolModel: ConnectorToolModel;
  private readonly pluginModel: PluginModel;
  private readonly taskModel: TaskModel;
  private readonly threadModel: ThreadModel;
  private readonly topicModel: TopicModel;
  private readonly agentRuntimeService: AgentRuntimeService;
  private readonly interventionController: InterventionController;
  private _marketService?: MarketService;
  private readonly composioService: ComposioService;

  private readonly workspaceId?: string;
  /**
   * When the caller authenticated with a restricted API key, the unrestricted
   * user JWT minted for gateway WebSocket auth must not be handed back — it
   * passes `oidcAuth` as non-API-key auth and would bypass the scope guard
   * entirely.
   */
  private readonly withholdGatewayToken: boolean;

  constructor(
    db: LobeChatDatabase,
    userId: string,
    options?: {
      /**
       * Opt IN to agent-share visitor rows for the models this service (and
       * the {@link AgentRuntimeService} it constructs) owns. Reserved for
       * share-runtime entry points that drive a visitor turn under the
       * creator's `userId` (`share.ownerId`). Defaults to false; ordinary
       * creator-facing entry points get the visitor exclusion for free.
       */
      includeShareVisitor?: boolean;
      marketAccessToken?: string;
      runtimeOptions?: AgentRuntimeServiceOptions;
      withholdGatewayToken?: boolean;
      workspaceId?: string;
    },
  ) {
    this.userId = userId;
    this.db = db;
    this.workspaceId = options?.workspaceId;
    this.withholdGatewayToken = options?.withholdGatewayToken ?? false;
    const wsId = this.workspaceId;
    const includeShareVisitor = options?.includeShareVisitor ?? false;
    const messageModelOptions = { includeShareVisitor };
    const topicModelOptions = { includeShareVisitor };
    this.agentDocumentsService = new AgentDocumentsService(db, userId, wsId);
    this.agentModel = new AgentModel(db, userId, wsId);
    this.agentOperationModel = new AgentOperationModel(db, userId, wsId);
    this.agentService = new AgentService(db, userId, wsId);
    this.messageModel = new MessageModel(db, userId, wsId, undefined, messageModelOptions);
    this.connectorModel = new ConnectorModel(db, userId, wsId);
    this.connectorToolModel = new ConnectorToolModel(db, userId, wsId);
    this.pluginModel = new PluginModel(db, userId, wsId);
    this.taskModel = new TaskModel(db, userId, wsId);
    this.threadModel = new ThreadModel(db, userId, wsId);
    this.topicModel = new TopicModel(db, userId, wsId, undefined, topicModelOptions);
    this.agentRuntimeService = new AgentRuntimeService(db, userId, {
      ...options?.runtimeOptions,
      includeShareVisitor,
      agentFactory: createGraphAwareAgentFactory(options?.runtimeOptions?.agentFactory),
      // ── Runtime delegate ─────────────────────────────────────────────────
      // Operations the runtime delegates back UP to this layer. The dependency
      // arrow is one-way (AiAgentService → AgentRuntimeService), so the runtime
      // can't import us; instead we hand it the callbacks it needs to trigger
      // high-level pipelines mid-step. See AgentRuntimeDelegate. New high-level
      // capabilities the runtime calls into go in this `delegate` object.
      //
      // Arrow fields are auto-bound, so no `.bind(this)`.
      delegate: {
        execSubAgent: this.execSubAgent,
        execVirtualSubAgent: this.execVirtualSubAgent,
        execGroupMember: this.execGroupMember,
        verifyShareRunStillAuthorized: this.verifyShareRunStillAuthorized,
      },
      workspaceId: wsId,
    });

    // marketService is used for creds, sandbox, skills etc.
    // Read accessToken from DB; if options.marketAccessToken is provided, use it as override.
    if (options?.marketAccessToken) {
      this._marketService = new MarketService({
        accessToken: options.marketAccessToken,
        userInfo: { userId },
      });
    }
    this.composioService = new ComposioService({ db, userId, workspaceId: wsId });
    this.interventionController = new InterventionController({
      agentOperationModel: this.agentOperationModel,
      agentRuntimeService: this.agentRuntimeService,
      db: this.db,
      messageModel: this.messageModel,
      resolveDeviceWorkspaceId: (deviceId) => this.resolveDeviceWorkspaceId(deviceId),
      threadModel: this.threadModel,
      topicModel: this.topicModel,
      userId: this.userId,
    });
  }

  /** Shared dependency bundle for the thread-run helpers in `subAgentRuns.ts`. */
  private get subAgentRunDeps(): SubAgentRunDeps {
    return {
      agentOperationModel: this.agentOperationModel,
      agentRuntimeService: this.agentRuntimeService,
      execAgent: (p) => this.execAgent(p),
      messageModel: this.messageModel,
      threadModel: this.threadModel,
      userId: this.userId,
    };
  }

  /** Dependency bundle for the topic-start supersede helpers in `pipeline/foregroundSupersede.ts`. */
  private get foregroundSupersedeDeps(): ForegroundSupersedeDeps {
    return {
      agentOperationModel: this.agentOperationModel,
      agentRuntimeService: this.agentRuntimeService,
      interruptTask: (p) => this.interruptTask(p),
      topicModel: this.topicModel,
    };
  }

  private async getMarketService(
    runFacts?: RunFacts,
    options?: { sandboxStorage: SandboxStorageClaim },
  ): Promise<MarketService> {
    if (!options && this._marketService) return this._marketService;

    // The turn's fact reader already holds this row when a run is underway
    // (`execAgent` asks it for the memory / timezone settings too); callers
    // outside a run read it themselves.
    // Non-fatal either way — MarketService falls back to trustedClientToken.
    const settings = await (
      runFacts ? runFacts.userSettings() : new UserModel(this.db, this.userId).getUserSettings()
    ).catch(() => undefined);
    const accessToken = (settings?.market as any)?.accessToken;

    // A sandbox-workspace claim is signed into the trust token, so a service
    // carrying one is built for that run and kept out of the shared cache.
    if (options) {
      return new MarketService({
        accessToken,
        userInfo: {
          sandboxStorage: options.sandboxStorage,
          userId: this.userId,
          // The claim resolves against the workspace's mirrored organization,
          // not the member's personal account, so the scope has to travel with it.
          workspaceId: this.workspaceId,
        },
      });
    }

    this._marketService = new MarketService({
      accessToken,
      userInfo: { userId: this.userId },
    });
    return this._marketService;
  }

  private async resolveOperationTaskId(
    idOrIdentifier?: string | null,
  ): Promise<string | undefined> {
    if (!idOrIdentifier) return;

    // Task detail routes use human-readable identifiers such as `T-1`, while
    // operation runtimes store this value in FK-backed records.
    const task = await this.taskModel.resolve(idOrIdentifier);
    return task?.id;
  }

  /**
   * If `deviceId` is a device enrolled into the caller's current workspace,
   * return that workspaceId so device-gateway calls route to the
   * `workspace:<id>` principal. Returns undefined for a personal device (or no
   * workspace context), keeping the personal path byte-identical.
   */
  private async resolveDeviceWorkspaceId(
    deviceId: string | undefined,
  ): Promise<string | undefined> {
    if (!deviceId || !this.workspaceId) return undefined;
    const row = await new DeviceModel(
      this.db,
      this.userId,
      this.workspaceId,
    ).findWorkspaceDeviceById(deviceId);
    return row ? this.workspaceId : undefined;
  }

  /**
   * Execute a single agent step against this service's runtime.
   *
   * Delegates to the internal AgentRuntimeService, which is already wired with
   * the agent-invocation fork callbacks. The QStash step worker drives stepping
   * through here so `lobe-agent.callSubAgent` can fork virtual sub-agents —
   * building a bare runtime there would lose the callback and fail with
   * SUB_AGENT_UNAVAILABLE.
   */
  executeStep(params: AgentExecutionParams): Promise<AgentExecutionResult> {
    return this.agentRuntimeService.executeStep(params);
  }

  /** Continue a run parked in `waiting_for_client` (see AgentRuntimeService). */
  resumeFromClientLlmWait(
    params: Parameters<AgentRuntimeService['resumeFromClientLlmWait']>[0],
  ): ReturnType<AgentRuntimeService['resumeFromClientLlmWait']> {
    return this.agentRuntimeService.resumeFromClientLlmWait(params);
  }

  /** Runs of this user parked in `waiting_for_client`. */
  listClientLlmWaits(providers?: string[]): ReturnType<AgentRuntimeService['listClientLlmWaits']> {
    return this.agentRuntimeService.listClientLlmWaits(providers);
  }

  /** Mint a lock owner that spans a whole inline step loop. */
  createOperationLockOwner(operationId: string): string {
    return this.agentRuntimeService.createOperationLockOwner(operationId);
  }

  /** Publish a step that an inline loop deferred instead of running. */
  scheduleContinuation(continuation: AgentStepContinuation): Promise<void> {
    return this.agentRuntimeService.scheduleContinuation(continuation);
  }

  /** Release a lock retained across an inline step loop. */
  releaseOperationLock(operationId: string, stepLockOwner: string): Promise<void> {
    return this.agentRuntimeService.releaseOperationLock(operationId, stepLockOwner);
  }

  /**
   * Run the sub-agent completion bridge against this service's runtime.
   *
   * Same rationale as `executeStep`: the QStash `subagent-callback` webhook
   * drives the bridge through here so the runtime's models stay
   * workspace-scoped — a bare AgentRuntimeService would be personal-scoped
   * and the tool-message backfill / resume barrier could miss
   * workspace-scoped rows.
   */
  completeSubAgentBridge(params: SubAgentBridgeParams): Promise<boolean> {
    return this.agentRuntimeService.completeSubAgentBridge(params);
  }

  /**
   * Group-action member completion bridge entry point — driven by the QStash
   * `group-member-callback` webhook (queue mode). Forwards to the workspace-scoped
   * runtime so the member-anchor backfill + K=N barrier + resume/finish read the
   * same workspace rows. See `AgentRuntimeService.completeGroupActionMember`.
   */
  completeGroupActionMember(params: GroupActionMemberBridgeParams): Promise<boolean> {
    return this.agentRuntimeService.completeGroupActionMember(params);
  }

  /**
   * Resolve an agent by id or slug, with default config merged.
   *
   * Builtin agents (inbox / page / task / self-iteration slugs) may be addressed
   * purely by slug before a row exists — e.g. background self-iteration runs
   * dispatched via `execAgent({ slug })`. Lazily materialize the virtual row from
   * the builtin registry (mirrors the inbox/task `getBuiltinAgent` path) and
   * re-resolve. No-op for ordinary agent ids (getBuiltinAgent returns null).
   */
  private async resolveAgentConfigOrThrow(identifier: string) {
    let agentConfig = await this.agentService.getAgentConfig(identifier);
    if (!agentConfig && (Object.values(BUILTIN_AGENT_SLUGS) as string[]).includes(identifier)) {
      await this.agentModel.getBuiltinAgent(identifier);
      agentConfig = await this.agentService.getAgentConfig(identifier);
    }
    if (!agentConfig) {
      // `agentService.getAgentConfig` already routes through `AgentModel`'s
      // workspace + visibility ownership predicate, so a cross-user private
      // agent resolves to null here. Surface that as NOT_FOUND (not a generic
      // 500) so callers — chat, bot, cron task, sub-agent, REST — return a
      // uniform 404 and we never leak whether the id exists for another user.
      throw new TRPCError({ code: 'NOT_FOUND', message: `Agent not found: ${identifier}` });
    }

    return agentConfig;
  }

  /** Deps shared by every pre-created topic, so its snapshot matches `setupTurn`'s. */
  private precreatedTopicDeps(): PrecreatedTopicDeps {
    return {
      db: this.db,
      resolveAgentConfigOrThrow: (id) => this.resolveAgentConfigOrThrow(id),
      userId: this.userId,
      workspaceId: this.workspaceId,
    };
  }

  /** Resolve caller model policy before a pre-created topic permanently pins its model. */
  private resolvePrecreatedTopicConfig(
    identifier: string,
    overrides?: { model?: string; provider?: string },
  ) {
    return resolvePrecreatedTopicConfig(this.precreatedTopicDeps(), identifier, overrides);
  }

  /** Defer an agent run to a future time. See `pipeline/scheduleAgentRun`. */
  scheduleAgentRun(params: ScheduleAgentRunParams): Promise<ScheduleAgentRunResult> {
    return scheduleAgentRun(
      {
        ...this.precreatedTopicDeps(),
        messageModel: this.messageModel,
        topicModel: this.topicModel,
      },
      params,
    );
  }

  /**
   * Execute agent with just a prompt
   *
   * This is a simplified API that requires agent identifier (id or slug) and prompt.
   * All necessary data (agent config, tools, messages) will be fetched from the database.
   *
   * Architecture:
   * execAgent({ agentId | slug, prompt })
   *   → AgentModel.getAgentConfig(idOrSlug)
   *   → ServerMechaModule.AgentToolsEngine(config)
   *   → ServerMechaModule.ContextEngineering(input, config, messages)
   *   → AgentRuntimeService.createOperation(...)
   */
  async execAgent(inputParams: InternalExecAgentParams): Promise<ExecAgentResult> {
    // An approval on a group member's tool continues that member, not the
    // conversation's supervisor (see `resolveGroupMemberApprovalContinuation`).
    const memberContinuation = await resolveGroupMemberApprovalContinuation(
      {
        createBridgeHook: (bridge) =>
          createGroupActionMemberBridgeHook(this.agentRuntimeService, bridge),
        createThreadHooks: async (threadId) => {
          const thread = await this.threadModel.findById(threadId);
          if (!thread?.sourceMessageId) return [];
          return createThreadHooks(
            this.agentRuntimeService,
            this.threadModel,
            this.messageModel,
            thread.id,
            thread.metadata?.startedAt ?? new Date().toISOString(),
            // The recovered group-member bridge owns result publication.
            undefined,
            'execVirtualSubAgent',
            pickThreadUsageBaseline(thread.metadata),
          );
        },
        findMessagePlugin: (messageId) => this.messageModel.findMessagePlugin(messageId),
        loadMember: (operationId) => this.agentRuntimeService.loadGroupMemberBridge(operationId),
      },
      inputParams,
    );
    if (memberContinuation) {
      log(
        'execAgent: approval targets group member %s, continuing it under supervisor op %s',
        memberContinuation.agentId,
        memberContinuation.parentOperationId,
      );
      const continuation = await this.execAgent(memberContinuation);
      await rearmGroupMemberDeadline(
        { agentRuntimeService: this.agentRuntimeService },
        memberContinuation,
        continuation,
      );
      return {
        ...continuation,
        groupMemberContinuation: true,
        supervisorOperationId: memberContinuation.parentOperationId,
      };
    }

    // Creating the thread here (rather than inside the turn) means a run that
    // asked for one is already a thread run by the time the reservation check
    // below reads `appContext.threadId` — same isolation as a follow-up inside
    // an existing thread.
    const { createdThreadId, params } = await resolveNewThread(
      { threadModel: this.threadModel },
      inputParams,
    );
    // The client needs the id back to pivot its optimistic `_new` thread bucket
    // and refresh the sidebar; every return path below must carry it.
    const withCreatedThread = (result: ExecAgentResult): ExecAgentResult =>
      createdThreadId ? { ...result, createdThreadId } : result;

    const topicId = params.appContext?.topicId;
    const interventionReservationId = params.approvalResolutionRequestId
      ? deriveAgentInterventionContinuationOperationId({
          resolutionRequestId: params.approvalResolutionRequestId,
          userId: this.userId,
          workspaceId: this.workspaceId,
        })
      : undefined;
    if (
      interventionReservationId &&
      params.topicStartReservationId &&
      params.topicStartReservationId !== interventionReservationId
    ) {
      throw new Error('Intervention continuation reservation identity conflict');
    }
    const reservationId =
      interventionReservationId ?? params.topicStartReservationId ?? `agent-start-${nanoid()}`;
    const isInterventionThreadStart = Boolean(
      topicId &&
      params.appContext?.threadId &&
      interventionReservationId &&
      params.approvalResolutionRequestId,
    );
    // Thread runs are isolated under an explicit parent message and do not
    // advance the topic's main spine. They may start while their parent
    // operation owns `runningOperation` (for example callAgent/callSubAgent),
    // so making them wait for the topic-start claim deadlocks the child start.
    if (!topicId || (params.appContext?.threadId && !isInterventionThreadStart)) {
      return withCreatedThread(await this.execAgentWithApprovalRollback(params));
    }

    const replacesOperationId = isInterventionThreadStart
      ? undefined
      : await resolveReplacedOperationId(this.foregroundSupersedeDeps, params, topicId);

    // A replacement is allowed to take over the topic marker, but the device
    // process that owned the old marker may still hold a native Codex/CC writer.
    // Settle that physical run before reserving and dispatching the replacement;
    // otherwise two `lh hetero exec` wrappers can resume the same thread.
    if (replacesOperationId) {
      const interruption = await this.interruptTask({
        operationId: replacesOperationId,
        topicId,
      });
      if (interruption.deviceCancellationConfirmed === false) {
        throw new Error('Replaced heterogeneous agent process did not confirm termination');
      }
    }
    const reserved = await acquireTopicStartReservation({
      allowSameReservationReentry: !params.approvalResolutionRequestId,
      replacesOperationId,
      allowRunningOperationId: params.topicStartOwnerOperationId,
      // A thread continuation shares the topic row but never owns/replaces its
      // main runningOperation anchor. It uses only the short initializer fence.
      ignoreRunningOperation: isInterventionThreadStart || params.interactiveStart,
      reservationId,
      topicId,
      topicModel: this.topicModel,
    });

    if (!reserved) {
      throw new TopicStartReservationError(`Topic not found: ${topicId}`);
    }

    try {
      const superseded =
        params.interactiveStart && !isInterventionThreadStart
          ? await supersedeRunningForegroundOperation(this.foregroundSupersedeDeps, topicId, [
              replacesOperationId,
              params.topicStartOwnerOperationId,
            ])
          : undefined;
      const result = await this.execAgentWithApprovalRollback(params);
      if (superseded) {
        await recordSupersede(
          this.foregroundSupersedeDeps,
          topicId,
          result.operationId,
          superseded,
          params,
        );
      }
      return withCreatedThread(result);
    } finally {
      await this.topicModel.releaseTaskCallbackReservation(topicId, reservationId);
    }
  }

  /**
   * A human decision is claimed before the rest of operation preparation reads
   * message history. Keep its rollback guard outside the large preparation
   * routine so every throw and every early return before createOperation starts
   * restores the exact pending rows, not only queue-start failures.
   */
  private async execAgentWithApprovalRollback(
    params: InternalExecAgentParams,
  ): Promise<ExecAgentResult> {
    const approvalClaim: ApprovalClaimState = {
      continuationPrepared: false,
      continuationStarted: false,
      rollbackSnapshot: [],
    };

    try {
      return await this.execAgentWithReservation(params, approvalClaim);
    } finally {
      if (
        !approvalClaim.continuationPrepared &&
        !approvalClaim.continuationStarted &&
        approvalClaim.rollbackSnapshot.length > 0
      ) {
        await this.messageModel.restoreHumanApproval(approvalClaim.rollbackSnapshot);
        log(
          'execAgent: restored %d approval rows before continuation startup',
          approvalClaim.rollbackSnapshot.length,
        );
      }
    }
  }

  private async execAgentWithReservation(
    params: InternalExecAgentParams,
    approvalClaim: ApprovalClaimState,
  ): Promise<ExecAgentResult> {
    const {
      additionalPluginIds,
      exclusivePluginIds,
      agentId,
      slug,
      prompt,
      appContext,
      autoStart = true,
      botContext,
      botSender,
      createdThreadId,
      externalOrigin,
      clientIp,
      userAgent,
      deviceId: requestedDeviceId,
      localDeviceId,
      botPlatformContext,
      discordContext,
      existingMessageIds = [],
      fileIds: attachedFileIds,
      files,
      functionTools,
      hooks,
      instructions,
      chatConfigOverride,
      toolModeOverride,
      model: modelOverride,
      provider: providerOverride,
      stream,
      title,
      steer,
      trigger,
      cronJobId,
      taskId,
      evalContext,
      evalRuntime,
      maxSteps,
      disableLocalSystem,
      initialStepCount,
      signal,
      userInterventionConfig: requestedUserInterventionConfig = { approvalMode: 'headless' },
      queueRetries,
      queueRetryDelay,
      parentMessageId,
      parentOperationId,
      resume,
      resumeApproval,
      resumeApprovals,
      resumeToolResult,
      approvalResolutionRequestId: providedApprovalResolutionRequestId,
      approvalSourceOperationId: providedApprovalSourceOperationId,
      selectedSkillIds,
      selectedToolIds,
      shareGate,
      mentionedAgents,
      suppressUserMessage,
      ephemeralUserMessage,
    } = params;

    // Agent Share visitor runs execute under the CREATOR's credentials but are
    // approved by the VISITOR: granting a tool grants its normal approval
    // flow, so the run honors the visitor's own approval mode (sent by the
    // share client, see `shareChat.execAgent`) and parks intervention-gated
    // calls for the visitor to resolve on the share page.
    //
    // A share caller that sends no config falls back to `manual`, never to
    // this method's `headless` default: `headless` auto-runs `'required'`
    // calls, which would grant a consent nobody gave.
    const userInterventionConfig: UserInterventionConfig = shareGate
      ? (params.userInterventionConfig ?? { approvalMode: 'manual' })
      : requestedUserInterventionConfig;

    // Honour client-minted row ids on a FRESH send only. Resume / regeneration
    // replays reach this method too (resumeApproval, resumeToolResult,
    // parentMessageId), and a replayed id there would collide with the row the
    // original send already created — so those paths drop the ids defensively
    // rather than trusting every caller to omit them.
    const interventionResumeCount = [resumeApproval, resumeApprovals, resumeToolResult].filter(
      Boolean,
    ).length;
    if (interventionResumeCount > 1) {
      throw new Error(
        'Only one of resumeApproval, resumeApprovals, or resumeToolResult may be provided',
      );
    }

    const isResumeLike =
      !!resume ||
      !!resumeApproval ||
      !!resumeApprovals?.length ||
      !!resumeToolResult ||
      !!parentMessageId;
    const clientIds = isResumeLike ? undefined : params.clientIds;

    // Validate that either agentId or slug is provided
    if (!agentId && !slug) {
      throw new Error('Either agentId or slug must be provided');
    }

    // Determine the identifier to use (agentId takes precedence)
    const identifier = agentId || slug!;

    log('execAgent: identifier=%s, prompt=%s', identifier, prompt.slice(0, 50));

    const operationTaskId = await this.resolveOperationTaskId(taskId ?? appContext?.taskId);

    const assistantMessageRef: { current?: string } = {};
    const updateAbortedAssistantMessage = async (errorMessage: string) => {
      if (!assistantMessageRef.current) return;

      try {
        await this.messageModel.update(assistantMessageRef.current, {
          content: '',
          error: {
            body: {
              detail: errorMessage,
            },
            message: errorMessage,
            type: 'ServerAgentRuntimeError',
          },
        });
      } catch (error) {
        log(
          'execAgent: failed to update aborted assistant message %s: %O',
          assistantMessageRef.current,
          error,
        );
      }
    };
    const throwIfExecutionAborted = async (stage: string) => {
      if (!signal?.aborted) return;

      const error = getAbortError(signal, `Agent execution aborted during ${stage}`);
      await updateAbortedAssistantMessage(error.message);
      throw error;
    };

    throwIfAborted(signal, 'Agent execution aborted before startup');

    // Stages 1–2.5 — resolve the effective agent config for this run
    // (see `pipeline/resolveRunAgentConfig`).
    const {
      agentConfig,
      agentSlug,
      assistantAgentId,
      canManageAgent,
      conversationAgentId,
      disabledPluginIds,
      isPublicWorkspaceAgent,
      memberDeviceOverride,
      persistAgentId,
      resolvedAgentId,
    } = await traceSendStage('agent_config', () =>
      resolveRunAgentConfig(
        {
          db: this.db,
          resolveAgentConfigOrThrow: (id) => this.resolveAgentConfigOrThrow(id),
          userId: this.userId,
          workspaceId: this.workspaceId,
        },
        {
          appContext,
          chatConfigOverride,
          identifier,
          instructions,
          modelOverride,
          providerOverride,
          shareVisitorUserId: shareGate?.visitorUserId,
          throwIfExecutionAborted,
          toolModeOverride,
        },
      ),
    );

    // Share-visitor runs must never see the creator's files/knowledge bases.
    // Applied to the resolved config before anything downstream (knowledge
    // flags, tools engine, context snapshot) reads it.
    if (shareGate) applyShareGateToAgentConfig(agentConfig);

    let resumeParentMessage: Awaited<ReturnType<MessageModel['findById']>>;

    // `resumeApproval` implies the same "load parent message + skip user
    // message creation" semantics as `resume`. Callers that go through the
    // tRPC router get `resume: true` via the router, but the service-level
    // API allows resumeApproval alone — fold both into a single effective
    // flag so downstream resume branches don't need to know about approval.
    // Normalize the single and batch approval forms into one list so every
    // branch below (validation, DB writes, resume context) has a single shape
    // to reason about. `resumeApproval` stays the wire format for one decision.
    const approvalDecisions = resumeApprovals?.length
      ? resumeApprovals
      : resumeApproval
        ? [resumeApproval]
        : [];

    const effectiveResume = resume || approvalDecisions.length > 0 || !!resumeToolResult;

    // Both resume and suppressUserMessage run the turn off existing history
    // instead of appending a new user message — share the message-construction
    // branches below. Resume-specific validation/approval stays gated on
    // `effectiveResume` only.
    const runFromHistory = effectiveResume || !!suppressUserMessage;

    if (effectiveResume) {
      if (!parentMessageId) {
        throw new Error('parentMessageId is required when resume is true');
      }

      if (!appContext) {
        throw new Error('appContext is required when resume is true');
      }

      if (!appContext.topicId) {
        throw new Error('appContext.topicId is required when resume is true');
      }

      resumeParentMessage = await this.messageModel.findById(parentMessageId);

      if (!resumeParentMessage) {
        throw new Error(`Parent message not found: ${parentMessageId}`);
      }

      if (resumeParentMessage.topicId !== appContext.topicId) {
        throw new Error('appContext.topicId does not match parent message');
      }

      if (
        resumeParentMessage.threadId &&
        resumeParentMessage.threadId !== (appContext.threadId ?? undefined)
      ) {
        throw new Error('appContext.threadId does not match parent message');
      }

      if (resumeParentMessage.sessionId && resumeParentMessage.sessionId !== appContext.sessionId) {
        throw new Error('appContext.sessionId does not match parent message');
      }
    }

    // Stages 2.6–2.7 — claim the human decision(s) before anything below reads
    // message history (see `pipeline/approvalResume`).
    const {
      approvalOwnerAssistantId,
      approvalSourceOperationId,
      approvalSourceToolMessageIds,
      approvedToolEntries,
      batchApprovalAnchorId,
      resumeApprovalPlugin,
      resolvedToolResult,
    } = await traceSendStage('approval_claim', () =>
      claimApprovalResume(
        {
          controlToolResult: (input) => this.agentRuntimeService.controlCompletedToolResult(input),
          messageModel: this.messageModel,
        },
        {
          appContext,
          approvalClaim,
          approvalDecisions,
          parentMessageId,
          providedApprovalResolutionRequestId,
          providedApprovalSourceOperationId,
          resumeApprovals,
          resumeParentMessage,
          resumeToolResult,
        },
      ),
    );

    // Deterministic continuation identity for a generic (v2) approval claim.
    // Also consumed by the turn setup below: a crash-safe re-entry must find
    // the SAME assistant placeholder instead of minting a second turn.
    const continuationIdentity = providedApprovalResolutionRequestId
      ? {
          resolutionRequestId: providedApprovalResolutionRequestId,
          userId: this.userId,
          workspaceId: this.workspaceId,
        }
      : undefined;
    const continuationOperationId = continuationIdentity
      ? deriveAgentInterventionContinuationOperationId(continuationIdentity)
      : undefined;
    const continuationAssistantId = continuationIdentity
      ? deriveAgentInterventionContinuationMessageId(continuationIdentity)
      : undefined;

    const reusedContinuation = await tryReuseInterventionContinuation(
      {
        agentOperationModel: this.agentOperationModel,
        agentRuntimeService: this.agentRuntimeService,
        messageModel: this.messageModel,
        userId: this.userId,
        withholdGatewayToken: this.withholdGatewayToken,
        workspaceId: this.workspaceId,
      },
      {
        approvalClaim,
        approvalSourceOperationId,
        approvalSourceToolMessageIds,
        continuationAssistantId,
        continuationOperationId,
        parentMessageId,
        providedApprovalResolutionRequestId,
        resolvedAgentId,
        topicId: appContext?.topicId,
      },
    );
    if (reusedContinuation) return reusedContinuation;

    // Agent → agent attribution: resolve the launching run's agent into a
    // display snapshot once, before the turn rows exist, so the persisted user
    // message carries a self-contained sender block.
    const agentSender = await this.resolveSourceAgentSnapshot(
      resolvedAgentId,
      params.sourceOperationId,
    );

    // Stage 3 + shared turn setup — topic creation/reuse (with the pinned
    // model), device-access policy, hetero detection, attachment ingestion, and
    // the persisted user/assistant rows (see `pipeline/turnSetup`).
    const turn = await traceSendStage('turn_setup', () =>
      setupTurn(
        {
          db: this.db,
          messageModel: this.messageModel,
          topicModel: this.topicModel,
          userId: this.userId,
          workspaceId: this.workspaceId,
        },
        {
          agentConfig,
          agentSender,
          agentSlug,
          appContext,
          assistantAgentId,
          attachedFileIds,
          batchApprovalAnchorId,
          botContext,
          botSender,
          clientIds,
          continuationAssistantId,
          conversationAgentId,
          createdThreadId,
          externalOrigin,
          cronJobId,
          files,
          modelOverride,
          operationTaskId,
          parentMessageId,
          prompt,
          providerOverride,
          requestedDeviceId,
          resolvedAgentId,
          resume,
          runFromHistory,
          selectedSkillIds,
          shareGate,
          steer,
          throwIfExecutionAborted,
          title,
          trigger,
        },
      ),
    );
    assistantMessageRef.current = turn.assistantMessageId;
    const {
      canUseDevice,
      deviceAccessReason,
      isHeteroAgent,
      model,
      provider,
      requestTriggerMetadata,
      runAttachments,
      selfMessageIds,
      topicId,
    } = turn;

    // Shared context for the extracted execAgent pipeline stages
    // (`pipeline/*`). Built after the turn rows exist so every stage sees the
    // persisted anchors; `agentConfig` stays the same mutable object so stage
    // systemRole appends remain visible to `createOperation` below.
    // One reader for the facts that cannot change within this turn, so the
    // send window asks the routed device and the user's row once each.
    const runFacts = createRunFacts({
      db: this.db,
      userId: this.userId,
      workspaceId: this.workspaceId,
    });

    const runContext: ExecRunContext = {
      agentConfig,
      appContext:
        turn.editingAgentId && turn.editingAgentId !== appContext?.editingAgentId
          ? { ...appContext, editingAgentId: turn.editingAgentId }
          : appContext,
      assistantMessageId: turn.assistantMessageId,
      canUseDevice,
      deviceAccessReason,
      model,
      parentMessageId,
      persistAgentId,
      prompt,
      provider,
      resolvedAgentId,
      runFacts,
      shareGate,
      topicEditingGroupId: turn.topicEditingGroupId,
      topicId,
      trigger,
      userMessageId: turn.userMessageId,
    };

    if (isHeteroAgent) {
      return dispatchHeteroAgent(
        {
          bindTopicWorkingDirectory: (p) =>
            bindTopicWorkingDirectory({ topicModel: this.topicModel }, p),
          db: this.db,
          getMarketService: (options) => this.getMarketService(runFacts, options),
          messageModel: this.messageModel,
          resolveDeviceWorkspaceId: (deviceId) => this.resolveDeviceWorkspaceId(deviceId),
          topicModel: this.topicModel,
          userId: this.userId,
          withholdGatewayToken: this.withholdGatewayToken,
          workspaceId: this.workspaceId,
        },
        runContext,
        {
          canManageAgent,
          effectiveRequestedDeviceId: turn.effectiveRequestedDeviceId,
          heteroType: turn.heteroType,
          heterogeneousProvider: turn.heterogeneousProvider,
          hooks,
          isPublicWorkspaceAgent,
          localDeviceId,
          maxSteps,
          memberDeviceOverride,
          operationTaskId,
          onOperationCreated: params.onOperationCreated,
          parentOperationId,
          pinnedHeterogeneousTopicModel: turn.pinnedHeterogeneousTopicModel,
          pinnedHeterogeneousTopicSources: turn.pinnedHeterogeneousTopicSources,
          requestTrigger: requestTriggerMetadata.trigger,
          requestedDeviceId: turn.requestedDeviceId,
          runAttachments,
          selfMessageIds,
          topicStartOwnerOperationId: params.topicStartOwnerOperationId,
        },
      );
    }

    // 4. Fetch user settings (memory config + timezone)
    // Agent-level memory config takes priority; fallback to user-level setting
    const agentMemoryEnabled = agentConfig.chatConfig?.memory?.enabled;
    let globalMemoryEnabled = agentMemoryEnabled ?? false;
    let enableExpertise = false;
    let userTimezone: string | undefined;
    await traceSendStage('run_settings', async () => {
      try {
        const settings = await runFacts.userSettings();
        const memorySettings = settings?.memory as { enabled?: boolean } | undefined;

        globalMemoryEnabled = agentMemoryEnabled ?? memorySettings?.enabled !== false;

        // Timezone drives the session-date placeholder rendered back to whoever
        // is actually conversing. In a share-visitor run that is the VISITOR,
        // not the creator whose settings this block otherwise reads — memory /
        // expertise intentionally stay creator-scoped below (gated by
        // `allowReadMemory`), but the timezone has no such gate and must not
        // leak the creator's own setting into a visitor's turn.
        if (shareGate) {
          const visitorSettings = await runFacts.userSettings(shareGate.visitorUserId);
          const visitorGeneralSettings = visitorSettings?.general as
            { timezone?: string } | undefined;
          userTimezone = visitorGeneralSettings?.timezone;
        } else {
          const generalSettings = settings?.general as { timezone?: string } | undefined;
          userTimezone = generalSettings?.timezone;
        }
      } catch (error) {
        log('execAgent: failed to fetch user settings: %O', error);
      }
      try {
        const preference = await runFacts.userPreference();
        enableExpertise = preference?.lab?.enableSelfLearning === true;
      } catch (error) {
        console.error('Failed to resolve expertise injection Lab preference:', error);
      }
      // Share visitors only get the creator's memory (persona + learned
      // expertise) when the share explicitly allows it — both surfaces would
      // otherwise leak the creator's personal context into visitor turns.
      if (shareGate && !shareGate.shareConfig.allowReadMemory) {
        globalMemoryEnabled = false;
        enableExpertise = false;
      }
    });
    log(
      'execAgent: globalMemoryEnabled=%s, timezone=%s',
      globalMemoryEnabled,
      userTimezone ?? 'default',
    );

    // History loader shared by tool discovery (media-availability probe) and
    // the operation-prep message assembly (see `pipeline/operationPrep`).
    const loadHistoryMessages = createHistoryMessagesLoader(
      {
        db: this.db,
        isShareVisitorRun: !!shareGate,
        messageModel: this.messageModel,
        userId: this.userId,
        workspaceId: this.workspaceId,
      },
      {
        appContext,
        effectiveResume,
        existingMessageIds,
        parentMessageId,
        resumeParentMessage,
        selfMessageIds,
      },
    );

    // When the user @-mentions agents (multi-mention, non-group), enable the
    // agent-management tool for this run so the supervisor can `callAgent` to
    // delegate. Mirrors the client runtime, which injects a callAgent manifest.
    // Single-mention takes a client-only deterministic-router path and never
    // reaches here. The delegation *context* (which agents were mentioned) is
    // injected separately via `initialContext.mentionedAgents` below.
    const hasMentionedAgents = !appContext?.groupId && !!mentionedAgents?.length;

    // 15. Generate operation ID: op_{timestamp}_{agentId}_{topicId}_{random}
    const operationId =
      continuationOperationId ?? `op_${Date.now()}_${resolvedAgentId}_${topicId}_${nanoid(8)}`;

    // Stages 5–18 — the run's init: the tool surface, the message/context
    // assembly, and the human decision a resumed approval turns into the first
    // context. One call so the same work can later run in the step-0 worker
    // instead of on the send path.
    const initRequest = buildOperationInitRequest({
      additionalPluginIds,
      taskId: operationTaskId,
      agentSlug,
      approvalOwnerAssistantId,
      approvedToolEntries,
      attachedFileIds,
      botContext,
      botPlatformContext,
      disableLocalSystem,
      disableSelfFeedbackIntentTool: params.disableSelfFeedbackIntentTool,
      disableTools: params.disableTools,
      disabledPluginIds,
      discordContext,
      ephemeralUserMessage,
      exclusivePluginIds,
      files,
      functionTools,
      globalMemoryEnabled,
      hasMentionedAgents,
      isFixedDeviceTarget: turn.isFixedDeviceTarget,
      localDeviceId,
      mentionedAgents,
      operationId,
      parentMessageId,
      requestTrigger: requestTriggerMetadata.trigger,
      requestedDeviceId: turn.requestedDeviceId,
      resumeApproval,
      resumeApprovalPlugin,
      resumeApprovals,
      resumeFromHistory: runFromHistory,
      resumeToolResult: resolvedToolResult,
      runAttachments,
      selectedSkillIds,
      selectedToolIds,
      topicBoundDeviceId: turn.topicBoundDeviceId,
    });

    const { discovery, initialContext, prep } = await traceSendStage('operation_init', () =>
      runOperationInit(
        {
          agentDocumentsService: this.agentDocumentsService,
          agentModel: this.agentModel,
          bindTopicWorkingDirectory: (p) =>
            bindTopicWorkingDirectory({ topicModel: this.topicModel }, p),
          composioService: this.composioService,
          connectorModel: this.connectorModel,
          connectorToolModel: this.connectorToolModel,
          db: this.db,
          getMarketService: () => this.getMarketService(runFacts),
          loadHistoryMessages,
          messageModel: this.messageModel,
          pluginModel: this.pluginModel,
          throwIfExecutionAborted,
          topicModel: this.topicModel,
          userId: this.userId,
          workspaceId: this.workspaceId,
        },
        runContext,
        initRequest,
      ),
    );

    // 17. Log final operation parameters summary
    log(
      'execAgent: creating operation %s with params: model=%s, provider=%s, tools=%d, messages=%d, manifests=%d',
      operationId,
      model,
      provider,
      discovery.tools?.length ?? 0,
      prep.allMessages.length,
      Object.keys(discovery.toolManifestMap).length,
    );

    // Claim the child slot on the supervisor's runningOperation marker LAST,
    // immediately before startup. The marker vanishes when the supervisor is
    // cancelled or settled, so every awaited preparation step above widens the
    // claim→start race window — an orphaned child would start against a
    // marker that no longer lists it. Claiming here keeps the window minimal;
    // a failed claim only wastes the preparation reads (its lone write — the
    // topic cwd pin — is additive and idempotent).
    if (params.topicStartOwnerOperationId) {
      const attached = await this.topicModel.appendRunningOperationChild(
        topicId,
        params.topicStartOwnerOperationId,
        {
          assistantMessageId: turn.assistantMessageId,
          operationId,
          orchestrationRole: appContext?.orchestrationRole,
          scope: appContext?.scope ?? undefined,
          threadId: appContext?.threadId ?? undefined,
        },
      );
      if (!attached) {
        const errorMessage = 'Group supervisor finished before this member could start.';
        await updateAbortedAssistantMessage(errorMessage);
        return {
          agentId: resolvedAgentId,
          assistantMessageId: turn.assistantMessageId,
          autoStarted: false,
          createdAt: new Date().toISOString(),
          error: errorMessage,
          message: errorMessage,
          operationId,
          status: 'error',
          success: false,
          timestamp: new Date().toISOString(),
          topicId,
          userMessageId: turn.userMessageId ?? parentMessageId ?? '',
        };
      }
    }

    // 19. Create the operation via AgentRuntimeService, persist the reconnect
    // marker, and mint the gateway token (see `pipeline/startOperation`).
    return traceSendStage('start_operation', () =>
      startOperation(
        {
          agentRuntimeService: this.agentRuntimeService,
          messageModel: this.messageModel,
          retirePendingApprovalOperation: (opId) => this.retirePendingApprovalOperation(opId),
          topicModel: this.topicModel,
          userId: this.userId,
          withholdGatewayToken: this.withholdGatewayToken,
          workspaceId: this.workspaceId,
        },
        runContext,
        {
          acceptsFileWorks: params.acceptsFileWorks,
          acceptsMemberRuntimeEnd: params.acceptsMemberRuntimeEnd,
          approvalClaim,
          approvalSourceOperationId,
          approvalSourceToolMessageIds,
          autoStart,
          onOperationCreated: params.onOperationCreated,
          botContext,
          botPlatformContext,
          clientIp,
          disabledPluginIds,
          discordContext,
          discovery,
          enableExpertise,
          evalContext,
          evalRuntime,
          hooks,
          initialContext,
          initialStepCount,
          maxSteps,
          operationId,
          operationTaskId,
          parentOperationId,
          prep,
          providedApprovalResolutionRequestId,
          queueRetries,
          queueRetryDelay,
          signal,
          stream,
          clientProtocol: params.clientProtocol,
          includeFinalState: params.includeFinalState,
          llmExecutor: params.llmExecutor,
          topicStartOwnerOperationId: params.topicStartOwnerOperationId,
          updateAbortedAssistantMessage,
          userAgent,
          userInterventionConfig,
          userTimezone,
        },
      ),
    );
  }

  /**
   * Execute Group Agent (Supervisor) in a single call
   *
   * This method handles Group-specific logic (topic with groupId) and delegates
   * the core agent execution to execAgent.
   *
   * Flow:
   * 1. Create topic with groupId (if needed)
   * 2. Delegate to execAgent for the rest
   */
  async execGroupAgent(params: ExecGroupAgentParams): Promise<ExecGroupAgentResult> {
    const { agentId, groupId, message, topicId: inputTopicId, newTopic } = params;

    log(
      'execGroupAgent: agentId=%s, groupId=%s, message=%s',
      agentId,
      groupId,
      message.slice(0, 50),
    );

    // 1. Create topic with groupId if needed
    let topicId = inputTopicId;
    let isCreateNewTopic = false;

    // Create new topic when:
    // - newTopic is explicitly provided, OR
    // - no topicId is provided (default behavior for group chat)
    if (newTopic || !inputTopicId) {
      const fallbackTitleSource = markdownToTxt(message);
      const topicTitle =
        newTopic?.title ||
        fallbackTitleSource.slice(0, 50) + (fallbackTitleSource.length > 50 ? '...' : '');
      const agentConfig = await this.resolvePrecreatedTopicConfig(agentId);
      const snapshot = await resolveNewTopicSnapshot(
        { db: this.db, userId: this.userId, workspaceId: this.workspaceId },
        agentConfig,
      );
      const topicItem = await this.topicModel.create({
        ...snapshot,
        agentId,
        groupId,
        messages: newTopic?.topicMessageIds,
        title: topicTitle,
        // Note: execGroupAgent doesn't have trigger param yet, defaults to null
      });
      topicId = topicItem.id;
      isCreateNewTopic = true;
      log('execGroupAgent: created new topic %s with groupId %s', topicId, groupId);
    }

    // 2. Delegate to execAgent with groupId in appContext.
    // execGroupAgent always runs the group's supervisor, so stamp the
    // orchestration role onto the run — it lands on the assistant message
    // metadata and drives supervisor-flavored UI rendering.
    const result = await this.execAgent({
      agentId,
      appContext: { groupId, orchestrationRole: 'supervisor', topicId },
      autoStart: true,
      prompt: message,
      trigger: RequestTrigger.Chat,
    });

    log(
      'execGroupAgent: delegated to execAgent, operationId=%s, success=%s',
      result.operationId,
      result.success,
    );

    return {
      assistantMessageId: result.assistantMessageId,
      error: result.error,
      isCreateNewTopic,
      operationId: result.operationId,
      success: result.success,
      topicId: result.topicId,
      userMessageId: result.userMessageId,
    };
  }

  /**
   * Snapshot the agent that launched an agent → agent run (`metadata.agentSender`)
   * from the caller's own operation row; `resolveAgentSenderFromOperation` owns the
   * trust and shareability rules.
   */
  private resolveSourceAgentSnapshot = (
    destinationAgentId: string,
    sourceOperationId?: string,
  ): Promise<AgentSenderMetadata | undefined> =>
    resolveAgentSenderFromOperation(sourceOperationId, {
      destinationAgentId,
      findAgentDisplayFields: (agentId) => this.agentModel.getAgentDisplayFields(agentId),
      findAgentVisibility: (agentId) => this.agentModel.getAgentVisibility(agentId),
      findChatGroupVisibility: async (chatGroupId) =>
        (await new ChatGroupModel(this.db, this.userId, this.workspaceId).findById(chatGroupId))
          ?.visibility ?? null,
      findOperation: (operationId) => this.agentOperationModel.findById(operationId),
      findTopic: (topicId) => this.topicModel.findById(topicId),
      userId: this.userId,
      workspaceId: this.workspaceId,
    });

  /**
   * `AgentRuntimeDelegate.verifyShareRunStillAuthorized` implementation — see
   * `AgentShareModel.isRunStillAuthorized`'s JSDoc for what "authorized" means
   * and why a per-step recheck (not only at step 0) is what actually stops a
   * revoked share's run: nothing tears down an operation that already exists,
   * and the visitor's own Stop button breaks the instant the share goes
   * private, so the step loop has to re-prove authorization itself.
   *
   * A plain top-level `db` read (not scoped to `this.userId`/workspace):
   * `agent_shares` has no ownership predicate applicable here — this call runs
   * from inside the CREATOR's own runtime step, so `this.db` is already the
   * correct connection.
   *
   * Arrow field (not a method) so it stays bound when handed to
   * AgentRuntimeService.
   */
  verifyShareRunStillAuthorized = async (params: {
    agentId: string;
    shareId: string;
  }): Promise<boolean> => AgentShareModel.isRunStillAuthorized(this.db, params);

  /**
   * Execute an agent in an isolated Thread context.
   *
   * Group/callAgent paths use this entry. It does not mark the child as a
   * virtual sub-agent and it does not install the async completion bridge.
   */
  // Arrow field (not a method) so it stays bound when handed to AgentRuntimeService.
  execSubAgent = async (
    params: ExecSubAgentParams,
    options: {
      /** The dispatching tab stands by on this channel to run the child's device-only LLM calls. */
      llmRelay?: SubAgentLlmRelayRequest;
    } = {},
  ): Promise<ExecSubAgentResult> => {
    const llmExecutor = await openSubAgentLlmRelay(options.llmRelay, {
      streamManager: createStreamEventManager(),
      userId: this.userId,
      workspaceId: this.workspaceId,
    });

    return execAgentThreadRun(this.subAgentRunDeps, params, {
      isSubAgent: false,
      llmExecutor,
      logScope: 'execSubAgent',
    });
  };

  /** The tab stopped standing by on a sub-agent's relay channel: end it on the gateway. */
  releaseSubAgentLlmRelay = async (channel: string): Promise<{ success: boolean }> => ({
    success: await closeSubAgentLlmRelay(channel, this.userId, createStreamEventManager()),
  });

  /**
   * Execute a virtual sub-agent created by `lobe-agent.callSubAgent`.
   *
   * This path is a child operation of the current agent run. It is marked as a
   * sub-agent so it cannot recursively spawn more sub-agents, and it registers
   * the bridge that backfills the parent's placeholder tool message.
   */
  execVirtualSubAgent = async (params: ExecVirtualSubAgentParams): Promise<ExecSubAgentResult> =>
    execAgentThreadRun(this.subAgentRunDeps, params, {
      chatConfig: params.chatConfig,
      deviceId: params.deviceId,
      isSubAgent: true,
      localDeviceId: params.localDeviceId,
      logScope: 'execVirtualSubAgent',
      // Sub-agent model is resolved at the spawn site (callSubAgent runner) from
      // the parent agent's `agencyConfig.subagent` and threaded through here as an
      // explicit override, so execAgent never re-reads the parent config.
      model: params.model,
      provider: params.provider,
      resumeParentOnComplete: true,
    });

  /**
   * Fork a single group member ("call agent member") under a `lobe-group-management`
   * tool call. Dispatches to the in-group (non-isolated, shared group session)
   * or isolated (own thread) path, installing the group-action member completion
   * bridge. Invoked once per member by the runtime's `agentMember` runner.
   *
   * Arrow field (not a method) so it stays bound when handed to the runtime
   * delegate.
   */
  execGroupMember = async (params: ExecGroupMemberParams): Promise<ExecGroupMemberResult> => {
    if (params.mode === 'isolated') {
      return execIsolatedAgentMember(this.subAgentRunDeps, params);
    }

    return execAgentMember(this.subAgentRunDeps, params);
  };

  /**
   * Interrupts a running task and coordinates any device-hosted process shutdown.
   * Delegates to {@link InterventionController}.
   */
  async interruptTask(params: {
    operationId?: string;
    threadId?: string;
    topicId?: string;
  }): Promise<{
    deviceCancellationConfirmed?: boolean;
    operationId?: string;
    success: boolean;
    threadId?: string;
  }> {
    return this.interventionController.interruptTask(params);
  }

  /**
   * Flags whether the composer still holds user messages queued behind a run.
   * Delegates to {@link InterventionController}.
   */
  async setQueuedMessages(params: {
    operationId: string;
    pending: boolean;
  }): Promise<{ success: boolean }> {
    return this.interventionController.setQueuedMessages(params);
  }

  /** Settle a parked approval batch and terminate its operation. */
  stopPendingApproval(params: {
    approvalResolutionRequestId?: string;
    batchId: string;
    operationId: string;
    toolMessageIds: string[];
    topicId: string;
  }): Promise<{ operationId: string; settledToolMessageIds: string[]; success: boolean }> {
    return this.interventionController.stopPendingApproval(params);
  }

  /** Retire the operation segment parked on an approval. */
  retirePendingApprovalOperation(operationId: string): Promise<void> {
    return this.interventionController.retirePendingApprovalOperation(operationId);
  }

  /** Owner-scoped runtime state used by the v2 router's crash-safe retry probe. */
  loadInterventionContinuationState(operationId: string): Promise<AgentState | null> {
    return this.interventionController.loadInterventionContinuationState(operationId);
  }

  /** Requeue an idle deterministic continuation without rebuilding its assistant turn. */
  ensureInterventionContinuationStarted(
    operationId: string,
  ): Promise<'already_started' | 'missing' | 'scheduled'> {
    return this.interventionController.ensureInterventionContinuationStarted(operationId);
  }

  /**
   * Repair the topic reconnect marker and release the exact start reservation
   * after a durable queue ACK. Delegates to {@link InterventionController}.
   */
  repairInterventionContinuationTopicAnchor(params: {
    assistantMessageId: string;
    continuationOperationId: string;
    resolutionRequestId: string;
    scope?: string | null;
    sourceOperationId: string;
    sourceToolMessageIds: string[];
    threadId?: string | null;
    topicId: string;
  }): Promise<void> {
    return this.interventionController.repairInterventionContinuationTopicAnchor(params);
  }
}
