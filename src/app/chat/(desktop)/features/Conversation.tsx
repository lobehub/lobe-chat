import { notification } from 'antd';
import { LightbulbIcon, TelescopeIcon } from 'lucide-react';
import { memo, useEffect } from 'react';

import RawConversation from '@/features/Conversation';

import ChatInput from './ChatInput';
import HotKeys from './HotKeys';

const Conversation = memo(() => {
  const [api, contextHolder] = notification.useNotification({
    duration: 0,
    maxCount: 1,
    placement: 'bottomRight',
  });

  useEffect(() => {
    api.open({
      description:
        '允许我们收集匿名的使用记录，帮助 LobeChat 做得更好。你可以在「设置」 -> 「数据隐私」 部分随时关闭。',
      icon: <TelescopeIcon />,
      message: '帮助 LobeChat 做得更好',
    });
  }, []);

  return (
    <>
      {contextHolder}
      <RawConversation chatInput={<ChatInput />} />
      <HotKeys />
    </>
  );
});

export default Conversation;
