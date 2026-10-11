import type { BuiltinStreamingProps } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui';
import { useTranslation } from 'react-i18next';

import { getInteractiveUIPreview, INTERACTIVE_UI_LIMITS } from '../../schema';
import type { RenderUIParams } from '../../types';
import { SandboxPreview } from '../Render/Widget';

export const StreamingUI = ({ args }: BuiltinStreamingProps<Partial<RenderUIParams>>) => {
  const { t } = useTranslation('plugin');
  const title =
    typeof args?.title === 'string'
      ? args.title.slice(0, INTERACTIVE_UI_LIMITS.title)
      : t('builtins.lobe-interactive-ui.apiName.renderUI');
  return (
    <Flexbox gap={8}>
      <strong>{title}</strong>
      <span role="status">{t('builtins.lobe-interactive-ui.generating')}</span>
      <SandboxPreview source={getInteractiveUIPreview(args)} title={title} />
    </Flexbox>
  );
};
