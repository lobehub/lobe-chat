import { V1Config } from '@/migrations/FromV1ToV2/types/v1';

import { Meta, V2ConfigState } from '../../FromV1ToV2/types/v2';

export interface V3ConfigState extends V2ConfigState {
  sessionGroups: V3SessionGroup[];
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

export interface V3SessionGroup {
  createdAt: number;
  id: string;
  name: string;
  sort: number;
  updatedAt: number;
}
