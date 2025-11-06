import {
  Avatar,
  Button,
  Cell,
  Divider,
  Empty,
  Flexbox,
  Markdown,
  PageContainer,
} from '@lobehub/ui-rn';
import { Link, useRouter } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { useSinglePress } from '@/hooks/useSinglePress';
import { agentSelectors, useAgentStore } from '@/store/agent';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';

export default function AgentDetail() {
  const { t } = useTranslation('chat');
  const router = useRouter();
  const avatar = useSessionStore(sessionMetaSelectors.currentAgentAvatar);
  const title = useSessionStore(sessionMetaSelectors.currentAgentTitle);
  const description = useSessionStore(sessionMetaSelectors.currentAgentDescription);

  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const systemRole = useAgentStore(agentSelectors.currentAgentSystemRole);

  const { handlePress: handleSystemRolePress, isPressed: isSystemRolePressed } = useSinglePress(
    () => {
      router.push('/chat/setting/system-role');
    },
  );

  return (
    <PageContainer showBack title={t('setting.title', { ns: 'chat' })}>
      {isInbox ? null : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
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
            <Divider style={{ marginTop: 8 }} />
            <Flexbox
              onPress={!systemRole && !isSystemRolePressed ? handleSystemRolePress : undefined}
              padding={16}
            >
              {systemRole ? (
                <Markdown>{systemRole}</Markdown>
              ) : (
                <Empty description={t('agentRoleEdit.placeholder')} icon={FileText} />
              )}
            </Flexbox>
          </ScrollView>
          <Flexbox gap={8} padding={16}>
            <Button
              block
              disabled={isSystemRolePressed}
              onPress={isSystemRolePressed ? undefined : handleSystemRolePress}
              type="primary"
            >
              {t('agentRoleEdit.editButton')}
            </Button>
          </Flexbox>
        </>
      )}
    </PageContainer>
  );
}
