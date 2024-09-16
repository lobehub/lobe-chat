import { ActionIcon } from '@lobehub/ui';
import { Typography } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';

const Header = () => {
  const [closeArtifact, artifactTitle] = useChatStore((s) => [
    s.closeArtifact,
    chatPortalSelectors.artifactTitle(s),
  ]);

  return (
    <Flexbox align={'center'} gap={4} horizontal>
      <ActionIcon icon={ArrowLeft} onClick={() => closeArtifact()} />
      <Typography.Text style={{ fontSize: 16 }} type={'secondary'}>
        {artifactTitle}
      </Typography.Text>
    </Flexbox>
  );
};

export default Header;
