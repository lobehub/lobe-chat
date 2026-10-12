'use client';

import { Flexbox } from '@lobehub/ui';
import { Text } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar, cx } from 'antd-style';
import { memo, type RefObject, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PlanHeading } from './skillVersions';

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6';

const styles = createStaticStyles(({ css }) => ({
  item: css`
    cursor: pointer;

    overflow: hidden;

    margin-inline-start: -1px;
    padding-block: 4px;
    border-inline-start: 1px solid transparent;

    font-size: 12px;
    line-height: 1.5;
    color: ${cssVar.colorTextTertiary};
    text-overflow: ellipsis;
    white-space: nowrap;

    transition: color 0.15s;

    &:hover {
      color: ${cssVar.colorText};
    }
  `,
  itemActive: css`
    border-inline-start-color: ${cssVar.colorText};
    color: ${cssVar.colorText};
  `,
  list: css`
    border-inline-start: 1px solid ${cssVar.colorBorderSecondary};
  `,
  root: css`
    overflow-y: auto;
    flex: none;

    width: 168px;
    padding-block: 16px;
    padding-inline: 8px 16px;
  `,
}));

interface PlanTocProps {
  headings: PlanHeading[];
  /** The scroll host the document renders in; its headings are the TOC's targets, in order. */
  scrollRef: RefObject<HTMLDivElement | null>;
}

/**
 * The plan's table of contents beside the document: its headings, the one
 * being read marked, a click scrolling to it.
 */
const PlanToc = memo<PlanTocProps>(({ headings, scrollRef }) => {
  const { t } = useTranslation('chat');
  const [active, setActive] = useState(0);

  useEffect(() => {
    const host = scrollRef.current;
    if (!host) return;
    const onScroll = () => {
      const top = host.getBoundingClientRect().top + 24;
      const targets = [...host.querySelectorAll<HTMLElement>(HEADING_SELECTOR)];
      let current = 0;
      targets.forEach((target, index) => {
        if (target.getBoundingClientRect().top <= top) current = index;
      });
      setActive(current);
    };
    host.addEventListener('scroll', onScroll, { passive: true });
    return () => host.removeEventListener('scroll', onScroll);
  }, [scrollRef, headings]);

  if (headings.length === 0) return null;
  const minLevel = Math.min(...headings.map((heading) => heading.level));

  return (
    <Flexbox data-plan-toc className={styles.root} gap={8}>
      <Text fontSize={12} type={'secondary'} weight={500}>
        {t('goalBatch.planPanel.toc')}
      </Text>
      <div className={styles.list}>
        {headings.map((heading, index) => (
          <div
            className={cx(styles.item, index === active && styles.itemActive)}
            key={`${index}-${heading.text}`}
            role={'link'}
            style={{ paddingInlineStart: 12 + (heading.level - minLevel) * 12 }}
            title={heading.text}
            onClick={() => {
              setActive(index);
              const targets = scrollRef.current?.querySelectorAll<HTMLElement>(HEADING_SELECTOR);
              targets?.[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {heading.text}
          </div>
        ))}
      </div>
    </Flexbox>
  );
});

PlanToc.displayName = 'GoalPlanToc';

export default PlanToc;
