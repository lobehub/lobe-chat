'use client';

import { Flexbox } from '@lobehub/ui';
import { Text } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const styles = createStaticStyles(({ css }) => ({
  /**
   * A real `<button>` rather than a clickable div: these are the page's main
   * way in, and a div with an `onClick` is unreachable by keyboard or switch
   * control. The UA chrome is reset here instead of re-implementing focus.
   */
  row: css`
    cursor: pointer;

    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;

    inline-size: 100%;
    padding-block: 14px;
    padding-inline: 0;
    border: none;
    border-block-start: 1px solid ${cssVar.colorBorderSecondary};

    font: inherit;
    text-align: start;

    appearance: none;
    background: none;

    &:first-child {
      border-block-start: 0;
    }

    &:hover {
      color: ${cssVar.colorTextSecondary};
    }
  `,
}));

interface StartersProps {
  onPick: (question: string) => void;
  /** Creator-authored opening questions, straight from the agent config. */
  questions: string[];
}

/**
 * The owner surface has always shown these; the visitor — who needs the hint
 * most — used to get a blank composer instead. Picking one carries the text
 * into the conversation as a draft, never as a sent message.
 */
const Starters = memo<StartersProps>(({ onPick, questions }) => {
  const { t } = useTranslation('agent');

  if (questions.length === 0) return null;

  return (
    <Flexbox gap={12}>
      <Flexbox gap={4}>
        <Text fontSize={17} weight={600}>
          {t('share.visitor.profile.starters.title')}
        </Text>
        <Text fontSize={13} type={'secondary'}>
          {t('share.visitor.profile.starters.desc')}
        </Text>
      </Flexbox>
      <div>
        {questions.map((question) => (
          <button
            className={styles.row}
            key={question}
            type={'button'}
            onClick={() => onPick(question)}
          >
            <Text fontSize={15}>{question}</Text>
            <ChevronRight size={16} style={{ flex: 'none', opacity: 0.45 }} />
          </button>
        ))}
      </div>
    </Flexbox>
  );
});

Starters.displayName = 'AgentShareProfileStarters';

export default Starters;
