/** Device capability advertised by a CLI that can run `lh hetero exec --codex-app-server`. */
export const CODEX_APP_SERVER_RUNTIME = 'codex-app-server-v1';

/** How a connected device runs one Codex turn. */
export type CodexDeviceRuntime =
  /** Keep the existing `codex exec` path and its transcript recovery. */
  | { kind: 'exec' }
  /** The turn must not run; the caller settles it as a dispatch error. */
  | { kind: 'error'; message: string }
  | {
      /** Extra `lh hetero exec` wrapper flags. */
      args: string[];
      kind: 'native';
    };

export interface ResolveCodexDeviceRuntimeParams {
  /** `api` auth uses the hosted provider binding, which has no native app-server session. */
  authMode?: string;
  heteroType: string;
  /** Reads the user's Labs `enableCodexAppServer` preference. */
  isAppServerLabEnabled: () => Promise<boolean>;
  /** Reads the live connection's advertised runtimes, never merged DB metadata. */
  querySupportedRuntimes: () => Promise<readonly string[] | undefined>;
}

/**
 * Chooses between `codex exec` and the native app-server runtime for a device run.
 *
 * Use when:
 * - Dispatching a Codex turn to a connected device.
 * Expects:
 * - The live connection reports `codex-app-server-v1` only after a native handshake.
 * Returns:
 * - `exec` for every run unless the user enabled the Labs app-server runtime and the
 *   device supports it; native runs keep transcript recovery.
 *
 * Call stack:
 *
 * dispatchHeteroAgent
 *   -> {@link resolveCodexDeviceRuntime}
 */
export const resolveCodexDeviceRuntime = async (
  params: ResolveCodexDeviceRuntimeParams,
): Promise<CodexDeviceRuntime> => {
  if (params.heteroType !== 'codex') return { kind: 'exec' };
  const nativeAuth = params.authMode !== 'api';

  // Codex topics keep `codex exec` by default. The app-server runtime is opt-in through
  // the same Labs preference Desktop local runs use; it records native turn IDs.
  if (!nativeAuth || !(await params.isAppServerLabEnabled())) return { kind: 'exec' };
  const runtimes = await params.querySupportedRuntimes();
  if (!runtimes?.includes(CODEX_APP_SERVER_RUNTIME)) return { kind: 'exec' };
  return { args: ['--codex-app-server'], kind: 'native' };
};
