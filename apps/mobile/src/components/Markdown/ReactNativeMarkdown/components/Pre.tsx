import { memo } from 'react';
import { Components } from 'react-markdown';

import Highlighter from '@/components/Highlighter';
import Mermaid from '@/components/Mermaid';

import { useStyles } from '../style';
import { MathBlock } from './Math';

const countLines = (str: string): number => {
  const regex = /\n/g;
  const matches = str.match(regex);
  return matches ? matches.length : 1;
};

const useCode = (raw: any) => {
  if (!raw) return;

  const { children, className } = raw.props;

  if (!children) return;

  const content = Array.isArray(children) ? (children[0] as string) : children;

  const lang = className?.replace('language-', '') || 'plaintext';

  const isSingleLine = countLines(content) <= 1 && content.length <= 32;

  return {
    content,
    isSingleLine,
    lang,
  };
};

const Pre: Components['pre'] = memo(({ children }) => {
  const { styles } = useStyles();

  const code = useCode(children);

  if (!code) return;

  if (code.lang === 'math math-display') {
    return <MathBlock>{code.content}</MathBlock>;
  }

  if (code.lang === 'mermaid') {
    return <Mermaid code={code.content} style={styles.codeBlock} variant={'borderless'} />;
  }

  return <Highlighter code={code.content} fullFeatured lang={code.lang} style={styles.codeBlock} />;
});

export default Pre;
