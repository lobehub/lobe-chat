import { Hotkey, combineKeys } from '@lobehub/ui';
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
    <Flexbox
      align={'center'}
      gap={4}
      horizontal
      style={{ color: theme.colorTextDescription, fontSize: 12, marginRight: 12 }}
    >
      <Hotkey keys={sendShortcut} style={{ color: 'inherit' }} variant={'borderless'} />
      <span>{t('input.send')}</span>
      <span>/</span>
      <Hotkey keys={wrapperShortcut} style={{ color: 'inherit' }} variant={'borderless'} />
      <span>{t('input.warp')}</span>
    </Flexbox>
  );
});

export default ShortcutHint;
