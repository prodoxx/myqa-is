import { BasicInformationForm } from './basic-information-form';
import { CryptoWalletForm } from './crypto-wallet-form';
import { OnboardingComplete } from './onboarding-completed';
import { SocialLinksForm } from './social-links-form';
import { OnboardingStep } from '~/entities/user-profile';

interface OnboardingFormProps {
  currentStep: (typeof OnboardingStep)[keyof typeof OnboardingStep];
  errorMessage: string | null;
  initialData?: {
    username?: string | null;
    about?: string | null;
    avatarUrl?: string | null;
  };
}

export const OnboardingForm = ({
  currentStep,
  errorMessage,
  initialData,
}: OnboardingFormProps) => {
  if (currentStep === OnboardingStep.BASIC_INFORMATION) {
    return (
      <BasicInformationForm
        errorMessage={errorMessage}
        initialData={initialData}
      />
    );
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
