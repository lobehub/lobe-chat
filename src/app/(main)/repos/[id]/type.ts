export type PageProps = {
  params: Promise<{ id: string }> & {
    /**
     * @deprecated
     */
    id: string;
  };
};
