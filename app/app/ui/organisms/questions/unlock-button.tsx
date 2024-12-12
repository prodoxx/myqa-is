import { useState } from 'react';
import { UnlockQuestionForm } from './unlock-question-form';
import { Lock } from 'lucide-react';
import { Button } from '~/ui/atoms/button';
import { Dialog, DialogContent } from '~/ui/molecules/dialog';

interface QuestionCardProps {
  id: string;
  question: string;
  priceInBonk: number;
  priceInDollar: string;
}

export function UnlockButton({
  id,
  priceInBonk,
  question,
  priceInDollar,
}: QuestionCardProps) {
  const [showUnlock, setShowUnlock] = useState(false);

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowUnlock(true)}>
        <Lock className="mr-2 h-4 w-4" />
        Unlock Answer
      </Button>

      <Dialog open={showUnlock} onOpenChange={setShowUnlock}>
        <DialogContent className="p-0 border-none bg-transparent">
          <UnlockQuestionForm
            questionId={id}
            question={question}
            priceInBonk={priceInBonk}
            priceInDollar={priceInDollar}
            onClose={() => setShowUnlock(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
