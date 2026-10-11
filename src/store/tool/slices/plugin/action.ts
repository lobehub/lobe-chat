import { type Schema, type ValidationResult } from '@cfworker/json-schema';
import { type LobeTool } from '@lobechat/types';
import { type SWRResponse } from 'swr';

import { MESSAGE_CANCEL_FLAT } from '@/const/message';
import {
  cacheScope,
  createReplicaSlice,
  type ReplicaLens,
  type ReplicaSyncResult,
} from '@/libs/replica';
import { subscribeCacheScope } from '@/libs/replica/cacheScopeEvents';
import { useClientDataSWR } from '@/libs/swr';
import { pluginService } from '@/services/plugin';
import { type StoreSetter } from '@/store/types';
import { type PluginInstallError } from '@/types/tool/plugin';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import { type ToolStore } from '../../store';
import {
  INSTALLED_PLUGINS_KEY,
  INSTALLED_PLUGINS_PARAMS,
  installedPluginsEntity,
  installedPluginsResource,
  type InstalledPluginsResponse,
  toInstalledPluginsProjection,
} from './projection';
import { pluginSelectors } from './selectors';

const n = setNamespace('plugin');

/**
 * The installed plugins keep their long-standing flat `installedPlugins` field
 * as the replica view, so every selector and direct reader keeps reading what it
 * did. The init flag gates `get`: before the first hydrate / replace the view
 * must read `undefined`, otherwise the empty default would block hydration from
 * storage.
 */
const installedPluginsLens: ReplicaLens<ToolStore, LobeTool[]> = {
  clear: () => ({ installedPlugins: [], isInstalledPluginsInit: false }),
  get: (state) => (state.isInstalledPluginsInit ? state.installedPlugins : undefined),
  keys: (state) => (state.isInstalledPluginsInit ? [INSTALLED_PLUGINS_KEY] : []),
  set: (_state, _key, data) =>
    data
      ? { installedPlugins: data, isInstalledPluginsInit: true }
      : { installedPlugins: [], isInstalledPluginsInit: false },
};

type Setter = StoreSetter<ToolStore>;
export const createPluginSlice = (set: Setter, get: () => ToolStore, _api?: unknown) =>
  new PluginActionImpl(set, get, _api);

export class PluginActionImpl {
  readonly #get: () => ToolStore;
  /** Responses of requests started at or before this sequence are dropped. */
  #droppedThroughSeq = 0;
  /** Start sequence of the last fetch, shared by `useSync` and `refreshPlugins`. */
  #fetchSeq = 0;
  readonly #installedPlugins;
  readonly #set: Setter;

