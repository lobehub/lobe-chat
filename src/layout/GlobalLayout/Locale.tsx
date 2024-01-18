import { ConfigProvider } from 'antd';
import { PropsWithChildren, memo, useState } from 'react';
import useSWR from 'swr';

import { DEFAULT_LANG } from '@/const/locale';
import { createI18nNext } from '@/locales/create';
import { useOnFinishHydrationGlobal } from '@/store/global';
import { isOnServerSide } from '@/utils/env';
import { switchLang } from '@/utils/switchLang';

interface LocaleLayoutProps extends PropsWithChildren {
  defaultLang?: string;
}

const Locale = memo<LocaleLayoutProps>(({ children, defaultLang }) => {
  const [lang, setLang] = useState(defaultLang ?? DEFAULT_LANG);
  const [i18n] = useState(createI18nNext(defaultLang));

  const { data: locale } = useSWR(
    lang,
    async () => {
      const localeName = lang?.includes('-') ? lang?.replace('-', '_') : 'en_US';
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
    if (!i18n.instance.isInitialized)
      // console.debug('locale', lang);
      i18n.init().then(() => {
        // console.debug('inited.');
      });
  }

  useOnFinishHydrationGlobal(
    (s) => {
      if (s.settings.language !== defaultLang) {
        switchLang(s.settings.language);
      } else {
        i18n.instance.on('languageChanged', setLang);
      }
    },
    [defaultLang],
  );

  return <ConfigProvider locale={locale}>{children}</ConfigProvider>;
});

export default Locale;
