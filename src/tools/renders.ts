import { BuiltinRender } from '@/types/tool';

import { DalleManifest } from './dalle';
import DalleRender from './dalle/Render';
import { LocalFilesManifest } from './local-files';
import LocalFilesRender from './local-files/Render';
import { WebBrowsingManifest } from './web-browsing';
import WebBrowsing from './web-browsing/Render';

export const BuiltinToolsRenders: Record<string, BuiltinRender> = {
  [DalleManifest.identifier]: DalleRender as BuiltinRender,
  [WebBrowsingManifest.identifier]: WebBrowsing as BuiltinRender,
  [LocalFilesManifest.identifier]: LocalFilesRender as BuiltinRender,
};
