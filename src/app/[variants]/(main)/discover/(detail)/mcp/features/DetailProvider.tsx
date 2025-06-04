'use client';

import { PluginItem } from '@lobehub/market-sdk';
import { PluginItemDetail } from '@lobehub/market-types';
import { type ReactNode, createContext, memo, use } from 'react';

export interface DetailContextConfig extends Partial<PluginItemDetail> {
  isClaimed?: boolean;
  related?: PluginItem[];
}

export const DetailContext = createContext<DetailContextConfig>({});

export const DetailProvider = memo<{ children: ReactNode; config?: DetailContextConfig }>(
  ({ children, config = {} }) => {
    return <DetailContext value={config}>{children}</DetailContext>;
  },
);

export const useDetailContext = () => {
  return use(DetailContext);
};
