import { Button } from '~/ui/atoms/button';
import google from '~/assets/images/google.svg';

export const GoogleLoginForm = () => {
  return (
    <form action="/auth/google" method="post" className="w-ful">
      <Button type="submit" size="lg" variant="outline" className="w-full">
        <img src={google} alt="google" className="h-8 w-8 mr-2" />
        Log in with Google
      </Button>
    </form>
  );
};
