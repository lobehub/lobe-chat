import React, { memo } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { useStyles } from './style';

export interface IScaleColumn {
  color: string;
  index: number;
  isAlpha: boolean;
  name: string;
  type: 'light' | 'lightA' | 'dark' | 'darkA';
}

const ScaleColumn = memo<IScaleColumn>(({ color, index, isAlpha, name, type }) => {
  const { styles } = useStyles();

  const handleColorPress = async () => {
    const content = `token.${name}${index}${isAlpha ? 'A' : ''} /* ${color} */`;

    try {
      await Clipboard.setStringAsync(content);
      Alert.alert('已复制', content);
    } catch {
      Alert.alert('复制失败', '无法复制到剪贴板');
    }
  };

  // 设置背景样式
  let backgroundStyle = {};
  if (type === 'lightA') {
    backgroundStyle = { backgroundColor: '#fff' };
  } else if (type === 'darkA') {
    backgroundStyle = { backgroundColor: '#000' };
  }

  return (
    <View style={styles.colorColumn}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleColorPress}
        style={[styles.colorBox, backgroundStyle, isAlpha && styles.alphaBackground]}
      >
        <View style={[styles.colorItem, { backgroundColor: color }]} />
      </TouchableOpacity>
    </View>
  );
});

ScaleColumn.displayName = 'ScaleColumn';

export default ScaleColumn;
