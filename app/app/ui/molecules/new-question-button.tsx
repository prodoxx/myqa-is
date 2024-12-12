import { Link } from '@remix-run/react';
import { Button } from '../atoms/button';

export const NewQuestionButton = ({ isCreator }: { isCreator?: boolean }) => {
  if (!isCreator) {
    return null;
  }

  return (
    <Button
      variant="default"
      asChild
      className="w-fit mx-auto bg-purple-500 hover:bg-purple-600"
    >
      <Link to="/questions/new">Create a new question</Link>
    </Button>
  );
};
