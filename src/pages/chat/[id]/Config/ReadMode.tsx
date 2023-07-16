import { Avatar } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { LucideBrain, LucideThermometer, WholeWord } from 'lucide-react';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { agentSelectors, sessionSelectors, useChatStore } from '@/store/session';

import { ConfigCell, ConfigCellGroup } from './ConfigCell';

const useStyles = createStyles(({ css, token }) => ({
  desc: css`
    color: ${token.colorText};
  `,
  model: css`
    color: ${token.colorTextTertiary};
  `,
  title: css`
    font-size: ${token.fontSizeHeading4}px;
    font-weight: bold;
  `,
}));

const ReadMode = memo(() => {
  const { styles } = useStyles();
  const session = useChatStore(sessionSelectors.currentSessionSafe, isEqual);
  const avatar = useChatStore(agentSelectors.currentAgentAvatar, shallow);
  const title = useChatStore(agentSelectors.currentAgentTitle, shallow);
  const model = useChatStore(agentSelectors.currentAgentModel, shallow);

  return (
    <Center gap={12} padding={'32px 16px'} style={{ marginTop: 8 }}>
      <Avatar avatar={avatar} size={100} />
      <Flexbox className={styles.title}>{title || '默认对话'}</Flexbox>
      <Flexbox className={styles.model}>{model}</Flexbox>
      <Flexbox className={styles.desc}>{session.meta.description}</Flexbox>

      <Flexbox flex={1} gap={12} width={'100%'}>
        <ConfigCell icon={LucideBrain} label={'提示词'} />

        <ConfigCellGroup
          items={[
            {
              icon: LucideThermometer,
              label: '温度',
              value: session.config.params.temperature,
            },
            {
              icon: WholeWord,
              label: '会话最大长度',
              value: session.config.params.max_tokens,
            },
          ]}
        />
      </Flexbox>
    </Center>
  );
});

export default ReadMode;
