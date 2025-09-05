import React from 'react';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Avatar, Header } from '@/components';

import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { useStyles } from './styles';
import { AVATAR_SIZE_LARGE } from '@/const/common';
import { AgentRoleEditSection } from '@/features/AgentRoleEdit/AgentRoleEditSection';

export default function AgentDetail() {
  const avatar = useSessionStore(sessionMetaSelectors.currentAgentAvatar);
  const title = useSessionStore(sessionMetaSelectors.currentAgentTitle);
  const description = useSessionStore(sessionMetaSelectors.currentAgentDescription);
  const { styles } = useStyles();

  return (
    <KeyboardAwareScrollView
      bottomOffset={40}
      extraKeyboardSpace={60}
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <Header showBack title={title} />
      <View style={styles.avatarContainer}>
        <Avatar alt={title} avatar={avatar || '🤖'} size={AVATAR_SIZE_LARGE} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      <AgentRoleEditSection />
    </KeyboardAwareScrollView>
  );
}
