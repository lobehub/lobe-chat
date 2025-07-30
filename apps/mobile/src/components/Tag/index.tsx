import React from 'react';
import { Text, View, ViewStyle, TextStyle } from 'react-native';
import { useStyles } from './style';

export interface TagProps {
  children: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Tag: React.FC<TagProps> = ({ children, style, textStyle }) => {
  const { styles } = useStyles();

  return (
    <View style={[styles.tag, style]}>
      <Text style={[styles.tagText, textStyle]}>{children}</Text>
    </View>
  );
};

export default Tag;
