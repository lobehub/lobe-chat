'use server';

import { redirect } from 'next/navigation';

// 当不想被路由拦截时请使用此方法绕过

export default async function redirectHard(uri: string) {
  redirect(uri);
}
