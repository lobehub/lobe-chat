import React from 'react';
import { View } from 'react-native';

import { Skeleton } from '@/components';
import { useThemeToken } from '@/theme';

// SessionItem Skeleton Component
const SessionItemSkeleton = () => {
  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      {/* Avatar skeleton */}
      <Skeleton.Avatar animated shape="circle" size={64} />

      {/* Content skeleton */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        {/* Title skeleton */}
        <View style={{ marginBottom: 4 }}>
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
        borderRadius: 8,
        height: 40,
        marginBottom: 16,
        marginHorizontal: 16,
      }}
    />
  );
};

// Session List Skeleton (for multiple items)
export const SessionListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <View style={{ flex: 1 }}>
      {/* Search bar skeleton */}
      <SearchBarSkeleton />

      {/* Header skeleton */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
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
