import { MetaData } from '@/types/meta';

export type LobeToolType = 'builtin' | 'customPlugin' | 'plugin';

export interface LobeToolMeta extends MetaData {
  author?: string;
  identifier: string;
  /**
   * @deprecated
   */
  meta: MetaData;
  type: LobeToolType;
}
