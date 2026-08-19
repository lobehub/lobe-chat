import { isRecord } from '@lobechat/utils/object';

import type { AskUserBridge, InterventionAnswer } from '../askUser/AskUserBridge';
import type { AgentPromptInput } from '../protocol';
import type { AcpAgentSessionOptions } from './acpAgentSession';
import { ACP_PROTOCOL_VERSION, AcpAgentSession } from './acpAgentSession';
import type { AcpRpcMessage } from './acpStdioClient';
import { AcpRpcResponseError, AcpServerRequestError } from './acpStdioClient';
import type { BuildAgentInputOptions } from './input';
import { normalizeImage } from './input';

const TRANSPORT = 'devin-acp' as const;

export interface DevinAcpTextPromptBlock {
  text: string;
  type: 'text';
}

export interface DevinAcpImagePromptBlock {
  data: string;
  mimeType: string;
  type: 'image';
}

export type DevinAcpPromptBlock = DevinAcpImagePromptBlock | DevinAcpTextPromptBlock;

interface DevinAcpInitializeResult {
  agentCapabilities?: {
    loadSession?: boolean;
    promptCapabilities?: { image?: boolean };
  };
  protocolVersion?: number | string;
}

interface DevinAcpSessionResult {
  configOptions?: unknown;
  sessionId?: string;
}

interface DevinAcpPromptResult {
  stopReason?: string;
}

interface DevinAcpPermissionOption {
  kind: string;
  name: string;
  optionId: string;
}

interface DevinAcpPermissionRequest {
  options: DevinAcpPermissionOption[];
  toolCall: {
    title: string;
    toolCallId: string;
  };
}

interface CanonicalAskQuestionArgs {
  questions: Array<{
    header: string;
    multiSelect: false;
    options: Array<{ label: string }>;
    question: string;
  }>;
}

export interface DevinAcpSessionOptions extends AcpAgentSessionOptions {
  askUserBridge?: AskUserBridge;
  initialModel?: string;
  onModel?: (model: string) => void;
  /** Devin permission mode, applied as a global flag before `acp`. */
  permissionMode?: string;
  prompt: DevinAcpPromptBlock[];
}

export const buildDevinAcpArgs = (extraArgs: string[] = [], permissionMode?: string): string[] => {
  const args = [...extraArgs];
  let resolvedMode = permissionMode;

  // A user-supplied --permission-mode in extraArgs wins and must be moved
  // before the `acp` subcommand, since it is a `devin` global option.
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--permission-mode') {
      resolvedMode = args[i + 1];
      args.splice(i, 2);
      break;
    }
    if (arg.startsWith('--permission-mode=')) {
      resolvedMode = arg.slice('--permission-mode='.length);
      args.splice(i, 1);
      break;
    }
  }

  if (!resolvedMode) return ['acp', ...args];
  return ['--permission-mode', resolvedMode, 'acp', ...args];
};

export const buildDevinAcpPrompt = async (
  prompt: AgentPromptInput,
  options: BuildAgentInputOptions = {},
): Promise<DevinAcpPromptBlock[]> => {
  const blocks = typeof prompt === 'string' ? [{ text: prompt, type: 'text' as const }] : prompt;
  const result: DevinAcpPromptBlock[] = [];

  for (const block of blocks) {
    if (block.type === 'text') {
      result.push({ text: block.text, type: 'text' });
    } else {
      const image = await normalizeImage(block.source, options);
      result.push({
        data: image.buffer.toString('base64'),
        mimeType: image.mediaType,
        type: 'image',
      });
    }
  }

  return result;
};

export const isDevinAcpSessionNotFoundError = (error: unknown): error is AcpRpcResponseError => {
  if (!(error instanceof AcpRpcResponseError) || error.method !== 'session/load') return false;

  const data = isRecord(error.rpcError.data) ? error.rpcError.data : undefined;
  return (
    error.rpcError.code === -32_016 &&
    (data?.['cognition.ai/errorKind'] === 'session_not_found' ||
      error.rpcError.message === 'Session not found')
  );
};

