import { Center, Flexbox, PageContainer, Text, Toast, useThemeMode } from '@lobehub/ui-rn';
import {
  CodeIcon,
  GlobeIcon,
  InboxIcon,
  LifeBuoy,
  MailIcon,
  PaletteIcon,
  RadarIcon,
  StickerIcon,
  SunMoonIcon,
  TypeIcon,
  User2Icon,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { version } from '@/../package.json';
import SettingGroup from '@/features/SettingGroup';
import SettingItem from '@/features/SettingItem';
import { useLocale } from '@/hooks/useLocale';
import { useSettingStore } from '@/store/setting';

export default function SettingScreen() {
  const { t } = useTranslation('setting');
  const { getLocaleDisplayName } = useLocale();
  const { themeMode } = useThemeMode();
  const { developerMode, setDeveloperMode } = useSettingStore();

  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          </SettingGroup>

          {developerMode && (
            <SettingGroup title={t('advanced.group')}>
              <SettingItem href="/setting/developer" icon={CodeIcon} title={t('developer.title')} />
            </SettingGroup>
          )}

          <SettingGroup title={t('info.group')}>
            <SettingItem
              href="https://lobehub.com/docs?utm_source=mobile"
              icon={LifeBuoy}
              title={t('help')}
            />
            <SettingItem
              href="https://github.com/lobehub/lobe-chat/issues/new/choose"
              icon={StickerIcon}
              title={t('feedback')}
            />
            <SettingItem
              href="https://lobehub.com/changelog"
              icon={InboxIcon}
              title={t('changelog')}
            />
            <SettingItem href="mailto:support@lobehub.com" icon={MailIcon} title={t('support')} />
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
