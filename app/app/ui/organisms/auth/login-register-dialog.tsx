import { Link } from '@remix-run/react';
import { EllipsisVertical, Unlock } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '~/provider/user-provider';
import { Button } from '~/ui/atoms/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/ui/atoms/card';
import { Dialog, DialogContent } from '~/ui/molecules/dialog';
import { LogoutForm } from './logout-form';

interface LoginRegisterDialogProps {
  username: string;
}

export function LoginRegisterDialog({ username }: LoginRegisterDialogProps) {
  const { user } = useUser();
  const [showView, setShowView] = useState(false);

  return (
    <div className="space-y-4 ml-auto">
      <Button
        variant="ghost"
        onClick={() => setShowView(true)}
        className="!rounded-full !p-4 h-fit"
      >
        <EllipsisVertical className="h-6 w-6" />
      </Button>

      <Dialog open={showView} onOpenChange={setShowView}>
        <DialogContent className="p-0 border-none bg-transparent">
          <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  Join MyQA.is & earn from creating QAs
                </CardTitle>
              </div>
              <CardDescription>
                You can start earning like @{username} by simply creating
                questions and answers for your top fans
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="w-full h-40 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-r from-purple-700 to-indigo-600">
                <span className="font-extrabold text-2xl text-white leading-loose">
                  myqa.is/{username}
                </span>
              </div>
            </CardContent>

            <hr className="w-full bg-gray-50"></hr>

            <CardFooter className="gap-4 py-4">
              {user ? (
                <>
                  <LogoutForm className="w-1/2 mx-auto" />

                  <Button asChild className="!w-1/2" size="lg">
                    <Link to="/questions/new">Create Question</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="w-1/2" size="lg" asChild>
                    <Link to="/register">Register</Link>
                  </Button>

                  <Button variant="default" asChild size="lg" className="w-1/2">
                    <Link to="/login">Login</Link>
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
}
