import { chmod, mkdir, mkdtemp, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import {
  buildHeterogeneousPrompt,
  lobeHubCliGuideBlock,
  lobeHubCliSkillBody,
  lobeHubCliSkillDescription,
} from '../protocol';
import { prepareClaudeCodeLobeHubCli, resolveLobeHubCliPluginDir } from './lobeHubCliPlugin';

const posixOnly = process.platform === 'win32' ? it.skip : it;

describe('LobeHub CLI plugin', () => {
  let parent: string;
  let rootDir: string;

  beforeEach(async () => {
    parent = await mkdtemp(path.join(tmpdir(), 'lobehub-cli-plugin-test-'));
    rootDir = path.join(parent, 'root');
  });

  afterEach(async () => {
    await rm(parent, { force: true, recursive: true });
  });

  it('writes a Claude Code plugin whose skill frontmatter parses', async () => {
    const pluginDir = await resolveLobeHubCliPluginDir({ rootDir });

    const manifest = JSON.parse(
      await readFile(path.join(pluginDir!, '.claude-plugin/plugin.json'), 'utf8'),
    );
    expect(manifest.name).toBe('lobehub');

    const skill = await readFile(path.join(pluginDir!, 'skills/lobehub/SKILL.md'), 'utf8');
    const [, frontmatter, body] = skill.split(/^---$/m);
    // The description contains `: `, which an unquoted YAML scalar rejects.
    expect(parse(frontmatter)).toEqual({
      description: lobeHubCliSkillDescription,
      name: 'lobehub',
    });
    expect(body.trim()).toBe(lobeHubCliSkillBody);
  });

  it('reuses one directory for the same guide', async () => {
    const first = await resolveLobeHubCliPluginDir({ rootDir });
    const second = await resolveLobeHubCliPluginDir({ rootDir });

    expect(second).toBe(first);
  });

  it('rewrites a plugin a temp-directory cleanup removed', async () => {
    const pluginDir = await resolveLobeHubCliPluginDir({ rootDir });
    await rm(pluginDir!, { force: true, recursive: true });

    await expect(resolveLobeHubCliPluginDir({ rootDir })).resolves.toBe(pluginDir);
    await expect(readFile(path.join(pluginDir!, 'skills/lobehub/SKILL.md'))).resolves.toBeTruthy();
  });

  posixOnly('refuses a root other users can write into', async () => {
    await mkdir(rootDir, { mode: 0o700 });
    await chmod(rootDir, 0o777);

    await expect(resolveLobeHubCliPluginDir({ rootDir })).resolves.toBeUndefined();
  });

  posixOnly('refuses a root that is a symlink', async () => {
    const elsewhere = path.join(parent, 'elsewhere');
    await mkdir(elsewhere, { mode: 0o700 });
    await symlink(elsewhere, rootDir);

    await expect(resolveLobeHubCliPluginDir({ rootDir })).resolves.toBeUndefined();
  });

  describe('prepareClaudeCodeLobeHubCli', () => {
    const prompt = buildHeterogeneousPrompt({
      isNewSession: true,
      prompt: 'fix the failing test',
      systemContext: 'selected code',
    });

    it('swaps the in-message guide for the plugin and keeps everything else', async () => {
      const delivery = await prepareClaudeCodeLobeHubCli(prompt, [], { rootDir });

      expect(prompt).toContainEqual(lobeHubCliGuideBlock);
      expect(delivery.prompt).toEqual([
        { text: 'selected code', type: 'text' },
        { text: 'fix the failing test', type: 'text' },
      ]);
      expect(delivery.args).toEqual(['--plugin-dir', delivery.pluginDir]);
    });

    it('keeps the guide in the prompt when skills are disabled', async () => {
      const delivery = await prepareClaudeCodeLobeHubCli(prompt, ['--disable-slash-commands'], {
        rootDir,
      });

      expect(delivery).toEqual({ args: [], prompt });
    });

    posixOnly('keeps the guide in the prompt when the plugin cannot be written', async () => {
      await mkdir(rootDir, { mode: 0o700 });
      await chmod(rootDir, 0o755);

      const delivery = await prepareClaudeCodeLobeHubCli(prompt, [], { rootDir });

      expect(delivery).toEqual({ args: [], prompt });
    });
  });
});
