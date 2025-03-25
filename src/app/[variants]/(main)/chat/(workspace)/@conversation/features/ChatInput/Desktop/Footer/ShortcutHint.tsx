import { Hotkey, KeyMapEnum, combineKeys } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';

const ShortcutHint = memo(() => {
  const { t } = useTranslation('chat');
  const theme = useTheme();
  const useCmdEnterToSend = useUserStore(preferenceSelectors.useCmdEnterToSend);

  const sendShortcut = useCmdEnterToSend
    ? combineKeys([KeyMapEnum.Mod, KeyMapEnum.Enter])
    : KeyMapEnum.Enter;

  const wrapperShortcut = useCmdEnterToSend
    ? KeyMapEnum.Enter
    : combineKeys([KeyMapEnum.Mod, KeyMapEnum.Enter]);

  return (
    <Flexbox
      align={'center'}
      gap={4}
      horizontal
      style={{ color: theme.colorTextDescription, fontSize: 12, marginRight: 12 }}
    >
      <Hotkey keys={sendShortcut} />
      <span>{t('input.send')}</span>
      <span>/</span>
      <Hotkey keys={wrapperShortcut} />
      <span>{t('input.warp')}</span>
    </Flexbox>
  );
});

export default ShortcutHint;
