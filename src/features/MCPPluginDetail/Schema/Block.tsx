import { Segmented, Tag } from '@lobehub/ui';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Title from '../../../app/[variants]/(main)/discover/features/Title';
import { ModeType } from './types';

interface BlockProps {
  children?: ReactNode;
  count: number;
  desc: string;
  id?: string;
  mode?: ModeType;
  setMode?: (mode: ModeType) => void;
  title: string;
}

const Block = memo<BlockProps>(({ title, count, desc, children, mode, setMode, id }) => {
  const { t } = useTranslation('discover');
  return (
    <Flexbox gap={8}>
      <Flexbox align={'center'} gap={12} horizontal justify={'space-between'}>
        <Title id={id} tag={<Tag>{count}</Tag>}>
          {title}
        </Title>
        <Segmented
          onChange={(v) => setMode?.(v as ModeType)}
          options={[
            {
              label: t('mcp.details.schema.mode.docs'),
              value: ModeType.Docs,
            },
            {
              label: 'JSON',
              value: ModeType.JSON,
            },
          ]}
          shape={'round'}
          value={mode}
          variant={'outlined'}
        />
      </Flexbox>
      <p style={{ marginBottom: 24 }}>{desc}</p>
      {children}
    </Flexbox>
  );
});

export default Block;
