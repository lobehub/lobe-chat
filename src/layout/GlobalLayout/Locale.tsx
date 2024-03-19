import { ConfigProvider } from 'antd';
import { PropsWithChildren, memo, useEffect, useState } from 'react';
import { isRtlLang } from 'rtl-detect';
import useSWR from 'swr';

import { createI18nNext } from '@/locales/create';
import { normalizeLocale } from '@/locales/resources';
import { isOnServerSide } from '@/utils/env';

const getAntdLocale = async (lang?: string) => {
  let normalLang = normalizeLocale(lang);

  // due to antd only have ar-EG locale, we need to convert ar to ar-EG
  // refs: https://ant.design/docs/react/i18n

  // And we don't want to handle it in `normalizeLocale` function
  // because of other locale files are all `ar` not `ar-EG`
  if (normalLang === 'ar') normalLang = 'ar-EG';

  const { default: locale } = await import(`antd/locale/${normalLang.replace('-', '_')}.js`);

  return locale;
};

interface LocaleLayoutProps extends PropsWithChildren {
  defaultLang?: string;
}

const Locale = memo<LocaleLayoutProps>(({ children, defaultLang }) => {
  const [i18n] = useState(createI18nNext(defaultLang));
  const [lang, setLang] = useState(defaultLang);

  const { data: locale } = useSWR(['antd-locale', lang], ([, key]) => getAntdLocale(key), {
    dedupingInterval: 0,
    revalidateOnFocus: false,
  });

  // if run on server side, init i18n instance everytime
  if (isOnServerSide) {
    i18n.init();
  } else {
    // if on browser side, init i18n instance only once
    if (!i18n.instance.isInitialized)
      // console.debug('locale', lang);
      i18n.init().then(() => {
        // console.debug('inited.');
      });
  }

  // handle i18n instance language change
  useEffect(() => {
    const handleLang = (e: string) => {
      setLang(e);
    };

    i18n.instance.on('languageChanged', handleLang);
    return () => {
      i18n.instance.off('languageChanged', handleLang);
    };
  }, [i18n]);

  // detect document direction
  const documentDir = isRtlLang(lang!) ? 'rtl' : 'ltr';

  return (
    <ConfigProvider direction={documentDir} locale={locale}>
      {children}
    </ConfigProvider>
  );
});

export default Locale;
