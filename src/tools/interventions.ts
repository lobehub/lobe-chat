import { BuiltinIntervention } from '@lobechat/types';

import { LocalSystemManifest } from './local-system';
import LocalSystem from './local-system/Intervention';

export const BuiltinToolInterventions: Record<string, BuiltinIntervention> = {
  [LocalSystemManifest.identifier]: LocalSystem as BuiltinIntervention,
};
