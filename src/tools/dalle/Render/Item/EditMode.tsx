import { Button, Select, TextArea } from '@lobehub/ui';
import { Radio } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DallEImageItem } from '@/types/tool/dalle';

interface EditModeProps extends DallEImageItem {
  setEdit: (edit: boolean) => void;
}

const EditMode = memo<EditModeProps>(({ prompt, setEdit, style, size, quality }) => {
  const { t } = useTranslation('tool');

  return (
    <Flexbox gap={16}>
      <TextArea style={{ minHeight: 120 }} value={prompt} variant={'filled'} />
      <Flexbox horizontal justify={'space-between'}>
        风格
        <Radio.Group
          defaultValue={style}
          options={[
            { label: 'vivid', value: 'vivid' },
            { label: 'natural', value: 'natural' },
          ]}
        />
      </Flexbox>
      <Flexbox horizontal justify={'space-between'}>
        质量
        <Radio.Group
          defaultValue={quality}
          options={[
            { label: 'standard', value: 'standard' },
            { label: 'hd', value: 'hd' },
          ]}
        />
      </Flexbox>
      <Flexbox horizontal justify={'space-between'}>
        尺寸
        <Select
          defaultValue={size}
          options={[
            { label: '1792x1024', value: '1792x1024' },
            { label: '1024x1024', value: '1024x1024' },
            { label: '1024x1792', value: '1024x1792' },
          ]}
          size={'small'}
        />
      </Flexbox>

      <Flexbox direction={'horizontal-reverse'} gap={12}>
        <Button type={'primary'}>{t('dalle.generate')}</Button>
        <Button
          onClick={() => {
            setEdit(false);
          }}
        >
          {t('cancel', { ns: 'common' })}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});

export default EditMode;
