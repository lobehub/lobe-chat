import { useMemo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';
import { ProviderItem } from '@/app/[variants]/(main)/settings/llm/type';

import Pollinations from './index';

export const usePollinationsProvider = (): ProviderItem => {
  return useMemo(
    () => ({
      component: <Pollinations />,
      id: ModelProvider.Pollinations,
      title: 'Pollinations.AI',
    }),
    [],
  );
};
