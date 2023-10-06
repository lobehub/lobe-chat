import { ConfigProvider } from 'antd';
import Zh_CN from 'antd/locale/zh_CN';
import { PropsWithChildren, memo, useState } from 'react';

import { createI18nNext } from '@/locales/create';


interface LocaleLayoutProps extends PropsWithChildren {
  lang?: string;
}

const InnerLocale = memo<LocaleLayoutProps>(({ children, lang }) => {
  const [i18n] = useState(createI18nNext(lang));

  console.log('outLocale', lang);
  i18n.then(console.log);

  return <ConfigProvider locale={Zh_CN}>{children}</ConfigProvider>;
});

// const Locale = memo<LocaleLayoutProps>((props) => (
//   <Suspense fallback={<Loading />}>
//     <InnerLocale {...props} />
//   </Suspense>
// ));

export default InnerLocale;
