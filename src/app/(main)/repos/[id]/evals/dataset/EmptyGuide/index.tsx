'use client';

import { Button } from 'antd';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { useCreateDatasetModal } from '../CreateDataset';

interface EmptyGuideProps {
  knowledgeBaseId: string;
}

const EmptyGuide = memo<EmptyGuideProps>(({ knowledgeBaseId }) => {
  const modal = useCreateDatasetModal();
  return (
    <Center gap={24} height={'100%'} width={'100%'}>
      <div>当前数据集为空，请创建一个数据集。</div>
      <Flexbox gap={8} horizontal>
        <Button
          onClick={() => {
            modal.open({ knowledgeBaseId });
          }}
          type={'primary'}
        >
          创建数据集
        </Button>
        {/*<Button>创建空数据集</Button>*/}
      </Flexbox>
    </Center>
  );
});
export default EmptyGuide;
