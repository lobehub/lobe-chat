import { LanguagesIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatInputStore } from '../../store';
import Action from '../components/Action';
import { useInputTranslate } from './useInputTranslate';

const InputTranslate = memo(() => {
  const { t } = useTranslation('chat');
  const [isTranslating, setIsTranslating] = useState(false);
  const editor = useChatInputStore((s) => s.editor);
  const { translateToEnglish } = useInputTranslate();

  const handleTranslate = async () => {
    if (!editor || isTranslating) return;

    const content = editor.getDocument('markdown') as string;
    if (!content?.trim()) return;

    setIsTranslating(true);
    try {
      const translatedContent = await translateToEnglish(content);
      if (translatedContent && translatedContent !== content) {
        editor.setDocument('markdown', translatedContent);
      }
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Action
      icon={LanguagesIcon}
      loading={isTranslating}
      onClick={handleTranslate}
      title={t('input.translateToEnglish')}
    />
  );
});

InputTranslate.displayName = 'InputTranslate';

export default InputTranslate;