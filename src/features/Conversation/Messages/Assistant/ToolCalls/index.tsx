import { Avatar, Highlighter, Icon } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { Loader2, LucideChevronDown, LucideChevronRight, LucideToyBrick } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/slices/message/selectors';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';

import { useStyles } from './style';

export interface InspectorProps {
  arguments?: string;
  identifier: string;
  messageId: string;
}

const CallItem = memo<InspectorProps>(
  ({ arguments: requestArgs = '{}', messageId, identifier }) => {
    const { t } = useTranslation('plugin');
    const { styles } = useStyles();
    const [open, setOpen] = useState(false);
    const loading = useChatStore(chatSelectors.isMessageGenerating(messageId));

    const pluginMeta = useToolStore(toolSelectors.getMetaById(identifier), isEqual);

    const pluginAvatar = pluginHelpers.getPluginAvatar(pluginMeta);

    const pluginTitle = pluginHelpers.getPluginTitle(pluginMeta) ?? t('unknownPlugin');

    const avatar = pluginAvatar ? (
      <Avatar avatar={pluginAvatar} size={32} />
    ) : (
      <Icon icon={LucideToyBrick} />
    );

    let params;
    try {
      params = JSON.stringify(JSON.parse(requestArgs), null, 2);
    } catch {
      params = requestArgs;
    }

    return (
      <Flexbox gap={8}>
        <Flexbox
          align={'center'}
          className={styles.container}
          distribution={'space-between'}
          gap={8}
          height={32}
          horizontal
          onClick={() => {
            setOpen(!open);
          }}
        >
          <Flexbox align={'center'} gap={8} horizontal>
            {loading ? (
              <Center height={30} width={24}>
                <Icon icon={Loader2} spin />
              </Center>
            ) : (
              avatar
            )}
            {pluginTitle}
          </Flexbox>
          <Icon icon={open ? LucideChevronDown : LucideChevronRight} />
        </Flexbox>
        {(open || loading) && <Highlighter language={'json'}>{params}</Highlighter>}
      </Flexbox>
    );
  },
);

export default CallItem;
