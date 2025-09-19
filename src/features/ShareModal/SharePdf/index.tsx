import { Button } from '@lobehub/ui';
import { App } from 'antd';
import isEqual from 'fast-deep-equal';
import { DownloadIcon, FileText } from 'lucide-react';
import { memo } from 'react';
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

  const handleGeneratePdf = async () => {
    if (activeId && messages.length > 0 && markdownContent.trim()) {
      await generatePdf({
        content: markdownContent,
        sessionId: activeId,
        title,
        topicId: topicId || undefined,
      });
    }
  };

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

  const generateButton = (
    <Button
      block
      disabled={loading}
      icon={loading ? undefined : FileText}
      loading={loading}
      onClick={handleGeneratePdf}
      size={isMobile ? undefined : 'large'}
      type="primary"
    >
      {loading
        ? t('shareModal.generatingPdf')
        : pdfData
          ? t('shareModal.regeneratePdf', { defaultValue: '重新生成 PDF' })
          : t('shareModal.generatePdf', { defaultValue: '生成 PDF' })
      }
    </Button>
  );

  const downloadButton = pdfData ? (
    <Button
      block
      icon={DownloadIcon}
      onClick={handleDownload}
      size={isMobile ? undefined : 'large'}
      type="default"
    >
      {t('shareModal.downloadPdf')}
    </Button>
  ) : null;

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
          {generateButton}
        </Flexbox>
      </Flexbox>
    );
  }

  return (
    <Flexbox className={styles.body} gap={16} horizontal={!isMobile}>
      <PdfPreview
        loading={loading}
        pdfData={pdfData}
      />
      <Flexbox className={styles.sidebar} gap={12}>
        {generateButton}
        {downloadButton}
      </Flexbox>
    </Flexbox>
  );
});

export default SharePdf;