import { Button } from '@lobehub/ui';
import { App, Input } from 'antd';
import isEqual from 'fast-deep-equal';
import { ChevronLeft, ChevronRight, DownloadIcon } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors, topicSelectors } from '@/store/chat/selectors';

import { generateMarkdown } from '../ShareText/template';
import { useContainerStyles, useStyles } from '../style';
import PdfPreview from './PdfPreview';
import { usePdfGeneration } from './usePdfGeneration';

const SharePdf = memo(() => {
  const { t } = useTranslation(['chat', 'common']);
  const { styles } = useStyles();
  const { styles: containerStyles } = useContainerStyles();
  const { message } = App.useApp();
  const isMobile = useIsMobile();

  // Use the same data gathering logic as ShareText
  const [systemRole] = useAgentStore((s) => [agentSelectors.currentAgentSystemRole(s)]);
  const messages = useChatStore(chatSelectors.activeBaseChats, isEqual);
  const topic = useChatStore(topicSelectors.currentActiveTopic, isEqual);
  const activeId = useChatStore((s) => s.activeId);
  const topicId = useChatStore((s) => s.activeTopicId);

  const title = topic?.title || t('shareModal.exportTitle');

  // Generate markdown content using the same logic as ShareText
  const markdownContent = generateMarkdown({
    includeTool: true,
    includeUser: true,
    messages,
    systemRole,
    title,
    withRole: true,
    withSystemRole: !!systemRole,
  }).replaceAll('\n\n\n', '\n');

  const { generatePdf, downloadPdf, pdfData, loading, error } = usePdfGeneration();

  // Page navigation state
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  // Generate PDF when component mounts
  useEffect(() => {
    if (activeId && messages.length > 0 && markdownContent.trim()) {
      generatePdf({
        content: markdownContent,
        sessionId: activeId,
        title,
        topicId: topicId || undefined,
      });
    }
  }, [activeId, topicId, markdownContent, title, generatePdf]);

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

  const getButtonText = () => {
    if (loading) return t('shareModal.generatingPdf');
    if (pdfData && !loading) return t('shareModal.downloadPdf');
    return t('shareModal.downloadPdf');
  };

  const button = (
    <Button
      block
      disabled={!pdfData || loading}
      icon={loading ? undefined : DownloadIcon}
      loading={loading}
      onClick={handleDownload}
      size={isMobile ? undefined : 'large'}
      type="primary"
    >
      {getButtonText()}
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
        <PdfPreview
          loading={loading}
          pageNumber={pageNumber}
          pdfData={pdfData}
          onLoadSuccess={setNumPages}
        />
        <Flexbox className={styles.sidebar} gap={12}>
          {!isMobile && button}
          {!isMobile && numPages > 1 && (
            <Flexbox align="center" gap={8} horizontal justify="center">
              <Button
                disabled={pageNumber <= 1}
                icon={<ChevronLeft size={16} />}
                onClick={goToPrevPage}
                size="small"
                type="text"
              />
              <Flexbox align="center" gap={4} horizontal>
                <Input
                  max={numPages}
                  min={1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) goToPage(value);
                  }}
                  size="small"
                  style={{ textAlign: 'center', width: 50 }}
                  type="number"
                  value={pageNumber}
                />
                <span style={{ color: '#666', fontSize: '12px' }}>/ {numPages}</span>
              </Flexbox>
              <Button
                disabled={pageNumber >= numPages}
                icon={<ChevronRight size={16} />}
                onClick={goToNextPage}
                size="small"
                type="text"
              />
            </Flexbox>
          )}
        </Flexbox>
      </Flexbox>
      {isMobile && (
        <Flexbox className={styles.footer} gap={8}>
          {button}
          {numPages > 1 && (
            <Flexbox align="center" gap={8} horizontal justify="center">
              <Button
                disabled={pageNumber <= 1}
                icon={<ChevronLeft size={16} />}
                onClick={goToPrevPage}
                size="small"
                type="text"
              />
              <Flexbox align="center" gap={4} horizontal>
                <Input
                  max={numPages}
                  min={1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) goToPage(value);
                  }}
                  size="small"
                  style={{ textAlign: 'center', width: 50 }}
                  type="number"
                  value={pageNumber}
                />
                <span style={{ color: '#666', fontSize: '12px' }}>/ {numPages}</span>
              </Flexbox>
              <Button
                disabled={pageNumber >= numPages}
                icon={<ChevronRight size={16} />}
                onClick={goToNextPage}
                size="small"
                type="text"
              />
            </Flexbox>
          )}
        </Flexbox>
      )}
    </>
  );
});

export default SharePdf;