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
  leftAreaEndRender?: ReactNode;
  leftAreaStartRender?: ReactNode;
  padding?: number | string;
  rightAreaEndRender?: ReactNode;
  rightAreaStartRender?: ReactNode;
  showToken?: boolean;
}

const ActionBar = memo<ActionBarProps>(
  ({
    padding = '0 16px',
    showToken = true,
    rightAreaStartRender,
    rightAreaEndRender,
    leftAreaStartRender,
    leftAreaEndRender,
  }) => {
    return (
      <Flexbox
        align={'center'}
        flex={'none'}
        horizontal
        justify={'space-between'}
        padding={padding}
      >
        <Flexbox align={'center'} flex={1} gap={4} horizontal>
          {leftAreaStartRender}
          <RenderActionList dataSource={leftActionList} />
          {leftAreaEndRender}
          {showToken && <RenderActionList dataSource={['token']} />}
        </Flexbox>
        <Flexbox align={'center'} flex={0} gap={4} horizontal justify={'flex-end'}>
          {rightAreaStartRender}
          <RenderActionList dataSource={rightActionList} />
          {rightAreaEndRender}
        </Flexbox>
      </Flexbox>
    );
  },
);

export default ActionBar;
