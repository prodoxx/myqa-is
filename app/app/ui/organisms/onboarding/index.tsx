import { BasicInformationForm } from './basic-information-form';
import { CryptoWalletForm } from './crypto-wallet-form';
import { OnboardingComplete } from './onboarding-completed';
import { SocialLinksForm } from './social-links-form';
import { OnboardingStep } from '~/entities/user-profile';

export type OnboardingFormProps = {
  currentStep: keyof typeof OnboardingStep;
};

export const OnboardingForm = ({ currentStep }: OnboardingFormProps) => {
  if (currentStep === OnboardingStep.BASIC_INFORMATION) {
    return <BasicInformationForm />;
  }

  if (currentStep === OnboardingStep.SOCIAL_LINKS) {
    return <SocialLinksForm />;
  }

  if (currentStep === OnboardingStep.CRYPTO_WALLET) {
    return <CryptoWalletForm />;
  }

  if (currentStep === OnboardingStep.DONE) {
    return <OnboardingComplete />;
  }
};
