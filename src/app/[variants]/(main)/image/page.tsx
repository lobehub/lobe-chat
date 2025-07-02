import { Suspense } from 'react';
import { Flexbox } from 'react-layout-kit';

import TopicUrlSync from '@/app/[variants]/(main)/image/@topic/features/Topics/TopicUrlSync';
import ImageWorkspace from '@/app/[variants]/(main)/image/features/ImageWorkspace';
import StructuredData from '@/components/StructuredData';
import { BRANDING_NAME } from '@/const/branding';
import InitClientDB from '@/features/InitClientDB';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

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
      <InitClientDB bottom={100} />
      <TopicUrlSync />
      <Suspense fallback={<Flexbox flex={1} />}>
        <ImageWorkspace />
      </Suspense>
    </>
  );
};

AiImage.displayName = 'AiImage';

export default AiImage;
