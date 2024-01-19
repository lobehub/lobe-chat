import { ConfigProvider } from 'antd';
import { PropsWithChildren, memo, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';

import { DEFAULT_LANG } from '@/const/locale';
import { createI18nNext } from '@/locales/create';
import { useOnFinishHydrationGlobal } from '@/store/global';
import { isOnServerSide } from '@/utils/env';
import { switchLang } from '@/utils/switchLang';

interface LocaleLayoutProps extends PropsWithChildren {
  defaultLang?: string;
}

const FETCH_ANTD_LOCALE = 'fetch-antd-locale';

const Locale = memo<LocaleLayoutProps>(({ children, defaultLang }) => {
  const [lang, setLang] = useState(defaultLang ?? DEFAULT_LANG);
  const [i18n] = useState(createI18nNext(defaultLang));

  const { data: locale } = useSWR(
    [FETCH_ANTD_LOCALE, lang],
    async ([, l]) => {
      const localeName = l?.includes('-') ? l?.replace('-', '_') : 'en_US';
      const antdLocale = await import(`antd/locale/${localeName}.js`);

      return antdLocale.default ?? antdLocale;
    },
    { revalidateOnFocus: false },
  );

  // if run on server side, init i18n instance everytime
  if (isOnServerSide) {
    i18n.init();
  } else {
    // if on browser side, init i18n instance only once
    if (!i18n.instance.isInitialized) {
      i18n.init();
    }
  }

  // 判断注水后，用户本地持久化偏好语言是否被切换
  const isHydrated = useRef(false);
  useEffect(() => {
    const putLang = (lng: string) => {
      if (isHydrated.current) {
        return (isHydrated.current = false);
      }
      setLang(lng);
    };
    i18n.instance.on('languageChanged', putLang);
    return () => i18n.instance.off('languageChanged', putLang);
  }, []);

  useOnFinishHydrationGlobal((s) => {
    if (s.settings.language !== defaultLang) {
      isHydrated.current = true;
      switchLang(s.settings.language);
    }
  }, []);

  return <ConfigProvider locale={locale}>{children}</ConfigProvider>;
});

export default Locale;
