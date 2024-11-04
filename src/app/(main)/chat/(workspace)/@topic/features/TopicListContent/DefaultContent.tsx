import { Icon, Tag } from '@lobehub/ui';
import { Typography } from 'antd';
import { useTheme } from 'antd-style';
import { MessageSquareDashed } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const { Paragraph } = Typography;

const DefaultContent = memo(() => {
  const { t } = useTranslation('topic');

  const theme = useTheme();

  return (
    <Flexbox align={'center'} gap={8} horizontal>
      <Flexbox align={'center'} height={24} justify={'center'} width={24}>
        <Icon color={theme.colorTextDescription} icon={MessageSquareDashed} />
      </Flexbox>
      <Paragraph ellipsis={{ rows: 1 }} style={{ margin: 0 }}>
        {t('defaultTitle')}
      </Paragraph>
      <Tag>{t('temp')}</Tag>
    </Flexbox>
  );
});

export default DefaultContent;
