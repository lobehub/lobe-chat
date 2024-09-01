import { TabsNav } from '@lobehub/ui';
import { Flexbox } from 'react-layout-kit';

import Dataset from './Dataset';

interface Params {
  id: string;
}

type Props = { params: Params };

export default async ({ params }: Props) => {
  const knowledgeBaseId = params.id;

  return (
    <Flexbox gap={24} height={'100%'} padding={24} style={{ paddingTop: 0 }}>
      <TabsNav
        items={[
          {
            key: 'dataset',
            label: '数据集',
          },
        ]}
      />
      <Dataset knowledgeBaseId={knowledgeBaseId} />
    </Flexbox>
  );
};
