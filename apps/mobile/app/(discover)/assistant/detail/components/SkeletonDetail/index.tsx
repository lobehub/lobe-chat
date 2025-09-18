import React from 'react';
import { DimensionValue, View } from 'react-native';

import { Skeleton } from '@/components';
import { ICON_SIZE } from '@/const/common';

import { useStyles } from './styles';

const TAG_WIDTHS = [64, 88, 72, 96];
const SYSTEM_ROLE_WIDTHS: DimensionValue[] = ['100%', '95%', '90%', '100%', '85%', '75%'];
const DESCRIPTION_WIDTHS: DimensionValue[] = ['100%', '95%', '85%'];

export const AssistantTitleSkeleton = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.titleSection}>
      <Skeleton.Title animated style={styles.titleSkeleton} width="80%" />
    </View>
  );
};

export const AssistantAuthorSkeleton = () => {
  const { styles, token } = useStyles();

  return (
    <View style={styles.authorSection}>
      <Skeleton.Avatar animated shape="circle" size={token.controlHeightSM} />
      <View style={styles.authorInfo}>
        <Skeleton.Title animated style={styles.authorSkeleton} width="50%" />
      </View>
    </View>
  );
};

export const AssistantDescriptionSkeleton = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.descriptionSection}>
      <Skeleton.Paragraph animated rows={3} width={DESCRIPTION_WIDTHS} />
    </View>
  );
};

export const AssistantTagsSkeleton = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.tagsSection}>
      {TAG_WIDTHS.map((width) => (
        <Skeleton.Title animated key={width} style={styles.tagSkeleton} width={width} />
      ))}
    </View>
  );
};

export const AssistantActionButtonSkeleton = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.actionSection}>
      <Skeleton.Title animated style={styles.actionButtonSkeleton} width="100%" />
    </View>
  );
};

export const AssistantSystemRoleSkeleton = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.systemRoleSection}>
      <View style={styles.systemRoleHeader}>
        <Skeleton.Avatar animated shape="square" size={ICON_SIZE} style={styles.systemRoleAvatar} />
        <View style={styles.systemRoleTitleContainer}>
          <Skeleton.Title animated style={styles.systemRoleTitleSkeleton} width="40%" />
        </View>
      </View>

      <View style={styles.systemRoleContent}>
        <Skeleton.Paragraph animated rows={SYSTEM_ROLE_WIDTHS.length} width={SYSTEM_ROLE_WIDTHS} />
        <Skeleton.Paragraph animated rows={SYSTEM_ROLE_WIDTHS.length} width={SYSTEM_ROLE_WIDTHS} />
      </View>
    </View>
  );
};

const AssistantDetailSkeleton = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <AssistantTitleSkeleton />
      <AssistantAuthorSkeleton />
      <AssistantDescriptionSkeleton />
      <AssistantTagsSkeleton />
      <AssistantActionButtonSkeleton />
      <AssistantSystemRoleSkeleton />
    </View>
  );
};

export default AssistantDetailSkeleton;
