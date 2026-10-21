import { Segmented } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo } from 'react';

import { useEntityDemoStore } from './store';
import { type DemoState } from './types';

const styles = stylex.create({
  root: {
    alignItems: 'center',
    borderBlockStartColor: cssVar.colorBorderSecondary,
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: '1px',
    display: 'flex',
    flexShrink: 0,
    gap: '8px',
    justifyContent: 'flex-end',
    paddingBlock: '4px',
    paddingInline: '12px',
  },
  label: { color: cssVar.colorTextTertiary, fontSize: '12px' },
});

const OPTIONS: { label: string; value: DemoState }[] = [
  { label: '有数据', value: 'ready' },
  { label: '首次空', value: 'empty' },
  { label: '加载中', value: 'loading' },
  { label: '出错', value: 'error' },
];

/** Demo only: flips the page between its states so each can be reviewed without a backend. */
const DemoStateBar = memo(() => {
  const demoState = useEntityDemoStore((s) => s.demoState);
  const setDemoState = useEntityDemoStore((s) => s.setDemoState);

  return (
    <div data-demo-state={demoState} {...stylex.props(styles.root)}>
      <span {...stylex.props(styles.label)}>演示状态</span>
      <Segmented options={OPTIONS} size={'small'} value={demoState} onChange={setDemoState} />
    </div>
  );
});

DemoStateBar.displayName = 'DemoStateBar';

export default DemoStateBar;
