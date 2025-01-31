import { PagePropsWithId } from '@/types/next';

import FileDetail from './FileDetail';
import FilePreview from './FilePreview';
import FullscreenModal from './FullscreenModal';

const Page = async (props: PagePropsWithId) => {
  const params = await props.params;

  return (
    <FullscreenModal detail={<FileDetail id={params.id} />}>
      <FilePreview id={params.id} />
    </FullscreenModal>
  );
};

export default Page;
