import { IDocument } from '@cyntler/react-doc-viewer';
import { Button, FluentEmoji } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import React, { ComponentType, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { downloadFile } from '@/utils/client/downloadFile';

const useStyles = createStyles(({ css, token }) => ({
  page: css`
    width: 100%;
    margin: 12px;
    padding: 24px;
    border-radius: 4px;

    background: ${token.colorBgContainer};
    box-shadow: ${token.boxShadowTertiary};
  `,
}));

const NotSupport: ComponentType<{
  document: IDocument | undefined;
  fileName: string;
}> = ({ fileName, document: doc }) => {
  const { styles } = useStyles();

  const { t } = useTranslation('file');

  const [loading, setLoading] = useState(false);

  return (
    <Flexbox className={styles.page} id="txt-renderer">
      <Center height={'100%'}>
        <Flexbox align={'center'} gap={12}>
          <FluentEmoji emoji={'👀'} size={64} />
          <Flexbox style={{ textAlign: 'center' }}>
            {t('preview.unsupportedFile')}
          </Flexbox>
          <Button
            loading={loading}
            onClick={async () => {
              if (!doc) return;
              setLoading(true);
              await downloadFile(doc.uri, fileName);
              setLoading(false);
            }}
          >
            {t('preview.downloadFile')}
          </Button>
        </Flexbox>
      </Center>
    </Flexbox>
  );
};

export default NotSupport;
