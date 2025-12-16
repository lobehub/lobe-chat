import { createStyles } from 'antd-style';
import { CheckCircle, HeartHandshake, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect } from 'react';

import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

import { TitleSection } from '../common/TitleSection';
import { customTheme, useLayoutStyles } from '../styles';

// Screen4 特有的样式
const useScreen4Styles = createStyles(({ token, css }) => ({
  // 卡片描述
  cardDescription: css`
    font-size: ${token.fontSize}px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
    text-align: center;
    margin-bottom: 24px;
  `,

  // 卡片头部
  cardHeader: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-bottom: 8px;
  `,

  // 卡片标题
  cardTitle: css`
    font-family: ${token.fontFamily};
    font-size: 20px;
    font-weight: 700;
    color: ${token.colorTextBase};
    margin: 0;
    text-align: center;
  `,

  // 选中标记
  checkIcon: css`
    position: absolute;
    top: 20px;
    right: 20px;
    color: ${customTheme.token.colorGreen};
    opacity: 0;
    transition: opacity 0.3s ease;
  `,

  // 内容区容器
  contentContainer: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    max-width: 900px;
    margin: 0 auto;
  `,

  // 特性列表
  featureList: css`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    li {
      position: relative;
      padding-left: 20px;
      font-size: ${token.fontSize}px;
      color: rgba(255, 255, 255, 1);
      line-height: 1.5;

      &:last-child {
        margin-bottom: 0;
      }

      &:before {
        content: '•';
        position: absolute;
        left: 0;
        color: rgba(255, 255, 255, 0.4);
      }
    }
  `,

  // 底部说明文字
  footerNote: css`
    font-size: ${token.fontSize}px;
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
    margin-top: 24px;
  `,

  // 数据选项卡片
  optionCard: css`
    flex: 1;
    max-width: 400px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: ${token.borderRadiusLG}px;
    padding: 32px 28px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-4px);
    }

    &.selected {
      background: rgba(255, 255, 255, 0.08);
      border-color: ${customTheme.token.colorGreen};

      .check-icon {
        opacity: 1;
      }
    }
  `,

  // 选项卡容器
  optionsContainer: css`
    display: flex;
    gap: 16px;
    width: 100%;
    justify-content: center;
  `,
}));

type DataMode = 'share' | 'privacy';

interface Screen4Props {
  onScreenConfigChange?: (config: {
    background?: {
      animate?: boolean;
      animationDelay?: number;
      animationDuration?: number;
    };
    navigation: {
      animate?: boolean;
      animationDelay?: number;
      animationDuration?: number;
      nextButtonText?: string;
      prevButtonText?: string;
      showNextButton?: boolean;
      showPrevButton?: boolean;
    };
  }) => void;
}

export const Screen4 = ({ onScreenConfigChange }: Screen4Props) => {
  const telemetryEnabled = useUserStore(userGeneralSettingsSelectors.telemetry);
  const updateGeneralConfig = useUserStore((s) => s.updateGeneralConfig);
  const selectedMode: DataMode = telemetryEnabled ? 'share' : 'privacy';

  // 屏幕特定的配置
  const CONFIG = {
    screenConfig: {
      navigation: {
        animate: false,
        nextButtonText: 'Continue',
        showNextButton: true,
        showPrevButton: true,
      },
    },
  };

  const setMode = useCallback(
    (mode: DataMode) => {
      const nextTelemetry = mode === 'share';
      if (telemetryEnabled === nextTelemetry) return;

      void updateGeneralConfig({ telemetry: nextTelemetry });
    },
    [telemetryEnabled, updateGeneralConfig],
  );

  // 通知父组件屏幕配置
  useEffect(() => {
    if (onScreenConfigChange) {
      onScreenConfigChange(CONFIG.screenConfig);
    }
  }, [onScreenConfigChange]);

  const { styles: layoutStyles } = useLayoutStyles();
  const { styles: screen4Styles } = useScreen4Styles();

  return (
    <div className={layoutStyles.fullScreen}>
      {/* 内容层 */}
      <div className={layoutStyles.centered}>
        {/* 标题部分 */}
        <TitleSection
          animated={true}
          badge="Privacy"
          description="Choose how you want to use LobeHub."
          title="Data Preferences"
        />

        {/* 选项卡区域 */}
        <div className={screen4Styles.contentContainer}>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={screen4Styles.optionsContainer}
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* 共享数据选项 */}
            <div
              className={`${screen4Styles.optionCard} ${selectedMode === 'share' ? 'selected' : ''}`}
              onClick={() => setMode('share')}
            >
              <CheckCircle className={`${screen4Styles.checkIcon} check-icon`} size={24} />

              <div className={screen4Styles.cardHeader}>
                <HeartHandshake color={customTheme.token.colorGreen} size={48} />
                <h3 className={screen4Styles.cardTitle}>Help Improve LobeHub</h3>
              </div>

              <p className={screen4Styles.cardDescription}>
                To make LobeHub better, this option lets us collect usage data. This includes:
              </p>

              <ul className={screen4Styles.featureList}>
                <li>Performance metrics</li>
                <li>Model usage patterns</li>
                <li>Feature interactions</li>
              </ul>
            </div>

            {/* 隐私模式选项 */}
            <div
              className={`${screen4Styles.optionCard} ${selectedMode === 'privacy' ? 'selected' : ''}`}
              onClick={() => setMode('privacy')}
            >
              <CheckCircle className={`${screen4Styles.checkIcon} check-icon`} size={24} />

              <div className={screen4Styles.cardHeader}>
                <Shield color={customTheme.token.colorBlue} size={48} />
                <h3 className={screen4Styles.cardTitle}>Privacy Mode</h3>
              </div>

              <p className={screen4Styles.cardDescription}>
                If you enable Privacy Mode, none of your questions or conversations will ever be
                stored by us.
              </p>

              <ul className={screen4Styles.featureList}>
                <li>No data collection</li>
                <li>No usage analytics</li>
                <li>All processing stays local</li>
              </ul>
            </div>
          </motion.div>

          {/* 底部说明 */}
          <motion.p
            animate={{ opacity: 1 }}
            className={screen4Styles.footerNote}
            initial={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            You can always change this later in the settings.
          </motion.p>
        </div>
      </div>
    </div>
  );
};
