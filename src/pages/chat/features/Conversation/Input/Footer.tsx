import { Icon, Tooltip } from '@lobehub/ui';
import { Button } from 'antd';
import { useTheme } from 'antd-style';
import { ArrowBigUp, CornerDownLeft, LucideGalleryVerticalEnd } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

export interface FooterProps {
  hasTopic: boolean;
  saveToTopic: () => void;
}

const Footer = memo<FooterProps>(({ hasTopic, saveToTopic }) => {
  const theme = useTheme();
  const { t } = useTranslation('common');

  const saveTopic = hasTopic ? null : (
    <Tooltip title={t('topic.saveCurrentMessages')}>
      <Button icon={<Icon icon={LucideGalleryVerticalEnd} />} onClick={saveToTopic} />
    </Tooltip>
  );

  const footerTooltip = (
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
  );

  return (
    <>
      {footerTooltip}
      {saveTopic}
    </>
  );
});

export default Footer;
