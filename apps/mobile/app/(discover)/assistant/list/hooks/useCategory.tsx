import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BadgeDollarSign,
  Briefcase,
  Coffee,
  Drama,
  Gamepad,
  GraduationCap,
  Image,
  Languages,
  Laugh,
  Layers,
  LayoutPanelTop,
  Microscope,
  Pencil,
  Printer,
  TerminalSquare,
} from 'lucide-react-native';
import { AssistantCategory } from '@/types/discover';

const CATEGORY_CONFIG = [
  {
    icon: LayoutPanelTop,
    key: AssistantCategory.All,
    translationKey: 'category.assistant.all',
  },
  {
    icon: Microscope,
    key: AssistantCategory.Academic,
    translationKey: 'category.assistant.academic',
  },
  {
    icon: Briefcase,
    key: AssistantCategory.Career,
    translationKey: 'category.assistant.career',
  },
  {
    icon: Pencil,
    key: AssistantCategory.CopyWriting,
    translationKey: 'category.assistant.copywriting',
  },
  {
    icon: Image,
    key: AssistantCategory.Design,
    translationKey: 'category.assistant.design',
  },
  {
    icon: GraduationCap,
    key: AssistantCategory.Education,
    translationKey: 'category.assistant.education',
  },
  {
    icon: Laugh,
    key: AssistantCategory.Emotions,
    translationKey: 'category.assistant.emotions',
  },
  {
    icon: Drama,
    key: AssistantCategory.Entertainment,
    translationKey: 'category.assistant.entertainment',
  },
  {
    icon: Gamepad,
    key: AssistantCategory.Games,
    translationKey: 'category.assistant.games',
  },
  {
    icon: Layers,
    key: AssistantCategory.General,
    translationKey: 'category.assistant.general',
  },
  {
    icon: Coffee,
    key: AssistantCategory.Life,
    translationKey: 'category.assistant.life',
  },
  {
    icon: BadgeDollarSign,
    key: AssistantCategory.Marketing,
    translationKey: 'category.assistant.marketing',
  },
  {
    icon: Printer,
    key: AssistantCategory.Office,
    translationKey: 'category.assistant.office',
  },
  {
    icon: TerminalSquare,
    key: AssistantCategory.Programming,
    translationKey: 'category.assistant.programming',
  },
  {
    icon: Languages,
    key: AssistantCategory.Translation,
    translationKey: 'category.assistant.translation',
  },
] as const;

const useCategory = () => {
  const { t } = useTranslation('discover');

  return useMemo(
    () =>
      CATEGORY_CONFIG.map((category) => ({
        icon: category.icon,
        key: category.key,
        label: t(category.translationKey),
      })),
    [t],
  );
};

export default useCategory;
