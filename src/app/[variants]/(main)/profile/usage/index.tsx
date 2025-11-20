
import Client from './Client';


const MobileProfileUsagePage = async () => {
  return <Client mobile={true} />;
};

const DesktopProfileUsagePage = async () => {
  return <Client mobile={false} />;
};

export { DesktopProfileUsagePage,MobileProfileUsagePage };
