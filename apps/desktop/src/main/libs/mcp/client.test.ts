import { describe, expect, it } from 'vitest';

import { describeStdioSpawnFailure, MCPConnectionError } from './client';

describe('describeStdioSpawnFailure', () => {
  it('diagnoses ENOENT spawn errors with the command and install guidance', () => {
    const message = describeStdioSpawnFailure({
      command: 'kali-mcp',
      spawnCode: 'ENOENT',
    });

    expect(message).toContain('kali-mcp');
    expect(message).toContain('not found');
    expect(message).toContain('npx`/`.cmd`');
  });

  it('maps Windows numeric errno -4058 (ENOENT) to the not-found diagnosis', () => {
    // Windows spawn failures surface as a numeric errno without a symbolic code
    const message = describeStdioSpawnFailure({
      command: 'goatjg_mcp',
      errno: -4058,
    });

    expect(message).toContain('goatjg_mcp');
    expect(message).toContain('not found');
  });

  it('diagnoses permission errors', () => {
    const message = describeStdioSpawnFailure({
      command: '/usr/local/bin/kali-server',
      spawnCode: 'EACCES',
    });

    expect(message).toContain('not executable');
    expect(message).toContain('chmod +x');
  });

  it('detects the pt-BR "path not found" loader message from the real vent', () => {
    // Real-world stderr from vent msg_PjF7YECkH0nA67ddyY (Windows, pt-BR locale)
    const message = describeStdioSpawnFailure({
      command: 'mcpkali_note',
      exitCode: 1,
      stderr: 'O sistema não pode encontrar o caminho especificado.',
    });

    expect(message).toContain('mcpkali_note');
    expect(message).toContain('path not found');
    expect(message).toContain('Reinstall');
  });

  it('detects the zh-CN loader message', () => {
    const message = describeStdioSpawnFailure({
      command: 'kali_mcp',
      exitCode: 1,
      stderr: '系统找不到指定的路径。',
    });

    expect(message).toContain('path not found');
  });

  it('falls back to the exit-code diagnosis for unrelated stderr', () => {
    const message = describeStdioSpawnFailure({
      command: 'broken-server',
      exitCode: 127,
      stderr: 'some unrelated crash output',
    });

    expect(message).toContain('exited immediately with code 127');
  });

  it('falls back to the no-output diagnosis when nothing is captured', () => {
    const message = describeStdioSpawnFailure({ command: 'silent-server' });

    expect(message).toContain('produced no output');
    expect(message).toContain('silent-server');
  });
});

describe('MCPConnectionError', () => {
  it('carries stderr logs and a stable name for the existing enhancer pipeline', () => {
    const error = new MCPConnectionError('diagnosis text', ['line one', 'line two']);

    expect(error.name).toBe('MCPConnectionError');
    expect(error.message).toBe('diagnosis text');
    expect(error.stderrLogs).toEqual(['line one', 'line two']);
  });
});
