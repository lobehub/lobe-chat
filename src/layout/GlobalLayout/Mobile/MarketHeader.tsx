import { Logo, MobileNavBar } from '@lobehub/ui';
import { memo } from 'react';

import ShareAgentButton from '@/app/market/features/ShareAgentButton';

const MarketHeader = memo(() => {
  return <MobileNavBar center={<Logo type={'text'} />} right={<ShareAgentButton mobile />} />;
});

export default MarketHeader;
