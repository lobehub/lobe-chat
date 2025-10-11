import { BuiltinPlaceholder } from '@lobechat/types';

import { WebBrowsingManifest } from './web-browsing';
import WebBrowsing from './web-browsing/Placeholder';

export const BuiltinToolPlaceholders: Record<string, BuiltinPlaceholder> = {
  [WebBrowsingManifest.identifier]: WebBrowsing as BuiltinPlaceholder,
};
