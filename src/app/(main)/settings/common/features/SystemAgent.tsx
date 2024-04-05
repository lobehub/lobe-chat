import { Form, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm, Select, SelectProps } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { MessageSquareMore } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelItemRender, ProviderItemRender } from '@/components/ModelSelect';
import { FORM_STYLE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors, settingsSelectors } from '@/store/user/selectors';
import { ModelProviderCard } from '@/types/llm';

import { useSyncSettings } from '../../hooks/useSyncSettings';

const SYSTEM_AGENT_SETTING_KEY = 'systemAgent';

type SettingItemGroup = ItemGroup;

const useStyles = createStyles(({ css, prefixCls }) => ({
  select: css`
    .${prefixCls}-select-dropdown .${prefixCls}-select-item-option-grouped {
      padding-inline-start: 12px;
    }
  `,
}));
interface ModelOption {
  label: any;
  provider: string;
  value: string;
}

const SystemAgent = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();

  const settings = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [setTranslationSystemAgent] = useUserStore((s) => [s.setTranslationSystemAgent]);

  const select = useUserStore(modelProviderSelectors.modelProviderListForModelSelect, isEqual);

  const { styles } = useStyles();

  const enabledList = select.filter((s) => s.enabled);

  const translationOptions = useMemo<SelectProps['options']>(() => {
    const getChatModels = (provider: ModelProviderCard) =>
      provider.chatModels
        .filter((c) => c.enabled)
        .map((model) => ({
          label: <ModelItemRender {...model} />,
          provider: provider.id,
          value: model.id,
        }));

    if (enabledList.length === 1) {
      const provider = enabledList[0];

      return getChatModels(provider);
    }

    return enabledList.map((provider) => ({
      label: <ProviderItemRender provider={provider.id} />,
      options: getChatModels(provider),
    }));
  }, [enabledList]);

  const systemAgentSettings: SettingItemGroup = {
    children: [
      {
        children: (
          <Select
            className={styles.select}
            onChange={(model, option) =>
              setTranslationSystemAgent((option as unknown as ModelOption).provider, model)
            }
            options={translationOptions}
            popupMatchSelectWidth={false}
          />
        ),
        desc: t('systemAgent.translation.modelDesc'),
        label: t('systemAgent.translation.label'),
        name: [SYSTEM_AGENT_SETTING_KEY, 'translation', 'model'],
      },
    ],
    icon: MessageSquareMore,
    title: t('systemAgent.title'),
  };

  useSyncSettings(form);

  return (
    <Form form={form} initialValues={settings} items={[systemAgentSettings]} {...FORM_STYLE} />
  );
});

export default SystemAgent;
