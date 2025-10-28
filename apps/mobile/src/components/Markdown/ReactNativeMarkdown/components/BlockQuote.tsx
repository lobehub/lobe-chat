import { BlockQuote as BQ } from '@expo/html-elements';
import { memo } from 'react';
import { Components } from 'react-markdown';

import { useStyles } from '../style';
import TextWrapper from './TextWrapper';
import { BlockContext } from './context';

const BlockQuote: Components['blockquote'] = memo(({ children }) => {
  const { styles } = useStyles();
  return (
    <BlockContext.Provider value={{ type: 'blockquote' }}>
      <BQ style={styles.blockquote}>
        <TextWrapper>{children}</TextWrapper>
      </BQ>
    </BlockContext.Provider>
  );
});

export default BlockQuote;
