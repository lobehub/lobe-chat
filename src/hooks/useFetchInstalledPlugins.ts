import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useToolStore } from '@/store/tool';

export const useFetchInstalledPlugins = () => {
  const isDBInited = useGlobalStore(systemStatusSelectors.isDBInited);
  const [useFetchInstalledPlugins] = useToolStore((s) => [s.useFetchInstalledPlugins]);

  return useFetchInstalledPlugins(isDBInited);
};
