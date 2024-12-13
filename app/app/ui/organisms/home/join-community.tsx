import { Card, CardContent, CardHeader, CardTitle } from '~/ui/atoms/card';

export default function JoinCommunity() {
  const cards = [
    {
      title: 'For Fans & Collectors',
      description:
        "Get VIP access to your favorite creators' insights. Own tradeable access keys that unlock exclusive Q&As, behind-the-scenes content, and expert advice.",
    },
    {
      title: 'For Creators & Experts',
      description:
        'Share your knowledge on your terms. Create premium Q&As, set your prices, and earn BONK tokens every time someone unlocks your content.',
    },
    {
      title: 'Trade & Earn',
      description:
        'Buy, sell, and trade access keys in the marketplace. Creators earn royalties from secondary sales while fans can profit from in-demand content.',
    },
  ];

  return (
    <section className="py-16 px-4 lg:min-h-[640px] flex items-center">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">
          Join the{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
            Community
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Card
              key={index}
              className="border-slate-700 hover:border-purple-500 transition-colors"
            >
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
