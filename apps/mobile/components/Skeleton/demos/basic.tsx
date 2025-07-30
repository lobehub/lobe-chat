import React from 'react';
import { View, Text } from 'react-native';

import { useThemeToken } from '@/mobile/theme';
import Skeleton from '../index';

const BasicDemo: React.FC = () => {
  const token = useThemeToken();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: token.colorText, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Basic Skeleton
      </Text>

      <Skeleton />

      <View style={{ marginTop: 20 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Without Animation
        </Text>
        <Skeleton animated={false} />
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Loading Complete
        </Text>
        <Skeleton loading={false}>
          <Text style={{ color: token.colorText }}>
            This is the actual content that appears when loading is complete.
          </Text>
        </Skeleton>
      </View>
    </View>
  );
};

export default BasicDemo;
