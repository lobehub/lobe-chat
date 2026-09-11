'use client';

import { Flexbox } from '@lobehub/ui';
import { Text } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const styles = createStaticStyles(({ css }) => ({
  row: css`
    cursor: pointer;

    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;

    padding-block: 14px;
    border-block-start: 1px solid ${cssVar.colorBorderSecondary};

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
          <div className={styles.row} key={question} onClick={() => onPick(question)}>
            <Text fontSize={15}>{question}</Text>
            <ChevronRight size={16} style={{ flex: 'none', opacity: 0.45 }} />
          </div>
        ))}
      </div>
    </Flexbox>
  );
});

Starters.displayName = 'AgentShareProfileStarters';

export default Starters;
