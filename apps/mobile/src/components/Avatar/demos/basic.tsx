import { Avatar } from '@lobehub/ui-rn';
import { View } from 'react-native';

const BasicDemo = () => {
  return (
    <View style={{ padding: 16 }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 16,
        }}
      >
        <Avatar alt="LobeHub" avatar="https://github.com/lobehub.png" />
        <Avatar alt="Anthropic" avatar="https://github.com/anthropics.png" />
        <Avatar alt="Vercel" avatar="https://github.com/vercel.png" />
      </View>
    </View>
  );
};

export default BasicDemo;
