import { Claude, Cline, Cursor, LobeHub, OpenAI } from '@lobehub/icons';
import { ConnectionConfig } from '@lobehub/market-types';
import { Block, Highlighter, Markdown, Segmented, Select } from '@lobehub/ui';
import { Divider } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Title from '../../../../../../../features/Title';
import { genServerConfig } from '../../../utils';
import VsCode from './VsCode';

enum PlatformType {
  Claude = 'claude',
  Cline = 'cline',
  Cursor = 'cursor',
  LobeChat = 'lobecaht',
  OpenAI = 'openai',
  VsCode = 'vscode',
}

const useStyles = createStyles(({ css }) => {
  return {
    lite: css`
      pre {
        padding: 12px !important;
      }
    `,
  };
});

interface PlatformProps {
  connection?: ConnectionConfig;
  identifier?: string;
  lite?: boolean;
  mobile?: boolean;
}

const Platform = memo<PlatformProps>(({ lite, identifier, connection, mobile }) => {
  const { t } = useTranslation('discover');
  const [active, setActive] = useState<PlatformType>(PlatformType.LobeChat);
  const serverConfig = genServerConfig(identifier, connection);
  const { cx, styles } = useStyles();

  const { platform, steps } = useMemo(() => {
    switch (active) {
      case PlatformType.LobeChat: {
        return {
          platform: 'LobeChat',
          steps: t('mcp.details.deployment.platform.steps.lobeChat'),
        };
      }
      case PlatformType.Claude: {
        return {
          platform: 'Claude',
          steps: t('mcp.details.deployment.platform.steps.claude'),
        };
      }
      case PlatformType.OpenAI: {
        return {
          platform: 'OpenAI',
          steps: t('mcp.details.deployment.platform.steps.openai'),
        };
      }
      case PlatformType.Cursor: {
        return {
          platform: 'Cursor',
          steps: t('mcp.details.deployment.platform.steps.cursor'),
        };
      }
      case PlatformType.VsCode: {
        return {
          platform: 'VsCode',
          steps: t('mcp.details.deployment.platform.steps.vscode'),
        };
      }
      case PlatformType.Cline: {
        return {
          platform: 'Cline',
          steps: t('mcp.details.deployment.platform.steps.cline'),
        };
      }
    }
  }, [active, t]);

  const options = [
    {
      icon: <LobeHub.Color className={'anticon'} size={18} />,
      label: 'LobeChat',
      value: PlatformType.LobeChat,
    },
    {
      icon: <Claude.Color className={'anticon'} size={18} />,
      label: 'Claude',
      value: PlatformType.Claude,
    },
    {
      icon: <OpenAI className={'anticon'} size={18} />,
      label: 'OpenAI',
      value: PlatformType.OpenAI,
    },
    {
      icon: <Cursor className={'anticon'} size={18} />,
      label: 'Cursor',
      value: PlatformType.Cursor,
    },
    {
      icon: <VsCode className={'anticon'} size={18} />,
      label: 'VsCode',
      value: PlatformType.VsCode,
    },
    {
      icon: <Cline className={'anticon'} size={18} />,
      label: 'Cline',
      value: PlatformType.Cline,
    },
  ];

  return (
    <Block gap={lite ? 0 : 16} padding={4} variant={lite ? 'outlined' : 'borderless'}>
      {mobile || lite ? (
        <Select
          onSelect={(v) => setActive(v as PlatformType)}
          options={options.map((item) => ({
            ...item,
            label: (
              <Flexbox align={'center'} gap={8} horizontal>
                {item.icon} {item.label}
              </Flexbox>
            ),
          }))}
          value={active}
          variant={'filled'}
        />
      ) : (
        <Segmented
          block
          onChange={(v) => setActive(v as PlatformType)}
          options={options}
          value={active}
        />
      )}
      <Flexbox>
        {!lite && (
          <Title level={3}>{t('mcp.details.deployment.platform.title', { platform })}</Title>
        )}
        <Markdown>{steps}</Markdown>
      </Flexbox>
      {lite && <Divider dashed style={{ margin: 0 }} />}
      <Highlighter
        className={cx(lite && styles.lite)}
        defaultExpand={false}
        fileName={'MCP server config'}
        fullFeatured
        language={'json'}
        style={{
          fontSize: 12,
        }}
        variant={lite ? 'borderless' : 'outlined'}
      >
        {serverConfig}
      </Highlighter>
    </Block>
  );
});

export default Platform;
