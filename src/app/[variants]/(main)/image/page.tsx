import { Suspense } from 'react';

import StructuredData from '@/components/StructuredData';
import { BRANDING_NAME } from '@/const/branding';
import InitClientDB from '@/features/InitClientDB';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import ImageWorkspace from './features/ImageWorkspace';
import SkeletonList from './features/ImageWorkspace/SkeletonList';

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
      <Suspense fallback={<SkeletonList />}>
        <ImageWorkspace />
      </Suspense>
    </>
  );
};

AiImage.displayName = 'AiImage';

export default AiImage;
