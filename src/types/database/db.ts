export type DBModel<T> = T & {
  createAt: number;
  id: string;
};
