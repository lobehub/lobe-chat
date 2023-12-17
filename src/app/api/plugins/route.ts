import { createGatewayOnEdgeRuntime } from '@lobehub/chat-plugins-gateway';

import { PLUGINS_INDEX_URL } from '@/const/url';

export const POST = createGatewayOnEdgeRuntime({ pluginsIndexUrl: PLUGINS_INDEX_URL });
