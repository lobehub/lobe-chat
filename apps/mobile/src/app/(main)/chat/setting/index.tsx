import { Avatar, Block, Cell, PageContainer } from '@lobehub/ui-rn';
import { useTranslation } from 'react-i18next';

import { AVATAR_SIZE_LARGE } from '@/_const/common';
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
          <Cell
            description={description}
            descriptionProps={{
              ellipsis: { rows: 2 },
            }}
            icon={
              <Block
                borderRadius={AVATAR_SIZE_LARGE}
                height={AVATAR_SIZE_LARGE}
                variant={'filled'}
                width={AVATAR_SIZE_LARGE}
              >
                <Avatar alt={title} avatar={avatar || '🤖'} size={AVATAR_SIZE_LARGE} />
              </Block>
            }
            iconSize={AVATAR_SIZE_LARGE}
            showArrow={false}
            title={title}
          />
        }
      />
    </PageContainer>
  );
}
