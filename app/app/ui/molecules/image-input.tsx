import React from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '~/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '~/ui/atoms/avatar';
import { Button } from '~/ui/atoms/button';
import { ErrorMessage } from '~/ui/atoms/error-message';
import { toast } from 'sonner';
import { getErrorMessage } from '~/lib/error-messages';
import { UserIcon } from 'lucide-react';

export type ImageInput = {
  name: string;
  className?: string;
  error?: string;
};

export const ImageInput = ({ name, className, error }: ImageInput) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <p className="text-sm font-medium">Profile Picture</p>

      <div onClick={handleClick} className="cursor-pointer">
        <Avatar className="h-32 w-32">
          {preview ? (
            <AvatarImage src={preview} alt="Profile picture" />
          ) : (
            <AvatarFallback className="bg-muted">
              <UserIcon className="h-16 w-16" />
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <Button variant="outline" size="sm" onClick={handleClick} type="button">
        Select Picture
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        name={name}
        hidden
        accept="image/*"
        onChange={handleFileSelect}
      />
      {error && <ErrorMessage message={error} />}
    </div>
  );
};
