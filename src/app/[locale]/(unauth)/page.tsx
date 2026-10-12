import { redirect } from 'next/navigation';

export default function Page() {
  // Redirect to sign-in page since we only want authenticated users
  redirect('/sign-in');
}