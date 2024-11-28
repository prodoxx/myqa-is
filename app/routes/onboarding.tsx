import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect, typedjson, useTypedLoaderData } from 'remix-typedjson';
import { authenticator } from '~/auth.server';
import { UserRepository } from '~/domain/faq/repositories/user-repository';
import { MainLayout } from '~/ui/layouts/main';
import { OnboardingFlow, OnboardingForm } from '~/ui/organisms/onboarding';

export const loader = async (args: LoaderFunctionArgs) => {
  const searchParams = new URL(args.request.url).searchParams;
  const userId = (
    await authenticator.isAuthenticated(args.request, {
      failureRedirect: '/login',
    })
  )?.id;

  const user = await UserRepository.findByUserId(userId!);
  if (user?.UserProfile?.isOnboardingComplete() && !searchParams?.get('step')) {
    return redirect(`/onboarding?step=${OnboardingFlow.Done}`);
  }

  const onboardingStep = user?.UserProfile?.currentOnboardingStep(user);
  if (!searchParams.get('step') || searchParams.get('step') !== onboardingStep) {
    return redirect(`/onboarding?step=${onboardingStep}`);
  }

  return typedjson({
    currentStep: onboardingStep,
  });
};

export const action = (args: ActionFunctionArgs) => {
  return null;
};

const Onboarding = () => {
  const { currentStep } = useTypedLoaderData<typeof loader>();

  return (
    <MainLayout>
      <OnboardingForm currentStep={currentStep} />
    </MainLayout>
  );
};

export default Onboarding;
