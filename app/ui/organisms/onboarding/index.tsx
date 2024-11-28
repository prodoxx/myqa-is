import { BasicInformationForm } from './basic-information';

export enum OnboardingFlow {
  BasicInformation = 'basic-user-information', // username, profile, bio
  SocialLinks = 'external-social-links', // facebook, ig, youtube, etc
  CryptoWallet = 'connect-your-wallet',
  Done = 'onboarding-completed',
}

export type OnboardingFormProps = {
  currentStep: OnboardingFlow;
};

export const OnboardingForm = ({ currentStep }: OnboardingFormProps) => {
  if (currentStep === OnboardingFlow.BasicInformation) {
    return <BasicInformationForm />;
  }

  if (currentStep === OnboardingFlow.SocialLinks) {
    // show basic information form
  }

  if (currentStep === OnboardingFlow.CryptoWallet) {
    // show crypto wallet setup
  }
};
