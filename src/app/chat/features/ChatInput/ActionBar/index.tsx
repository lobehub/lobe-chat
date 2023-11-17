import { ReactNode, memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ActionKeys, actionMap, getLeftActionList, getRightActionList } from './config';

const RenderActionList = ({ dataSource }: { dataSource: ActionKeys[] }) => (
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
  mobile?: boolean;
  padding?: number | string;
  rightAreaEndRender?: ReactNode;
  rightAreaStartRender?: ReactNode;
}

const ActionBar = memo<ActionBarProps>(
  ({
    padding = '0 16px',
    mobile,
    rightAreaStartRender,
    rightAreaEndRender,
    leftAreaStartRender,
    leftAreaEndRender,
  }) => {
    const leftActionList = useMemo(() => getLeftActionList(mobile), [mobile]);
    const rightActionList = useMemo(() => getRightActionList(mobile), [mobile]);

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
