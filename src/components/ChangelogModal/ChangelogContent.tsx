import { Typography } from '@lobehub/ui';
import { Image } from '@lobehub/ui/mdx';
import { Divider } from 'antd';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import urlJoin from 'url-join';

import { CustomMDX } from '@/components/mdx';
import { OFFICIAL_SITE } from '@/const/url';
import type { Locales } from '@/locales/resources';
import { ChangelogService } from '@/server/services/changelog';
import type { ChangelogIndexItem } from '@/types/changelog';

import VersionTag from './VersionTag';

interface ChangelogContentProps {
  data: ChangelogIndexItem[];
}

interface PostItemProps extends ChangelogIndexItem {
  locale: Locales;
}

const PostItem = ({ id, versionRange, locale }: PostItemProps) => {
  const { data } = useSWR([`changelog-post-${id}`, locale], async () => {
    const changelogService = new ChangelogService();
    return await changelogService.getPostById(id, { locale });
  });

  if (!data || !data.title) return null;

  return (
    <>
      <Divider />
      <Typography headerMultiple={0.2}>
        <a
          href={urlJoin(OFFICIAL_SITE, '/changelog', id)}
          rel="noopener noreferrer"
          style={{ color: 'inherit' }}
          target="_blank"
        >
          <h2 id={id}>{data.rawTitle || data.title}</h2>
        </a>
        {data.image && <Image alt={data.title} src={data.image} />}
        <CustomMDX source={data.content} />
        <VersionTag range={versionRange} />
      </Typography>
    </>
  );
};

const ChangelogContent = ({ data }: ChangelogContentProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language as Locales;

  return (
    <>
      {data.map((item) => (
        <Fragment key={item.id}>
          <PostItem locale={locale} {...item} />
        </Fragment>
      ))}
    </>
  );
};

export default ChangelogContent;
