import { Skeleton } from '@lobehub/ui-rn';
import React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

const BasicDemo: React.FC = () => {
  const token = useTheme();

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
