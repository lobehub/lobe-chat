import { Highlighter } from '@lobehub/ui';
import { Card, List, Popover, Tag } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import isEqual from 'fast-deep-equal';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { clientDBSelectors } from '@/store/global/selectors';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    margin-block-end: ${token.marginMD}px;
    border-radius: ${token.borderRadiusLG}px;
  `,
  hash: css`
    font-family: ${token.fontFamilyCode};
  `,
  sql: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;

    font-size: 12px;
  `,
  time: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
}));

const Diagnosis = () => {
  const { t } = useTranslation('common');
  const { styles, cx } = useStyles();

  const migrations = useGlobalStore(clientDBSelectors.displayMigrationStatus, isEqual);

  return (
    <Card
      className={styles.card}
      styles={{ body: { padding: 0 } }}
      title={t('clientDB.solve.diagnosis.title')}
    >
      <List
        dataSource={migrations}
        renderItem={(migration) => (
          <List.Item
            key={migration.id}
            style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}
          >
            <Flexbox gap={4} horizontal>
              <Flexbox style={{ minWidth: 20 }} width={20}>
                {migration.index}
              </Flexbox>
              <Popover
                content={
                  <Flexbox gap={8}>
                    <div className={styles.hash}>Hash: {migration.id}</div>
                    <Highlighter
                      language={'sql'}
                      style={{ maxHeight: '30vh', maxWidth: '70vw', overflow: 'scroll' }}
                    >
                      {migration.sql.join('\n')}
                    </Highlighter>
                  </Flexbox>
                }
                title={t('clientDB.solve.diagnosis.sql')}
              >
                <Flexbox gap={8}>
                  <Flexbox
                    className={cx(styles.sql, migration.status === 'success' && styles.time)}
                  >
                    {migration.desc}
                  </Flexbox>
                  <Flexbox>
                    <Flexbox className={styles.time}>
                      {t('clientDB.solve.diagnosis.createdAt')}
                      {dayjs(migration.createdAt).format('YYYY-MM-DD hh:mm:ss')} ·{' '}
                      {t('clientDB.solve.diagnosis.migratedAt')}{' '}
                      {dayjs(migration.migratedAt).format('YYYY-MM-DD hh:mm:ss')}
                    </Flexbox>
                  </Flexbox>
                </Flexbox>
              </Popover>
            </Flexbox>
            <Tag bordered={false} color={migration.status}>
              {migration.status}
            </Tag>
          </List.Item>
        )}
        size="small"
      />
    </Card>
  );
};
export default Diagnosis;
