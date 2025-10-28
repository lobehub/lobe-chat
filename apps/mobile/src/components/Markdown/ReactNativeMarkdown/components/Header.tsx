import { memo } from 'react';
import { Components } from 'react-markdown';
import { Text } from 'react-native';

import Divider from '@/components/Divider';

import { useStyles } from '../style';
import { BlockContext } from './context';

export const H1: Components['h1'] = memo(({ children }) => {
  const { styles } = useStyles();
  return (
    <BlockContext.Provider value={{ type: 'h1' }}>
      <Text style={[styles.text, styles.heading, styles.heading1]}>{children}</Text>
    </BlockContext.Provider>
  );
});

export const H2: Components['h2'] = memo(({ children, id }) => {
  const { styles } = useStyles();
  if (id === 'footnote-label') {
    return <Divider style={{ margin: 8 }} />;
  }
  return (
    <BlockContext.Provider value={{ type: 'h2' }}>
      <Text style={[styles.text, styles.heading, styles.heading2]}>{children}</Text>
    </BlockContext.Provider>
  );
});

export const H3: Components['h3'] = memo(({ children }) => {
  const { styles } = useStyles();
  return (
    <BlockContext.Provider value={{ type: 'h3' }}>
      <Text style={[styles.text, styles.heading, styles.heading3]}>{children}</Text>
    </BlockContext.Provider>
  );
});

export const H4: Components['h4'] = memo(({ children }) => {
  const { styles } = useStyles();
  return (
    <BlockContext.Provider value={{ type: 'h4' }}>
      <Text style={[styles.text, styles.heading, styles.heading4]}>{children}</Text>
    </BlockContext.Provider>
  );
});

export const H5: Components['h5'] = memo(({ children }) => {
  const { styles } = useStyles();
  return (
    <BlockContext.Provider value={{ type: 'h5' }}>
      <Text style={[styles.text, styles.heading, styles.heading5]}>{children}</Text>
    </BlockContext.Provider>
  );
});

export const H6: Components['h6'] = memo(({ children }) => {
  const { styles } = useStyles();
  return (
    <BlockContext.Provider value={{ type: 'h6' }}>
      <Text style={[styles.text, styles.heading, styles.heading6]}>{children}</Text>
    </BlockContext.Provider>
  );
});
