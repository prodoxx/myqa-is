import { SocialLink as SocialLinkORM } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../atoms/select';
import { cn } from '~/lib/utils';

const options: Record<SocialLinkORM, string> = {
  FACEBOOK: 'Facebook',
  TWITTER: 'Twitter',
  INSTAGRAM: 'Instagram',
  YOUTUBE: 'YouTube',
  THREADS: 'Threads',
  SNAPCHAT: 'Snapchat',
};

export const SocialMediaTypeDropdown = ({
  name,
  className,
  onChange,
  value,
}: {
  name: string;
  className?: string;
  onChange?: (value: any) => void;
  value?: any;
}) => {
  return (
    <Select name={name} onValueChange={(c) => onChange?.(c)} value={value}>
      <SelectTrigger className={cn('w-[180px]', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.keys(options)?.map((key, index) => (
          <SelectItem key={key + index} value={key}>
            {options[key as SocialLinkORM]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
