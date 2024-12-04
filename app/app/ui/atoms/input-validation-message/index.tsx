import { useEffect, useState } from 'react';

export type ValidationMessageProps = {
  errorMessage?: string;
  isSubmitting: boolean;
};

export const ValidationMessage = ({ errorMessage, isSubmitting }: ValidationMessageProps) => {
  const [show, setShow] = useState(!!errorMessage);

  useEffect(() => {
    const id = setTimeout(() => {
      const hasError = !!errorMessage;
      setShow(hasError && !isSubmitting);
    });
    return () => clearTimeout(id);
  }, [errorMessage, isSubmitting]);

  return (
    <span
      style={{
        opacity: show ? 1 : 0,
        height: show ? '1em' : 0,
        color: 'red',
        transition: 'all 300ms ease-in-out',
      }}
    >
      {errorMessage}
    </span>
  );
};
