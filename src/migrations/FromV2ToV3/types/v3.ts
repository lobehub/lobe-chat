import { V1Config } from '@/migrations/FromV1ToV2/types/v1';

import { Meta, V2ConfigState } from '../../FromV1ToV2/types/v2';

export interface V3ConfigState extends V2ConfigState {
  sessions: V3Session[];
}

export interface V3Session {
  config: V1Config;
  createdAt: number;
  group: 'default';
  id: string;
  meta: Meta;
  pinned?: boolean;
  type: string;
  updatedAt: number;
}
