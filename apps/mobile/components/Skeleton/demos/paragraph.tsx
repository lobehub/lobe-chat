import React from 'react';
import { View, Text } from 'react-native';

import { useThemeToken } from '@/mobile/theme';
import Skeleton from '../index';

const ParagraphDemo: React.FC = () => {
  const token = useThemeToken();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: token.colorText, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Paragraph Skeleton
      </Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Default Paragraph
        </Text>
        <Skeleton avatar={false} />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Custom Rows
        </Text>
        <Skeleton avatar={false} paragraph={{ rows: 5 }} />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Custom Width
        </Text>
        <Skeleton avatar={false} paragraph={{ width: '80%' }} />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Different Width per Line
        </Text>
        <Skeleton
          avatar={false}
          paragraph={{
            rows: 4,
            width: ['100%', '90%', '75%', '50%'],
          }}
        />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          No Paragraph
        </Text>
        <Skeleton avatar={false} paragraph={false} />
      </View>
    </View>
  );
};

export default ParagraphDemo;
