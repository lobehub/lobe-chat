import { Children, PropsWithChildren, ReactNode, memo } from 'react';
import { TextProps } from 'react-native';

import Text from '@/components/Text';

import { useStyles } from '../style';

function wrapChildren(children: ReactNode, props: TextProps) {
  return Children.map(children, (child) => {
    if (!child) return null;
    if (typeof child === 'string') {
      if (!child.trim()) return null;
      return <Text {...props}>{child}</Text>;
    }
    return child;
  })?.filter(Boolean);
}

const TextWrapper = memo<PropsWithChildren<TextProps>>(({ children, style, ...rest }) => {
  const { styles } = useStyles();
  return wrapChildren(children, {
    style: [styles.text, style].flat(),
    ...rest,
  });
});

export default TextWrapper;
