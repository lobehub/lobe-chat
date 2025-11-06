import { Avatar, Cell, PageContainer } from '@lobehub/ui-rn';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AgentRoleEditSection } from '@/features/AgentRoleEdit/AgentRoleEditSection';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

export default function AgentDetail() {
  const { t } = useTranslation('chat');
  const router = useRouter();
  const avatar = useSessionStore(sessionMetaSelectors.currentAgentAvatar);
  const title = useSessionStore(sessionMetaSelectors.currentAgentTitle);
  const description = useSessionStore(sessionMetaSelectors.currentAgentDescription);

  return (
    <PageContainer showBack title={t('setting.title', { ns: 'chat' })}>
      <AgentRoleEditSection
        header={
          <>
            <Link asChild href="/chat/setting/avatar">
              <Cell
                extra={<Avatar alt={title} avatar={avatar || '🤖'} size={32} />}
                title={t('setting.avatar')}
              />
            </Link>
            <Link asChild href="/chat/setting/name">
              <Cell extra={title} title={t('setting.name')} />
            </Link>
            <Link asChild href="/chat/setting/description">
              <Cell extra={description} title={t('setting.description')} />
            </Link>
          </>
        }
        onSystemRolePress={() => router.push('/chat/setting/system-role')}
      />
    </PageContainer>
  );
}
