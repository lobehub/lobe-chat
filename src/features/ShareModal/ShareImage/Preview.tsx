import { ModelTag } from '@lobehub/icons';
import { Avatar, Markdown } from '@lobehub/ui';
import { ChatHeaderTitle } from '@lobehub/ui/chat';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ProductLogo } from '@/components/Branding';
import { ChatItem } from '@/features/Conversation';
import PluginTag from '@/features/PluginTag';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';

import pkg from '../../../../package.json';
import { useContainerStyles } from '../style';
import { useStyles } from './style';
import { FieldType } from './type';

interface PreviewProps extends FieldType {
  messageIds: string[];
  systemRole?: string;
  title?: string;
}

const Preview = memo<PreviewProps>(
  ({ title, withSystemRole, withBackground, withFooter, messageIds, systemRole }) => {
    const [model, plugins] = useAgentStore((s) => [
      agentSelectors.currentAgentModel(s),
      agentSelectors.currentAgentPlugins(s),
    ]);
    const [isInbox, description, avatar, backgroundColor] = useSessionStore((s) => [
      sessionSelectors.isInboxSession(s),
      sessionMetaSelectors.currentAgentDescription(s),
      sessionMetaSelectors.currentAgentAvatar(s),
      sessionMetaSelectors.currentAgentBackgroundColor(s),
    ]);

    const { t } = useTranslation('chat');
    const { styles } = useStyles(withBackground);
    const { styles: containerStyles } = useContainerStyles();

    const displayTitle = isInbox ? t('inbox.title') : title;
    const displayDesc = isInbox ? t('inbox.desc') : description;

    return (
      <div className={containerStyles.preview}>
        <div className={withBackground ? styles.background : undefined} id={'preview'}>
          <Flexbox className={styles.container} gap={16}>
            <div className={styles.header}>
              <Flexbox align={'flex-start'} gap={12} horizontal>
                <Avatar avatar={avatar} background={backgroundColor} size={40} title={title} />
                <ChatHeaderTitle
                  desc={displayDesc}
                  tag={
                    <Flexbox gap={4} horizontal>
                      <ModelTag model={model} />
                      {plugins?.length > 0 && <PluginTag plugins={plugins} />}
                    </Flexbox>
                  }
                  title={displayTitle}
                />
              </Flexbox>
              {withSystemRole && systemRole && (
                <div className={styles.role}>
                  <Markdown variant={'chat'}>{systemRole}</Markdown>
                </div>
              )}
            </div>
            <Flexbox
              height={'100%'}
              style={{ paddingTop: 24, position: 'relative' }}
              width={'100%'}
            >
              {messageIds.map((id, index) => (
                <ChatItem id={id} index={index} key={id} />
              ))}
            </Flexbox>
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
