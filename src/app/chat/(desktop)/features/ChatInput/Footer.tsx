import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { ArrowBigUp, CornerDownLeft } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SaveTopic from '../../../features/ChatInputContent/Topic';

const Footer = memo(() => {
  const theme = useTheme();
  const { t } = useTranslation('chat');

  return (
    <>
      <Flexbox
        gap={4}
        horizontal
        style={{ color: theme.colorTextDescription, fontSize: 12, marginRight: 12 }}
      >
        <Icon icon={CornerDownLeft} />
        <span>{t('send')}</span>
        <span>/</span>
        <Flexbox horizontal>
          <Icon icon={ArrowBigUp} />
          <Icon icon={CornerDownLeft} />
        </Flexbox>
        <span>{t('warp')}</span>
      </Flexbox>
      <SaveTopic />
    </>
  );
});

export default Footer;
