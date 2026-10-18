import path from 'node:path';

import { getCliWrapperDir } from './generateCliWrapper';

/**
 * Absolute path of the `lh` this desktop build ships, for an agent whose shell
 * resolves an older global install first. Login shells (`zsh -lc`, which Codex
 * uses) re-run the user's profile and can move a pnpm/npm bin dir back in front
 * of the PATH entry below, so the path alone is the reliable handle.
 */
export const LOBEHUB_CLI_ENV = 'LOBEHUB_CLI';

const CLI_WRAPPER_NAME = process.platform === 'win32' ? 'lh.cmd' : 'lh';

export const getEmbeddedCliPath = (wrapperDir: string = getCliWrapperDir()): string =>
  path.join(wrapperDir, CLI_WRAPPER_NAME);

/**
 * Spawn env for an external agent: the bundled CLI's wrapper dir goes to the
 * front of PATH (the app only appends it, so a stale global `lh` wins) and
 * `LOBEHUB_CLI` names the wrapper itself.
 */
export const withEmbeddedCliEnv = (
  env: NodeJS.ProcessEnv,
  wrapperDir: string = getCliWrapperDir(),
): NodeJS.ProcessEnv => {
  const rest = (env.PATH ?? '').split(path.delimiter).filter((dir) => dir && dir !== wrapperDir);
  return {
    ...env,
    [LOBEHUB_CLI_ENV]: getEmbeddedCliPath(wrapperDir),
    PATH: [wrapperDir, ...rest].join(path.delimiter),
  };
};
