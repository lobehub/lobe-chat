import { Tooltip } from '@lobehub/ui';
import { Tag } from 'antd';
import { useTheme } from 'antd-style';
import { CSSProperties, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export enum PlanType {
  Preview = 'preview',
}

export interface PlanTagProps {
  type?: PlanType;
}

const PlanTag = memo<PlanTagProps>(({ type = PlanType.Preview }) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const tag: {
    desc: string;
    style: CSSProperties;
    title: string;
  } = useMemo(() => {
    switch (type) {
      case PlanType.Preview: {
        return {
          desc: t('userPanel.preview'),
          style: {
            background: theme.colorFill,
          },
          title: 'Preview',
        };
      }
    }
  }, []);

  return (
    <Tooltip title={tag.desc}>
      <Tag bordered={false} style={{ ...tag.style, borderRadius: 12, cursor: 'pointer' }}>
        {tag.title}
      </Tag>
    </Tooltip>
  );
});

export default PlanTag;
