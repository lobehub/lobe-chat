import { Icon, Text } from '@lobehub/ui';
import { LoaderCircle } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useStyles } from '@/components/FormAction';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';

const OrchestratorThinkingTag = memo(() => {
  const { t } = useTranslation('chat');
  const activeGroupId = useSessionStore((s) => s.activeId);
  const isSupervisorLoading = useChatStore(chatSelectors.isSupervisorLoading(activeGroupId || ''));
  const { theme } = useStyles();

  if (!isSupervisorLoading) return null;

  return (
    <Flexbox align={'center'} gap={4} horizontal>
      <Icon color={theme.colorTextSecondary} icon={LoaderCircle} size={12} spin />
      <Text fontSize={12} type={'secondary'}>
        {t('group.orchestratorThinking')}
      </Text>
    </Flexbox>
  );
});

export default OrchestratorThinkingTag;
