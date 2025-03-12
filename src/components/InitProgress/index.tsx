import { Icon } from '@lobehub/ui';
import { Progress, Typography } from 'antd';
import { useTheme } from 'antd-style';
import { Loader2 } from 'lucide-react';
import { ReactNode, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

export interface StageObjectItem {
  icon?: ReactNode;
  text: string;
}
export type StageItem = string | StageObjectItem;

interface InitingProps {
  activeStage: number;
  stages: StageItem[];
}

const InitProgress = memo<InitingProps>(({ activeStage, stages }) => {
  const theme = useTheme();

  const outStage = stages[activeStage];
  const percent = (activeStage / (stages.length - 1)) * 100;

  const stage = typeof outStage === 'string' ? { text: outStage } : outStage;

  return (
    <Center gap={8} width={180}>
      <Progress
        percent={parseInt(percent.toFixed(0))}
        showInfo={false}
        strokeColor={theme.colorPrimary}
      />
      <Flexbox align={'center'} gap={4} horizontal>
        {stage?.icon ? stage?.icon : <Icon icon={Loader2} spin />}
        <Typography.Text type={'secondary'}>{stage?.text}</Typography.Text>
      </Flexbox>
    </Center>
  );
});

export default InitProgress;
