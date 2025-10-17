import { Button, Divider, Empty, Flexbox, Markdown, Text } from '@lobehub/ui-rn';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { agentSelectors, useAgentStore } from '@/store/agent';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

interface AgentRoleEditSectionProps {
  header: ReactNode;
  onSystemRolePress: () => void;
}

export const AgentRoleEditSection = memo<AgentRoleEditSectionProps>(
  ({ header, onSystemRolePress }) => {
    const { t } = useTranslation();

    const isInbox = useSessionStore(sessionSelectors.isInboxSession);
    const systemRole = useAgentStore(agentSelectors.currentAgentSystemRole);

    // 如果是 Inbox session，不显示角色编辑
    if (isInbox) {
      return null;
    }

    return (
      <>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {header}
          <Divider style={{ marginTop: 8 }} />
          <Flexbox padding={16}>
            {systemRole ? (
              <Markdown>{systemRole}</Markdown>
            ) : (
              <Empty description={t('agentRoleEdit.placeholder', { ns: 'chat' })} />
            )}
          </Flexbox>
        </ScrollView>
        <Flexbox gap={8} padding={16}>
          <Button block onPress={onSystemRolePress} type="primary">
            编辑角色设定
          </Button>
          <Text align={'center'} type={'secondary'}>
            Token: {systemRole ? Math.ceil(systemRole.length / 4) : 0}
          </Text>
        </Flexbox>
      </>
    );
  },
);
