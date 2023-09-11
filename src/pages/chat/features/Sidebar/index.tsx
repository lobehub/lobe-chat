import { SearchBar } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Desktop from './Desktop';
import Mobile from './Mobile';
import { Topic } from './Topic';

const SideBar = memo(() => {
  const { mobile } = useResponsive();

  const Render = mobile ? Mobile : Desktop;

  const { t } = useTranslation('common');

  return (
    <Render>
      <Flexbox height={'100%'} style={{ overflow: 'hidden' }}>
        <Flexbox padding={16}>
          <SearchBar
            placeholder={t('topic.searchPlaceholder')}
            spotlight={!mobile}
            type={mobile ? 'block' : 'ghost'}
          />
        </Flexbox>
        <Flexbox gap={16} paddingInline={16} style={{ overflowY: 'auto', position: 'relative' }}>
          <Topic />
        </Flexbox>
      </Flexbox>
    </Render>
  );
});

export default SideBar;
