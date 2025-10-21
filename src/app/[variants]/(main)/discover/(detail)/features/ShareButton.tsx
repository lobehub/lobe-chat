import {
  ActionIcon,
  Avatar,
  Button,
  ButtonProps,
  CopyButton,
  Input,
  Modal,
  Tag,
  Text,
} from '@lobehub/ui';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { startCase } from 'lodash-es';
import { LinkIcon, Share2Icon } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useShare } from '@/hooks/useShare';

import CardBanner from '../../components/CardBanner';

const useStyles = createStyles(({ css, token }) => {
  return {
    banner: css`
      overflow: hidden;

      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadiusLG}px;

      background: ${token.colorBgContainer};
      box-shadow: ${token.boxShadowTertiary};
    `,
    copy: css`
      background: ${token.colorPrimary};

      &:hover {
        background: ${token.colorPrimaryHover};
      }
    `,
    icon: css`
      border: 1px solid ${token.colorFillSecondary};

      svg {
        fill: ${token.colorTextSecondary};
      }

      &:hover {
        border: 1px solid ${token.colorBorderSecondary};

        svg {
          fill: ${token.colorText};
        }
      }
    `,
  };
});

interface ShareButtonProps extends ButtonProps {
  meta?: {
    avatar?: string | ReactNode;
    desc?: string;
    hashtags?: string[];
    tags?: ReactNode;
    title?: string;
    url: string;
  };
}

const ShareButton = memo<ShareButtonProps>(({ meta, ...rest }) => {
  const { x, reddit, telegram, whatsapp, mastodon, weibo } = useShare({
    avatar: '',
    desc: '',
    hashtags: [],
    title: '',
    url: '',
    ...meta,
  });
  const { t } = useTranslation('common');
  const { styles, theme } = useStyles();
  const [open, setOpen] = useState(false);

  let content;

  if (meta) {
    content = (
      <Center gap={16} style={{ position: 'relative' }} width={'100%'}>
        <Flexbox align={'center'} className={styles.banner} width={'100%'}>
          <CardBanner avatar={meta.avatar} size={640} style={{ height: 72, marginBottom: -36 }} />
          <Center
            flex={'none'}
            height={72}
            style={{
              backgroundColor: theme.colorBgContainer,
              borderRadius: '50%',
              overflow: 'hidden',
              zIndex: 2,
            }}
            width={72}
          >
            <Avatar animation avatar={meta.avatar} shape={'circle'} size={64} />
          </Center>
          <Center padding={12} width={'100%'}>
            <h3 style={{ fontWeight: 'bold', textAlign: 'center' }}>{meta.title}</h3>
            <Text as={'p'} style={{ color: theme.colorTextSecondary, textAlign: 'center' }}>
              {meta.desc}
            </Text>
            {meta.hashtags && (
              <Flexbox align={'center'} gap={4} horizontal justify={'center'} wrap={'wrap'}>
                {meta.hashtags.map((tag, index) => (
                  <Tag key={index}>{startCase(tag).trim()}</Tag>
                ))}
              </Flexbox>
            )}
            {meta.tags}
          </Center>
        </Flexbox>
        <Flexbox align={'center'} gap={8} horizontal justify={'center'} wrap={'wrap'}>
          {[x, reddit, telegram, whatsapp, mastodon, weibo].map(
            (item) =>
              item.icon && (
                <Link href={item.link} key={item.title} target={'_blank'}>
                  <ActionIcon
                    className={styles.icon}
                    icon={item.icon}
                    size={{ blockSize: 36, borderRadius: 18, size: 16 }}
                    title={item.title}
                  />
                </Link>
              ),
          )}
        </Flexbox>
        <Flexbox align={'center'} gap={8} horizontal width={'100%'}>
          <Input value={meta.url} variant={'filled'} />
          <CopyButton
            className={styles.copy}
            color={theme.colorBgLayout}
            content={meta.url}
            icon={LinkIcon}
            size={{ blockSize: 36, size: 16 }}
          />
        </Flexbox>
      </Center>
    );
  } else {
    content = <Skeleton active paragraph={{ rows: 4 }} title={false} />;
  }

  return (
    <>
      <Button icon={Share2Icon} onClick={() => setOpen(true)} size={'large'} {...rest} />
      <Modal
        footer={null}
        onCancel={() => setOpen(false)}
        open={open}
        title={t('share')}
        width={360}
      >
        {content}
      </Modal>
    </>
  );
});

export default ShareButton;
