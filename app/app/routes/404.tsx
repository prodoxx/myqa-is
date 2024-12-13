import { Link } from '@remix-run/react';
import { Button } from '~/ui/atoms/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/ui/atoms/card';
import { MainLayout } from '~/ui/layouts/main';

export default function NotFound() {
  return (
    <MainLayout>
      <Card className="w-full max-w-md mx-auto my-auto">
        <CardHeader>
          <CardTitle className="text-center">
            <span className="text-[48px] font-black">404</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-center text-muted-foreground mb-6">
            Oops! The page you're looking for doesn't exist.
          </span>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="default" className="w-full" asChild>
            <Link to="/">Go back home</Link>
          </Button>
        </CardFooter>
      </Card>
    </MainLayout>
  );
}
