import { ModelIcon } from '@lobehub/icons';
import { ActionIcon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Settings2Icon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import ModelSwitchPanel from '@/features/ModelSwitchPanel';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';

import ActionPopover from '../../components/ActionPopover';
import ControlsForm from './ControlsForm';

const useStyles = createStyles(({ css, token, cx }) => ({
  container: css`
    border-radius: 20px;
    background: ${token.colorFillTertiary};
  `,
  icon: cx(
    'model-switch',
    css`
      transition: scale 400ms cubic-bezier(0.215, 0.61, 0.355, 1);
    `,
  ),
  model: css`
    cursor: pointer;
    border-radius: 8px;

    :hover {
      background: ${token.colorFillSecondary};
    }

    :active {
      .model-switch {
        scale: 0.8;
      }
    }
  `,
  modelWithControl: css`
    border-radius: 20px;

    :hover {
      background: ${token.colorFillTertiary};
    }
  `,

  video: css`
    overflow: hidden;
    border-radius: 8px;
  `,
}));

const ModelSwitch = memo(() => {
  const { t } = useTranslation('chat');
  const { styles, cx } = useStyles();

  const [model, provider] = useAgentStore((s) => [
    agentSelectors.currentAgentModel(s),
    agentSelectors.currentAgentModelProvider(s),
  ]);

  const isModelHasExtendParams = useAiInfraStore(
    aiModelSelectors.isModelHasExtendParams(model, provider),
  );

  return (
    <Flexbox align={'center'} className={isModelHasExtendParams ? styles.container : ''} horizontal>
      <ModelSwitchPanel>
        <Center
          className={cx(styles.model, isModelHasExtendParams && styles.modelWithControl)}
          height={36}
          width={36}
        >
          <div className={styles.icon}>
            <ModelIcon model={model} size={22} />
          </div>
        </Center>
      </ModelSwitchPanel>

      {isModelHasExtendParams && (
        <ActionPopover content={<ControlsForm />} minWidth={350} placement={'topLeft'}>
          <ActionIcon
            icon={Settings2Icon}
            style={{ borderRadius: 20, marginInlineStart: -4 }}
            title={t('extendParams.title')}
            tooltipProps={{
              placement: 'bottom',
            }}
          />
        </ActionPopover>
      )}
    </Flexbox>
  );
});

ModelSwitch.displayName = 'ModelSwitch';

export default ModelSwitch;
