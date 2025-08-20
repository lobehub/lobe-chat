import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

import { Avatar, ListItem } from '@/components';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { useStyles } from './styles';
import { AVATAR_SIZE_LARGE } from '@/const/common';

export default function AgentDetail() {
  const { t } = useTranslation();
  const avatar = useSessionStore(sessionMetaSelectors.currentAgentAvatar);
  const title = useSessionStore(sessionMetaSelectors.currentAgentTitle);
  const description = useSessionStore(sessionMetaSelectors.currentAgentDescription);
  const { styles } = useStyles();

  // Mock 对话历史数据
  const history = [
    { text: '二郎神杨戬', time: '15:07' },
    { text: '孙悟空大闹天宫', time: '15:10' },
    { text: '哪吒三太子', time: '15:12' },
    { text: '托塔天王李靖', time: '15:15' },
    { text: '嫦娥奔月', time: '15:18' },
    { text: '牛魔王大战孙悟空', time: '15:22' },
    // 可以添加更多历史
  ];

  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center' }} style={[styles.container]}>
      <View style={styles.avatarContainer}>
        <Avatar alt={title} avatar={avatar || '🤖'} size={AVATAR_SIZE_LARGE} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}

      {/* 对话历史卡片 */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>{t('history', { ns: 'chat' })}</Text>
        {history.map((item, idx) => (
          <ListItem
            extra={<Text style={styles.historyTime}>{item.time}</Text>}
            key={idx}
            title={item.text}
          />
        ))}
      </View>
    </ScrollView>
  );
}
