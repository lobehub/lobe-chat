import { useActionSWR } from '@/libs/swr';
import { useSessionStore } from '@/store/session';

export const useSessionCreation = () => {
  const [createSession] = useSessionStore((s) => [s.createSession]);

  const { mutate: mutateAgent, isValidating: isValidatingAgent } = useActionSWR(
    'session.createSession',
    () => createSession(),
  );

  return {
    isValidatingAgent,
    mutateAgent,
  };
};
