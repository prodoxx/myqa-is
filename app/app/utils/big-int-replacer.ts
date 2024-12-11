export function bigIntReplacer(key: string, value: any) {
  if (typeof value === 'bigint') {
    return {
      type: 'bigint',
      value: value.toString(),
    };
  } else {
    return value;
  }
}
