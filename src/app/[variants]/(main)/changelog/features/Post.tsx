import { Typography } from '@lobehub/ui';
import { Image } from '@lobehub/ui/mdx';
import { Divider } from 'antd';
import Link from 'next/link';
import useSWR from 'swr';
import urlJoin from 'url-join';

import { CustomMDX } from '@/components/mdx';
import { OFFICIAL_SITE } from '@/const/url';
import { Locales } from '@/locales/resources';
import { ChangelogService } from '@/server/services/changelog';
import { ChangelogIndexItem } from '@/types/changelog';

import GridLayout from './GridLayout';
import PublishedTime from './PublishedTime';
import VersionTag from './VersionTag';

const Post = ({
  id,
  mobile,
  versionRange,
  locale,
}: ChangelogIndexItem & { branch?: string; locale: Locales; mobile?: boolean }) => {
  const { data } = useSWR([`changelog-post-${id}`, locale], async () => {
    const changelogService = new ChangelogService();
    return await changelogService.getPostById(id, { locale });
  });

  if (!data || !data.title) return null;

  return (
    <>
      <Divider />
      <GridLayout
        date={
          <PublishedTime
            date={data.date.toISOString()}
            style={{ lineHeight: mobile ? undefined : '60px' }}
            template={'MMMM D, YYYY'}
          />
        }
        mobile={mobile}
      >
        <Typography headerMultiple={mobile ? 0.2 : 0.3}>
          <Link href={urlJoin(OFFICIAL_SITE, '/changelog', id)} style={{ color: 'inherit' }}>
            <h1 id={id}>{data.rawTitle || data.title}</h1>
          </Link>
          <Image alt={data.title} src={data.image} />
          <CustomMDX source={data.content} />
          <Link href={urlJoin(OFFICIAL_SITE, '/changelog', id)} style={{ color: 'inherit' }}>
            <VersionTag range={versionRange} />
          </Link>
        </Typography>
      </GridLayout>
    </>
  );
};

export default Post;
