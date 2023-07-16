import { TextArea } from '@lobehub/ui';
import { Collapse, InputNumber, Segmented, Slider } from 'antd';
import isEqual from 'fast-deep-equal';
import { useTranslation } from 'next-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { agentSelectors, useSessionStore } from '@/store/session';
import { LanguageModel } from '@/types/llm';

import { FormItem } from './FormItem';
import { useStyles } from './style';

const AgentConfig = () => {
  const { t } = useTranslation('common');

  const { styles, theme } = useStyles();

  const config = useSessionStore(agentSelectors.currentAgentConfigSafe, isEqual);

  const [updateAgentConfig] = useSessionStore((s) => [s.updateAgentConfig], shallow);

  return (
    <>
      <Flexbox
        align={'center'}
        distribution={'space-between'}
        horizontal
        paddingBlock={12}
        style={{
          borderBottom: `1px solid ${theme.colorBorder}`,
        }}
      >
        <Flexbox className={styles.profile}> {t('modelConfig')}</Flexbox>
      </Flexbox>
      <Flexbox gap={24}>
        <FormItem label={t('agentModel')}>
          <Segmented
            block
            onChange={(value) => {
              updateAgentConfig({ model: value as LanguageModel });
            }}
            options={Object.values(LanguageModel).map((value) => ({
              label: t(value),
              value,
            }))}
            size={'large'}
            value={config.model}
          />
        </FormItem>
        <FormItem label={t('agentPrompt')}>
          <Flexbox gap={16}>
            <TextArea
              onChange={(e) => {
                updateAgentConfig({ systemRole: e.target.value });
              }}
              placeholder={t('agentPromptPlaceholder')}
              style={{ minHeight: 160 }}
              type={'block'}
              value={config.systemRole}
            />
          </Flexbox>
        </FormItem>
        <Collapse
          activeKey={['advanceSettings']}
          bordered={false}
          className={styles.title}
          expandIconPosition={'end'}
          items={[
            {
              children: (
                <Flexbox paddingBlock={16}>
                  <FormItem label={t('modelTemperature')}>
                    <Flexbox gap={16} horizontal>
                      <Slider
                        max={1}
                        min={0}
                        onChange={(value) => {
                          updateAgentConfig({ params: { temperature: value } });
                        }}
                        step={0.1}
                        style={{ flex: 1 }}
                        value={Number(config.params.temperature)}
                      />
                      <InputNumber
                        max={1}
                        min={0}
                        onChange={(value) => {
                          if (value) updateAgentConfig({ params: { temperature: value } });
                        }}
                        value={config.params.temperature}
                      />
                    </Flexbox>
                  </FormItem>
                </Flexbox>
              ),
              key: 'advanceSettings',
              label: t('advanceSettings'),
            },
          ]}
        />
      </Flexbox>
    </>
  );
};

export default AgentConfig;
