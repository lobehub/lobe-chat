'use client';

import { ActionIcon } from '@lobehub/ui';
import { useRequest } from 'ahooks';
import { Card, Progress, Statistic, Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
import { AlertCircle, HardDrive, RotateCw } from 'lucide-react';
import { Center, Flexbox } from 'react-layout-kit';

import { formatSize } from '@/utils/format';

const { Text } = Typography;

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    width: 100%;
    max-width: 1024px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};
    box-shadow: 0 2px 8px ${token.boxShadow};

    .ant-card-body {
      padding: 24px;
    }
  `,
  detailItem: css`
    .ant-typography {
      margin-block-end: 4px;

      &:last-child {
        margin-block-end: 0;
      }
    }
  `,
  icon: css`
    color: ${token.colorPrimary};
  `,
  percentage: css`
    font-size: 24px;
    font-weight: 600;
    line-height: 1;
    color: ${token.colorTextBase};
  `,
  progressInfo: css`
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);

    text-align: center;
  `,
  progressWrapper: css`
    position: relative;
    width: 180px;
    height: 180px;
  `,
  title: css`
    margin-block-end: 0;
    font-size: 16px;
    font-weight: 500;
    color: ${token.colorTextBase};
  `,
  usageText: css`
    font-size: 13px;
    color: ${token.colorTextSecondary};
  `,
  warning: css`
    font-size: 13px;
    color: ${token.colorWarning};
  `,
}));

// 字节转换函数

const StorageEstimate = () => {
  const { styles } = useStyles();
  const { token } = theme.useToken();

  const { data, loading, refresh } = useRequest(async () => {
    const estimate = await navigator.storage.estimate();
    return {
      quota: estimate.quota || 0,
      usage: estimate.usage || 0,
    };
  });

  if (!data) return null;

  const usedPercentage = Math.round((data.usage / data.quota) * 100);
  const freeSpace = data.quota - data.usage;
  const isLowStorage = usedPercentage > 90;

  return (
    <Center>
      <Card
        className={styles.card}
        extra={<ActionIcon icon={RotateCw} loading={loading} onClick={refresh} title="Refresh" />}
        title={
          <Flexbox align="center" gap={8} horizontal>
            <HardDrive className={styles.icon} size={18} />
            <span className={styles.title}>Storage Usage</span>
          </Flexbox>
        }
      >
        <Flexbox align="center" gap={80} horizontal justify={'center'}>
          {/* 左侧环形进度区 */}
          <div className={styles.progressWrapper}>
            <Progress
              percent={usedPercentage < 1 ? 1 : usedPercentage}
              size={180}
              strokeColor={isLowStorage ? token.colorWarning : token.colorPrimary}
              strokeWidth={8}
              type="circle"
            />
          </div>

          {/* 右侧详细信息区 */}
          <Flexbox gap={24}>
            <Statistic title={'Used Storage'} value={formatSize(data.usage)} />
            <Statistic title={'Available Storage'} value={formatSize(freeSpace)} />
            <Statistic title={'Total Storage'} value={formatSize(data.quota)} />
            {/* 警告信息 */}
            {isLowStorage && (
              <Flexbox align="center" gap={8} horizontal>
                <AlertCircle className={styles.warning} size={16} />
                <Text className={styles.warning}>
                  Storage space is running low ({'<'}10% available)
                </Text>
              </Flexbox>
            )}
          </Flexbox>
        </Flexbox>
      </Card>
    </Center>
  );
};

export default StorageEstimate;
