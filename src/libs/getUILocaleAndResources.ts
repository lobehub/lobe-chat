const loadBuiltinResources = async () => {
  const { en, zhCn } = await import('@lobehub/ui/i18n');
  return { en, zhCn };
};

const getUILocale = (locale: string): string => {
  if (locale.startsWith('zh')) return 'zh-CN';
  if (locale.startsWith('en')) return 'en-US';
  return 'en-US';
};

const loadCustomResources = async (locale: string) => {
  try {
    const locates = await import(`@/locales/ui/${locale}.ts`);
    return locates.default;
  } catch (error) {
    console.warn(`Failed to load UI resources for locale ${locale}:`, error);
    return null;
  }
};

export const getUILocaleAndResources = async (
  locale: string | 'auto',
): Promise<{ locale: string; resources: any }> => {
  const effectiveLocale = locale === 'auto' ? 'en-US' : locale;
  const uiLocale = getUILocale(effectiveLocale);

  const { en, zhCn } = await loadBuiltinResources();

  let resources;

  if (effectiveLocale.startsWith('zh-CN')) {
    resources = zhCn;
  } else if (effectiveLocale.startsWith('en')) {
    resources = en;
  } else {
    const customResources = await loadCustomResources(effectiveLocale);
    resources = customResources || en;
  }

  return {
    locale: uiLocale,
    resources,
  };
};
