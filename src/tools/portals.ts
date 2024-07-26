import { BuiltinPortal } from '@/types/tool';

import { ArtifactsManifest } from './artifacts';
import Artifacts from './artifacts/Portal';

export const BuiltinToolsPortals: Record<string, BuiltinPortal> = {
  [ArtifactsManifest.identifier]: Artifacts as BuiltinPortal,
};
