import { getTranslations } from 'next-intl/server';

import SignInForm from './SignInForm';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'SignIn',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const SignInPage = (props: { params: { locale: string } }) => {
  return <SignInForm locale={props.params.locale} />;
};

export default SignInPage;
