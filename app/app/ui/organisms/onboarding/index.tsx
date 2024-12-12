import { BasicInformationForm } from './basic-information-form';
import { CryptoWalletForm } from './crypto-wallet-form';
import { OnboardingComplete } from './onboarding-completed';
import { SocialLinksForm } from './social-links-form';
import { OnboardingStep } from '~/entities/user-profile';

export type OnboardingFormProps = {
  currentStep: keyof typeof OnboardingStep;
  errorMessage: string | null;
};

export const OnboardingForm = ({
  currentStep,
  errorMessage,
}: OnboardingFormProps) => {
  if (currentStep === OnboardingStep.BASIC_INFORMATION) {
    return <BasicInformationForm errorMessage={errorMessage} />;
  }

  if (currentStep === OnboardingStep.SOCIAL_LINKS) {
    return <SocialLinksForm errorMessage={errorMessage} />;
  }

  if (currentStep === OnboardingStep.CRYPTO_WALLET) {
    return <CryptoWalletForm errorMessage={errorMessage} />;
  }

  if (currentStep === OnboardingStep.DONE) {
    return <OnboardingComplete errorMessage={errorMessage} />;
  }
};
