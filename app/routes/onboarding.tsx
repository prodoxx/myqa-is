import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { ShouldRevalidateFunctionArgs } from '@remix-run/react';
import { redirect, typedjson, useTypedLoaderData } from 'remix-typedjson';
import { authenticator } from '~/auth.server';
import { OnboardingStep } from '~/domain/faq/entities/user-profile';
import { UserRepository } from '~/domain/faq/repositories/user-repository';
import { OnboardUser } from '~/domain/faq/services/onboard-user';
import { MainLayout } from '~/ui/layouts/main';
import { OnboardingForm } from '~/ui/organisms/onboarding';

export const loader = async (args: LoaderFunctionArgs) => {
  const searchParams = new URL(args.request.url).searchParams;
  const userId = (
    await authenticator.isAuthenticated(args.request, {
      failureRedirect: '/login',
    })
  )?.id;

  const user = await UserRepository.findByUserId(userId!);
  if (user?.UserProfile?.isOnboardingComplete() && !searchParams?.get('step')) {
    return redirect(`/onboarding?step=${OnboardingStep.DONE}`);
  }

  if (!searchParams.get('step') || searchParams.get('step') !== user?.UserProfile?.getNextOnboardingStep()) {
    return redirect(`/onboarding?step=${user?.UserProfile?.getNextOnboardingStep()}`);
  }

  return typedjson({
    currentStep: user?.UserProfile?.getNextOnboardingStep()!,
  });
};

export const action = async (args: ActionFunctionArgs) => {
  const userId = (
    await authenticator.isAuthenticated(args.request, {
      failureRedirect: '/login',
    })
  )?.id;

  const updatedUser = await new OnboardUser(userId!, args.request).call();
  return redirect(`/onboarding?step=${updatedUser.UserProfile.getNextOnboardingStep()}`);
};

export function shouldRevalidate({
  actionResult,
  currentParams,
  nextParams,
  nextUrl,
  currentUrl,
  defaultShouldRevalidate,
  ...rest
}: ShouldRevalidateFunctionArgs) {
  return currentUrl.searchParams.toString() !== nextUrl.searchParams.toString();
}

const Onboarding = () => {
  const { currentStep } = useTypedLoaderData<typeof loader>();

  return (
    <MainLayout>
      <OnboardingForm currentStep={currentStep} />
    </MainLayout>
  );
};

export default Onboarding;
