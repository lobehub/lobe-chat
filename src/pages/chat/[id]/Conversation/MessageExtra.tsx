import { Avatar, Icon, Tooltip } from '@lobehub/ui';
import { Tag } from 'antd';
import { createStyles } from 'antd-style';
import { LucideToyBrick } from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import pluginList from '@/plugins';
import { agentSelectors, useSessionStore } from '@/store/session';
import { ChatMessage } from '@/types/chatMessage';

const useStyles = createStyles(({ css }) => ({
  container: css`
    margin-top: 8px;
  `,
  plugin: css`
    display: flex;
    gap: 4px;
    align-items: center;
    width: fit-content;
  `,
}));

const MessageExtra = ({ role, extra, function_call }: ChatMessage): ReactNode => {
  const { styles } = useStyles();

  const { t } = useTranslation();
  const [model] = useSessionStore((s) => [agentSelectors.currentAgentModel(s)], shallow);

  const plugin = pluginList.find((p) => p.name === function_call?.name);
  const funcTag = (
    <Tooltip title={function_call?.arguments}>
      <Tag bordered={false} className={styles.plugin} style={{ borderRadius: 6 }}>
        {plugin?.avatar ? (
          <Avatar avatar={plugin?.avatar} size={18} />
        ) : (
          <Icon icon={LucideToyBrick} />
        )}
        {t(`plugins.${function_call?.name}` as any, { ns: 'plugin' })}
      </Tag>
    </Tooltip>
  );

  const modelTag = (
    <div>
      <Tag bordered={false} style={{ borderRadius: 6 }}>
        {extra?.fromModel}
      </Tag>
    </div>
  );

  // 1. 存在 fromModel
  // 2. 且当前的 model 和 fromModel 不一致时
  const hasModelTag = extra?.fromModel && model !== extra?.fromModel;

  const hasFuncTag = !!function_call;

  switch (role) {
    case 'user':
    case 'system': {
      return;
    }
    case 'assistant': {
      // 1. 只有 ai 的 message
      // 2. 且存在 fromModel
      // 3. 且当前的 model 和 fromModel 不一致时
      if (!(hasModelTag || hasFuncTag)) return;

      return (
        <Flexbox className={styles.container} horizontal>
          {hasFuncTag && funcTag}
          {hasModelTag && modelTag}
        </Flexbox>
      );
    }
    case 'function': {
      return <Flexbox className={styles.container}>{funcTag}</Flexbox>;
    }
  }
};

export default MessageExtra;
