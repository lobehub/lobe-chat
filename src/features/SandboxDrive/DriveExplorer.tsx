'use client';

import type { SandboxDrive } from '@lobechat/builtin-tool-cloud-sandbox';
import {
  ActionIcon,
  Alert,
  Button,
  confirmModal,
  DropdownMenu,
  Flexbox,
  Icon,
  Tag,
  Text,
  toast,
  Tooltip,
} from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import dayjs from 'dayjs';
import {
  FileIcon,
  FolderIcon,
  FolderPlusIcon,
  HardDriveIcon,
  LockIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PencilIcon,
  RefreshCwIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react';
import { memo, type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError } from '@/features/EnvironmentManager/errorMessage';
import {
  DriveBreadcrumb,
  driveParentPath,
  joinDrivePath,
  NewFolderInput,
  openRenameFolderModal,
} from '@/features/WorkingDirectory';
import { sandboxStorageService } from '@/services/sandboxStorage';
import { formatSize } from '@/utils/format';

import { useDriveDirectories, useDriveFiles, useRefreshDrive } from './useDriveData';

/** The row's trailing columns, fixed so names, times and menus line up row to row. */
const SIZE_WIDTH = 72;
const TIME_WIDTH = 88;
const ACTIONS_WIDTH = 28;

const styles = stylex.create({
  clickable: {
    cursor: 'pointer',
    outline: { 'default': null, ':focus-visible': `2px solid ${cssVar.colorPrimaryBorder}` },
    outlineOffset: { 'default': null, ':focus-visible': -2 },
  },
  entryIcon: {
    color: cssVar.colorTextSecondary,
    flex: 'none',
  },
  frame: {
    backgroundColor: cssVar.colorBgContainer,
    borderColor: cssVar.colorBorderSecondary,
    borderRadius: cssVar.borderRadiusLG,
    borderStyle: 'solid',
    borderWidth: 1,
    overflow: 'hidden',
  },
  list: {
    maxHeight: 'min(560px, 60vh)',
    minHeight: 240,
    overflowY: 'auto',
    padding: 4,
  },
  muted: {
    color: cssVar.colorTextTertiary,
  },
  row: {
    backgroundColor: { 'default': null, ':hover': cssVar.colorFillQuaternary },
    borderRadius: cssVar.borderRadius,
    minHeight: 40,
    paddingBlock: 4,
    paddingInline: 12,
  },
  toolbar: {
    borderBlockEndColor: cssVar.colorBorderSecondary,
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: 1,
    minHeight: 48,
    paddingBlock: 8,
    paddingInline: 12,
  },
});

interface DriveExplorerProps {
  drive: SandboxDrive;
  /** In a workspace, where the public drive's root holds a reminder for legacy directories. */
  isWorkspace: boolean;
  /** Before the toolbar's actions — a personal account's usage, which is this drive's alone. */
  toolbarExtra?: ReactNode;
}

/**
 * One drive, browsed like a file manager: folders and files, a new folder,
 * rename and delete for ordinary entries.
 *
 * Environment directories sit at the drive's root with a badge. They are the
 * saved copy of a sandbox's work tree and written by its own sessions alone,
 * so they can be opened and looked through here but never changed: no rename,
 * no delete, no new folder inside — the server refuses all three anyway. A
 * private environment's directory left on the public drive from before
 * personal drives is hidden by the server; its owner is told to rebuild it.
 */
const DriveExplorer = memo<DriveExplorerProps>(({ drive, isWorkspace, toolbarExtra }) => {
  const { t } = useTranslation(['setting', 'device', 'common']);
  const [path, setPath] = useState('');
  const [creating, setCreating] = useState(false);
  const [rebuildDismissed, setRebuildDismissed] = useState(false);
  const files = useDriveFiles(drive, path);
  const directories = useDriveDirectories(drive);
  const refreshDrive = useRefreshDrive();

  const tSetting = (key: string, options?: Record<string, unknown>) =>
    (t as (key: string, options?: Record<string, unknown>) => string)(key, {
      ...options,
      ns: 'setting',
    });

  const environmentDirectories = useMemo(
    () =>
      new Map(
        (directories.data?.instances ?? [])
          .filter((instance) => !instance.rebuildRequired)
          .map((instance) => [instance.workingDirectory, instance]),
      ),
    [directories.data],
  );
  const toRebuild = (directories.data?.instances ?? []).filter(
    (instance) => instance.rebuildRequired,
  );

  // Inside an environment directory everything is read-only, however deep.
  const insideEnvironment = [...environmentDirectories.keys()].find(
    (directory) => path === directory || path.startsWith(`${directory}/`),
  );

  const entries = [...(files.data?.entries ?? [])].sort(
    (a, b) => Number(b.isDirectory) - Number(a.isDirectory) || a.name.localeCompare(b.name),
  );

  const failed = (error: unknown, fallback: string) =>
    toast.error(describeError(error, tSetting, fallback));

  const rename = (entry: { name: string; path: string }) =>
    openRenameFolderModal({
      currentName: entry.name,
      onSubmit: async (name) => {
        try {
          await sandboxStorageService.renameFile({
            drive,
            newPath: joinDrivePath(driveParentPath(entry.path) ?? '', name),
            path: entry.path,
          });
          await refreshDrive();
        } catch (error) {
          return describeError(
            error,
            tSetting,
            t('workingDirectory.drive.renameFailed', { ns: 'device' }),
          );
        }
      },
    });

  const remove = (entry: { isDirectory: boolean; name: string; path: string }) =>
    confirmModal({
      cancelText: t('cancel', { ns: 'common' }),
      content: t(
        entry.isDirectory
          ? 'drive.explorer.deleteFolderContent'
          : 'drive.explorer.deleteFileContent',
      ),
      okButtonProps: { danger: true },
      okText: t('drive.explorer.delete'),
      onOk: async () => {
        try {
          await sandboxStorageService.removeFile({
            drive,
            path: entry.path,
            recursive: entry.isDirectory,
          });
          await refreshDrive();
        } catch (error) {
          failed(error, t('workingDirectory.drive.actionFailed', { ns: 'device' }));
        }
      },
      title: t('drive.explorer.deleteTitle', { name: entry.name }),
    });

  const readOnlyHere = !!insideEnvironment;
  const scope = drive === 'public' && isWorkspace ? 'public' : 'personal';
  const showRebuild =
    isWorkspace && drive === 'public' && !path && toRebuild.length > 0 && !rebuildDismissed;

  const menuFor = (entry: { isDirectory: boolean; name: string; path: string }) => (
    <span
      role={'none'}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <DropdownMenu
        placement={'bottomRight'}
        items={[
          ...(entry.isDirectory
            ? [
                {
                  icon: <Icon icon={PencilIcon} />,
                  key: 'rename',
                  label: t('drive.explorer.rename'),
                  onClick: () => rename(entry),
                },
              ]
            : []),
          {
            danger: true,
            icon: <Icon icon={Trash2Icon} />,
            key: 'delete',
            label: t('drive.explorer.delete'),
            onClick: () => remove(entry),
          },
        ]}
      >
        <ActionIcon
          aria-label={t('drive.explorer.moreActions')}
          icon={MoreHorizontalIcon}
          size={'small'}
        />
      </DropdownMenu>
    </span>
  );

  return (
    <Flexbox className={stylex.props(styles.frame).className}>
      <Flexbox
        horizontal
        align={'center'}
        className={stylex.props(styles.toolbar).className}
        gap={12}
      >
        <Flexbox horizontal align={'center'} flex={1} gap={8} style={{ minWidth: 0 }} wrap={'wrap'}>
          <DriveBreadcrumb
            icon={HardDriveIcon}
            path={path}
            rootLabel={t(`drive.tabs.${drive}`)}
            onNavigate={setPath}
          />
          {/* Who else sees what is here: the one fact that tells the two drives apart. */}
          <Flexbox horizontal align={'center'} gap={4}>
            <Icon
              className={stylex.props(styles.muted).className}
              icon={scope === 'public' ? UsersIcon : LockIcon}
              size={12}
            />
            <Text fontSize={12} type={'secondary'}>
              {t(`drive.scope.${scope}`)}
            </Text>
          </Flexbox>
        </Flexbox>
        {toolbarExtra}
        <ActionIcon
          icon={RefreshCwIcon}
          loading={files.isValidating && !files.isLoading}
          size={'small'}
          title={t('workingDirectory.refreshFolders', { ns: 'device' })}
          onClick={() => void refreshDrive()}
        />
        <Tooltip title={readOnlyHere ? t('drive.explorer.readOnly') : undefined}>
          <Button
            disabled={readOnlyHere || !!files.error}
            icon={<Icon icon={FolderPlusIcon} />}
            type={'primary'}
            onClick={() => setCreating(true)}
          >
            {t('drive.explorer.newFolder')}
          </Button>
        </Tooltip>
      </Flexbox>

      {showRebuild && (
        <Alert
          showIcon
          closable={{ onClose: () => setRebuildDismissed(true) }}
          style={{ borderRadius: 0 }}
          type={'warning'}
          variant={'soft'}
          title={
            <Text fontSize={13} weight={400}>
              {t('workingDirectory.drive.rebuildInPersonal', {
                count: toRebuild.length,
                names: toRebuild.map((instance) => instance.name).join(', '),
                ns: 'device',
              })}
            </Text>
          }
        />
      )}

      <Flexbox className={stylex.props(styles.list).className} gap={2}>
        {readOnlyHere && (
          <Flexbox horizontal align={'center'} gap={6} paddingBlock={6} paddingInline={12}>
            <Icon className={stylex.props(styles.muted).className} icon={LockIcon} size={12} />
            <Text fontSize={12} type={'secondary'}>
              {t('drive.explorer.readOnlyHint')}
            </Text>
          </Flexbox>
        )}

        {creating && (
          <Flexbox paddingInline={6}>
            <NewFolderInput
              parentPath={path}
              source={{
                createFolder: async (parentPath, name) => {
                  const created = joinDrivePath(parentPath, name);
                  await sandboxStorageService.createDirectory({ drive, path: created });
                  return { path: created };
                },
                folderErrorKey: (error) =>
                  (error as { message?: string })?.message === 'INSTANCE_READ_ONLY'
                    ? 'workingDirectory.drive.readOnly'
                    : undefined,
              }}
              onCancel={() => setCreating(false)}
              onCreated={() => {
                setCreating(false);
                void refreshDrive();
              }}
            />
          </Flexbox>
        )}

        {files.isLoading || (!path && directories.isLoading) ? (
          <Flexbox align={'center'} flex={1} justify={'center'} padding={24}>
            <Text type={'secondary'}>{t('workingDirectory.foldersLoading', { ns: 'device' })}</Text>
          </Flexbox>
        ) : files.error || (!path && directories.error) ? (
          // At the root the instances say which folders are environment
          // directories, which are read-only here; without them such a folder
          // would offer rename and delete, so their failure fails the listing.
          <Flexbox align={'center'} flex={1} gap={12} justify={'center'} padding={24}>
            <Text type={'secondary'}>{t('drive.explorer.loadFailed')}</Text>
            <Button
              onClick={() => void Promise.all([files.mutate(), !path && directories.mutate()])}
            >
              {t('retry', { ns: 'common' })}
            </Button>
          </Flexbox>
        ) : entries.length === 0 && !creating ? (
          <Flexbox align={'center'} flex={1} gap={12} justify={'center'} padding={24}>
            <Text type={'secondary'}>
              {t(path ? 'drive.explorer.empty' : `drive.explorer.emptyRoot.${scope}`)}
            </Text>
            {!readOnlyHere && (
              <Button icon={<Icon icon={FolderPlusIcon} />} onClick={() => setCreating(true)}>
                {t('drive.explorer.newFolder')}
              </Button>
            )}
          </Flexbox>
        ) : (
          entries.map((entry) => {
            const environment = !path ? environmentDirectories.get(entry.path) : undefined;
            const readOnly = !!environment || readOnlyHere;
            const open = entry.isDirectory ? () => setPath(entry.path) : undefined;

            return (
              <Flexbox
                horizontal
                align={'center'}
                className={stylex.props(styles.row, open && styles.clickable).className}
                data-testid={'drive-entry'}
                gap={10}
                key={entry.path}
                role={open ? 'button' : undefined}
                tabIndex={open ? 0 : undefined}
                onClick={open}
                onKeyDown={
                  open
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          open();
                        }
                      }
                    : undefined
                }
              >
                <Icon
                  className={stylex.props(styles.entryIcon).className}
                  icon={environment ? PackageIcon : entry.isDirectory ? FolderIcon : FileIcon}
                  size={16}
                />
                <Flexbox horizontal align={'center'} flex={1} gap={8} style={{ minWidth: 0 }}>
                  <Text ellipsis fontSize={13}>
                    {entry.name}
                  </Text>
                  {/* Which environment built it; read-only follows from that and is
                      said once inside, not as a second badge on every row. */}
                  {environment && (
                    <Tooltip title={t('drive.explorer.readOnlyHint')}>
                      <Tag icon={<Icon icon={PackageIcon} size={12} />} size={'small'}>
                        {environment.name === entry.name
                          ? t('workingDirectory.drive.environmentBadge', { ns: 'device' })
                          : environment.name}
                      </Tag>
                    </Tooltip>
                  )}
                </Flexbox>
                <Text
                  fontSize={12}
                  style={{ flex: 'none', textAlign: 'end', width: SIZE_WIDTH }}
                  type={'secondary'}
                >
                  {!entry.isDirectory && entry.size !== undefined ? formatSize(entry.size) : ''}
                </Text>
                <Text
                  fontSize={12}
                  style={{ flex: 'none', textAlign: 'end', width: TIME_WIDTH }}
                  type={'secondary'}
                >
                  {entry.modifiedAt ? dayjs(entry.modifiedAt).fromNow() : ''}
                </Text>
                <Flexbox flex={'none'} style={{ width: ACTIONS_WIDTH }}>
                  {!readOnly && menuFor(entry)}
                </Flexbox>
              </Flexbox>
            );
          })
        )}
      </Flexbox>
    </Flexbox>
  );
});

DriveExplorer.displayName = 'DriveExplorer';

export default DriveExplorer;
