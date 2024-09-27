import { ModelTag } from '@lobehub/icons';
import { Avatar, ChatHeaderTitle, Markdown } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import pkg from '@/../package.json';
import { ProductLogo } from '@/components/Branding';
import ChatList from '@/features/Conversation/components/ChatList';
import { useInboxAgentMeta } from '@/hooks/useInboxAgentMeta';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

import PluginTag from '../PluginTag';
import { useStyles } from './style';
import { FieldType } from './type';

const Preview = memo<FieldType & { title?: string }>(
  ({ withSystemRole, withBackground, withFooter }) => {
    const [model, plugins, systemRole] = useAgentStore((s) => [
      agentSelectors.currentAgentModel(s),
      agentSelectors.currentAgentPlugins(s),
      agentSelectors.currentAgentSystemRole(s),
    ]);
    const [backgroundColor] = useSessionStore((s) => [
      sessionMetaSelectors.currentAgentBackgroundColor(s),
    ]);

    const { styles } = useStyles(withBackground);

    const { title, description, avatar } = useInboxAgentMeta();

    return (
      <div className={styles.preview}>
        <div className={withBackground ? styles.background : undefined} id={'preview'}>
          <Flexbox className={styles.container} gap={16}>
            <div className={styles.header}>
              <Flexbox align={'flex-start'} gap={12} horizontal>
                <Avatar avatar={avatar} background={backgroundColor} size={40} title={title} />
                <ChatHeaderTitle
                  desc={description}
                  tag={
                    <>
                      <ModelTag model={model} />
                      {plugins?.length > 0 && <PluginTag plugins={plugins} />}
                    </>
                  }
                  title={title}
                />
              </Flexbox>
              {withSystemRole && systemRole && (
                <div className={styles.role}>
                  <Markdown variant={'chat'}>{systemRole}</Markdown>
                </div>
              )}
            </div>
            <ChatList />
            {withFooter ? (
              <Flexbox align={'center'} className={styles.footer} gap={4}>
                <ProductLogo type={'combine'} />
                <div className={styles.url}>{pkg.homepage}</div>
              </Flexbox>
            ) : (
              <div />
            )}
          </Flexbox>
        </div>
      </div>
    );
  },
);

export default Preview;
