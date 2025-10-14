import { AiProviderListItem } from '@lobechat/types';

// FlashList数据项类型
export type ProviderFlashListItem =
  | { data: { count: number; title: string }; id: string; type: 'section-header' }
  | { data: AiProviderListItem; id: string; type: 'provider' }
  | { data: { message: string }; id: string; type: 'empty' };
