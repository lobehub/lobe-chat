import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FileService } from '@/server/services/file';
import type { MarketService } from '@/server/services/market';

import type { SandboxProvider } from '../types';

describe('normalizeSandboxCommandResult', () => {
  it('preserves recreation when the command fails inside a successful response', async () => {
    const { normalizeSandboxCommandResult } = await import('../service');

    expect(
      normalizeSandboxCommandResult({
        result: { exitCode: 1, stderr: 'missing input file', stdout: '' },
        sessionExpiredAndRecreated: true,
        success: true,
      }),
    ).toEqual({
      exitCode: 1,
      output: '',
      sessionExpiredAndRecreated: true,
      stderr: 'missing input file',
      success: false,
    });
  });

  it.each([undefined, false])('does not report recreation for flag %s', async (flag) => {
    const { normalizeSandboxCommandResult } = await import('../service');

    expect(
      normalizeSandboxCommandResult({
        result: { exitCode: 0, stdout: 'output' },
        sessionExpiredAndRecreated: flag,
        success: true,
      }),
    ).toEqual({ exitCode: 0, output: 'output', stderr: undefined, success: true });
  });

  it.each([true, false])('preserves recreation when transport success is %s', async (success) => {
    const { normalizeSandboxCommandResult } = await import('../service');

    expect(
      normalizeSandboxCommandResult({
        error: success ? undefined : { message: 'missing file' },
        result: { exitCode: 0, stdout: 'output' },
        sessionExpiredAndRecreated: true,
        success,
      }),
    ).toMatchObject({ sessionExpiredAndRecreated: true, success });
  });
});

