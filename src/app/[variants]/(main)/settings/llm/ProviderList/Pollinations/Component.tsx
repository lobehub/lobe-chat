import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ProviderConfig } from '@/app/[variants]/(main)/settings/llm/components/ProviderConfig';
import { ModelProvider } from '@/libs/agent-runtime';
import { AiProviderSourceEnum } from '@/types/aiProvider';

const Pollinations = memo(() => {
  const { t } = useTranslation('setting');

  return (
    <ProviderConfig
      avatar={
        <img
          alt="Pollinations.AI"
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjMDAwMDAwIi8+CjxwYXRoIGQ9Ik0zMC4wMDAxIDUwLjAwMDFDMzAuMDAwMSA0Mi4yNjgxIDM2LjI2ODEgMzYuMDAwMSA0NC4wMDAxIDM2LjAwMDFINTYuMDAwMUM2My43MzIxIDM2LjAwMDEgNzAuMDAwMSA0Mi4yNjgxIDcwLjAwMDEgNTAuMDAwMUM3MC4wMDAxIDU3LjczMjEgNjMuNzMyMSA2NC4wMDAxIDU2LjAwMDEgNjQuMDAwMUg0NC4wMDAxQzM2LjI2ODEgNjQuMDAwMSAzMC4wMDAxIDU3LjczMjEgMzAuMDAwMSA1MC4wMDAxWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTUwLjAwMDEgMzAuMDAwMUM1Ny43MzIxIDMwLjAwMDEgNjQuMDAwMSAzNi4yNjgxIDY0LjAwMDEgNDQuMDAwMVY1Ni4wMDAxQzY0LjAwMDEgNjMuNzMyMSA1Ny43MzIxIDcwLjAwMDEgNTAuMDAwMSA3MC4wMDAxQzQyLjI2ODEgNzAuMDAwMSAzNi4wMDAxIDYzLjczMjEgMzYuMDAwMSA1Ni4wMDAxVjQ0LjAwMDFDMzYuMDAwMSAzNi4yNjgxIDQyLjI2ODEgMzAuMDAwMSA1MC4wMDAxIDMwLjAwMDFaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K"
        />
      }
      config={{
        defaultShowBrowserRequest: false,
        disableBrowserRequest: false,
        modelEditable: true,
        proxyUrl: {
          placeholder: 'https://text.pollinations.ai/openai',
        },
        sdkType: 'openai',
        showApiKey: false,
        showChecker: true,
        showModelFetcher: true,
      }}
      defaultValue={{
        baseURL: 'https://text.pollinations.ai/openai',
        checkModel: 'openai',
        enabled: false,
        id: ModelProvider.Pollinations,
        name: 'Pollinations.AI',
        source: AiProviderSourceEnum.Builtin,
      }}
      description={t('llm.provider.pollinations.description')}
      homeUrl="https://pollinations.ai"
      modelsUrl="https://text.pollinations.ai/models"
      title="Pollinations.AI"
    />
  );
});

export default Pollinations;
