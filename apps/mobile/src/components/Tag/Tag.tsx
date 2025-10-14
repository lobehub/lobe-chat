import { memo } from 'react';
import { View } from 'react-native';

import Text from '../Text';
import { useStyles } from './style';
import { TagProps } from './type';

export const Tag = memo<TagProps>(({ children, color, border = true, style, textStyle }) => {
  const { styles } = useStyles(color, border);

  return (
    <View style={[styles.tag, style]}>
      <Text style={[styles.tagText, textStyle]}>{children}</Text>
    </View>
  );
});

Tag.displayName = 'Tag';

export default Tag;
