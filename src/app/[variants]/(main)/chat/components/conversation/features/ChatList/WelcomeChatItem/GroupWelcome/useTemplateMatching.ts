import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGroupTemplates } from '@/components/ChatGroupWizard/templates';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { LobeGroupSession } from '@/types/session';

interface TemplateMatch {
  activities: Record<string, { description: string; emoji: string; prompt: string; title: string }>;
  templateId: string;
}

export const useTemplateMatching = (): TemplateMatch | null => {
  const { t } = useTranslation('welcome');
  const groupTemplates = useGroupTemplates();
  const currentSession = useSessionStore(
    sessionSelectors.currentSession,
  ) as LobeGroupSession | null;

  console.log('groupTemplates', groupTemplates);
  console.log('currentSession', currentSession);

  return useMemo(() => {
    if (!currentSession || currentSession.type !== 'group') {
      console.log('No group session found:', { currentSession });
      return null;
    }

    const currentTitle = currentSession.meta?.title || '';
    const currentMemberCount = currentSession.members?.length || 0;

    console.log('Current group session:', {
      memberCount: currentMemberCount,
      members: currentSession.members,
      title: currentTitle,
    });

    // Try to match by title and member count
    for (const template of groupTemplates) {
      const templateTitle = template.title;
      const templateMemberCount = template.members.length;

      console.log('Checking template:', {
        memberCountDiff: Math.abs(templateMemberCount - currentMemberCount),
        templateId: template.id,
        templateMemberCount,
        templateTitle,
        titleMatch: templateTitle.toLowerCase() === currentTitle.toLowerCase(),
      });

      // Check if titles match (case-insensitive) and member counts are similar (±1)
      if (
        templateTitle.toLowerCase() === currentTitle.toLowerCase() &&
        Math.abs(templateMemberCount - currentMemberCount) <= 1
      ) {
        console.log('Found exact match for template:', template.id);
        // Get template-specific activities from i18n
        const templateActivities = (t as any)(`guide.groupActivities.${template.id}`, {
          returnObjects: true,
        }) as Record<string, { description: string; emoji: string; prompt: string; title: string }>;

        console.log('Template activities:', templateActivities);

        return {
          activities: templateActivities || {},
          templateId: template.id,
        };
      }
    }

    // If no exact match, try partial title matching
    console.log('No exact match found, trying partial matching...');
    for (const template of groupTemplates) {
      const templateTitle = template.title;

      const currentIncludes = currentTitle.toLowerCase().includes(templateTitle.toLowerCase());
      const templateIncludes = templateTitle.toLowerCase().includes(currentTitle.toLowerCase());

      console.log('Partial match check:', {
        currentIncludes,
        templateId: template.id,
        templateIncludes,
        templateTitle,
      });

      if (currentIncludes || templateIncludes) {
        console.log('Found partial match for template:', template.id);
        const templateActivities = (t as any)(`guide.groupActivities.${template.id}`, {
          returnObjects: true,
        }) as Record<string, { description: string; emoji: string; prompt: string; title: string }>;

        console.log('Template activities:', templateActivities);

        return {
          activities: templateActivities || {},
          templateId: template.id,
        };
      }
    }

    console.log('No template match found, returning null');
    return null;
  }, [currentSession, groupTemplates, t]);
};
