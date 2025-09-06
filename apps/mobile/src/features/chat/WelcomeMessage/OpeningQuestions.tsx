import React, { useCallback } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

import { useSendMessage } from '@/hooks/useSendMessage';
import { useChatStore } from '@/store/chat';
import { useStyles } from './OpeningQuestions.style';
import { useTranslation } from 'react-i18next';

interface OpeningQuestionsProps {
  questions: string[];
}

const OpeningQuestions: React.FC<OpeningQuestionsProps> = ({ questions }) => {
  const { t } = useTranslation('welcome');
  const { styles } = useStyles();
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
    <View style={styles.container}>
      <Text style={styles.title}>{t('guide.questions.title', { ns: 'welcome' })}</Text>
      <View style={styles.questionsWrapper}>
        {questions.map((question, index) => (
          <TouchableOpacity
            activeOpacity={0.7}
            key={index}
            onPress={() => handleQuestionPress(question)}
            style={styles.questionButton}
          >
            <Text style={styles.questionText}>{question}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default OpeningQuestions;
