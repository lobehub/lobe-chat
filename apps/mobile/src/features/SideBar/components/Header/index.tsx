import { Link } from 'expo-router';
import { Sparkles, CompassIcon } from 'lucide-react-native';
import React from 'react';
import { Text } from 'react-native';

import { isDev } from '@/utils/env';
import { useStyles } from './style';
import { ActionIcon, Space, Header } from '@/components';

const SessionHeader: React.FC = () => {
  const { styles } = useStyles();

  return (
    <Header
      left={<Text style={styles.headerTitle}>LobeChat</Text>}
      right={
        <Space>
          {isDev && (
            <Link asChild href="/playground">
              <ActionIcon icon={Sparkles} />
            </Link>
          )}
          <Link asChild href="/discover/assistant">
            <ActionIcon icon={CompassIcon} />
          </Link>
        </Space>
      }
    />
  );
};

export default SessionHeader;
