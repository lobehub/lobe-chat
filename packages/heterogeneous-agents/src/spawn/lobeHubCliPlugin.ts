import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { AgentPromptInput } from '../protocol';
import {
  LOBEHUB_CLI_GUIDE_CONTEXT,
  lobeHubCliSkillBody,
  lobeHubCliSkillDescription,
} from '../protocol/lobeHubCliGuide';

/**
 * Delivers the `lh` guide to Claude Code as a native skill instead of text in
 * the user's turn (lobehub/lobehub#20675).
 *
 * Claude Code loads a plugin directory for one session with `--plugin-dir`
 * (the Agent SDK's `plugins` option), leaving the user's own `~/.claude`
 * untouched. Only the skill's description stays in context; the body is read
 * when a request concerns LobeHub. A plugin is passed on every spawn, resumed
 * turns included, so it never needs the once-per-session bookkeeping the
 * in-message copy does — and nothing lands in the CLI's transcript as words
 * the user said.
 */

export const LOBEHUB_CLI_PLUGIN_NAME = 'lobehub';
export const LOBEHUB_CLI_SKILL_NAME = 'lobehub';

/** `claude --disable-slash-commands` disables every skill, plugin ones included. */
const CLAUDE_CODE_DISABLE_SKILLS_FLAG = '--disable-slash-commands';

/** Plugin files keyed by their path inside the plugin root. */
export const buildLobeHubCliPluginFiles = (): Record<string, string> => ({
  '.claude-plugin/plugin.json': `${JSON.stringify(
    {
      description: 'The LobeHub CLI (`lh`) for agents running inside a LobeHub conversation.',
      name: LOBEHUB_CLI_PLUGIN_NAME,
      version: '1.0.0',
    },
    null,
    2,
  )}\n`,
  // A JSON string is a valid YAML double-quoted scalar, and the description
  // contains `: `, which a plain YAML scalar cannot.
  [`skills/${LOBEHUB_CLI_SKILL_NAME}/SKILL.md`]: [
    '---',
    `name: ${LOBEHUB_CLI_SKILL_NAME}`,
    `description: ${JSON.stringify(lobeHubCliSkillDescription)}`,
    '---',
    '',
    lobeHubCliSkillBody,
    '',
  ].join('\n'),
});

const defaultRootDir = () => {
  const owner = typeof process.getuid === 'function' ? String(process.getuid()) : 'user';
  return path.join(tmpdir(), `lobehub-cli-plugin-${owner}`);
};

/**
 * The root may sit in a shared temp directory, and whatever a plugin there says
 * is read by the agent as instructions. Only a real directory this user owns
 * and nobody else can write into is used.
 */
const assertPrivateRoot = async (rootDir: string) => {
  await mkdir(rootDir, { mode: 0o700, recursive: true });
  const stat = await lstat(rootDir);
  if (!stat.isDirectory()) throw new Error(`${rootDir} is not a directory`);
  if (typeof process.getuid !== 'function') return;
  if (stat.uid !== process.getuid()) throw new Error(`${rootDir} belongs to another user`);
  if ((stat.mode & 0o077) !== 0) throw new Error(`${rootDir} is accessible to other users`);
};

const pathExists = async (target: string) =>
  lstat(target).then(
    () => true,
    () => false,
  );

const materializePlugin = async (rootDir: string): Promise<string> => {
  const files = buildLobeHubCliPluginFiles();
  // Content-addressed: every run of the same guide shares one directory, so a
  // path an earlier turn saw stays valid, and a changed guide never reuses it.
  const digest = createHash('sha256').update(JSON.stringify(files)).digest('hex').slice(0, 16);
  const pluginDir = path.join(rootDir, digest);

  await assertPrivateRoot(rootDir);
  if (await pathExists(path.join(pluginDir, `skills/${LOBEHUB_CLI_SKILL_NAME}/SKILL.md`))) {
    return pluginDir;
  }

  // Written aside and renamed into place, so a concurrent run never loads a
  // half-written plugin.
  const stagingDir = path.join(rootDir, `.staging-${randomUUID()}`);
  try {
    for (const [relativePath, content] of Object.entries(files)) {
      const target = path.join(stagingDir, relativePath);
      await mkdir(path.dirname(target), { mode: 0o700, recursive: true });
      await writeFile(target, content, { mode: 0o600 });
    }
    await rename(stagingDir, pluginDir).catch(async (error) => {
      // Another run finished first; its copy is identical.
      if (!(await pathExists(pluginDir))) throw error;
    });
    return pluginDir;
  } finally {
    await rm(stagingDir, { force: true, recursive: true });
  }
};

/**
 * Directory of the plugin carrying the guide, written on first use and checked
 * on every spawn — a long-lived desktop process outlives temp-directory
 * cleanups. Resolves `undefined` when it cannot be written safely; callers then
 * keep the guide in the prompt, so a run never loses it.
 */
export const resolveLobeHubCliPluginDir = (
  options: { rootDir?: string } = {},
): Promise<string | undefined> =>
  materializePlugin(options.rootDir ?? defaultRootDir()).catch(() => undefined);

/** Drop the in-message copy of the guide, which a native skill now carries. */
export const omitLobeHubCliGuide = (prompt: AgentPromptInput): AgentPromptInput =>
  typeof prompt === 'string'
    ? prompt
    : prompt.filter(
        (block) => block.type !== 'text' || block.context !== LOBEHUB_CLI_GUIDE_CONTEXT,
      );

export interface ClaudeCodeLobeHubCliDelivery {
  /** Spawn arguments loading the plugin; empty when the guide stays in the prompt. */
  args: string[];
  /** The plugin root, for the Agent SDK's `plugins` option. */
  pluginDir?: string;
  /** The prompt to send, without the in-message guide when the plugin carries it. */
  prompt: AgentPromptInput;
}

/**
 * Prepare a Claude Code spawn to carry the guide as a skill. Every Claude Code
 * launch inside a LobeHub conversation goes through this, so the plugin and the
 * removal of the in-message copy always come together.
 *
 * @param args the spawn's own arguments; skills disabled there keep the guide in
 * the prompt.
 */
export const prepareClaudeCodeLobeHubCli = async (
  prompt: AgentPromptInput,
  args: readonly string[] = [],
  options: { rootDir?: string } = {},
): Promise<ClaudeCodeLobeHubCliDelivery> => {
  if (args.includes(CLAUDE_CODE_DISABLE_SKILLS_FLAG)) return { args: [], prompt };

  const pluginDir = await resolveLobeHubCliPluginDir(options);
  if (!pluginDir) return { args: [], prompt };

  return { args: ['--plugin-dir', pluginDir], pluginDir, prompt: omitLobeHubCliGuide(prompt) };
};
