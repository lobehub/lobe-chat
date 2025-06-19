import { ImageStore } from '../../store';

const isCreating = (state: ImageStore) => state.isCreating;

export const createImageSelectors = {
  isCreating,
};
