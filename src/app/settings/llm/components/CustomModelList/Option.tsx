import { Typography } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ModelIcon from '@/components/ModelIcon';
import { ModelInfoTags } from '@/components/ModelSelect';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';

export const OptionRender = memo<{ displayName: string; id: string }>(({ displayName, id: id }) => {
  const model = useGlobalStore((s) => modelProviderSelectors.modelCardById(id)(s), isEqual);

  return (
    <Flexbox align={'center'} gap={8} horizontal>
      <ModelIcon model={id} size={32} />
      <Flexbox>
        <Flexbox align={'center'} gap={8} horizontal>
          {displayName}
          <ModelInfoTags directionReverse placement={'top'} {...model!} />
        </Flexbox>
        <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
          {id}
        </Typography.Text>
      </Flexbox>
    </Flexbox>
  );
});
