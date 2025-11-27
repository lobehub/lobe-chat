import { BuiltinRenderProps } from '@lobechat/types';
import { CheckCircle, HelpCircle } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { SetOpeningQuestionsParams, SetOpeningQuestionsState } from '../types';

const SetOpeningQuestions = memo<
  BuiltinRenderProps<SetOpeningQuestionsParams, SetOpeningQuestionsState>
>(({ pluginState }) => {
  const { questions = [] } = pluginState || {};

  return (
    <Flexbox gap={8} style={{ fontSize: 13 }}>
      <Flexbox align={'center'} gap={6} horizontal style={{ color: 'var(--lobe-success-6)' }}>
        <CheckCircle size={14} />
        <span style={{ fontWeight: 500 }}>
          {questions.length > 0
            ? `Set ${questions.length} opening question(s)`
            : 'Opening questions removed'}
        </span>
      </Flexbox>

      {questions.length > 0 && (
        <Flexbox gap={8} style={{ marginLeft: 20 }}>
          {questions.map((question, index) => (
            <Flexbox
              align={'center'}
              gap={8}
              horizontal
              key={index}
              style={{
                background: 'var(--lobe-fill-tertiary)',
                borderRadius: 6,
                padding: '8px 12px',
              }}
            >
              <HelpCircle size={14} style={{ color: 'var(--lobe-text-tertiary)', flexShrink: 0 }} />
              <span style={{ color: 'var(--lobe-text)' }}>{question}</span>
            </Flexbox>
          ))}
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default SetOpeningQuestions;
