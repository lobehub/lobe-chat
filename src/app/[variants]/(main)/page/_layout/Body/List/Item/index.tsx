import { Avatar, type MenuProps } from '@lobehub/ui';
import { Dropdown } from '@lobehub/ui';
import { FileTextIcon } from 'lucide-react';
import { CSSProperties, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import NavItem from '@/features/NavPanel/components/NavItem';
import { documentSelectors, useFileStore } from '@/store/file';

import Actions from './Actions';
import Editing from './Editing';
import { useDropdownMenu } from './useDropdownMenu';

interface DocumentItemProps {
  className?: string;
  documentId: string;
  style?: CSSProperties;
}

const PageListItem = memo<DocumentItemProps>(({ documentId, style, className }) => {
  const { t } = useTranslation('file');
  const [editing, selectedPageId, document] = useFileStore(
    useCallback(
      (s) => {
        const doc = documentSelectors.getDocumentById(documentId)(s);
        return [s.renamingPageId === documentId, s.selectedPageId, doc] as const;
      },
      [documentId],
    ),
  );

  const selectPage = useFileStore((s) => s.selectPage);
  const setRenamingPageId = useFileStore((s) => s.setRenamingPageId);

  const active = selectedPageId === documentId;
  const title = document?.title || t('pageList.untitled');
  const emoji = document?.metadata?.emoji;

  const toggleEditing = useCallback(
    (visible?: boolean) => {
      setRenamingPageId(visible ? documentId : null);
    },
    [documentId, setRenamingPageId],
  );

  const handleClick = useCallback(() => {
    if (!editing) {
      selectPage(documentId);
    }
  }, [editing, selectPage, documentId]);

  // Icon with emoji support
  const icon = useMemo(() => {
    if (emoji) {
      return <Avatar avatar={emoji} size={28} />;
    }
    return FileTextIcon;
  }, [emoji]);

  const dropdownMenu: MenuProps['items'] = useDropdownMenu({
    documentContent: document?.content || undefined,
    documentId,
    toggleEditing,
  });

  return (
    <>
      <Dropdown
        menu={{
          items: dropdownMenu,
        }}
        trigger={['contextMenu']}
      >
        <NavItem
          actions={<Actions dropdownMenu={dropdownMenu} />}
          active={active}
          className={className}
          disabled={editing}
          icon={icon}
          key={documentId}
          onClick={handleClick}
          style={style}
          title={title}
        />
      </Dropdown>
      <Editing
        currentEmoji={emoji}
        documentId={documentId}
        title={title}
        toggleEditing={toggleEditing}
      />
    </>
  );
});

export default PageListItem;
