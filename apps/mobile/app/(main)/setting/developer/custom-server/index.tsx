import { PageContainer } from '@lobehub/ui-rn';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import CustomServer from '@/features/setting/developer/CustomServer';

import { useStyles } from './style';

const CustomServerScreen = () => {
  const { t } = useTranslation(['setting']);
  const { styles } = useStyles();

  return (
    <PageContainer showBack title={t('developer.server.title', { ns: 'setting' })}>
      <View style={styles.container}>
        <CustomServer />
      </View>
    </PageContainer>
  );
};

export default CustomServerScreen;
