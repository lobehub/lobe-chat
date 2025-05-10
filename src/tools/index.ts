import { isDesktop } from '@/const/version';
import { LobeBuiltinTool } from '@/types/tool';

import { ArtifactsManifest } from './artifacts';
import { DalleManifest } from './dalle';
import { LocalFilesManifest } from './local-files';
import { PollinationsManifest } from './pollinations';
import { WebBrowsingManifest } from './web-browsing';

export const builtinTools: LobeBuiltinTool[] = [
  {
    identifier: ArtifactsManifest.identifier,
    manifest: ArtifactsManifest,
    type: 'builtin',
  },
  {
    identifier: DalleManifest.identifier,
    manifest: DalleManifest,
    type: 'builtin',
  },
  {
    identifier: PollinationsManifest.identifier,
    manifest: PollinationsManifest,
    type: 'builtin',
  },
  {
    hidden: !isDesktop,
    identifier: LocalFilesManifest.identifier,
    manifest: LocalFilesManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: WebBrowsingManifest.identifier,
    manifest: WebBrowsingManifest,
    type: 'builtin',
  },
];
