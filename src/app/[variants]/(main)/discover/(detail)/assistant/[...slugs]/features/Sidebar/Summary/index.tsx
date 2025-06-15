import { Collapse } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDetailContext } from '../../DetailProvider';

const Summary = memo(() => {
  const { description, summary } = useDetailContext();
  const { t } = useTranslation('discover');
  const theme = useTheme();
  return (
    <Collapse
      defaultActiveKey={['summary']}
      expandIconPosition={'end'}
      items={[
        {
          children: (
            <p
              style={{
                color: theme.colorTextSecondary,
                margin: 0,
              }}
            >
              {summary || description}
            </p>
          ),
          key: 'summary',
          label: t('assistants.details.summary.title'),
        },
      ]}
      size={'small'}
      variant={'borderless'}
    />
  );
});

export default Summary;
