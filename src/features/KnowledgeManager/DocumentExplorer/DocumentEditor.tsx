'use client';

import {
  INSERT_HEADING_COMMAND,
  INSERT_TABLE_COMMAND,
  ReactCodePlugin,
  ReactCodeblockPlugin,
  ReactHRPlugin,
  ReactImagePlugin,
  ReactLinkHighlightPlugin,
  ReactListPlugin,
  ReactMathPlugin,
  ReactTablePlugin,
} from '@lobehub/editor';
import { Editor, useEditor } from '@lobehub/editor/react';
import { ActionIcon, Button, Dropdown, Icon } from '@lobehub/ui';
import { useDebounceFn } from 'ahooks';
import { App } from 'antd';
import { useTheme } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  FileText,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Link2,
  Loader2Icon,
  MoreVertical,
  SmilePlus,
  Table2Icon,
  Trash2,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { documentService } from '@/services/document';
import { useFileStore } from '@/store/file';
import { documentSelectors } from '@/store/file/slices/document/selectors';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { DocumentSourceType, LobeDocument } from '@/types/document';

dayjs.extend(relativeTime);

const SAVE_THROTTLE_TIME = 3000; // ms
const RESET_DELAY = 100; // ms

const EmojiPicker = dynamic(() => import('@lobehub/ui/es/EmojiPicker'), { ssr: false });

interface DocumentEditorPanelProps {
  documentId?: string;
  knowledgeBaseId?: string;
  onDelete?: () => void;
  onDocumentIdChange?: (newId: string) => void;
  onSave?: () => void;
}

