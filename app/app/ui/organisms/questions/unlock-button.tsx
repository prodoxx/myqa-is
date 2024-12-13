import { Lock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/ui/atoms/button';
import { Dialog, DialogContent } from '~/ui/molecules/dialog';
import { UnlockQuestionForm } from './unlock-question-form';

interface QuestionCardProps {
  id: number;
  question: string;
  priceInBonk: number;
  priceInDollar: string;
  onChainId: string;
}

export function UnlockButton({
  id,
  priceInBonk,
  question,
  priceInDollar,
  onChainId,
}: QuestionCardProps) {
  const [showUnlock, setShowUnlock] = useState(false);

  return (
    <div className="space-y-4">
      <Button variant="default" onClick={() => setShowUnlock(true)}>
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
            onChainId={onChainId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
