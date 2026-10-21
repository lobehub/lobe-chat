import type { EnvironmentConfiguration } from '@lobechat/types';

/**
 * Left in the working directory once an environment has been applied to it. Its
 * presence is the whole of the state: a temporary sandbox loses it with the
 * sandbox and is initialized again next time; a folder on the drive keeps it,
 * so the folder is initialized once and is an ordinary folder from then on.
 */
export const SANDBOX_ENVIRONMENT_MARKER = '.lobe-environment';

/** Long enough for a shallow clone and a dependency install. */
export const SANDBOX_ENVIRONMENT_INIT_TIMEOUT_MS = 600_000;

/** Printed first by a run that did something, so a no-op is told apart without parsing. */
export const SANDBOX_ENVIRONMENT_RAN_LINE = '__lobe_environment_ran';

/**
 * What a working directory is initialized from: an environment's repository
 * and setup, and nothing else of it. Nothing is tracked once it has run.
 */
export interface SandboxInitialization {
  bootstrapCommand?: string;
  env?: Record<string, string>;
  environmentId: string;
  name: string;
  sources: { path?: string; ref?: string; url: string }[];
}

const shellQuote = (value: string): string => `'${value.replaceAll("'", String.raw`'\''`)}'`;

const ENV_NAME = /^[A-Z_]\w*$/i;

/**
 * The initialization an environment asks for, or `undefined` when it asks for
 * nothing — no repository and no setup — so a definition left empty does not
 * leave a marker in every folder it is picked for.
 *
 * Only git sources: a `files` source belongs to the release before folders on
 * the drive replaced it, and has no meaning in a folder that already is one.
 */
export const toSandboxInitialization = (environment: {
  configuration?: EnvironmentConfiguration | null;
  id: string;
  name: string;
}): SandboxInitialization | undefined => {
  const configuration = environment.configuration ?? {};
  const sources = (configuration.sources ?? []).flatMap((source) =>
    source.kind === 'git' && source.url
      ? [
          {
            url: source.url,
            ...(source.ref && { ref: source.ref }),
            ...(source.path && { path: source.path }),
          },
        ]
      : [],
  );
  const bootstrapCommand = configuration.bootstrapCommand?.trim() || undefined;
  if (sources.length === 0 && !bootstrapCommand) return undefined;

  return {
    environmentId: environment.id,
    name: environment.name,
    sources,
    ...(bootstrapCommand && { bootstrapCommand }),
    ...(configuration.env &&
      Object.keys(configuration.env).length > 0 && { env: configuration.env }),
  };
};

/** A destination inside the working directory, or `undefined` for a path that would leave it. */
const safeDestination = (path: string | undefined): string | undefined => {
  const value = (path ?? '.').trim() || '.';
  if (value.startsWith('/') || value.split('/').includes('..')) return undefined;

  return value;
};

/**
 * One idempotent shell command that applies an environment to the current
 * directory: clone each repository, run setup, leave the marker.
 *
 * - Already initialized (the marker is there) — a no-op that prints nothing.
 * - A folder that already holds files — not touched: cloning over someone's
 *   work would mix the two, and setup assumes the checkout it follows. The
 *   marker is written anyway, saying so, so the refusal is reported once
 *   rather than on every call.
 * - A clone or setup that fails — reported, and the marker records the
 *   failure: a broken setup is not rerun on every tool call. Deleting the
 *   marker is the way to try again.
 *
 * The variables are exported in a subshell, so they reach clone and setup and
 * not the commands the conversation runs afterwards.
 */
export const buildSandboxEnvironmentInitCommand = (init: SandboxInitialization): string => {
  const marker = shellQuote(SANDBOX_ENVIRONMENT_MARKER);
  const id = shellQuote(init.environmentId);
  const label = shellQuote(init.name);

  const exports = Object.entries(init.env ?? {})
    .filter(([key]) => ENV_NAME.test(key))
    .map(([key, value]) => `export ${key}=${shellQuote(value)}`);

  const clones = init.sources.map((source, index) => {
    const destination = safeDestination(source.path);
    if (!destination)
      return `echo ${shellQuote(`Skipped a repository with an unusable path: ${source.path}`)}`;

    const branch = source.ref ? ` --branch ${shellQuote(source.ref)}` : '';
    const url = shellQuote(source.url);
    // `git clone` refuses a directory that is not empty, and the working
    // directory already holds the marker's directory entry once anything has
    // been written; cloning beside it and moving the checkout in keeps the
    // repository's own `.git` at the destination.
    const staging = `"$__lobe_tmp/${index}"`;

    return [
      `git clone --depth 1${branch} ${url} ${staging}`,
      `mkdir -p ${shellQuote(destination)}`,
      `cp -a ${staging}/. ${shellQuote(destination)}/`,
    ].join(' && ');
  });

  const steps = [
    ...exports,
    `__lobe_tmp="$(mktemp -d)"`,
    ...clones,
    ...(init.bootstrapCommand ? [init.bootstrapCommand] : []),
  ];

  // Joined with `&&` inside one subshell, so the first failure stops what
  // follows and its status is the subshell's.
  const body = `( set -e; ${steps.join(' && ')} )`;

  return [
    `if [ ! -e ${marker} ]; then`,
    `  echo ${SANDBOX_ENVIRONMENT_RAN_LINE}`,
    `  if [ -n "$(ls -A . 2>/dev/null)" ]; then`,
    `    echo "skipped-not-empty ${init.environmentId}" > ${marker}`,
    `    echo "This folder already has files, so the environment "${label}" was not applied."`,
    `  elif ${body}; then`,
    `    echo ${id} > ${marker}`,
    `    echo "Initialized from the environment "${label}"."`,
    `  else`,
    `    __lobe_status=$?`,
    `    echo "failed ${init.environmentId}" > ${marker}`,
    `    echo "Initializing from the environment "${label}" failed (exit $__lobe_status). Delete ${SANDBOX_ENVIRONMENT_MARKER} to try again."`,
    `  fi`,
    `fi`,
  ].join('\n');
};

/** Whether the command's output says it ran, rather than finding the folder initialized. */
export const environmentInitRan = (stdout: string | undefined): boolean =>
  !!stdout && stdout.split('\n').some((line) => line.trim() === SANDBOX_ENVIRONMENT_RAN_LINE);

/** The run's own output, without the line that only says it ran. */
export const environmentInitReport = (stdout: string | undefined): string =>
  (stdout ?? '')
    .split('\n')
    .filter((line) => line.trim() !== SANDBOX_ENVIRONMENT_RAN_LINE)
    .join('\n')
    .trim();
