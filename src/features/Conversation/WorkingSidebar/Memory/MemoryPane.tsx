import { EMPTY_ARRAY } from '@lobechat/const';
import type { DeviceClaudeCodeMemoryFile } from '@lobechat/types';
import { ActionIcon, Center, createStaticStyles, Empty, Flexbox, Icon, Text } from '@lobehub/ui';
import { BrainIcon, FileTextIcon, RefreshCwIcon } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import AsyncBoundary from '@/components/AsyncBoundary';
import { SkillSection } from '@/features/SkillsList';
import { useChatStore } from '@/store/chat';

import { groupMemoryFiles, memoryFilePortalTarget } from './memoryView';
import { useClaudeCodeMemory } from './useClaudeCodeMemory';

const styles = createStaticStyles(({ css, cssVar }) => ({
  description: css`
    padding-inline-start: 20px;
    font-size: 12px;
    line-height: 1.5;
    color: ${cssVar.colorTextTertiary};
  `,
  item: css`
    cursor: pointer;

    display: flex;
    flex-direction: column;
    gap: 2px;

    width: 100%;
    padding-block: 6px;
    padding-inline: 4px 8px;
    border: none;
    border-radius: 6px;

    font-size: 13px;
    color: ${cssVar.colorTextSecondary};
    text-align: start;

    background: transparent;

    &:hover,
    &:focus-visible {
      color: ${cssVar.colorText};
      background: ${cssVar.colorFillTertiary};
    }
  `,
  itemIcon: css`
    flex-shrink: 0;
    color: ${cssVar.colorTextTertiary};
  `,
  location: css`
    flex: 1;
    min-width: 0;
    font-size: 12px;
  `,
}));

interface MemoryRowProps {
  file: DeviceClaudeCodeMemoryFile;
  indexHint: string;
  onOpen: (file: DeviceClaudeCodeMemoryFile) => void;
}

const MemoryRow = memo<MemoryRowProps>(({ file, indexHint, onOpen }) => {
  const description = file.description ?? (file.isIndex ? indexHint : undefined);

  return (
    <button
      className={styles.item}
      title={file.relativePath}
      type="button"
      onClick={() => onOpen(file)}
    >
      <Flexbox horizontal align={'center'} gap={6} width={'100%'}>
        <Icon className={styles.itemIcon} icon={FileTextIcon} size={14} />
        <Text ellipsis style={{ color: 'inherit', flex: 1, minWidth: 0 }}>
          {file.isIndex ? file.relativePath : file.name}
        </Text>
      </Flexbox>
      {description && (
        <Text className={styles.description} ellipsis={{ rows: 2 }}>
          {description}
        </Text>
      )}
    </button>
  );
});

MemoryRow.displayName = 'ClaudeCodeMemoryRow';

interface MemoryPaneProps {
  /** Bound device; the memory is then read and saved over RPC. */
  deviceId?: string;
  workingDirectory: string;
}

/**
 * Claude Code's auto memory for the selected project
 * (`~/.claude/projects/<project key>/memory`). Each file opens in the local-file
 * portal, where it can be edited and saved back in place.
 */
export const MemoryPane = memo<MemoryPaneProps>(({ deviceId, workingDirectory }) => {
  const { t } = useTranslation('chat');
  const openLocalFile = useChatStore((s) => s.openLocalFile);
  const { data, error, isLoading, isValidating, mutate } = useClaudeCodeMemory(
    deviceId,
    workingDirectory,
  );
  const files = data?.files ?? EMPTY_ARRAY;
  const groups = useMemo(() => groupMemoryFiles(files), [files]);
  const memoryDir = data?.memoryDir;

  const openMemory = useCallback(
    (file: DeviceClaudeCodeMemoryFile) => {
      if (memoryDir) openLocalFile(memoryFilePortalTarget(file, memoryDir, deviceId));
    },
    [deviceId, memoryDir, openLocalFile],
  );
  const refresh = useCallback(() => void mutate(), [mutate]);

  return (
    <Flexbox
      data-testid={'workspace-memory'}
      flex={1}
      gap={12}
      paddingBlock={8}
      paddingInline={'8px 12px'}
      style={{ minHeight: 0 }}
    >
      <AsyncBoundary
        data={data}
        error={error}
        errorVariant={'inline'}
        isEmpty={!error && files.length === 0}
        isLoading={isLoading}
        empty={
          <Center flex={1} paddingBlock={24}>
            <Empty
              description={t('workingPanel.memory.empty.description')}
              icon={BrainIcon}
              title={t('workingPanel.memory.empty.title')}
            />
          </Center>
        }
        onRetry={refresh}
      >
        <Flexbox horizontal align={'center'} gap={4} paddingInline={4}>
          <Text ellipsis className={styles.location} title={memoryDir} type={'secondary'}>
            {t('workingPanel.memory.location', { path: memoryDir })}
          </Text>
          <ActionIcon
            aria-label={t('workingPanel.memory.refresh')}
            icon={RefreshCwIcon}
            loading={isValidating}
            size={'small'}
            title={t('workingPanel.memory.refresh')}
            onClick={refresh}
          />
        </Flexbox>
        {groups.map((group) => (
          <SkillSection
            key={group.key}
            sectionHeader={{
              count: group.files.length,
              title: t(`workingPanel.memory.group.${group.key}`),
            }}
          >
            {group.files.map((file) => (
              <MemoryRow
                file={file}
                indexHint={t('workingPanel.memory.indexHint')}
                key={file.path}
                onOpen={openMemory}
              />
            ))}
          </SkillSection>
        ))}
      </AsyncBoundary>
    </Flexbox>
  );
});

MemoryPane.displayName = 'ClaudeCodeMemoryPane';
