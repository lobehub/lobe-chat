import { LoadingOutlined } from '@ant-design/icons';
import { Avatar, Highlighter, Icon } from '@lobehub/ui';
import { Tabs } from 'antd';
import { LucideChevronDown, LucideChevronUp, LucideToyBrick } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { pluginSelectors, usePluginStore } from '@/store/plugin';

import PluginResult from './PluginResultRender';
import { useStyles } from './style';

export interface FunctionCallProps {
  arguments?: string;
  command?: any;
  content: string;
  id?: string;
  loading?: boolean;
}

const FunctionCall = memo<FunctionCallProps>(
  ({ arguments: requestArgs = '{}', command, loading, content, id = 'unknown' }) => {
    const { t } = useTranslation('plugin');
    const { styles } = useStyles();
    const [open, setOpen] = useState(false);

    const item = usePluginStore(pluginSelectors.getPluginMetaById(id));

    const avatar = item?.meta.avatar ? (
      <Avatar avatar={item?.meta.avatar} size={32} />
    ) : (
      <Icon icon={LucideToyBrick} />
    );

    const args = JSON.stringify(command, null, 2);
    const params = JSON.stringify(JSON.parse(requestArgs), null, 2);

    return (
      <Flexbox gap={8}>
        <Flexbox
          align={'center'}
          className={styles.container}
          gap={8}
          horizontal
          onClick={() => {
            setOpen(!open);
          }}
        >
          {loading ? (
            <div>
              <LoadingOutlined />
            </div>
          ) : (
            avatar
          )}
          {t(`plugins.${id}` as any, { ns: 'plugin' })}
          <Icon icon={open ? LucideChevronUp : LucideChevronDown} />
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

export default FunctionCall;
