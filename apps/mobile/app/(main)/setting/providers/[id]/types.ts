import { AiProviderDetailItem } from '@lobechat/types';
import { AiProviderModelListItem } from 'model-bank';

// FlashList数据项类型
export type FlashListItem =
  | { data: AiProviderDetailItem; id: string; type: 'provider-info' }
  | { data: AiProviderDetailItem; id: string; type: 'configuration' }
  | {
      data: { isFetching: boolean; searchKeyword: string; totalCount: number };
      id: string;
      type: 'models-header';
    }
  | { data: { count: number; title: string }; id: string; type: 'section-header' }
  | { data: AiProviderModelListItem; id: string; type: 'model' }
  | { data: { message: string }; id: string; type: 'empty' };
