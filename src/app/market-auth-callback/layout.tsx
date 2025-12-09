import { cookies, headers } from 'next/headers';
import { ReactNode } from 'react';
import { isRtlLang } from 'rtl-detect';
import { NuqsAdapter } from 'nuqs/adapters/next/app';


import { DEFAULT_LANG, LOBE_LOCALE_COOKIE } from '@/const/locale';
import GlobalLayout from '@/layout/GlobalProvider';
import { Locales } from '@/locales/resources';
import { parseBrowserLanguage } from '@/utils/locale';

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = async ({ children }: RootLayoutProps) => {
  // 获取 locale：优先级为 cookie > 浏览器语言 > 默认语言
  const cookieStore = await cookies();
  const headersList = await headers();
  const cookieLocale = cookieStore.get(LOBE_LOCALE_COOKIE)?.value as Locales | undefined;
  const browserLanguage = parseBrowserLanguage(headersList, DEFAULT_LANG);
  const locale = (cookieLocale || browserLanguage || DEFAULT_LANG) as Locales;

  const direction = isRtlLang(locale) ? 'rtl' : 'ltr';

  return (
    <html dir={direction} lang={locale} suppressHydrationWarning>
      <body>
        <NuqsAdapter>
          <GlobalLayout appearance="auto" isMobile={false} locale={locale}>
            {children}
          </GlobalLayout>
        </NuqsAdapter>
      </body>
    </html>
  );
};

export default RootLayout;
