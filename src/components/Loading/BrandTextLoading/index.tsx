import { Center } from 'react-layout-kit';

import { isCustomBranding } from '@/const/version';

import CircleLoading from '../CircleLoading';
import LobeChatText from './LobeChatText';

export default () => {
  if (isCustomBranding) return <CircleLoading />;

  return (
    <Center height={'100%'} width={'100%'}>
      <LobeChatText />
    </Center>
  );
};
