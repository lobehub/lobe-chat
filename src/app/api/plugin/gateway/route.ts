import { createGatewayOnEdgeRuntime } from '@lobehub/chat-plugins-gateway';

import { parserPluginSettings } from '@/app/api/plugin/gateway/settings';
import { getServerConfig } from '@/config/server';

const { PLUGINS_INDEX_URL: pluginsIndexUrl, PLUGIN_SETTINGS } = getServerConfig();

const defaultPluginSettings = parserPluginSettings(PLUGIN_SETTINGS);

export const POST = createGatewayOnEdgeRuntime({
  defaultPluginSettings,
  pluginsIndexUrl,
});
