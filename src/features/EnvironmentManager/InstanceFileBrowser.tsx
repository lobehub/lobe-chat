'use client';

import { ActionIcon, createModal, Flexbox, Icon, Skeleton, Text } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import dayjs from 'dayjs';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CornerLeftUpIcon,
  FileIcon,
  FolderIcon,
} from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { sandboxStorageService } from '@/services/sandboxStorage';
import { formatSize } from '@/utils/format';

const styles = stylex.create({
  body: {
    overflow: 'hidden',
    height: '420px',
    borderBlockWidth: '1px',
    borderBlockStyle: 'solid',
    borderBlockColor: cssVar.colorBorderSecondary,
  },
  crumb: {
    cursor: 'pointer',
    flex: 'none',
    fontFamily: cssVar.fontFamilyCode,
    fontSize: cssVar.fontSizeSM,
    color: { 'default': cssVar.colorTextSecondary, ':hover': cssVar.colorText },
  },
  crumbCurrent: { cursor: 'default', color: cssVar.colorText },
  viewer: {
    overflow: 'auto',
    flex: '1',
    margin: '0',
    fontFamily: cssVar.fontFamilyCode,
    fontSize: cssVar.fontSizeSM,
    lineHeight: 1.6,
    color: cssVar.colorText,
    whiteSpace: 'pre',
  },
  meta: {
    flex: 'none',
    width: '92px',
    fontSize: cssVar.fontSizeSM,
    color: cssVar.colorTextTertiary,
    textAlign: 'end',
  },
  name: {
    overflow: 'hidden',
    flex: '1',
    minWidth: '0',
    fontSize: cssVar.fontSizeSM,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  row: {
    cursor: 'default',
    userSelect: 'none',
    paddingBlock: '7px',
    paddingInline: '16px',
    backgroundColor: { 'default': null, ':hover': cssVar.colorFillTertiary },
    backgroundImage: { 'default': null, ':hover': 'none' },
  },
  scroll: { overflowY: 'auto', height: '100%' },
  toolbar: { paddingBlock: '10px', paddingInline: '16px' },
});

/**
 * A NUL byte in what came back as text is the reliable tell that it is not.
 *
 * Built with `fromCharCode` rather than written as an escape: the formatter
 * normalizes a unicode escape in this file to the raw control character, which
 * leaves a test that looks like it compares against a space.
 */
const looksBinary = (content: string) => content.includes(String.fromCharCode(0));

/**
 * The execution plane answers 404 for a directory that is not there, and an
 * instance that has never been built or run does not have one: the row is
 * created in the database, while the folder appears the first time the
 * sandbox saves its work tree. That is a normal state, not a failure.
 */
const isMissingDirectory = (error: unknown) =>
  (error as { data?: { code?: string } })?.data?.code === 'NOT_FOUND';

interface InstanceFileBrowserProps {
  /**
   * The instance being browsed. Every file call names it, because the server
   * confines each path to this instance's directory — the workspace root around
   * it is shared with every other instance.
   */
  instanceId: string;
  /** The instance's directory, relative to the workspace root. */
  root: string;
}

/**
 * The files an instance has kept, in a window of its own — to look at, not to
 * change.
 *
 * This directory is the saved copy of the instance's work tree: the sandbox
 * runs the checkout on its own disk and writes it here, and it is the only
 * writer. An edit made here would be overwritten by the next save, or leave
 * the directory disagreeing with the record the next restore reads it by — so
 * nothing here writes, and the server refuses it too. Rebuildable content such
 * as `node_modules` is kept elsewhere and does not appear.
 *
 * Every path here is relative to the WORKSPACE root, which is the vocabulary the
 * execution plane speaks — an instance's directory is a prefix inside it, not a
 * separate root. Navigation therefore carries whole paths rather than composing
 * them, and the instance's own directory is simply where the walk starts and
 * the breadcrumb stops going back.
 *
 * No `topicId` is sent: there is no conversation here to borrow a warm sandbox
 * from, so the execution plane starts one to serve the call. That is the price
 * of reaching these files from a settings page, and it is why the listing is
 * fetched per directory rather than recursively up front.
 */
const InstanceFileBrowser = memo<InstanceFileBrowserProps>(({ instanceId, root }) => {
  const { t } = useTranslation('setting');

  const [cwd, setCwd] = useState(root);
  const [openFile, setOpenFile] = useState<string | undefined>();

  const listing = useSWR(
    ['sandbox-instance-files', cwd],
    () => sandboxStorageService.listFiles({ instanceId, path: cwd }),
    {
      // Each listing is a sandbox round trip. A missing directory is an answer,
      // not a failure to retry, and refocusing the window must not re-list.
      revalidateOnFocus: false,
      shouldRetryOnError: (error) => !isMissingDirectory(error),
    },
  );

  const file = useSWR(
    openFile ? ['sandbox-instance-file', openFile] : null,
    ([, path]: [string, string]) => sandboxStorageService.readFile({ instanceId, path }),
  );
  const content = file.data?.content ?? '';

  const entries = [...(listing.data?.entries ?? [])].sort((a, b) =>
    a.isDirectory === b.isDirectory ? a.name.localeCompare(b.name) : a.isDirectory ? -1 : 1,
  );

  // Only the part of the path below the instance's own directory. Above it is
  // the workspace root, which this window deliberately does not offer.
  const crumbs = cwd === root ? [] : cwd.slice(root.length + 1).split('/');

  const openDirectory = (path: string) => {
    setCwd(path);
    setOpenFile(undefined);
  };

  if (openFile)
    return (
      <Flexbox>
        <Flexbox
          horizontal
          align={'center'}
          className={stylex.props(styles.toolbar).className}
          gap={8}
        >
          <ActionIcon
            icon={ChevronLeftIcon}
            size={'small'}
            title={t('environments.files.back')}
            onClick={() => setOpenFile(undefined)}
          />
          <Text className={stylex.props(styles.name).className} title={openFile}>
            {openFile.slice(cwd.length + 1)}
          </Text>
        </Flexbox>

        <Flexbox className={stylex.props(styles.body).className} padding={16}>
          {file.isLoading ? (
            <Skeleton.Text rows={8} />
          ) : file.error ? (
            <Text fontSize={12} type={'danger'}>
              {t('environments.files.unreadable')}
            </Text>
          ) : looksBinary(content) ? (
            // Not rendered: the read path carries text, and a binary shown as
            // text is noise rather than its contents.
            <Text fontSize={12} type={'secondary'}>
              {t('environments.files.binary')}
            </Text>
          ) : (
            <pre {...stylex.props(styles.viewer)}>{content}</pre>
          )}
        </Flexbox>
      </Flexbox>
    );

  return (
    <Flexbox>
      <Flexbox
        horizontal
        align={'center'}
        className={stylex.props(styles.toolbar).className}
        gap={8}
      >
        <ActionIcon
          disabled={cwd === root}
          icon={CornerLeftUpIcon}
          size={'small'}
          title={t('environments.files.up')}
          onClick={() => openDirectory(cwd.slice(0, cwd.lastIndexOf('/')))}
        />
        {/* The instance's directory is the first crumb and the floor: there is
            no crumb above it, because the workspace root holds other instances'
            work and this window is about one instance. */}
        <Flexbox horizontal align={'center'} flex={1} gap={6} style={{ minWidth: 0 }}>
          <span
            className={
              cwd === root
                ? stylex.props(styles.crumb, styles.crumbCurrent).className
                : stylex.props(styles.crumb).className
            }
            onClick={() => openDirectory(root)}
          >
            {root}
          </span>
          {crumbs.map((crumb, index) => {
            const path = [root, ...crumbs.slice(0, index + 1)].join('/');
            const current = index === crumbs.length - 1;

            return (
              <Flexbox horizontal align={'center'} gap={6} key={path}>
                <Icon
                  icon={ChevronRightIcon}
                  size={12}
                  style={{ color: cssVar.colorTextQuaternary }}
                />
                <span
                  className={
                    current
                      ? stylex.props(styles.crumb, styles.crumbCurrent).className
                      : stylex.props(styles.crumb).className
                  }
                  onClick={() => !current && openDirectory(path)}
                >
                  {crumb}
                </span>
              </Flexbox>
            );
          })}
        </Flexbox>
      </Flexbox>

      <Flexbox className={stylex.props(styles.body).className}>
        <Flexbox className={stylex.props(styles.scroll).className}>
          {listing.isLoading ? (
            <Flexbox gap={8} padding={16}>
              <Skeleton.Text rows={5} />
            </Flexbox>
          ) : listing.error && !isMissingDirectory(listing.error) ? (
            <Flexbox padding={16}>
              <Text fontSize={12} type={'danger'}>
                {t('environments.files.listFailed')}
              </Text>
            </Flexbox>
          ) : entries.length === 0 ? (
            <Flexbox padding={16}>
              <Text fontSize={12} type={'secondary'}>
                {t(
                  listing.error && cwd === root
                    ? 'environments.files.unusedInstance'
                    : 'environments.files.empty',
                )}
              </Text>
            </Flexbox>
          ) : (
            entries.map((entry) => (
              <Flexbox
                horizontal
                align={'center'}
                className={stylex.props(styles.row).className}
                gap={8}
                key={entry.path}
                // Double-click to open, the way a file manager does. A single
                // click on a whole row is too easy to trigger while reading one.
                onDoubleClick={() =>
                  entry.isDirectory ? openDirectory(entry.path) : setOpenFile(entry.path)
                }
              >
                <Icon
                  icon={entry.isDirectory ? FolderIcon : FileIcon}
                  size={14}
                  style={{ color: cssVar.colorTextTertiary, flex: 'none' }}
                />
                <span {...stylex.props(styles.name)}>{entry.name}</span>
                <span {...stylex.props(styles.meta)}>
                  {entry.isDirectory || entry.size === undefined ? '' : formatSize(entry.size)}
                </span>
                <span {...stylex.props(styles.meta)}>
                  {entry.modifiedAt ? dayjs(entry.modifiedAt).format('MM-DD HH:mm') : ''}
                </span>
              </Flexbox>
            ))
          )}
        </Flexbox>
      </Flexbox>

      <Flexbox className={stylex.props(styles.toolbar).className} gap={2}>
        <Text fontSize={12} type={'secondary'}>
          {t('environments.files.openHint')}
        </Text>
        <Text fontSize={12} type={'secondary'}>
          {t('environments.files.readOnlyHint')}
        </Text>
      </Flexbox>
    </Flexbox>
  );
});

InstanceFileBrowser.displayName = 'InstanceFileBrowser';

/**
 * Opened as a window rather than inside the detail panel: a file listing needs
 * width the panel does not have, and browsing an instance is its own errand —
 * it should not replace the environment you were reading in order to start it.
 */
export const openInstanceFileBrowser = (instance: {
  id: string;
  name: string;
  workingDirectory: string;
}) =>
  createModal({
    content: <InstanceFileBrowser instanceId={instance.id} root={instance.workingDirectory} />,
    footer: null,
    maskClosable: true,
    styles: { content: { padding: 0 } },
    title: instance.name,
    width: 'min(92vw, 880px)',
  });

export default InstanceFileBrowser;
