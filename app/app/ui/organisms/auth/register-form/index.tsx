import { Form, Link } from '@remix-run/react';
import { Button } from '~/ui/atoms/button';
import { InputField } from '~/ui/atoms/input-field-deprecated';

export type RegisterFormProps = {
  className?: string;
  isSubmitting?: boolean;
  initialValues?: {
    email?: string;
    password?: string;
  };
  errors?: {
    [key: string]: string;
  };
};

export const RegisterForm = (props: RegisterFormProps) => {
  return (
    <Form method="POST" action="/register" className={props.className}>
      {props.errors?.general ? (
        <span className="text-red-500">{props.errors.general?.toString()}</span>
      ) : null}

      <InputField
        autoComplete="off"
        disabled={props.isSubmitting}
        isFullWidth
        name="email"
        label="Email"
        type="text"
        placeholder="Your Email"
        defaultValue={props.initialValues?.email}
        labelClassName="sr-only"
      />

      <InputField
        autoComplete="off"
        isFullWidth
        name="password"
        label="Password"
        type="password"
        placeholder="Your Password"
        defaultValue={props.initialValues?.password}
        disabled={props.isSubmitting}
        labelClassName="sr-only"
      />

      <Link to="/forgot-password" className="ml-auto text-xs">
        Forgot Password?
      </Link>

      <Button
        type="submit"
        size="lg"
        variant="default"
        className="!w-full !mx-auto"
      >
        Sign Up
      </Button>
    </Form>
  );
};
