'use client';

import { Github } from '@lobehub/icons';
import { ActionIcon, Avatar, Block, Icon } from '@lobehub/ui';
import { Spotlight } from '@lobehub/ui/awesome';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ClockIcon, StarIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'nextjs-toploader/app';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { DiscoverMcpItem } from '@/types/discover';

import Scores from '../../../../(detail)/mcp/[...slugs]/features/Scores';
import InstallationIcon from '../../../../features/InstallationIcon';
import PublishedTime from '../../../../features/PublishedTime';
import ConnectionTypeTag from './ConnectionTypeTag';
import MetaInfo from './MetaInfo';

const { Title, Paragraph } = Typography;

const useStyles = createStyles(({ css, token }) => {
  return {
    author: css`
      color: ${token.colorTextDescription};
    `,
    code: css`
      font-family: ${token.fontFamilyCode};
    `,
    desc: css`
      flex: 1;
      margin: 0 !important;
      color: ${token.colorTextSecondary};
    `,
    footer: css`
      margin-block-start: 16px;
      border-block-start: 1px dashed ${token.colorBorder};
      background: ${token.colorBgContainerSecondary};
    `,
    secondaryDesc: css`
      font-size: 12px;
      color: ${token.colorTextDescription};
    `,
    title: css`
      margin: 0 !important;
      font-size: 16px !important;
      font-weight: 500 !important;

      &:hover {
        color: ${token.colorLink};
      }
    `,
  };
});

const McpItem = memo<DiscoverMcpItem>(
  ({
    name,
    icon,
    author,
    description,
    identifier,
    category,
    isValidated,
    isFeatured,
    toolsCount,
    updatedAt,
    installationMethods,
    promptsCount,
    resourcesCount,
    connectionType,
    installCount,
    github,
  }) => {
    const { t } = useTranslation('discover');
    const { styles, theme } = useStyles();
    const router = useRouter();
    const link = urlJoin('/discover/mcp', identifier);
    return (
      <Block
        clickable
        height={'100%'}
        onClick={() => {
          router.push(link);
        }}
        style={{
          overflow: 'hidden',
          position: 'relative',
        }}
        variant={'outlined'}
        width={'100%'}
      >
        {isFeatured && <Spotlight size={400} />}
        <Flexbox
          align={'flex-start'}
          gap={16}
          horizontal
          justify={'space-between'}
          padding={16}
          width={'100%'}
        >
          <Flexbox
            gap={12}
            horizontal
            style={{
              overflow: 'hidden',
            }}
            title={identifier}
          >
            <Avatar avatar={icon} size={40} style={{ flex: 'none' }} />
            <Flexbox
              flex={1}
              gap={2}
              style={{
                overflow: 'hidden',
              }}
            >
              <Flexbox
                align={'center'}
                flex={1}
                gap={8}
                horizontal
                style={{
                  overflow: 'hidden',
                }}
              >
                <Link href={link} style={{ color: 'inherit', overflow: 'hidden' }}>
                  <Title
                    className={styles.title}
                    ellipsis={{
                      rows: 1,
                    }}
                    level={2}
                  >
                    {name}
                  </Title>
                </Link>
                {isFeatured && <Icon color={theme.gold} fill={theme.gold} icon={StarIcon} />}
              </Flexbox>
              {author && <div className={styles.author}>{author}</div>}
            </Flexbox>
          </Flexbox>
          <Flexbox align={'center'} gap={4} horizontal>
            {installationMethods && <InstallationIcon type={installationMethods} />}
            {github && (
              <Link href={github.url} onClick={(e) => e.stopPropagation()} target={'_blank'}>
                <ActionIcon fill={theme.colorTextDescription} icon={Github} />
              </Link>
            )}
          </Flexbox>
        </Flexbox>
        <Flexbox flex={1} gap={12} paddingInline={16}>
          <Scores
            github={github}
            identifier={identifier}
            installationMethods={installationMethods}
            isValidated={isValidated}
            overview={{ readme: github?.url }}
            promptsCount={promptsCount}
            resourcesCount={resourcesCount}
            toolsCount={toolsCount}
          />
          <Paragraph
            className={styles.desc}
            ellipsis={{
              rows: 3,
            }}
          >
            {description}
          </Paragraph>
          <Flexbox
            align={'center'}
            className={styles.secondaryDesc}
            horizontal
            justify={'space-between'}
          >
            <Flexbox align={'center'} gap={4} horizontal>
              <Icon icon={ClockIcon} size={14} />
              <PublishedTime
                className={styles.secondaryDesc}
                date={updatedAt}
                template={'MMM DD, YYYY'}
              />
            </Flexbox>
            {t(`mcp.categories.${category}.name` as any)}
          </Flexbox>
        </Flexbox>
        <Flexbox
          align={'center'}
          className={styles.footer}
          horizontal
          justify={'space-between'}
          padding={16}
        >
          <ConnectionTypeTag type={connectionType} />
          <MetaInfo
            className={styles.secondaryDesc}
            installCount={installCount}
            stars={github?.stars}
          />
        </Flexbox>
      </Block>
    );
  },
);

export default McpItem;
