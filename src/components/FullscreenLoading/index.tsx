import { Icon } from '@lobehub/ui';
import { Loader2 } from 'lucide-react';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

import { ProductLogo } from '@/components/Branding';

import BackgroundLines from './BackgroundLines';

const FullscreenLoading = memo<{ title?: string }>(({ title }) => {
  return (
    <BackgroundLines>
      <Center flex={1} gap={16} width={'100%'}>
        <ProductLogo size={48} type={'combine'} />
        <Center gap={12} horizontal style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.66 }}>
          <Icon icon={Loader2} size={{ fontSize: 16 }} spin />
          {title}
        </Center>
      </Center>
    </BackgroundLines>
  );
});

export default FullscreenLoading;
