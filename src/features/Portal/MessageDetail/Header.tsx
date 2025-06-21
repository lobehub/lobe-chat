import { Text } from '@lobehub/ui';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { oneLineEllipsis } from '@/styles';

const Header = () => {
  const { t } = useTranslation('portal');

  return (
    <Flexbox align={'center'} gap={4} horizontal>
      <Text className={oneLineEllipsis} style={{ fontSize: 16 }} type={'secondary'}>
        {t('messageDetail')}
      </Text>
    </Flexbox>
  );
};

export default Header;
