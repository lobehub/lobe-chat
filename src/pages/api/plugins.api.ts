import { createLobeChatPluginGateway } from '@lobehub/chat-plugins-gateway';

import { PLUGINS_INDEX_URL } from '@/const/url';

export const config = {
  runtime: 'edge',
};

export default createLobeChatPluginGateway(PLUGINS_INDEX_URL);
