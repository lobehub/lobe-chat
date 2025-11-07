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
import { css, cx, useTheme } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Download,
  FileText,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Link2,
  Loader2Icon,
  MoreVertical,
  Pin,
  SmilePlus,
  Table2Icon,
  Trash2,
  Upload,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { documentService } from '@/services/document';
import { useFileStore } from '@/store/file';
import { fileChatSelectors } from '@/store/file/slices/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

dayjs.extend(relativeTime);

const SAVE_THROTTLE_TIME = 3000; // ms

const EmojiPicker = dynamic(() => import('@lobehub/ui/es/EmojiPicker'), { ssr: false });

const editorClassName = cx(css`
  p {
    margin-block-end: 0;
  }
`);

interface DocumentEditorPanelProps {
  documentId?: string;
  knowledgeBaseId?: string;
  onDocumentIdChange?: (newId: string) => void;
  onSave?: () => void;
}

const DocumentEditor = memo<DocumentEditorPanelProps>(
  ({ documentId, knowledgeBaseId, onDocumentIdChange, onSave }) => {
    const { t } = useTranslation(['file']);
    const theme = useTheme();
    const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);
    const { message } = App.useApp();
    const username = useUserStore(userProfileSelectors.displayUserName);

    const editor = useEditor();

    // Get document data from Zustand store
    const currentDocument = useFileStore(fileChatSelectors.getDocumentById(documentId));
    const cachedContent = currentDocument?.content;
    const cachedEditorData = currentDocument?.editorData;
    const cachedEmoji = currentDocument?.metadata?.emoji;
    const documentTitle = currentDocument?.name;

    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [currentTitle, setCurrentTitle] = useState('');
    const [currentEmoji, setCurrentEmoji] = useState<string | undefined>(undefined);
    const [isHoveringTitle, setIsHoveringTitle] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [currentDocId, setCurrentDocId] = useState<string | undefined>(documentId);
    const [lastUpdatedTime, setLastUpdatedTime] = useState<Date | null>(null);
    const refreshFileList = useFileStore((s) => s.refreshFileList);
    const updateDocumentOptimistically = useFileStore((s) => s.updateDocumentOptimistically);
    const localDocumentMap = useFileStore((s) => s.localDocumentMap);
    const replaceTempDocumentWithReal = useFileStore((s) => s.replaceTempDocumentWithReal);
    const isInitialLoadRef = useRef(false);

    // Sync title and emoji when document data changes (e.g., from rename)
    useEffect(() => {
      if (documentTitle !== undefined && documentTitle !== currentTitle) {
        setCurrentTitle(documentTitle);
      }
      if (cachedEmoji !== currentEmoji) {
        setCurrentEmoji(cachedEmoji);
      }
    }, [documentTitle, cachedEmoji]);

    // Load document content when documentId changes
    useEffect(() => {
      // Reset initial load flag when switching documents
      isInitialLoadRef.current = true;

      if (documentId && editor) {
        console.log('[DocumentEditor] Loading content:', {
          cachedEditorDataPreview: cachedEditorData
            ? JSON.stringify(cachedEditorData).slice(0, 100)
            : null,
          cachedEditorDataType: typeof cachedEditorData,
          cachedEmoji,
          documentId,
          documentTitle,
          hasCachedEditorData: !!cachedEditorData,
          isTempDocument: documentId.startsWith('temp-document-'),
        });

        // Reset emoji picker state when switching documents
        setShowEmojiPicker(false);
        // Initialize emoji from cached value
        setCurrentEmoji(cachedEmoji);
        // Reset last updated time
        setLastUpdatedTime(null);

        // Check if this is an optimistic document from local map
        const localDocument = localDocumentMap.get(documentId);
        if (localDocument && documentId.startsWith('temp-document-')) {
          console.log('[DocumentEditor] Using optimistic document from local map');
          setCurrentTitle(localDocument.name || 'Untitled Document');
          // Start with empty editor for new documents
          editor.cleanDocument();
          // Reset flag after cleanDocument (no onChange should fire for cleanDocument)
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 500);
          return;
        }

        // If editorData is already cached (from list), check if it's valid
        const hasValidCachedEditorData =
          cachedEditorData &&
          typeof cachedEditorData === 'object' &&
          Object.keys(cachedEditorData).length > 0;

        console.log('[DocumentEditor] Cached data check:', {
          cachedContent,
          cachedEditorData,
          hasCachedContent: !!cachedContent,
          hasValidCachedEditorData,
          keys: cachedEditorData ? Object.keys(cachedEditorData) : null,
        });

        if (hasValidCachedEditorData) {
          console.log('[DocumentEditor] Using cached editorData', cachedEditorData);
          setCurrentTitle(documentTitle || '');
          isInitialLoadRef.current = true;
          editor.setDocument('json', JSON.stringify(cachedEditorData));
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 500);
          return;
        }

        // If no valid editorData but has cached content, use markdown format
        if (!hasValidCachedEditorData && cachedContent) {
          console.log('[DocumentEditor] Using cached markdown content');
          setCurrentTitle(documentTitle || '');
          isInitialLoadRef.current = true;
          editor.setDocument('markdown', cachedContent);
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 500);
          return;
        }

        // Otherwise, fetch full content from API
        console.log('[DocumentEditor] Fetching from API');
        documentService
          .getDocumentById(documentId)
          .then((doc) => {
            if (doc) {
              setCurrentTitle(doc.title || doc.filename || '');
              // Load emoji from metadata
              if (doc.metadata?.emoji) {
                setCurrentEmoji(doc.metadata.emoji);
              }
              // Set last updated time
              if (doc.updatedAt) {
                setLastUpdatedTime(new Date(doc.updatedAt));
              }

              console.log('[DocumentEditor] Fetched doc.editorData:', {
                editorDataPreview: doc.editorData
                  ? JSON.stringify(doc.editorData).slice(0, 100)
                  : null,
                editorDataType: typeof doc.editorData,
                hasContent: !!doc.content,
                hasEditorData: !!doc.editorData,
              });

              // Check if editorData is empty or just an empty object
              const hasValidEditorData =
                doc.editorData &&
                typeof doc.editorData === 'object' &&
                Object.keys(doc.editorData).length > 0;

              // If no valid editorData but has content, use markdown format
              if (!hasValidEditorData && doc.content) {
                console.log('[DocumentEditor] Using markdown format for content');
                isInitialLoadRef.current = true;
                editor.setDocument('markdown', doc.content);
                setTimeout(() => {
                  isInitialLoadRef.current = false;
                }, 500);
              } else if (hasValidEditorData) {
                isInitialLoadRef.current = true;
                editor.setDocument('json', doc.editorData);
                setTimeout(() => {
                  isInitialLoadRef.current = false;
                }, 500);
              } else {
                // No valid content, reset flag
                isInitialLoadRef.current = false;
              }
            }
          })
          .catch((error) => {
            console.error('[DocumentEditor] Failed to load document:', error);
            // Reset flag on error
            isInitialLoadRef.current = false;
          });
      } else {
        // Reset flag if no documentId or editor
        isInitialLoadRef.current = false;
      }
      // IMPORTANT: Only re-run when documentId changes to prevent editor blur during auto-save.
      // cachedEditorData and cachedContent are intentionally excluded from dependencies
      // because they update after save, which would cause unnecessary re-initialization.
    }, [documentId]);

    // Auto-save function
    const performSave = useCallback(async () => {
      if (!editor) return;

      const editorData = editor.getDocument('json');
      const textContent = (editor.getDocument('markdown') as unknown as string) || '';

      // Don't save if content is empty
      if (!textContent || textContent.trim() === '') {
        return;
      }

      setSaveStatus('saving');

      console.log('emoji', currentEmoji);

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
            name: currentTitle,
            updatedAt: new Date(),
          });
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

          const newDoc = await documentService.createNote({
            content: textContent,
            editorData: JSON.stringify(editorData),
            fileType: 'custom/note',
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
          const realDocument = {
            chunkCount: null,
            chunkingError: null,
            chunkingStatus: null,
            content: textContent,
            createdAt: new Date(now),
            editorData: structuredClone(editorData),
            embeddingError: null,
            embeddingStatus: null,
            fileType: 'custom/note' as const,
            finishEmbedding: false,
            id: newDoc.id,
            name: title,
            size: textContent.length,
            sourceType: 'document' as const,
            updatedAt: new Date(now),
            url: '',
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
        }

        setSaveStatus('saved');
        // Update last updated time
        setLastUpdatedTime(new Date());

        onSave?.();
      } catch (error) {
        console.error('Failed to save document:', error);
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
      performSave();
    }, [performSave]);

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

    const wordCount = useMemo(() => {
      if (!editor || isInitialLoadRef.current) return 0;

      try {
        const textContent = (editor.getDocument('text') as unknown as string) || '';
        return textContent.trim().split(/\s+/).filter(Boolean).length;
      } catch (error) {
        console.error('Failed to calculate word count:', error);

        if (documentId) {
          const localDocument = localDocumentMap.get(documentId);
          if (localDocument) {
            return localDocument.content?.trim().split(/\s+/).filter(Boolean).length || 0;
          }
        }

        return 0;
      }
    }, [editor, isInitialLoadRef.current, cachedEditorData]);

    // Menu items for the three-dot menu
    const menuItems = useMemo(
      () => [
        {
          icon: <Icon icon={Link2} />,
          key: 'copy-link',
          label: t('documentEditor.menu.copyLink'),
          onClick: () => {
            if (currentDocId) {
              const url = `${window.location.origin}${window.location.pathname}?documentId=${currentDocId}`;
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
          onClick: () => {
            // TODO: Implement delete functionality
            console.log('Delete clicked');
          },
        },
        {
          type: 'divider' as const,
        },
        {
          icon: <Icon icon={Download} />,
          key: 'export',
          label: t('documentEditor.menu.exportDocument'),
          onClick: () => {
            // TODO: Implement export functionality
            console.log('Export clicked');
          },
        },
        {
          icon: <Icon icon={Upload} />,
          key: 'import',
          label: t('documentEditor.menu.importDocument'),
          onClick: () => {
            // TODO: Implement import functionality
            console.log('Import clicked');
          },
        },
        {
          type: 'divider' as const,
        },
        {
          disabled: true,
          key: 'document-info',
          label: (
            <div style={{ color: theme.colorTextTertiary, fontSize: 12, lineHeight: 1.6 }}>
              <div>{t('documentEditor.wordCount', { wordCount })}</div>
              <div>{t('documentEditor.editedBy', { name: username })}</div>
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
      [theme, wordCount, username, lastUpdatedTime],
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
            borderBottom: `1px solid ${theme.colorBorderSecondary}`,
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
          <ActionIcon
            icon={Pin}
            onClick={() => {
              // TODO: Implement pin functionality
              console.log('Pin clicked');
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
                      debouncedSave();
                    }}
                    onDelete={() => {
                      setCurrentEmoji(undefined);
                      debouncedSave();
                    }}
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

            <Editor
              className={editorClassName}
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
          </Flexbox>
        </Flexbox>
      </Flexbox>
    );
  },
);

export default DocumentEditor;
