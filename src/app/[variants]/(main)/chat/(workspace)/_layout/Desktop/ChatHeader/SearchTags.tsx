import { Icon, Tag } from '@lobehub/ui';
import { Globe } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const SearchTag = memo(() => {
  const { t } = useTranslation('chat');

  return (
    <Tag>
      {<Icon icon={Globe} />}
      <div>{t('search.title')}</div>
    </Tag>
  );
});

export default SearchTag;
