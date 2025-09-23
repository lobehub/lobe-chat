import React from 'react';

import { Header } from '@/components';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { useStyles } from './style';

const TopicHeader: React.FC = () => {
  const { styles } = useStyles();
  const { t } = useTranslation(['topic']);

  return <Header left={<Text style={styles.headerTitle}>{t('title')}</Text>} />;
};

export default TopicHeader;
