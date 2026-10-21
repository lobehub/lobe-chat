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
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AsyncBoundary from '@/components/AsyncBoundary';
import EmptyNavItem from '@/features/NavPanel/components/EmptyNavItem';
import NavItem from '@/features/NavPanel/components/NavItem';
import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { useActiveLocation } from '@/hooks/useActiveLocation';
import { usePermission } from '@/hooks/usePermission';
import { pageActions, pageSelectors, usePageStore } from '@/store/page';
import type { PageSectionScope } from '@/store/page/projection';

import { docsPagePath, resolveResourceRoute, RESOURCE_HOME_PATH } from '../../../paths';
import { buildPageTree } from './tree';

/** Rows a section shows; the rest are in the Docs home list. */
const SECTION_LIMIT = 20;
const INDENT_PER_LEVEL = 12;

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
            {rows?.map(({ depth, doc }) => {
              const emoji = doc.metadata?.emoji;
              return (
                <NavItem
                  active={openFileId === doc.id}
                  href={docsPagePath(doc.id)}
                  key={doc.id}
                  style={depth ? { paddingInlineStart: 8 + depth * INDENT_PER_LEVEL } : undefined}
                  title={doc.title || t('pageList.untitled')}
                  icon={
                    emoji ? (
                      <Avatar avatar={emoji} size={20} />
                    ) : (
                      <Icon icon={FileTextIcon} size={{ size: 16, strokeWidth: 1.5 }} />
                    )
                  }
                  onClick={() => openPage(doc.id)}
                />
              );
            })}
            {hasMore && (
              <NavItem
                icon={MoreHorizontal}
                title={t('docs.viewAllPages')}
                onClick={() => navigate(RESOURCE_HOME_PATH)}
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
