import { Alert, Highlighter, Icon, Modal } from '@lobehub/ui';
import { Button, Spin } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { PenToolIcon, TriangleAlert } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ReactNode, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { githubService } from '@/services/github';
import { useGlobalStore } from '@/store/global';

const DatabaseRepair = dynamic(() => import('./features/DatabaseRepair'), {
  loading: () => <Spin fullscreen />,
  ssr: false,
});

const useStyles = createStyles(({ css, token }) => ({
  bg: css`
    cursor: pointer;

    padding-block: 8px;
    padding-inline: 24px;
    border-radius: 40px;

    background: ${token.red6};

    transition: transform 0.2s;

    :hover {
      transform: scale(1.05);
    }

    :active {
      transform: scale(1);
    }
  `,
  text: css`
    font-size: 15px;
    color: ${token.colorText};
  `,
}));

interface MigrationError {
  message: string;
  stack: string;
}

interface FailedModalProps {
  children?: (props: { setOpen: (open: boolean) => void }) => ReactNode;
  error?: MigrationError;
}

const ErrorResult = memo<FailedModalProps>(({ children }) => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();
  const initializeClientDB = useGlobalStore((s) => s.initializeClientDB);
  const error = useGlobalStore((s) => s.initClientDBError, isEqual);
  const [open, setOpen] = useState(false);
  const [showRepair, setShowRepair] = useState(true);

  return (
    <>
      {children ? (
        children({ setOpen })
      ) : (
        <Flexbox
          align={'center'}
          className={styles.bg}
          gap={12}
          horizontal
          onClick={() => {
            setOpen(true);
          }}
        >
          <Center height={40} width={24}>
            <Icon icon={TriangleAlert} size={{ fontSize: 20 }} />
          </Center>
          <span className={styles.text}>{t('clientDB.initing.error')}</span>
        </Flexbox>
      )}
      <Modal
        footer={null}
        onCancel={() => {
          setOpen(false);
        }}
        onClose={() => {
          setOpen(false);
        }}
        open={open}
        title={t('clientDB.error.title')}
      >
        {showRepair ? (
          <DatabaseRepair setShowRepair={setShowRepair} />
        ) : (
          <Center gap={24}>
            <div>{t('clientDB.error.desc')}</div>
            <Flexbox width={'100%'}>
              <Alert
                description={`[${error?.name}] ${error?.message}`}
                extra={
                  <Flexbox gap={8} style={{ marginTop: 8, overflow: 'scroll' }} width={'100%'}>
                    <Highlighter copyButtonSize={'small'} language={'json'}>
                      {JSON.stringify(error, null, 2)}
                    </Highlighter>
                  </Flexbox>
                }
                message={t('clientDB.error.detailTitle')}
                type={'error'}
              />
            </Flexbox>

            <Flexbox horizontal justify={'space-between'}>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  githubService.submitPgliteInitError(error);
                }}
                target={'_blank'}
                type={'text'}
              >
                {t('clientDB.error.report')}
              </Button>
              <Flexbox gap={8} horizontal>
                <Button
                  icon={<Icon icon={PenToolIcon} />}
                  onClick={() => {
                    setShowRepair(true);
                  }}
                >
                  {t('clientDB.error.selfSolve')}
                </Button>
                <Button onClick={() => initializeClientDB()} type={'primary'}>
                  {t('clientDB.error.retry')}
                </Button>
              </Flexbox>
            </Flexbox>
          </Center>
        )}
      </Modal>
    </>
  );
});

export default ErrorResult;
