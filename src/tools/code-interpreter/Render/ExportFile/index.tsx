'use client';

import { CheckCircleFilled, CloseCircleFilled, DownloadOutlined } from '@ant-design/icons';
import { BuiltinRenderProps } from '@lobechat/types';
import { ActionIcon, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ExportFileState } from '../../type';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow: hidden;
    padding-inline: 8px 0;
  `,
  filename: css`
    font-family: ${token.fontFamilyCode};
    font-size: 12px;
  `,
  statusIcon: css`
    font-size: 12px;
  `,
}));

interface ExportFileParams {
  path: string;
}

const ExportFile = memo<BuiltinRenderProps<ExportFileParams, ExportFileState>>(
  ({ args, pluginState }) => {
    const { styles, theme } = useStyles();
    const isSuccess = pluginState?.success;

    const handleDownload = useCallback(async () => {
      if (!pluginState?.downloadUrl || !pluginState?.filename) return;

      try {
        // Fetch the file content to bypass cross-origin download restrictions
        const response = await fetch(pluginState.downloadUrl);
        const blob = await response.blob();

        // Create a blob URL and trigger download
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = pluginState.filename;
        document.body.append(link);
        link.click();
        link.remove();

        // Clean up the blob URL
        URL.revokeObjectURL(blobUrl);
      } catch {
        // Fallback: open in new tab if fetch fails
        window.open(pluginState.downloadUrl, '_blank');
      }
    }, [pluginState?.downloadUrl, pluginState?.filename]);

    return (
      <Flexbox className={styles.container} gap={8}>
        <Flexbox align={'center'} gap={8} horizontal>
          {pluginState === undefined ? null : isSuccess ? (
            <CheckCircleFilled
              className={styles.statusIcon}
              style={{ color: theme.colorSuccess }}
            />
          ) : (
            <CloseCircleFilled className={styles.statusIcon} style={{ color: theme.colorError }} />
          )}
          <Text className={styles.filename}>
            {isSuccess
              ? `Exported: ${pluginState?.filename || args.path}`
              : `Failed to export ${args.path}`}
          </Text>
          {isSuccess && pluginState?.downloadUrl && (
            <ActionIcon
              icon={DownloadOutlined}
              onClick={handleDownload}
              size={'small'}
              title="Download"
            />
          )}
        </Flexbox>
      </Flexbox>
    );
  },
);

ExportFile.displayName = 'ExportFile';

export default ExportFile;
