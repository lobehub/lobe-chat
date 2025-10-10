import { ActionIcon } from '@lobehub/ui-rn';
import { MessageSquarePlus } from 'lucide-react-native';

import { useActionSWR } from '@/libs/swr';
import { useSessionStore } from '@/store/session';

const NewAgentBtn = () => {
  const [createSession] = useSessionStore((s) => [s.createSession]);

  const { mutate, isValidating } = useActionSWR('session.createSession', () => createSession());

  return <ActionIcon icon={MessageSquarePlus} loading={isValidating} onPress={() => mutate()} />;
};

export default NewAgentBtn;
