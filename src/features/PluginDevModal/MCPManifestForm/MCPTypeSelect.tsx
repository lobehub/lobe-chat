import { Icon } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { CheckIcon, RouterIcon, TerminalIcon } from 'lucide-react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { isDesktop } from '@/const/version';

// Define styles using antd-style (moved from MCPManifestForm)
const useStyles = createStyles(({ token, css }) => ({
  active: css`
    border-color: ${token.colorPrimary};

    &:hover {
      border-color: ${token.colorPrimary};
    }
  `,
  cardDescription: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextDescription};
  `,
  cardTitle: css`
    font-weight: bold;
  `,
  checkIcon: css`
    position: absolute;
    inset-block-start: 12px;
    inset-inline-end: 12px;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 20px;
    height: 20px;
    border-radius: 50%;

    color: ${token.colorBgContainer};

    background-color: ${token.colorPrimary};
  `,
  container: css`
    cursor: pointer;

    position: relative;

    width: 100%;
    padding-block: 12px;
    padding-inline: 16px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusLG}px;

    background-color: ${token.colorBgContainer};

    transition:
      border-color 0.3s ${token.motionEaseInOut},
      box-shadow 0.3s ${token.motionEaseInOut};

    &:hover {
      border-color: ${token.colorPrimaryHover};
    }
  `,
  disabled: css`
    cursor: not-allowed;
    border-color: ${token.colorBorder};
    opacity: 0.5;
    background-color: ${token.colorBgContainerDisabled};

    &:hover {
      border-color: ${token.colorBorder};
    }
  `,
  featureIcon: css`
    color: ${token.colorTextSecondary};
  `,
  featureItem: css`
    display: flex;
    gap: 8px;
    align-items: center;
  `,
  featureText: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
  `,
}));

// Helper component for feature list items (moved from MCPManifestForm)
const FeatureItem = memo(({ children }: { children: React.ReactNode }) => {
  const { styles, theme } = useStyles();
  return (
    <div className={styles.featureItem}>
      <Center className={styles.featureIcon}>
        <CheckIcon color={theme.colorSuccess} size={16} />
      </Center>
      <div className={styles.featureText}>{children}</div>
    </div>
  );
});

interface MCPTypeSelectProps {
  onChange?: (value: string) => void;
  value?: string;
}

const MCPTypeSelect = ({ value, onChange }: MCPTypeSelectProps) => {
  const { t } = useTranslation('plugin');
  const { styles, cx } = useStyles();

  const handleSelect = (type: string) => {
    onChange?.(type);
  };

  const data = [
    {
      description: t('dev.mcp.type.httpShortDesc'),
      features: [t('dev.mcp.type.httpFeature1'), t('dev.mcp.type.httpFeature2')],
      icon: RouterIcon,
      label: 'Streamable HTTP',
      value: 'http',
    },
    {
      description: t('dev.mcp.type.stdioShortDesc'),
      features: [t('dev.mcp.type.stdioFeature1'), t('dev.mcp.type.stdioFeature2')],
      icon: TerminalIcon,
      label: 'STDIO',
      value: 'stdio',
    },
  ];

  return (
    <Flexbox gap={16} horizontal width={'100%'}>
      {data.map(({ label, description, features, value: itemValue, icon }) => {
        const isActive = value === itemValue;
        const disabled = itemValue === 'stdio' && !isDesktop;
        return (
          <Flexbox
            className={cx(styles.container, isActive && styles.active, disabled && styles.disabled)}
            gap={12}
            key={itemValue}
            onClick={disabled ? undefined : () => handleSelect(itemValue)}
            style={{ flex: 1 }} // Make cards take equal width
          >
            <Center className={styles.checkIcon} style={{ opacity: isActive ? 1 : 0 }}>
              <CheckIcon size={14} />
            </Center>

            <Flexbox align={'flex-start'} gap={12} horizontal>
              <Center height={22}>
                <Icon icon={icon} style={{ fontSize: 16 }} />
              </Center>
              <Flexbox>
                <div className={styles.cardTitle}>{label}</div>
                <div className={styles.cardDescription}>{description}</div>
              </Flexbox>
            </Flexbox>
            <Flexbox gap={8}>
              {features.map((feature) => (
                <FeatureItem key={feature}>{feature}</FeatureItem>
              ))}
            </Flexbox>
            {disabled && (
              <Typography.Text style={{ fontSize: 12, marginTop: 8 }} type="warning">
                {t('dev.mcp.type.stdioNotAvailable')}
              </Typography.Text>
            )}
          </Flexbox>
        );
      })}
      {/* Streamable HTTP Card */}
    </Flexbox>
  );
};

export default MCPTypeSelect;
