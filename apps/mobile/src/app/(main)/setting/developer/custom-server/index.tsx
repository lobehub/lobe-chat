import { PageContainer } from '@lobehub/ui-rn';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import CustomServer from '../_features/CustomServer';
import { useStyles } from './_features/style';

const CustomServerScreen = () => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();

  return (
    <PageContainer showBack title={t('developer.server.title')}>
      <View style={styles.container}>
        <CustomServer />
      </View>
    </PageContainer>
  );
};

export default CustomServerScreen;
