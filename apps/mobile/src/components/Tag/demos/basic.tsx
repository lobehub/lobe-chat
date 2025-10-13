import { Tag } from '@lobehub/ui-rn';
import { View } from 'react-native';

const BasicDemo = () => {
  return (
    <View style={{ padding: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Tag>React</Tag>
        <Tag>TypeScript</Tag>
        <Tag>JavaScript</Tag>
        <Tag>React Native</Tag>
      </View>
    </View>
  );
};

export default BasicDemo;
