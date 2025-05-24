import { Form } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';

import ModelSelect from './ModelSelect';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow-y: auto;

    width: 260px;
    height: 100%;
    padding: 16px;
    border-inline-start: 1px solid ${token.colorBorderSecondary};
  `,
}));

const ConfigPanel = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('aiImage');

  return (
    <Flexbox className={styles.container} gap={16}>
      <Form
        items={[
          {
            children: [
              {
                children: <ModelSelect />,
                label: t('config.models'),
                layout: 'vertical',
              },
            ],
            title: t('config.title'),
          },
        ]}
        itemsType={'group'}
        variant={'borderless'}
        {...FORM_STYLE}
      />
    </Flexbox>
  );
});

export default ConfigPanel;
