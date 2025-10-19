import { Avatar, Cell, PageContainer } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AgentRoleEditSection } from '@/features/AgentRoleEdit/AgentRoleEditSection';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

export default function AgentDetail() {
  const { t } = useTranslation(['chat']);
  const router = useRouter();
  const avatar = useSessionStore(sessionMetaSelectors.currentAgentAvatar);
  const title = useSessionStore(sessionMetaSelectors.currentAgentTitle);
  const description = useSessionStore(sessionMetaSelectors.currentAgentDescription);

  return (
    <PageContainer showBack title={t('setting.title', { ns: 'chat' })}>
      <AgentRoleEditSection
        header={
          <>
            <Cell
              extra={<Avatar alt={title} avatar={avatar || '🤖'} size={32} />}
              onPress={() => router.push('/chat/setting/avatar')}
              title={t('setting.avatar')}
            />
            <Cell
              extra={title}
              onPress={() => router.push('/chat/setting/name')}
              title={t('setting.name')}
            />
            <Cell
              extra={description}
              onPress={() => router.push('/chat/setting/description')}
              title={t('setting.description')}
            />
          </>
        }
        onSystemRolePress={() => router.push('/chat/setting/system-role')}
      />
    </PageContainer>
  );
}
