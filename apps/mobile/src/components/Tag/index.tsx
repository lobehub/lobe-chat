import React from 'react';
import { Text, View, ViewStyle, TextStyle } from 'react-native';
import { useStyles } from './style';
import type { PresetColorKey } from '@/theme/interface/presetColors';

export interface TagProps {
  children: string;
  color?: PresetColorKey;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Tag: React.FC<TagProps> = ({ children, color, style, textStyle }) => {
  const { styles } = useStyles(color);

  return (
    <View style={[styles.tag, style]}>
      <Text style={[styles.tagText, textStyle]}>{children}</Text>
    </View>
  );
};

export default Tag;
