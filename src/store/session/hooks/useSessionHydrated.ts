import { useSessionStore } from '../store';

export const useSessionHydrated = () => {
  const [fetchSessionsLoading, useFetchSessions] = useSessionStore((s) => [
    s.fetchSessionsLoading,

    s.useFetchSessions,
  ]);

  const { isLoading } = useFetchSessions();

  return !(isLoading || fetchSessionsLoading);
};
