import React from 'react';
import { View } from 'react-native';

import { Skeleton } from '@/components';
import { useThemeToken } from '@/theme';

// SessionItem Skeleton Component
const SessionItemSkeleton = () => {
  const token = useThemeToken();
  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: token.padding,
        paddingVertical: token.paddingSM,
      }}
    >
      {/* Avatar skeleton */}
      <Skeleton.Avatar animated shape="circle" size={64} />

      {/* Content skeleton */}
      <View style={{ flex: 1, marginLeft: token.marginSM }}>
        {/* Title skeleton */}
        <View style={{ marginBottom: token.marginXXS }}>
          <Skeleton.Title animated width="60%" />
        </View>

        {/* Description skeleton */}
        <Skeleton.Paragraph animated rows={1} width="80%" />
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
        backgroundColor: token.colorFillTertiary,
        borderRadius: token.borderRadiusLG,
        height: 40,
        marginBottom: token.margin,
        marginHorizontal: token.margin,
      }}
    />
  );
};

// Session List Skeleton (for multiple items)
export const SessionListSkeleton = ({ count = 5 }: { count?: number }) => {
  const token = useThemeToken();
  return (
    <View style={{ flex: 1 }}>
      {/* Search bar skeleton */}
      <SearchBarSkeleton />

      {/* Header skeleton */}
      <View style={{ paddingHorizontal: token.padding, paddingVertical: token.paddingXS }}>
        <Skeleton.Title animated style={{ height: 40 }} width={'auto'} />
      </View>

      {/* Session items skeleton */}
      {Array.from({ length: count }).map((_, index) => (
        <SessionItemSkeleton key={index} />
      ))}
    </View>
  );
};

export default SessionListSkeleton;
