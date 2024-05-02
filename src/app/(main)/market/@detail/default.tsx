import { isMobileDevice } from '@/utils/responsive';

import AgentDetailContent from './features/AgentDetailContent';

const Detail = () => {
  const mobile = isMobileDevice();
  return <AgentDetailContent mobile={mobile} />;
};

Detail.displayName = 'AgentDetail';

export default Detail;
