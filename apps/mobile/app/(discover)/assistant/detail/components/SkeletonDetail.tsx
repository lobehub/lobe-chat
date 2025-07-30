import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/mobile/components';
import { useThemeToken } from '@/mobile/theme';
import { ICON_SIZE } from '@/mobile/const/common';

// Assistant Detail Page Skeleton Components
const AssistantDetailSkeleton = () => {
  const token = useThemeToken();

  return (
    <View style={{ padding: 16 }}>
      {/* Title skeleton */}
      <View style={{ marginBottom: 16 }}>
        <Skeleton.Title animated style={{ height: 28 }} width="80%" />
      </View>

      {/* Author info skeleton */}
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          marginBottom: 16,
        }}
      >
        <Skeleton.Avatar animated shape="circle" size={24} />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Skeleton.Title animated style={{ height: 14 }} width="50%" />
        </View>
      </View>

      {/* Description skeleton */}
      <View style={{ marginBottom: 16 }}>
        <Skeleton.Paragraph animated rows={3} width={['100%', '95%', '85%']} />
      </View>

      {/* Tags skeleton */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 20,
        }}
      >
        {[60, 80, 70, 90].map((width, index) => (
          <Skeleton.Title
            animated
            key={index}
            style={{
              backgroundColor: token.colorFillSecondary,
              borderRadius: 14,
              height: 28,
            }}
            width={width}
          />
        ))}
      </View>

      {/* Action button skeleton */}
      <View style={{ marginBottom: 24 }}>
        <Skeleton.Title
          animated
          style={{
            backgroundColor: token.colorFillSecondary,
            borderRadius: 8,
            height: 48,
          }}
          width="100%"
        />
      </View>

      {/* System role section skeleton */}
      <View>
        {/* Section header */}
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginBottom: 16,
          }}
        >
          <Skeleton.Avatar animated shape="square" size={ICON_SIZE} style={{ borderRadius: 4 }} />
          <View style={{ marginLeft: 8 }}>
            <Skeleton.Title animated style={{ height: 16 }} width={120} />
          </View>
        </View>

        {/* Content */}
        <Skeleton.Paragraph
          animated
          rows={6}
          width={['100%', '95%', '90%', '100%', '85%', '75%']}
        />
      </View>
    </View>
  );
};

// Assistant Detail Title Skeleton
export const AssistantTitleSkeleton = () => {
  return (
    <View style={{ marginBottom: 16 }}>
      <Skeleton.Title animated style={{ height: 28 }} width="80%" />
    </View>
  );
};

// Assistant Detail Author Skeleton
export const AssistantAuthorSkeleton = () => {
  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 16,
      }}
    >
      <Skeleton.Avatar animated shape="circle" size={24} />
      <View style={{ flex: 1, marginLeft: 8 }}>
        <Skeleton.Title animated style={{ height: 14 }} width="50%" />
      </View>
    </View>
  );
};

// Assistant Detail Description Skeleton
export const AssistantDescriptionSkeleton = () => {
  return (
    <View style={{ marginBottom: 16 }}>
      <Skeleton.Paragraph animated rows={3} width={['100%', '95%', '85%']} />
    </View>
  );
};

// Assistant Detail Tags Skeleton
export const AssistantTagsSkeleton = () => {
  const token = useThemeToken();

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
      }}
    >
      {[60, 80, 70, 90].map((width, index) => (
        <Skeleton.Title
          animated
          key={index}
          style={{
            backgroundColor: token.colorFillSecondary,
            borderRadius: 14,
            height: 28,
          }}
          width={width}
        />
      ))}
    </View>
  );
};

// Assistant Detail Action Button Skeleton
export const AssistantActionButtonSkeleton = () => {
  const token = useThemeToken();

  return (
    <View style={{ marginBottom: 24 }}>
      <Skeleton.Title
        animated
        style={{
          backgroundColor: token.colorFillSecondary,
          borderRadius: 8,
          height: 48,
        }}
        width="100%"
      />
    </View>
  );
};

// Assistant Detail System Role Skeleton
export const AssistantSystemRoleSkeleton = () => {
  return (
    <View>
      {/* Section header */}
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          marginBottom: 16,
        }}
      >
        <Skeleton.Avatar animated shape="square" size={ICON_SIZE} style={{ borderRadius: 4 }} />
        <View style={{ marginLeft: 8 }}>
          <Skeleton.Title animated style={{ height: 16 }} width={120} />
        </View>
      </View>

      {/* Content */}
      <Skeleton.Paragraph animated rows={6} width={['100%', '95%', '90%', '100%', '85%', '75%']} />
    </View>
  );
};

export default AssistantDetailSkeleton;
