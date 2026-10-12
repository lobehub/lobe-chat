'use client';

import { type SkillResourceTreeNode } from '@lobechat/types';
import { Github } from '@lobehub/icons';
import { Flexbox, Icon } from '@lobehub/ui';
import { ActionIcon } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { DotIcon, ExternalLinkIcon } from 'lucide-react';
import { memo, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PublishedTime from '@/components/PublishedTime';
import { ArticleSkeleton } from '@/components/Skeleton';
import SkillAvatar from '@/components/SkillAvatar';
import FileTree, { FileTreeSkeleton } from '@/features/FileTree';

import ContentViewer from './ContentViewer';

const styles = createStaticStyles(({ css, cssVar }) => ({
  description: css`
    overflow: hidden;

    margin: 0;

    font-size: 13px;
    line-height: 1.5;
    color: ${cssVar.colorTextSecondary};
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  divider: css`
    flex-shrink: 0;
    width: 1px;
    background: ${cssVar.colorBorderSecondary};
  `,
  left: css`
    overflow-y: auto;
    flex-shrink: 0;
    padding: 8px;
  `,
  meta: css`
    flex-shrink: 0;
    padding: 16px;
    border-block-end: 1px solid ${cssVar.colorBorderSecondary};
  `,
  name: css`
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;
    color: ${cssVar.colorText};
  `,
  right: css`
    container-type: size;
    overflow: auto;
    flex: 1;
  `,
}));

/** Text files of a skill keyed by path, for the viewer. */
export const buildContentMap = (nodes: SkillResourceTreeNode[] = []): Record<string, string> => {
  const map: Record<string, string> = {};
  const walk = (items: SkillResourceTreeNode[]) => {
    for (const node of items) {
      if (node.type === 'file' && node.content !== undefined) {
        map[node.path] = node.content;
      } else if (node.children) {
        walk(node.children);
      }
    }
  };
  walk(nodes);
  return map;
};

const DEFAULT_TREE_WIDTH = 240;

export interface SkillDetailViewProps {
  /** `SKILL.md` as shown — frontmatter and body. */
  content?: string;
  description?: string;
  /** Under the description: what this host adds, e.g. a version switcher. */
  headerExtra?: ReactNode;
  name: string;
  /** Replaces the selected file's content, e.g. a diff between versions. */
  renderContent?: (selectedFile: string) => ReactNode | undefined;
  repository?: string;
  resourceTree: SkillResourceTreeNode[];
  sourceUrl?: string;
  /** Narrower in a side panel than in the modal. */
  treeWidth?: number;
  updatedAt?: Date | string;
  version?: number | string;
}

/**
 * A skill as the product shows it: who it is on top, its files on the left,
 * the selected file on the right. Data comes from the host, so a skill from
 * any source — an agent's, or the user's own library — reads the same.
 */
const SkillDetailView = memo<SkillDetailViewProps>(
  ({
    content,
    description,
    headerExtra,
    name,
    renderContent,
    repository,
    resourceTree,
    sourceUrl,
    treeWidth = DEFAULT_TREE_WIDTH,
    updatedAt,
    version,
  }) => {
    const { t } = useTranslation('setting');
    const [selectedFile, setSelectedFile] = useState('SKILL.md');
    const contentMap = buildContentMap(resourceTree);
    const replaced = renderContent?.(selectedFile);

    return (
      <Flexbox style={{ height: '100%', overflow: 'hidden' }}>
        <div className={styles.meta}>
          <Flexbox horizontal align={'center'} gap={12}>
            <SkillAvatar size={40} />
            <Flexbox flex={1} gap={4} style={{ overflow: 'hidden' }}>
              <Flexbox horizontal align={'center'} gap={8} justify={'space-between'}>
                <Flexbox horizontal align={'center'} className={styles.description} gap={4}>
                  <span className={styles.name}>{name}</span>
                  {version !== undefined && (
                    <>
                      <Icon icon={DotIcon} />
                      <span>v{version}</span>
                    </>
                  )}
                  {updatedAt && (
                    <>
                      <Icon icon={DotIcon} />
                      {t('agentSkillDetail.updatedAt')}{' '}
                      <PublishedTime
                        date={new Date(updatedAt).toISOString()}
                        template={'MMM DD, YYYY'}
                      />
                    </>
                  )}
                </Flexbox>
                {(repository || sourceUrl) && (
                  <Flexbox horizontal align={'center'} gap={2} style={{ flexShrink: 0 }}>
                    {repository && (
                      <a href={repository} rel="noreferrer" target={'_blank'}>
                        <ActionIcon
                          fill={cssVar.colorTextDescription}
                          icon={Github}
                          title={t('agentSkillDetail.repository')}
                        />
                      </a>
                    )}
                    {sourceUrl && (
                      <a href={sourceUrl} rel="noreferrer" target={'_blank'}>
                        <ActionIcon
                          icon={ExternalLinkIcon}
                          title={t('agentSkillDetail.sourceUrl')}
                        />
                      </a>
                    )}
                  </Flexbox>
                )}
              </Flexbox>
              {description && <p className={styles.description}>{description}</p>}
            </Flexbox>
          </Flexbox>
          {headerExtra && <div style={{ marginBlockStart: 12 }}>{headerExtra}</div>}
        </div>
        <Flexbox horizontal style={{ flex: 1, overflow: 'hidden' }}>
          <div className={styles.left} style={{ width: treeWidth }}>
            <FileTree
              resourceTree={resourceTree}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
            />
          </div>
          <div className={styles.divider} />
          <div className={styles.right} key={selectedFile}>
            {replaced ?? (
              <ContentViewer
                contentMap={contentMap}
                liveContent={content}
                selectedFile={selectedFile}
              />
            )}
          </div>
        </Flexbox>
      </Flexbox>
    );
  },
);

SkillDetailView.displayName = 'SkillDetailView';

export const SkillDetailSkeleton = memo<{ treeWidth?: number }>(
  ({ treeWidth = DEFAULT_TREE_WIDTH }) => (
    <Flexbox style={{ height: '100%', overflow: 'hidden' }}>
      <div className={styles.meta}>
        <ArticleSkeleton rows={1} style={{ margin: 0 }} title={220} />
      </div>
      <Flexbox horizontal style={{ flex: 1, overflow: 'hidden' }}>
        <div className={styles.left} style={{ width: treeWidth }}>
          <FileTreeSkeleton rows={9} />
        </div>
        <div className={styles.divider} />
        <div className={styles.right}>
          <ArticleSkeleton rows={8} style={{ padding: 16 }} />
        </div>
      </Flexbox>
    </Flexbox>
  ),
);

SkillDetailSkeleton.displayName = 'SkillDetailSkeleton';

export default SkillDetailView;
