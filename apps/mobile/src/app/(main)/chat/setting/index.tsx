import { Avatar, Cell, PageContainer } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AgentRoleEditSection } from '@/features/AgentRoleEdit/AgentRoleEditSection';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';

export default function AgentDetail() {
  const { t } = useTranslation('chat');
  const router = useRouter();
  const avatar = useSessionStore(sessionMetaSelectors.currentAgentAvatar);
  const rawTitle = useSessionStore(sessionMetaSelectors.currentAgentTitle);
  const rawDescription = useSessionStore(sessionMetaSelectors.currentAgentDescription);
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);

  // 如果是 inbox，使用翻译；否则使用原始值或默认值
  const title = isInbox ? t('inbox.title') : rawTitle || t('defaultAgent');
  const description = isInbox ? t('inbox.desc') : rawDescription;

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
