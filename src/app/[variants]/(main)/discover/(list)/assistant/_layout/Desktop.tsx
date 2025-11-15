import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';
import CategoryContainer from '../../../components/CategoryContainer';
import Category from '../features/Category';

const Layout = () => {
  return (
    <Flexbox gap={24} horizontal style={{ position: 'relative' }} width={'100%'}>
      <CategoryContainer>
        <Category />
      </CategoryContainer>
      <Flexbox flex={1} gap={16}>
        <Outlet />
      </Flexbox>
    </Flexbox>
  );
};

Layout.displayName = 'DesktopDiscoverAssistantsLayout';

export default Layout;
