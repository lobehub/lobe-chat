import { cssVar, Flexbox, Icon, Tag, Text } from '@lobehub/ui';
import { PanelsTopLeftIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { oneLineEllipsis } from '@/styles';

import { useCanvasVersion } from './useCanvasVersion';

const Title = memo(() => {
  const { t } = useTranslation('portal');
  const { data } = useCanvasVersion();

  return (
    <Flexbox horizontal align={'center'} gap={8} style={{ minWidth: 0 }}>
      <Icon color={cssVar.colorTextSecondary} icon={PanelsTopLeftIcon} size={16} />
      <Text className={oneLineEllipsis} style={{ flex: '0 1 auto', fontSize: 14, minWidth: 0 }}>
        {data?.title ?? t('canvas.title')}
      </Text>
      {data && <Tag size={'small'}>{`v${data.version}`}</Tag>}
    </Flexbox>
  );
});

Title.displayName = 'CanvasPortalTitle';

export default Title;
