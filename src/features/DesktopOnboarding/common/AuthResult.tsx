import { motion } from "motion/react";
import { createStyles } from "antd-style";
import { Check, X } from "lucide-react";
import { LogoBrand } from "./LogoBrand";

const useAuthResultStyles = createStyles(({ token, css }) => ({
  container: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 40px 20px;
  `,

  iconContainer: css`
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 32px;
  `,

  deviceIcon: css`
    width: 80px;
    height: 72px;
    background: #2d2d2d;
    border-radius: ${token.borderRadiusLG}px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      height: 6px;
      background: #666;
      border-radius: 2px;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 20px;
      left: 8px;
      right: 8px;
      bottom: 8px;
      background: #444;
      border-radius: 4px;
    }
  `,

  connectionLine: css`
    width: 60px;
    height: 2px;
    background: #666;
    position: relative;
  `,

  statusIcon: css`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `,

  successIcon: css`
    background: ${token.colorSuccess};
    color: white;
  `,

  errorIcon: css`
    background: ${token.colorError};
    color: white;
  `,

  logoContainer: css`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: ${token.colorBgElevated}; 
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
  `,

  title: css`
    font-size: 28px;
    font-weight: 600;
    color: ${token.colorTextBase};
    margin: 0 0 16px 0;
    font-family: ${token.fontFamily};
  `,

  description: css`
    font-size: ${token.fontSize}px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    line-height: 1.5;
    max-width: 400px;
  `,
}));

interface AuthResultProps {
  success: boolean;
  title?: string;
  description?: string;
  animated?: boolean;
}

export const AuthResult = ({ 
  success, 
  title,
  description,
  animated = true 
}: AuthResultProps) => {
  const { styles } = useAuthResultStyles();

  const defaultTitle = success ? "Authorization Successful" : "Authorization Failed";
  const defaultDescription = success 
    ? "Please click the Start button below to continue using LobeHub Desktop"
    : "Please try again or switch to a different login method";

  const content = (
    <>
      {/* 图标连接区域 */}
      <div className={styles.iconContainer}>
        {/* 设备图标 */}
        <div className={styles.deviceIcon} />
        
        {/* 连接线和状态图标 */}
        <div className={styles.connectionLine}>
          <div className={`${styles.statusIcon} ${success ? styles.successIcon : styles.errorIcon}`}>
            {success ? <Check size={14} /> : <X size={14} />}
          </div>
        </div>
        
        {/* Logo */}
        <div className={styles.logoContainer}>
          <LogoBrand
            logoSize={88}
            textHeight={0}
            spacing={0}
            animated={false}
          />
        </div>
      </div>

      {/* 文字内容 */}
      <h2 className={styles.title}>{title || defaultTitle}</h2>
      <p className={styles.description}>{description || defaultDescription}</p>
    </>
  );

  if (animated) {
    return (
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className={styles.container}>
      {content}
    </div>
  );
};