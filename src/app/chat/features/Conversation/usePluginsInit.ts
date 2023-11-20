import { usePluginStore } from '@/store/plugin';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agentConfig';

export const usePluginsInit = () => {
  const [plugins] = useSessionStore((s) => [agentSelectors.currentAgentPlugins(s)]);

  const useFetchPluginStore = usePluginStore((s) => s.useFetchPluginStore);
  useFetchPluginStore();

  const checkPluginsIsInstalled = usePluginStore((s) => s.useCheckPluginsIsInstalled);

  checkPluginsIsInstalled(plugins);
};
