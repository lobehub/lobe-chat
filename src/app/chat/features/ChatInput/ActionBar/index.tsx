import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { actionMap, leftActionList, rightActionList } from './config';

const RenderActionList = ({ dataSource }: { dataSource: string[] }) => (
  <>
    {dataSource.map((key) => {
      const Render = actionMap[key];
      return <Render key={key} />;
    })}
  </>
);

export interface ActionBarProps {
  rightAreaEndRender?: ReactNode;
  rightAreaStartRender?: ReactNode;
}

const ActionBar = memo<ActionBarProps>(({ rightAreaStartRender, rightAreaEndRender }) => {
  return (
    <Flexbox align={'center'} flex={'none'} horizontal justify={'space-between'} padding={'0 16px'}>
      <Flexbox align={'center'} flex={1} gap={4} horizontal>
        <RenderActionList dataSource={leftActionList} />
      </Flexbox>
      <Flexbox align={'center'} flex={0} gap={4} horizontal justify={'flex-end'}>
        {rightAreaStartRender}
        <RenderActionList dataSource={rightActionList} />
        {rightAreaEndRender}
      </Flexbox>
    </Flexbox>
  );
});

export default ActionBar;
