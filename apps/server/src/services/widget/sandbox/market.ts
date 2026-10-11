import debug from 'debug';

import { isTrustedClientEnabled } from '@/libs/trusted-client';
import { MarketService } from '@/server/services/market';

import {
  clampSandboxTimeout,
  WIDGET_SANDBOX_REQUEST_OVERHEAD_MS,
  type WidgetSandboxActor,
  WidgetSandboxError,
  type WidgetSandboxRunner,
  type WidgetSandboxRunRequest,
  type WidgetSandboxRunResult,
} from './types';

const log = debug('lobe-server:widget:sandbox');

type RunSandbox = MarketService['runSandbox'];

export interface MarketWidgetSandboxRunnerOptions {
  /** Defaults to `isTrustedClientEnabled`: Market only accepts trusted clients here. */
  isEnabled?: () => boolean;
  /** Defaults to a `MarketService` acting as the run's actor. */
  runSandbox?: (actor: WidgetSandboxActor) => RunSandbox;
}

interface MarketRunBody {
  durationMs?: number;
  error?: string;
  error_description?: string;
  exitCode?: number;
  stderr?: string;
  stdout?: string;
  timedOut?: boolean;
}

const defaultRunSandbox = (actor: WidgetSandboxActor): RunSandbox =>
  new MarketService({
    userInfo: { userId: actor.userId, workspaceId: actor.workspaceId ?? undefined },
  }).runSandbox;

/**
 * Widget sandbox behind Market's one-shot run endpoint
 * (`POST /api/v1/sandbox/runs`). Market authenticates the trusted-client token
 * for the run's actor, rate limits that account, and signs the request to the
 * widget sandbox Worker, which enforces the egress allowlist per run.
 *
 * Market answers 200 for every script that ran — including non-zero exits and
 * timeouts; any other status means the script did not run.
 */
export class MarketWidgetSandboxRunner implements WidgetSandboxRunner {
  private readonly isEnabled: () => boolean;
  private readonly runSandbox: (actor: WidgetSandboxActor) => RunSandbox;

  constructor(options: MarketWidgetSandboxRunnerOptions = {}) {
    this.isEnabled = options.isEnabled ?? isTrustedClientEnabled;
    this.runSandbox = options.runSandbox ?? defaultRunSandbox;
  }

  async run(request: WidgetSandboxRunRequest): Promise<WidgetSandboxRunResult> {
    if (!this.isEnabled()) {
      throw new WidgetSandboxError(
        'SANDBOX_NOT_CONFIGURED',
        'Widget sandbox is not configured: Market trusted-client credentials are missing',
      );
    }

    const timeoutMs = clampSandboxTimeout(request.timeoutMs);
    let response: Awaited<ReturnType<RunSandbox>>;
    try {
      response = await this.runSandbox(request.actor)(
        {
          egress: { allow: request.network.allow },
          env: request.env,
          runtime: request.runtime,
          // Base64 keeps shell metacharacters in scripts away from edge WAF rules.
          scriptB64: Buffer.from(request.script, 'utf8').toString('base64'),
          scriptEncoding: 'base64',
          subject: request.subject,
          timeoutMs,
        },
        { signal: AbortSignal.timeout(timeoutMs + WIDGET_SANDBOX_REQUEST_OVERHEAD_MS) },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log('request failed: %s', message);
      throw new WidgetSandboxError('SANDBOX_ERROR', `Sandbox request failed: ${message}`);
    }

    const body = (response.data ?? {}) as MarketRunBody;
    if (response.status === 200 && typeof body.exitCode === 'number') {
      return {
        durationMs: typeof body.durationMs === 'number' ? body.durationMs : 0,
        exitCode: body.exitCode,
        stderr: typeof body.stderr === 'string' ? body.stderr : '',
        stdout: typeof body.stdout === 'string' ? body.stdout : '',
        timedOut: body.timedOut === true,
      };
    }

    const code = body.error ?? 'unknown_error';
    const detail = body.error_description ? `${code}: ${body.error_description}` : code;
    log('market responded status=%d error=%s', response.status, code);

    if (code === 'sandbox_not_configured') {
      throw new WidgetSandboxError(
        'SANDBOX_NOT_CONFIGURED',
        'Widget sandbox is not configured on Market',
      );
    }
    if (response.status === 401 || response.status === 403) {
      throw new WidgetSandboxError(
        'SANDBOX_UNAUTHORIZED',
        `Sandbox rejected the credentials (${detail})`,
      );
    }
    if (response.status === 400 || response.status === 422) {
      throw new WidgetSandboxError(
        'SANDBOX_BAD_REQUEST',
        `Sandbox rejected the request: ${detail}`,
      );
    }
    const retry = response.retryAfterSeconds ? `; retry after ${response.retryAfterSeconds}s` : '';
    throw new WidgetSandboxError(
      'SANDBOX_ERROR',
      `Sandbox could not run the script (HTTP ${response.status}): ${detail}${retry}`,
    );
  }
}
