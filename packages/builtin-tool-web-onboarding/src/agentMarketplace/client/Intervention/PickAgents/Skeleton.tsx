import * as stylex from '@stylexjs/stylex';
import { memo } from 'react';

import { sx } from '@/styles/sx';

import { styles } from './style';

const TABBAR_ITEMS = 6;
const CARD_ITEMS = 6;

const PickAgentsSkeleton = memo(() => (
  <div {...stylex.props(styles.container)}>
    <div {...stylex.props(styles.tabBar)}>
      {Array.from({ length: TABBAR_ITEMS }).map((_, i) => (
        <div {...stylex.props(styles.skeletonTabBarItem)} key={i} />
      ))}
    </div>
    <div {...stylex.props(styles.content)}>
      <div {...stylex.props(styles.grid)}>
        {Array.from({ length: CARD_ITEMS }).map((_, i) => (
          <div {...stylex.props(styles.skeletonCard)} key={i}>
            <div {...stylex.props(styles.cardHeader)}>
              <div {...stylex.props(styles.skeletonAvatar)} />
              <div {...sx([styles.skeletonLine], undefined, { flex: 1 })} />
            </div>
            <div {...sx([styles.skeletonLine], undefined, { width: '90%' })} />
            <div {...sx([styles.skeletonLine], undefined, { width: '75%' })} />
          </div>
        ))}
      </div>
    </div>
  </div>
));

PickAgentsSkeleton.displayName = 'PickAgentsSkeleton';

export default PickAgentsSkeleton;
