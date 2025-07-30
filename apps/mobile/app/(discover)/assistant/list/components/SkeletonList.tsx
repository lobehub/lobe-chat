import React from 'react';
import { View } from 'react-native';
import { Search } from 'lucide-react-native';

import { Skeleton, Space } from '@/components';
import { useThemeToken } from '@/theme';

// Agent Card Skeleton Component
const AgentCardSkeleton = () => {
  const token = useThemeToken();

  return (
    <View
      style={{
        backgroundColor: token.colorBgContainer,
        borderColor: token.colorBorder,
        borderRadius: 16,
        borderWidth: token.lineWidth,
        marginBottom: 16,
        padding: 16,
      }}
    >
      {/* Header with title, author and avatar */}
      <View
        style={{
          alignItems: 'flex-start',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          {/* Title */}
          <View style={{ marginBottom: 8 }}>
            <Skeleton.Title animated style={{ height: 22 }} width="65%" />
          </View>

          {/* Author info */}
          <Space align="center" direction="horizontal" size={8}>
            <Skeleton.Avatar animated shape="circle" size={24} />
            <Skeleton.Paragraph animated rows={1} width="120" />
          </Space>
        </View>
      </View>

      {/* Description */}
      <View style={{ marginBottom: 12 }}>
        <Skeleton.Paragraph animated rows={2} width={['100%', '85%']} />
      </View>

      {/* Tags */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {[60, 80, 70].map((width, index) => (
          <Skeleton.Title
            animated
            key={index}
            style={{
              backgroundColor: token.colorFillSecondary,
              borderRadius: 12,
              height: 24,
            }}
            width={width}
          />
        ))}
      </View>
    </View>
  );
};

// Search Bar Skeleton Component
export const SearchBarSkeleton = () => {
  const token = useThemeToken();

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: token.colorFillTertiary,
        borderRadius: 8,
        flexDirection: 'row',
        height: 40,
        paddingHorizontal: 12,
      }}
    >
      <Search color={token.colorTextPlaceholder} size={20} />
    </View>
  );
};

// Category Tabs Skeleton Component
export const CategoryTabsSkeleton = () => {
  const token = useThemeToken();

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
      }}
    >
      {[60, 80, 70, 90].map((width, index) => (
        <Skeleton.Title
          key={index}
          style={{
            backgroundColor: token.colorFillSecondary,
            borderRadius: 16,
            height: 32,
          }}
          width={width}
        />
      ))}
    </View>
  );
};

// List Loading Skeleton (for multiple cards)
export const AssistantListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      {Array.from({ length: count }).map((_, index) => (
        <AgentCardSkeleton key={index} />
      ))}
    </View>
  );
};

// Complete List Page Skeleton
export const AssistantListPageSkeleton = () => {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <SearchBarSkeleton />
        <CategoryTabsSkeleton />
      </View>
      <AssistantListSkeleton count={5} />
    </View>
  );
};

export default AssistantListPageSkeleton;
