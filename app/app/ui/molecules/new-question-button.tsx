import { Link } from '@remix-run/react';
import { Button } from '../atoms/button';

export const NewQuestionButton = ({ isCreator }: { isCreator?: boolean }) => {
  if (!isCreator) {
    return null;
  }

  return (
    <Button asChild variant="default" className="w-fit mx-auto" size="lg">
      <Link to="/questions/new">Create a new question</Link>
    </Button>
  );
};
