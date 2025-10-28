import { PropsWithChildren, memo } from 'react';
import { Text } from 'react-native';

import { useStyles } from '../style';
import { BlockContext } from './context';

export const H1 = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <BlockContext.Provider value={{ type: 'h1' }}>
      <Text style={[styles.text, styles.heading, styles.heading1]}>{children}</Text>
    </BlockContext.Provider>
  );
});

export const H2 = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <BlockContext.Provider value={{ type: 'h2' }}>
      <Text style={[styles.text, styles.heading, styles.heading2]}>{children}</Text>
    </BlockContext.Provider>
  );
});

export const H3 = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <BlockContext.Provider value={{ type: 'h3' }}>
      <Text style={[styles.text, styles.heading, styles.heading3]}>{children}</Text>
    </BlockContext.Provider>
  );
});

export const H4 = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <BlockContext.Provider value={{ type: 'h4' }}>
      <Text style={[styles.text, styles.heading, styles.heading4]}>{children}</Text>
    </BlockContext.Provider>
  );
});

export const H5 = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <BlockContext.Provider value={{ type: 'h5' }}>
      <Text style={[styles.text, styles.heading, styles.heading5]}>{children}</Text>
    </BlockContext.Provider>
  );
});

export const H6 = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <BlockContext.Provider value={{ type: 'h6' }}>
      <Text style={[styles.text, styles.heading, styles.heading6]}>{children}</Text>
    </BlockContext.Provider>
  );
});
