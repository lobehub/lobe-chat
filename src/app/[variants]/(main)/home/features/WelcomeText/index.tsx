import { TypewriterEffect } from '@lobehub/ui/awesome';
import { LoadingDots } from '@lobehub/ui/chat';
import { shuffle } from 'lodash-es';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

const WelcomeText = memo(() => {
  const { t } = useTranslation('welcome');

  const sentences = useMemo(() => {
    const messages = t('welcomeMessages', { returnObjects: true }) as Record<string, string>;
    return shuffle(Object.values(messages));
  }, [t]);

  return (
    <Center
      style={{
        fontSize: 28,
        fontWeight: 'bold',
        marginBlock: '56px 16px',
      }}
    >
      <TypewriterEffect
        cursorCharacter={<LoadingDots size={20} variant={'pulse'} />}
        cursorFade={false}
        deletePauseDuration={1000}
        deletingSpeed={44}
        hideCursorWhileTyping={'afterTyping'}
        pauseDuration={16_000}
        sentences={sentences}
        typingSpeed={88}
      />
    </Center>
  );
});

export default WelcomeText;
