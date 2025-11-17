import { EditLocalFileParams } from '@lobechat/electron-client-ipc';
import { BuiltinInterventionProps } from '@lobechat/types';
import { Highlighter, Icon, Text } from '@lobehub/ui';
import { ChevronRight } from 'lucide-react';
import path from 'path-browserify-esm';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { LocalFile, LocalFolder } from '@/features/LocalFile';

const EditLocalFile = memo<BuiltinInterventionProps<EditLocalFileParams>>(({ args }) => {
  const { t } = useTranslation('tool');
  const { base, dir } = path.parse(args.file_path);

  return (
    <Flexbox gap={12}>
      <Flexbox horizontal>
        <LocalFolder path={dir} />
        <Icon icon={ChevronRight} />
        <LocalFile name={base} path={args.file_path} />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">
          {args.replace_all
            ? t('localFiles.editFile.replaceAll')
            : t('localFiles.editFile.replaceFirst')}
        </Text>

        <Flexbox gap={4}>
          <Text style={{ fontSize: 12 }} type={'secondary'}>
            {t('localFiles.editFile.oldString')}
          </Text>
          <Highlighter
            language="text"
            showLanguage={false}
            style={{ maxHeight: 200, overflow: 'auto', padding: '4px 8px' }}
            variant={'outlined'}
          >
            {args.old_string}
          </Highlighter>
        </Flexbox>

        <Flexbox gap={4}>
          <Text style={{ fontSize: 12 }} type={'secondary'}>
            {t('localFiles.editFile.newString')}
          </Text>
          <Highlighter
            language="text"
            showLanguage={false}
            style={{ maxHeight: 200, overflow: 'auto', padding: '4px 8px' }}
            variant={'outlined'}
          >
            {args.new_string}
          </Highlighter>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

EditLocalFile.displayName = 'EditLocalFileIntervention';

export default EditLocalFile;
