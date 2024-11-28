import React from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '~/lib/utils';
import { Label } from '../atoms/label';
import { Avatar } from '../atoms/avatar';
import { Button } from '../atoms/button';
import { ErrorMessage } from '../atoms/error-message';

export type ImageInput = {
  name: string;
  className?: string;
  error?: string;
};

export const ImageInput = ({ name, className, error }: ImageInput) => {
  const hiddenInputRef = React.useRef(null);
  const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    onDrop: (incomingFiles) => {
      if (hiddenInputRef.current) {
        // Note the specific way we need to munge the file into the hidden input
        // https://stackoverflow.com/a/68182158/1068446
        const dataTransfer = new DataTransfer();
        incomingFiles.forEach((v) => {
          dataTransfer.items.add(v);
        });
        // @ts-ignore
        hiddenInputRef.current.files = dataTransfer.files;
      }
    },
  });

  const selectedImagePreviewUrl = React.useMemo(() => {
    if (acceptedFiles?.[0]) {
      return URL.createObjectURL(acceptedFiles?.[0]); // Create an object URL
    }

    return '';
  }, [acceptedFiles]);

  return (
    <div {...getRootProps({ className: cn('flex flex-col space-y-2 mx-auto', className) })}>
      <Label htmlFor={name}>Profile Picture</Label>
      <input hidden type="file" name={name} required ref={hiddenInputRef} />
      <input hidden {...getInputProps()} />
      <Avatar fallback="" src={selectedImagePreviewUrl} className="h-36 w-36 border-2 border-gray-200" />
      <Button type="button" variant="outline" className="w-fit" onClick={open}>
        Select Picture
      </Button>
      <ErrorMessage message={error} />
    </div>
  );
};
