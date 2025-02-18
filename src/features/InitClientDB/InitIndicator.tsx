'use client';

import { Progress } from 'antd';
import { createStyles } from 'antd-style';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { ClientDatabaseInitStages, DatabaseLoadingState } from '@/types/clientDB';

import ErrorResult from './ErrorResult';

const useStyles = createStyles(({ css, token, prefixCls }) => ({
  bg: css`
    padding-block: 8px;
    padding-inline: 8px 32px;
    border-radius: 40px;
    background: ${token.colorText};
  `,
  container: css`
    position: fixed;
    z-index: 1000;
  `,
  progress: css`
    .${prefixCls}-progress-text {
      font-size: 12px;
      color: ${token.colorBgContainer} !important;
    }
  `,
  progressReady: css`
    .${prefixCls}-progress-text {
      color: ${token.colorSuccessBorder} !important;
    }
  `,

  text: css`
    font-size: 15px;
    color: ${token.colorBgContainer};
  `,
}));

interface InitClientDBProps {
  bottom?: number;
  show: boolean;
}

const InitClientDB = memo<InitClientDBProps>(({ bottom = 80, show }) => {
  const { styles, theme, cx } = useStyles();
  const currentStage = useGlobalStore((s) => s.initClientDBStage || DatabaseLoadingState.Idle);
  const { t } = useTranslation('common');
  const useInitClientDB = useGlobalStore((s) => s.useInitClientDB);

  useInitClientDB();

  const getStateMessage = (state: DatabaseLoadingState) => {
    switch (state) {
      case DatabaseLoadingState.Finished:
      case DatabaseLoadingState.Ready: {
        return t('clientDB.initing.ready');
      }

      case DatabaseLoadingState.Idle: {
        return t('clientDB.initing.idle');
      }
      case DatabaseLoadingState.Initializing: {
        return t('clientDB.initing.initializing');
      }
      case DatabaseLoadingState.LoadingDependencies: {
        return t('clientDB.initing.loadingDependencies');
      }

      case DatabaseLoadingState.LoadingWasm: {
        return t('clientDB.initing.loadingWasmModule');
      }

      case DatabaseLoadingState.Migrating: {
        return t('clientDB.initing.migrating');
      }
    }
  };

  const currentStageIndex = ClientDatabaseInitStages.indexOf(currentStage);
  const isReady = currentStage === DatabaseLoadingState.Finished;
  const isError = currentStage === DatabaseLoadingState.Error;
  return (
    <AnimatePresence>
      {show && (
        <Center className={styles.container} style={{ bottom }} width={'100%'}>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
          >
            {isError ? (
              <ErrorResult />
            ) : (
              <Flexbox align={'center'} className={styles.bg} gap={12} horizontal>
                <Progress
                  className={cx(styles.progress, isReady && styles.progressReady)}
                  format={isReady ? undefined : (percent) => percent}
                  percent={parseInt(
                    ((currentStageIndex / (ClientDatabaseInitStages.length - 1)) * 100).toFixed(0),
                  )}
                  size={40}
                  strokeColor={isReady ? theme.colorSuccessActive : theme.colorBgContainer}
                  strokeLinecap={'round'}
                  strokeWidth={10}
                  trailColor={rgba(theme.colorBgContainer, 0.1)}
                  type={'circle'}
                />
                <span className={styles.text}>{getStateMessage(currentStage)}</span>
              </Flexbox>
            )}
          </motion.div>
        </Center>
      )}
    </AnimatePresence>
  );
});
export default InitClientDB;
