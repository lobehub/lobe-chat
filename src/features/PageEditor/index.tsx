'use client';

import { useEditor } from '@lobehub/editor/react';
import { ActionIcon, Button, DraggablePanel, Dropdown, Icon } from '@lobehub/ui';
import { App } from 'antd';
import { useTheme } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  FileText,
  Link2,
  Loader2Icon,
  MoreVertical,
  SmilePlus,
  SparklesIcon,
  Trash2,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ConversationProvider } from '@/features/Conversation';
import { useFileStore } from '@/store/file';
import { documentSelectors } from '@/store/file/slices/document/selectors';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import DocumentConversation from './DocumentConversation';
import EditorContent from './EditorContent';
import PageEditorBreadcrumb from './PageEditorBreadcrumb';
import { usePageEditor } from './usePageEditor';

dayjs.extend(relativeTime);

const EmojiPicker = dynamic(() => import('@lobehub/ui/es/EmojiPicker'), { ssr: false });

interface PageEditorPanelProps {
  knowledgeBaseId?: string;
  onDelete?: () => void;
  onDocumentIdChange?: (newId: string) => void;
  onSave?: () => void;
  pageId?: string;
}

/**
 * Edit a page
 */
const PageEditor = memo<PageEditorPanelProps>(
  ({ pageId, knowledgeBaseId, onDocumentIdChange, onSave, onDelete }) => {
    const { t } = useTranslation(['file', 'common']);
    const theme = useTheme();
    const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);
    const { message, modal } = App.useApp();
    const username = useUserStore(userProfileSelectors.displayUserName);

    const editor = useEditor();

    const [isHoveringTitle, setIsHoveringTitle] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [chatPanelExpanded, setChatPanelExpanded] = useState(true);

    const removeDocument = useFileStore((s) => s.removeDocument);
    // Try to get document from store first
    const currentDocument = useFileStore(documentSelectors.getDocumentById(pageId));
    // Also fetch via SWR if not in store (for pages in folders or direct links)
    const useFetchKnowledgeItem = useFileStore((s) => s.useFetchKnowledgeItem);
    const { data: fetchedDocument } = useFetchKnowledgeItem(pageId);

    // Use whichever is available (renamed to avoid shadowing global document)
    const pageDocument = currentDocument || fetchedDocument;

    const {
      currentDocId,
      currentEmoji,
      currentTitle,
      lastUpdatedTime,
      saveStatus,
      wordCount,
      setCurrentEmoji,
      setCurrentTitle,
      debouncedSave,
      handleContentChange,
      performSave,
      onEditorInit,
    } = usePageEditor({
      autoSave: true,
      documentId: pageId,
      editor,
      knowledgeBaseId,
      onDocumentIdChange,
      onSave,
    });

    // Handle Cmd+S / Ctrl+S keyboard shortcut
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
          e.preventDefault();
          message.info(t('documentEditor.autoSaveMessage'));
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [t]);

    const handleDelete = useCallback(async () => {
      if (!currentDocId) return;

      modal.confirm({
        cancelText: t('cancel', { ns: 'common' }),
        content: t('documentEditor.deleteConfirm.content'),
        okButtonProps: { danger: true },
        okText: t('delete', { ns: 'common' }),
        onOk: async () => {
          try {
            await removeDocument(currentDocId);
            message.success(t('documentEditor.deleteSuccess'));
            onDelete?.();
          } catch (error) {
            console.error('Failed to delete page:', error);
            message.error(t('documentEditor.deleteError'));
          }
        },
        title: t('documentEditor.deleteConfirm.title'),
      });
    }, [currentDocId, modal, removeDocument, message, onDelete, t]);

    // Menu items for the three-dot menu
    const menuItems = useMemo(
      () => [
        {
          icon: <Icon icon={Link2} />,
          key: 'copy-link',
          label: t('documentEditor.menu.copyLink'),
          onClick: () => {
            if (currentDocId) {
              const url = `${window.location.origin}${window.location.pathname}`;
              navigator.clipboard.writeText(url);
              message.success(t('documentEditor.linkCopied'));
            }
          },
        },
        {
          danger: true,
          icon: <Icon icon={Trash2} />,
          key: 'delete',
          label: t('delete', { ns: 'common' }),
          onClick: handleDelete,
        },
        // {
        //   type: 'divider' as const,
        // },
        // {
        //   icon: <Icon icon={Download} />,
        //   key: 'export',
        //   label: t('documentEditor.menu.exportDocument'),
        //   onClick: () => {
        //     // TODO: Implement export functionality
        //     console.log('Export clicked');
        //   },
        // },
        // {
        //   icon: <Icon icon={Upload} />,
        //   key: 'import',
        //   label: t('documentEditor.menu.importDocument'),
        //   onClick: () => {
        //     // TODO: Implement import functionality
        //     console.log('Import clicked');
        //   },
        // },
        {
          type: 'divider' as const,
        },
        {
          disabled: true,
          key: 'page-info',
          label: (
            <div style={{ color: theme.colorTextTertiary, fontSize: 12, lineHeight: 1.6 }}>
              <div>{t('documentEditor.wordCount', { wordCount })}</div>
              {/* <div>{t('documentEditor.editedBy', { name: username })}</div> */}
              <div>
                {lastUpdatedTime
                  ? t('documentEditor.editedAt', {
                      time: dayjs(lastUpdatedTime).format('MMMM D, YYYY [at] h:mm A'),
                    })
                  : ''}
              </div>
            </div>
          ),
        },
      ],
      [theme, wordCount, username, lastUpdatedTime, handleDelete, currentDocId, message, t],
    );

    return (
      <ConversationProvider context={{ agentId: 'page-copilot' }}>
        <Flexbox height={'100%'} horizontal style={{ background: 'red' }}>
          <Flexbox flex={1} height={'100%'} style={{ background: theme.colorBgContainer }}>
            {/* Header */}
            <Flexbox
              align="center"
              direction="horizontal"
              gap={8}
              paddingBlock={8}
              paddingInline={16}
              style={{
                background: theme.colorBgContainer,
              }}
            >
              {/* Breadcrumb - show when document has a parent folder */}
              {pageDocument?.parentId && (
                <PageEditorBreadcrumb
                  documentTitle={currentTitle || t('documentEditor.titlePlaceholder')}
                  knowledgeBaseId={knowledgeBaseId}
                  parentId={pageDocument.parentId}
                />
              )}

              {/* Show icon and title only when there's no parent folder */}
              {!pageDocument?.parentId && (
                <>
                  {/* Icon */}
                  {currentEmoji ? (
                    <span style={{ fontSize: 20, lineHeight: 1 }}>{currentEmoji}</span>
                  ) : (
                    <Icon icon={FileText} size={20} style={{ color: theme.colorTextSecondary }} />
                  )}

                  {/* Title */}
                  <Flexbox
                    flex={1}
                    style={{
                      color: theme.colorText,
                      fontSize: 14,
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentTitle || t('documentEditor.titlePlaceholder')}
                  </Flexbox>
                </>
              )}

              {/* Save Status Indicator */}
              {saveStatus === 'saving' && (
                <Flexbox>
                  <Icon icon={Loader2Icon} spin />
                </Flexbox>
              )}

              {/* Last Updated Time */}
              {lastUpdatedTime && (
                <span
                  style={{
                    color: theme.colorTextTertiary,
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t('documentEditor.editedAt', { time: dayjs(lastUpdatedTime).fromNow() })}
                </span>
              )}

              <ActionIcon
                icon={SparklesIcon}
                onClick={() => {
                  setChatPanelExpanded((prev) => !prev);
                }}
                size={15.5}
                style={{ color: theme.colorText }}
              />

              {/* Three-dot menu */}
              <Dropdown
                menu={{
                  items: menuItems,
                  style: { minWidth: 200 },
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <ActionIcon icon={MoreVertical} size={15.5} style={{ color: theme.colorText }} />
              </Dropdown>
            </Flexbox>

            {/* Editor with title */}
            <Flexbox flex={1} style={{ overflowY: 'auto' }}>
              <Flexbox
                paddingBlock={36}
                style={{
                  margin: '0 auto',
                  maxWidth: 900,
                  paddingLeft: 32,
                  paddingRight: 48,
                  width: '100%',
                }}
              >
                {/* Emoji and Title */}
                <Flexbox
                  onMouseEnter={() => setIsHoveringTitle(true)}
                  onMouseLeave={() => setIsHoveringTitle(false)}
                  style={{ marginBottom: 24 }}
                >
                  {/* Emoji picker above Choose Icon button */}
                  {(currentEmoji || showEmojiPicker) && (
                    <Flexbox style={{ marginBottom: 4 }}>
                      <EmojiPicker
                        allowDelete
                        locale={locale}
                        onChange={(emoji) => {
                          setCurrentEmoji(emoji);
                          setShowEmojiPicker(false);
                          debouncedSave();
                        }}
                        onDelete={() => {
                          setCurrentEmoji(undefined);
                          setShowEmojiPicker(false);
                          debouncedSave();
                        }}
                        onOpenChange={(open) => {
                          setShowEmojiPicker(open);
                        }}
                        open={showEmojiPicker}
                        size={80}
                        style={{
                          fontSize: 80,
                          transform: 'translateX(-6px)',
                        }}
                        title={t('documentEditor.chooseIcon')}
                        value={currentEmoji}
                      />
                    </Flexbox>
                  )}

                  {/* Choose Icon button - only shown when no emoji */}
                  <Flexbox style={{ marginBottom: 12 }}>
                    <Button
                      icon={<Icon icon={SmilePlus} />}
                      onClick={() => {
                        setCurrentEmoji('📄');
                        setShowEmojiPicker(true);
                      }}
                      size="small"
                      style={{
                        opacity: isHoveringTitle && !currentEmoji && !showEmojiPicker ? 1 : 0,
                        transform: 'translateX(-6px)',
                        transition: `opacity ${theme.motionDurationMid} ${theme.motionEaseInOut}`,
                        width: 'fit-content',
                      }}
                      type="text"
                    >
                      {t('documentEditor.chooseIcon')}
                    </Button>
                  </Flexbox>

                  {/* Title Input */}
                  <Flexbox align="center" direction="horizontal" gap={8}>
                    <input
                      onChange={(e) => {
                        setCurrentTitle(e.target.value);
                        debouncedSave();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          // Save immediately and focus on the editor
                          performSave().then(() => {
                            editor?.focus();
                          });
                        }
                      }}
                      placeholder={t('documentEditor.titlePlaceholder')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: theme.colorText,
                        flex: 1,
                        fontSize: 40,
                        fontWeight: 700,
                        lineHeight: 1.2,
                        outline: 'none',
                      }}
                      value={currentTitle}
                    />
                  </Flexbox>
                </Flexbox>

                <div
                  onClick={() => editor?.focus()}
                  style={{
                    cursor: 'text',
                    flex: 1,
                    minHeight: '400px',
                  }}
                >
                  <EditorContent
                    editor={editor}
                    onInit={onEditorInit}
                    onTextChange={handleContentChange}
                    placeholder={t('documentEditor.editorPlaceholder')}
                    style={{
                      minHeight: '400px',
                      paddingBottom: '200px',
                    }}
                  />
                </div>
              </Flexbox>
            </Flexbox>
          </Flexbox>

          {/* Copilot */}
          <DraggablePanel
            expand={chatPanelExpanded}
            maxWidth={600}
            minWidth={300}
            onExpandChange={setChatPanelExpanded}
            placement="right"
          >
            <DocumentConversation />
          </DraggablePanel>
        </Flexbox>
      </ConversationProvider>
    );
  },
);

export default PageEditor;
