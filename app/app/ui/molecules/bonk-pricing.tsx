import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Bonk } from '../atoms/bonk';
import { Tooltip, TooltipContent, TooltipTrigger } from '../atoms/tooltip';

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
    <div className="flex items-center">
      <Bonk className="h-8 w-8" />
      <span className="font-medium text-lg text-gray-700">BONK {children}</span>
      {toUsd ? (
        <span className="text-xs text-gray-500 ml-1 inline-flex flex-end">
          ≈ USDT {toUsd}
          {lastUpdate ? (
            <Tooltip>
              <TooltipTrigger>
                <InfoCircledIcon className="h-3 w-3 ml-1" />
              </TooltipTrigger>

              <TooltipContent>
                Last update: {new Date(lastUpdate).toDateString()} at{' '}
                {new Date(lastUpdate).toLocaleTimeString()}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </span>
      ) : null}
    </div>
  );
};
