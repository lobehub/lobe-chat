'use client';

import { Alert, Button, CodeEditor, Icon } from '@lobehub/ui';
import { Card, List, Typography } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import isEqual from 'fast-deep-equal';
import { AlertCircle, CheckCircle, Play } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { clientDB, updateMigrationRecord } from '@/database/client/db';
import { useGlobalStore } from '@/store/global';
import { clientDBSelectors } from '@/store/global/selectors';

const { Text } = Typography;

// 使用 antd-style 创建样式
const useStyles = createStyles(({ css, token }) => ({
  actionBar: css`
    display: flex;
    justify-content: flex-end;
    margin-block-start: ${token.marginSM}px;
  `,
  card: css`
    margin-block-end: ${token.marginMD}px;
    border-radius: ${token.borderRadiusLG}px;
  `,
  codeBlock: css`
    overflow-x: auto;

    margin-block: ${token.marginSM}px;
    margin-inline: 0;
    padding: ${token.paddingSM}px;
    border-radius: ${token.borderRadiusSM}px;

    font-family: ${token.fontFamilyCode};
    font-size: 12px;

    background: ${token.colorBgTextHover};
  `,
  container: css`
    overflow-y: auto;
    padding: 0;
  `,
  header: css`
    display: flex;
    align-items: center;
    margin-block-end: ${token.marginMD}px;
  `,
  migrationItem: css`
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding-block: ${token.paddingSM}px;
    padding-inline: 0;
    border-block-end: none;
  `,
  spotlight: css`
    margin-block-end: ${token.marginLG}px;
  `,

  templateCard: css`
    margin-block-end: ${token.marginSM}px;
  `,
}));

interface QueryResult {
  message: string;
  success: boolean;
}
const Repair = memo(() => {
  const { t } = useTranslation('common');

  const { styles } = useStyles();
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [showSQLHash, setShowSQLHash] = useState('');

  const errorMigrations = useGlobalStore(clientDBSelectors.errorMigrations, isEqual);

  const handleExecuteSQL = async () => {
    try {
      // 移除 BEGIN 和 COMMIT
      let processedSQL = sqlQuery.replaceAll(/BEGIN;|COMMIT;/g, '');

      // 分割 SQL 语句（使用 statement-breakpoint 作为分隔符）
      const migrationQueries = processedSQL.split('--> statement-breakpoint');

      // 手动管理事务
      await clientDB.execute('BEGIN;');

      try {
        for (const query of migrationQueries) {
          if (query.trim()) {
            await clientDB.execute(query);
          }
        }
        await clientDB.execute('COMMIT;');

        setQueryResult({
          message: `SQL executed successfully.`,
          success: true,
        });
      } catch (error) {
        await clientDB.execute('ROLLBACK;');

        throw error;
      }
    } catch (error) {
      setQueryResult({ message: (error as Error).message, success: false });
    }
  };

  return (
    <div>
      <Card
        className={styles.card}
        extra={<Text type="secondary">{t('clientDB.solve.repair.desc')}</Text>}
        title={t('clientDB.solve.repair.title')}
        variant={'borderless'}
      >
        <List
          dataSource={errorMigrations}
          renderItem={(migration) => (
            <>
              <List.Item
                actions={[
                  <Button
                    icon={<Icon icon={Play} />}
                    key="retry"
                    onClick={() => {
                      setShowSQLHash(!!showSQLHash ? '' : migration.hash);
                      setSqlQuery(migration.sql.join('--> statement-breakpoint\n'));
                    }}
                  >
                    {t('clientDB.solve.repair.runSQL')}
                  </Button>,
                ]}
                className={styles.migrationItem}
                key={migration.hash}
              >
                <List.Item.Meta
                  description={
                    <Flexbox>
                      {t('clientDB.solve.diagnosis.createdAt')}
                      {dayjs(migration.folderMillis).format('YYYY-MM-DD hh:mm:ss')} ·
                    </Flexbox>
                  }
                  title={migration.sql[0]}
                />
              </List.Item>
              {showSQLHash === migration.hash && (
                <Card
                  className={styles.card}
                  extra={<Text type="secondary">{t('clientDB.solve.repair.sql.desc')}</Text>}
                  title={t('clientDB.solve.repair.sql.title')}
                >
                  <Flexbox gap={16}>
                    <CodeEditor
                      language={'sql'}
                      onValueChange={(e) => setSqlQuery(e)}
                      placeholder={t('clientDB.solve.repair.sql.placeholder')}
                      style={{ fontFamily: 'monospace', height: 300 }}
                      value={sqlQuery}
                    />
                    <Flexbox horizontal style={{ justifyContent: 'space-between' }}>
                      <Button onClick={() => setSqlQuery('')}>
                        {t('clientDB.solve.repair.sql.clear')}
                      </Button>
                      <Button disabled={!sqlQuery.trim()} onClick={handleExecuteSQL} type="primary">
                        {t('clientDB.solve.repair.sql.run')}
                      </Button>
                    </Flexbox>

                    {queryResult && (
                      <Alert
                        action={
                          queryResult.success && (
                            <Button
                              key="complete"
                              onClick={() => updateMigrationRecord(migration.hash)}
                              size={'small'}
                              type="primary"
                            >
                              {t('clientDB.solve.repair.sql.markFinished')}
                            </Button>
                          )
                        }
                        description={
                          <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                            {queryResult.message}
                          </pre>
                        }
                        icon={
                          queryResult.success ? (
                            <AlertCircle size={16} />
                          ) : (
                            <CheckCircle size={16} />
                          )
                        }
                        message={t('clientDB.solve.repair.sql.result')}
                        showIcon
                        type={queryResult.success ? 'success' : 'error'}
                      />
                    )}
                  </Flexbox>
                </Card>
              )}
            </>
          )}
        />
      </Card>
    </div>
  );
});

export default Repair;
