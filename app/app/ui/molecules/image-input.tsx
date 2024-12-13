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
  const hiddenInputRef = React.useRef<HTMLInputElement>(null);
  const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
    maxSize: 2_000_000,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    onDrop: (incomingFiles) => {
      if (hiddenInputRef.current) {
        const dataTransfer = new DataTransfer();
        incomingFiles.forEach((v) => {
          dataTransfer.items.add(v);
        });
        hiddenInputRef.current.files = dataTransfer.files;
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error(`Failed to select image: ${getErrorMessage(error)}`);
    },
    onDropRejected: (rejected) => {
      toast.error(
        `Failed to select image: ${rejected?.[0]?.errors?.[0]?.message}`
      );
    },
  });

  const selectedImagePreviewUrl = React.useMemo(() => {
    if (acceptedFiles?.[0]) {
      return URL.createObjectURL(acceptedFiles?.[0]);
    }
    return '';
  }, [acceptedFiles]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <p className="text-sm font-medium">Profile Picture</p>

      <div {...getRootProps()}>
        <Avatar className="h-32 w-32 cursor-pointer">
          {selectedImagePreviewUrl ? (
            <AvatarImage src={selectedImagePreviewUrl} alt="Profile picture" />
          ) : (
            <AvatarFallback className="bg-muted">
              <UserIcon className="h-16 w-16" />
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <Button variant="outline" size="sm" onClick={open}>
        Select Picture
      </Button>

      <input
        type="file"
        name={name}
        hidden
        ref={hiddenInputRef}
        accept="image/*"
      />
      <input {...getInputProps()} />
      {error && <ErrorMessage message={error} />}
    </div>
  );
};
