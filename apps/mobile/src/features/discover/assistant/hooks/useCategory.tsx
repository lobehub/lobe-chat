import { AssistantCategory } from '@lobechat/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const CATEGORY_CONFIG = [
  {
    key: AssistantCategory.All,
    translationKey: 'category.assistant.all',
  },
  {
    key: AssistantCategory.Academic,
    translationKey: 'category.assistant.academic',
  },
  {
    key: AssistantCategory.Career,
    translationKey: 'category.assistant.career',
  },
  {
    key: AssistantCategory.CopyWriting,
    translationKey: 'category.assistant.copywriting',
  },
  {
    key: AssistantCategory.Design,
    translationKey: 'category.assistant.design',
  },
  {
    key: AssistantCategory.Education,
    translationKey: 'category.assistant.education',
  },
  {
    key: AssistantCategory.Emotions,
    translationKey: 'category.assistant.emotions',
  },
  {
    key: AssistantCategory.Entertainment,
    translationKey: 'category.assistant.entertainment',
  },
  {
    key: AssistantCategory.Games,
    translationKey: 'category.assistant.games',
  },
  {
    key: AssistantCategory.General,
    translationKey: 'category.assistant.general',
  },
  {
    key: AssistantCategory.Life,
    translationKey: 'category.assistant.life',
  },
  {
    key: AssistantCategory.Marketing,
    translationKey: 'category.assistant.marketing',
  },
  {
    key: AssistantCategory.Office,
    translationKey: 'category.assistant.office',
  },
  {
    key: AssistantCategory.Programming,
    translationKey: 'category.assistant.programming',
  },
  {
    key: AssistantCategory.Translation,
    translationKey: 'category.assistant.translation',
  },
] as const;

const useCategory = () => {
  const { t } = useTranslation('discover');

  return useMemo(
    () =>
      CATEGORY_CONFIG.map((category) => ({
        key: category.key,
        label: t(category.translationKey),
      })),
    [t],
  );
};

export default useCategory;
