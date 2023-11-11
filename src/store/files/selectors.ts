import { FilesStoreState } from './initialState';

const imageList = (s: FilesStoreState) => {
  return s.inputFilesList
    .map((i) => {
      return s.imagesMap[i];
    })
    .filter(Boolean);
};

const getImageUrlOrBase64ById =
  (id: string) =>
  (s: FilesStoreState): { id: string; url: string } | undefined => {
    const preview = s.imagesMap[id];

    if (!preview) return undefined;

    const url = preview.type === 'local' ? (preview.base64Url as string) : preview.url;

    return { id, url: url };
  };

const getImageUrlOrBase64ByList = (idList: string[]) => (s: FilesStoreState) =>
  idList.map((i) => getImageUrlOrBase64ById(i)(s)).filter(Boolean) as {
    id: string;
    url: string;
  }[];

const imageUrlOrBase64List = (s: FilesStoreState) => getImageUrlOrBase64ByList(s.inputFilesList)(s);

export const filesSelectors = {
  getImageUrlOrBase64ById,
  getImageUrlOrBase64ByList,
  imageList,
  imageUrlOrBase64List,
};
