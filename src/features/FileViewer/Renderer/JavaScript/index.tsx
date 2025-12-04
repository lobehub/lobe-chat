import { DocRenderer, textFileLoader } from '@cyntler/react-doc-viewer';
import { Highlighter } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import React from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import CircleLoading from '@/components/Loading/CircleLoading';

const useStyles = createStyles(({ css, token }) => ({
  page: css`
    width: 100%;
    padding: 24px;
    border-radius: 4px;

    background: ${token.colorBgContainer};
    box-shadow: ${token.boxShadowTertiary};
  `,
}));

const getLanguage = (fileName?: string): string => {
  if (!fileName) return 'javascript';
  const ext = fileName.toLowerCase().split('.').pop();
  switch (ext) {
    case 'ts': {
      return 'typescript';
    }
    case 'tsx': {
      return 'tsx';
    }
    case 'jsx': {
      return 'jsx';
    }
    default: {
      return 'javascript';
    }
  }
};

const JavaScriptViewer: DocRenderer = ({ mainState: { currentDocument } }) => {
  const { styles } = useStyles();
  const language = getLanguage(currentDocument?.fileName);

  return (
    <Flexbox className={styles.page} id="javascript-renderer">
      {!!currentDocument?.fileData ? (
        <Highlighter language={language} showLanguage={false} variant={'borderless'}>
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

export default JavaScriptViewer;

JavaScriptViewer.fileTypes = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'application/javascript',
  'application/x-javascript',
  'text/javascript',
  'application/typescript',
  'text/typescript',
];
JavaScriptViewer.weight = 0;
JavaScriptViewer.fileLoader = textFileLoader;
