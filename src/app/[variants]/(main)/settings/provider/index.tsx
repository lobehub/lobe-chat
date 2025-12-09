import Page from './(list)';

type ProviderPageType = {
  mobile?: boolean;
};

export default (props: ProviderPageType) => {
  const { mobile } = props;

  return <Page mobile={mobile} />;
};
