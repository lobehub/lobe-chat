import { ActionIcon, DraggablePanel } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { LucideEdit, LucideX } from 'lucide-react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { useChatStore } from '@/store/session';

import ReadMode from './ReadMode';

const useStyles = createStyles(({ css, token }) => ({
  drawer: css`
    background: ${token.colorBgContainer};
  `,
  header: css`
    border-bottom: 1px solid ${token.colorBorder};
  `,
}));

const Config = () => {
  const { styles } = useStyles();
  const [showAgentSettings, toggleConfig] = useChatStore(
    (s) => [s.showAgentSettings, s.toggleConfig],
    shallow,
  );

  return (
    <DraggablePanel
      className={styles.drawer}
      expand={showAgentSettings}
      expandable={false}
      minWidth={400}
      mode={'float'}
      pin
      placement={'right'}
      resize={{ left: false }}
    >
      <Flexbox
        align={'center'}
        className={styles.header}
        distribution={'space-between'}
        horizontal
        padding={16}
      >
        <Flexbox>会话设置</Flexbox>
        <Flexbox horizontal>
          <ActionIcon icon={LucideEdit} title={'编辑'} />
          <ActionIcon
            icon={LucideX}
            onClick={() => {
              toggleConfig(false);
            }}
            title={'关闭'}
          />
        </Flexbox>
      </Flexbox>
      <ReadMode />
    </DraggablePanel>
  );
};

export default Config;
