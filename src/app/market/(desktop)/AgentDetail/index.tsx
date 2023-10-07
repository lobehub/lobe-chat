import { memo } from 'react';

import Mobile from '@/app/market/components/AgentDetail/Mobile';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { useIsMobile } from '@/hooks/useIsMobile';

import { AgentDetailContent } from '../../components/AgentDetail';
import Desktop from './Desktop';

const AgentDetail = memo(() => (
  <ResponsiveLayout Desktop={Desktop} Mobile={Mobile} isMobile={useIsMobile}>
    <AgentDetailContent />
  </ResponsiveLayout>
));

export default AgentDetail;
