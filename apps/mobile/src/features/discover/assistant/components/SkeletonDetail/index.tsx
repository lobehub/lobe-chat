import { Skeleton } from '@lobehub/ui-rn';
import React from 'react';
import { DimensionValue, View } from 'react-native';

import { AVATAR_SIZE_LARGE, ICON_SIZE } from '@/_const/common';

import { useStyles } from './styles';

const TAG_WIDTHS = [64, 88, 72, 96];

const SYSTEM_ROLE_WIDTHS_1: DimensionValue[] = ['100%', '100%', '75%'];
const SYSTEM_ROLE_WIDTHS_2: DimensionValue[] = ['100%', '100%', '100%', '100%', '100%', '60%'];
const SYSTEM_ROLE_WIDTHS_3: DimensionValue[] = ['100%', '100%', '100%', '100%', '100%', '30%'];
const DESCRIPTION_WIDTHS: DimensionValue[] = ['100%', '95%', '85%'];

export const AssistantAuthorSkeleton = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.authorSection}>
      <Skeleton.Avatar animated shape="circle" size={AVATAR_SIZE_LARGE} />
      <View style={styles.authorInfo}>
        <Skeleton.Title animated width="50%" />
        <Skeleton.Paragraph animated rows={1} width="80%" />
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
      <Skeleton.Button animated block size="large" />
    </View>
  );
};

export const AssistantSystemRoleSkeleton = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.systemRoleSection}>
      <View style={styles.systemRoleHeader}>
        <Skeleton.Avatar animated shape="square" size={ICON_SIZE} />
        <Skeleton.Title animated width="40%" />
      </View>

      <View style={styles.systemRoleContent}>
        <Skeleton.Paragraph
          animated
          rows={SYSTEM_ROLE_WIDTHS_1.length}
          width={SYSTEM_ROLE_WIDTHS_1}
        />
        <Skeleton.Paragraph
          animated
          rows={SYSTEM_ROLE_WIDTHS_2.length}
          width={SYSTEM_ROLE_WIDTHS_2}
        />
        <Skeleton.Paragraph
          animated
          rows={SYSTEM_ROLE_WIDTHS_3.length}
          width={SYSTEM_ROLE_WIDTHS_3}
        />
      </View>
    </View>
  );
};

const AssistantDetailSkeleton = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <AssistantAuthorSkeleton />
      <AssistantDescriptionSkeleton />
      <AssistantTagsSkeleton />
      <AssistantActionButtonSkeleton />
      <AssistantSystemRoleSkeleton />
    </View>
  );
};

export default AssistantDetailSkeleton;
