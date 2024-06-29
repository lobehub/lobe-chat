import { FilesStoreState } from '../../initialState';

const getImageDetailByList = (list: string[]) => (s: FilesStoreState) =>
  list
    .map((i) => s.imagesMap[i])
    .filter(Boolean)
    .map((i) => ({ ...i, loading: s.uploadingIds.includes(i.id) }));

const imageDetailList = (s: FilesStoreState) => getImageDetailByList(s.inputFilesList)(s);

const getImageUrlOrBase64ById =
  (id: string) =>
  (s: FilesStoreState): { id: string; url: string } | undefined => {
    const preview = s.imagesMap[id];

    if (!preview) return undefined;

    const url = preview.saveMode === 'local' ? (preview.base64Url as string) : preview.url;

    return { id, url: url };
  };

const getImageUrlOrBase64ByList = (idList: string[]) => (s: FilesStoreState) =>
  idList.map((i) => getImageUrlOrBase64ById(i)(s)).filter(Boolean) as {
    id: string;
    url: string;
  }[];

const imageUrlOrBase64List = (s: FilesStoreState) => getImageUrlOrBase64ByList(s.inputFilesList)(s);

const isImageUploading = (s: FilesStoreState) => s.uploadingIds.length > 0;

export const filesSelectors = {
  getImageDetailByList,
  getImageUrlOrBase64ById,
  getImageUrlOrBase64ByList,
  imageDetailList,
  imageUrlOrBase64List,
  isImageUploading,
};
