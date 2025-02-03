import { Icon } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import { ChevronUp, CornerDownLeft, LucideCommand } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';
import { isMacOS } from '@/utils/platform';

const ShortcutHint = memo(() => {
  const { t } = useTranslation('chat');
  const theme = useTheme();
  const useCmdEnterToSend = useUserStore(preferenceSelectors.useCmdEnterToSend);
  const [isMac, setIsMac] = useState<boolean>();

  useEffect(() => {
    setIsMac(isMacOS());
  }, []);

  const cmdEnter = (
    <Flexbox gap={2} horizontal>
      {typeof isMac === 'boolean' ? (
        <Icon icon={isMac ? LucideCommand : ChevronUp} />
      ) : (
        <Skeleton.Node active style={{ height: '100%', width: 12 }}>
          {' '}
        </Skeleton.Node>
      )}
      <Icon icon={CornerDownLeft} />
    </Flexbox>
  );

  const enter = (
    <Center>
      <Icon icon={CornerDownLeft} />
    </Center>
  );

  const sendShortcut = useCmdEnterToSend ? cmdEnter : enter;

  const wrapperShortcut = useCmdEnterToSend ? enter : cmdEnter;

  return (
    <Flexbox
      gap={4}
      horizontal
      style={{ color: theme.colorTextDescription, fontSize: 12, marginRight: 12 }}
    >
      {sendShortcut}
      <span>{t('input.send')}</span>
      <span>/</span>
      {wrapperShortcut}
      <span>{t('input.warp')}</span>
    </Flexbox>
  );
});

export default ShortcutHint;
