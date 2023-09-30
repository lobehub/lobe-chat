import { createLobeChatPluginGateway } from '@lobehub/chat-plugins-gateway';

import { PLUGINS_INDEX_URL } from '@/const/url';

export const runtime = 'edge';

export const POST = createLobeChatPluginGateway({ pluginsIndexUrl: PLUGINS_INDEX_URL });
