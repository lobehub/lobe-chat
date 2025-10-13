import { Skeleton, Text, useTheme } from '@lobehub/ui-rn';
import type { FC } from 'react';
import { View } from 'react-native';

const AvatarDemo: FC = () => {
  const token = useTheme();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: token.colorText, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Avatar Skeleton
      </Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          With Avatar
        </Text>
        <Skeleton avatar />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Large Avatar
        </Text>
        <Skeleton avatar={{ size: 60 }} />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Square Avatar
        </Text>
        <Skeleton avatar={{ shape: 'square', size: 50 }} />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Without Avatar
        </Text>
        <Skeleton avatar={false} />
      </View>
    </View>
  );
};

export default AvatarDemo;
