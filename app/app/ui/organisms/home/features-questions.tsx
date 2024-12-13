import { CryptoPrice } from '~/infrastructure/crypto';
import { QuestionsList } from '../questions/questions-list';

export default function FeaturedQuestions({
  questions,
  isDemo,
  cryptoPrice,
}: {
  questions: { question: string; field: string }[];
  isDemo?: boolean;
  cryptoPrice: CryptoPrice;
}) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">
          Unlock{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
            Exclusive
          </span>{' '}
          Insights
        </h2>

        <QuestionsList
          isDemo={isDemo}
          cryptoPrice={cryptoPrice}
          questions={questions as any}
        />
      </div>
    </section>
  );
}
