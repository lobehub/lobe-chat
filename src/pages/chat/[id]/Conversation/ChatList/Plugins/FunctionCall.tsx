import { LoadingOutlined } from '@ant-design/icons';
import { Avatar, Highlighter, Icon } from '@lobehub/ui';
import { LucideChevronDown, LucideChevronUp, LucideToyBrick } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { PluginsMap } from '@/plugins';
import { OpenAIFunctionCall } from '@/types/chatMessage';

import { useStyles } from './style';

export interface FunctionCallProps {
  function_call?: OpenAIFunctionCall;
  loading?: boolean;
}

const FunctionCall = memo<FunctionCallProps>(({ function_call, loading }) => {
  const { t } = useTranslation('plugin');
  const { styles } = useStyles();
  const [open, setOpen] = useState(false);

  const plugin = PluginsMap[function_call?.name || ''];

  const avatar = plugin?.avatar ? (
    <Avatar avatar={plugin?.avatar} size={32} />
  ) : (
    <Icon icon={LucideToyBrick} />
  );

  const args = JSON.stringify(JSON.parse(function_call?.arguments || '{}'), null, 2);

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
        {t(`plugins.${function_call?.name}` as any, { ns: 'plugin' })}
        {loading ? `（${t('loading.plugin')}）` : null}
        <Icon icon={open ? LucideChevronUp : LucideChevronDown} />
      </Flexbox>
      {open && <Highlighter language={'json'}>{args}</Highlighter>}
    </Flexbox>
  );
});

export default FunctionCall;
