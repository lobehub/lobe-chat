import { readdir, readFile, realpath, stat } from 'node:fs/promises';
import * as os from 'node:os';
import path from 'node:path';

import matter from 'gray-matter';

import type {
  ClaudeCodeMemoryFile,
  ListClaudeCodeMemoryParams,
  ListClaudeCodeMemoryResult,
  WorkspaceScanDeps,
} from './types';

const MEMORY_INDEX_FILE = 'MEMORY.md';
const MAX_MEMORY_FILES = 500;
// Claude Code caps the sanitized project key and appends a hash beyond this.
const MAX_PROJECT_KEY_LENGTH = 200;

interface ClaudeCodeMemoryEnv {
  env?: NodeJS.ProcessEnv;
  homedir?: string;
}

/** Java-style 32-bit string hash, the one Claude Code suffixes long keys with. */
const hashString = (value: string): string => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  return Math.abs(hash).toString(36);
};

/** Claude Code's project key: every non-alphanumeric character becomes `-`. */
export const toClaudeCodeProjectKey = (projectRoot: string): string => {
  const key = projectRoot.replaceAll(/[^a-z0-9]/gi, '-');
  if (key.length <= MAX_PROJECT_KEY_LENGTH) return key;
  return `${key.slice(0, MAX_PROJECT_KEY_LENGTH)}-${hashString(projectRoot)}`;
};

const isFile = async (target: string) => {
  try {
    return (await stat(target)).isFile();
  } catch {
    return false;
  }
};

const isDirectory = async (target: string) => {
  try {
    return (await stat(target)).isDirectory();
  } catch {
    return false;
  }
};

/**
 * The root Claude Code keys memory by: the main checkout of the enclosing git
 * repository, so every worktree and subdirectory of one repo shares a single
 * memory directory. Outside git it is the directory itself.
 */
export const resolveClaudeCodeProjectRoot = async (cwd: string): Promise<string> => {
  const start = await realpath(cwd).catch(() => path.resolve(cwd));

  for (let dir = start; ; dir = path.dirname(dir)) {
    const dotGit = path.join(dir, '.git');
    if (await isDirectory(dotGit)) return dir;

    if (await isFile(dotGit)) {
      // A linked worktree: `.git` points at `<main>/.git/worktrees/<name>`,
      // whose `commondir` leads back to the main repository's `.git`.
      try {
        const pointer = (await readFile(dotGit, 'utf8'))
          .split('\n')
          .find((line) => line.startsWith('gitdir:'))
          ?.slice('gitdir:'.length)
          .trim();
        if (!pointer) return dir;
        const gitDir = path.resolve(dir, pointer);
        const commonDir = (await readFile(path.join(gitDir, 'commondir'), 'utf8')).trim();
        const mainGitDir = await realpath(path.resolve(gitDir, commonDir));
        return path.basename(mainGitDir) === '.git' ? path.dirname(mainGitDir) : dir;
      } catch {
        // No `commondir` (a submodule) or an unreadable pointer: the checkout is its own root.
        return dir;
      }
    }

    if (path.dirname(dir) === dir) return start;
  }
};

const expandHome = (value: string, homedir: string) =>
  value === '~' || value.startsWith('~/') || value.startsWith('~\\')
    ? path.join(homedir, value.slice(2))
    : value;

/** `autoMemoryDirectory` from the user's Claude Code settings, which overrides the default. */
const readMemoryDirectoryOverride = async (
  configDir: string,
  homedir: string,
): Promise<string | undefined> => {
  try {
    const settings = JSON.parse(await readFile(path.join(configDir, 'settings.json'), 'utf8'));
    const value = settings?.autoMemoryDirectory;
    if (typeof value !== 'string' || !value.trim()) return undefined;
    const resolved = path.resolve(expandHome(value.trim(), homedir));
    return path.isAbsolute(resolved) ? resolved : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Where Claude Code keeps auto memory for `cwd`:
 * `<CLAUDE_CONFIG_DIR or ~/.claude>/projects/<project key>/memory`, unless the
 * user settings point `autoMemoryDirectory` elsewhere.
 */
export const resolveClaudeCodeMemoryDir = async (
  cwd: string,
  { env = process.env, homedir = os.homedir() }: ClaudeCodeMemoryEnv = {},
): Promise<string> => {
  const configDir = env.CLAUDE_CONFIG_DIR?.trim() || path.join(homedir, '.claude');
  const override = await readMemoryDirectoryOverride(configDir, homedir);
  if (override) return override;

  const projectRoot = await resolveClaudeCodeProjectRoot(cwd);
  return path.join(configDir, 'projects', toClaudeCodeProjectKey(projectRoot), 'memory');
};

const readStringField = (data: Record<string, unknown> | undefined, key: string) => {
  const value = data?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

const parseMemoryFrontmatter = (raw: string) => {
  try {
    const { data } = matter(raw) as { data: Record<string, unknown> };
    const metadata =
      data.metadata && typeof data.metadata === 'object'
        ? (data.metadata as Record<string, unknown>)
        : undefined;
    return {
      description: readStringField(data, 'description'),
      name: readStringField(data, 'name'),
      type: readStringField(metadata, 'type') ?? readStringField(data, 'type'),
    };
  } catch {
    return {};
  }
};

const listMarkdownFiles = async (root: string): Promise<string[]> => {
  const results: string[] = [];
  const stack = [root];

  while (stack.length > 0 && results.length < MAX_MEMORY_FILES) {
    const dir = stack.pop()!;
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) results.push(fullPath);
      if (results.length >= MAX_MEMORY_FILES) break;
    }
  }

  return results;
};

const readMemoryFile = async (
  memoryDir: string,
  filePath: string,
): Promise<ClaudeCodeMemoryFile | null> => {
  try {
    const [raw, stats] = await Promise.all([readFile(filePath, 'utf8'), stat(filePath)]);
    const relativePath = path.relative(memoryDir, filePath).split(path.sep).join('/');
    const fields = parseMemoryFrontmatter(raw);
    return {
      description: fields.description,
      isIndex: relativePath === MEMORY_INDEX_FILE,
      name: fields.name ?? path.basename(filePath, path.extname(filePath)),
      path: filePath,
      relativePath,
      size: stats.size,
      type: fields.type,
      updatedAt: stats.mtimeMs,
    };
  } catch {
    return null;
  }
};

/**
 * List Claude Code's auto-memory files for a project: the `MEMORY.md` index
 * first, then each memory with its frontmatter. An absent directory yields an
 * empty list. Approves the directory for the host preview protocol so the
 * files open (and save) from the workspace panel.
 */
export const listClaudeCodeMemory = async (
  params: ListClaudeCodeMemoryParams,
  deps: WorkspaceScanDeps = {},
  memoryEnv?: ClaudeCodeMemoryEnv,
): Promise<ListClaudeCodeMemoryResult> => {
  const memoryDir = await resolveClaudeCodeMemoryDir(params.scope, memoryEnv);
  if (!(await isDirectory(memoryDir))) return { files: [], memoryDir };

  const paths = await listMarkdownFiles(memoryDir);
  const files = (await Promise.all(paths.map((file) => readMemoryFile(memoryDir, file))))
    .filter((file): file is ClaudeCodeMemoryFile => file !== null)
    .sort((a, b) =>
      a.isIndex === b.isIndex ? a.relativePath.localeCompare(b.relativePath) : a.isIndex ? -1 : 1,
    );

  if (files.length > 0) await deps.approveProjectRoot?.(memoryDir);

  return { files, memoryDir };
};
