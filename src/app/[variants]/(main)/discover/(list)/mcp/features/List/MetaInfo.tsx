import { Icon } from '@lobehub/ui';
import { DownloadIcon, StarIcon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DiscoverMcpItem } from '@/types/discover';

interface MetaInfoProps {
  className?: string;
  installCount: DiscoverMcpItem['installCount'];
  stars?: number;
}

const MetaInfo = memo<MetaInfoProps>(({ stars, installCount, className }) => {
  return (
    <Flexbox align={'center'} className={className} gap={8} horizontal>
      {Boolean(installCount) && (
        <Flexbox align={'center'} gap={4} horizontal>
          <Icon icon={DownloadIcon} size={14} />
          {installCount}
        </Flexbox>
      )}
      {Boolean(stars) && (
        <Flexbox align={'center'} gap={4} horizontal>
          <Icon icon={StarIcon} size={14} />
          {stars}
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default MetaInfo;
