import { Search } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { Skeleton, Space } from '@/components';

import { useStyles } from './styles';

const CARD_TAG_WIDTHS = [64, 88, 72];

const AgentCardSkeleton = () => {
  const { styles, token } = useStyles();

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.titleSkeletonWrapper}>
              <Skeleton.Title animated style={styles.titleSkeleton} width="65%" />
            </View>
            <Space align="center" direction="horizontal" size={token.marginXXS}>
              <Skeleton.Avatar animated shape="circle" size={token.controlHeightSM} />
              <Skeleton.Paragraph animated rows={1} width={120} />
            </Space>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Skeleton.Paragraph animated rows={2} width={['100%', '85%']} />
        </View>

        <View style={styles.tagsRow}>
          {CARD_TAG_WIDTHS.map((width) => (
            <Skeleton.Title animated key={width} style={styles.tagSkeleton} width={width} />
          ))}
        </View>
      </View>
    </View>
  );
};

export const SearchBarSkeleton = () => {
  const { styles, token } = useStyles();

  return (
    <View style={styles.searchBar}>
      <Search color={token.colorTextPlaceholder} size={token.fontSizeLG} />
    </View>
  );
};

export const CategoryTabsSkeleton = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.categoryTabs}>
      {[64, 88, 72, 96].map((width) => (
        <Skeleton.Title animated key={width} style={styles.categoryTabSkeleton} width={width} />
      ))}
    </View>
  );
};

export const AssistantListSkeleton = ({ count = 5 }: { count?: number }) => {
  const { styles } = useStyles();

  return (
    <View style={styles.listWrapper}>
      {Array.from({ length: count }).map((_, index) => (
        <AgentCardSkeleton key={index} />
      ))}
    </View>
  );
};

export const AssistantListPageSkeleton = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.pageContainer}>
      <View style={styles.searchSection}>
        <SearchBarSkeleton />
        <CategoryTabsSkeleton />
      </View>
      <AssistantListSkeleton count={5} />
    </View>
  );
};

export default AssistantListPageSkeleton;
