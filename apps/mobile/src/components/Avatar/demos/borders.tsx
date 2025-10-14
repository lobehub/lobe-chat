import { Avatar, Text, useTheme } from '@lobehub/ui-rn';
import { View } from 'react-native';

const BordersDemo = () => {
  const token = useTheme();

  return (
    <View style={{ padding: 16 }}>
      <Text
        style={{
          color: token.colorText,
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 12,
        }}
      >
        带边框
      </Text>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 16,
        }}
      >
        <Avatar alt="LobeHub" avatar="https://github.com/lobehub.png" size={48} />
        <Avatar alt="LobeHub" avatar="https://github.com/lobehub.png" size={48} />
        <Avatar alt="LobeHub" avatar="https://github.com/lobehub.png" size={48} />
      </View>
    </View>
  );
};

export default BordersDemo;
