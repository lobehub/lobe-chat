import { SWRConfig } from 'swr';

// 全局的 SWR 配置
const swrConfig = {
  provider: () => new Map(),
};

export const withSWR = ({ children }: any) => <SWRConfig value={swrConfig}>{children}</SWRConfig>;
