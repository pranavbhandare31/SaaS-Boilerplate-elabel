import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { getI18nPath } from '@/utils/Helpers';

export default async function Page(props: { params: { locale: string } }) {
  const { userId } = await auth();
  const locale = props.params?.locale || 'en';

  if (userId) {
    redirect(getI18nPath('/dashboard', locale));
  }
  redirect(getI18nPath('/sign-in', locale));
}