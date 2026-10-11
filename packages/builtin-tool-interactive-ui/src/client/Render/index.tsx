import type { BuiltinRenderProps } from '@lobechat/types';
import { Alert } from '@lobehub/ui/base-ui';
import { useTranslation } from 'react-i18next';

import { RenderUIParamsSchema } from '../../schema';
import type { RenderUIState } from '../../types';
import { InteractiveWidget } from './Widget';

export const RenderUI = ({
  args,
  content,
  messageId,
  pluginState,
  readOnly,
}: BuiltinRenderProps<unknown, RenderUIState>) => {
  const { t } = useTranslation('plugin');
  const parsed = RenderUIParamsSchema.safeParse(args);
  if (!parsed.success || pluginState?.status !== 'ready' || pluginState.version !== 1) {
    return (
      <Alert
        description={typeof content === 'string' ? content.slice(0, 2_000) : undefined}
        title={t('builtins.lobe-interactive-ui.invalid')}
        type="warning"
      />
    );
  }
  return (
    <InteractiveWidget
      key={messageId}
      messageId={messageId}
      readOnly={!!readOnly}
      source={parsed.data}
    />
  );
};
