import { ActionIcon, DraggablePanel, DraggablePanelContainer } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { LucideEdit, LucideX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Router from 'next/router';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { useSessionStore } from '@/store/session';

import ReadMode from './ReadMode';

const WIDTH = 280;

const useStyles = createStyles(({ css, token }) => ({
  drawer: css`
    background: ${token.colorBgLayout};
  `,
  header: css`
    border-bottom: 1px solid ${token.colorBorder};
  `,
}));

const Config = () => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();
  const [showAgentSettings, toggleConfig, id] = useSessionStore(
    (s) => [s.showAgentSettings, s.toggleConfig, s.activeId],
    shallow,
  );

  return (
    <DraggablePanel
      className={styles.drawer}
      expand={showAgentSettings}
      expandable={false}
      maxWidth={WIDTH}
      minWidth={WIDTH}
      mode={'float'}
      pin
      placement={'right'}
      resize={{ left: false }}
    >
      <DraggablePanelContainer style={{ flex: 'none', minWidth: WIDTH }}>
        <Flexbox
          align={'center'}
          className={styles.header}
          distribution={'space-between'}
          horizontal
          padding={12}
          paddingInline={16}
        >
          <Flexbox>{t('agentProfile')}</Flexbox>
          <Flexbox gap={4} horizontal>
            <ActionIcon
              icon={LucideEdit}
              onClick={() => {
                Router.push(`/chat/${id}/edit`);
              }}
              size={{ blockSize: 32, fontSize: 20 }}
              title={t('edit')}
            />
            <ActionIcon
              icon={LucideX}
              onClick={() => {
                toggleConfig(false);
              }}
              size={{ blockSize: 32, fontSize: 20 }}
              title={t('close')}
            />
          </Flexbox>
        </Flexbox>
        <ReadMode />
      </DraggablePanelContainer>
    </DraggablePanel>
  );
};

export default Config;
