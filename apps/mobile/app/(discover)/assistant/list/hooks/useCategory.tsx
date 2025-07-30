import { useTranslation } from 'react-i18next';
import { AssistantCategory } from '@/types/discover';

const useCategory = () => {
  const { t } = useTranslation('discover');

  return [
    {
      key: AssistantCategory.All,
      label: t('category.assistant.all'),
    },
    {
      key: AssistantCategory.Academic,
      label: t('category.assistant.academic'),
    },
    {
      key: AssistantCategory.Career,
      label: t('category.assistant.career'),
    },
    {
      key: AssistantCategory.CopyWriting,
      label: t('category.assistant.copywriting'),
    },
    {
      key: AssistantCategory.Design,
      label: t('category.assistant.design'),
    },
    {
      key: AssistantCategory.Education,
      label: t('category.assistant.education'),
    },
    {
      key: AssistantCategory.Emotions,
      label: t('category.assistant.emotions'),
    },
    {
      key: AssistantCategory.Entertainment,
      label: t('category.assistant.entertainment'),
    },
    {
      key: AssistantCategory.Games,
      label: t('category.assistant.games'),
    },
    {
      key: AssistantCategory.General,
      label: t('category.assistant.general'),
    },
    {
      key: AssistantCategory.Life,
      label: t('category.assistant.life'),
    },
    {
      key: AssistantCategory.Marketing,
      label: t('category.assistant.marketing'),
    },
    {
      key: AssistantCategory.Office,
      label: t('category.assistant.office'),
    },
    {
      key: AssistantCategory.Programming,
      label: t('category.assistant.programming'),
    },
    {
      key: AssistantCategory.Translation,
      label: t('category.assistant.translation'),
    },
  ];
};

export default useCategory;
