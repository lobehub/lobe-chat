import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { oneLineEllipsis } from '@/styles';

const Header = () => {
  const { t } = useTranslation('portal');

  return (
    <Flexbox align={'center'} gap={4} horizontal>
      <Typography.Text className={oneLineEllipsis} style={{ fontSize: 16 }} type={'secondary'}>
        {t('messageDetail')}
      </Typography.Text>
    </Flexbox>
  );
};

export default Header;
