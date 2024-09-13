import { Icon } from '@lobehub/ui';
import { Loader2 } from 'lucide-react';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { ProductLogo } from '@/components/Branding';

const FullscreenLoading = memo<{ title?: string }>(({ title }) => {
  return (
    <Flexbox height={'100%'} style={{ userSelect: 'none' }} width={'100%'}>
      <Center flex={1} gap={12} width={'100%'}>
        <ProductLogo size={48} type={'combine'} />
        <Center
          gap={16}
          horizontal
          style={{ fontSize: '16px', lineHeight: '1.5', marginTop: '2%' }}
        >
          <Icon icon={Loader2} spin style={{ fontSize: '16px' }} />
          {title}
        </Center>
      </Center>
    </Flexbox>
  );
});

export default FullscreenLoading;
