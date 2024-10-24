import FileDetail from './FileDetail';
import FilePreview from './FilePreview';
import FullscreenModal from './FullscreenModal';

interface Params {
  id: string;
}

type Props = { params: Promise<Params> };

const Page = async (props: Props) => {
  const params = await props.params;

  return (
    <FullscreenModal detail={<FileDetail id={params.id} />}>
      <FilePreview id={params.id} />
    </FullscreenModal>
  );
};

export default Page;
