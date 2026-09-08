import type { heterogeneousAgentService } from '@/services/electron/heterogeneousAgent';
import { desktopOnly } from '@/utils/desktopOnly';

export const localHeteroAgentService = desktopOnly<typeof heterogeneousAgentService>(
  'heterogeneousAgentService',
);