const DocumentEditor = memo<DocumentEditorPanelProps>(
  ({ documentId, knowledgeBaseId, onDocumentIdChange, onSave, onDelete }) => {
    const { t } = useTranslation(['file', 'common']);
    const theme = useTheme();
    const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);
    const { message, modal } = App.useApp();
    const username = useUserStore(userProfileSelectors.displayUserName);

    const editor = useEditor();

    const currentDocument = useFileStore(documentSelectors.getDocumentById(documentId));
    const currentDocumentTitle = currentDocument?.title;
    const currentDocumentEmoji = currentDocument?.metadata?.emoji;

    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [currentTitle, setCurrentTitle] = useState('');
    const [currentEmoji, setCurrentEmoji] = useState<string | undefined>(undefined);
    const [isHoveringTitle, setIsHoveringTitle] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [currentDocId, setCurrentDocId] = useState<string | undefined>(documentId);
    const [lastUpdatedTime, setLastUpdatedTime] = useState<Date | null>(null);
    const [wordCount, setWordCount] = useState(0);

    const refreshFileList = useFileStore((s) => s.refreshFileList);
    const updateDocumentOptimistically = useFileStore((s) => s.updateDocumentOptimistically);
    const replaceTempDocumentWithReal = useFileStore((s) => s.replaceTempDocumentWithReal);
    const removeDocument = useFileStore((s) => s.removeDocument);

    const isInitialLoadRef = useRef(false);

    // Helper function to calculate word count from text
    const calculateWordCount = useCallback((text: string) => {
      return text.trim().split(/\s+/).filter(Boolean).length;
    }, []);

    // Helper function to extract content from pages array
    const extractContentFromPages = useCallback((pages?: Array<{ pageContent: string }>) => {
      if (!pages || pages.length === 0) return null;
      return pages.map((page) => page.pageContent).join('\n\n');
    }, []);

    // Sync title and emoji when document data changes (e.g., from rename)
    useEffect(() => {
      if (currentDocumentTitle !== undefined && currentDocumentTitle !== currentTitle) {
        setCurrentTitle(currentDocumentTitle);
      }
      if (currentDocumentEmoji !== currentEmoji) {
        setCurrentEmoji(currentDocumentEmoji);
      }
    }, [currentDocumentTitle, currentDocumentEmoji]);

    // Load document content when documentId changes
    useEffect(() => {
      // Reset initial load flag when switching documents
      isInitialLoadRef.current = true;

      if (documentId && editor) {
        setShowEmojiPicker(false);
        setCurrentEmoji(currentDocumentEmoji);
        setLastUpdatedTime(null);

        // Check if this is an optimistic temp document
        if (currentDocument && documentId.startsWith('temp-document-')) {
          console.log('[DocumentEditor] Using optimistic document from currentDocument');
          setCurrentTitle(currentDocument.title || 'Untitled Document');
          // Start with empty editor for new documents
          editor.cleanDocument();
          setWordCount(0);
          // Reset flag after cleanDocument (no onChange should fire for cleanDocument)
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, RESET_DELAY);
          return;
        }

        if (currentDocument?.editorData && Object.keys(currentDocument.editorData).length > 0) {
          setCurrentTitle(currentDocumentTitle || '');
          isInitialLoadRef.current = true;

          console.log('[DocumentEditor] Setting editor data', currentDocument.editorData);

          editor.setDocument('json', JSON.stringify(currentDocument.editorData));
          // Calculate word count from content
          const textContent = currentDocument.content || '';
          setWordCount(calculateWordCount(textContent));
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, RESET_DELAY);
          return;
        } else if (currentDocument?.pages && editor) {
          const pagesContent = extractContentFromPages(currentDocument.pages);
          if (pagesContent) {
            console.log('[DocumentEditor] Using pages content as fallback');
            setCurrentTitle(currentDocumentTitle || '');
            isInitialLoadRef.current = true;
            editor.setDocument('markdown', pagesContent);
            // Calculate word count from pages content
            setWordCount(calculateWordCount(pagesContent));
            setTimeout(() => {
              isInitialLoadRef.current = false;
            }, RESET_DELAY);
            return;
          }
        } else {
          // Reset editor
          editor.cleanDocument();
          setWordCount(0);
          isInitialLoadRef.current = false;
          return;
        }
      }
    }, [
      documentId,
      currentDocument,
      currentDocumentTitle,
      currentDocumentEmoji,
      editor,
      calculateWordCount,
      extractContentFromPages,
    ]);

    // Auto-save function
    const performSave = useCallback(async () => {
      if (!editor) return;

      const editorData = editor.getDocument('json');
      const textContent = (editor.getDocument('markdown') as unknown as string) || '';

      // Don't save if content is empty
      if (!textContent || textContent.trim() === '') {
        return;
      }

      // Store focus state before saving
      // Check if the editor's root element or any of its descendants has focus
      const editorElement = editor.getRootElement();
      const hadFocus = editorElement?.contains(document.activeElement) ?? false;

      setSaveStatus('saving');

      try {
        if (currentDocId && !currentDocId.startsWith('temp-document-')) {
          // Update existing document with optimistic update (including metadata for emoji)
          await updateDocumentOptimistically(currentDocId, {
            content: textContent,
            editorData: structuredClone(editorData),
            metadata: currentEmoji
              ? {
                  emoji: currentEmoji,
                }
              : {
                  emoji: undefined, // Explicitly set to undefined to remove emoji
                },
            title: currentTitle,
            updatedAt: new Date(),
          });

          // Restore focus if editor had it before save
          if (hadFocus) {
            // Use setTimeout to ensure focus is restored after any re-renders
            setTimeout(() => {
              editor.focus();
            }, 0);
          }
        } else {
          // Create new document (either no ID or temp ID)
          const now = Date.now();
          const timestamp = new Date(now).toLocaleString('en-US', {
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          const title = currentTitle || `Document - ${timestamp}`;

          const newDoc = await documentService.createDocument({
            content: textContent,
            editorData: JSON.stringify(editorData),
            fileType: 'custom/document',
            knowledgeBaseId,
            metadata: currentEmoji
              ? {
                  createdAt: now,
                  emoji: currentEmoji,
                }
              : {
                  createdAt: now,
                },
            title,
          });

          // Create the real document object for optimistic update
          const realDocument: LobeDocument = {
            content: textContent,
            createdAt: new Date(now),
            editorData: structuredClone(editorData) || null,
            fileType: 'custom/document' as const,
            filename: title,
            id: newDoc.id,
            metadata: currentEmoji
              ? {
                  createdAt: now,
                  emoji: currentEmoji,
                }
              : {
                  createdAt: now,
                },
            source: 'document',
            sourceType: DocumentSourceType.EDITOR,
            title,
            totalCharCount: textContent.length,
            totalLineCount: 0,
            updatedAt: new Date(now),
          };

          // Replace temp document with real document (smooth UX, no flicker)
          if (currentDocId?.startsWith('temp-document-')) {
            replaceTempDocumentWithReal(currentDocId, realDocument);
          }

          // Update state and notify parent
          setCurrentDocId(newDoc.id);
          onDocumentIdChange?.(newDoc.id);

          // Refresh in background to sync with server
          refreshFileList();

          // Restore focus if editor had it before save
          if (hadFocus) {
            setTimeout(() => {
              editor.focus();
            }, 0);
          }
        }

        setSaveStatus('saved');
        // Update last updated time
        setLastUpdatedTime(new Date());

        onSave?.();
      } catch {
        setSaveStatus('idle');
      }
    }, [
      editor,
      currentDocId,
      currentTitle,
      currentEmoji,
      knowledgeBaseId,
      refreshFileList,
      updateDocumentOptimistically,
      onSave,
      onDocumentIdChange,
      replaceTempDocumentWithReal,
    ]);

    // Handle content change - auto-save after debounce (with skip initial load)
    const handleContentChangeInternal = useCallback(() => {
      // Skip if we're in the initial load phase
      if (isInitialLoadRef.current) {
        console.log('[DocumentEditor] Skipping onChange during initial load');
        return;
      }

      console.log('[DocumentEditor] Content changed, triggering auto-save');

      // Update word count from editor
      if (editor) {
        try {
          const textContent = (editor.getDocument('text') as unknown as string) || '';
          setWordCount(calculateWordCount(textContent));
        } catch (error) {
          console.error('Failed to update word count:', error);
        }
      }

      performSave();
    }, [performSave, editor, calculateWordCount]);

    const { run: handleContentChange } = useDebounceFn(handleContentChangeInternal, {
      wait: SAVE_THROTTLE_TIME,
    });

    // Debounced save for title/emoji changes (no initial load check needed)
    const { run: debouncedSave } = useDebounceFn(performSave, {
      wait: SAVE_THROTTLE_TIME,
    });

    // Update currentDocId when documentId prop changes
    useEffect(() => {
      setCurrentDocId(documentId);
    }, [documentId]);

    // Clean up when closing
    useEffect(() => {
      return () => {
        editor?.cleanDocument();
      };
    }, [editor]);

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

    // Handle delete document
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
            console.error('Failed to delete document:', error);
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
          key: 'document-info',
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
      <Flexbox height={'100%'} style={{ background: theme.colorBgContainer }}>
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

          {/* Pin action */}
          {/* <ActionIcon
            icon={Pin}
            onClick={() => {
              // TODO: Implement pin functionality
              console.log('Pin clicked');
            }}
            size={15.5}
            style={{ color: theme.colorText }}
          /> */}

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
              <Editor
                content={''}
                editor={editor}
                onTextChange={handleContentChange}
                placeholder={t('documentEditor.editorPlaceholder')}
                plugins={[
                  ReactListPlugin,
                  ReactCodePlugin,
                  ReactCodeblockPlugin,
                  ReactHRPlugin,
                  ReactLinkHighlightPlugin,
                  ReactTablePlugin,
                  ReactMathPlugin,
                  ReactImagePlugin,
                ]}
                slashOption={{
                  items: [
                    {
                      icon: Heading1Icon,
                      key: 'h1',
                      label: 'Heading 1',
                      onSelect: (editor) => {
                        editor.dispatchCommand(INSERT_HEADING_COMMAND, { tag: 'h1' });
                      },
                    },
                    {
                      icon: Heading2Icon,
                      key: 'h2',
                      label: 'Heading 2',
                      onSelect: (editor) => {
                        editor.dispatchCommand(INSERT_HEADING_COMMAND, { tag: 'h2' });
                      },
                    },
                    {
                      icon: Heading3Icon,
                      key: 'h3',
                      label: 'Heading 3',
                      onSelect: (editor) => {
                        editor.dispatchCommand(INSERT_HEADING_COMMAND, { tag: 'h3' });
                      },
                    },
                    {
                      icon: Table2Icon,
                      key: 'table',
                      label: 'Table',
                      onSelect: (editor) => {
                        editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: '3', rows: '3' });
                      },
                    },
                  ],
                }}
                style={{
                  minHeight: '400px',
                  paddingBottom: '200px',
                }}
                type={'text'}
              />
            </div>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    );
  },
);

export default DocumentEditor;
