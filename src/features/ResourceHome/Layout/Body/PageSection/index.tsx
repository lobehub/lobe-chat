'use client';

import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  accordionStyles,
  AccordionTrigger,
  ActionIcon,
  Avatar,
  cx,
  Flexbox,
  Icon,
  Spin,
  Text,
  toast,
  Tooltip,
} from '@lobehub/ui';
import { FileTextIcon, MoreHorizontal, SquarePenIcon } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AsyncBoundary from '@/components/AsyncBoundary';
import EmptyNavItem from '@/features/NavPanel/components/EmptyNavItem';
import NavItem from '@/features/NavPanel/components/NavItem';
import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import Actions from '@/features/Pages/PageLayout/Body/List/Item/Actions';
import { useDropdownMenu } from '@/features/Pages/PageLayout/Body/List/Item/useDropdownMenu';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { useActiveLocation } from '@/hooks/useActiveLocation';
import { usePermission } from '@/hooks/usePermission';
import { pageActions, pageSelectors, usePageStore } from '@/store/page';
import type { PageSectionScope } from '@/store/page/projection';
import type { LobeDocument } from '@/types/document';

import { docsPagePath, resolveResourceRoute } from '../../../paths';
import RenameInput from './RenameInput';
import { buildPageTree } from './tree';

/** Rows a section shows; the rest are in the Docs home list. */
const SECTION_LIMIT = 20;
const INDENT_PER_LEVEL = 12;

interface PageRowProps {
  depth: number;
  doc: LobeDocument;
  isOpen: boolean;
  onOpen: (id: string) => void;
}

/**
 * One page row. It carries the same actions as the old Pages sidebar — hover
 * menu and right-click menu — because Docs is now the only place a page is
 * listed, so rename / duplicate / delete have to live here.
 */
const PageRow = memo<PageRowProps>(({ depth, doc, isOpen, onOpen }) => {
  const { t } = useTranslation('file');
  const emoji = doc.metadata?.emoji;
  const title = doc.title || t('pageList.untitled');
  const editing = usePageStore((s) => s.renamingPageId === doc.id);

  const toggleEditing = useCallback(
    (visible?: boolean) => pageActions.setRenamingPageId(visible ? doc.id : null),
    [doc.id],
  );
  const dropdownMenu = useDropdownMenu({ pageId: doc.id, toggleEditing });

  return (
    <NavItem
      actions={<Actions dropdownMenu={dropdownMenu} />}
      active={isOpen}
      contextMenuItems={dropdownMenu}
      href={docsPagePath(doc.id)}
      style={depth ? { paddingInlineStart: 8 + depth * INDENT_PER_LEVEL } : undefined}
      icon={
        emoji ? (
          <Avatar avatar={emoji} size={20} />
        ) : (
          <Icon icon={FileTextIcon} size={{ size: 16, strokeWidth: 1.5 }} />
        )
      }
      title={
        editing ? (
          <RenameInput
            id={doc.id}
            title={title}
            onDone={() => pageActions.setRenamingPageId(null)}
          />
        ) : (
          title
        )
      }
      onClick={() => {
        // While the inline field is open a click belongs to the input, not to
        // navigation — opening the page here would drop the edit.
        if (editing) return;
        onOpen(doc.id);
      }}
    />
  );
});

PageRow.displayName = 'PageRow';

interface PageSectionProps {
  itemKey: string;
  scope: PageSectionScope;
}

/**
 * A sidebar section of standalone pages (pages filed into a library open from
 * the library). `mine` is the caller's own pages and offers "new page";
 * `shared` is what other workspace members published.
 */
