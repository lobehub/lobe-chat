import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useToolStore } from '@/store/tool';

export const useCheckPluginsIsInstalled = (plugins: string[]) => {
  const isPgliteInited = useGlobalStore(systemStatusSelectors.isPgliteInited);
  const checkPluginsIsInstalled = useToolStore((s) => s.useCheckPluginsIsInstalled);

  checkPluginsIsInstalled(isPgliteInited, plugins);
};
