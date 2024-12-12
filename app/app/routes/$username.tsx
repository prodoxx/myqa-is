import { LoaderFunctionArgs } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { User } from 'lucide-react';
import { redirect, typedjson, useTypedLoaderData } from 'remix-typedjson';
import { authenticator } from '~/auth.server';
import { UserRepository } from '~/domain/faq/repositories/user-repository';
import { getCryptoPrice, SupportedCoins } from '~/infrastructure/crypto';
import { Avatar } from '~/ui/atoms/avatar';
import { Button } from '~/ui/atoms/button';
import { Card, CardContent } from '~/ui/atoms/card';
import { MainLayout } from '~/ui/layouts/main';
import { NewQuestionButton } from '~/ui/molecules/new-question-button';
import { LoginRegisterDialog } from '~/ui/organisms/auth/login-register-dialog';
import { QuestionsList } from '~/ui/organisms/questions/questions-list';
import { ExternalLinkList } from '~/ui/organisms/social/external-links-list';
import { Wallet } from '~/ui/organisms/wallet';

export const loader = async (args: LoaderFunctionArgs) => {
  const session = await authenticator.isAuthenticated(args.request);
  const username = args.params.username;
  const user = await UserRepository.findByUsername(username!);

  if (user?.username !== username?.toLowerCase()) {
    return redirect(`/${user?.username?.toLowerCase()}`);
  }

  const bonkPrice = await getCryptoPrice(
    SupportedCoins.BONKUSDT,
    process.env.BINANCE_API_KEY
  );

  return typedjson({
    bonkPrice,
    isCreator: user?.id === session?.id,
    user: user?.json(),
  });
};

const UserProfile = () => {
  const data = useTypedLoaderData<typeof loader>();

  return (
    <MainLayout disableSiteNav className="items-center space-y-4">
      <div className="max-w-4xl w-full 2xl:w-[1080px] border-slate-300">
        <div className="flex flex-col p-4 space-y-8">
          <div className="flex flex-row justify-between items-center">
            <Wallet />
            <LoginRegisterDialog
              username={data?.user?.username?.toLowerCase()!}
            />
          </div>

          <div className="mx-auto text-center flex flex-col">
            <Avatar
              src={data.user?.UserProfile?.Avatar?.url!}
              fallback={data.user?.username?.[0]!}
              className="h-40 w-40 mx-auto mb-4"
            />
            <h1 className="font-bold text-xl">{data?.user?.username}</h1>
            <span className="text-gray-500 font-lg">
              {data?.user?.UserProfile?.about ?? 'No description available'}
            </span>

            <ExternalLinkList links={data?.user?.UserProfile?.ExternalLinks} />
          </div>

          <NewQuestionButton isCreator={data?.isCreator} />
        </div>
      </div>

      <div className="max-w-4xl w-full 2xl:w-[1080px]">
        <QuestionsList
          questions={data?.user?.UserProfile?.QAs}
          cryptoPrice={data?.bonkPrice}
          isCreator={data?.isCreator}
        />
      </div>
    </MainLayout>
  );
};

export default UserProfile;
