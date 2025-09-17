import { Button } from '@lobehub/ui';
import { App } from 'antd';
import { DownloadIcon } from 'lucide-react';
import { memo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import { useStyles } from '../style';
import PdfPreview from './PdfPreview';
import { usePdfGeneration } from './usePdfGeneration';

const SharePdf = memo(() => {
  const { t } = useTranslation(['chat', 'common']);
  const { styles } = useStyles();
  const { message } = App.useApp();
  const isMobile = useIsMobile();

  const activeId = useChatStore(chatSelectors.currentActiveSessionId);
  const topicId = useChatStore(chatSelectors.currentActiveTopicId);

  const { generatePdf, downloadPdf, pdfData, loading, error } = usePdfGeneration();

  // Generate PDF when component mounts
  useEffect(() => {
    if (activeId) {
      generatePdf(activeId, topicId);
    }
  }, [activeId, topicId, generatePdf]);

  const handleDownload = async () => {
    if (pdfData) {
      try {
        await downloadPdf();
        message.success(t('shareModal.downloadSuccess', { ns: 'common' }));
      } catch (error) {
        message.error(t('shareModal.downloadError', { ns: 'common' }));
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
        <div className={styles.preview} style={{ padding: 12 }}>
          <div style={{ textAlign: 'center', color: 'red' }}>
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