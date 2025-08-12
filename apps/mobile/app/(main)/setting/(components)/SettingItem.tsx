import { Href, Link } from 'expo-router';
import { Check } from 'lucide-react-native';
import React from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';

import { ICON_SIZE_SMALL } from '@/const/common';
import { useThemeToken } from '@/theme';

interface SettingItemProps {
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
}: SettingItemProps) => {
  const token = useThemeToken();

  const styles = {
    badge: {
      backgroundColor: token.colorError,
      borderRadius: 4,
      height: 8,
      marginRight: 8,
      width: 8,
    },
    checkmark: {},
    separator: {
      backgroundColor: token.colorBorderSecondary,
      height: 1,
      marginHorizontal: 16,
    },
    settingItem: {
      alignItems: 'center' as const,
      backgroundColor: token.colorBgContainer,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      minHeight: 56,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    settingItemArrow: {
      color: token.colorBorder,
      fontSize: 22,
      marginLeft: token.marginSM,
    },
    settingItemDescription: {
      color: token.colorTextDescription,
      fontSize: 12,
      marginTop: token.marginXS,
    },
    settingItemExtra: {
      color: token.colorTextSecondary,
      fontSize: 17,
      marginRight: 4,
    },
    settingItemLeft: {
      flexDirection: 'column' as const,
      flexShrink: 1,
      justifyContent: 'center' as const,
    },
    settingItemRight: {
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
    },
    settingItemTitle: {
      color: token.colorText,
      fontSize: 17,
    },
  };

  const renderRightContent = () => {
    if (showSwitch) {
      return (
        <Switch
          onValueChange={onSwitchChange}
          thumbColor={switchValue ? token.colorBgContainer : token.colorBgContainer}
          trackColor={{
            false: token.colorBgBase,
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
      {!isLast && <View style={styles.separator} />}
    </View>
  );

  const touchableContent = <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;

  if (href) {
    return (
      <Link asChild href={href}>
        {touchableContent}
      </Link>
    );
  }

  return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
};
