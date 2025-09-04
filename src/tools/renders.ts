import { BuiltinRender } from '@/types/tool';

import { ImageGeneratorManifest } from './image-generator';
import ImageGeneratorRender from './image-generator/Render';
import { LocalSystemManifest } from './local-system';
import LocalFilesRender from './local-system/Render';
import { WebBrowsingManifest } from './web-browsing';
import WebBrowsing from './web-browsing/Render';

export const BuiltinToolsRenders: Record<string, BuiltinRender> = {
  [ImageGeneratorManifest.identifier]: ImageGeneratorRender as BuiltinRender,
  [WebBrowsingManifest.identifier]: WebBrowsing as BuiltinRender,
  [LocalSystemManifest.identifier]: LocalFilesRender as BuiltinRender,
};
