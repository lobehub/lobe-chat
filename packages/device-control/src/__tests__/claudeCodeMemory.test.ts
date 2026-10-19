import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  listClaudeCodeMemory,
  resolveClaudeCodeMemoryDir,
  resolveClaudeCodeProjectRoot,
  toClaudeCodeProjectKey,
} from '../claudeCodeMemory';

let sandbox: string;
let home: string;

const write = async (filePath: string, content: string) => {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
};

beforeEach(async () => {
  sandbox = await realpath(await mkdtemp(path.join(tmpdir(), 'cc-memory-')));
  home = path.join(sandbox, 'home');
  await mkdir(home, { recursive: true });
});

afterEach(async () => {
  await rm(sandbox, { force: true, recursive: true });
});

describe('toClaudeCodeProjectKey', () => {
  it('replaces every non-alphanumeric character with a dash', () => {
    expect(toClaudeCodeProjectKey('/home/ubuntu/develop/amazing/lobehub')).toBe(
      '-home-ubuntu-develop-amazing-lobehub',
    );
    expect(toClaudeCodeProjectKey('C:\\Users\\me\\my_app.v2')).toBe('C--Users-me-my-app-v2');
  });

  it('caps long keys at 200 characters and appends a hash of the full path', () => {
    const longPath = `/${'a'.repeat(250)}`;
    const key = toClaudeCodeProjectKey(longPath);

    expect(key.startsWith(`-${'a'.repeat(199)}-`)).toBe(true);
    expect(key).toMatch(/^-a{199}-[\da-z]+$/);
    expect(toClaudeCodeProjectKey(`/${'a'.repeat(251)}`)).not.toBe(key);
  });
});

describe('resolveClaudeCodeProjectRoot', () => {
  it('uses the git root for a subdirectory of a repository', async () => {
    const repo = path.join(sandbox, 'repo');
    await mkdir(path.join(repo, '.git'), { recursive: true });
    await mkdir(path.join(repo, 'packages', 'app'), { recursive: true });

    expect(await resolveClaudeCodeProjectRoot(path.join(repo, 'packages', 'app'))).toBe(repo);
  });

  it('maps a linked worktree back to the main checkout', async () => {
    const repo = path.join(sandbox, 'repo');
    const worktree = path.join(sandbox, 'repo-wt');
    const worktreeGitDir = path.join(repo, '.git', 'worktrees', 'repo-wt');
    await write(path.join(worktreeGitDir, 'commondir'), '../..\n');
    await write(path.join(worktree, '.git'), `gitdir: ${worktreeGitDir}\n`);

    expect(await resolveClaudeCodeProjectRoot(worktree)).toBe(repo);
  });

  it('keeps a submodule checkout as its own root', async () => {
    const submodule = path.join(sandbox, 'repo', 'vendor', 'lib');
    await mkdir(path.join(sandbox, 'repo', '.git', 'modules', 'lib'), { recursive: true });
    await write(path.join(submodule, '.git'), 'gitdir: ../../.git/modules/lib\n');

    expect(await resolveClaudeCodeProjectRoot(submodule)).toBe(submodule);
  });

  it('falls back to the directory itself outside git', async () => {
    const dir = path.join(sandbox, 'plain');
    await mkdir(dir, { recursive: true });

    expect(await resolveClaudeCodeProjectRoot(dir)).toBe(dir);
  });
});

describe('resolveClaudeCodeMemoryDir', () => {
  it('defaults to ~/.claude/projects/<key>/memory', async () => {
    const dir = path.join(sandbox, 'plain');
    await mkdir(dir, { recursive: true });

    expect(await resolveClaudeCodeMemoryDir(dir, { env: {}, homedir: home })).toBe(
      path.join(home, '.claude', 'projects', toClaudeCodeProjectKey(dir), 'memory'),
    );
  });

  it('honors CLAUDE_CONFIG_DIR', async () => {
    const dir = path.join(sandbox, 'plain');
    const configDir = path.join(sandbox, 'cc-config');
    await mkdir(dir, { recursive: true });

    expect(
      await resolveClaudeCodeMemoryDir(dir, {
        env: { CLAUDE_CONFIG_DIR: configDir },
        homedir: home,
      }),
    ).toBe(path.join(configDir, 'projects', toClaudeCodeProjectKey(dir), 'memory'));
  });

  it('honors autoMemoryDirectory from user settings', async () => {
    const dir = path.join(sandbox, 'plain');
    await mkdir(dir, { recursive: true });
    await write(
      path.join(home, '.claude', 'settings.json'),
      JSON.stringify({ autoMemoryDirectory: '~/notes/cc-memory' }),
    );

    expect(await resolveClaudeCodeMemoryDir(dir, { env: {}, homedir: home })).toBe(
      path.join(home, 'notes', 'cc-memory'),
    );
  });
});

describe('listClaudeCodeMemory', () => {
  const memoryDirFor = (dir: string) =>
    path.join(home, '.claude', 'projects', toClaudeCodeProjectKey(dir), 'memory');

  it('returns an empty list without approving anything when no memory exists', async () => {
    const dir = path.join(sandbox, 'plain');
    await mkdir(dir, { recursive: true });
    const approveProjectRoot = vi.fn(async () => {});

    const result = await listClaudeCodeMemory(
      { scope: dir },
      { approveProjectRoot },
      { env: {}, homedir: home },
    );

    expect(result).toEqual({ files: [], memoryDir: memoryDirFor(dir) });
    expect(approveProjectRoot).not.toHaveBeenCalled();
  });

  it('lists the index first, parses frontmatter and approves the memory directory', async () => {
    const dir = path.join(sandbox, 'plain');
    await mkdir(dir, { recursive: true });
    const memoryDir = memoryDirFor(dir);
    await write(path.join(memoryDir, 'MEMORY.md'), '- [Testing](testing.md) — hook\n');
    await write(
      path.join(memoryDir, 'testing.md'),
      [
        '---',
        'name: testing-rules',
        'description: Run focused vitest only',
        'metadata:',
        '  type: feedback',
        '---',
        'Never run the full suite.',
      ].join('\n'),
    );
    await write(path.join(memoryDir, 'about.md'), '---\ntype: user\n---\nA backend engineer.');
    await write(path.join(memoryDir, 'notes.txt'), 'ignored');
    await write(path.join(memoryDir, '.draft.md'), 'ignored');
    const approveProjectRoot = vi.fn(async () => {});

    const result = await listClaudeCodeMemory(
      { scope: dir },
      { approveProjectRoot },
      { env: {}, homedir: home },
    );

    expect(result.memoryDir).toBe(memoryDir);
    expect(result.files.map((file) => file.relativePath)).toEqual([
      'MEMORY.md',
      'about.md',
      'testing.md',
    ]);
    expect(result.files[0]).toMatchObject({ isIndex: true, name: 'MEMORY' });
    expect(result.files[1]).toMatchObject({ isIndex: false, name: 'about', type: 'user' });
    expect(result.files[2]).toMatchObject({
      description: 'Run focused vitest only',
      name: 'testing-rules',
      path: path.join(memoryDir, 'testing.md'),
      type: 'feedback',
    });
    expect(approveProjectRoot).toHaveBeenCalledWith(memoryDir);
  });
});
