import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { ActionIcon, Icon } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { UploadIcon, XIcon } from 'lucide-react';
import { lighten } from 'polished';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { fileManagerSelectors, useFileStore } from '@/store/file';
import { convertAlphaToSolid } from '@/utils/colorUtils';

import Item from './Item';

const useStyles = createStyles(({ css, token }) => {
  return {
    body: css`
      height: 400px;
      background: ${lighten(0.05, token.colorBgLayout)};
      border-radius: 8px;
    `,
    container: css`
      position: fixed;
      z-index: 100;
      inset-block-end: 24px;
      inset-inline-end: 24px;

      overflow: hidden;

      width: 360px;

      border: 1px solid ${token.colorSplit};
      border-radius: 8px;
      box-shadow: ${token.boxShadow};
    `,
    header: css`
      cursor: pointer;

      padding-block: 8px;
      padding-inline: 24px 12px;

      background: ${token.colorBgContainer};
      border-radius: 8px;

      transition: all 0.3s ease-in-out;

      &:hover {
        background: ${convertAlphaToSolid(token.colorFillTertiary, token.colorBgContainer)};
      }
    `,
    progress: css`
      pointer-events: none;

      position: absolute;
      inset-block: 0 0;
      inset-inline: 0 1%;

      height: 100%;

      background: ${token.colorFillTertiary};
      border-block-end: 3px solid ${token.geekblue};
    `,
    title: css`
      height: 36px;
      font-size: 16px;
      color: ${token.colorText};
    `,
  };
});

const UploadDock = memo(() => {
  const { styles, theme } = useStyles();
  const { t } = useTranslation('file');
  const [expand, setExpand] = useState(true);
  const [show, setShow] = useState(true);

  const dispatchDockFileList = useFileStore((s) => s.dispatchDockFileList);
  const totalUploadingProgress = useFileStore(fileManagerSelectors.overviewUploadingProgress);
  const fileList = useFileStore(fileManagerSelectors.dockFileList, isEqual);
  const overviewUploadingStatus = useFileStore(
    fileManagerSelectors.overviewUploadingStatus,
    isEqual,
  );
  const isUploading = overviewUploadingStatus === 'uploading';

  const icon = useMemo(() => {
    switch (overviewUploadingStatus) {
      case 'success': {
        return <CheckCircleFilled style={{ color: theme.colorSuccess }} />;
      }
      case 'error': {
        return <CloseCircleFilled style={{ color: theme.colorError }} />;
      }

      default: {
        return <Icon icon={UploadIcon} />;
      }
    }
  }, [overviewUploadingStatus]);

  const count = fileList.length;

  useEffect(() => {
    if (show) return;
    if (isUploading) setShow(true);
  }, [isUploading, show]);

  if (count === 0 || !show) return;

  return (
    <Flexbox className={styles.container}>
      <Flexbox
        align={'center'}
        className={styles.header}
        horizontal
        justify={'space-between'}
        onClick={() => {
          setExpand(!expand);
        }}
        style={{
          borderBottom: expand ? `1px solid ${theme.colorSplit}` : undefined,
          borderBottomLeftRadius: expand ? 0 : undefined,
          borderBottomRightRadius: expand ? 0 : undefined,
        }}
      >
        <Flexbox align={'center'} className={styles.title} gap={16} horizontal>
          {icon}
          {t(`uploadDock.uploadStatus.${overviewUploadingStatus}`)} ·{' '}
          {t('uploadDock.totalCount', { count })}
        </Flexbox>
        {!isUploading && (
          <ActionIcon
            icon={XIcon}
            onClick={() => {
              setShow(false);
              dispatchDockFileList({ ids: fileList.map((item) => item.id), type: 'removeFiles' });
            }}
          />
        )}
      </Flexbox>

      {expand ? (
        <Flexbox className={styles.body} justify={'space-between'}>
          <Flexbox gap={8} paddingBlock={16} style={{ overflowY: 'scroll' }}>
            {fileList.map((item) => (
              <Item key={item.id} {...item} />
            ))}
          </Flexbox>
          <Center style={{ height: 40, minHeight: 40 }}>
            <Typography.Text
              onClick={() => {
                setExpand(false);
              }}
              style={{ cursor: 'pointer' }}
              type={'secondary'}
            >
              {t('uploadDock.body.collapse')}
            </Typography.Text>
          </Center>
        </Flexbox>
      ) : (
        overviewUploadingStatus !== 'pending' && (
          <div
            className={styles.progress}
            style={{
              borderColor:
                overviewUploadingStatus === 'success'
                  ? theme.colorSuccess
                  : overviewUploadingStatus === 'error'
                    ? theme.colorError
                    : undefined,
              insetInlineEnd: `${100 - totalUploadingProgress}%`,
            }}
          />
        )
      )}
    </Flexbox>
  );
});

export default UploadDock;
