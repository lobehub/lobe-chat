import { Avatar, PageContainer } from '@lobehub/ui-rn';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { AVATAR_SIZE_LARGE } from '@/_const/common';
import { AgentRoleEditSection } from '@/features/AgentRoleEdit/AgentRoleEditSection';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

import { useStyles } from './styles';

export default function AgentDetail() {
  const { t } = useTranslation(['chat']);
  const avatar = useSessionStore(sessionMetaSelectors.currentAgentAvatar);
  const title = useSessionStore(sessionMetaSelectors.currentAgentTitle);
  const description = useSessionStore(sessionMetaSelectors.currentAgentDescription);
  const { styles } = useStyles();

  return (
    <PageContainer showBack title={t('setting.title', { ns: 'chat' })}>
      <KeyboardAwareScrollView
        bottomOffset={40}
        extraKeyboardSpace={60}
        showsVerticalScrollIndicator={false}
        style={styles.container}
      >
        <View style={styles.avatarContainer}>
          <Avatar alt={title} avatar={avatar || '🤖'} size={AVATAR_SIZE_LARGE} />
        </View>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        <AgentRoleEditSection />
      </KeyboardAwareScrollView>
    </PageContainer>
  );
}
