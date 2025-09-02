import { Href, Link } from 'expo-router';
import { Check } from 'lucide-react-native';
import React, { ReactNode } from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';

import { ICON_SIZE_SMALL } from '@/const/common';

import { useStyles } from './style';

interface SettingItemProps {
  customContent?: ReactNode;
  description?: string;
  extra?: string;
  href?: Href;
  isLast?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
  onSwitchChange?: (value: boolean) => void;
  showCheckmark?: boolean;
  showNewBadge?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  title: string;
}

export const SettingItem = ({
  title,
  extra,
  onPress,
  href,
  showSwitch,
  switchValue,
  onSwitchChange,
  description,
  isLast,
  showNewBadge,
  isSelected = false,
  showCheckmark = false,
  customContent,
}: SettingItemProps) => {
  const { styles, token } = useStyles();

  const renderRightContent = () => {
    if (showSwitch) {
      return (
        <Switch
          onValueChange={onSwitchChange}
          thumbColor={switchValue ? token.colorBgContainer : token.colorBgContainer}
          trackColor={{
            false: token.colorBgContainer,
            true: token.colorPrimary,
          }}
          value={switchValue}
        />
      );
    }

    return (
      <>
        {extra && <Text style={styles.settingItemExtra}>{extra}</Text>}
        {showNewBadge && <View style={styles.badge} />}
        {showCheckmark && isSelected && (
          <Text style={styles.checkmark}>
            <Check color={token.colorText} size={ICON_SIZE_SMALL} />
          </Text>
        )}
        {(onPress || href) && !showCheckmark && <Text style={styles.settingItemArrow}>›</Text>}
      </>
    );
  };

  const content = (
    <View>
      <View style={styles.settingItem}>
        <View style={styles.settingItemLeft}>
          <Text style={styles.settingItemTitle}>{title}</Text>
          {description && <Text style={styles.settingItemDescription}>{description}</Text>}
        </View>
        <View style={styles.settingItemRight}>{renderRightContent()}</View>
      </View>
      {customContent && <View style={styles.customContent}>{customContent}</View>}
      {!isLast && <View style={styles.separator} />}
    </View>
  );

  const touchableContent = (
    <TouchableOpacity activeOpacity={1} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );

  if (href) {
    return (
      <Link asChild href={href}>
        {touchableContent}
      </Link>
    );
  }

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
};
