'use client';

import { isCustomBranding } from '@/const/version';

import Footer from './Footer';
import ProviderGrid from './ProviderGrid';

import DesktopLayout from '../_layout/Desktop'
import MobileLayout from '../_layout/Mobile'
import { useEffect, useState } from 'react';
import ProviderDetailPage from '../(detail)';


const Page = (props: {
  mobile?: boolean,
}) => {
  const [Provider,setProvider]= useState<string | undefined>()

  useEffect(()=>{
    console.log("Provider",Provider)
  },[Provider])

  const { mobile } = props
  const ProviderLayout = mobile ? MobileLayout : DesktopLayout
  const ProviderPage = Provider ? <ProviderDetailPage id={Provider}/>: <ProviderGrid />

  return <ProviderLayout onProviderSelect={setProvider}>
    {ProviderPage}
    {!isCustomBranding && <Footer />}
  </ProviderLayout>

}

Page.displayName = 'ProviderGrid';

export default Page;
