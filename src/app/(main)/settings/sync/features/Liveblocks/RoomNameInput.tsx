import { ActionIcon } from '@lobehub/ui';
import { Input, InputProps } from 'antd';
import { FormInstance } from 'antd/es/form/hooks/useForm';
import { LucideDices } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { generateRandomRoomName } from '@/utils/generateRandomRoomName';

interface RoomNameInputProps extends Omit<InputProps, 'form'> {
  form: FormInstance;
}

const RoomNameInput = memo<RoomNameInputProps>(({ form, ...rest }) => {
  const { t } = useTranslation('setting');
  const [loading, setLoading] = useState(false);

  return (
    <Input
      placeholder={t('sync.liveblocks.roomName.placeholder')}
      suffix={
        <ActionIcon
          active
          icon={LucideDices}
          loading={loading}
          onClick={async () => {
            setLoading(true);
            const name = await generateRandomRoomName();
            setLoading(false);
            form.setFieldValue(['sync', 'liveblocks', 'roomName'], name);
            form.setFieldValue(['sync', 'liveblocks', 'enabled'], false);
            form.submit();
          }}
          size={'small'}
          style={{
            marginRight: -4,
          }}
          title={t('sync.liveblocks.roomName.shuffle')}
        />
      }
      {...rest}
    />
  );
});

export default RoomNameInput;
