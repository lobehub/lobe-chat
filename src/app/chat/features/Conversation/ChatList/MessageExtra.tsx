import { SiOpenai } from '@icons-pack/react-simple-icons';
import { Tag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ReactNode } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
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

const MessageExtra = ({
  role,
  extra,
  // name,
  function_call,
}: ChatMessage): ReactNode => {
  const { styles } = useStyles();

  // const { t } = useTranslation();
  const [model] = useSessionStore((s) => [agentSelectors.currentAgentModel(s)]);

  // const plugin = PluginsMap[name || ''];

  // const funcTag = (
  //   <Tag bordered={false} className={styles.plugin} style={{ borderRadius: 6 }}>
  //     {plugin?.avatar ? (
  //       <Avatar avatar={plugin?.avatar} size={18} />
  //     ) : (
  //       <Icon icon={LucideToyBrick} />
  //     )}
  //     {t(`plugins.${name}` as any, { ns: 'plugin' })}
  //   </Tag>
  // );

  const modelTag = (
    <div>
      <Tag icon={<SiOpenai size={'1em'} />}>{extra?.fromModel as string}</Tag>
    </div>
  );

  // 1. 存在 fromModel
  // 2. 且当前的 model 和 fromModel 不一致时
  const hasModelTag = extra?.fromModel && model !== extra?.fromModel;

  const hasFuncTag = !!function_call;

  switch (role) {
    case 'user':
    case 'function':
    case 'system': {
      return;
    }
    case 'assistant': {
      // 1. 只有 ai 的 message
      // 2. 且存在 fromModel
      // 3. 且当前的 model 和 fromModel 不一致时
      if (!(hasModelTag || hasFuncTag)) return;

      return (
        hasModelTag && (
          <Flexbox className={styles.container} horizontal>
            {modelTag}
          </Flexbox>
        )
      );
    }
    // case 'function': {
    //   return <Flexbox className={styles.container}>{funcTag}</Flexbox>;
    // }
  }
};

export default MessageExtra;
