import { ModelIcon } from '@lobehub/icons-rn';
import { Cell, ModelInfoTags } from '@lobehub/ui-rn';
import { AIChatModelCard } from 'model-bank';
import { memo } from 'react';

import ScrollableTitle from '@/components/ScrollableTitle';

interface ModelItemRenderProps extends AIChatModelCard {
  active?: boolean;
  onPress?: () => void;
  showInfoTag?: boolean;
}

/**
 * 模型项渲染组件
 * 显示模型图标、名称和能力标签，对齐Web端实现
 */
const ModelItemRender = memo<ModelItemRenderProps>(
  ({ onPress, active, showInfoTag = true, ...model }) => {
    return (
      <Cell
        active={active}
        extra={showInfoTag && <ModelInfoTags {...model} {...model.abilities} />}
        icon={<ModelIcon model={model.id} size={24} />}
        iconSize={24}
        onPress={onPress}
        pressEffect
        showArrow={false}
        title={<ScrollableTitle text={model.displayName || model.id} />}
      />
    );
  },
);

ModelItemRender.displayName = 'ModelItemRender';

export default ModelItemRender;
