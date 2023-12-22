import { MetaData } from '@/types/meta';

export type LobeToolType = 'builtin' | 'customPlugin' | 'plugin';

export interface LobeToolMeta {
  author?: string;
  identifier: string;
  meta: MetaData;
  type: LobeToolType;
}
