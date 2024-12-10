import { QuestionDTO } from '~/domain/faq/entities/question';
import { cn } from '~/lib/utils';

export type QuestionsListProps = {
  questions?: QuestionDTO[];
};

export const QuestionsList = ({ questions }: QuestionsListProps) => {
  if (!questions?.length) {
    return (
      <span className="text-gray-400 mx-auto text-sm">
        No questions and answers have been added yet
      </span>
    );
  }

  return (
    <ul>
      <li>
        {questions?.map((question) => (
          <div
            className={cn('rounded-xl shadow-sm p-4 flex flex-col max-h-12')}
          >
            <h3 className="font-medium">{question.title}</h3>
          </div>
        ))}
      </li>
    </ul>
  );
};
