import { BasicInformationForm } from './basic-information-form';
import { OnboardingComplete } from './onboarding-completed';
import { SocialLinksForm } from './social-links-form';
import { OnboardingStep } from '~/entities/user-profile';

export type OnboardingFormProps = {
  currentStep: keyof typeof OnboardingStep;
};

export const OnboardingForm = ({ currentStep }: OnboardingFormProps) => {
  console.log({ currentStep });
  if (currentStep === OnboardingStep.BASIC_INFORMATION) {
    return <BasicInformationForm />;
  }

  if (currentStep === OnboardingStep.SOCIAL_LINKS) {
    return <SocialLinksForm />;
  }

  if (currentStep === OnboardingStep.CRYPTO_WALLET) {
    // show crypto wallet setup
  }

  if (currentStep === OnboardingStep.DONE) {
    return <OnboardingComplete />;
  }
};
