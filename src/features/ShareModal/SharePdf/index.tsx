import { Button } from '@lobehub/ui';
import { App } from 'antd';
import { DownloadIcon } from 'lucide-react';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useChatStore } from '@/store/chat';

import { useContainerStyles, useStyles } from '../style';
import PdfPreview from './PdfPreview';
import { usePdfGeneration } from './usePdfGeneration';

const SharePdf = memo(() => {
  const { t } = useTranslation(['chat', 'common']);
  const { styles } = useStyles();
  const { styles: containerStyles } = useContainerStyles();
  const { message } = App.useApp();
  const isMobile = useIsMobile();

  const activeId = useChatStore((s) => s.activeId);
  const topicId = useChatStore((s) => s.activeTopicId);

  const { generatePdf, downloadPdf, pdfData, loading, error } = usePdfGeneration();

  // Generate PDF when component mounts
  useEffect(() => {
    if (activeId) {
      generatePdf(activeId, topicId || undefined);
    }
  }, [activeId, topicId, generatePdf]);

  const handleDownload = async () => {
    if (pdfData) {
      try {
        await downloadPdf();
        message.success(t('shareModal.downloadSuccess'));
      } catch {
        message.error(t('shareModal.downloadError'));
      }
    }
  };

  const button = (
    <Button
      block
      disabled={!pdfData || loading}
      icon={DownloadIcon}
      loading={loading}
      onClick={handleDownload}
      size={isMobile ? undefined : 'large'}
      type="primary"
    >
      {t('shareModal.downloadPdf')}
    </Button>
  );

  if (error) {
    return (
      <Flexbox className={styles.body} gap={16} horizontal={!isMobile}>
        <div className={containerStyles.preview} style={{ padding: 12 }}>
          <div style={{ color: 'red', textAlign: 'center' }}>
            {t('shareModal.pdfGenerationError')}: {error}
          </div>
        </div>
        <Flexbox className={styles.sidebar} gap={12}>
          <div>{t('shareModal.pdfErrorDescription')}</div>
        </Flexbox>
      </Flexbox>
    );
  }

  return (
    <>
      <Flexbox className={styles.body} gap={16} horizontal={!isMobile}>
        <PdfPreview loading={loading} pdfData={pdfData} />
        <Flexbox className={styles.sidebar} gap={12}>
          {loading && <div>{t('shareModal.generatingPdf')}</div>}
          {pdfData && !loading && <div>{t('shareModal.pdfReady')}</div>}
          {!isMobile && button}
        </Flexbox>
      </Flexbox>
      {isMobile && (
        <Flexbox className={styles.footer} gap={8} horizontal>
          {button}
        </Flexbox>
      )}
    </>
  );
});

export default SharePdf;