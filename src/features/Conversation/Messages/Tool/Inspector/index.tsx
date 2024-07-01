import { Loading3QuartersOutlined } from '@ant-design/icons';
import { ActionIcon, Avatar, Highlighter, Icon, Tag } from '@lobehub/ui';
import { Tabs } from 'antd';
import isEqual from 'fast-deep-equal';
import {
  InspectionPanel,
  LucideBug,
  LucideBugOff,
  LucideChevronDown,
  LucideChevronRight,
  LucideToyBrick,
} from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/slices/portal/selectors';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { ChatPluginPayload } from '@/types/message';

import PluginResult from './PluginResultJSON';
import Settings from './Settings';
import { useStyles } from './style';

export interface InspectorProps {
  arguments?: string;
  content: string;
  id: string;
  identifier?: string;
  loading?: boolean;
  payload?: ChatPluginPayload;
  setShow?: (showRender: boolean) => void;
  showRender?: boolean;
}

const Inspector = memo<InspectorProps>(
  ({
    arguments: requestArgs = '{}',
    payload,
    showRender,
    loading,
    setShow,
    content,
    identifier = 'unknown',
    id,
  }) => {
    const { t } = useTranslation('plugin');
    const { styles } = useStyles();
    const [open, setOpen] = useState(false);
    const [isMessageToolUIOpen, openToolUI, toggleInspector] = useChatStore((s) => [
      chatPortalSelectors.isMessageToolUIOpen(id)(s),
      s.openToolUI,
      s.toggleDock,
    ]);

    const pluginMeta = useToolStore(toolSelectors.getMetaById(identifier), isEqual);

    const showRightAction = useToolStore(toolSelectors.isToolHasUI(identifier));
    const pluginAvatar = pluginHelpers.getPluginAvatar(pluginMeta);

    const pluginTitle = pluginHelpers.getPluginTitle(pluginMeta) ?? t('unknownPlugin');

    const avatar = pluginAvatar ? (
      <Avatar alt={pluginTitle} avatar={pluginAvatar} size={32} />
    ) : (
      <Icon icon={LucideToyBrick} />
    );

    let args, params;
    try {
      args = JSON.stringify(payload, null, 2);
      params = JSON.stringify(JSON.parse(requestArgs), null, 2);
    } catch {
      args = '';
      params = '';
    }

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
            <Flexbox align={'center'} gap={8} horizontal>
              {loading ? (
                <div>
                  <Loading3QuartersOutlined spin />
                </div>
              ) : (
                avatar
              )}
              <div>{pluginTitle}</div>
              <Tag>{payload?.apiName}</Tag>
            </Flexbox>
            {showRightAction && <Icon icon={showRender ? LucideChevronDown : LucideChevronRight} />}
          </Flexbox>

          <Flexbox horizontal>
            {showRightAction && false && (
              <ActionIcon
                icon={InspectionPanel}
                onClick={() => {
                  if (!isMessageToolUIOpen) openToolUI(id, identifier);
                  else {
                    toggleInspector(false);
                  }
                }}
                size={DESKTOP_HEADER_ICON_SIZE}
                title={'inspector'}
              />
            )}
            <ActionIcon
              icon={open ? LucideBugOff : LucideBug}
              onClick={() => {
                setOpen(!open);
              }}
              title={t(open ? 'debug.off' : 'debug.on')}
            />
            <Settings id={identifier} />
          </Flexbox>
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
            style={{ display: 'grid', maxWidth: 800, minWidth: 400 }}
          />
        )}
      </Flexbox>
    );
  },
);

export default Inspector;
