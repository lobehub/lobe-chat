import { ColorScales, colorScales } from '@lobehub/ui-rn';
import { ScrollView, View } from 'react-native';

const BasicDemo = () => {
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} style={{ flex: 1 }}>
      <View style={{ gap: 32 }}>
        <ColorScales midHighLight={9} name="primary" scale={colorScales.primary} />
        <ColorScales midHighLight={9} name="red" scale={colorScales.red} />
        <ColorScales midHighLight={9} name="blue" scale={colorScales.blue} />
        <ColorScales midHighLight={9} name="green" scale={colorScales.green} />
      </View>
    </ScrollView>
  );
};

export default BasicDemo;
