import type { DropdownMenuItemType } from '@lobehub/ui';
import type { API } from '@lobechat/prompts';

export type MentionEntityType = 'collection' | 'api';

export interface MentionMetadata {
  apis?: API[];
  description?: string;
  identifier: string;
  instructions?: string;
  label?: string;
  pluginIdentifier?: string;
  pluginType?: string;
  type?: MentionEntityType;
}

export type MentionListOption = DropdownMenuItemType & {
  description?: string;
  metadata?: MentionMetadata;
};
