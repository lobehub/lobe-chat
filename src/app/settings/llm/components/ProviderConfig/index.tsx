import { Form, type ItemGroup } from '@lobehub/ui';
import type { FormItemProps } from '@lobehub/ui/es/Form/components/FormItem';
import { Form as AntForm, Switch } from 'antd';
import { debounce } from 'lodash-es';
import { ReactNode, memo } from 'react';

import { useSyncSettings } from '@/app/settings/hooks/useSyncSettings';
import { FORM_STYLE } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';
import { GlobalLLMProviderKey } from '@/types/settings';

interface ProviderConfigProps {
  canDeactivate?: boolean;
  configItems: FormItemProps[];
  provider: GlobalLLMProviderKey;
  title: ReactNode;
}

const ProviderConfig = memo<ProviderConfigProps>(
  ({ provider, canDeactivate = true, title, configItems }) => {
    const [form] = AntForm.useForm();
    const [toggleProviderEnabled, setSettings] = useGlobalStore((s) => [
      s.toggleProviderEnabled,
      s.setSettings,
    ]);

    const enabled = useGlobalStore(modelProviderSelectors.providerEnabled(provider));

    useSyncSettings(form);

    const model: ItemGroup = {
      children: configItems,
      defaultActive: canDeactivate ? enabled : undefined,
      extra: canDeactivate ? (
        <Switch
          onChange={(enabled) => {
            toggleProviderEnabled(provider, enabled);
          }}
          value={enabled}
        />
      ) : undefined,
      title,
    };

    return (
      <Form
        form={form}
        items={[model]}
        onValuesChange={debounce(setSettings, 100)}
        {...FORM_STYLE}
      />
    );
  },
);

export default ProviderConfig;
