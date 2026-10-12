'use client';

import { Flexbox } from '@lobehub/ui';
import { Text } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { memo, type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { parseSkillMarkdownMetadata } from '@/utils/skillMarkdown';

const styles = createStaticStyles(({ css }) => ({
  frontmatter: css`
    margin-block: 16px 12px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 8px;
    background: ${cssVar.colorBgContainer};
  `,
  metadataKey: css`
    flex-shrink: 0;
    width: 112px;
    font-family: ${cssVar.fontFamilyCode};
    color: ${cssVar.colorTextSecondary};
  `,
  metadataRow: css`
    padding-block: 10px;
    padding-inline: 12px;

    &:not(:last-child) {
      border-block-end: 1px solid ${cssVar.colorBorderSecondary};
    }
  `,
  metadataValue: css`
    min-width: 0;
    white-space: pre-wrap;
  `,
  sectionHeader: css`
    padding-block: 10px;
    padding-inline: 12px;
    border-block-end: 1px solid ${cssVar.colorBorderSecondary};
  `,
}));

interface SkillFrontmatterCardProps {
  /** Replaces the key/value rows, e.g. the raw YAML while editing. */
  children?: ReactNode;
  /** The header's right side, e.g. an edit action. */
  extra?: ReactNode;
  frontmatter: string;
}

/**
 * A skill's frontmatter as a document shows it: a card of key/value rows above
 * the body. Read-only on its own; a host adds editing through `extra`.
 */
const SkillFrontmatterCard = memo<SkillFrontmatterCardProps>(({ children, extra, frontmatter }) => {
  const { t } = useTranslation('editor');
  const metadata = useMemo(() => parseSkillMarkdownMetadata(frontmatter), [frontmatter]);

  return (
    <Flexbox className={styles.frontmatter}>
      <Flexbox horizontal align="center" className={styles.sectionHeader} justify="space-between">
        <Text type="secondary">{t('skillFrontmatter.title')}</Text>
        {extra}
      </Flexbox>
      {children ??
        (metadata.length > 0 ? (
          metadata.map((item) => (
            <Flexbox horizontal align="flex-start" className={styles.metadataRow} key={item.key}>
              <Text className={styles.metadataKey}>{item.key}</Text>
              <Text className={styles.metadataValue}>{item.value}</Text>
            </Flexbox>
          ))
        ) : (
          <Flexbox className={styles.metadataRow}>
            <Text type="secondary">{t('skillFrontmatter.empty')}</Text>
          </Flexbox>
        ))}
    </Flexbox>
  );
});

SkillFrontmatterCard.displayName = 'SkillFrontmatterCard';

export default SkillFrontmatterCard;
