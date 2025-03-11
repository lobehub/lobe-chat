import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import CircleLoader from '@/components/CircleLoader';
import { shinyTextStylish } from '@/styles/loading';

const useStyles = createStyles(({ token }) => ({
  shinyText: shinyTextStylish(token),
}));

const IntentUnderstanding = () => {
  const { styles } = useStyles();
  const { t } = useTranslation('chat');

  return (
    <Flexbox align={'center'} gap={8} horizontal>
      <CircleLoader />
      <Flexbox className={styles.shinyText} horizontal>
        {t('intentUnderstanding.title')}
      </Flexbox>
    </Flexbox>
  );
};
export default IntentUnderstanding;
