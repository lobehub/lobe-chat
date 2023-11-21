export type DBModel<T> = T & {
  createdAt: number;
  id: string;
  updatedAt: number;
};
