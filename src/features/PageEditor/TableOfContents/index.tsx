'use client';

import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import type { RefObject } from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { sx } from '@/styles/sx';

import type { TocHeading } from './headings';
import { collectHeadings, findActiveIndex, findBodyRoot } from './headings';

/** A heading counts as "being read" once it scrolls within this distance of the pane top. */
const ACTIVE_THRESHOLD = 96;
const SCROLL_MARGIN = 24;
const MIN_HEADINGS = 2;

const styles = stylex.create({
  container: {
    alignItems: 'flex-end',
    display: { 'default': 'flex', '@media (max-width: 1024px)': 'none' },
    flexDirection: 'column',
    insetBlockStart: 96,
    insetInlineEnd: 12,
    position: 'absolute',
    zIndex: 10,
  },
  item: {
    backgroundColor: { 'default': null, ':hover': cssVar.colorFillTertiary },
    borderRadius: 6,
    color: { 'default': cssVar.colorTextSecondary, ':hover': cssVar.colorText },
    cursor: 'pointer',
    fontSize: 13,
    lineHeight: 1.4,
    overflow: 'hidden',
    paddingBlock: 4,
    paddingInlineEnd: 8,
    textOverflow: 'ellipsis',
    transition: 'background-color 0.15s',
    whiteSpace: 'nowrap',
    width: '100%',
  },
  itemActive: {
    color: { 'default': cssVar.colorPrimary, ':hover': cssVar.colorPrimary },
    fontWeight: 500,
  },
  line: {
    backgroundColor: cssVar.colorFill,
    borderRadius: 1,
    height: 2,
    transition: 'background-color 0.15s',
  },
  lineActive: {
    backgroundColor: cssVar.colorText,
  },
  lines: {
    alignItems: 'flex-end',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    paddingBlock: 8,
    paddingInline: 8,
  },
  panel: {
    backgroundColor: cssVar.colorBgElevated,
    borderColor: cssVar.colorBorderSecondary,
    borderRadius: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    boxShadow: cssVar.boxShadowSecondary,
    insetBlockStart: 0,
    insetInlineEnd: 0,
    maxHeight: 'min(480px, 60vh)',
    overflowY: 'auto',
    padding: 6,
    position: 'absolute',
    width: 240,
  },
  title: {
    color: cssVar.colorTextTertiary,
    fontSize: 12,
    paddingBlockStart: '4px',
    paddingBlockEnd: '6px',
    paddingInline: 8,
  },
});

const LINE_WIDTH: Record<TocHeading['level'], number> = { 1: 20, 2: 14, 3: 9 };
const ITEM_INDENT: Record<TocHeading['level'], number> = { 1: 8, 2: 20, 3: 32 };

interface TableOfContentsProps {
  /** Element holding the page body; its first Lexical root is the outline source. */
  contentRef: RefObject<HTMLElement | null>;
  /** Scrollable pane wrapping the body. */
  scrollRef: RefObject<HTMLElement | null>;
}

const TableOfContents = memo<TableOfContentsProps>(({ contentRef, scrollRef }) => {
  const { t } = useTranslation('file');
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [expanded, setExpanded] = useState(false);
  // A clicked heading near the end of the page may never reach the top of the
  // pane, so it stays active until the user scrolls on their own.
  const pinnedIndexRef = useRef<number | null>(null);

  const updateActive = useCallback(
    (list: TocHeading[]) => {
      const pane = scrollRef.current;
      if (!pane) return;

      if (pinnedIndexRef.current !== null) {
        setActiveIndex(pinnedIndexRef.current);
        return;
      }

      const paneTop = pane.getBoundingClientRect().top;
      setActiveIndex(
        findActiveIndex(
          list.map(({ element }) => element.getBoundingClientRect().top - paneTop),
          ACTIVE_THRESHOLD,
        ),
      );
    },
    [scrollRef],
  );

  // Follow the body as it is edited or loaded; the Lexical root itself can be
  // replaced when switching documents, so observe the whole content subtree.
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    let frame = 0;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = collectHeadings(findBodyRoot(content));
        setHeadings(next);
        updateActive(next);
      });
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(content, { characterData: true, childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [contentRef, updateActive]);

  useEffect(() => {
    const pane = scrollRef.current;
    if (!pane) return;

    let frame = 0;
    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => updateActive(headings));
    };

    const releasePin = () => {
      pinnedIndexRef.current = null;
    };

    pane.addEventListener('scroll', handleScroll, { passive: true });
    pane.addEventListener('wheel', releasePin, { passive: true });
    pane.addEventListener('touchstart', releasePin, { passive: true });
    pane.addEventListener('keydown', releasePin);

    return () => {
      cancelAnimationFrame(frame);
      pane.removeEventListener('scroll', handleScroll);
      pane.removeEventListener('wheel', releasePin);
      pane.removeEventListener('touchstart', releasePin);
      pane.removeEventListener('keydown', releasePin);
    };
  }, [headings, scrollRef, updateActive]);

  const scrollToHeading = useCallback(
    (heading: TocHeading, index: number) => {
      const pane = scrollRef.current;
      if (!pane) return;

      pinnedIndexRef.current = index;
      setActiveIndex(index);

      const offset = heading.element.getBoundingClientRect().top - pane.getBoundingClientRect().top;
      pane.scrollTo({ behavior: 'smooth', top: pane.scrollTop + offset - SCROLL_MARGIN });
    },
    [scrollRef],
  );

  if (headings.length < MIN_HEADINGS) return null;

  return (
    <nav
      aria-label={t('pageEditor.toc.title')}
      {...stylex.props(styles.container)}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div {...stylex.props(styles.lines)}>
        {headings.map((heading, index) => (
          <div
            key={index}
            {...sx([styles.line, index === activeIndex && styles.lineActive], undefined, {
              width: LINE_WIDTH[heading.level],
            })}
          />
        ))}
      </div>
      {expanded && (
        <div {...stylex.props(styles.panel)}>
          <div {...stylex.props(styles.title)}>{t('pageEditor.toc.title')}</div>
          {headings.map((heading, index) => (
            <div
              aria-current={index === activeIndex ? 'location' : undefined}
              key={index}
              role="link"
              {...sx([styles.item, index === activeIndex && styles.itemActive], undefined, {
                paddingInlineStart: ITEM_INDENT[heading.level],
              })}
              tabIndex={0}
              title={heading.text}
              onClick={() => scrollToHeading(heading, index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') scrollToHeading(heading, index);
              }}
            >
              {heading.text}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
});

TableOfContents.displayName = 'PageTableOfContents';

export default TableOfContents;
