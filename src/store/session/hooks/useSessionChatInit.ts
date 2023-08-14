import { useSessionStore } from '../store';
import { useSessionHydrated } from './useSessionHydrated';

/**
 * 用于判断某个会话是否完全被激活
 */
export const useSessionChatInit = () => {
  const sessionHydrated = useSessionHydrated();
  const [hasActive] = useSessionStore((s) => [!!s.activeId]);

  return sessionHydrated && hasActive;
};
