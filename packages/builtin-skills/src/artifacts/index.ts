import { type BuiltinSkill } from '@lobechat/types';

import { toResourceMeta } from '../lobehub/helpers';
import { systemPrompt } from './content';
import { ArtifactsIdentifier, ArtifactsManifest } from './manifest';
import artifact from './references/artifact';
import inline from './references/inline';

export { ArtifactsIdentifier };

export const ArtifactsSkill: BuiltinSkill = {
  ...ArtifactsManifest,
  content: systemPrompt,
  resources: toResourceMeta({
    'references/artifact': artifact,
    'references/inline': inline,
  }),
};
