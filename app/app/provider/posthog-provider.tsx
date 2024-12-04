import { PostHogProvider } from 'posthog-js/react';
import { posthog } from '~/infrastructure/analytics/index.client';

export function PHProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
