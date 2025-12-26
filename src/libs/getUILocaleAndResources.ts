import { normalizeLocale } from '@/locales/resources';

const getUILocale = (locale: string): string => {
  if (locale.startsWith('zh')) return 'zh-CN';
  if (locale.startsWith('en')) return 'en-US';
  return locale;
};

const loadResourcesFromJSON = async (locale: string) => {
  try {
    const resourcesModule = await import(`../../locales/${locale}/ui.json`);
    return resourcesModule.default;
  } catch (error) {
    console.warn(`Failed to load UI resources for locale ${locale}:`, error);
    return null;
  }
};

export const getUILocaleAndResources = async (
  locale: string | 'auto',
): Promise<{ locale: string; resources: any }> => {
  const effectiveLocale = locale === 'auto' ? 'en-US' : locale;
  const normalizedLocale = normalizeLocale(effectiveLocale);
  const uiLocale = getUILocale(normalizedLocale);

  // Load resources from JSON files
  const resources = await loadResourcesFromJSON(normalizedLocale);

  // Fallback to en-US if resources not found
  if (!resources && normalizedLocale !== 'en-US') {
    const fallbackResources = await loadResourcesFromJSON('en-US');
    return {
      locale: uiLocale,
      resources: fallbackResources || {},
    };
  }

  return {
    locale: uiLocale,
    resources: resources || {},
  };
};
