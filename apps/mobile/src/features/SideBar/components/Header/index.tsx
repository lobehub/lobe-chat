import { Link } from 'expo-router';
import { Sparkles, CompassIcon } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

import { isDev } from '@/utils/env';
import { useStyles } from './style';
import { ActionIcon, Space } from '@/components';

const SessionHeader: React.FC = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>LobeChat</Text>
      <Space>
        {isDev && (
          <Link asChild href="/playground">
            <ActionIcon icon={Sparkles} />
          </Link>
        )}
        <Link asChild href="/assistant/list">
          <ActionIcon icon={CompassIcon} />
        </Link>
      </Space>
    </View>
  );
};

export default SessionHeader;
