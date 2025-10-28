import { memo } from 'react';
import { Components } from 'react-markdown';
import { Text } from 'react-native';

import { useStyles } from '../style';
import { InlineMath } from './Math';

const Code: Components['code'] = memo(({ children, node }) => {
  const { styles } = useStyles();

  if (
    node &&
    (node as any)?.properties?.className?.includes('math-inline') &&
    (node as any)?.children
  ) {
    return node.children.map((child: any, index) => (
      <InlineMath key={index}>{child.value}</InlineMath>
    ));
  }

  return (
    <Text style={[styles.text, styles.code]}>
      <Text style={{ fontSize: 8 }}> </Text>
      {children}
      <Text style={{ fontSize: 8 }}> </Text>
    </Text>
  );
});

export default Code;
