'use client';

import { Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    width: 50px;
    height: 50px;
    background: ${token.colorFillSecondary};
    border: 1px solid ${token.colorBorder};
    border-radius: 6px;
    margin-bottom: 8px;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
}));

const NewTopicButton = memo(() => {
  const { t } = useTranslation('image');
  const { styles } = useStyles();

  return (
    <Tooltip placement="left" title={t('topic.createNew')}>
      <Center className={styles.button}>
        <Plus size={12} />
      </Center>
    </Tooltip>
  );
});

NewTopicButton.displayName = 'NewTopicButton';

export default NewTopicButton;
