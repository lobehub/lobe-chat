import { memo } from 'react';

import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';

import Select from '../../../components/AspectRatioSelect';

const AspectRatioSelect = memo(() => {
  const { value, setValue, enumValues } = useGenerationConfigParam('aspectRatio');

  // 如果模型支持 ratio 枚举值，则使用枚举值
  if (enumValues && enumValues.length > 0) {
    const options = enumValues.map((ratio) => ({
      label: ratio,
      value: ratio,
    }));

    return <Select onChange={setValue} options={options} style={{ width: '100%' }} value={value} />;
  }

  // 如果模型不支持 ratio 参数，返回 null（由外部处理是否显示）
  return null;
});

export default AspectRatioSelect;
