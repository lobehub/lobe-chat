import MobileContentLayout from "@/components/server/MobileNavLayout";
import Loading from "@/components/Loading/BrandTextLoading";
import { Outlet } from "react-router-dom";
import { Header } from "@lobehub/ui";
import { Suspense } from "react";

const Layout = () => {
    return <MobileContentLayout header={<Header />} withNav>
        <Suspense fallback={<Loading />}>
            <Outlet />
        </Suspense>
    </MobileContentLayout>
}

export default Layout;