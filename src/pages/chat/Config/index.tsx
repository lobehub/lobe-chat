import { createStyles } from 'antd-style';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { useChatStore } from '@/store/session';
import { ActionIcon, DraggablePanel } from '@lobehub/ui';
import { LucideEdit, LucideX } from 'lucide-react';
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
  const [showAgentSettings, toggleConfig] = useChatStore((s) => [s.showAgentSettings, s.toggleConfig], shallow);

  return (
    <DraggablePanel
      expandable={false}
      placement={'right'}
      mode={'float'}
      pin
      resize={{ left: false }}
      minWidth={400}
      expand={showAgentSettings}
      className={styles.drawer}
    >
      <Flexbox padding={16} horizontal align={'center'} distribution={'space-between'} className={styles.header}>
        <Flexbox>会话设置</Flexbox>
        <Flexbox horizontal>
          <ActionIcon icon={LucideEdit} title={'编辑'} />
          <ActionIcon
            icon={LucideX}
            title={'关闭'}
            onClick={() => {
              toggleConfig(false);
            }}
          />
        </Flexbox>
      </Flexbox>
      <ReadMode />
    </DraggablePanel>
  );
};

export default Config;
