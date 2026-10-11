import { describe, expect, it, vi } from 'vitest';

vi.mock('@/server/services/market', () => ({ MarketService: vi.fn() }));

const { MarketWidgetSandboxRunner } = await import('../market');
const { WIDGET_SANDBOX_DEFAULT_TIMEOUT_MS, WIDGET_SANDBOX_MAX_TIMEOUT_MS } =
  await import('../types');

const request = {
  actor: { userId: 'user-1', workspaceId: 'ws-1' },
  env: { REPO: 'lobehub/lobehub' },
  network: { allow: ['api.github.com'] },
  runtime: 'node' as const,
  script: 'console.log("ok $HOME")',
  subject: { id: 'widget-1', kind: 'widget' as const },
};

const setup = (response: { data: unknown; retryAfterSeconds?: number; status: number }) => {
  const runSandbox = vi.fn(async () => response);
  const forActor = vi.fn(() => runSandbox);
  const runner = new MarketWidgetSandboxRunner({ isEnabled: () => true, runSandbox: forActor });
  return { forActor, runSandbox, runner };
};

const ran = {
  data: { durationMs: 1800, exitCode: 0, stderr: '', stdout: '{"type":"stat"}', timedOut: false },
  status: 200,
};

describe('MarketWidgetSandboxRunner', () => {
  it('forwards the run to Market as the widget actor and maps the result', async () => {
    const { forActor, runSandbox, runner } = setup(ran);

    await expect(runner.run(request)).resolves.toEqual({
      durationMs: 1800,
      exitCode: 0,
      stderr: '',
      stdout: '{"type":"stat"}',
      timedOut: false,
    });
    expect(forActor).toHaveBeenCalledWith({ userId: 'user-1', workspaceId: 'ws-1' });
    expect(runSandbox).toHaveBeenCalledWith(
      {
        egress: { allow: ['api.github.com'] },
        env: { REPO: 'lobehub/lobehub' },
        runtime: 'node',
        scriptB64: Buffer.from(request.script).toString('base64'),
        scriptEncoding: 'base64',
        subject: { id: 'widget-1', kind: 'widget' },
        timeoutMs: WIDGET_SANDBOX_DEFAULT_TIMEOUT_MS,
      },
      { signal: expect.any(AbortSignal) },
    );
  });

  it('clamps the timeout and keeps non-zero exits and timeouts as results', async () => {
    const { runSandbox, runner } = setup({
      data: { durationMs: 2000, exitCode: 124, stderr: '', stdout: '', timedOut: true },
      status: 200,
    });

    await expect(runner.run({ ...request, timeoutMs: 999_999 })).resolves.toMatchObject({
      exitCode: 124,
      timedOut: true,
    });
    expect((runSandbox.mock.calls[0] as any)[0].timeoutMs).toBe(WIDGET_SANDBOX_MAX_TIMEOUT_MS);
  });

  it('fails as not configured without trusted-client credentials, without calling Market', async () => {
    const forActor = vi.fn();
    const runner = new MarketWidgetSandboxRunner({ isEnabled: () => false, runSandbox: forActor });

    await expect(runner.run(request)).rejects.toMatchObject({ code: 'SANDBOX_NOT_CONFIGURED' });
    expect(forActor).not.toHaveBeenCalled();
  });

  it.each([
    [503, { error: 'sandbox_not_configured' }, 'SANDBOX_NOT_CONFIGURED'],
    [401, { error: 'invalid_token' }, 'SANDBOX_UNAUTHORIZED'],
    [403, { error: 'forbidden_client' }, 'SANDBOX_UNAUTHORIZED'],
    [400, { error: 'invalid_request', error_description: 'bad host' }, 'SANDBOX_BAD_REQUEST'],
    [503, { error: 'sandbox_unavailable' }, 'SANDBOX_ERROR'],
    [502, { error: 'sandbox_error' }, 'SANDBOX_ERROR'],
    [500, null, 'SANDBOX_ERROR'],
  ])('maps HTTP %d %j to %s', async (status, data, code) => {
    const { runner } = setup({ data, status });

    await expect(runner.run(request)).rejects.toMatchObject({ code, name: 'WidgetSandboxError' });
  });

  it('reports rate limiting with its retry hint', async () => {
    const { runner } = setup({
      data: { error: 'rate_limited' },
      retryAfterSeconds: 30,
      status: 429,
    });

    await expect(runner.run(request)).rejects.toMatchObject({
      code: 'SANDBOX_ERROR',
      message: expect.stringContaining('retry after 30s'),
    });
  });

  it('turns a network failure into SANDBOX_ERROR', async () => {
    const runSandbox = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });
    const runner = new MarketWidgetSandboxRunner({
      isEnabled: () => true,
      runSandbox: () => runSandbox,
    });

    await expect(runner.run(request)).rejects.toMatchObject({
      code: 'SANDBOX_ERROR',
      message: expect.stringContaining('fetch failed'),
    });
  });
});
