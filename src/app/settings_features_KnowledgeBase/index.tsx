// src/app/settings_features_KnowledgeBase/index.tsx
'use client';

import { Button, List, Popconfirm, Switch, Tag, Typography, message } from 'antd'; // Added List, Popconfirm, Tag
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'; // Added icon
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import {
  selectIndexedDocuments, // Added selector for indexed documents
  selectKnowledgeBaseSettings,
  selectUseLocalKnowledgeBase,
} from '@/store/global/slices/settings';
// Assuming a generic layout component exists.
// Path might need adjustment based on actual project structure.
// For now, let's assume a simplified path or that it's globally available.
// import { SettingsLayout } from '@/app/settings/layout';
// Using a placeholder for SettingsLayout for now.
const SettingsLayout = ({ children, pageTitle }: { children: React.ReactNode, pageTitle: string }) => (
  <Flexbox gap={16} style={{ padding: 24 }}>
    <Typography.Title level={3}>{pageTitle}</Typography.Title>
    {children}
  </Flexbox>
);


const { Title, Paragraph } = Typography;

const KnowledgeBaseSettingsPage = () => {
  const { t } = useTranslation('setting'); // Assuming 'setting' is a relevant namespace

  // Selectors to get current state
  const knowledgeBaseSettings = useGlobalStore(selectKnowledgeBaseSettings);
  const useLocalKnowledgeBase = useGlobalStore(selectUseLocalKnowledgeBase);

  // Actions from the store
  const fetchSettings = useGlobalStore((s) => s.fetchKnowledgeBaseSettingsFromMain);
  const toggleUseLocal = useGlobalStore((s) => s.toggleUseLocalKnowledgeBase);
  const fetchDocuments = useGlobalStore((s) => s.fetchIndexedDocuments);
  const removeDocument = useGlobalStore((s) => s.removeDocumentById);

  // State for UI
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null); // For list loading errors
  const indexedDocuments = useGlobalStore(selectIndexedDocuments);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);


  useEffect(() => {
    // Fetch initial settings (like useLocalKnowledgeBase)
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    // Fetch indexed documents if local RAG is enabled
    if (useLocalKnowledgeBase) {
      setIsLoadingDocuments(true);
      setDocumentsError(null);
      fetchDocuments().then(result => {
        if (!result.success && result.error) {
          setDocumentsError(result.error);
          // No antd.message here as error is displayed in list area
        }
      }).finally(() => setIsLoadingDocuments(false));
    } else {
      const setDocs = useGlobalStore.getState().setIndexedDocuments;
      setDocs([]);
      setDocumentsError(null);
    }
  }, [useLocalKnowledgeBase, fetchDocuments]); // Removed t from dependencies as it's stable


  const handleToggleLocalKnowledgeBase = (checked: boolean) => {
    toggleUseLocal(checked);
    if (!checked) {
      const setDocs = useGlobalStore.getState().setIndexedDocuments;
      setDocs([]);
      setDocumentsError(null);
    }
  };

  const handleAddFileToLocalRag = async () => {
    if (!window.electron || !window.electron.ipcRenderer) {
      message.error(t('knowledgeBase.localRag.ipcError', 'Electron IPC not available. This feature is only available in the desktop app.'));
      return;
    }

    setIsProcessingFile(true);
    const messageKey = 'processingFileMessage';
    message.loading({
      content: t('knowledgeBase.localRag.processingMessage', 'Processing file... This may take a moment.'),
      key: messageKey,
      duration: 0,
    });

    try {
      // The IPC call itself is now made within the Zustand action if we were to use it.
      // However, selectAndProcessFileForLocalRag in SystemCtr returns the result directly,
      // so we can still use invoke here for direct feedback.
      const result = await window.electron.ipcRenderer.invoke('selectAndProcessFileForLocalRag') as { success: boolean; message: string; documentId?: string; filePath?: string };

      if (result.success) {
        message.success({
          content: result.message || t('knowledgeBase.localRag.processSuccess', 'File added successfully.'),
          key: messageKey,
        });
        // The fetchDocuments action will handle its own success/error state for the list.
        fetchDocuments().then(fetchResult => {
          if (!fetchResult.success && fetchResult.error) {
             setDocumentsError(fetchResult.error); // Show error in list area if fetching new list fails
          }
        });
      } else {
        message.error({
          content: result.message || t('knowledgeBase.localRag.processError', 'Failed to add file. Please check logs for details.'),
          key: messageKey,
        });
      }
    } catch (error: any) {
      console.error('Error invoking selectAndProcessFileForLocalRag:', error);
      message.error({
        content: error.message || t('knowledgeBase.localRag.ipcInvokeError', 'Error communicating with main process.'),
        key: messageKey,
      });
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    setDeletingDocId(documentId);
    const messageKey = `deleting-${documentId}`;
    message.loading({
      content: t('knowledgeBase.localRag.deletingMessage', 'Deleting document...'),
      key: messageKey,
      duration: 0,
    });

    // Now calling the Zustand action which returns a status object
    const result = await removeDocument(documentId);

    if (result.success) {
      message.success({
        content: result.message || t('knowledgeBase.localRag.deleteSuccess', 'Document deleted successfully.'),
        key: messageKey,
      });
      // fetchDocuments is called inside removeDocumentById action on success
    } else {
      message.error({
        content: result.message || t('knowledgeBase.localRag.deleteError', 'Failed to delete document.'),
        key: messageKey,
      });
    }
    setDeletingDocId(null); // Ensure this is always reset
  };


  return (
    <SettingsLayout pageTitle={t('knowledgeBase.title', 'Knowledge Base Settings')}>
      <Flexbox gap={24} style={{ marginBottom: 24, maxWidth: 800 }}>
        {/* Local RAG Enable Switch Section */}
        <Flexbox gap={16}>
          <Title level={4}>{t('knowledgeBase.localRag.title', 'Local Retrieval Augmented Generation (RAG)')}</Title>
          <Paragraph type="secondary">
            {t('knowledgeBase.localRag.description', 'Enable this option to use a local vector database and embedding models for knowledge base queries. This allows for offline usage and keeps your data entirely on your client machine. When disabled, knowledge base queries will be routed to the configured remote server (if any).')}
          </Paragraph>
          <Flexbox align="center" horizontal justify="space-between" style={{ padding: '8px 0' }}>
            <span style={{ fontWeight: 500 }}>
              {t('knowledgeBase.localRag.enableLabel', 'Enable Local Knowledge Base')}
            </span>
            <Switch
              checked={useLocalKnowledgeBase}
              onChange={handleToggleLocalKnowledgeBase}
              loading={knowledgeBaseSettings === undefined}
            />
          </Flexbox>
        </Flexbox>

        {/* File Management Section - Only shown if local RAG is enabled */}
        {useLocalKnowledgeBase && (
          <Flexbox gap={16}>
            <Paragraph type="warning" style={{ marginTop: 8 }}>
              {t('knowledgeBase.localRag.warning', 'Note: Local RAG is an experimental feature. Performance and accuracy may vary. Future enhancements might require downloading local models, which could consume significant disk space and memory.')}
            </Paragraph>
            <Button
              icon={<UploadOutlined />}
              onClick={handleAddFileToLocalRag}
              loading={isProcessingFile}
              disabled={isProcessingFile}
              style={{ marginTop: 8 }}
            >
              {t('knowledgeBase.localRag.addFileButton', 'Add File to Local Knowledge Base')}
            </Button>

            {/* Indexed Documents List */}
            <div style={{ marginTop: 24 }}>
              <Title level={5}>{t('knowledgeBase.localRag.indexedFilesTitle', 'Indexed Documents')}</Title>
              {documentsError && !isLoadingDocuments && ( // Only show error if not loading and error exists
                <Typography.Text type="danger" style={{ marginBottom: 16, display: 'block' }}>
                  {documentsError}
                </Typography.Text>
              )}
              <List
                loading={isLoadingDocuments}
                dataSource={indexedDocuments}
                locale={{ emptyText: (isLoadingDocuments || documentsError) ? ' ' : t('knowledgeBase.localRag.noFiles', 'No documents indexed yet.') }}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        key="delete"
                        title={t('knowledgeBase.localRag.confirmDeleteTitle', 'Delete this document?')}
                        description={t('knowledgeBase.localRag.confirmDeleteDesc', 'This action cannot be undone. All associated data will be removed.')}
                        onConfirm={() => handleDeleteDocument(item.documentId)}
                        okText={t('confirm', 'Confirm')}
                        cancelText={t('cancel', 'Cancel')}
                        disabled={deletingDocId === item.documentId}
                      >
                        <Button
                          icon={<DeleteOutlined />}
                          danger
                          size="small"
                          loading={deletingDocId === item.documentId}
                        >
                          {t('delete', 'Delete')}
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.fileName || t('knowledgeBase.localRag.unknownFile', 'Unknown File')}
                      description={
                        <Flexbox gap={4} align="flex-start" vertical>
                           <Text type="secondary" ellipsis={{tooltip: item.firstChunkTextHint}} style={{fontSize: 12}}>
                            {item.firstChunkTextHint || t('knowledgeBase.localRag.noHint', 'No content preview available')}
                          </Text>
                          <Tag>{t('knowledgeBase.localRag.chunksCount', { count: item.totalChunks, defaultValue: '{{count}} chunks' })}</Tag>
                        </Flexbox>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </Flexbox>
        )}
      </Flexbox>
    </SettingsLayout>
  );
};

// Helper to use Typography.Text for cleaner code, assuming it's imported or available globally
const { Text } = Typography;

export default KnowledgeBaseSettingsPage;
