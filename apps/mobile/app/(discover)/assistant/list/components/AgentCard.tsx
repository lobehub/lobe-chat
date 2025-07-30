import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import dayjs from 'dayjs';

import { DiscoverAssistantItem } from '@/types/discover';
import GitHubAvatar from '@/components/GithubAvatar';
import Avatar from '@/components/Avatar';
import Space from '@/components/Space';
import Tag from '@/components/Tag';

import { useStyles } from './style';

interface AgentCardProps {
  item: DiscoverAssistantItem;
}

export const AgentCard = ({ item }: AgentCardProps) => {
  const { styles } = useStyles();

  return (
    <Pressable
      onPress={() =>
        router.push({
          params: { identifier: item.identifier },
          pathname: '/(discover)/assistant/detail',
        })
      }
      style={styles.cardLink}
    >
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.headerContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.name}>{item.meta.title}</Text>

              <Space align="center">
                <GitHubAvatar size={24} username={item.author} />
                <Text style={styles.authorName}>
                  {item.author || 'LobeChat'}{' '}
                  <Text style={styles.date}>{dayjs(item.createdAt).format('YYYY-MM-DD')}</Text>
                </Text>
              </Space>
            </View>

            <Avatar avatar={item.meta.avatar || '🤖'} size={32} />
          </View>

          <Text numberOfLines={2} style={styles.description}>
            {item.meta.description}
          </Text>

          {item.meta.tags && item.meta.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.meta.tags.map((tag: string) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default AgentCard;
