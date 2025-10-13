import { BuiltinPlaceholder } from '@lobechat/types';

import { LocalSystemManifest } from './local-system';
import LocalSystem from './local-system/Placeholder';
import { WebBrowsingManifest } from './web-browsing';
import WebBrowsing from './web-browsing/Placeholder';

export const BuiltinToolPlaceholders: Record<string, BuiltinPlaceholder> = {
  [WebBrowsingManifest.identifier]: WebBrowsing as BuiltinPlaceholder,
  [LocalSystemManifest.identifier]: LocalSystem as BuiltinPlaceholder,
};
