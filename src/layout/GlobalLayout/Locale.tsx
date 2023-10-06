import { ConfigProvider } from 'antd';
import Zh_CN from 'antd/locale/zh_CN';
import { PropsWithChildren, memo, useState } from 'react';

import { createI18nNext } from '@/locales/create';
import { isOnServerSide } from '@/utils/env';

interface LocaleLayoutProps extends PropsWithChildren {
  lang?: string;
}

const InnerLocale = memo<LocaleLayoutProps>(({ children, lang }) => {
  const [i18n] = useState(createI18nNext(lang));

  // if run on server side, init i18n instance everytime
  if (isOnServerSide) {
    i18n.init();
  } else {
    // if on browser side, init i18n instance only once
    if (!i18n.instance.isInitialized)
      // console.log('locale', lang);
      i18n.init().then(() => {
        // console.log('inited.');
      });
  }

  return <ConfigProvider locale={Zh_CN}>{children}</ConfigProvider>;
});

// const Locale = memo<LocaleLayoutProps>((props) => (
//   <Suspense fallback={<Loading />}>
//     <InnerLocale {...props} />
//   </Suspense>
// ));

export default InnerLocale;
