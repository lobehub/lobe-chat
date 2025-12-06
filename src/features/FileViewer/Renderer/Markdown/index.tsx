import { DocRenderer, textFileLoader } from '@cyntler/react-doc-viewer';
import { Highlighter } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import React from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import CircleLoading from '@/components/Loading/CircleLoading';

const useStyles = createStyles(({ css, token }) => ({
  page: css`
    width: 100%;
    padding: ${token.paddingLG}px;
    background: ${token.colorBgContainer};
  `,
}));

const MarkdownViewer: DocRenderer = ({ mainState: { currentDocument } }) => {
  const { styles } = useStyles();
  return (
    <Flexbox className={styles.page} id="markdown-renderer">
      {!!currentDocument?.fileData ? (
        <Highlighter
          copyable={false}
          language={'markdown'}
          showLanguage={false}
          variant={'borderless'}
        >
          {currentDocument?.fileData as string}
        </Highlighter>
      ) : (
        <Center height={'100%'}>
          <CircleLoading />
        </Center>
      )}
    </Flexbox>
  );
};

export default MarkdownViewer;

MarkdownViewer.fileTypes = ['md', 'mdx', 'text/markdown', 'text/x-markdown'];
MarkdownViewer.weight = 0;
MarkdownViewer.fileLoader = textFileLoader;
