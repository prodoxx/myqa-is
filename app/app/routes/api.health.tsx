import type { LoaderFunctionArgs } from '@vercel/remix';
import { typedjson } from 'remix-typedjson';

export async function loader(args: LoaderFunctionArgs) {
  return typedjson({ alive: true });
}
