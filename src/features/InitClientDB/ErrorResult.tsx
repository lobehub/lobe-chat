import { Highlighter, Icon, Modal } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, memo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import Balancer from 'react-wrap-balancer';

import { GITHUB_ISSUES } from '@/const/url';
import { githubService } from '@/services/github';
import { useGlobalStore } from '@/store/global';

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
        <Center gap={24}>
          <Balancer>
            <Trans i18nKey="clientDB.error.desc" ns={'common'}>
              非常抱歉，Pglite 数据库初始化过程中发生异常。请尝试重试，或
              <Link
                aria-label={'issue'}
                href={GITHUB_ISSUES}
                onClick={(e) => {
                  e.preventDefault();
                  githubService.submitPgliteInitError(error);
                }}
                target="_blank"
              >
                提交问题
              </Link>
              我们将会第一时间帮你排查问题。
            </Trans>
          </Balancer>
          <Button onClick={() => initializeClientDB()} size={'large'} type={'primary'}>
            {t('clientDB.error.retry')}
          </Button>

          <Flexbox gap={8} style={{ marginTop: 8 }} width={'100%'}>
            {t('clientDB.error.detail', { message: error?.message, type: error?.name })}
            <Highlighter copyButtonSize={'small'} language={'json'}>
              {JSON.stringify(error, null, 2)}
            </Highlighter>
          </Flexbox>
        </Center>
      </Modal>
    </>
  );
});

export default ErrorResult;
