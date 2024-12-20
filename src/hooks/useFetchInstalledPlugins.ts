import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useToolStore } from '@/store/tool';

export const useFetchInstalledPlugins = () => {
  const isPgliteInited = useGlobalStore(systemStatusSelectors.isPgliteInited);
  const [useFetchInstalledPlugins] = useToolStore((s) => [s.useFetchInstalledPlugins]);

  return useFetchInstalledPlugins(isPgliteInited);
};
