import {
  ExternalLinkDTO,
  SocialLink,
} from '~/domain/faq/entities/external-link';
import { CiFacebook } from 'react-icons/ci';
import {
  FaXTwitter,
  FaInstagram,
  FaYoutube,
  FaThreads,
  FaSnapchat,
} from 'react-icons/fa6';
import { Link } from '@remix-run/react';

export type ExternalLinkListProps = {
  links?: ExternalLinkDTO[];
};

const externalLinkLogoMap: Record<
  keyof typeof SocialLink,
  {
    name: string;
    logo: string | React.ReactNode;
    getLink: (username: string) => string;
  }
> = {
  FACEBOOK: {
    name: 'Facebook',
    logo: <CiFacebook className="h-8 w-8" />,
    getLink: (username: string) => `https://facebook.com/${username}`,
  },
  TWITTER: {
    name: 'Twitter',
    logo: <FaXTwitter className="h-8 w-8" />,
    getLink: (username: string) => `https://x.com/${username}`,
  },
  INSTAGRAM: {
    name: 'Instagram',
    logo: <FaInstagram className="h-8 w-8" />,
    getLink: (username: string) => `https://instagram.com/${username}`,
  },
  YOUTUBE: {
    name: 'YouTube',
    logo: <FaYoutube className="h-8 w-8" />,
    getLink: (username: string) => `https://youtube.com/@${username}`,
  },
  THREADS: {
    name: 'Threads',
    logo: <FaThreads className="h-8 w-8" />,
    getLink: (username: string) => `https://threads.com/@${username}`,
  },
  SNAPCHAT: {
    name: 'Snapchat',
    logo: <FaSnapchat className="h-8 w-8" />,
    getLink: (username: string) => `https://facebook.com/${username}`,
  },
};

export const ExternalLinkList = ({ links }: ExternalLinkListProps) => {
  if (!links?.length) {
    return null;
  }

  return (
    <ol className="flex py-4 space-x-4 mx-auto">
      {links?.map((link) => (
        <Link
          key={link.url}
          target="_blank"
          to={externalLinkLogoMap[link.type]?.getLink(link.url)}
          className="hover:scale-105 hover:transition-all"
        >
          <span className="sr-only">{externalLinkLogoMap[link.type].name}</span>
          {externalLinkLogoMap[link.type].logo}
        </Link>
      ))}
    </ol>
  );
};
