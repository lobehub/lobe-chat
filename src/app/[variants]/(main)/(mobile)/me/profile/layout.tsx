import MobileContentLayout from "@/components/server/MobileNavLayout";
import { Outlet } from "react-router-dom";
import Header from "./features/Header";

const Layout = () => {
    return <MobileContentLayout header={<Header />}>
        <Outlet />
    </MobileContentLayout>
}

export default Layout;