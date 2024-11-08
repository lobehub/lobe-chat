
import { Icon } from '@lobehub/ui';
import { App, FloatButton, Spin } from 'antd';
import { DatabaseIcon, Loader2 } from 'lucide-react';
import { memo, useState } from 'react';

import { debugService } from '@/services/debug';

const DebugUI = memo(() => {
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  return (
    <>
      {loading && <Spin fullscreen />}
      <FloatButton
        icon={<Icon icon={loading ? Loader2 : DatabaseIcon} spin={loading} />}
        onClick={async () => {
          setLoading(true);

          const startTime = Date.now();

          await debugService.insertLargeDataToDB();

          const duration = Date.now() - startTime;

          setLoading(false);
          message.success(`插入成功，耗时：${(duration / 1000).toFixed(1)} s`);
        }}
        tooltip={'性能压测，插入100w数据'}
      />
    </>
  );
});

export default DebugUI;
