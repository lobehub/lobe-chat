import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGroupTemplates } from '@/components/ChatGroupWizard/templates';
import { useAgentGroupStore } from '@/store/agentGroup';
import { agentGroupSelectors } from '@/store/agentGroup/selectors';

interface TemplateMatch {
  activities: Record<string, { description: string; emoji: string; prompt: string; title: string }>;
  templateId: string;
}

export const useTemplateMatching = (): TemplateMatch | null => {
  const { t } = useTranslation('welcome');
  const groupTemplates = useGroupTemplates();
  const currentGroup = useAgentGroupStore(agentGroupSelectors.currentGroup);
  const currentGroupAgents = useAgentGroupStore(agentGroupSelectors.currentGroupAgents);

  return useMemo(() => {
    if (!currentGroup) {
      console.warn('No group found:', { currentGroup });
      return null;
    }

    const currentTitle = currentGroup.title || '';
    const currentMemberCount = currentGroupAgents?.length || 0;

    // Try to match by title and member count
    for (const template of groupTemplates) {
      const templateTitle = template.title;
      const templateMemberCount = template.members.length;

      // Check if titles match (case-insensitive) and member counts are similar (±1)
      if (
        templateTitle.toLowerCase() === currentTitle.toLowerCase() &&
        Math.abs(templateMemberCount - currentMemberCount) <= 1
      ) {
        console.warn('Found exact match for template:', template.id);
        // Get template-specific activities from i18n
        const templateActivities = (t as any)(`guide.groupActivities.${template.id}`, {
          returnObjects: true,
        }) as Record<string, { description: string; emoji: string; prompt: string; title: string }>;

        return {
          activities: templateActivities || {},
          templateId: template.id,
        };
      }
    }

    // If no exact match, try partial title matching
    console.warn('No exact match found, trying partial matching...');
    for (const template of groupTemplates) {
      const templateTitle = template.title;

      const currentIncludes = currentTitle.toLowerCase().includes(templateTitle.toLowerCase());
      const templateIncludes = templateTitle.toLowerCase().includes(currentTitle.toLowerCase());

      if (currentIncludes || templateIncludes) {
        const templateActivities = (t as any)(`guide.groupActivities.${template.id}`, {
          returnObjects: true,
        }) as Record<string, { description: string; emoji: string; prompt: string; title: string }>;

        return {
          activities: templateActivities || {},
          templateId: template.id,
        };
      }
    }
    return null;
  }, [currentGroup, currentGroupAgents, groupTemplates, t]);
};
