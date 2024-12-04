import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';
import { ValidationMessage } from '../input-validation-message';
import { Label } from '@radix-ui/react-label';
import { Input } from '../input-field';

export type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  isFullWidth?: boolean;
  errorMessage?: string;
  wrapperClassName?: string;
  labelClassName?: string;
};

export const InputField = ({
  label,
  name,
  isFullWidth = false,
  readOnly = false,
  errorMessage,
  wrapperClassName,
  labelClassName,
  ...props
}: InputFieldProps) => {
  return (
    <fieldset
      disabled={readOnly}
      className={clsx('flex flex-col', wrapperClassName, {
        'pb-4': !errorMessage,
        'pb-2': errorMessage,
      })}
    >
      <Label htmlFor="email" className={labelClassName}>
        {label}
      </Label>
      <Input {...props} id={name} name={name} required />

      <ValidationMessage errorMessage={errorMessage} isSubmitting={!!props.disabled} />
    </fieldset>
  );
};
