'use client';

import { Flexbox, Tag, Text } from '@lobehub/ui';
import { cssVar as vars } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo, type ReactNode, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { connectorPath, type DecisionEffect, type DecisionGraphModel } from './decisionGraphModel';

/**
 * One decision drawn as a graph, left to right: what raised it → the options it
 * offered → where the answer went. The picked path is drawn solid in the accent
 * colour and everything passed over recedes, so a settled call reads as a route
 * through the options rather than a list of them.
 *
 * Lines are drawn from where the cards actually sit (cards wrap with their
 * text), so the container is measured and redrawn when it resizes.
 */

const styles = stylex.create({
  card: {
    backgroundColor: vars.colorBgContainer,
    borderColor: vars.colorBorderSecondary,
    borderRadius: vars.borderRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    paddingBlock: 8,
    paddingInline: 12,
    position: 'relative',
    zIndex: 1,
  },
  cardChosen: {
    borderColor: vars.colorPrimary,
  },
  cardDim: {
    opacity: 0.55,
  },
  cardResult: {
    backgroundColor: vars.colorFillQuaternary,
  },
  index: {
    alignItems: 'center',
    backgroundColor: vars.colorFillTertiary,
    borderRadius: vars.borderRadiusSM,
    color: vars.colorTextSecondary,
    display: 'flex',
    flexShrink: 0,
    fontSize: 12,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  link: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: vars.colorTextSecondary,
    cursor: 'pointer',
    padding: 0,
    textAlign: 'start',
    textDecorationLine: {
      ':hover': 'underline',
      'default': 'none',
    },
  },
  lines: {
    height: '100%',
    left: 0,
    overflow: 'visible',
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  wrap: {
    columnGap: 56,
    display: 'flex',
    marginBlockStart: 4,
    paddingBlock: 4,
    position: 'relative',
  },
});

interface Line {
  active: boolean;
  d: string;
  key: string;
}

export interface DecisionGraphRoot {
  /** What the question is about, e.g. the task that hit the gate. */
  context?: { onOpen?: () => void; title: string };
  /** The reason the question was asked. */
  detail?: string;
  /** Shown as the card's lead when nothing else says what this is about. */
  question: string;
}

export interface DecisionGraphResultView {
  /** Localized effect line, e.g. "Runs the task again". */
  effectLabel?: Record<DecisionEffect, string>;
  /** Who and when: the decider and the time. */
  header: ReactNode;
}

interface DecisionGraphProps {
  model: DecisionGraphModel;
  result?: DecisionGraphResultView;
  root: DecisionGraphRoot;
}

const DecisionGraph = memo<DecisionGraphProps>(({ model, result, root }) => {
  const { t } = useTranslation('chat');
  const wrapRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [lines, setLines] = useState<Line[]>([]);

  const chosenIndex = model.options.findIndex((option) => option.state === 'chosen');

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const rootEl = rootRef.current;
    if (!wrap || !rootEl) return;
    const box = wrap.getBoundingClientRect();
    const right = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return { x: r.right - box.left, y: r.top + r.height / 2 - box.top };
    };
    const left = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - box.left, y: r.top + r.height / 2 - box.top };
    };

    const next: Line[] = [];
    model.options.forEach((option, index) => {
      const el = optionRefs.current[index];
      if (!el) return;
      next.push({
        active: option.state === 'chosen',
        d: connectorPath(right(rootEl), left(el)),
        key: `root-${option.id}`,
      });
    });
    const resultEl = resultRef.current;
    if (model.result && resultEl) {
      const source = model.result.from === 'option' ? optionRefs.current[chosenIndex] : rootEl;
      if (source)
        next.push({ active: true, d: connectorPath(right(source), left(resultEl)), key: 'result' });
    }
    setLines(next);
  }, [chosenIndex, model]);

  useLayoutEffect(() => {
    measure();
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [measure]);

  const hasContext = !!root.context || !!root.detail;

  return (
    <div ref={wrapRef} {...stylex.props(styles.wrap)}>
      <svg aria-hidden {...stylex.props(styles.lines)}>
        {lines.map((line) => (
          <path
            d={line.d}
            fill={'none'}
            key={line.key}
            strokeWidth={line.active ? 1.5 : 1}
            style={{
              stroke: line.active ? 'var(--lobe-color-primary)' : 'var(--lobe-color-border)',
            }}
          />
        ))}
      </svg>

      <Flexbox flex={'0 1 26%'} justify={'center'} style={{ minWidth: 140 }}>
        <div ref={rootRef} {...stylex.props(styles.card)}>
          <Flexbox gap={4}>
            {hasContext ? (
              <>
                {root.context && (
                  <Flexbox gap={2}>
                    <Text fontSize={12} type={'secondary'}>
                      {t('goalProcess.decisions.raisedBy')}
                    </Text>
                    {root.context.onOpen ? (
                      <button
                        type={'button'}
                        {...stylex.props(styles.link)}
                        onClick={root.context.onOpen}
                      >
                        <Text style={{ wordBreak: 'break-word' }} weight={500}>
                          {root.context.title}
                        </Text>
                      </button>
                    ) : (
                      <Text style={{ wordBreak: 'break-word' }} weight={500}>
                        {root.context.title}
                      </Text>
                    )}
                  </Flexbox>
                )}
                {root.detail && (
                  <Text fontSize={13} style={{ wordBreak: 'break-word' }} type={'secondary'}>
                    {root.detail}
                  </Text>
                )}
              </>
            ) : (
              <Text style={{ wordBreak: 'break-word' }} weight={500}>
                {root.question}
              </Text>
            )}
          </Flexbox>
        </div>
      </Flexbox>

      <Flexbox flex={1} gap={10} justify={'center'} style={{ minWidth: 0 }}>
        {model.options.map((option, index) => (
          <div
            key={option.id}
            ref={(el) => {
              optionRefs.current[index] = el;
            }}
            {...stylex.props(
              styles.card,
              option.state === 'chosen' && styles.cardChosen,
              option.state === 'dim' && styles.cardDim,
            )}
          >
            <Flexbox horizontal align={'flex-start'} gap={8}>
              <span {...stylex.props(styles.index)}>{index + 1}</span>
              <Flexbox flex={1} gap={2} style={{ minWidth: 0 }}>
                <Flexbox horizontal align={'center'} gap={6} wrap={'wrap'}>
                  <Text
                    style={{ wordBreak: 'break-word' }}
                    weight={option.state === 'chosen' ? 600 : 500}
                  >
                    {option.label}
                  </Text>
                  {option.recommended && (
                    <Tag size={'small'}>{t('goalProcess.decisions.recommended')}</Tag>
                  )}
                  {option.state === 'chosen' && (
                    <Tag color={'success'} size={'small'}>
                      {t('goalProcess.decisions.chosen')}
                    </Tag>
                  )}
                </Flexbox>
                {option.description && (
                  <Text fontSize={13} style={{ wordBreak: 'break-word' }} type={'secondary'}>
                    {option.description}
                  </Text>
                )}
              </Flexbox>
            </Flexbox>
          </div>
        ))}
      </Flexbox>

      {model.result && result && (
        <Flexbox flex={'0 1 26%'} justify={'center'} style={{ minWidth: 140 }}>
          <div ref={resultRef} {...stylex.props(styles.card, styles.cardResult)}>
            <Flexbox gap={6}>
              {result.header}
              {model.result.effect && result.effectLabel && (
                <Text style={{ wordBreak: 'break-word' }} weight={500}>
                  {result.effectLabel[model.result.effect]}
                </Text>
              )}
              {model.result.note && (
                <Text fontSize={13} style={{ wordBreak: 'break-word' }} type={'secondary'}>
                  {model.result.note}
                </Text>
              )}
            </Flexbox>
          </div>
        </Flexbox>
      )}
    </div>
  );
});

DecisionGraph.displayName = 'GoalDecisionGraph';

export default DecisionGraph;
