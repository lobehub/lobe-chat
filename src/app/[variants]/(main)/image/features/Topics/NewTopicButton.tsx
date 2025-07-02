'use client';

import { createStyles } from 'antd-style';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import TopicItemContainer from './TopicItemContainer';

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    border: 1px solid ${token.colorBorder};
  `,
}));

const NewTopicButton = memo(({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation('image');
  const { styles } = useStyles();

  return (
    <TopicItemContainer className={styles.button} onClick={onClick} tooltip={t('topic.createNew')}>
      <Center>
        <Plus size={12} />
      </Center>
    </TopicItemContainer>
  );
});

NewTopicButton.displayName = 'NewTopicButton';

export default NewTopicButton;
