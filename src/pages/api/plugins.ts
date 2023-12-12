import { createGatewayOnNodeRuntime } from '@lobehub/chat-plugins-gateway';

import { PLUGINS_INDEX_URL } from '@/const/url';

export default createGatewayOnNodeRuntime({ pluginsIndexUrl: PLUGINS_INDEX_URL });
