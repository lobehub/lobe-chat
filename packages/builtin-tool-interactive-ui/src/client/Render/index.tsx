import type { BuiltinRenderProps } from '@lobechat/types';
import { Alert } from '@lobehub/ui/base-ui';
import { useTranslation } from 'react-i18next';

import { NativeUIDocumentSchema } from '../../native/schema';
import { LegacyRenderUIParamsSchema } from '../../schema';
import type { RenderUIState } from '../../types';
import { NativeWidget } from './NativeWidget';
import { InteractiveWidget } from './Widget';

export const RenderUI = ({
  args,
  content,
  messageId,
  pluginState,
  readOnly,
}: BuiltinRenderProps<unknown, RenderUIState>) => {
  const { t } = useTranslation('plugin');
  // Version 1 remains readable for historical artifacts, but is no longer
  // advertised or accepted by the tool's execution path.
  const native = NativeUIDocumentSchema.safeParse(args);
  if (native.success && pluginState?.status === 'ready' && pluginState.version === 2) {
    return (
      <NativeWidget
        document={native.data}
        key={`${messageId}:native`}
        messageId={messageId}
        readOnly={!!readOnly}
        saved={pluginState.values}
      />
    );
  }
  const parsed = LegacyRenderUIParamsSchema.safeParse(args);
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
