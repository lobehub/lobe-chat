import { Avatar, Cell, PageContainer } from '@lobehub/ui-rn';
import { useTranslation } from 'react-i18next';

import { AgentRoleEditSection } from '@/features/AgentRoleEdit/AgentRoleEditSection';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

export default function AgentDetail() {
  const { t } = useTranslation(['chat']);
  const avatar = useSessionStore(sessionMetaSelectors.currentAgentAvatar);
  const title = useSessionStore(sessionMetaSelectors.currentAgentTitle);
  const description = useSessionStore(sessionMetaSelectors.currentAgentDescription);

  return (
    <PageContainer showBack title={t('setting.title', { ns: 'chat' })}>
      <AgentRoleEditSection
        header={
          <>
            <Cell extra={<Avatar alt={title} avatar={avatar || '🤖'} size={32} />} title={'头像'} />
            <Cell extra={title} title={'名称'} />
            <Cell extra={description} title={'描述'} />
          </>
        }
      />
    </PageContainer>
  );
}
