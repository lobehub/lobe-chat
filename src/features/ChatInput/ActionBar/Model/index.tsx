import { ModelIcon } from '@lobehub/icons';
import { ActionIcon, Tooltip } from '@lobehub/ui';
import { Popover } from 'antd';
import { createStyles } from 'antd-style';
import { Settings2Icon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import ModelSwitchPanel from '@/features/ModelSwitchPanel';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';

import ControlsForm from './ControlsForm';

const useStyles = createStyles(({ css, token, isDarkMode, cx }) => ({
  container: css`
    border-radius: 20px;
    background: ${isDarkMode ? token.colorFillSecondary : token.colorFillTertiary};
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

  const isModelHasExtendControls = useAiInfraStore(
    aiModelSelectors.isModelHasExtendControls(model, provider),
  );

  const isMobile = useIsMobile();

  // if (isLoading && isLoginWithAuth)
  //   return (
  //     <ActionIcon
  //       icon={Brain}
  //       placement={'bottom'}
  //       style={{
  //         cursor: 'not-allowed',
  //       }}
  //       title={t('ModelSwitch.title')}
  //     />
  //   );

  return (
    <Flexbox
      align={'center'}
      className={isModelHasExtendControls ? styles.container : ''}
      horizontal
    >
      <ModelSwitchPanel>
        <Center
          className={cx(styles.model, isModelHasExtendControls && styles.modelWithControl)}
          height={36}
          width={36}
        >
          <Tooltip placement={'bottom'} title={[provider, model].join(' / ')}>
            <div className={styles.icon}>
              <ModelIcon model={model} size={22} />
            </div>
          </Tooltip>
        </Center>
      </ModelSwitchPanel>

      {isModelHasExtendControls && (
        <Flexbox style={{ marginInlineStart: -4 }}>
          <Popover
            arrow={false}
            content={<ControlsForm />}
            open
            styles={{
              body: {
                minWidth: isMobile ? undefined : 200,
                width: isMobile ? '100vw' : undefined,
              },
            }}
          >
            <ActionIcon
              icon={Settings2Icon}
              placement={'bottom'}
              style={{ borderRadius: 20 }}
              title={t('extendControls.title')}
            />
          </Popover>
        </Flexbox>
      )}
    </Flexbox>
  );
});

ModelSwitch.displayName = 'ModelSwitch';

export default ModelSwitch;
