import { lambdaClient } from '@/libs/trpc/client';

import { IPluginService } from './type';

export class ServerService implements IPluginService {
  installPlugin: IPluginService['installPlugin'] = async (plugin) => {
    await lambdaClient.plugin.createOrInstallPlugin.mutate(plugin);
  };

  getInstalledPlugins: IPluginService['getInstalledPlugins'] = () => {
    return lambdaClient.plugin.getPlugins.query();
  };

  uninstallPlugin: IPluginService['uninstallPlugin'] = async (identifier) => {
    await lambdaClient.plugin.removePlugin.mutate({ id: identifier });
  };

  createCustomPlugin: IPluginService['createCustomPlugin'] = async (customPlugin) => {
    await lambdaClient.plugin.createPlugin.mutate({ ...customPlugin, type: 'customPlugin' });
  };

  updatePlugin: IPluginService['updatePlugin'] = async (id, value) => {
    await lambdaClient.plugin.updatePlugin.mutate({
      customParams: value.customParams,
      id,
      manifest: value.manifest,
      settings: value.settings,
    });
  };

  updatePluginManifest: IPluginService['updatePluginManifest'] = async (id, manifest) => {
    await lambdaClient.plugin.updatePlugin.mutate({ id, manifest });
  };

  removeAllPlugins: IPluginService['removeAllPlugins'] = async () => {
    await lambdaClient.plugin.removeAllPlugins.mutate();
  };

  updatePluginSettings: IPluginService['updatePluginSettings'] = async (id, settings, signal) => {
    await lambdaClient.plugin.updatePlugin.mutate({ id, settings }, { signal });
  };
}
