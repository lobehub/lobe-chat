import { Loading3QuartersOutlined } from '@ant-design/icons';
import { Avatar, Highlighter, Icon } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { LucideChevronDown, LucideChevronUp, LucideToyBrick } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { pluginHelpers, useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';

import { useStyles } from './style';

export interface InspectorProps {
  arguments?: string;
  identifier: string;
  loading?: boolean;
}

const Inspector = memo<InspectorProps>(({ arguments: requestArgs = '{}', loading, identifier }) => {
  const { t } = useTranslation('plugin');
  const { styles } = useStyles();
  const [open, setOpen] = useState(false);

  const pluginMeta = useToolStore(toolSelectors.getMetaById(identifier), isEqual);

  const pluginAvatar = pluginHelpers.getPluginAvatar(pluginMeta);

  const pluginTitle = pluginHelpers.getPluginTitle(pluginMeta) ?? t('plugins.loading');

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
      <Flexbox align={'center'} distribution={'space-between'} gap={24} horizontal>
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
              <Loading3QuartersOutlined spin />
            </div>
          ) : (
            avatar
          )}
          {pluginTitle}
          <Icon icon={open ? LucideChevronUp : LucideChevronDown} />
        </Flexbox>
      </Flexbox>
      {open && <Highlighter language={'json'}>{params}</Highlighter>}
    </Flexbox>
  );
});

export default Inspector;
