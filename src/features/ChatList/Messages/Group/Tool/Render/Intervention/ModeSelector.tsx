import { Button, Dropdown, Icon, type MenuProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronDown, Hand, ListChecks, Zap } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { toolInterventionSelectors } from '@/store/user/selectors';

import { ApprovalMode } from './index';

const useStyles = createStyles(({ css, token }) => ({
  icon: css`
    border: 1px solid ${token.colorFillTertiary};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgElevated};
  `,
  modeButton: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
  `,
  modeDesc: css`
    margin-block-start: 2px;
    font-size: 12px;
    line-height: 1.4;
    color: ${token.colorTextDescription};
  `,
  modeItem: css`
    min-width: 160px;
  `,
  modeLabel: css`
    font-size: ${token.fontSize}px;
    font-weight: 500;
    line-height: 1.4;
    color: ${token.colorText};
  `,
}));

const ModeSelector = memo(() => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const approvalMode = useUserStore(toolInterventionSelectors.approvalMode);
  const updateHumanIntervention = useUserStore((s) => s.updateHumanIntervention);

  const modeLabels = useMemo(
    () => ({
      'allow-list': t('tool.intervention.mode.allowList'),
      'auto-run': t('tool.intervention.mode.autoRun'),
      'manual': t('tool.intervention.mode.manual'),
    }),
    [t],
  );

  const handleModeChange = useCallback(
    async (mode: ApprovalMode) => {
      await updateHumanIntervention({ approvalMode: mode });
    },
    [updateHumanIntervention],
  );

  const menuItems = useMemo<MenuProps['items']>(
    () => [
      {
        icon: (
          <Center className={styles.icon} height={32} width={32}>
            <Icon icon={Zap} />
          </Center>
        ),
        key: 'auto-run',
        label: (
          <div className={styles.modeItem}>
            <div className={styles.modeLabel}>{modeLabels['auto-run']}</div>
            <div className={styles.modeDesc}>{t('tool.intervention.mode.autoRunDesc')}</div>
          </div>
        ),
        onClick: () => handleModeChange('auto-run'),
      },
      {
        icon: (
          <Center className={styles.icon} height={32} width={32}>
            <Icon icon={ListChecks} />
          </Center>
        ),
        key: 'allow-list',
        label: (
          <div className={styles.modeItem}>
            <div className={styles.modeLabel}>{modeLabels['allow-list']}</div>
            <div className={styles.modeDesc}>{t('tool.intervention.mode.allowListDesc')}</div>
          </div>
        ),
        onClick: () => handleModeChange('allow-list'),
      },
      {
        icon: (
          <Center className={styles.icon} height={32} width={32}>
            <Icon icon={Hand} />
          </Center>
        ),
        key: 'manual',
        label: (
          <div className={styles.modeItem}>
            <div className={styles.modeLabel}>{modeLabels.manual}</div>
            <div className={styles.modeDesc}>{t('tool.intervention.mode.manualDesc')}</div>
          </div>
        ),
        onClick: () => handleModeChange('manual'),
      },
    ],
    [modeLabels, handleModeChange, styles, t],
  );

  return (
    <Dropdown
      // @ts-expect-error activeKey 没在 Dropdown key 里很奇怪
      menu={{ activeKey: approvalMode, items: menuItems }}
      placement="bottomLeft"
    >
      <Button
        className={styles.modeButton}
        color={'default'}
        icon={ChevronDown}
        iconPosition="end"
        size="small"
        variant={'text'}
      >
        {modeLabels[approvalMode]}
      </Button>
    </Dropdown>
  );
});

export default ModeSelector;
