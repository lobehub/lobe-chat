'use client';

import { Center, Flexbox, Highlighter } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import CircleLoading from '@/components/Loading/CircleLoading';

import { useTextFileLoader } from '../../hooks/useTextFileLoader';

const useStyles = createStyles(({ css, token }) => ({
  page: css`
    width: 100%;
    padding: ${token.paddingLG}px;
    background: ${token.colorBgContainer};
  `,
}));

interface MarkdownViewerProps {
  fileId: string;
  url: string | null;
}

const MarkdownViewer = memo<MarkdownViewerProps>(({ url }) => {
  const { styles } = useStyles();
  const { fileData, loading } = useTextFileLoader(url);

  return (
    <Flexbox className={styles.page} id="markdown-renderer">
      {!loading && fileData ? (
        <Highlighter
          copyable={false}
          language={'markdown'}
          showLanguage={false}
          variant={'borderless'}
        >
          {fileData}
        </Highlighter>
      ) : (
        <Center height={'100%'}>
          <CircleLoading />
        </Center>
      )}
    </Flexbox>
  );
});

export default MarkdownViewer;
