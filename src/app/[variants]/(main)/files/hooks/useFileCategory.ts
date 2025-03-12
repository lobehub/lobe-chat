import { useQueryState } from 'nuqs';

import { FilesTabs } from '@/types/files';

export const useFileCategory = () =>
  useQueryState('category', { clearOnDefault: true, defaultValue: FilesTabs.All });
