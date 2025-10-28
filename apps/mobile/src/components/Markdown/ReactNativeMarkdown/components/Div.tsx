import { PropsWithChildren, memo } from 'react';
import { View } from 'react-native';

import { useStyles } from '../style';
import TextWrapper from './TextWrapper';

const Div = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <View pointerEvents={'box-none'} style={styles.div}>
      <TextWrapper>{children}</TextWrapper>
    </View>
  );
});

export default Div;
