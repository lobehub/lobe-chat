import { FilesStoreState } from './initialState';

const imageList = (s: FilesStoreState) => {
  return s.inputFilesList
    .map((i) => {
      return s.imagesMap[i];
    })
    .filter(Boolean);
};

export const filesSelectors = {
  imageList,
};
