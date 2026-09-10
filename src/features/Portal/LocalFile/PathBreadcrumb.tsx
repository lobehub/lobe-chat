'use client';

import type { ProjectFileIndexEntry } from '@lobechat/electron-client-ipc';
import { DropdownMenu, Flexbox, Icon } from '@lobehub/ui';
import { createStaticStyles, cssVar, cx } from 'antd-style';
import { ChevronRightIcon, FileIcon } from 'lucide-react';
import { memo, useMemo } from 'react';

import { useProjectFiles } from '@/features/Conversation/WorkingSidebar/Files/useProjectFiles';
import { useChatStore } from '@/store/chat';

import {
  type BreadcrumbSegment,
  listDirectoryChildren,
  toBreadcrumbSegments,
} from './filePathBreadcrumb';

const styles = createStaticStyles(({ css }) => ({
  crumb: css`
    cursor: pointer;

    overflow: hidden;

    min-width: 0;
    padding-block: 2px;
    padding-inline: 4px;
    border: none;
    border-radius: ${cssVar.borderRadiusSM};

    font-family: inherit;
    font-size: inherit;
    color: ${cssVar.colorTextTertiary};
    text-overflow: ellipsis;
    white-space: nowrap;

    background: none;

    &:hover {
      color: ${cssVar.colorText};
      background: ${cssVar.colorFillTertiary};
    }
  `,
  crumbStatic: css`
    cursor: default;

    &:hover {
      color: ${cssVar.colorTextTertiary};
      background: none;
    }
  `,
  /* The previewed file is the crumb a reader always needs in full, so it is the
     last one to give up width. */
  group: css`
    overflow: hidden;
    flex-shrink: 1;
    min-width: 0;
  `,
  groupLast: css`
    flex-shrink: 0;

    span {
      color: ${cssVar.colorText};
    }
  `,
  separator: css`
    display: flex;
    flex: none;
    align-items: center;
    color: ${cssVar.colorTextQuaternary};
  `,
}));

/**
 * One level of the path. A level backed by the project index opens a menu of
 * the files in that folder, so the breadcrumb doubles as a file switcher.
 *
 * Only files are listed: every folder on the path already has its own crumb, so
 * a sub-folder entry would be an affordance with nowhere to go.
 */
const Crumb = memo<{
  deviceId?: string;
  entries?: ProjectFileIndexEntry[];
  isLast: boolean;
  rootPath?: string;
  segment: BreadcrumbSegment;
}>(({ deviceId, entries, isLast, rootPath, segment }) => {
  const openLocalFile = useChatStore((s) => s.openLocalFile);

  const ownFolder = useMemo(() => {
    if (segment.relativePath === undefined) return;
    // The last crumb is the previewed file, so its menu lists its siblings.
    return isLast ? segment.relativePath.split('/').slice(0, -1).join('/') : segment.relativePath;
  }, [isLast, segment.relativePath]);

  const items = useMemo(() => {
    if (!entries || !rootPath || ownFolder === undefined) return [];

    return listDirectoryChildren(entries, ownFolder)
      .filter((child) => !child.isDirectory)
      .map((child) => ({
        icon: <Icon icon={FileIcon} size={14} />,
        key: child.path,
        label: child.name,
        onClick: () =>
          openLocalFile({ deviceId, filePath: child.path, workingDirectory: rootPath }),
      }));
  }, [deviceId, entries, openLocalFile, ownFolder, rootPath]);

  // A folder on the path holds at least the open file, so an empty result means
  // either the index does not reach here (a project past the walk's cap) or the
  // folder only holds sub-folders. Either way there is nothing to switch to.
  const canBrowse = items.length > 0;

  // A span rather than a button: the menu's trigger applies its own button
  // semantics, and base-ui rejects a native button as the element it renders.
  const crumb = (
    <span className={cx(styles.crumb, !canBrowse && styles.crumbStatic)}>{segment.name}</span>
  );

  if (!canBrowse) return crumb;

  return <DropdownMenu items={items}>{crumb}</DropdownMenu>;
});

Crumb.displayName = 'Crumb';

interface PathBreadcrumbProps {
  deviceId?: string;
  path: string;
  rootPath?: string;
}

const PathBreadcrumb = memo<PathBreadcrumbProps>(({ deviceId, path, rootPath }) => {
  const { data } = useProjectFiles(deviceId, rootPath);
  const segments = useMemo(() => toBreadcrumbSegments(path, rootPath), [path, rootPath]);

  return (
    <>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;

        return (
          <Flexbox
            horizontal
            align={'center'}
            className={cx(styles.group, isLast && styles.groupLast)}
            key={segment.path}
          >
            {index > 0 && (
              <span aria-hidden className={styles.separator}>
                <Icon icon={ChevronRightIcon} size={12} />
              </span>
            )}
            <Crumb
              deviceId={deviceId}
              entries={data?.entries}
              isLast={isLast}
              rootPath={rootPath}
              segment={segment}
            />
          </Flexbox>
        );
      })}
    </>
  );
});

PathBreadcrumb.displayName = 'PathBreadcrumb';

export default PathBreadcrumb;
