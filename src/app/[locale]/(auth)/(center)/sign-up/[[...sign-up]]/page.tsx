import { getTranslations } from 'next-intl/server';
import SignUpForm from './SignUpForm';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'SignUp',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const SignUpPage = (props: { params: { locale: string } }) => {
  return <SignUpForm locale={props.params.locale} />;
};

export default SignUpPage;