import {
  Center,
  Flexbox,
  PageContainer,
  Text,
  Toast,
  useTheme,
  useThemeMode,
} from '@lobehub/ui-rn';
import * as Device from 'expo-device';
import * as MailComposer from 'expo-mail-composer';
import { useFocusEffect } from 'expo-router';
import * as Updates from 'expo-updates';
import {
  BrushCleaning,
  CodeIcon,
  GlobeIcon,
  InboxIcon,
  LifeBuoy,
  MailIcon,
  PaletteIcon,
  RadarIcon,
  RefreshCwIcon,
  SunMoonIcon,
  TypeIcon,
  User2Icon,
} from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Platform, ScrollView } from 'react-native';

import { version } from '@/../package.json';
import SettingGroup from '@/features/SettingGroup';
import SettingItem from '@/features/SettingItem';
import { useLocale } from '@/hooks/useLocale';
import { useSettingStore } from '@/store/setting';
import { clearPersistedCaches, formatBytes, getCacheSizeInBytes } from '@/utils/cacheManager';
import { openLink } from '@/utils/openLink';

export default function SettingScreen() {
  const theme = useTheme();
  const { t } = useTranslation('setting');
  const { getLocaleDisplayName } = useLocale();
  const { themeMode } = useThemeMode();
  const { developerMode, setDeveloperMode } = useSettingStore();

  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cacheSize, setCacheSize] = useState('0 B');
  const [isCacheLoading, setIsCacheLoading] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const refreshCacheSize = useCallback(() => {
    const bytes = getCacheSizeInBytes();
    setCacheSize(formatBytes(bytes));
  }, []);

  const loadCacheSize = useCallback(() => {
    setIsCacheLoading(true);
    try {
      refreshCacheSize();
    } finally {
      setIsCacheLoading(false);
    }
  }, [refreshCacheSize]);

  const handleClearCache = useCallback(() => {
    if (isCacheLoading || isClearingCache) return;

    Alert.alert(
      t('cache.clear.confirm.title', { ns: 'setting' }),
      t('cache.clear.confirm.description', { ns: 'setting' }),
      [
        {
          style: 'cancel',
          text: t('actions.cancel', { ns: 'common' }),
        },
        {
          onPress: () => {
            setIsClearingCache(true);
            setIsCacheLoading(true);
            try {
              clearPersistedCaches();
              Toast.success(t('cache.clear.success', { ns: 'setting' }));
            } catch (error) {
              console.error('Failed to clear cache', error);
              Toast.error(t('cache.clear.failure', { ns: 'setting' }));
            } finally {
              setIsClearingCache(false);
              loadCacheSize();
            }
          },
          style: 'destructive',
          text: t('cache.clear.confirm.action', { ns: 'setting' }),
        },
      ],
    );
  }, [isCacheLoading, isClearingCache, loadCacheSize, t]);

  const handleFeedback = useCallback(async () => {
    try {
      // 检查设备是否支持邮件功能
      const isAvailable = await MailComposer.isAvailableAsync();

      if (!isAvailable) {
        // 如果原生邮件不可用，尝试使用 mailto 链接作为备选方案
        const subject = encodeURIComponent(t('feedback.email.subject', { version }));
        const body = encodeURIComponent(
          `${t('feedback.email.body.template')}\n\n${t('feedback.email.body.description')}\n\n${t('feedback.email.body.frequency')}\n\n${t('feedback.email.body.screenshots')}\n\n---\nApp Version: ${version}\nOS: ${Platform.OS} ${Platform.Version}`,
        );
        const mailtoUrl = `mailto:support@lobehub.com?subject=${subject}&body=${body}`;

        const supported = await Linking.canOpenURL(mailtoUrl);
        if (supported) {
          await Linking.openURL(mailtoUrl);
        } else {
          Toast.error(t('feedback.unavailable'));
        }
        return;
      }

      // 收集设备信息
      const deviceInfo = [
        `App Version: ${version}`,
        `OS: ${Platform.OS} ${Platform.Version}`,
        `Device: ${Device.modelName || 'Unknown'}`,
        `System Version: ${Device.osVersion || 'Unknown'}`,
        `Brand: ${Device.brand || 'Unknown'}`,
      ].join('\n');

      // 准备邮件内容（国际化）
      const emailBody = `${t('feedback.email.body.template')}

${t('feedback.email.body.description')}

${t('feedback.email.body.frequency')}

${t('feedback.email.body.screenshots')}


---
${deviceInfo}
`;

      // 打开原生邮件撰写器
      const result = await MailComposer.composeAsync({
        body: emailBody,
        recipients: ['support@lobehub.com'],
        subject: t('feedback.email.subject', { version }),
      });

      // 根据用户操作显示不同提示
      switch (result.status) {
        case 'sent': {
          Toast.success(t('feedback.sent'));
          break;
        }
        case 'saved': {
          Toast.info(t('feedback.saved'));
          break;
        }
        case 'cancelled': {
          // 用户取消，不显示提示
          break;
        }
      }
    } catch (error) {
      console.error('Failed to send feedback:', error);
      Toast.error(t('feedback.error'));
    }
  }, [version, t]);

  const handleCheckForUpdates = useCallback(async () => {
    if (isCheckingUpdate) return;

    setIsCheckingUpdate(true);
    try {
      if (!Updates.isEnabled) {
        Toast.info(t('update.check.unavailable'));
        return;
      }

      Toast.info(t('update.check.checking'));
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        const loadingToastId = Toast.loading(t('update.check.downloading'), 0);
        try {
          await Updates.fetchUpdateAsync();
          if (loadingToastId) {
            Toast.destroy(loadingToastId);
          }
          Toast.success(t('update.check.downloaded'));
          Alert.alert(t('update.check.applyTitle'), t('update.check.applyDescription'), [
            {
              style: 'cancel',
              text: t('actions.cancel', { ns: 'common' }),
            },
            {
              onPress: () => {
                Toast.info(t('update.check.applying'));
                Updates.reloadAsync().catch((error) => {
                  console.error('Failed to apply update', error);
                  Toast.error(t('update.check.applyError'));
                });
              },
              text: t('update.check.applyAction'),
            },
          ]);
        } catch (fetchError) {
          if (loadingToastId) {
            Toast.destroy(loadingToastId);
          }
          throw fetchError;
        }
      } else {
        Toast.success(t('update.check.none'));
      }
    } catch (error) {
      console.error('Failed to check updates', error);
      const expoError = error as { code?: string };
      if (
        expoError?.code === 'ERR_NOT_AVAILABLE_IN_DEV_CLIENT' ||
        expoError?.code === 'ERR_UPDATES_DISABLED'
      ) {
        Toast.info(t('update.check.unavailable'));
      } else {
        Toast.error(t('update.check.error'));
      }
    } finally {
      setIsCheckingUpdate(false);
    }
  }, [isCheckingUpdate, t]);

  useFocusEffect(
    useCallback(() => {
      loadCacheSize();
    }, [loadCacheSize]),
  );

  const getThemeModeDisplayName = () => {
    if (themeMode === 'auto') {
      return t('themeMode.auto');
    }
    return t(`themeMode.${themeMode}`);
  };

  const handleVersionTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // 清除之前的定时器
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // 开发者模式开启后提示
    if (developerMode) {
      if (newTapCount >= 3) {
        Toast.info(t('developer.mode.already'));
        setTapCount(0);
        return;
      }
    } else {
      // 连续点击7次开启开发者模式
      if (newTapCount >= 7) {
        setDeveloperMode(true);
        setTapCount(0);
        Toast.success(t('developer.mode.enabled'));
        return;
      }

      if (newTapCount >= 3) {
        const remaining = 7 - newTapCount;
        Toast.info(
          t('developer.mode.remaining', {
            count: remaining,
          }),
          1500,
        );
      }
    }

    // 2秒后重置计数器
    tapTimeoutRef.current = setTimeout(() => {
      setTapCount(0);
    }, 2000);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  return (
    <PageContainer largeTitleEnabled showBack title={t('title')}>
      <ScrollView>
        <Flexbox gap={8} style={{ paddingTop: 8 }}>
          <SettingGroup title={t('account.group')}>
            <SettingItem href="/setting/account" icon={User2Icon} title={t('account.title')} />
            <SettingItem href="/setting/providers" icon={RadarIcon} title={t('providers')} />
          </SettingGroup>

          <SettingGroup title={t('general.group')}>
            <SettingItem
              extra={getThemeModeDisplayName()}
              href={'/setting/themeMode'}
              icon={SunMoonIcon}
              title={t('themeMode.title')}
            />
            <SettingItem href={'/setting/color'} icon={PaletteIcon} title={t('color.title')} />
            <SettingItem href={'/setting/fontSize'} icon={TypeIcon} title={t('fontSize.title')} />
            <SettingItem
              extra={getLocaleDisplayName()}
              href="/setting/locale"
              icon={GlobeIcon}
              title={t('locale.title')}
            />
            <SettingItem
              extra={cacheSize}
              icon={BrushCleaning}
              loading={isCacheLoading}
              onPress={handleClearCache}
              showArrow={true}
              title={t('cache.title', { ns: 'setting' })}
            />
          </SettingGroup>

          {developerMode && (
            <SettingGroup title={t('advanced.group')}>
              <SettingItem href="/setting/developer" icon={CodeIcon} title={t('developer.title')} />
            </SettingGroup>
          )}

          <SettingGroup title={t('info.group')}>
            <SettingItem
              icon={LifeBuoy}
              onPress={() =>
                openLink('https://lobehub.com/docs?utm_source=mobile', {
                  controlsColor: theme.colorPrimary,
                })
              }
              showArrow={true}
              title={t('help')}
            />
            {/* <SettingItem
              icon={StickerIcon}
              onPress={() =>
                openLink('https://github.com/lobehub/lobe-chat/issues/new/choose', {
                  controlsColor: theme.colorPrimary,
                })
              }
              showArrow={true}
              title={t('feedback')}
            /> */}
            <SettingItem
              icon={InboxIcon}
              onPress={() =>
                openLink('https://lobehub.com/changelog', {
                  controlsColor: theme.colorPrimary,
                })
              }
              showArrow={true}
              title={t('changelog')}
            />
            <SettingItem
              icon={RefreshCwIcon}
              loading={isCheckingUpdate}
              onPress={handleCheckForUpdates}
              showArrow={true}
              title={t('update.check.title')}
            />
            <SettingItem
              icon={MailIcon}
              onPress={handleFeedback}
              showArrow={true}
              title={t('feedback.title')}
            />
          </SettingGroup>
          <Center onPress={handleVersionTap} style={{ paddingTop: 24 }}>
            <Text align={'center'} type={'secondary'}>
              LobeHub v{version}
            </Text>
          </Center>
        </Flexbox>
      </ScrollView>
    </PageContainer>
  );
}
