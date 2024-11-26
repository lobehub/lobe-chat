import { Image, Typography } from '@lobehub/ui';
import Link from 'next/link';
import urlJoin from 'url-join';

import { CustomMDX } from '@/components/mdx';
import { OFFICIAL_SITE } from '@/const/url';
import { Locales } from '@/locales/resources';
import { ChangelogIndexItem, changelogService } from '@/services/changelog';

import GridLayout from './GridLayout';
import PublishedTime from './PublishedTime';
import VersionTag from './VersionTag';

const Post = async ({
  id,
  mobile,
  versionRange,
  locale,
}: ChangelogIndexItem & { branch?: string; locale: Locales; mobile?: boolean }) => {
  const data = await changelogService.getPostById(id, { locale });

  return (
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
        <Image
          alt={data.title}
          minSize={mobile ? 188 : 326}
          src={data.image}
          style={{ marginBlock: '1.5em' }}
        />
        <CustomMDX source={data.content} />
        <Link href={urlJoin(OFFICIAL_SITE, '/changelog', id)} style={{ color: 'inherit' }}>
          <VersionTag range={versionRange} />
        </Link>
      </Typography>
    </GridLayout>
  );
};

export default Post;
