import { Divider } from 'antd';
import { Suspense } from 'react';
import { Flexbox } from 'react-layout-kit';

import ConfigPanel from '@/app/[variants]/(main)/image/features/ConfigPanel';
import ImageWorkspace from '@/app/[variants]/(main)/image/features/ImageWorkspace';
import Topics from '@/app/[variants]/(main)/image/features/Topics';
import StructuredData from '@/components/StructuredData';
import { BRANDING_NAME } from '@/const/branding';
import InitClientDB from '@/features/InitClientDB';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import TopicUrlSync from './features/Topics/TopicUrlSync';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('metadata', locale);
  return metadataModule.generate({
    description: t('image.description', { appName: BRANDING_NAME }),
    title: t('image.title'),
    url: '/image',
  });
};

const AiImage = async (props: DynamicLayoutProps) => {
  const { locale } = await RouteVariants.getVariantsFromProps(props);
  const { t } = await translation('metadata', locale);
  const ld = ldModule.generate({
    description: t('image.description', { appName: BRANDING_NAME }),
    title: t('image.title'),
    url: '/image',
  });

  return (
    <>
      <StructuredData ld={ld} />
      <Flexbox
        align="flex-start"
        horizontal
        style={{
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <InitClientDB bottom={100} />
        <TopicUrlSync />

        {/* 左侧配置面板 */}
        <ConfigPanel />

        <Divider style={{ height: '100%', margin: 0 }} type="vertical" />

        {/* 中间内容区域 */}
        <Suspense fallback={<Flexbox flex={1} />}>
          <ImageWorkspace />
        </Suspense>

        <Divider style={{ height: '100%', margin: 0 }} type="vertical" />

        {/* 右侧Topics列表 */}
        <Topics />
      </Flexbox>
    </>
  );
};

AiImage.displayName = 'AiImage';

export default AiImage;
