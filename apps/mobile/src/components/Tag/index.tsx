import React from 'react';
import { Text, View, ViewStyle, TextStyle } from 'react-native';
import { useStyles } from './style';
import type { TagColor } from './type';

export interface TagProps {
  border?: boolean;
  children: string;
  color?: TagColor;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Tag: React.FC<TagProps> = ({ children, color, border = true, style, textStyle }) => {
  const { styles } = useStyles(color, border);

  return (
    <View style={[styles.tag, style]}>
      <Text style={[styles.tagText, textStyle]}>{children}</Text>
    </View>
  );
};

export default Tag;
