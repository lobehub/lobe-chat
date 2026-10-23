'use client';

import { Flexbox, Tag, Text } from '@lobehub/ui';
import { cssVar as vars } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * One decision opened up: the options the question offered, branching off a
 * rail. The picked option is marked, the advised one is tagged, and the rest
 * recede — so a settled call reads as "of these, this one", with the guidance
 * the person wrote hanging off the option it went with.
 */

export interface DecisionTreeOption {
  description?: string;
  id: string;
  label: string;
}

const styles = stylex.create({
  chosen: {
    backgroundColor: vars.colorFillQuaternary,
  },
  dim: {
    opacity: 0.55,
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
  option: {
    borderRadius: vars.borderRadiusSM,
    paddingBlock: 6,
    paddingInline: 8,
  },
  tick: {
    backgroundColor: vars.colorBorderSecondary,
    flexShrink: 0,
    height: 1,
    marginBlockStart: 16,
    marginInlineStart: -14,
    width: 10,
  },
  tree: {
    borderInlineStartColor: vars.colorBorderSecondary,
    borderInlineStartStyle: 'solid',
    borderInlineStartWidth: 1,
    marginBlockStart: 4,
    marginInlineStart: 8,
    paddingInlineStart: 14,
  },
});

interface DecisionOptionTreeProps {
  chosenId?: string | null;
  /** Guidance written with the answer; hangs off the chosen option. */
  note?: string;
  options: DecisionTreeOption[];
  recommendedId?: string | null;
}

const DecisionOptionTree = memo<DecisionOptionTreeProps>(
  ({ chosenId, note, options, recommendedId }) => {
    const { t } = useTranslation('chat');
    const settled = !!chosenId && options.some((option) => option.id === chosenId);

    return (
      <div role={'list'} {...stylex.props(styles.tree)}>
        {options.map((option, index) => {
          const chosen = settled && option.id === chosenId;
          return (
            <div
              key={option.id}
              role={'listitem'}
              {...stylex.props(
                styles.option,
                chosen && styles.chosen,
                settled && !chosen && styles.dim,
              )}
            >
              <Flexbox horizontal align={'flex-start'} gap={8}>
                <span {...stylex.props(styles.tick)} />
                <span {...stylex.props(styles.index)}>{index + 1}</span>
                <Flexbox flex={1} gap={2} style={{ minWidth: 0 }}>
                  <Flexbox horizontal align={'center'} gap={6} wrap={'wrap'}>
                    <Text style={{ wordBreak: 'break-word' }} weight={chosen ? 600 : 500}>
                      {option.label}
                    </Text>
                    {option.id === recommendedId && (
                      <Tag size={'small'}>{t('goalProcess.decisions.recommended')}</Tag>
                    )}
                    {chosen && (
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
                  {chosen && note && (
                    <Text fontSize={13} style={{ wordBreak: 'break-word' }} type={'secondary'}>
                      {note}
                    </Text>
                  )}
                </Flexbox>
              </Flexbox>
            </div>
          );
        })}
      </div>
    );
  },
);

DecisionOptionTree.displayName = 'GoalDecisionOptionTree';

export default DecisionOptionTree;
