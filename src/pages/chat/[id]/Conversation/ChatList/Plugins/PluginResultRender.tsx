import { Avatar, Highlighter, Icon } from '@lobehub/ui';
import { LucideChevronDown, LucideChevronUp } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useStyles } from './style';

export interface FunctionMessageProps {
  content: string;
}

const PluginResult = memo<FunctionMessageProps>(({ content }) => {
  const { t } = useTranslation('plugin');
  const { styles } = useStyles();

  const [open, setOpen] = useState(false);

  let data;

  try {
    data = JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    data = content;
  }

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
        <Avatar avatar={'💾'} size={24} />
        {t('responseData')}
        <Icon icon={open ? LucideChevronUp : LucideChevronDown} />
      </Flexbox>
      {open && (
        <Highlighter language={'json'} style={{ maxHeight: 200 }}>
          {data}
        </Highlighter>
      )}
    </Flexbox>
  );
});

export default PluginResult;
