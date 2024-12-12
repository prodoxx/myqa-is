import { Unlock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/ui/atoms/button';
import { Dialog, DialogContent } from '~/ui/molecules/dialog';
import { ViewAnswer } from './view-answer';

interface QuestionCardProps {
  id: string;
  question: string;
}

export function ViewAnswerButton({ id, question }: QuestionCardProps) {
  const [showView, setShowView] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setShowView(true)}
        className="bg-purple-500 hover:bg-purple-600"
      >
        <Unlock className="mr-2 h-4 w-4" />
        View Answer
      </Button>

      <Dialog open={showView} onOpenChange={setShowView}>
        <DialogContent className="p-0 border-none bg-transparent">
          <ViewAnswer
            questionId={id}
            question={question}
            onClose={() => setShowView(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
