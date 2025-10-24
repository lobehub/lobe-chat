import { Block, Flexbox, Text } from '@lobehub/ui-rn';
import { useState } from 'react';
import { Alert } from 'react-native';

export default () => {
  const [clickCount, setClickCount] = useState(0);

  const handlePress = () => {
    setClickCount((prev) => prev + 1);
    Alert.alert('Block 点击', `你点击了: ${clickCount + 1}`);
  };

  return (
    <Flexbox gap={16}>
      <Block onPress={handlePress} padding={16} pressEffect>
        <Text>Clickable Variant Filled Block</Text>
      </Block>
      <Block onPress={handlePress} padding={16} pressEffect variant={'outlined'}>
        <Text>Clickable Variant Outlined Block</Text>
      </Block>
      <Block onPress={handlePress} padding={16} pressEffect variant={'borderless'}>
        <Text>Clickable Variant Borderless Block</Text>
      </Block>
      <Block onPress={handlePress} padding={16} pressEffect shadow variant={'outlined'}>
        <Text>Clickable Shadow Block</Text>
      </Block>
    </Flexbox>
  );
};
