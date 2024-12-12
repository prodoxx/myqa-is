import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  ShouldRevalidateFunctionArgs,
  useSearchParams,
} from '@remix-run/react';
import { redirect, typedjson, useTypedLoaderData } from 'remix-typedjson';
import { authenticator } from '~/auth.server';
import { OnboardingStep } from '~/domain/faq/entities/user-profile';
import { UserRepository } from '~/domain/faq/repositories/user-repository';
import { OnboardUser } from '~/domain/faq/services/onboard-user';
import { getErrorMessage } from '~/lib/error-messages';
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

  if (
    searchParams.get('step') !== OnboardingStep.BASIC_INFORMATION &&
    user?.UserProfile?.onboarding === OnboardingStep.PENDING
  ) {
    return redirect(`/onboarding?step=${OnboardingStep.BASIC_INFORMATION}`);
  }

  if (
    !searchParams.get('step') ||
    (searchParams.get('step') !== user?.UserProfile?.onboarding &&
      user?.UserProfile?.onboarding !== OnboardingStep.PENDING)
  ) {
    return redirect(`/onboarding?step=${user?.UserProfile?.onboarding}`);
  }

  return typedjson({
    errorMessage: searchParams.get('errorMessage'),
    currentStep:
      user?.UserProfile?.onboarding === OnboardingStep.PENDING
        ? OnboardingStep.BASIC_INFORMATION
        : user?.UserProfile?.onboarding,
  });
};

export const action = async (args: ActionFunctionArgs) => {
  let updatedUser;
  try {
    const userId = (
      await authenticator.isAuthenticated(args.request, {
        failureRedirect: '/login',
      })
    )?.id;

    updatedUser = await new OnboardUser(userId!, args.request).call();
  } catch (error) {
    const searchParams = new URL(args.request.url).searchParams;
    const step = searchParams.get('step');

    return redirect(
      `/onboarding?step=${step}&errorMessage=${getErrorMessage(error)}`
    );
  }

  return redirect(
    `/onboarding?step=${updatedUser.UserProfile.getNextOnboardingStep()}`
  );
};

export function shouldRevalidate({
  actionResult,
  currentParams,
  nextParams,
  nextUrl,
  currentUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  return (
    currentUrl.searchParams.toString() !== nextUrl.searchParams.toString() &&
    nextUrl.searchParams.get('errorMessage')
  );
}

const Onboarding = () => {
  const { currentStep } = useTypedLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <MainLayout>
      <OnboardingForm
        currentStep={currentStep}
        errorMessage={searchParams.get('errorMessage')}
      />
    </MainLayout>
  );
};

export default Onboarding;
