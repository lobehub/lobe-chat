import { Button, Icon, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Package } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import EditCustomPlugin from '../EditCustomPlugin';

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    margin-block-start: ${token.marginLG}px;
  `,
  container: css`
    height: 80%;
    padding-block: ${token.paddingXL}px;
    padding-inline: ${token.paddingLG}px;
  `,
  description: css`
    max-width: 240px;
    line-height: 1.5;
    color: ${token.colorTextSecondary};
    text-align: center;
  `,
  iconWrapper: css`
    display: flex;
    align-items: center;
    justify-content: center;

    width: 64px;
    height: 64px;
    margin-block-end: ${token.marginMD}px;
    border-radius: 50%;

    background-color: ${token.colorPrimaryBg};
  `,
  title: css`
    margin-block-end: ${token.marginSM}px;

    font-size: ${token.fontSizeLG}px;
    font-weight: 500;
    color: ${token.colorText};
    text-align: center;
  `,
}));

interface Props {
  identifier: string;
}

const CustomPluginEmptyState = memo<Props>(({ identifier }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('plugin');

  const [showModal, setModal] = useState(false);

  return (
    <Center className={styles.container}>
      <Flexbox align="center">
        <div className={styles.iconWrapper}>
          <Icon icon={Package} size={32} />
        </div>
        <Text className={styles.title}>{t('detailModal.customPlugin.title')}</Text>
        <Text className={styles.description}>{t('detailModal.customPlugin.description')}</Text>
        <EditCustomPlugin identifier={identifier} onOpenChange={setModal} open={showModal}>
          <Button
            className={styles.button}
            onClick={() => {
              setModal(true);
            }}
            type="primary"
          >
            {t('detailModal.customPlugin.editBtn')}
          </Button>
        </EditCustomPlugin>
      </Flexbox>
    </Center>
  );
});

export default CustomPluginEmptyState;
