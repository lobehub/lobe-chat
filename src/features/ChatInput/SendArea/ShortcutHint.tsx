import { Hotkey, Text, combineKeys } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';
import { KeyEnum } from '@/types/hotkey';

const ShortcutHint = memo(() => {
  const { t } = useTranslation('chat');
  const theme = useTheme();

  const useCmdEnterToSend = useUserStore(preferenceSelectors.useCmdEnterToSend);

  const sendShortcut = useCmdEnterToSend
    ? combineKeys([KeyEnum.Mod, KeyEnum.Enter])
    : KeyEnum.Enter;

  const wrapperShortcut = useCmdEnterToSend
    ? KeyEnum.Enter
    : combineKeys([KeyEnum.Mod, KeyEnum.Enter]);

  return (
    <Text fontSize={12} style={{ color: theme.colorTextQuaternary, userSelect: 'none', zIndex: 1 }}>
      <Flexbox align={'center'} gap={4} horizontal justify={'flex-end'} paddingBlock={4}>
        <Hotkey
          keys={sendShortcut}
          style={{ color: 'inherit' }}
          styles={{
            kbdStyle: { color: 'inherit' },
          }}
          variant={'borderless'}
        />
        <span>{t('input.send')}</span>
        <span>/</span>
        <Hotkey
          keys={wrapperShortcut}
          style={{ color: 'inherit' }}
          styles={{
            kbdStyle: { color: 'inherit' },
          }}
          variant={'borderless'}
        />
        <span>{t('input.warp')}</span>
      </Flexbox>
    </Text>
  );
});

export default ShortcutHint;
