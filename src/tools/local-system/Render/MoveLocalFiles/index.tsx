import { MoveLocalFilesParams } from '@lobechat/electron-client-ipc';
import { BuiltinRenderProps } from '@lobechat/types';
import { Text } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { VList } from 'virtua';

import MoveFileItem from './MoveFileItem';

const MoveLocalFiles = memo<BuiltinRenderProps<MoveLocalFilesParams>>(({ args }) => {
  const { items } = args;
  const { t } = useTranslation('tool');

  return (
    <Flexbox gap={8}>
      <Text type="secondary">{t('localFiles.moveFiles.itemsMoved', { count: items.length })}</Text>
      <Flexbox style={{ height: 200 }}>
        <VList data={items}>
          {(item) => <MoveFileItem newPath={item.newPath} oldPath={item.oldPath} />}
        </VList>
      </Flexbox>
    </Flexbox>
  );
});

export default MoveLocalFiles;
