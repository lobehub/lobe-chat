import { PropsWithChildren, memo } from 'react';
import { MathJaxSvg } from 'react-native-mathjax-html-to-svg';

import Center from '@/components/Center';

import { useStyles } from '../style';

export const MathBlock = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();

  if (typeof children !== 'string') return;

  return (
    <Center style={styles.mathBlock}>
      <MathJaxSvg
        color={styles.text?.color}
        fontCache={true}
        fontSize={styles.text?.fontSize}
        textStyle={styles.text}
      >
        {`$$${children}$$`}
      </MathJaxSvg>
    </Center>
  );
});

export const InlineMath = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();

  if (typeof children !== 'string') return;

  return (
    <MathJaxSvg
      color={styles.text?.color}
      fontCache={true}
      fontSize={styles.text?.fontSize}
      textStyle={styles.text}
    >
      {`$${children}$`}
    </MathJaxSvg>
  );
});
