import { useActionSheet } from '@expo/react-native-action-sheet';
import { ChevronDown } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemeToken } from '@/theme';

import supportedLanguageIds, { getLanguageDisplayName } from '../../hooks/supportedLanguages';
import { useStyles } from './style';

interface LanguageSelectProps {
  onSelect: (lang: string) => void;
  value: string;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({ value, onSelect }) => {
  const token = useThemeToken();
  const { showActionSheetWithOptions } = useActionSheet();
  const { styles } = useStyles();

  // 创建语言选项列表，只包含支持的语言
  const languages = supportedLanguageIds.map((langId) => ({
    label: getLanguageDisplayName(langId),
    value: langId,
  }));

  // 显示显示的语言名称，确保即使很长的名称也能完整显示
  const displayValue = getLanguageDisplayName(value);

  const handleOpenLanguageSelect = () => {
    const options = languages.map((item) => item.label);
    options.push('取消');

    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = undefined;

    // 找到当前选中语言的索引
    // const currentLanguageIndex = languages.findIndex((item) => item.value === value);

    showActionSheetWithOptions(
      {
        cancelButtonIndex,
        containerStyle: styles.actionSheetContainer,
        destructiveButtonIndex,
        options,
        textStyle: styles.actionSheetText,
        title: '选择语言',
        titleTextStyle: styles.actionSheetTitle,
        useModal: true,
      },
      (selectedIndex: number | undefined) => {
        if (selectedIndex !== undefined && selectedIndex !== cancelButtonIndex) {
          onSelect(languages[selectedIndex].value);
        }
      },
    );
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleOpenLanguageSelect} style={styles.selectButton}>
        <Text style={styles.selectText}>{displayValue}</Text>
        <ChevronDown color={token.colorText} size={16} />
      </Pressable>
    </View>
  );
};
