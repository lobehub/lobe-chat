import { Collapse } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useDetailContext } from '../../DetailProvider';
import TagList from '../../TagList';

const Overview = memo(() => {
  const { t } = useTranslation('discover');
  const { description, tags } = useDetailContext();

  return (
    <Flexbox gap={16}>
      <Collapse
        defaultActiveKey={['summary']}
        expandIconPosition={'end'}
        items={[
          {
            children: description,
            key: 'summary',
            label: t('plugins.details.summary.title'),
          },
        ]}
        variant={'outlined'}
      />
      {tags && <TagList tags={tags} />}
    </Flexbox>
  );
});

export default Overview;
