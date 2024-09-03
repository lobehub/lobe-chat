import { DocRenderer, textFileLoader } from '@cyntler/react-doc-viewer';
import { Highlighter } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import React from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import CircleLoading from '@/components/CircleLoading';

const useStyles = createStyles(({ css, token }) => ({
  page: css`
    width: 100%;
    padding: 24px;

    background: ${token.colorBgContainer};
    border-radius: 4px;
    box-shadow: ${token.boxShadowTertiary};
  `,
}));

const TXTViewer: DocRenderer = ({ mainState: { currentDocument } }) => {
  const { styles } = useStyles();
  return (
    <Flexbox className={styles.page} id="txt-renderer">
      {!!currentDocument?.fileData ? (
        <Highlighter language={'txt'} showLanguage={false} style={{ height: '100%' }} type={'pure'}>
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

export default TXTViewer;

TXTViewer.fileTypes = ['txt', 'text/plain'];
TXTViewer.weight = 0;
TXTViewer.fileLoader = textFileLoader;
