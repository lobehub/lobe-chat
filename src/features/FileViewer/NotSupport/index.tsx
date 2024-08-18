import { IDocument } from '@cyntler/react-doc-viewer';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import React, { ComponentType, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { downloadFile } from '@/utils/downloadFile';

const useStyles = createStyles(({ css, token }) => ({
  page: css`
    width: 100%;
    margin: 12px;
    padding: 24px;

    background: ${token.colorBgContainer};
    border-radius: 4px;
    box-shadow: ${token.boxShadowTertiary};
  `,
}));

const NotSupport: ComponentType<{
  document: IDocument | undefined;
  fileName: string;
}> = ({ fileName, document: doc }) => {
  const { styles } = useStyles();

  const { t } = useTranslation(['file', 'common']);

  const [loading, setLoading] = useState(false);

  return (
    <Flexbox className={styles.page} id="txt-renderer">
      <Center height={'100%'}>
        <Flexbox align={'center'} gap={12}>
          {t('preview.unsupportedFile')}
          <Button
            loading={loading}
            onClick={async () => {
              if (!doc) return;
              setLoading(true);
              await downloadFile(doc.uri, fileName);
              setLoading(false);
            }}
          >
            {t('download', { ns: 'common' })}
          </Button>
        </Flexbox>
      </Center>
    </Flexbox>
  );
};

export default NotSupport;
