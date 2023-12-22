import { Loading3QuartersOutlined } from '@ant-design/icons';
import { LobePluginType } from '@lobehub/chat-plugin-sdk';
import { ActionIcon, Avatar, Highlighter, Icon } from '@lobehub/ui';
import { Tabs } from 'antd';
import isEqual from 'fast-deep-equal';
import {
  LucideBug,
  LucideBugOff,
  LucideChevronDown,
  LucideChevronUp,
  LucideToyBrick,
} from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { pluginHelpers, useToolStore } from '@/store/tool';
import { pluginSelectors, toolSelectors } from '@/store/tool/selectors';

import PluginResult from './PluginResultJSON';
import Settings from './Settings';
import { useStyles } from './style';

export interface InspectorProps {
  arguments?: string;
  command?: any;
  content: string;
  id?: string;
  loading?: boolean;
  setShow?: (showRender: boolean) => void;
  showRender?: boolean;
  type?: LobePluginType;
}

const Inspector = memo<InspectorProps>(
  ({
    arguments: requestArgs = '{}',
    command,
    showRender,
    loading,
    setShow,
    content,
    id = 'unknown',
    // type,
  }) => {
    const { t } = useTranslation('plugin');
    const { styles } = useStyles();
    const [open, setOpen] = useState(false);

    const pluginMeta = useToolStore(toolSelectors.getMetaById(id), isEqual);

    const showRightAction = useToolStore(pluginSelectors.isPluginHasUI(id));
    const pluginAvatar = pluginHelpers.getPluginAvatar(pluginMeta);

    const pluginTitle = pluginHelpers.getPluginTitle(pluginMeta) ?? t('plugins.loading');

    const avatar = pluginAvatar ? (
      <Avatar avatar={pluginAvatar} size={32} />
    ) : (
      <Icon icon={LucideToyBrick} />
    );

    const args = JSON.stringify(command, null, 2);
    const params = JSON.stringify(JSON.parse(requestArgs), null, 2);

    return (
      <Flexbox gap={8}>
        <Flexbox align={'center'} distribution={'space-between'} gap={24} horizontal>
          <Flexbox
            align={'center'}
            className={styles.container}
            gap={8}
            horizontal
            onClick={() => {
              setShow?.(!showRender);
            }}
          >
            {loading ? (
              <div>
                <Loading3QuartersOutlined spin />
              </div>
            ) : (
              avatar
            )}
            {pluginTitle}
            {showRightAction && <Icon icon={showRender ? LucideChevronUp : LucideChevronDown} />}
          </Flexbox>
          {
            <Flexbox horizontal>
              {/*{type === 'standalone' && <ActionIcon icon={LucideOrbit} />}*/}
              <ActionIcon
                icon={open ? LucideBugOff : LucideBug}
                onClick={() => {
                  setOpen(!open);
                }}
                title={t(open ? 'debug.off' : 'debug.on')}
              />
              <Settings id={id} />
            </Flexbox>
          }
        </Flexbox>
        {open && (
          <Tabs
            items={[
              {
                children: <Highlighter language={'json'}>{args}</Highlighter>,
                key: 'function_call',
                label: t('debug.function_call'),
              },
              {
                children: <Highlighter language={'json'}>{params}</Highlighter>,
                key: 'arguments',
                label: t('debug.arguments'),
              },
              {
                children: <PluginResult content={content} />,
                key: 'response',
                label: t('debug.response'),
              },
            ]}
            style={{ maxWidth: 800 }}
          />
        )}
      </Flexbox>
    );
  },
);

export default Inspector;
