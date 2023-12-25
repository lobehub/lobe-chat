import { createGatewayOnEdgeRuntime } from '@lobehub/chat-plugins-gateway';

import { getServerConfig } from '@/config/server';

const pluginsIndexUrl = getServerConfig().PLUGINS_INDEX_URL;

export const POST = createGatewayOnEdgeRuntime({ pluginsIndexUrl });