  constructor(set: Setter, get: () => ToolStore, _api?: unknown) {
    void _api;
    this.#set = set;
    this.#get = get;
    this.#installedPlugins = createReplicaSlice(installedPluginsResource, {
      actionPrefix: n('installedPlugins'),
      entity: installedPluginsEntity,
      fetcher: () => this.#fetchInstalledPlugins(),
      get,
      merge: (incoming) => incoming.plugins,
      prepareHead: (incoming) => this.#admitResponse(incoming),
      set,
      stateKey: 'installedPluginsReplica',
      // Settings and connection parameters never reach IndexedDB.
      toPersisted: toInstalledPluginsProjection,
      view: installedPluginsLens,
    });

    // Tool assembly and execution read the installed plugins outside any
    // component, and `refreshPlugins` runs on routes that do not mount
    // `useFetchInstalledPlugins`. Without a mounted sync nothing would reset the
    // view on a workspace / account switch until the next dispatch, so the
    // previous identity's plugins (connection parameters included) would stay
    // runnable. Drop them the moment the scope changes. The store is an
    // app-lifetime singleton, so the subscription is never torn down.
    subscribeCacheScope((scope) => this.#installedPlugins.ensureScope(scope));
  }

  /**
   * Whether the list holds the server's full records. A list hydrated from the
   * persisted display projection has no settings and no connection parameters,
   * and an un-loaded list has nothing at all: a write merged over either would
   * replace the plugin's real settings / connection with a partial object.
   */
  #hasServerRecords = (): boolean =>
    this.#get().installedPluginsReplica.entries[INSTALLED_PLUGINS_KEY]?.source === 'server';

  /**
   * Load the server's full records before a write merges onto them. Rejects
   * when they cannot be loaded, so a write never falls back to the projection.
   */
  #loadServerRecords = async (): Promise<void> => {
    await this.#get().refreshPlugins();
    if (!this.#hasServerRecords())
      throw new Error('The installed plugins have not been loaded from the server');
  };

  /** Every fetch path goes through here, so all responses share one order. */
  #fetchInstalledPlugins = async (): Promise<InstalledPluginsResponse> => {
    const seq = ++this.#fetchSeq;
    const plugins = await pluginService.getInstalledPlugins();
    return { plugins, seq };
  };

  /**
   * Admit a response only when its request started after every response
   * already applied and after the latest mutation refresh. A mounted sync that
   * started before an uninstall must not re-add the plugin (and persist it)
   * when it settles late; an older refresh must not overwrite a newer one.
   */
  #admitResponse = (incoming: InstalledPluginsResponse): InstalledPluginsResponse | undefined => {
    if (incoming.seq <= this.#droppedThroughSeq) return undefined;
    this.#droppedThroughSeq = incoming.seq;
    return incoming;
  };

  checkPluginsIsInstalled = async (_plugins: string[]): Promise<void> => {
    // Old plugin system has been deprecated, skip auto-installation
  };

  /**
   * Fetch the installed plugins and confirm the replica with them. The painted
   * list stays on screen while the network answers.
   *
   * Imperative on purpose: install / uninstall / settings flows call it on
   * routes (e.g. the protocol-install popup) where no `useFetchInstalledPlugins`
   * is mounted, so revalidating the mounted sync queries would resolve without
   * fetching anything. The scope is captured before the request so a response
   * that lands after a workspace switch is dropped instead of written into the
   * next scope. Every mutation ends with this refresh, so it also retires the
   * requests already in flight (sync or refresh): they started before the
   * mutation and would paint the pre-mutation list. Rejects when the fetch
   * fails.
   */
  refreshPlugins = async (): Promise<void> => {
    const scope = cacheScope.get();
    this.#droppedThroughSeq = this.#fetchSeq;
    const response = await this.#fetchInstalledPlugins();

    this.#installedPlugins.replace(INSTALLED_PLUGINS_PARAMS, response, scope);
  };

  /**
   * Uninstall a plugin. The row stays until the server confirms (a detail pane
   * bound to it would otherwise blank and blink back on a rejected delete),
   * then leaves the loaded list *and* the persisted rows: `removeEntity` also
   * guards hydrates already in flight, so a reload never paints the uninstalled
   * plugin again.
   */
  uninstallPlugin = async (identifier: string): Promise<void> => {
    await pluginService.uninstallPlugin(identifier);
    this.#installedPlugins.removeEntity(identifier);

    await this.#get().refreshPlugins();
  };

  updateInstallLoadingState = (id: string, loading: boolean | undefined): void => {
    this.#set(
      { pluginInstallLoading: { ...this.#get().pluginInstallLoading, [id]: loading } },
      false,
      'updateInstallLoadingState',
    );
  };

  updateInstallError = (id: string, error: PluginInstallError | undefined): void => {
    this.#set(
      { pluginInstallErrors: { ...this.#get().pluginInstallErrors, [id]: error } },
      false,
      'updateInstallError',
    );
  };

  updateInstallMcpPlugin = async (id: string, value: any): Promise<void> => {
    // The server replaces `customParams` as a whole: merge onto the full record,
    // never the display projection (which has no connection parameters).
    if (!this.#hasServerRecords()) await this.#loadServerRecords();

    const installedPlugin = pluginSelectors.getInstalledPluginById(id)(this.#get());

    if (!installedPlugin) return;

    const customParams = {
      ...installedPlugin.customParams,
      mcp: merge(installedPlugin.customParams?.mcp, value),
    };

    await this.#installedPlugins.optimistic(
      INSTALLED_PLUGINS_KEY,
      (plugins) => plugins.map((p) => (p.identifier === id ? { ...p, customParams } : p)),
      () => pluginService.updatePlugin(id, { customParams: { mcp: customParams.mcp } }),
    );

    await this.#get().refreshPlugins();
  };

  updatePluginSettings = async <T>(
    id: string,
    settings: Partial<T>,
    options: { override?: boolean } = {},
  ): Promise<void> => {
    const { override } = options;

    // Publish this write's controller before anything is awaited, so a newer
    // call always sees — and aborts — the one still in flight.
    this.#get().updatePluginSettingsSignal?.abort(MESSAGE_CANCEL_FLAT);
    const controller = new AbortController();
    this.#set({ updatePluginSettingsSignal: controller }, false, n('updatePluginSettings/signal'));

    // The server replaces the whole settings object: merge onto the server's
    // settings, never the display projection (which has none), or saving one
    // field would erase the others. Synchronous once confirmed, so the row
    // updates in the same tick as the edit.
    if (!this.#hasServerRecords()) {
      await this.#loadServerRecords();
      // A newer write took over while the records were loading.
      if (controller.signal.aborted) return;
    }

    const previousSettings = pluginSelectors.getPluginSettingsById(id)(this.#get());
    const nextSettings = override ? settings : merge(previousSettings, settings);

    // The row shows the new settings immediately; a failed or aborted write
    // rolls it back to the confirmed value plus any newer write in flight.
    await this.#installedPlugins.optimistic(
      INSTALLED_PLUGINS_KEY,
      (plugins) => plugins.map((p) => (p.identifier === id ? { ...p, settings: nextSettings } : p)),
      () => pluginService.updatePluginSettings(id, nextSettings, controller.signal),
    );

    await this.#get().refreshPlugins();
  };

  /**
   * Fetch orchestration for the installed plugins: hydrate the persisted display
   * projection, then confirm the full records from the server on the same SWR
   * schedule as before. Read the list through `pluginSelectors`; this only
   * reports fetch flags.
   */
  useFetchInstalledPlugins = (enable: boolean): ReplicaSyncResult =>
    this.#installedPlugins.useSync(INSTALLED_PLUGINS_PARAMS, { enabled: enable });

  useCheckPluginsIsInstalled = (enable: boolean, plugins: string[]): SWRResponse => {
    return useClientDataSWR(enable ? plugins : null, this.#get().checkPluginsIsInstalled);
  };

  validatePluginSettings = async (identifier: string): Promise<ValidationResult | undefined> => {
    // Validate the full record: the display projection has no settings, so it
    // would report every required field as missing.
    const plugin = pluginSelectors.getInstalledPluginById(identifier)(this.#get());
    const manifest = plugin?.manifest;
    if (!manifest || !manifest.settings) return;
    const settings = pluginSelectors.getPluginSettingsById(identifier)(this.#get());

    // validate the settings
    const { Validator } = await import('@cfworker/json-schema');
    const validator = new Validator(manifest.settings as Schema);
    const result = validator.validate(settings);

    if (!result.valid) return { errors: result.errors, valid: false };

    return { errors: [], valid: true };
  };
}

export type PluginAction = Pick<PluginActionImpl, keyof PluginActionImpl>;