export class DevinAcpSession extends AcpAgentSession<
  DevinAcpInitializeResult,
  DevinAcpSessionOptions
> {
  private acceptUpdates = false;

  constructor(options: DevinAcpSessionOptions) {
    super(options, {
      args: buildDevinAcpArgs(options.args, options.permissionMode),
      pipeline: { agentType: 'devin', cwd: options.cwd },
      processLabel: 'Devin ACP',
      transport: TRANSPORT,
    });
  }

  get sessionId(): string | undefined {
    return this.acpSessionId;
  }

  protected buildInitializeParams(): unknown {
    return {
      clientCapabilities: { fs: { readTextFile: false, writeTextFile: false }, terminal: false },
      clientInfo: {
        name: 'lobehub',
        title: 'LobeHub',
        version: this.options.clientVersion,
      },
      protocolVersion: ACP_PROTOCOL_VERSION,
    };
  }

  protected validateInitialized(initialized: DevinAcpInitializeResult): void {
    if (
      initialized.protocolVersion !== ACP_PROTOCOL_VERSION &&
      initialized.protocolVersion !== String(ACP_PROTOCOL_VERSION)
    ) {
      throw new Error(
        `Devin ACP returned unsupported protocol version: ${String(initialized.protocolVersion)}`,
      );
    }
  }

  protected async establishSession(initialized: DevinAcpInitializeResult): Promise<string> {
    if (
      this.options.prompt.some((block) => block.type === 'image') &&
      initialized.agentCapabilities?.promptCapabilities?.image !== true
    ) {
      throw new Error('Devin ACP agent does not support image prompt blocks');
    }
    if (this.options.resumeSessionId && initialized.agentCapabilities?.loadSession !== true) {
      throw new Error('Devin ACP agent does not support loading sessions');
    }

    const sessionResult = await this.client.request<DevinAcpSessionResult>(
      this.options.resumeSessionId ? 'session/load' : 'session/new',
      {
        cwd: this.options.cwd,
        mcpServers: [],
        ...(this.options.resumeSessionId ? { sessionId: this.options.resumeSessionId } : {}),
      },
    );
    const sessionId = sessionResult.sessionId ?? this.options.resumeSessionId;
    if (!sessionId) throw new Error('Devin ACP returned no session id');

    const model =
      this.resolveCurrentModel(sessionResult.configOptions) ?? this.options.initialModel;
    if (model) {
      this.pipeline.configureSession({ model });
      this.options.onModel?.(model);
    }
    this.options.onSessionId(sessionId);
    await this.pushToPipeline({ model, sessionId, type: 'devin_session' });
    return sessionId;
  }

  protected onBeforePrompt(): void {
    this.acceptUpdates = true;
  }

  protected buildPromptParams(sessionId: string): unknown {
    return { prompt: this.options.prompt, sessionId };
  }

  protected override async settlePrompt(result: unknown): Promise<void> {
    await this.client.drain();
    await this.pushToPipeline({
      stopReason: (result as DevinAcpPromptResult | undefined)?.stopReason,
      type: 'devin_prompt_completed',
    });
  }

  protected async onRunFailure(error: Error): Promise<void> {
    await this.pushToPipeline({ message: error.message, type: 'devin_error' });
    await this.emitEvents(await this.pipeline.flush());
  }

  protected async handleAgentMessage(message: AcpRpcMessage): Promise<void> {
    if (!this.acceptUpdates || message.method !== 'session/update') return;
    const params = isRecord(message.params) ? message.params : undefined;
    if (!isRecord(params?.update)) return;

    const update = this.normalizeSessionUpdate(params.update);
    if (update.sessionUpdate === 'config_option_update') {
      const model = this.resolveCurrentModel(update.configOptions);
      if (model) {
        this.pipeline.configureSession({ model });
        this.options.onModel?.(model);
      }
    }
    await this.pushToPipeline(update);
  }

  protected async handleServerRequest(message: AcpRpcMessage): Promise<unknown> {
    if (message.method !== 'session/request_permission') {
      throw new AcpServerRequestError(-32_601, `Unsupported ACP client request: ${message.method}`);
    }

    const request = this.parsePermissionRequest(message.params);
    const selected = await this.selectPermissionOption(message, request);
    return {
      outcome: selected
        ? { optionId: selected.optionId, outcome: 'selected' }
        : { outcome: 'cancelled' },
    };
  }

  private normalizeSessionUpdate(update: Record<string, unknown>): Record<string, unknown> {
    if (typeof update.name === 'string') return update;
    const meta = isRecord(update._meta) ? update._meta : undefined;
    const inferenceToolName = meta?.['cognition.ai/inferenceToolName'];
    return typeof inferenceToolName === 'string' && inferenceToolName
      ? { ...update, name: inferenceToolName }
      : update;
  }

  private resolveCurrentModel(configOptions: unknown): string | undefined {
    if (!Array.isArray(configOptions)) return;

    const modelConfig = configOptions.find(
      (value) =>
        isRecord(value) &&
        (value.category === 'model' || value.id === 'model' || value.name === 'Model'),
    );
    return isRecord(modelConfig) && typeof modelConfig.currentValue === 'string'
      ? modelConfig.currentValue
      : undefined;
  }

  private parsePermissionRequest(value: unknown): DevinAcpPermissionRequest {
    if (!isRecord(value) || !Array.isArray(value.options) || !isRecord(value.toolCall)) {
      throw new AcpServerRequestError(-32_602, 'Invalid session/request_permission request');
    }

    const options = value.options.flatMap((option) =>
      isRecord(option) &&
      typeof option.kind === 'string' &&
      typeof option.name === 'string' &&
      typeof option.optionId === 'string'
        ? [{ kind: option.kind, name: option.name, optionId: option.optionId }]
        : [],
    );
    if (
      options.length !== value.options.length ||
      options.length === 0 ||
      typeof value.toolCall.toolCallId !== 'string'
    ) {
      throw new AcpServerRequestError(-32_602, 'Invalid session/request_permission options');
    }

    const meta = isRecord(value.toolCall._meta) ? value.toolCall._meta : undefined;
    const editableCommand = meta?.['cognition.ai/editableCommand'];
    const title =
      typeof value.toolCall.title === 'string' && value.toolCall.title
        ? value.toolCall.title
        : typeof editableCommand === 'string' && editableCommand
          ? editableCommand
          : 'Allow Devin to continue?';
    return {
      options,
      toolCall: { title, toolCallId: value.toolCall.toolCallId },
    };
  }

  private async selectPermissionOption(
    message: AcpRpcMessage,
    request: DevinAcpPermissionRequest,
  ): Promise<DevinAcpPermissionOption | undefined> {
    if (!this.options.askUserBridge) return;

    const toolCallId = `devin-permission-${String(message.id)}-${request.toolCall.toolCallId}`;
    const arguments_ = {
      questions: [
        {
          header: 'Permission required',
          multiSelect: false,
          options: request.options.map(({ name }) => ({ label: name })),
          question: request.toolCall.title,
        },
      ],
    } satisfies CanonicalAskQuestionArgs;
    await this.pushToPipeline({
      identifier: 'claude-code',
      rawInput: arguments_,
      sessionUpdate: 'tool_call',
      title: 'askUserQuestion',
      toolCallId,
    });
    const answer = await this.options.askUserBridge.pending({ arguments: arguments_, toolCallId });
    await this.pushToPipeline({
      rawOutput: answer,
      sessionUpdate: 'tool_call_update',
      status: 'completed',
      toolCallId,
    });

    const selections = this.getAnswerSelections(answer, request.toolCall.title);
    return request.options.find(
      ({ name, optionId }) => selections.includes(name) || selections.includes(optionId),
    );
  }

  private getAnswerSelections(answer: InterventionAnswer, question: string): string[] {
    if (answer.cancelled || !isRecord(answer.result)) return [];
    const selection = answer.result[question];
    return (Array.isArray(selection) ? selection : [selection]).flatMap((value) =>
      typeof value === 'string' ? [value] : [],
    );
  }
}
