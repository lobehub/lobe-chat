import { CloudSandboxExecutionRuntime } from '@lobechat/builtin-tool-cloud-sandbox/executionRuntime';
import type { ServiceResult } from '@lobechat/tool-runtime';
import { ComputerRuntime } from '@lobechat/tool-runtime';
import { describe, expect, it, vi } from 'vitest';

class TestComputerRuntime extends ComputerRuntime {
  constructor(private readonly serviceResult: ServiceResult) {
    super();
  }

  protected async callService(): Promise<ServiceResult> {
    return this.serviceResult;
  }
}

describe.each(['runCommand', 'executeCode', 'getCommandOutput'] as const)(
  'CloudSandbox %s recreation',
  (api) => {
    it.each([true, false])('surfaces recreation with transport success %s', async (success) => {
      const runtime = new CloudSandboxExecutionRuntime({
        callTool: vi.fn().mockResolvedValue({
          error: success ? undefined : { message: 'missing input file' },
          result: { exitCode: success ? 0 : 1, output: 'partial output' },
          sessionExpiredAndRecreated: true,
          success,
        }),
        exportAndUploadFile: vi.fn(),
      });

      const result =
        api === 'runCommand'
          ? await runtime.runCommand({ command: 'cat /tmp/input' })
          : api === 'executeCode'
            ? await runtime.executeCode({ code: 'print("output")' })
            : await runtime.getCommandOutput({ commandId: 'task-1' });

      expect(result.content).toContain('sandbox session expired and was recreated');
      expect(result.content).toContain(success ? 'partial output' : 'missing input file');
      expect(result.state).toMatchObject({ sessionExpiredAndRecreated: true, success });
    });
  },
);

describe('ComputerRuntime command status mapping', () => {
  it('uses command result success when command transport succeeds with non-zero exit code', async () => {
    const runtime = new TestComputerRuntime({
      result: {
        exitCode: 2,
        stderr: 'failed',
        stdout: 'partial',
        success: false,
      },
      success: true,
    });

    const result = await runtime.runCommand({ command: 'exit 2' });

    expect(result).toMatchObject({
      state: {
        exitCode: 2,
        stderr: 'failed',
        stdout: 'partial',
        success: false,
      },
      success: true,
    });
  });

  it('uses command output result success when background task transport succeeds', async () => {
    const runtime = new TestComputerRuntime({
      result: {
        stdout: 'failed',
        success: false,
      },
      success: true,
    });

    const result = await runtime.getCommandOutput({ commandId: 'task-1' });

    expect(result).toMatchObject({
      state: {
        stdout: 'failed',
        success: false,
      },
      success: true,
    });
  });
});