describe('SandboxMiddlewareService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  describe('initializing from an environment', () => {
    const capabilities = {
      backgroundCommands: true,
      exportFile: true,
      files: true,
      languages: ['python'],
      persistentSession: true,
      shell: true,
      skillScripts: true,
    };
    const init = {
      environmentId: 'env-1',
      name: 'Hello',
      sources: [{ url: 'https://github.com/octocat/Hello-World' }],
    };

    const serviceWith = async (stdout: string) => {
      const { SandboxMiddlewareService: TestSandboxMiddlewareService } = await import('../service');
      const callTool = vi.fn(async (name: string, params: Record<string, unknown>) =>
        String(params.command).includes('__lobe_environment_ran')
          ? { result: { exitCode: 0, stderr: '', stdout }, success: true }
          : { result: { exitCode: 0, stderr: '', stdout: `ran ${name}` }, success: true },
      );
      const provider = {
        callTool,
        capabilities,
        exportFileToUploadUrl: vi.fn(),
        kind: 'market',
      } satisfies SandboxProvider;
      const service = new TestSandboxMiddlewareService(provider, {
        marketService: {} as MarketService,
        sandboxInitialization: init,
        topicId: 'topic-1',
        userId: 'user-1',
      });

      return { callTool, service };
    };

    it('applies the environment once, before the first tool, and says so in the first shell result', async () => {
      const { callTool, service } = await serviceWith(
        '__lobe_environment_ran\nInitialized from the environment Hello.\n',
      );

      const first = await service.callTool('runCommand', { command: 'ls' });
      await service.callTool('runCommand', { command: 'pwd' });

      const commands = callTool.mock.calls.map(([, params]) => String(params.command));
      expect(commands.filter((command) => command.includes('__lobe_environment_ran'))).toHaveLength(
        1,
      );
      expect(commands[0]).toContain('git clone');
      expect((first.result as { stdout: string }).stdout).toBe(
        '[environment] Initialized from the environment Hello.\n\nran runCommand',
      );
    });

    it('keeps the report for the first shell result when an earlier call only read files', async () => {
      const { service } = await serviceWith(
        '__lobe_environment_ran\nInitializing from the environment Hello failed (exit 7).\n',
      );

      const read = await service.callTool('listFiles', { path: '.' });
      const shell = await service.callTool('runCommand', { command: 'ls' });
      const later = await service.callTool('runCommand', { command: 'pwd' });

      expect(JSON.stringify(read.result)).not.toContain('[environment]');
      expect((shell.result as { stdout: string }).stdout).toBe(
        '[environment] Initializing from the environment Hello failed (exit 7).\n\nran runCommand',
      );
      expect((later.result as { stdout: string }).stdout).toBe('ran runCommand');
    });

    it('says so when the initializer could not reach the sandbox, rather than nothing', async () => {
      const { callTool, service } = await serviceWith('');
      callTool.mockRejectedValueOnce(new Error('gateway down'));

      const result = await service.callTool('runCommand', { command: 'ls' });

      expect((result.result as { stdout: string }).stdout).toBe(
        '[environment] The environment "Hello" could not be applied: the sandbox did not respond. It will be tried again on the next command.\n\nran runCommand',
      );
    });

    it('treats a failed call that printed nothing as unreachable, not as initialized', async () => {
      const { callTool, service } = await serviceWith('');
      callTool.mockResolvedValueOnce({ result: null, success: false } as any);

      const result = await service.callTool('runCommand', { command: 'ls' });

      expect((result.result as { stdout: string }).stdout).toContain('could not be applied');
    });

    it('adds nothing to the result when the directory was already initialized', async () => {
      const { service } = await serviceWith('');

      const result = await service.callTool('runCommand', { command: 'ls' });

      expect((result.result as { stdout: string }).stdout).toBe('ran runCommand');
    });
  });

  it('uploads provider exports through the shared file record flow', async () => {
    const { SandboxMiddlewareService: TestSandboxMiddlewareService } = await import('../service');
    const exportFileToUploadUrl = vi.fn(async () => ({
      result: { mime_type: 'text/plain' },
      success: true,
    }));
    const provider = {
      capabilities: {
        backgroundCommands: true,
        exportFile: true,
        files: true,
        languages: ['python'],
        persistentSession: true,
        shell: true,
        skillScripts: true,
      },
      callTool: vi.fn(),
      exportFileToUploadUrl,
      kind: 'onlyboxes',
    } satisfies SandboxProvider;

    const fileService = {
      createPreSignedUpload: vi.fn(async () => ({
        headers: { 'x-amz-acl': 'public-read' },
        url: 'https://uploads.example.com/put',
      })),
      createFileRecord: vi.fn(async () => ({ fileId: 'file-1', url: '/f/file-1' })),
      getFileMetadata: vi.fn(async () => ({
        contentLength: 42,
        contentType: 'text/csv',
      })),
    } as unknown as FileService;

    const service = new TestSandboxMiddlewareService(provider, {
      fileService,
      marketService: {} as MarketService,
      topicId: 'topic-1',
      userId: 'user-1',
    });

    const result = await service.exportAndUploadFile('/workspace/result.csv', 'result.csv');

    expect(result).toMatchObject({
      fileId: 'file-1',
      filename: 'result.csv',
      mimeType: 'text/csv',
      size: 42,
      success: true,
      url: '/f/file-1',
    });
    expect(exportFileToUploadUrl).toHaveBeenCalledWith({
      filename: 'result.csv',
      path: '/workspace/result.csv',
      uploadHeaders: { 'x-amz-acl': 'public-read' },
      uploadUrl: 'https://uploads.example.com/put',
    });
    expect(fileService.createFileRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        fileType: 'text/csv',
        name: 'result.csv',
        size: 42,
        url: expect.stringMatching(
          /^code-interpreter-exports\/\d{4}-\d{2}-\d{2}\/topic-1\/result\.csv$/,
        ),
      }),
    );
  });

  it('keys the object on storageName while keeping filename as the display name', async () => {
    const { SandboxMiddlewareService: TestSandboxMiddlewareService } = await import('../service');
    const exportFileToUploadUrl = vi.fn(async () => ({
      result: { mime_type: 'text/csv' },
      success: true,
    }));
    const provider = {
      capabilities: {
        backgroundCommands: true,
        exportFile: true,
        files: true,
        languages: ['python'],
        persistentSession: true,
        shell: true,
        skillScripts: true,
      },
      callTool: vi.fn(),
      exportFileToUploadUrl,
      kind: 'onlyboxes',
    } satisfies SandboxProvider;

    const fileService = {
      createPreSignedUpload: vi.fn(async () => ({
        headers: {},
        url: 'https://uploads.example.com/put',
      })),
      createFileRecord: vi.fn(async () => ({ fileId: 'file-1', url: '/f/file-1' })),
      getFileMetadata: vi.fn(async () => ({ contentLength: 42, contentType: 'text/csv' })),
    } as unknown as FileService;

    const service = new TestSandboxMiddlewareService(provider, {
      fileService,
      marketService: {} as MarketService,
      topicId: 'topic-1',
      userId: 'user-1',
    });

    const result = await service.exportAndUploadFile('/workspace/result.csv', 'result.csv', {
      storageName: 'deadbeefdeadbeef-result.csv',
    });

    // The returned/display name is the clean basename, never the storage key.
    expect(result.filename).toBe('result.csv');
    // The storage key (both the presigned upload key and the file record url)
    // uses storageName so the object is collision-proof.
    expect(fileService.createPreSignedUpload).toHaveBeenCalledWith(
      expect.stringMatching(
        /^code-interpreter-exports\/\d{4}-\d{2}-\d{2}\/topic-1\/deadbeefdeadbeef-result\.csv$/,
      ),
    );
    expect(fileService.createFileRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'result.csv',
        url: expect.stringMatching(/\/deadbeefdeadbeef-result\.csv$/),
      }),
    );
    // The provider still receives the display filename (unchanged contract).
    expect(exportFileToUploadUrl).toHaveBeenCalledWith(
      expect.objectContaining({ filename: 'result.csv', path: '/workspace/result.csv' }),
    );
  });

  it('normalizes provider export failures before storage metadata is read', async () => {
    const provider = {
      capabilities: {
        backgroundCommands: true,
        exportFile: true,
        files: true,
        languages: ['python'],
        persistentSession: true,
        shell: true,
        skillScripts: true,
      },
      callTool: vi.fn(),
      exportFileToUploadUrl: vi.fn(async () => ({
        error: { message: 'no such file', name: 'not_found' },
        success: false,
      })),
      kind: 'onlyboxes',
    } satisfies SandboxProvider;

    const { SandboxMiddlewareService } = await import('../service');
    const fileService = {
      createFileRecord: vi.fn(),
      createPreSignedUpload: vi.fn(async () => ({ url: 'https://uploads.example.com/put' })),
      getFileMetadata: vi.fn(),
    } as unknown as FileService;

    const service = new SandboxMiddlewareService(provider, {
      fileService,
      marketService: {} as MarketService,
      topicId: 'topic-1',
      userId: 'user-1',
    });

    const result = await service.exportAndUploadFile('/workspace/missing.txt', 'missing.txt');

    expect(result).toMatchObject({
      error: { message: 'no such file', name: 'not_found' },
      filename: 'missing.txt',
      success: false,
    });
    expect(fileService.getFileMetadata).not.toHaveBeenCalled();
    expect(fileService.createFileRecord).not.toHaveBeenCalled();
  });
});