const PageSection = memo<PageSectionProps>(({ itemKey, scope }) => {
  const { t } = useTranslation('file');
  const navigate = useWorkspaceAwareNavigate();
  const [creating, setCreating] = useState(false);
  const { allowed: canCreate, reason } = usePermission('create_content');

  const { error, isValidating, revalidate } = pageActions.useFetchPageSection(scope, SECTION_LIMIT);
  const docs = usePageStore(pageSelectors.pageSection(scope));

  const rows = useMemo(() => (docs ? buildPageTree(docs.slice(0, SECTION_LIMIT)) : docs), [docs]);
  const hasMore = (docs?.length ?? 0) > SECTION_LIMIT;

  // Pages open over the Docs home, keeping the user in Docs.
  const location = useActiveLocation();
  const openedView = resolveResourceRoute(location.pathname, new URLSearchParams(location.search));
  const openFileId = openedView.kind === 'page' ? openedView.id : null;
  const openPage = (id: string) => navigate(docsPagePath(id));

  const handleCreate = async () => {
    if (!canCreate || creating) return;
    setCreating(true);
    try {
      // `createPage` (not `createNewPage`) so the Pages module's own navigation
      // never takes the user out of Docs.
      const page = await pageActions.createPage({ title: t('pageList.untitled') });
      openPage(page.id);
      void pageActions.refreshDocuments();
    } catch (error) {
      console.error('[PageSection] failed to create a page:', error);
      toast.error(t('operationFailed', { ns: 'common' }));
    } finally {
      setCreating(false);
    }
  };

  const title = t(scope === 'mine' ? 'docs.myDocs.title' : 'docs.shared.title');

  const createButton = (
    <ActionIcon
      disabled={!canCreate}
      icon={SquarePenIcon}
      loading={creating}
      size={'small'}
      title={canCreate ? t('header.newPageButton') : undefined}
      onClick={handleCreate}
    />
  );

  return (
    <AccordionItem value={itemKey}>
      <AccordionHeader>
        <AccordionTrigger style={{ paddingBlock: 4, paddingInline: '8px 4px' }}>
          <Flexbox horizontal align={'center'} gap={4}>
            <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
              {title}
            </Text>
            {isValidating && !!rows?.length && <Spin size={'small'} variant={'network'} />}
          </Flexbox>
        </AccordionTrigger>
        {scope === 'mine' && (
          <div
            className={cx(
              'accordion-action',
              accordionStyles.action,
              accordionStyles.actionBorderless,
            )}
          >
            {canCreate ? createButton : <Tooltip title={reason}>{createButton}</Tooltip>}
          </div>
        )}
      </AccordionHeader>
      <AccordionPanel>
        <AsyncBoundary
          data={rows}
          error={error}
          errorVariant={'inline'}
          isEmpty={rows?.length === 0}
          isLoading={rows === undefined && !error}
          loading={<SkeletonList paddingInline={4} rows={3} />}
          empty={
            scope === 'mine' ? (
              <EmptyNavItem
                disabled={!canCreate}
                title={t('docs.myDocs.empty')}
                onClick={handleCreate}
              />
            ) : (
              <Text fontSize={12} style={{ paddingInline: 12 }} type={'secondary'}>
                {t('docs.shared.empty')}
              </Text>
            )
          }
          onRetry={() => revalidate()}
        >
          <Flexbox gap={1} paddingInline={4}>
            {rows?.map(({ depth, doc }) => (
              <PageRow
                depth={depth}
                doc={doc}
                isOpen={openFileId === doc.id}
                key={doc.id}
                onOpen={openPage}
              />
            ))}
            {hasMore && (
              <NavItem
                icon={MoreHorizontal}
                title={t('docs.viewAllPages')}
                // Opens the paged all-pages drawer rather than the Docs home,
                // whose mixed recent list is capped and mixes files in — an
                // older page pushed out of both lists would be unreachable.
                onClick={() => pageActions.openAllPagesDrawer()}
              />
            )}
          </Flexbox>
        </AsyncBoundary>
      </AccordionPanel>
    </AccordionItem>
  );
});

PageSection.displayName = 'PageSection';

export default PageSection;
