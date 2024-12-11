import { Bonk } from '../atoms/bonk';

export const BonkPricing = ({
  children,
  lastUpdate,
  toUsd,
}: {
  children: string;
  toUsd?: string;
  lastUpdate?: number;
}) => {
  return (
    <div className="flex items-center gap-1">
      <Bonk className="h-8 w-8" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">BONK {children}</span>
        <span className="text-xs text-muted-foreground">≈ ${toUsd}</span>
      </div>
    </div>
  );
};
