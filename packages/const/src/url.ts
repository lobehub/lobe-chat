import qs from 'query-string';
import urlJoin from 'url-join';

import { INBOX_SESSION_ID } from './session';

const isDev = process.env.NODE_ENV === 'development';

export const UTM_SOURCE = 'chat_preview';

export const OFFICIAL_URL = 'https://chat.imoogleai.xyz';
export const OFFICIAL_PREVIEW_URL = 'https://chat.imoogleai.xyz';
export const OFFICIAL_SITE = 'https://imoogleai.xyz';

export const OG_URL = '/og/cover.png?v=1';

export const CHANGELOG = 'https://imoogleai.xyz/changelog';
export const DOCKER_IMAGE = 'https://hub.docker.com/r/imoogleai/imoogle-ai';

export const DOCUMENTS = urlJoin(OFFICIAL_SITE, '/docs');
export const USAGE_DOCUMENTS = urlJoin(DOCUMENTS, '/usage');
export const SELF_HOSTING_DOCUMENTS = urlJoin(DOCUMENTS, '/self-hosting');
export const WEBRTC_SYNC_DOCUMENTS = urlJoin(SELF_HOSTING_DOCUMENTS, '/advanced/webrtc');
export const DATABASE_SELF_HOSTING_URL = urlJoin(SELF_HOSTING_DOCUMENTS, '/server-database');

// use this for the link
export const DOCUMENTS_REFER_URL = `${DOCUMENTS}?utm_source=${UTM_SOURCE}`;

export const WIKI_PLUGIN_GUIDE = urlJoin(USAGE_DOCUMENTS, '/plugins/development');
export const MANUAL_UPGRADE_URL = urlJoin(SELF_HOSTING_DOCUMENTS, '/advanced/upstream-sync');

export const BLOG = urlJoin(OFFICIAL_SITE, 'blog');

// ImoogleAI GitHub and support URLs
export const GITHUB = 'https://github.com/imoogleai/lobe-chat';
export const GITHUB_ISSUES = `${GITHUB}/issues/new/choose`;
export const FEEDBACK = `${GITHUB}/issues/new?assignees=&labels=%F0%9F%A4%AF+bug&projects=&template=BUG_REPORT.yml`;
export const AGENTS_INDEX_GITHUB = 'https://github.com/imoogleai/lobe-chat-agents';
export const AGENTS_INDEX_GITHUB_ISSUE = `${AGENTS_INDEX_GITHUB}/issues/new`;
export const MORE_MODEL_PROVIDER_REQUEST_URL = `${GITHUB}/issues/new?assignees=&labels=%E2%9C%A8+enhancement&projects=&template=REQUEST_MODEL.yml`;
export const MORE_FILE_PREVIEW_REQUEST_URL = `${GITHUB}/issues/new?assignees=&labels=%E2%9C%A8+enhancement&projects=&template=REQUEST_FEATURE.yml`;
export const WIKI = `${GITHUB}/wiki`;

export const ABOUT = OFFICIAL_SITE;
export const PRIVACY_URL = urlJoin(OFFICIAL_SITE, '/privacy');
export const TERMS_URL = urlJoin(OFFICIAL_SITE, '/terms');

export const PLUGINS_INDEX_URL = 'https://plugins.imoogleai.xyz';


export const SESSION_CHAT_URL = (id: string = INBOX_SESSION_ID, mobile?: boolean) =>
  qs.stringifyUrl({
    query: mobile ? { session: id, showMobileWorkspace: mobile } : { session: id },
    url: '/chat',
  });

export const imageUrl = (filename: string) => `/images/${filename}`;

export const LOBE_URL_IMPORT_NAME = 'settings';


export const mailTo = (email: string) => `mailto:${email}`;

export const AES_GCM_URL = 'https://datatracker.ietf.org/doc/html/draft-ietf-avt-srtp-aes-gcm-01';
export const BASE_PROVIDER_DOC_URL = 'https://imoogleai.xyz/docs/usage/providers';
export const SITEMAP_BASE_URL = isDev ? '/sitemap.xml/' : 'sitemap';
export const CHANGELOG_URL = urlJoin(OFFICIAL_SITE, 'changelog/versions');
