export const AvailableKeys = ({
  currentKeys,
  maxKeys,
}: {
  currentKeys: number;
  maxKeys: number;
}) => {
  return (
    <span className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{currentKeys}</span> of{' '}
      <span className="font-medium text-foreground">{maxKeys}</span> keys sold
    </span>
  );
};
