import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/mobile/theme';
import type { ThemeMode } from '@/mobile/types/theme';
import { useStyles } from './styles';

interface ThemePreviewProps {
  isDark: boolean;
  mode: ThemeMode;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ mode }) => {
  const { styles: previewStyles } = useStyles();
  if (mode === 'auto') {
    // System mode with split background
    return (
      <View style={previewStyles.previewContainer}>
        {/* Split background */}
        <View style={previewStyles.splitBackground}>
          <View style={[previewStyles.backgroundHalf, { backgroundColor: '#ffffff' }]} />
          <View style={[previewStyles.backgroundHalf, { backgroundColor: '#000000' }]} />
        </View>

        {/* Phone frame centered */}
        <View style={[previewStyles.phoneFrame, { backgroundColor: '#404040' }]}>
          <View style={previewStyles.phoneScreen}>
            {/* Left half - Light */}
            <View
              style={[
                previewStyles.screenHalf,
                previewStyles.leftHalf,
                { backgroundColor: '#ffffff' },
              ]}
            >
              <View style={previewStyles.phoneContent}>
                <View style={previewStyles.statusBar}>
                  <View style={[previewStyles.statusDot, { backgroundColor: '#000000' }]} />
                  <View style={[previewStyles.statusLine, { backgroundColor: '#000000' }]} />
                </View>
                <View style={previewStyles.avatarSection}>
                  <View style={[previewStyles.avatar, { backgroundColor: '#d9d9d9' }]} />
                  <View style={[previewStyles.textLine, { backgroundColor: '#bfbfbf' }]} />
                </View>
                <View style={previewStyles.contentSection}>
                  <View style={[previewStyles.chatBubble, { backgroundColor: '#f0f0f0' }]} />
                  <View style={[previewStyles.chatBubbleSmall, { backgroundColor: '#f0f0f0' }]} />
                </View>
              </View>
            </View>

            {/* Right half - Dark */}
            <View
              style={[
                previewStyles.screenHalf,
                previewStyles.rightHalf,
                { backgroundColor: '#000000' },
              ]}
            >
              <View style={previewStyles.phoneContent}>
                <View style={previewStyles.statusBar}>
                  <View style={[previewStyles.statusDot, { backgroundColor: '#ffffff' }]} />
                  <View style={[previewStyles.statusLine, { backgroundColor: '#ffffff' }]} />
                </View>
                <View style={previewStyles.avatarSection}>
                  <View style={[previewStyles.avatar, { backgroundColor: '#606060' }]} />
                  <View style={[previewStyles.textLine, { backgroundColor: '#404040' }]} />
                </View>
                <View style={previewStyles.contentSection}>
                  <View style={[previewStyles.chatBubble, { backgroundColor: '#1a1a1a' }]} />
                  <View style={[previewStyles.chatBubbleSmall, { backgroundColor: '#1a1a1a' }]} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Light or Dark mode
  const isLight = mode === 'light';
  const backgroundColor = isLight ? '#ffffff' : '#000000';
  const phoneFrameColor = isLight ? '#e0e0e0' : '#404040';
  const screenBg = isLight ? '#ffffff' : '#000000';
  const statusBarColor = isLight ? '#000000' : '#ffffff';
  const avatarColor = isLight ? '#d9d9d9' : '#606060';
  const textColor = isLight ? '#bfbfbf' : '#404040';
  const chatBubbleColor = isLight ? '#f0f0f0' : '#1a1a1a';

  return (
    <View style={[previewStyles.previewContainer, { backgroundColor }]}>
      <View style={[previewStyles.phoneFrame, { backgroundColor: phoneFrameColor }]}>
        <View style={[previewStyles.phoneScreen, { backgroundColor: screenBg }]}>
          <View style={previewStyles.phoneContent}>
            {/* 状态栏 */}
            <View style={previewStyles.statusBar}>
              <View style={[previewStyles.statusDot, { backgroundColor: statusBarColor }]} />
              <View style={[previewStyles.statusLine, { backgroundColor: statusBarColor }]} />
              <View style={previewStyles.statusRight}>
                <View style={[previewStyles.statusSignal, { backgroundColor: statusBarColor }]} />
              </View>
            </View>

            {/* 头像区域 */}
            <View style={previewStyles.avatarSection}>
              <View style={[previewStyles.avatar, { backgroundColor: avatarColor }]} />
              <View style={[previewStyles.textLine, { backgroundColor: textColor }]} />
            </View>

            {/* 聊天气泡 */}
            <View style={previewStyles.contentSection}>
              <View style={[previewStyles.chatBubble, { backgroundColor: chatBubbleColor }]} />
              <View style={[previewStyles.chatBubbleSmall, { backgroundColor: chatBubbleColor }]} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

interface ThemeOptionProps {
  isDark: boolean;
  isSelected: boolean;
  mode: ThemeMode;
  onSelect: () => void;
  title: string;
  token: any;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({
  mode,
  title,
  isSelected,
  onSelect,
  token,
  isDark,
}) => {
  const { styles: optionStyles } = useStyles();
  return (
    <View style={optionStyles.themeOption}>
      <TouchableOpacity
        onPress={onSelect}
        style={[
          optionStyles.imageContainer,
          {
            borderColor: isSelected ? token.colorBorder : 'transparent',
          },
        ]}
      >
        <ThemePreview isDark={isDark} mode={mode} />
      </TouchableOpacity>
      <Text style={optionStyles.themeTitle}>{title}</Text>
    </View>
  );
};

export default function ThemeSettingScreen() {
  const { t } = useTranslation(['setting']);
  const { theme, setThemeMode } = useTheme();
  const { styles, token } = useStyles();

  const themeOptions = [
    {
      mode: 'light' as ThemeMode,
      title: t('theme.light', { ns: 'setting' }),
    },
    {
      mode: 'dark' as ThemeMode,
      title: t('theme.dark', { ns: 'setting' }),
    },
    {
      mode: 'auto' as ThemeMode,
      title: t('theme.auto', { ns: 'setting' }),
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      style={[styles.container, { backgroundColor: token.colorBgLayout }]}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: token.colorTextHeading }]}>
          {t('theme.sectionTitle', { ns: 'setting' })}
        </Text>
        <Text style={[styles.sectionDescription, { color: token.colorTextSecondary }]}>
          {t('theme.sectionDescription', { ns: 'setting' })}
        </Text>
      </View>

      <View style={styles.themesContainer}>
        {themeOptions.map((option) => (
          <ThemeOption
            isDark={theme.isDark}
            isSelected={theme.mode === option.mode}
            key={option.mode}
            mode={option.mode}
            onSelect={() => setThemeMode(option.mode)}
            title={option.title}
            token={token}
          />
        ))}
      </View>
    </ScrollView>
  );
}
