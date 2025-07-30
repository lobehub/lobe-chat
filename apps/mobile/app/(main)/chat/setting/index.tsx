import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, Text, View } from 'react-native';

import { ListItem } from '@/mobile/components';
import { useSessionStore } from '@/mobile/store/session';
import { sessionMetaSelectors } from '@/mobile/store/session/selectors';
import { isEmoji } from '@/mobile/utils/common';
import { useStyles } from './styles';

export default function AgentDetail() {
  const { t } = useTranslation();
  const avatar = useSessionStore(sessionMetaSelectors.currentAgentAvatar);
  const backgroundColor = useSessionStore(sessionMetaSelectors.currentAgentBackgroundColor);
  const title = useSessionStore(sessionMetaSelectors.currentAgentTitle);
  const description = useSessionStore(sessionMetaSelectors.currentAgentDescription);
  const { styles } = useStyles(backgroundColor);

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
        <View style={styles.avatarWrapper}>
          {avatar &&
            (isEmoji(avatar) ? (
              <Text style={styles.avatarEmoji}>{avatar}</Text>
            ) : (
              <Image source={{ uri: avatar }} style={styles.avatarImg} />
            ))}
        </View>
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
