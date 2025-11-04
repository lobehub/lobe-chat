import { Block, Flexbox, Text } from '@lobehub/ui-rn';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useSendMessage } from '@/hooks/useSendMessage';
import { useChatStore } from '@/store/chat';

interface OpeningQuestionsProps {
  questions: string[];
}

const OpeningQuestions = memo<OpeningQuestionsProps>(({ questions }) => {
  const { t } = useTranslation('welcome');
  const [updateInputMessage] = useChatStore((s) => [s.updateInputMessage]);
  const { send: sendMessage } = useSendMessage();

  const handleQuestionPress = useCallback(
    (question: string) => {
      updateInputMessage(question);
      sendMessage({ isWelcomeQuestion: true });
    },
    [updateInputMessage, sendMessage],
  );

  if (!questions.length) return null;

  return (
    <Flexbox gap={16}>
      <Text type={'secondary'}>{t('guide.questions.title', { ns: 'welcome' })}</Text>
      <Flexbox gap={8} horizontal wrap={'wrap'}>
        {questions.map((question, index) => (
          <Block
            key={index}
            onPress={() => handleQuestionPress(question)}
            padding={12}
            pressEffect
            variant={'outlined'}
          >
            <Text>{question}</Text>
          </Block>
        ))}
      </Flexbox>
    </Flexbox>
  );
});

export default OpeningQuestions;
